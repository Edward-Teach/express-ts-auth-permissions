import { Controller } from "./controller";
import * as crypto from "node:crypto";
import * as randomstring from "randomstring";
import RedisCache from "../cache/redisCache";
import { User } from "../models/User";
import { IUser } from "../interfaces/IUser";
import { Op } from "sequelize";
import UserService from "../services/userService";
import { i18n } from '../index'
import { addMonths, isBefore } from "date-fns";
import userCreatedEvent from "../events/userCreatedEvent";
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { Role } from "../models/Role";
import { Permission } from "../models/Permission";
import { Response } from 'express';
import { CustomRequest } from "../express";
import { v4 as uuidv4 } from 'uuid';


export class AuthController extends Controller {


    static initLogin = async (req: CustomRequest, res: Response): Promise<Response> => {
        const username: string = this.sanitizeString(req.body.username);
        const user: IUser | null = await User.findOne({
            where: {
                [Op.or]: [
                    { email: { [Op.eq]: username } },
                    { name: { [Op.eq]: username } }
                ]
            }
        });
        const sessionId = uuidv4();
        const challenge = randomstring.generate({ length: 32 });
        const sessionKey = `challenge:${sessionId}`;
        const iv = crypto.randomBytes(16).toString('hex'); // 128-bit IV in hex

        if ( user && user.password ) {
            await RedisCache.set(sessionKey, JSON.stringify({
                email: user.email,
                iv,
                challenge,
                password: user.password,
                salt: user.salt
            }), 300);
        }

        return res.send({
            iv,
            sessionId,
            challenge,
            salt: user?.salt
        })
    }

    static verifyChallenge = async (req: CustomRequest, res: Response): Promise<Response> => {

        const { sessionId, processedChallenge } = req.body;

        const cachedChallenge = await RedisCache.get(`challenge:${sessionId}`)
        if ( !cachedChallenge ) {
            console.log('no cached challenge')
            return res.status(400).send({ message: i18n.__('wrongCredentials'), code: 'WRONG_CHALLENGE' });
        }
        await RedisCache.delete(sessionId)

        // CACHE
        const { email, challenge, password, iv, salt } = JSON.parse(cachedChallenge);


        const encryptedMessage = this.encrypt(challenge, password, iv, salt);
        console.log('expectedProcessedChallenge', encryptedMessage)
        console.log('processedChallenge', processedChallenge)

        if ( encryptedMessage === processedChallenge ) {
            const user: IUser | null = await User.findOne({
                where: {
                    email
                },
                include: [
                    {
                        model: Role
                    },
                    {
                        model: Permission
                    }
                ]
            });
            if ( !user ) {
                // SECURITY Do not remove or change the return message
                // The user is not present,
                // but we send a generic wrong credentials
                // to prevent harvesting of email addresses.
                return res.status(400).send({ message: i18n.__('wrongCredentials'), code: 'WRONG_CHALLENGE-E' });
            }

            if ( !user.emailVerifiedAt ) {
                return res.status(200).send({
                    lang: i18n.getLocale(),
                    message: i18n.__('verification.emailNotVerified'),
                    code: 'EMAIL_NOT_VERIFIED',
                });
            }

            const now = new Date();
            const pwExpiration = user.passwordExpiresAt;
            if ( isBefore(pwExpiration, now) ) {
                return res.status(200).send({
                    message: i18n.__('auth.passwordExpired'),
                    code: 'PASSWORD_EXPIRED',
                });
            }

            if ( user.mfaSecret ) {
                const key: string = `challenge-${randomstring.generate({
                    charset: 'numeric',
                    length: 16
                })}`
                await RedisCache.set(key, user.id!.toString(), 60 * 3); // 3 minutes
                return res.status(200).send({
                    message: i18n.__('auth.mfaRequired'),
                    key,
                    code: 'MFA_REQUIRED',
                });
            }
            return this.returnAuthUser(req, res, user)
        }

        return res.status(400).send({ message: i18n.__('wrongCredentials'), code: 'WRONG_CHALLENGE-E' });
    }

