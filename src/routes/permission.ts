import { PermissionController } from "../controllers/permissionController";
import { createPermissionRequest } from "../requests/createPermissionRequest";
import { AuthController } from "../controllers/authController";
import { addPermissionToUserRequest } from "../requests/addPermissionToUserRequest";
import { checkPermissionMiddleware } from "../middlewares/checkPermission.middleware";

export const permissionRoutes = (router: any, passport: any) => {

    router.get(
        '/permissions',
        passport.authenticate('jwt', { session: false }),
        checkPermissionMiddleware('manage-permissions'),
        PermissionController.list
    );

    router.post(
        '/permissions',
        passport.authenticate('jwt', { session: false }),
        checkPermissionMiddleware('manage-permissions'),
        createPermissionRequest,
        AuthController.withValidation,
        PermissionController.create
    );

    router.put(
        '/permissions/:id',
        passport.authenticate('jwt', { session: false }),
        checkPermissionMiddleware('manage-permissions'),
        createPermissionRequest,
        AuthController.withValidation,
        PermissionController.update
    );

    router.delete(
        '/permissions/:id',
        passport.authenticate('jwt', { session: false }),
        checkPermissionMiddleware('manage-permissions'),
        PermissionController.delete
    );

    router.post(
        '/permissions/addPermissionToUser',
        passport.authenticate('jwt', { session: false }),
        checkPermissionMiddleware('manage-permissions'),
        addPermissionToUserRequest,
        AuthController.withValidation,
        PermissionController.addPermissionToUser
    );

    router.post(
        '/permissions/removePermissionFromUser',
        passport.authenticate('jwt', { session: false }),
        checkPermissionMiddleware('manage-permissions'),
        addPermissionToUserRequest,
        AuthController.withValidation,
        PermissionController.removePermissionFromUser)
    ;

    return router;
}