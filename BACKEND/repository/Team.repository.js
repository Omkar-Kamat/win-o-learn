/**
 * File: Team.repository.js
 * Description: Implementation of Team.repository.js
 */
import Team from '../models/Team.model.js';

// Creates a new create
const create = async (teamData) => {
    const team = await Team.create(teamData);

    return team.populate([
        {
            path: 'leader',
            select: 'name avatar',
        },
        {
            path: 'members',
            select: 'name avatar',
        },
    ]);
};


// Performs the find all operation
const findAll = async ({ search = '', page = 1, limit = 20, sort }) => {
    const filter = {};
    if (search) {
        filter.name = {
            $regex: search,
            $options: 'i',
        };
    }
    
    let sortOption = { createdAt: -1 };
    if (sort) {
        sortOption = {};
        if (sort.startsWith('-')) {
            sortOption[sort.substring(1)] = -1;
        } else {
            sortOption[sort] = 1;
        }
    }

    const teams = await Team.find(filter)
        .populate('leader', 'name avatar')
        .populate('members', 'name avatar')
        .sort(sortOption)
        .skip((page - 1) * limit)
        .limit(limit);
    const total = await Team.countDocuments(filter);

    return {
        teams,
        total,
    };
};


// Performs the find by id operation
const findById = (teamId) =>
    Team.findById(teamId).populate('leader', 'name avatar').populate('members', 'name avatar');

// Performs the find by leader operation
const findByLeader = (leaderId) =>
    Team.find({
        leader: leaderId,
    });

// Checks if member
const isMember = (teamId, userId) =>
    Team.exists({
        _id: teamId,
        members: userId,
    });

// Performs the find by member operation
const findByMember = (userId) =>
    Team.find({
        members: userId,
    });

// Updates the by id data
const updateById = (teamId, updates) =>
    Team.findByIdAndUpdate(teamId, updates, {
        new: true,
        runValidators: true,
    })
        .populate('leader', 'name avatar')
        .populate('members', 'name avatar');

// Removes the by id
const deleteById = (teamId) => Team.findByIdAndDelete(teamId);

// Creates a new invite
const addInvite = (teamId, invite) =>
    Team.findByIdAndUpdate(
        teamId,
        {
            $push: {
                pendingInvites: invite,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate('leader', 'name avatar')
        .populate('members', 'name avatar')
        .populate('pendingInvites.user', 'name email avatar')
        .populate('pendingInvites.invitedBy', 'name avatar');

// Removes the invite
const removeInvite = (teamId, userId) =>
    Team.findByIdAndUpdate(
        teamId,
        {
            $pull: {
                pendingInvites: {
                    user: userId,
                },
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate('leader', 'name avatar')
        .populate('members', 'name avatar')
        .populate('pendingInvites.user', 'name email avatar')
        .populate('pendingInvites.invitedBy', 'name avatar');

// Performs the accept invite operation
const acceptInvite = async (teamId, userId) => {
    const team = await Team.findById(teamId);
    team.pendingInvites = team.pendingInvites.filter((invite) => !invite.user.equals(userId));
    team.members.push(userId);
    await team.save();

    return Team.findById(teamId)
        .populate('leader', 'name avatar')
        .populate('members', 'name avatar')
        .populate('pendingInvites.user', 'name email avatar')
        .populate('pendingInvites.invitedBy', 'name avatar');
};


// Performs the transfer leadership operation
const transferLeadership = (teamId, newLeaderId) =>
    Team.findByIdAndUpdate(
        teamId,
        {
            leader: newLeaderId,
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate('leader', 'name avatar')
        .populate('members', 'name avatar')
        .populate('pendingInvites.user', 'name email avatar')
        .populate('pendingInvites.invitedBy', 'name avatar');

// Removes the member
const removeMember = (teamId, userId) =>
    Team.findByIdAndUpdate(
        teamId,
        {
            $pull: {
                members: userId,
            },
        },
        {
            new: true,
            runValidators: true,
        }
    )
        .populate('leader', 'name avatar')
        .populate('members', 'name avatar')
        .populate('pendingInvites.user', 'name email avatar')
        .populate('pendingInvites.invitedBy', 'name avatar');

export default {
    create,
    findAll,
    findById,
    findByLeader,
    findByMember,
    isMember,
    updateById,
    deleteById,
    addInvite,
    removeInvite,
    acceptInvite,
    transferLeadership,
    removeMember,
};
