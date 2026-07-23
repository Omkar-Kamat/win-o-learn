import TeamRepository from '../repository/Team.repository.js';
import RegistrationRepository from '../repository/Registration.repository.js';
import ApiError from '../utils/ApiError.js';
import UserRepository from '../repository/User.repository.js';
// Creates a new team by executing underlying operations (create). 
const createTeam = async (userId, teamData) => {
  const members = [userId.toString(), ...(teamData.members ?? []).map(String)];
  const uniqueMembers = [...new Set(members)];
  return await TeamRepository.create({
    name: teamData.name,
    leader: userId,
    members: uniqueMembers
  });
};
// Retrieves teams by executing underlying operations (findAll). 
const getTeams = async queryParams => await TeamRepository.findAll(queryParams);
// Retrieves team by id. 
const getTeamById = async team => team;
// Updates an existing team by executing underlying operations (updateById). 
const updateTeam = async (team, updates) => await TeamRepository.updateById(team._id, updates);
// Removes the specified team by executing underlying operations (existsByTeam, deleteById). Validates inputs and throws an error if cannot delete a team with existing registrations.. 
const deleteTeam = async team => {
  const hasRegistration = await RegistrationRepository.existsByTeam(team._id);
  if (hasRegistration) {
    throw new ApiError(400, 'Cannot delete a team with existing registrations.');
  }
  await TeamRepository.deleteById(team._id);
};
// Invites member by executing underlying operations (findByEmail, addInvite). Includes validation checks preventing actions if user not found. or leader cannot be invited.. 
const inviteMember = async (team, email, invitedBy) => {
  const user = await UserRepository.findByEmail(email);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  if (String(user._id) === String(team.leader._id ?? team.leader)) {
    throw new ApiError(400, 'Leader cannot be invited.');
  }
  const isMember = team.members.some(member => String(member._id ?? member) === String(user._id));
  if (isMember) {
    throw new ApiError(400, 'User is already a team member.');
  }
  const alreadyInvited = team.pendingInvites.some(invite => String(invite.user._id ?? invite.user) === String(user._id));
  if (alreadyInvited) {
    throw new ApiError(400, 'User already has a pending invite.');
  }
  return TeamRepository.addInvite(team._id, {
    user: user._id,
    invitedBy: invitedBy
  });
};
// Accepts invite by executing underlying operations (acceptInvite). Validates inputs and throws an error if invite not found.. 
const acceptInvite = async (team, userId) => {
  const invite = team.pendingInvites.find(invite => String(invite.user._id ?? invite.user) === String(userId));
  if (!invite) {
    throw new ApiError(404, 'Invite not found.');
  }
  return TeamRepository.acceptInvite(team._id, userId);
};
// Rejects invite by executing underlying operations (removeInvite). Validates inputs and throws an error if invite not found.. 
const rejectInvite = async (team, userId) => {
  const invite = team.pendingInvites.find(invite => String(invite.user._id ?? invite.user) === String(userId));
  if (!invite) {
    throw new ApiError(404, 'Invite not found.');
  }
  return TeamRepository.removeInvite(team._id, userId);
};
// Transfers leadership by executing underlying operations (findById, transferLeadership). Includes validation checks preventing actions if user is already the team leader. or user not found.. 
const transferLeadership = async (team, newLeaderId) => {
  const leaderId = team.leader._id ?? team.leader;
  if (leaderId.equals(newLeaderId)) {
    throw new ApiError(400, 'User is already the team leader.');
  }
  const user = await UserRepository.findById(newLeaderId);
  if (!user) {
    throw new ApiError(404, 'User not found.');
  }
  const isMember = team.members.some(member => String(member._id ?? member) === String(newLeaderId));
  if (!isMember) {
    throw new ApiError(400, 'New leader must be a team member.');
  }
  return TeamRepository.transferLeadership(team._id, newLeaderId);
};
// Leaves team by executing underlying operations (removeMember). Includes validation checks preventing actions if leader must transfer leadership before leaving the team. or user is not a team member.. 
const leaveTeam = async (team, userId) => {
  const leaderId = team.leader._id ?? team.leader;
  if (leaderId.equals(userId)) {
    throw new ApiError(400, 'Leader must transfer leadership before leaving the team.');
  }
  const isMember = team.members.some(member => (member._id ?? member).equals(userId));
  if (!isMember) {
    throw new ApiError(400, 'User is not a team member.');
  }
  return TeamRepository.removeMember(team._id, userId);
};
// Removes the specified member by executing underlying operations (findById, removeMember). Includes validation checks preventing actions if user not found. or team leader cannot be removed.. 
const removeMember = async (team, userId) => {
  const member = await UserRepository.findById(userId);
  if (!member) {
    throw new ApiError(404, 'User not found.');
  }
  if (String(team.leader._id ?? team.leader) === String(userId)) {
    throw new ApiError(400, 'Team leader cannot be removed.');
  }
  const isMember = team.members.some(member => String(member._id ?? member) === String(userId));
  if (!isMember) {
    throw new ApiError(400, 'User is not a team member.');
  }
  return TeamRepository.removeMember(team._id, userId);
};
export default {
  createTeam: createTeam,
  getTeams: getTeams,
  getTeamById: getTeamById,
  updateTeam: updateTeam,
  deleteTeam: deleteTeam,
  inviteMember: inviteMember,
  acceptInvite: acceptInvite,
  rejectInvite: rejectInvite,
  transferLeadership: transferLeadership,
  leaveTeam: leaveTeam,
  removeMember: removeMember
};