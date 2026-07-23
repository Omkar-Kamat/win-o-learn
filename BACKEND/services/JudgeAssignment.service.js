import ApiError from "../utils/ApiError.js";

import UserRepository from "../repository/User.repository.js";
import JudgeAssignmentRepository from "../repository/JudgeAssignment.repository.js";

import { ROLES } from "../utils/Constants.js";

const assignJudge = async (
  hackathon,
  judgeId,
  assignedBy
) => {
  const judge = await UserRepository.findById(judgeId);

  if (!judge) {
    throw new ApiError(404, "Judge not found.");
  }

  if (judge.role !== ROLES.JUDGE) {
    throw new ApiError(
      400,
      "The selected user is not a judge."
    );
  }

  const existingAssignment =
    await JudgeAssignmentRepository.findByHackathonAndJudge(
      hackathon._id,
      judgeId
    );

  if (existingAssignment) {
    throw new ApiError(
      409,
      "Judge is already assigned to this hackathon."
    );
  }

  const assignment =
    await JudgeAssignmentRepository.create({
      hackathon: hackathon._id,
      judge: judgeId,
      assignedBy,
    });

  return JudgeAssignmentRepository.findById(
    assignment._id
  );
};

const removeJudge = async (
  hackathon,
  judgeId
) => {
  const assignment =
    await JudgeAssignmentRepository.deleteByHackathonAndJudge(
      hackathon._id,
      judgeId
    );

  if (!assignment) {
    throw new ApiError(
      404,
      "Judge assignment not found."
    );
  }

  // TODO:
  // SubmissionAssignmentService.redistribute(hackathon._id);

  return assignment;
};

const getHackathonJudges = async (
  hackathon
) => {
  return JudgeAssignmentRepository.findAllByHackathon(
    hackathon._id
  );
};

const getAssignedHackathons = async (
  judgeId
) => {
  return JudgeAssignmentRepository.findAllByJudge(
    judgeId
  );
};

export default {
  assignJudge,
  removeJudge,
  getHackathonJudges,
  getAssignedHackathons,
};