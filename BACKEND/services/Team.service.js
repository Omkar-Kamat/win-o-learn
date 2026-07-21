import TeamRepository from "../repository/Team.repository.js";

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

export default {
  createTeam,
};