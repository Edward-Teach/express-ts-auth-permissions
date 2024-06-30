import { AuthController } from "../controllers/authController";
import { initLoginRequest } from "../requests/initLoginRequest";
import { signUpRequest } from "../requests/signUpRequest";
import { completeLoginRequest } from "../requests/completeLoginRequest";
import { sendVerificationEmailRequest } from "../requests/sendVerificationEmailRequest";
import { verifyEmailRequest } from "../requests/verifyEmailRequest";
import { confirmMfaActivationRequest } from "../requests/confirmMfaActivationRequest";
import { verifyMfaRequest } from "../requests/verifyMfaRequest";


export const authRoutes = (router: any, passport: any) => {

    router.post(
        '/initLogin',
        initLoginRequest,
        AuthController.withValidation,
        AuthController.initLogin
    );

    router.post(
        '/verifyChallenge',
        completeLoginRequest,
        AuthController.withValidation,
        AuthController.verifyChallenge
    );

    router.post(
        '/register',
        signUpRequest,
        AuthController.withValidation,
        AuthController.register
    );

    router.post(
        '/sendVerificationEmail',
        sendVerificationEmailRequest,
        AuthController.withValidation,
        AuthController.sendVerificationEmail
    );

    router.post(
        '/verifyEmail',
        verifyEmailRequest,
        AuthController.withValidation,
        AuthController.verifyEmail
    );

    router.post(
        '/askMfaActivation',
        passport.authenticate('jwt', { session: false }),
        AuthController.withValidation,
        AuthController.askMfaActivation
    );

    router.post(
        '/confirmMfaActivation',
        passport.authenticate('jwt', { session: false }),
        confirmMfaActivationRequest,
        AuthController.withValidation,
        AuthController.confirmMfaActivation
    );

    router.post(
        '/verifyMfa',
        verifyMfaRequest,
        AuthController.withValidation,
        AuthController.verifyMfa
    );

    router.post(
        '/removeMfa',
        passport.authenticate('jwt', { session: false }),
        AuthController.removeMfa
    );

    return router;
}