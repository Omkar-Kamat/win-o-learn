import { Router } from "express";

import SubmissionController from "../controllers/Submission.controller.js";

import VerifyToken from "../middlewares/VerifyToken.js";
import AuthorizeRoles from "../middlewares/AuthorizeRoles.js";

import LoadHackathon from "../middlewares/LoadHackathon.js";
import LoadTeam from "../middlewares/LoadTeam.js";
import LoadSubmission from "../middlewares/LoadSubmission.js";

import ROLES from "../constants/roles.js";

import {
  validateCreateSubmission,
  validateUpdateSubmission,
  validateSubmissionStatus,
} from "../validators/Submission.validator.js";

const hackathonScopedSubmissionRoutes = Router();

hackathonScopedSubmissionRoutes.post(
  "/:hackathonId/submissions",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  LoadHackathon(),
  LoadTeam({
    requireLeader: true,
  }),
  validateCreateSubmission,
  SubmissionController.createSubmission
);

hackathonScopedSubmissionRoutes.get(
  "/:hackathonId/submissions/mine",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
  LoadHackathon(),
  LoadTeam(),
  SubmissionController.getMySubmission
);


hackathonScopedSubmissionRoutes.get(
  "/:hackathonId/submissions",
  VerifyToken,
  AuthorizeRoles(ROLES.ORGANIZER),
  LoadHackathon({
    requireOwner: true,
  }),
  SubmissionController.getHackathonSubmissions
);


const submissionRoutes = Router()

submissionRoutes.get(
  "/:id",
  VerifyToken,
  LoadSubmission({
    requireAccess: true,
  }),
  SubmissionController.getSubmission
);

submissionRoutes.put(
  "/:id",
  VerifyToken,
  AuthorizeRoles(ROLES.PARTICIPANT),
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
  LoadSubmission({
    requireLeader: true,
  }),
  SubmissionController.updateSubmissionFiles
);

submissionRoutes.patch(
  "/:id/status",
  VerifyToken,
  AuthorizeRoles(ROLES.ORGANIZER),
  LoadSubmission({
    requireOrganizer: true,
  }),
  validateSubmissionStatus,
  SubmissionController.updateSubmissionStatus
);


export { hackathonScopedSubmissionRoutes, submissionRoutes };