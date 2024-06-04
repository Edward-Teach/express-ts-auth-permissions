import { Controller } from "./controller";
import { CustomRequest } from "../express";
import { Response } from "express";
import { Role } from "../models/Role";
import { i18n } from "../index";
import { Permission } from "../models/Permission";
import { ICreatePermissionRequest } from "../requests/createPermissionRequest";
import { IUpdateRoleRequest } from "../requests/updateRoleRequest";
import { User } from "../models/User";
import RedisCache from "../cache/redisCache";

export class PermissionController extends Controller {

    /**
     * Lists all permissions in the database, including associated roles.
     *
     * @param {CustomRequest} req - The request object containing any necessary parameters.
     * @param {Response} res - The response object to send back to the client.
     * @returns {Promise<Response>} - A promise that resolves to a response object with a status code of 200 and a JSON array of permissions.
     *
     * @throws Will throw a 500 error if there is a server-side error.
     */
    static async list(req: CustomRequest, res: Response): Promise<Response> {
        try {
            const permissions = await Permission.findAll({
                include: [
                    {
                        model: Role
                    }
                ]
            });
            return res.status(200).json(permissions);
        } catch ( error ) {
            console.error(error);
            return res.status(500).json({ message: i18n.__('serverError') });
        }
    }

    /**
     * Creates a new permission in the database.
     *
     * @param {ICreatePermissionRequest} req - The request object containing the permission data.
     * @param {Response} res - The response object to send back to the client.
     * @returns {Promise<Response>} - A promise that resolves to a response object.
     *
     * @throws Will throw a 400 error if there is a problem with the request.
     */
    static async create(req: ICreatePermissionRequest, res: Response): Promise<Response> {
        try {
            // Extract the permission name from the request body
            const { name } = req.body;

            // Create a new permission in the database with the provided name
            const permission = await Permission.create({ name });

            // Return a 201 Created response with the newly created permission
            return res.status(201).json(permission);
        } catch ( error ) {
            // If an error occurs, log the error and return a 400 Bad Request response
            console.error(error);
            return res.status(400).json({ message: 'Bad Request' });
        }
    }

    /**
     * Updates a permission in the database.
     *
     * @param {CustomRequest} req - The request object containing the permission ID and updated data.
     * @param {Response} res - The response object to send back to the client.
     * @returns {Promise<Response>} - A promise that resolves to a response object.
     *
     * @throws Will throw a 404 error if the permission is not found.
     * @throws Will throw a 400 error if there is a problem with the request.
     */
    static async update(req: IUpdateRoleRequest, res: Response): Promise<Response> {
        try {
            // Extract the permission ID from the request parameters
            const { id } = req.params;

            // Extract the updated permission data from the request body
            const { name } = req.body;

            // Fetch the permission from the database
            const permission = await Permission.findByPk(id);

            // Check if the permission exists
            if ( !permission ) {
                // If the permission is not found, return a 404 Not Found response
                return res.status(404).json({ message: 'Permission not found' });
            }

            // Update the permission's name if provided
            if ( name ) {
                permission.name = name;
            }

            // Save the updated permission to the database
            await permission.save();

            // Return a 200 OK response with the updated permission
            return res.status(200).json(permission);
        } catch ( error ) {
            // If an error occurs, log the error and return a 400 Bad Request response
            console.error(error);
            return res.status(400).json({ message: 'Bad Request' });
        }
    }


    /**
     * Deletes a permission from the database.
     *
     * @param {CustomRequest} req - The request object containing the permission ID.
     * @param {Response} res - The response object to send back to the client.
     * @returns {Promise<Response>} - A promise that resolves to a response object.
     *
     * @throws Will throw a 404 error if the permission is not found.
     * @throws Will throw a 400 error if there is a problem with the request.
     */
    static async delete(req: CustomRequest, res: Response): Promise<Response> {
        try {
            // Extract the permission ID from the request parameters
            const { id } = req.params;

            // Fetch the permission from the database
            const permission = await Permission.findByPk(id);

            // Check if the permission exists
            if ( !permission ) {
                // If the permission is not found, return a 404 Not Found response
                return res.status(404).json({ message: 'Permission not found' });
            }

            // Delete the permission from the database
            await permission.destroy();

            // Return a 204 No Content response
            return res.status(204).send();
        } catch ( error ) {
            // If an error occurs, log the error and return a 400 Bad Request response
            console.error(error);
            return res.status(400).json({ message: 'Bad Request' });
        }
    }

    /**
     * Adds a permission to a user.
     *
     * @param {CustomRequest} req - The request object containing the user and permission IDs.
     * @param {Response} res - The response object to send back to the client.
     * @returns {Promise<Response>} - A promise that resolves to a response object.
     */
    static async addPermissionToUser(req: CustomRequest, res: Response): Promise<Response> {
        try {
            // Extract user and permission IDs from the request body
            const { userId, permissionId } = req.body;

            // Fetch the user and permission from the database
            const user = await User.findByPk(userId);
            const permission = await Permission.findByPk(permissionId);

            // Check if both user and permission exist
            if ( !user || !permission ) {
                // If either user or permission is not found, return a 404 Not Found response
                return res.status(404).json({ message: 'User or Permission not found' });
            }

            // Add the permission to the user
            await user.$add('permissions', permission);

            // Delete the user's cache from Redis
            await RedisCache.delete(`user:${user.id}`);

            // Return a 200 OK response with a success message
            return res.status(200).json({ message: 'Permission added to user' });
        } catch ( error ) {
            // If an error occurs, log the error and return a 400 Bad Request response
            console.error(error);
            return res.status(400).json({ message: 'Bad Request' });
        }
    }

    /**
     * Removes a permission from a user.
     *
     * @param {CustomRequest} req - The request object containing the user and permission IDs.
     * @param {Response} res - The response object to send back to the client.
     * @returns {Promise<Response>} - A promise that resolves to a response object.
     */
    static async removePermissionFromUser(req: CustomRequest, res: Response): Promise<Response> {
        try {
            // Extract user and permission IDs from the request body
            const { userId, permissionId } = req.body;

            // Fetch the user and permission from the database
            const user = await User.findByPk(userId);
            const permission = await Permission.findByPk(permissionId);

            // Check if both user and permission exist
            if ( !user || !permission ) {
                // If either user or permission is not found, return a 404 Not Found response
                return res.status(404).json({ message: 'User or Role not found' });
            }

            // Remove the permission from the user
            await user.$remove('permissions', permission);

            // Delete the user's cache from Redis
            await RedisCache.delete(`user:${user.id}`);

            // Return a 200 OK response with a success message
            return res.status(200).json({ message: 'Permission removed from user' });
        } catch ( error ) {
            // If an error occurs, log the error and return a 400 Bad Request response
            console.error(error);
            return res.status(400).json({ message: 'Bad Request' });
        }
    }
}