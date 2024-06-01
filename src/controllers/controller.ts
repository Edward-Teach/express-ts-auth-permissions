import {validationResult} from 'express-validator';
import { Request, Response } from "express";


export class Controller {

    static withValidation = (req: Request, res: Response, next: any) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Format and send custom error messages
            const errorMessages = errors.array().map((error: any) => error.msg);
            return res.status(400).json({ errors: errorMessages });
        }
        next();
    }


    protected static sanitizeString = (str: string) : string => {
        return str.replace(/[&<>"'/]/g, (match: string): string => {
            switch (match) {
                case '&':
                    return '&amp;';
                case '<':
                    return '&lt;';
                case '>':
                    return '&gt;';
                case '"':
                    return '&quot;';
                case "'":
                    return '&#39;';
                case '/':
                    return '&#x2F;';
                default:
                    return match;
            }
        });
    };
}