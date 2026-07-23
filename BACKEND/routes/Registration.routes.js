import { Router } from 'express';
import RegistrationController from '../controllers/Registration.controller.js';
import VerifyToken from '../middlewares/VerifyToken.js';
import AuthorizeRoles from '../middlewares/AuthorizeRoles.js';
import LoadHackathon from '../middlewares/LoadHackathon.js';
import LoadTeam from '../middlewares/LoadTeam.js';
import LoadRegistration from '../middlewares/LoadRegistration.js';
import CheckHackathonOwnership from '../middlewares/CheckHackathonOwnership.js';
import { ROLES } from '../utils/Constants.js';
import {
    validateRegister,
    validateCancelRegistration,
    validateRegistrationStatus,
    validateHackathonRegistrations,
    validateRegistrationId,
} from '../validators/Registration.validator.js';
const hackathonScopedRouter = Router();
hackathonScopedRouter.post(
    '/:hackathonId/register',
    VerifyToken,
    AuthorizeRoles(ROLES.PARTICIPANT),
    validateRegister,
    LoadHackathon,
    LoadTeam({ requireLeader: true }),
    RegistrationController.registerTeam
);
hackathonScopedRouter.delete(
    '/:hackathonId/register/:teamId',
    VerifyToken,
    AuthorizeRoles(ROLES.PARTICIPANT),
    validateCancelRegistration,
    LoadHackathon,
    LoadTeam({ requireLeader: true }),
    RegistrationController.cancelRegistration
);
hackathonScopedRouter.get(
    '/:hackathonId/register/status/:teamId',
    VerifyToken,
    AuthorizeRoles(ROLES.PARTICIPANT),
    validateRegistrationStatus,
    LoadHackathon,
    LoadTeam({ requireMember: true }),
    RegistrationController.getRegistrationStatus
);
hackathonScopedRouter.get(
    '/:hackathonId/registrations',
    VerifyToken,
    AuthorizeRoles(ROLES.ORGANIZER),
    validateHackathonRegistrations,
    LoadHackathon,
    CheckHackathonOwnership(),
    RegistrationController.getHackathonRegistrations
);
const registrationScopedRouter = Router();
registrationScopedRouter.patch(
    '/:registrationId/approve',
    VerifyToken,
    AuthorizeRoles(ROLES.ORGANIZER),
    validateRegistrationId,
    LoadRegistration,
    CheckHackathonOwnership(),
    RegistrationController.approveRegistration
);
registrationScopedRouter.patch(
    '/:registrationId/reject',
    VerifyToken,
    AuthorizeRoles(ROLES.ORGANIZER),
    validateRegistrationId,
    LoadRegistration,
    CheckHackathonOwnership(),
    RegistrationController.rejectRegistration
);
export { registrationScopedRouter, hackathonScopedRouter };
