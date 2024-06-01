import { Response, NextFunction  } from "express";

export const checkRoleMiddleware = (role: string) => {

    return function (req: any, res: Response, next: NextFunction ): any {
        const user = req.user!;
        const roles = role.split(',');
        for (const r of roles) {
            if (user.roles?.includes(r)) {
                next();
                return;
            }
        }
        return res.status(403).json({ message: 'Forbidden' });
    };

}