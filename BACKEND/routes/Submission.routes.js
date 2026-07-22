import { Router } from "express";

import SubmissionController from "../controllers/Submission.controller.js";

import VerifyToken from "../middlewares/VerifyToken.js";
import AuthorizeRoles from "../middlewares/AuthorizeRoles.js";

import LoadHackathon from "../middlewares/LoadHackathon.js";
import LoadTeam from "../middlewares/LoadTeam.js";
import LoadSubmission from "../middlewares/LoadSubmission.js";

import CheckHackathonOwnership from "../middlewares/CheckHackathonOwnership.js";

import {ROLES} from "../utils/Constants.js";

import {
  validateCreateSubmission,
  validateUpdateSubmission,
  validateSubmissionStatus,
  validateHackathonIdParam,
  validateSubmissionIdParam,
  validateGetMySubmission,
  validateUpdateSubmissionFiles
} from "../validators/Submission.validator.js";

const hackathonScopedSubmissionRoutes = Router();

hackathonScopedSubmissionRoutes.post(
  "/:hackathonId/submissions",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  validateHackathonIdParam,
  LoadHackathon,
  LoadTeam({ requireLeader: true }),
  validateCreateSubmission,
  SubmissionController.createSubmission
);

hackathonScopedSubmissionRoutes.get(
  "/:hackathonId/submissions/mine",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  validateHackathonIdParam,
  validateGetMySubmission,
  LoadHackathon,
  LoadTeam({ requireMember: true }),
  SubmissionController.getMySubmission
);

hackathonScopedSubmissionRoutes.get(
  "/:hackathonId/submissions",
  VerifyToken,
  AuthorizeRoles(ROLES.ORGANIZER),
  validateHackathonIdParam,
  LoadHackathon,
  CheckHackathonOwnership(),
  SubmissionController.getHackathonSubmissions
);


const submissionRoutes = Router()

submissionRoutes.get(
  "/:id",
  VerifyToken,
  validateSubmissionIdParam,
  LoadSubmission({
    requireAccess: true,
  }),
  SubmissionController.getSubmission
);

submissionRoutes.put(
  "/:id",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  validateSubmissionIdParam,
  LoadSubmission({
    requireLeader: true,
  }),
  validateUpdateSubmission,
  SubmissionController.updateSubmission
);

submissionRoutes.put(
  "/:id/files",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  validateSubmissionIdParam,
  LoadSubmission({
    requireLeader: true,
  }),
  validateUpdateSubmissionFiles,
  SubmissionController.updateSubmissionFiles
);

submissionRoutes.patch(
  "/:id/status",
  VerifyToken,
  AuthorizeRoles(ROLES.ORGANIZER),
  validateSubmissionIdParam,
  LoadSubmission({
    requireOrganizer: true,
  }),
  validateSubmissionStatus,
  SubmissionController.updateSubmissionStatus
);


export { hackathonScopedSubmissionRoutes, submissionRoutes };