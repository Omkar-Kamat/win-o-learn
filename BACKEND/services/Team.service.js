import TeamRepository from "../repository/Team.repository.js";
import RegistrationRepository from "../repository/Registration.repository.js";
import ApiError from "../utils/ApiError.js";
import UserRepository from "../repository/User.repository.js";

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

const inviteMember = async (team, email, invitedBy) => {
  const user = await UserRepository.findByEmail(email);

  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  if (String(user._id) === String(team.leader._id ?? team.leader)) {
    throw new ApiError(400, "Leader cannot be invited.");
  }

  const isMember = team.members.some(
    (member) => String(member._id ?? member) === String(user._id)
  );

  if (isMember) {
    throw new ApiError(400, "User is already a team member.");
  }

  const alreadyInvited = team.pendingInvites.some(
    (invite) => String(invite.user._id ?? invite.user) === String(user._id)
  );

  if (alreadyInvited) {
    throw new ApiError(400, "User already has a pending invite.");
  }

  return TeamRepository.addInvite(team._id, {
    user: user._id,
    invitedBy,
  });
};

const acceptInvite = async (team, userId) => {
  const invite = team.pendingInvites.find(
    (invite) => String(invite.user._id ?? invite.user) === String(userId)
  );

  if (!invite) {
    throw new ApiError(404, "Invite not found.");
  }

  return TeamRepository.acceptInvite(team._id, userId);
};

const rejectInvite = async (team, userId) => {
  const invite = team.pendingInvites.find(
    (invite) => String(invite.user._id ?? invite.user) === String(userId)
  );

  if (!invite) {
    throw new ApiError(404, "Invite not found.");
  }

  return TeamRepository.removeInvite(team._id, userId);
};

export default {
  createTeam,
  getTeamById,
  updateTeam,
  deleteTeam,
  inviteMember,
  acceptInvite,
  rejectInvite,
};