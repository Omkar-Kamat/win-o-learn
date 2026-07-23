import { Router } from 'express';
import VerifyToken from '../middlewares/VerifyToken.js';
import AuthorizeRoles from '../middlewares/AuthorizeRoles.js';
import { ROLES } from '../utils/Constants.js';
import LoadSubmission from '../middlewares/LoadSubmission.js';
import LoadReview from '../middlewares/LoadReview.js';
import LoadHackathon from '../middlewares/LoadHackathon.js';
import HasHackathonAccess from '../middlewares/HasHackathonAccess.js';
import ReviewController from '../controllers/Review.controller.js';
export const submissionScopedReviewRouter = Router();
export const hackathonScopedReviewRouter = Router();
export const reviewRouter = Router();
export const judgeScopedReviewRouter = Router();
submissionScopedReviewRouter.post(
    '/:submissionId/reviews',
    VerifyToken,
    AuthorizeRoles(ROLES.JUDGE),
    LoadSubmission(),
    HasHackathonAccess({ allowJudge: true }),
    ReviewController.submitReview
);
reviewRouter.put(
    '/:id',
    VerifyToken,
    AuthorizeRoles(ROLES.JUDGE),
    LoadReview,
    HasHackathonAccess({ allowJudge: true }),
    ReviewController.updateReview
);
judgeScopedReviewRouter.get(
    '/me/reviews',
    VerifyToken,
    AuthorizeRoles(ROLES.JUDGE),
    ReviewController.getMyReviews
);
reviewRouter.get(
    '/:id',
    VerifyToken,
    LoadReview,
    HasHackathonAccess({ allowAdmin: true, allowOrganizer: true, allowJudge: true }),
    ReviewController.getReview
);
submissionScopedReviewRouter.get(
    '/:submissionId/reviews',
    VerifyToken,
    LoadSubmission(),
    HasHackathonAccess({ allowAdmin: true, allowOrganizer: true, allowJudge: true }),
    ReviewController.getSubmissionReviews
);
hackathonScopedReviewRouter.get(
    '/:hackathonId/reviews',
    VerifyToken,
    LoadHackathon,
    HasHackathonAccess({ allowAdmin: true, allowOrganizer: true }),
    ReviewController.getHackathonReviews
);
