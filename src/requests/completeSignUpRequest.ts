import {body} from 'express-validator';

export const completeSignUpRequest = [
    body('key')
        .isString()
        .notEmpty().withMessage('Key is required'),
    body('chunks')
        .isArray()
        .notEmpty().withMessage('Message is required'),
];