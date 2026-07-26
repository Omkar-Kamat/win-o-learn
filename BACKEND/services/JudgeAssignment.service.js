import ApiError from '../utils/ApiError.js';
import UserRepository from '../repository/User.repository.js';
import JudgeAssignmentRepository from '../repository/JudgeAssignment.repository.js';
import { ROLES } from '../utils/Constants.js';
// Assigns judge by executing underlying operations (findByEmail, findByHackathonAndJudge, create). Includes validation checks preventing actions if judge not found. or the selected user is not a judge.. 
const assignJudge = async (hackathon, email, assignedBy) => {
  const judge = await UserRepository.findByEmail(email);
  if (!judge) {
    throw new ApiError(404, 'Judge not found.');
  }
  if (judge.role !== ROLES.JUDGE) {
    throw new ApiError(400, 'The selected user is not a judge.');
  }
  const existingAssignment = await JudgeAssignmentRepository.findByHackathonAndJudge(hackathon._id, judge._id);
  if (existingAssignment) {
    throw new ApiError(409, 'Judge is already assigned to this hackathon.');
  }
  const assignment = await JudgeAssignmentRepository.create({
    hackathon: hackathon._id,
    judge: judge._id,
    assignedBy: assignedBy
  });
  return JudgeAssignmentRepository.findById(assignment._id);
};
// Removes the specified judge by executing underlying operations (deleteByHackathonAndJudge). Validates inputs and throws an error if judge assignment not found.. 
const removeJudge = async (hackathon, judgeId) => {
  const assignment = await JudgeAssignmentRepository.deleteByHackathonAndJudge(hackathon._id, judgeId);
  if (!assignment) {
    throw new ApiError(404, 'Judge assignment not found.');
  }
  return assignment;
};
// Retrieves hackathon judges by executing underlying operations (findAllByHackathon). 
const getHackathonJudges = async hackathon => JudgeAssignmentRepository.findAllByHackathon(hackathon._id);
// Retrieves assigned hackathons by executing underlying operations (findAllByJudge). 
const getAssignedHackathons = async judgeId => JudgeAssignmentRepository.findAllByJudge(judgeId);
export default {
  assignJudge: assignJudge,
  removeJudge: removeJudge,
  getHackathonJudges: getHackathonJudges,
  getAssignedHackathons: getAssignedHackathons
};