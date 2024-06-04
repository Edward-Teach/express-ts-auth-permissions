import { body } from 'express-validator';
import { CustomRequest } from "../express";
import { Permission } from "../models/Permission";

export interface ICreatePermissionRequest extends CustomRequest {
    body: {
        name: string,
    }
}

export const createPermissionRequest = [
    body('name')
        .isString()
        .notEmpty()
        .withMessage('Name is required')
        .custom(async (value) => {
            const permission = await Permission.findOne({ where: { name: value } })
            if ( permission ) {
                return Promise.reject('Name already in use');
            }
        })
];