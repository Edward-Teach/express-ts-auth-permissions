import { Request } from "express";
import { User } from "./models/User";

export interface CustomRequest extends Request {
    user?: User
}