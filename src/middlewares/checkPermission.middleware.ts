import { NextFunction, Response } from "express";

export const checkPermissionMiddleware = (permission: string) => {

    return function (req: any, res: Response, next: NextFunction): any {
        const user = req.user!;
        const permissions = permission.split(',');
        for ( const p of permissions ) {
            if ( user.permissions?.includes(p) ) {
                next();
                return;
            }
        }
        return res.status(403).json({ message: 'Forbidden' });
    };

}