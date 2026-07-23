/**
 * File: Leaderboard.routes.js
 * Description: Implementation of Leaderboard.routes.js
 */

import express from 'express';
import LeaderboardController from '../controllers/Leaderboard.controller.js';
import VerifyToken from '../middlewares/VerifyToken.js';
import LoadHackathon from '../middlewares/LoadHackathon.js';
import HasHackathonAccess from '../middlewares/HasHackathonAccess.js';

const router = express.Router();

// Retrieves the leaderboard
router.get(
    '/:hackathonId/leaderboard',
    LoadHackathon,
    LeaderboardController.getLeaderboard
);

// Recalculates leaderboard
router.get(
    '/:hackathonId/leaderboard/recalculate',
    VerifyToken,
    LoadHackathon,
    HasHackathonAccess({
        allowAdmin: true,
        allowOrganizer: true,
    }),
    LeaderboardController.recalculateLeaderboard
);

export default router;