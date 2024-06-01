import { body } from 'express-validator';
import { Role } from "../models/Role";
import { CustomRequest } from "../express";
import { Permission } from "../models/Permission";

export interface ICreateRoleRequest extends CustomRequest {
    body: {
        name: string,
        permissions?: string[]
    }
}

export const createRoleRequest = [
    body('name')
        .isString()
        .notEmpty()
        .withMessage('Name is required')
        .custom(async (value) => {
            const role = await Role.findOne({ where: { name: value } })
            if ( role ) {
                return Promise.reject('Name already in use');
            }
        }),
    body('permissions')
        .optional()
        .isArray()
        .withMessage('Permissions must be an array')
        .custom(async (roles) => {
            for ( const roleName of roles ) {
                const permission = await Permission.findOne({ where: { name: roleName } });
                if ( !permission ) {
                    return Promise.reject(`Permission ${roleName} does not exist`);
                }
            }
        })
];