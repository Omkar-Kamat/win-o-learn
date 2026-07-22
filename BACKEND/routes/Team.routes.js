import { Router } from "express";

import VerifyToken from "../middlewares/VerifyToken.js";
import AuthorizeRoles from "../middlewares/AuthorizeRoles.js";
import LoadTeam from "../middlewares/LoadTeam.js";

import { ROLES } from "../utils/Constants.js";
import TeamController from "../controllers/Team.controller.js";

import {
  validateCreateTeam,
  validateUpdateTeam,
  validateInviteMember,
} from "../validators/Team.validator.js";

const router = Router();

router.post(
  "/",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  validateCreateTeam,
  TeamController.createTeam
);

router.get(
  "/:id",
  VerifyToken,
  LoadTeam(),
  TeamController.getTeam
);

router.put(
  "/:id",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  LoadTeam({ requireLeader: true }),
  validateUpdateTeam,
  TeamController.updateTeam
);

router.delete(
  "/:id",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  LoadTeam({ requireLeader: true }),
  TeamController.deleteTeam
);

router.post(
  "/:id/invite",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  LoadTeam({ requireLeader: true }),
  validateInviteMember,
  TeamController.inviteMember
);

router.post(
  "/:id/invite/accept",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  LoadTeam({ requireInvitee: true }),
  TeamController.acceptInvite
);

router.post(
  "/:id/invite/reject",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  LoadTeam(),
  TeamController.rejectInvite
);

export default router;