import { body } from 'express-validator';

export const completeLoginRequest = [
    body('sessionId')
        .isString()
        .notEmpty().withMessage('sessionId is required'),
    body('processedChallenge')
        .isString()
        .notEmpty().withMessage('processedChallenge is required'),
    body('rememberMe')
        .isBoolean()
        .optional()
];

