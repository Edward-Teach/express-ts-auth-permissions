import { RoleController } from "../controllers/roleController";
import { AuthController } from "../controllers/authController";
import { createRoleRequest } from "../requests/createRoleRequest";
import { updateRoleRequest } from "../requests/updateRoleRequest";
import { addRoleToUserRequest } from "../requests/addRoleToUserRequest";

export const roleRoutes = (router: any, passport: any) => {

    router.get('/', passport.authenticate('jwt', { session: false }), RoleController.list);

    router.post(
        '/',
        passport.authenticate('jwt', { session: false }),
        createRoleRequest,
        AuthController.withValidation,
        RoleController.create
    );

    router.put(
        '/:id',
        passport.authenticate('jwt', { session: false }),
        updateRoleRequest,
        AuthController.withValidation,
        RoleController.update
    );

    router.delete('/:id', passport.authenticate('jwt', { session: false }), RoleController.delete);

    router.post(
        '/addRoleToUser',
        passport.authenticate('jwt', { session: false }),
        addRoleToUserRequest,
        AuthController.withValidation,
        RoleController.addRoleToUser
    );

    router.post(
        '/removeRoleFromUser',
        passport.authenticate('jwt', { session: false }),
        addRoleToUserRequest,
        AuthController.withValidation,
        RoleController.removeRoleFromUser)
    ;

    return router;
}