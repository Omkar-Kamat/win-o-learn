import { Router } from "express";

import TeamController from "../controllers/Team.controller.js";

import VerifyToken from "../middlewares/VerifyToken.js";
import AuthorizeRoles from "../middlewares/AuthorizeRoles.js";

import { validateCreateTeam } from "../validators/Team.validator.js";

import { ROLES } from "../utils/Constants.js";

const router = Router();

router.post(
  "/",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  validateCreateTeam,
  TeamController.createTeam
);

export default router;