    static register = async (req: CustomRequest, res: Response): Promise<Response> => {

        const name: string = this.sanitizeString(req.body.name);
        const email: string = this.sanitizeString(req.body.email);
        const password: string = req.body.password;

        // Check if a user with the same name or email already exists
        let user: IUser | null = await User.findOne({
            where: {
                [Op.or]: [
                    { email: { [Op.eq]: email } },
                    { name: { [Op.eq]: name } }
                ]
            }
        });

        if ( user ) {
            return res.status(400).send({ message: i18n.__('usernameAlreadyTaken'), code: 'USERNAME_ALREADY_TAKEN' });
        }

        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(
            password,
            Buffer.from(salt, 'hex'),
            10000,
            32,
            'sha512'
        ).toString('hex')
        const now = new Date();
        const pwExpiration = addMonths(now, 1);

        user = await UserService.createUser({
            name,
            email,
            password: hash,
            salt,
            passwordExpiresAt: pwExpiration,
        })

        return res.json({ user });
    }


    /**
     * Verifies the email of a user.
     *
     * @param req - The request object containing the user's email and verification code.
     * @param res - The response object to send the response back to the client.
     *
     * @returns A response object with a status code of 201 and a success message if the email is verified.
     *          If the user does not exist, the email is already verified, or the verification code is incorrect,
     *          a response object with a status code of 400 and an error message is returned.
     *
     * @remarks
     * This function retrieves the user from the database using the provided email.
     * If the user does not exist or the email is already verified, an error response is sent.
     * Otherwise, it checks the provided verification code against the stored codes in Redis.
     * If the codes match, the user's emailVerifiedAt field is updated, and the user is saved in the database.
     * A success response is sent.
     * If the codes do not match, an error response is sent.
     */
    static verifyEmail = async (req: CustomRequest, res: Response): Promise<Response> => {
        const user: User | null = await User.findOne({
            where: {
                email: req.body.email
            }
        });
        if ( !user || user.emailVerifiedAt ) {
            // SECURITY Do not remove or change the return message
            return res.status(201).send({
                message: i18n.__('verification.wrongCode'),
                code: 'WRONG_VERIFICATION_CODE'
            });
        }

        for ( let i = 0; i < 3; i++ ) {
            const key = `verification-code--${user.id}--${i}`;
            const code = await RedisCache.get(key);

            if ( code && req.body.code === code ) {
                user.emailVerifiedAt = new Date().toISOString();
                await user.save();
                return res.status(201).send({ message: i18n.__('verification.confirmed'), code: 'EMAIL_CONFIRMED' });
            }

        }

        return res.status(400).send({ message: i18n.__('verification.wrongCode'), code: 'WRONG_VERIFICATION_CODE' });
    }

    /**
     * Sends a verification email to the user.
     *
     * @param req - The request object containing the user's email.
     * @param res - The response object to send the response back to the client.
     *
     * @returns A response object with a status code of 201 and a success message if the email is sent.
     *          If the user does not exist or the email is already verified,
     *          a response object with a status code of 201 and an error message is returned.
     *          If the user has already sent too many verification emails,
     *          a response object with a status code of 400 and an error message is returned.
     *
     * @remarks
     * This function retrieves the user from the database using the provided email.
     * If the user does not exist or the email is already verified, an error response is sent.
     * Otherwise, it checks the Redis cache for the user's verification code.
     * If the code exists, an error response is sent.
     * If the code does not exist, the userCreatedEvent is emitted with the user's data.
     * A success response is sent.
     */
    static sendVerificationEmail = async (req: CustomRequest, res: Response): Promise<Response> => {
        const user: IUser | null = await User.findOne({
            where: {
                email: req.body.email
            }
        });
        if ( !user || user.emailVerifiedAt ) {
            // SECURITY Do not remove or change the return message
            return res.status(201).send({
                message: i18n.__('verification.emailHasBeenSent'),
                code: 'VERIFICATION_EMAIL_SENT'
            });
        }
        let key = `verification-code--${user.id}--2`;
        const code = await RedisCache.get(key);
        if ( code ) {
            return res.status(400).send({
                message: i18n.__('verification.tooManyAttempts'),
                code: 'WAIT_TOO_MANY_ATTEMPTS'
            });
        }
        userCreatedEvent.emit('userCreated', user); // Emit the event
        return res.status(201).send({
            message: i18n.__('verification.emailHasBeenSent'),
            code: 'VERIFICATION_EMAIL_SENT'
        });
    }

