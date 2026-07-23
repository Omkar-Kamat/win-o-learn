import { Router } from 'express';
import HackathonController from '../controllers/Hackathon.controller.js';
import VerifyToken from '../middlewares/VerifyToken.js';
import AuthorizeRoles from '../middlewares/AuthorizeRoles.js';
import LoadHackathon from '../middlewares/LoadHackathon.js';
import CheckHackathonOwnership from '../middlewares/CheckHackathonOwnership.js';
import {
    validateCreateHackathon,
    validateUpdateHackathon,
    validateHackathonId,
    validateListHackathons,
} from '../validators/Hackathon.validator.js';
import UploadBanner from '../middlewares/UploadBanner.js';
import { ROLES } from '../utils/Constants.js';
const router = Router();
router.get('/', validateListHackathons, HackathonController.getHackathons);
router.post(
    '/',
    VerifyToken,
    AuthorizeRoles(ROLES.ORGANIZER),
    validateCreateHackathon,
    HackathonController.createHackathon
);
router.get(
    '/my',
    VerifyToken,
    AuthorizeRoles(ROLES.ORGANIZER),
    validateListHackathons,
    HackathonController.getMyHackathons
);
router.get('/:id', validateHackathonId, HackathonController.getHackathonById);
router.put(
    '/:id',
    VerifyToken,
    AuthorizeRoles(ROLES.ORGANIZER),
    validateHackathonId,
    LoadHackathon,
    CheckHackathonOwnership(),
    validateUpdateHackathon,
    HackathonController.updateHackathon
);
router.delete(
    '/:id',
    VerifyToken,
    AuthorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN),
    validateHackathonId,
    LoadHackathon,
    CheckHackathonOwnership({ allowAdminOverride: true }),
    HackathonController.deleteHackathon
);
router.patch(
    '/:id/open-registration',
    VerifyToken,
    AuthorizeRoles(ROLES.ORGANIZER),
    validateHackathonId,
    LoadHackathon,
    CheckHackathonOwnership(),
    HackathonController.openRegistration
);
router.patch(
    '/:id/close-registration',
    VerifyToken,
    AuthorizeRoles(ROLES.ORGANIZER),
    validateHackathonId,
    LoadHackathon,
    CheckHackathonOwnership(),
    HackathonController.closeRegistration
);
router.patch(
    '/:id/publish-results',
    VerifyToken,
    AuthorizeRoles(ROLES.ORGANIZER),
    validateHackathonId,
    LoadHackathon,
    CheckHackathonOwnership(),
    HackathonController.publishResults
);
router.put(
    '/:id/banner',
    VerifyToken,
    AuthorizeRoles(ROLES.ORGANIZER),
    validateHackathonId,
    LoadHackathon,
    CheckHackathonOwnership(),
    UploadBanner.single('banner'),
    HackathonController.updateBanner
);
export default router;
