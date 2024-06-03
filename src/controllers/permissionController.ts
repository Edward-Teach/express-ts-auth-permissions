import { Controller } from "./controller";
import { CustomRequest } from "../express";
import { Response } from "express";
import { Role } from "../models/Role";
import { i18n } from "../index";
import { Permission } from "../models/Permission";

export class PermissionController extends Controller {

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


}