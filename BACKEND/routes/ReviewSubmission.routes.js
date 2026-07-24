import { Router } from 'express';
import VerifyToken from '../middlewares/VerifyToken.js';
import AuthorizeRoles from '../middlewares/AuthorizeRoles.js';
import { ROLES } from '../utils/Constants.js';
import LoadSubmission from '../middlewares/LoadSubmission.js';
import HasHackathonAccess from '../middlewares/HasHackathonAccess.js';
import ReviewController from '../controllers/Review.controller.js';

const router = Router();
router.post('/:submissionId/reviews', VerifyToken, AuthorizeRoles(ROLES.JUDGE), LoadSubmission(), HasHackathonAccess({
  allowJudge: true
}), ReviewController.submitReview);
router.get('/:submissionId/reviews', VerifyToken, LoadSubmission(), HasHackathonAccess({
  allowAdmin: true,
  allowOrganizer: true,
  allowJudge: true
}), ReviewController.getSubmissionReviews);

export default router;
