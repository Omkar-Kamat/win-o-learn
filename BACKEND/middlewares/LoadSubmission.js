import SubmissionRepository from '../repository/Submission.repository.js';
import ApiError from '../utils/ApiError.js';
import { ROLES } from '../utils/Constants.js';
import AsyncHandler from './AsyncHandler.js';
// Loads submission by executing underlying operations (findById). Includes validation checks preventing actions if submission not found. or only the team leader can perform this action.. 
const LoadSubmission = ({
  requireLeader = false,
  requireOrganizer = false,
  requireAccess = false
} = {}) => AsyncHandler(async (req, res, next) => {
  const submissionId = req.params.submissionId ?? req.params.id;
  const submission = await SubmissionRepository.findById(submissionId);
  if (!submission) {
    throw new ApiError(404, 'Submission not found.');
  }
  const team = submission.registration.team;
  const hackathon = submission.registration.hackathon;
  const leaderId = team.leader._id ?? team.leader;
  const organizerId = hackathon.organizer._id ?? hackathon.organizer;
  if (requireLeader && !leaderId.equals(req.user._id)) {
    throw new ApiError(403, 'Only the team leader can perform this action.');
  }
  if (requireOrganizer && !organizerId.equals(req.user._id)) {
    throw new ApiError(403, 'Only the organizer can perform this action.');
  }
  if (requireAccess) {
    const isAdmin = req.user.role === ROLES.ADMIN;
    const isOrganizer = organizerId.equals(req.user._id);
    const isTeamMember = team.members.some(member => String(member._id ?? member) === String(req.user._id));
    const isJudge = false;
    if (!(isAdmin || isOrganizer || isTeamMember || isJudge)) {
      throw new ApiError(403, 'You are not authorized to access this submission.');
    }
  }
  req.submission = submission;
  next();
});
export default LoadSubmission;