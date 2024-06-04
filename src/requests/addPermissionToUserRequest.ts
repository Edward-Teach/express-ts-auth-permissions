import { body } from 'express-validator';
import { User } from "../models/User";
import { Permission } from "../models/Permission";

export const addPermissionToUserRequest = [
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
    body('permissionId')
        .isNumeric()
        .notEmpty()
        .withMessage('Permission id is required')
        .custom(async (value) => {
            const role = await Permission.findByPk(value);
            if ( !role ) {
                return Promise.reject('Role must exists');
            }
        }),
];