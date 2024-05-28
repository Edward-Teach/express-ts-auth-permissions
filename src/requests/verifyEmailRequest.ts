import {body} from 'express-validator';

export const verifyEmailRequest = [
    body('email')
        .isEmail()
        .notEmpty()
        .withMessage('Email is required'),
    body('code')
        .isString()
        .notEmpty()
        .withMessage('Code is required'),
];