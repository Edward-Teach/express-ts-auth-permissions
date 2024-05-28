import {body} from 'express-validator';

export const initLoginRequest = [
    body('username')
        .isString()
        .notEmpty().withMessage('Username is required')
];