    /**
     * Handles the MFA activation request.
     *
     * @param req - The request object containing the user's data.
     * @param res - The response object to send the response back to the client.
     *
     * @returns A response object with a status code of 200 and the QR code URL if MFA is successfully activated.
     *          If MFA is already activated, a response object with a status code of 500 and an error message is returned.
     *          If there is an error generating the QR code, a response object with a status code of 500 and an error message is returned.
     *
     * @remarks
     * This function generates a secret key for MFA using the `speakeasy` library.
     * It then generates an OTP auth URL from the secret key.
     * If the OTP auth URL is successfully generated, it saves the secret key in Redis with a 10-minute expiration time.
     * It then generates a QR code URL from the OTP auth URL using the `QRCode` library.
     * If the QR code URL is successfully generated, it sends a JSON response with the QR code URL.
     * If there is an error generating the QR code, it sends a JSON response with an error message.
     */
    static askMfaActivation = async (req: CustomRequest, res: Response) => {
        if ( req.user!.mfaSecret ) {
            return res.status(500).send({ message: i18n.__('mfa.alreadyActivated'), code: 'MFA_ALREADY_ACTIVATED' });
        }
        const secret = speakeasy.generateSecret({
            name: process.env.APP_NAME,
            // issuer: '',
            // otpauth_url: '',
            length: 20
        });
        const otpauthUrl = secret.otpauth_url;
        if ( !otpauthUrl ) {
            return res.status(500).send({ message: i18n.__('mfa.qrCodeError'), code: 'OTPAUTH_ERROR' });
        }
        const key = `mfa-code--${req.user!.id}`;
        await RedisCache.set(key, secret.base32, 60 * 10); // 10 minutes
        QRCode.toDataURL(otpauthUrl, (err: any, dataUrl: any) => {
            if ( err ) {
                return res.status(500).send({ message: i18n.__('mfa.qrCodeError'), code: 'MFA_QRCODE_ERROR' });
            }
            res.json({ qrCodeUrl: dataUrl });
        });
    }

    /**
     * Verifies the MFA activation request.
     *
     * @param req - The request object containing the user's data.
     * @param res - The response object to send the response back to the client.
     *
     * @returns A response object with a status code of 201 and the message 'MFA activated' if MFA is successfully activated.
     *          If the provided token does not match the stored code, a response object with a status code of 400 and an error message is returned.
     *
     * @remarks
     * This function retrieves the stored MFA code from Redis using the user's ID.
     * It then verifies the provided token against the stored code using the `speakeasy.totp.verify` function.
     * If the tokens match, the user's MFA secret is updated with the stored code, and the user's data is saved in the database.
     * A success response is sent.
     * If the tokens do not match, an error response is sent.
     */
    static confirmMfaActivation = async (req: CustomRequest, res: Response): Promise<Response> => {
        const key = `mfa-code--${req.user!.id}`;
        const code = await RedisCache.get(key);
        if ( code ) {
            const verified = speakeasy.totp.verify({
                secret: code,
                encoding: 'base32',
                token: req.body.token,
            });
            if ( verified ) {
                req.user!.mfaSecret = code;
                await req.user!.save();
                return res.status(201).send({ message: i18n.__('mfa.activated'), code: 'MFA_ACTIVATED' });
            }
        }
        return res.status(400).send({ message: i18n.__('mfa.qrCodeError'), code: 'MFA_NOT_ACTIVATED' });
    }

