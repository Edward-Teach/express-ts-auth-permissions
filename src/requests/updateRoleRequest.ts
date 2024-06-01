import { body } from 'express-validator';
import { Role } from "../models/Role";
import { Op } from "sequelize";
import { CustomRequest } from "../express";
import { Permission } from "../models/Permission";

export interface IUpdateRoleRequest extends CustomRequest {
    body: {
        name?: string,
        permissions?: string[]
    }
}

export const updateRoleRequest = [
    body('name')
        .isString()
        .withMessage('Name must be a string')
        .notEmpty()
        .withMessage('Name is required')
        .custom(async (value, { req }) => {
            const roleId = req.params!.roleId;
            const role = await Role.findOne({ where: { name: value, id: { [Op.ne]: roleId } } });
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