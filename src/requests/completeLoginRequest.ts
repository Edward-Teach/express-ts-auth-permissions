import {body} from 'express-validator';

export const completeLoginRequest = [
    body('key')
        .isString()
        .notEmpty().withMessage('Key is required'),
    body('response')
        .isString()
        .notEmpty().withMessage('Response is required'),
    body('rememberMe')
        .isBoolean()
        .optional()
];