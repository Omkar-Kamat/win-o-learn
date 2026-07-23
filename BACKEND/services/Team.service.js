/**
 * File: Team.service.js
 * Description: Implementation of Team.service.js
 */
import TeamRepository from '../repository/Team.repository.js';
import RegistrationRepository from '../repository/Registration.repository.js';
import ApiError from '../utils/ApiError.js';
import UserRepository from '../repository/User.repository.js';

// Creates a new team
const createTeam = async (userId, teamData) => {
    const members = [userId.toString(), ...(teamData.members ?? []).map(String)];
    const uniqueMembers = [...new Set(members)];

    return await TeamRepository.create({
        name: teamData.name,
        leader: userId,
        members: uniqueMembers,
    });
};


// Retrieves the team by id data
const getTeamById = async (team) => {
    return team;
};


// Updates the team data
const updateTeam = async (team, updates) => {
    return await TeamRepository.updateById(team._id, updates);
};


// Removes the team
const deleteTeam = async (team) => {
    const hasRegistration = await RegistrationRepository.existsByTeam(team._id);
    if (hasRegistration) {
        throw new ApiError(400, 'Cannot delete a team with existing registrations.');
    }
    await TeamRepository.deleteById(team._id);
};


// Performs the invite member operation
const inviteMember = async (team, email, invitedBy) => {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
        throw new ApiError(404, 'User not found.');
    }
    if (String(user._id) === String(team.leader._id ?? team.leader)) {
        throw new ApiError(400, 'Leader cannot be invited.');
    }

    // Checks if member
    const isMember = team.members.some(
        (member) => String(member._id ?? member) === String(user._id)
    );
    if (isMember) {
        throw new ApiError(400, 'User is already a team member.');
    }

    // Performs the already invited operation
    const alreadyInvited = team.pendingInvites.some(
        (invite) => String(invite.user._id ?? invite.user) === String(user._id)
    );
    if (alreadyInvited) {
        throw new ApiError(400, 'User already has a pending invite.');
    }

    return TeamRepository.addInvite(team._id, {
        user: user._id,
        invitedBy,
    });
};


// Performs the accept invite operation
const acceptInvite = async (team, userId) => {
    // Performs the invite operation
    const invite = team.pendingInvites.find(
        (invite) => String(invite.user._id ?? invite.user) === String(userId)
    );
    if (!invite) {
        throw new ApiError(404, 'Invite not found.');
    }

    return TeamRepository.acceptInvite(team._id, userId);
};


// Performs the reject invite operation
const rejectInvite = async (team, userId) => {
    // Performs the invite operation
    const invite = team.pendingInvites.find(
        (invite) => String(invite.user._id ?? invite.user) === String(userId)
    );
    if (!invite) {
        throw new ApiError(404, 'Invite not found.');
    }

    return TeamRepository.removeInvite(team._id, userId);
};


// Performs the transfer leadership operation
const transferLeadership = async (team, newLeaderId) => {
    const leaderId = team.leader._id ?? team.leader;
    if (leaderId.equals(newLeaderId)) {
        throw new ApiError(400, 'User is already the team leader.');
    }
    const user = await UserRepository.findById(newLeaderId);
    if (!user) {
        throw new ApiError(404, 'User not found.');
    }

    // Checks if member
    const isMember = team.members.some(
        (member) => String(member._id ?? member) === String(newLeaderId)
    );
    if (!isMember) {
        throw new ApiError(400, 'New leader must be a team member.');
    }

    return TeamRepository.transferLeadership(team._id, newLeaderId);
};


// Performs the leave team operation
const leaveTeam = async (team, userId) => {
    const leaderId = team.leader._id ?? team.leader;
    if (leaderId.equals(userId)) {
        throw new ApiError(400, 'Leader must transfer leadership before leaving the team.');
    }

    // Checks if member
    const isMember = team.members.some((member) => (member._id ?? member).equals(userId));
    if (!isMember) {
        throw new ApiError(400, 'User is not a team member.');
    }

    return TeamRepository.removeMember(team._id, userId);
};


// Removes the member
const removeMember = async (team, userId) => {
    const member = await UserRepository.findById(userId);
    if (!member) {
        throw new ApiError(404, 'User not found.');
    }
    if (String(team.leader._id ?? team.leader) === String(userId)) {
        throw new ApiError(400, 'Team leader cannot be removed.');
    }

    // Checks if member
    const isMember = team.members.some((member) => String(member._id ?? member) === String(userId));
    if (!isMember) {
        throw new ApiError(400, 'User is not a team member.');
    }

    return TeamRepository.removeMember(team._id, userId);
};


export default {
    createTeam,
    getTeamById,
    updateTeam,
    deleteTeam,
    inviteMember,
    acceptInvite,
    rejectInvite,
    transferLeadership,
    leaveTeam,
    removeMember,
};
