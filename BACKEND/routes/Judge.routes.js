import express from 'express';
import JudgeAssignmentController from '../controllers/JudgeAssignment.controller.js';
import VerifyToken from '../middlewares/VerifyToken.js';
import AuthorizeRoles from '../middlewares/AuthorizeRoles.js';
import { ROLES } from '../utils/Constants.js';
const router = express.Router();
router.get(
    '/me/assigned-hackathons',
    VerifyToken,
    AuthorizeRoles(ROLES.JUDGE),
    JudgeAssignmentController.getAssignedHackathons
);
export default router;
