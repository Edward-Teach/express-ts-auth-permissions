import { body } from 'express-validator';

export const signUpRequest = [
    body('name')
        .isString()
        .notEmpty().withMessage('Name is required'),
    body('email')
        .isEmail()
        .notEmpty().withMessage('Email is required'),
    body('password')
        .isString()
        .notEmpty().withMessage('Password is required'),
];