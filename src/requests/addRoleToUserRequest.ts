import { body } from 'express-validator';
import { Role } from "../models/Role";
import { User } from "../models/User";

export const addRoleToUserRequest = [
    body('userId')
        .isNumeric()
        .notEmpty()
        .withMessage('User id is required')
        .custom(async (value) => {
            const user = await User.findByPk(value);
            if ( !user ) {
                return Promise.reject('User must exists');
            }
        }),
    body('roleId')
        .isNumeric()
        .notEmpty()
        .withMessage('Role id is required')
        .custom(async (value) => {
            const role = await Role.findByPk(value);
            if ( !role ) {
                return Promise.reject('Role must exists');
            }
        }),
];