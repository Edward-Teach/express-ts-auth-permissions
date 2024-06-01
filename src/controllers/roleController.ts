import { Response } from 'express';
import { Controller } from "./controller";
import { Role } from "../models/Role";
import { i18n } from '../index'
import { CustomRequest } from "../express";
import { User } from "../models/User";
import { ICreateRoleRequest } from "../requests/createRoleRequest";
import { IUpdateRoleRequest } from "../requests/updateRoleRequest";
import { Op } from "sequelize";
import { Permission } from "../models/Permission";
import RedisCache from "../cache/redisCache";

export class RoleController extends Controller {

    /**
     * Retrieves a list of all roles from the database.
     *
     * @param {CustomRequest} req - The request object containing any necessary parameters.
     * @param {Response} res - The response object to send back the result.
     *
     * @returns {Promise<Response>} - A promise that resolves to a response object.
     *
     * @throws Will throw an error if there is a problem with the database connection or query execution.
     *
     * @example
     * GET /api/roles
     *
     * Response:
     * 200 OK
     * [
     *   {
     *     "id": 1,
     *     "name": "Admin",
     *     "createdAt": "2022-01-01T00:00:00.000Z",
     *     "updatedAt": "2022-01-01T00:00:00.000Z"
     *   },
     *   {
     *     "id": 2,
     *     "name": "User",
     *     "createdAt": "2022-01-01T00:00:00.000Z",
     *     "updatedAt": "2022-01-01T00:00:00.000Z"
     *   }
     * ]
     */
    static async list(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const roles = await Role.findAll();
            return res.status(200).json(roles);
        } catch ( error ) {
            console.error(error);
            return res.status(500).json({ message: i18n.__('serverError') });
        }
    }

    /**
     * Creates a new role in the database.
     *
     * @param {ICreateRoleRequest} req - The request object containing the role data in the body.
     * @param {Response} res - The response object to send back the result.
     *
     * @returns {Promise<Response>} - A promise that resolves to a response object.
     *
     * @throws Will throw an error if there is a problem with the database connection or query execution.
     *
     * @example
     * POST /api/roles
     * {
     *   "name": "New Role",
     *   "permissions": ["permission1", "permission2"]
     * }
     *
     * Response:
     * 201 Created
     * {
     *   "id": 1,
     *   "name": "New Role",
     *   "createdAt": "2022-01-01T00:00:00.000Z",
     *   "updatedAt": "2022-01-01T00:00:00.000Z",
     *   "permissions": [
     *     {
     *       "id": 1,
     *       "name": "permission1",
     *       "createdAt": "2022-01-01T00:00:00.000Z",
     *       "updatedAt": "2022-01-01T00:00:00.000Z"
     *     },
     *     {
     *       "id": 2,
     *       "name": "permission2",
     *       "createdAt": "2022-01-01T00:00:00.000Z",
     *       "updatedAt": "2022-01-01T00:00:00.000Z"
     *     }
     *   ]
     * }
     */
    static async create(req: ICreateRoleRequest, res: Response): Promise<Response> {
        const sequelize = Role.sequelize;
        if ( !sequelize ) {
            return res.status(500).json({ message: 'Undefined sequelize RoleController.update' });
        }
        const transaction = await sequelize.transaction();
        try {
            const { name } = req.body;

            const role = await Role.create({ name });
            await RoleController.syncPermissions(role, transaction, req)
            await transaction.commit();

            const response = await Role.findByPk(role.id, {
                include: [
                    { model: Permission }
                ]
            })
            return res.status(201).json(response);
        } catch ( error ) {
            console.error(error);
            return res.status(400).json({ message: 'Bad Request' });
        }
    }

    /**
     * Updates a role in the database.
     *
     * @param {IUpdateRoleRequest} req - The request object containing the role ID and updated data in the body.
     * @param {Response} res - The response object to send back the result.
     *
     * @returns {Promise<Response>} - A promise that resolves to a response object.
     *
     * @throws Will throw an error if the role ID is not found in the database or if there is a problem with the database connection or query execution.
     *
     * @example
     * PUT /api/roles/1
     * {
     *   "name": "Updated Role",
     *   "permissions": ["permission1", "permission2"]
     * }
     *
     * Response:
     * 200 OK
     * {
     *   "id": 1,
     *   "name": "Updated Role",
     *   "createdAt": "2022-01-01T00:00:00.000Z",
     *   "updatedAt": "2022-01-01T00:00:00.000Z",
     *   "permissions": [
     *     {
     *       "id": 1,
     *       "name": "permission1",
     *       "createdAt": "2022-01-01T00:00:00.000Z",
     *       "updatedAt": "2022-01-01T00:00:00.000Z"
     *     },
     *     {
     *       "id": 2,
     *       "name": "permission2",
     *       "createdAt": "2022-01-01T00:00:00.000Z",
     *       "updatedAt": "2022-01-01T00:00:00.000Z"
     *     }
     *   ]
     * }
     */
    static async update(req: IUpdateRoleRequest, res: Response): Promise<Response> {
        const sequelize = Role.sequelize;
        if ( !sequelize ) {
            return res.status(500).json({ message: 'Undefined sequelize RoleController.update' });
        }
        const transaction = await sequelize.transaction();
        try {
            const { id } = req.params;
            const { name } = req.body;
            const role = await Role.findByPk(id, {
                include: [
                    { model: Permission }
                ]
            });
            if ( !role ) {
                return res.status(404).json({ message: 'Role not found' });
            }
            if ( name ) {
                role.name = name;
            }
            await role.save();
            await RoleController.syncPermissions(role, transaction, req)
            await transaction.commit();

            return res.status(200).json(role);
        } catch ( error ) {
            await transaction.rollback();
            console.error(error);
            return res.status(400).json({ message: 'Bad Request' });
        }
    }

    /**
     * Deletes a role from the database.
     *
     * @param {any} req - The request object containing the role ID in the URL parameters.
     * @param {any} res - The response object to send back the result.
     *
     * @returns {Promise<Response>} - A promise that resolves to a response object.
     *
     * @throws Will throw an error if the role ID is not found in the database.
     *
     * @example
     * DELETE /api/roles/1
     *
     * Response:
     * 204 No Content
     */
    static async delete(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const role = await Role.findByPk(id);
            if ( !role ) {
                return res.status(404).json({ message: 'Role not found' });
            }
            await role.destroy();
            return res.status(204).send();
        } catch ( error ) {
            console.error(error);
            return res.status(400).json({ message: 'Bad Request' });
        }
    }

    /**
     * Adds a role to a user.
     *
     * @param {any} req - The request object containing the user and role IDs in the body.
     * @param {any} res - The response object to send back the result.
     *
     * @returns {Promise<Response>} - A promise that resolves to a response object.
     *
     * @throws Will throw an error if the user or role IDs are not found in the database.
     *
     * @example
     * POST /api/users/roles
     * {
     *   "userId": 1,
     *   "roleId": 2
     * }
     *
     * Response:
     * 200 OK
     * {
     *   "message": "Role added to user"
     * }
     */
    static async addRoleToUser(req: CustomRequest, res: Response): Promise<Response> {//
        try {
            const { userId, roleId } = req.body;
            const user = await User.findByPk(userId);
            const role = await Role.findByPk(roleId);
            if ( !user || !role ) {
                return res.status(404).json({ message: 'User or Role not found' });
            }
            await user.$add('roles', role);
            await RedisCache.delete(`user:${user.id}`);
            return res.status(200).json({ message: 'Role added to user' });
        } catch ( error ) {
            console.error(error);
            return res.status(400).json({ message: 'Bad Request' });
        }
    }

    /**
     * Removes a role from a user.
     *
     * @param {any} req - The request object containing the user and role IDs in the body.
     * @param {any} res - The response object to send back the result.
     *
     * @returns {Promise<Response>} - A promise that resolves to a response object.
     *
     * @throws Will throw an error if the user or role IDs are not found in the database.
     *
     * @example
     * POST /api/users/roles/remove
     * {
     *   "userId": 1,
     *   "roleId": 2
     * }
     *
     * Response:
     * 200 OK
     * {
     *   "message": "Role removed from user"
     * }
     */
    static async removeRoleFromUser(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const { userId, roleId } = req.body;
            const user = await User.findByPk(userId);
            const role = await Role.findByPk(roleId);
            if ( !user || !role ) {
                return res.status(404).json({ message: 'User or Role not found' });
            }
            await user.$remove('roles', role);
            await RedisCache.delete(`user:${user.id}`);
            return res.status(200).json({ message: 'Role removed from user' });
        } catch ( error ) {
            console.error(error);
            return res.status(400).json({ message: 'Bad Request' });
        }
    }

    /**
     * Synchronizes the permissions of a role with the provided request body.
     *
     * @param {any} role - The role object to sync permissions for.
     * @param {any} transaction - The database transaction to use for the operation.
     * @param {ICreateRoleRequest | IUpdateRoleRequest} req - The request object containing the permissions to sync.
     *
     * @returns {Promise<void>} - A promise that resolves when the permissions are synchronized.
     *
     * @throws Will throw an error if there is a problem with the database connection or query execution.
     *
     * @example
     * const role = await Role.findByPk(1);
     * const transaction = await sequelize.transaction();
     * const req = { body: { permissions: ['permission1', 'permission2'] } };
     * await RoleController.syncPermissions(role, transaction, req);
     * await transaction.commit();
     */
    private static async syncPermissions(role: any, transaction: any, req: ICreateRoleRequest | IUpdateRoleRequest): Promise<void> {
        const permissionInstances = await Permission.findAll({
            where: {
                name: {
                    [Op.in]: req.body.permissions
                }
            },
            transaction
        });

        // Sync the user's roles
        await role.$set('permissions', permissionInstances, { transaction });
    }
}