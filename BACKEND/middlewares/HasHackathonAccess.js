import AsyncHandler from './AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import JudgeAssignmentRepository from '../repository/JudgeAssignment.repository.js';
import { ROLES } from '../utils/Constants.js';
// Determines if it has hackathon access by executing underlying operations (findByHackathonAndJudge). Includes validation checks preventing actions if unable to determine the hackathon for authorization. or you are not authorized to access this resource.. 
const HasHackathonAccess = ({
  allowAdmin = false,
  allowOrganizer = false,
  allowJudge = false
} = {}) => AsyncHandler(async (req, res, next) => {
  const {
    user: user
  } = req;
  let hackathon = null;
  if (req.hackathon) {
    hackathon = req.hackathon;
  } else if (req.submission?.registration?.hackathon) {
    hackathon = req.submission.registration.hackathon;
  } else if (req.review?.hackathon) {
    hackathon = req.review.hackathon;
  }
  if (!hackathon) {
    throw new ApiError(500, 'Unable to determine the hackathon for authorization.');
  }
  if (allowAdmin && user.role === ROLES.ADMIN) {
    return next();
  }
  if (allowOrganizer && user.role === ROLES.ORGANIZER) {
    const organizerId = String(hackathon.organizer._id || hackathon.organizer);
    if (organizerId === String(user._id)) {
      return next();
    }
  }
  if (allowJudge && user.role === ROLES.JUDGE) {
    const assignment = await JudgeAssignmentRepository.findByHackathonAndJudge(hackathon._id, user._id);
    if (assignment) {
      return next();
    }
  }
  throw new ApiError(403, 'You are not authorized to access this resource.');
});
export default HasHackathonAccess;