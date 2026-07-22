import TeamRepository from "../repository/Team.repository.js";
import RegistrationRepository from "../repository/Registration.repository.js";
import ApiError from "../utils/ApiError.js";

const createTeam = async (userId, teamData) => {
  const members = [
    userId.toString(),
    ...(teamData.members ?? []).map(String),
  ];

  const uniqueMembers = [...new Set(members)];

  return await TeamRepository.create({
    name: teamData.name,
    leader: userId,
    members: uniqueMembers,
  });
};

const getTeamById = async (team) => {
  return team;
};

const updateTeam = async (team, updates) => {
  return await TeamRepository.updateById(
    team._id,
    updates
  );
};

const deleteTeam = async (team) => {
  const hasRegistration =
    await RegistrationRepository.existsByTeam(
      team._id
    );

  if (hasRegistration) {
    throw new ApiError(
      400,
      "Cannot delete a team with existing registrations."
    );
  }

  await TeamRepository.deleteById(team._id);
};

export default {
  createTeam,
  getTeamById,
  updateTeam,
  deleteTeam,
};