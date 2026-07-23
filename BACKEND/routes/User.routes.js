import { Router } from 'express';
import UserController from '../controllers/User.controller.js';
import VerifyToken from '../middlewares/VerifyToken.js';
import AuthorizeRoles from '../middlewares/AuthorizeRoles.js';
import { ROLES } from '../utils/Constants.js';
import {
    validateAdminUpdate,
    validateRoleUpdate,
    validateUpdateProfile,
    validateUserId,
} from '../validators/User.validator.js';
import UploadAvatar from '../middlewares/UploadAvatar.js';
const router = Router();
router.get('/me', VerifyToken, UserController.getProfile);
router.put('/me', VerifyToken, validateUpdateProfile, UserController.updateProfile);
router.put('/me/avatar', VerifyToken, UploadAvatar.single('avatar'), UserController.uploadAvatar);
router.get('/', VerifyToken, AuthorizeRoles(ROLES.ADMIN), UserController.getAllUsers);
router.get(
    '/:id',
    VerifyToken,
    AuthorizeRoles(ROLES.ADMIN),
    validateUserId,
    UserController.getUserById
);
router.put(
    '/:id',
    VerifyToken,
    AuthorizeRoles(ROLES.ADMIN),
    validateAdminUpdate,
    UserController.updateUser
);
router.delete(
    '/:id',
    VerifyToken,
    AuthorizeRoles(ROLES.ADMIN),
    validateUserId,
    UserController.deleteUser
);
router.patch(
    '/:id/block',
    VerifyToken,
    AuthorizeRoles(ROLES.ADMIN),
    validateUserId,
    UserController.blockUser
);
router.patch(
    '/:id/unblock',
    VerifyToken,
    AuthorizeRoles(ROLES.ADMIN),
    validateUserId,
    UserController.unblockUser
);
router.patch(
    '/:id/role',
    VerifyToken,
    AuthorizeRoles(ROLES.ADMIN),
    validateUserId,
    validateRoleUpdate,
    UserController.updateRole
);
export default router;
