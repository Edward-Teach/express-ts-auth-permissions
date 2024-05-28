import {body} from 'express-validator';

export const confirmMfaActivationRequest = [
    body('token')
        .isString()
        .notEmpty().withMessage('Token is required'),
];