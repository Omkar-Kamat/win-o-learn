/**
 * File: Dashboard.routes.js
 * Description: Implementation of Dashboard.routes.js
 */

import express from 'express';
import DashboardController from '../controllers/Dashboard.controller.js';
import VerifyToken from '../middlewares/VerifyToken.js';
import AuthorizeRoles from '../middlewares/AuthorizeRoles.js';
import { ROLES } from '../utils/Constants.js';

const router = express.Router();

// Admin dashboard
router.get(
    '/admin',
    VerifyToken,
    AuthorizeRoles(ROLES.ADMIN),
    DashboardController.getAdminDashboard
);

// Organizer dashboard
router.get(
    '/organizer',
    VerifyToken,
    AuthorizeRoles(ROLES.ORGANIZER),
    DashboardController.getOrganizerDashboard
);

// Participant dashboard
router.get(
    '/participant',
    VerifyToken,
    AuthorizeRoles(ROLES.PARTICIPANT),
    DashboardController.getParticipantDashboard
);

// Judge dashboard
router.get(
    '/judge',
    VerifyToken,
    AuthorizeRoles(ROLES.JUDGE),
    DashboardController.getJudgeDashboard
);

export default router;