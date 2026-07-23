/**
 * File: Dashboard.controller.js
 * Description: Implementation of Dashboard.controller.js
 */

import AsyncHandler from '../middlewares/AsyncHandler.js';
import DashboardService from '../services/Dashboard.service.js';
import SendResponse from '../utils/SendResponse.js';

// Retrieves admin dashboard
const getAdminDashboard = AsyncHandler(async (req, res) => {
    const dashboard = await DashboardService.getAdminDashboard(req.user);

    return SendResponse(
        res,
        200,
        true,
        'Admin dashboard retrieved successfully.',
        dashboard
    );
});

// Retrieves organizer dashboard
const getOrganizerDashboard = AsyncHandler(async (req, res) => {
    const dashboard = await DashboardService.getOrganizerDashboard(req.user);

    return SendResponse(
        res,
        200,
        true,
        'Organizer dashboard retrieved successfully.',
        dashboard
    );
});

// Retrieves participant dashboard
const getParticipantDashboard = AsyncHandler(async (req, res) => {
    const dashboard = await DashboardService.getParticipantDashboard(req.user);

    return SendResponse(
        res,
        200,
        true,
        'Participant dashboard retrieved successfully.',
        dashboard
    );
});

// Retrieves judge dashboard
const getJudgeDashboard = AsyncHandler(async (req, res) => {
    const dashboard = await DashboardService.getJudgeDashboard(req.user);

    return SendResponse(
        res,
        200,
        true,
        'Judge dashboard retrieved successfully.',
        dashboard
    );
});

export default {
    getAdminDashboard,
    getOrganizerDashboard,
    getParticipantDashboard,
    getJudgeDashboard,
};