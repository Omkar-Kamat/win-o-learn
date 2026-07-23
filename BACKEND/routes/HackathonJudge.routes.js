import express from 'express';
import JudgeAssignmentController from '../controllers/JudgeAssignment.controller.js';
import VerifyToken from '../middlewares/VerifyToken.js';
import AuthorizeRoles from '../middlewares/AuthorizeRoles.js';
import LoadHackathon from '../middlewares/LoadHackathon.js';
import CheckHackathonOwnership from '../middlewares/CheckHackathonOwnership.js';
import { validateAssignJudge, validateHackathonId, validateJudgeId } from '../validators/JudgeAssignment.validator.js';
import { ROLES } from '../utils/Constants.js';
const router = express.Router();
router.post('/:hackathonId/judges', VerifyToken, AuthorizeRoles(ROLES.ORGANIZER), validateHackathonId, LoadHackathon, CheckHackathonOwnership(), validateAssignJudge, JudgeAssignmentController.assignJudge);
router.delete('/:hackathonId/judges/:judgeId', VerifyToken, AuthorizeRoles(ROLES.ORGANIZER), validateHackathonId, validateJudgeId, LoadHackathon, CheckHackathonOwnership(), JudgeAssignmentController.removeJudge);
router.get('/:hackathonId/judges', VerifyToken, AuthorizeRoles(ROLES.ORGANIZER, ROLES.ADMIN), validateHackathonId, LoadHackathon, CheckHackathonOwnership({
  allowAdminOverride: true
}), JudgeAssignmentController.getHackathonJudges);
export default router;