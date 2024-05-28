import {body} from 'express-validator';

export const sendVerificationEmailRequest = [
    body('email')
        .isEmail()
        .notEmpty()
        .withMessage('Email is required'),
];