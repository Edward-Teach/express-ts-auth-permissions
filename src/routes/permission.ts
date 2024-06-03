import { PermissionController } from "../controllers/permissionController";

export const permissionRoutes = (router: any, passport: any) => {

    router.get(
        '/permissions',
        passport.authenticate('jwt', { session: false }),
        //     checkPermissionMiddleware('manage-roles'),
        PermissionController.list
    );
    /*
        router.post(
            '/',
            passport.authenticate('jwt', { session: false }),
            checkPermissionMiddleware('manage-roles'),
            createRoleRequest,
            AuthController.withValidation,
            RoleController.create
        );

        router.put(
            '/:id',
            passport.authenticate('jwt', { session: false }),
            checkPermissionMiddleware('manage-roles'),
            updateRoleRequest,
            AuthController.withValidation,
            RoleController.update
        );

        router.delete(
            '/:id',
            passport.authenticate('jwt', { session: false }),
            checkPermissionMiddleware('manage-roles'),
            RoleController.delete
        );

        router.post(
            '/addRoleToUser',
            passport.authenticate('jwt', { session: false }),
            checkPermissionMiddleware('manage-roles'),
            addRoleToUserRequest,
            AuthController.withValidation,
            RoleController.addRoleToUser
        );

        router.post(
            '/removeRoleFromUser',
            passport.authenticate('jwt', { session: false }),
            checkPermissionMiddleware('manage-roles'),
            addRoleToUserRequest,
            AuthController.withValidation,
            RoleController.removeRoleFromUser)
        ;*/

    return router;
}