/**
 * File: Review.routes.js
 * Description: Review Routes
 */

import express from 'express';

import VerifyToken from '../middlewares/VerifyToken.js';
import AuthorizeRoles from '../middlewares/AuthorizeRoles.js';
import { ROLES } from '../utils/Constants.js';

import LoadSubmission from '../middlewares/LoadSubmission.js';
import LoadReview from '../middlewares/LoadReview.js';
import LoadHackathon from '../middlewares/LoadHackathon.js';

import HasHackathonAccess from '../middlewares/HasHackathonAccess.js';

import ReviewController from '../controllers/Review.controller.js';

const router = express.Router();

/**
 * ----------------------------------------------------
 * Judge Routes
 * ----------------------------------------------------
 */

/**
 * Submit Review
 * POST /api/submissions/:submissionId/reviews
 */
router.post(
    '/submissions/:submissionId/reviews',
    VerifyToken,
    AuthorizeRoles(ROLES.JUDGE),
    LoadSubmission(),
    HasHackathonAccess({
        allowJudge: true,
    }),
    ReviewController.submitReview
);

/**
 * Update Review
 * PUT /api/reviews/:id
 */
router.put(
    '/reviews/:id',
    VerifyToken,
    AuthorizeRoles(ROLES.JUDGE),
    LoadReview,
    HasHackathonAccess({
        allowJudge: true,
    }),
    ReviewController.updateReview
);

/**
 * Logged-in Judge Reviews
 * GET /api/judges/me/reviews
 */
router.get(
    '/judges/me/reviews',
    VerifyToken,
    AuthorizeRoles(ROLES.JUDGE),
    ReviewController.getMyReviews
);

/**
 * ----------------------------------------------------
 * Review Access
 * ----------------------------------------------------
 */

/**
 * Get Review By Id
 * GET /api/reviews/:id
 */
router.get(
    '/reviews/:id',
    VerifyToken,
    LoadReview,
    HasHackathonAccess({
        allowAdmin: true,
        allowOrganizer: true,
        allowJudge: true,
    }),
    ReviewController.getReview
);

/**
 * Get Submission Reviews
 * GET /api/submissions/:submissionId/reviews
 */
router.get(
    '/submissions/:submissionId/reviews',
    VerifyToken,
    LoadSubmission(),
    HasHackathonAccess({
        allowAdmin: true,
        allowOrganizer: true,
        allowJudge: true,
    }),
    ReviewController.getSubmissionReviews
);

/**
 * Get Hackathon Reviews
 * GET /api/hackathons/:hackathonId/reviews
 */
router.get(
    '/hackathons/:hackathonId/reviews',
    VerifyToken,
    LoadHackathon,
    HasHackathonAccess({
        allowAdmin: true,
        allowOrganizer: true,
    }),
    ReviewController.getHackathonReviews
);

export default router;