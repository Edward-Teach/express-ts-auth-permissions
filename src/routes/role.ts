import { RoleController } from "../controllers/roleController";
import { AuthController } from "../controllers/authController";
import { createRoleRequest } from "../requests/createRoleRequest";
import { updateRoleRequest } from "../requests/updateRoleRequest";
import { addRoleToUserRequest } from "../requests/addRoleToUserRequest";
import { checkPermissionMiddleware } from "../middlewares/checkPermission.middleware";

export const roleRoutes = (router: any, passport: any) => {

    router.get(
        '/roles',
        passport.authenticate('jwt', { session: false }),
        checkPermissionMiddleware('manage-roles'),
        RoleController.list
    );

    router.post(
        '/roles',
        passport.authenticate('jwt', { session: false }),
        checkPermissionMiddleware('manage-roles'),
        createRoleRequest,
        AuthController.withValidation,
        RoleController.create
    );

    router.put(
        '/roles/:id',
        passport.authenticate('jwt', { session: false }),
        checkPermissionMiddleware('manage-roles'),
        updateRoleRequest,
        AuthController.withValidation,
        RoleController.update
    );

    router.delete(
        '/roles/:id',
        passport.authenticate('jwt', { session: false }),
        checkPermissionMiddleware('manage-roles'),
        RoleController.delete
    );

    router.post(
        '/roles/addRoleToUser',
        passport.authenticate('jwt', { session: false }),
        checkPermissionMiddleware('manage-roles'),
        addRoleToUserRequest,
        AuthController.withValidation,
        RoleController.addRoleToUser
    );

    router.post(
        '/roles/removeRoleFromUser',
        passport.authenticate('jwt', { session: false }),
        checkPermissionMiddleware('manage-roles'),
        addRoleToUserRequest,
        AuthController.withValidation,
        RoleController.removeRoleFromUser)
    ;

    return router;
}