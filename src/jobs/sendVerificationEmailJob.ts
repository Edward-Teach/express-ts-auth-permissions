import {SendEmailCommand} from "@aws-sdk/client-ses";
import {i18n, sesClient} from "../index";
import * as randomstring from "randomstring";
import fs from 'fs';
import path from 'path';
import RedisCache from "../cache/redisCache";

export const sendVerificationEmailJob = async (payload: any) => {
    console.log('sendVerificationEmailJob called with payload: ', payload.user);

    const lang = payload.user.language ?? 'en';
    i18n.setLocale(lang);

    const verificationCode = randomstring.generate({
            length: 6,
            readable: true,
            charset: "alphanumeric",
    });


    let numberOfAttempts = 0;
    let key = `verification-code--${payload.user.id}--${numberOfAttempts}`;
    for (let i = 0; i < 3; i++) {
            key = `verification-code--${payload.user.id}--${numberOfAttempts}`;
            const code = await RedisCache.get(key);
            if (code) {
                numberOfAttempts++;
                key = `verification-code--${payload.user.id}--${numberOfAttempts}`;
            }
    }
    if(numberOfAttempts >= 3) {
        console.log('Too many attempts');
        return;
    }

    await RedisCache.set(key, verificationCode, 60 * 60); // 1 hour
    const templatePath = path.join(__dirname, '../templates/emails/verificationEmail.template.html');
    let template = fs.readFileSync(templatePath, 'utf8');
    template = template.replace(/#appname#/g, process.env.APP_NAME ?? 'app-name');
    template = template.replace(/#verificationcode#/g, verificationCode);
    template = template.replace(/#lang#/g, lang);

    try {
        const params = {
            Destination: {
                ToAddresses: [payload.user.email],
            },
            Message: {
                Body: {
                    Html: { Data: template },
                },
                Subject: { Data: i18n.__('verification.email') },
            },
            Source: process.env.APP_EMAIL_ADDRESS
        };

        const command = new SendEmailCommand(params);
        const data = await sesClient.send(command);
        console.log("Email sent successfully", data);
    } catch (err) {
        console.log("Error sending email", err);
    }
}