/**
 * File: Leaderboard.controller.js
 * Description: Implementation of Leaderboard.controller.js
 */

import AsyncHandler from '../middlewares/AsyncHandler.js';
import LeaderboardService from '../services/Leaderboard.service.js';
import SendResponse from '../utils/SendResponse.js';

// Retrieves the leaderboard data
const getLeaderboard = AsyncHandler(async (req, res) => {
    const leaderboard = await LeaderboardService.getLeaderboard(req.hackathon);

    return SendResponse(
        res,
        200,
        true,
        'Leaderboard retrieved successfully.',
        leaderboard
    );
});

// Recalculates leaderboard scores
const recalculateLeaderboard = AsyncHandler(async (req, res) => {
    await LeaderboardService.recalculateLeaderboard(req.hackathon);

    return SendResponse(
        res,
        200,
        true,
        'Leaderboard recalculated successfully.'
    );
});

export default {
    getLeaderboard,
    recalculateLeaderboard,
};