    /**
     * Verifies the Multi-Factor Authentication (MFA) token.
     *
     * @param req - The request object containing the MFA token and key.
     * @param res - The response object to send the response back to the client.
     *
     * @returns A response object with a status code of 200 and the authenticated user's data if the MFA token is valid.
     *          If the MFA token is not valid, a response object with a status code of 400 and an error message is returned.
     *
     * @remarks
     * This function retrieves the cached MFA key from Redis using the provided key.
     * It then verifies the provided MFA token against the stored code using the `speakeasy.totp.verify` function.
     * If the tokens match, the user's data is retrieved from the database using the stored ID, and the user's data is returned in the response.
     * If the tokens do not match, an error response is sent.
     */
    static verifyMfa = async (req: CustomRequest, res: Response): Promise<Response> => {
        const cachedKeyMfa = await RedisCache.get(req.body.key)
        if ( !cachedKeyMfa ) {
            return res.status(400).send({ message: i18n.__('wrongCredentials'), code: 'WRONG_CHALLENGE' });
        }
        await RedisCache.delete(req.body.key)
        const user: IUser | null = await User.findOne({
            where: {
                id: parseInt(cachedKeyMfa)
            },
            include: [
                {
                    model: Role
                },
                {
                    model: Permission
                }
            ]
        });
        if ( !user || !user.mfaSecret ) {
            // SECURITY Do not remove or change the return message
            return res.status(400).send({ message: i18n.__('wrongCredentials'), code: 'WRONG_CHALLENGE-E' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: req.body.token,
        });
        if ( verified ) {
            return this.returnAuthUser(req, res, user)
        }
        return res.status(400).send({ message: i18n.__('wrongCredentials'), code: 'WRONG_CHALLENGE-E' });
    }

    /**
     * Removes the Multi-Factor Authentication (MFA) secret from the user's account.
     *
     * @param req - The request object containing the authenticated user's data.
     * @param res - The response object to send the response back to the client.
     *
     * @returns A response object with a status code of 200 and a success message if the MFA is successfully deactivated.
     *
     * @remarks
     * This function sets the user's MFA secret to null and saves the user's data in the database.
     * It then sends a response with a success message.
     */
    static removeMfa = async (req: CustomRequest, res: Response): Promise<Response> => {
        if ( !req.user || !req.user.mfaSecret ) {
            return res.status(400).send({
                message: i18n.__('mfa.alreadyDeactivated'),
                code: 'MFA_ALREADY_DEACTIVATED'
            });
        }
        req.user.mfaSecret = null;
        req.user.save();
        return res.status(200).send({ message: i18n.__('mfa.deactivated') });
    }


    //  ------------------------------------------ PRIVATE ------------------------------------------
    private static deriveKeyNode(password: string, salt: string): Buffer {
        return crypto.pbkdf2Sync(password, Buffer.from(salt, 'hex'), 10000, 32, 'sha512');
    }

    private static encrypt(text: string, password: string, ivHex: string, salt: string) {
        const algorithm = 'aes-256-cbc';
        const iv = Buffer.from(ivHex, 'hex');

        const derivedKey = Buffer.from(password, 'hex');
        //const derivedKey = this.deriveKeyNode(password, salt);

        console.log('derivedKeyHex', derivedKey.toString('hex'));
        console.log('text', text);
        console.log('ivHex', ivHex);

        const cipher = crypto.createCipheriv(algorithm, derivedKey, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return encrypted;
    }

    /**
     * Returns the authenticated user's data and JWT token.
     *
     * @param req - The request object containing the user's data and rememberMe flag.
     * @param res - The response object to send the response back to the client.
     * @param user - The authenticated user's data.
     *
     * @returns A response object with a status code of 200 and the authenticated user's data and JWT token.
     *          If the user is not authenticated, a response object with a status code of 400 and an error message is returned.
     *
     * @throws Will throw an error if the JWT_SECRET environment variable is not set.
     *
     * @remarks
     * This function signs the user's ID using the JWT_SECRET environment variable and returns the user's data and the signed token.
     * The token's expiration time is set based on the rememberMe flag in the request.
     */
    private static returnAuthUser = async (req: CustomRequest, res: Response, user: IUser): Promise<Response> => {
        if ( !user ) {
            return res.status(400).send({ message: i18n.__('wrongCredentials'), code: 'WRONG_CHALLENGE-E' });
        }

        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET!, {
            expiresIn: req.body.rememberMe ? '30d' : '24h'
        });

        return res.status(200).send({
            user,
            token
        });
    }

}