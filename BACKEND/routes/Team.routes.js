import { Router } from "express";

import TeamController from "../controllers/Team.controller.js";

import VerifyToken from "../middlewares/VerifyToken.js";
import AuthorizeRoles from "../middlewares/AuthorizeRoles.js";

import { validateCreateTeam } from "../validators/Team.validator.js";

const router = Router();

router.post(
  "/",
  VerifyToken,
  AuthorizeRoles("participant"),
  validateCreateTeam,
  TeamController.createTeam
);

export default router;