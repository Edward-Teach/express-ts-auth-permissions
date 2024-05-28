import {body} from 'express-validator';

export const verifyMfaRequest = [
    body('key')
        .isString()
        .notEmpty().withMessage('Key is required'),
    body('token')
        .isString()
        .notEmpty().withMessage('Token is required')
];