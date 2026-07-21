import { Router } from "express";

import RegistrationController from "../controllers/Registration.controller.js";

import VerifyToken from "../middlewares/VerifyToken.js";
import AuthorizeRoles from "../middlewares/AuthorizeRoles.js";
import LoadHackathon from "../middlewares/LoadHackathon.js";
import LoadTeam from "../middlewares/LoadTeam.js";
import LoadRegistration from "../middlewares/LoadRegistration.js";
import CheckHackathonOwnership from "../middlewares/CheckHackathonOwnership.js";

import {
  validateRegister,
  validateCancelRegistration,
  validateRegistrationStatus,
  validateHackathonRegistrations,
  validateRegistrationId,
} from "../validators/Registration.validator.js";

const router = Router();

router.post(
  "/hackathons/:hackathonId/register",
  VerifyToken,
  AuthorizeRoles("participant"),
  validateRegister,
  LoadHackathon,
  LoadTeam({ requireLeader: true }),
  RegistrationController.registerTeam
);

router.delete(
  "/hackathons/:hackathonId/register/:teamId",
  VerifyToken,
  AuthorizeRoles("participant"),
  validateCancelRegistration,
  LoadHackathon,
  LoadTeam({ requireLeader: true }),
  RegistrationController.cancelRegistration
);

router.get(
  "/hackathons/:hackathonId/register/status/:teamId",
  VerifyToken,
  AuthorizeRoles("participant"),
  validateRegistrationStatus,
  LoadHackathon,
  LoadTeam({ requireMember: true }),
  RegistrationController.getRegistrationStatus
);

router.get(
  "/hackathons/:hackathonId/registrations",
  VerifyToken,
  AuthorizeRoles("organizer"),
  validateHackathonRegistrations,
  LoadHackathon,
  CheckHackathonOwnership(),
  RegistrationController.getHackathonRegistrations
);

router.patch(
  "/registrations/:registrationId/approve",
  VerifyToken,
  AuthorizeRoles("organizer"),
  validateRegistrationId,
  LoadRegistration,
  CheckHackathonOwnership(),
  RegistrationController.approveRegistration
);

router.patch(
  "/registrations/:registrationId/reject",
  VerifyToken,
  AuthorizeRoles("organizer"),
  validateRegistrationId,
  LoadRegistration,
  CheckHackathonOwnership(),
  RegistrationController.rejectRegistration
);

export default router;