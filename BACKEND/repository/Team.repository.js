import Team from "../models/Team.model.js";

const create = async (teamData) => {
  const team = await Team.create(teamData);

  return team.populate([
    { path: "leader", select: "name avatar" },
    { path: "members", select: "name avatar" },
  ]);
};

const findById = (teamId) =>
  Team.findById(teamId)
    .populate("leader", "name avatar")
    .populate("members", "name avatar");

const findByLeader = (leaderId) =>
  Team.find({ leader: leaderId });

const isMember = (teamId, userId) =>
  Team.exists({
    _id: teamId,
    members: userId,
  });

const findByMember = (userId) =>
  Team.find({
    members: userId,
  });

const updateById = (teamId, updates) =>
  Team.findByIdAndUpdate(
    teamId,
    updates,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("leader", "name avatar")
    .populate("members", "name avatar");

const deleteById = (teamId) =>
  Team.findByIdAndDelete(teamId);

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
    .populate("leader", "name avatar")
    .populate("members", "name avatar")
    .populate("pendingInvites.user", "name email avatar")
    .populate("pendingInvites.invitedBy", "name avatar");

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
    .populate("leader", "name avatar")
    .populate("members", "name avatar")
    .populate("pendingInvites.user", "name email avatar")
    .populate("pendingInvites.invitedBy", "name avatar");

const acceptInvite = async (teamId, userId) => {
  const team = await Team.findById(teamId);

  team.pendingInvites = team.pendingInvites.filter(
    (invite) => !invite.user.equals(userId)
  );

  team.members.push(userId);

  await team.save();

  return Team.findById(teamId)
    .populate("leader", "name avatar")
    .populate("members", "name avatar")
    .populate("pendingInvites.user", "name email avatar")
    .populate("pendingInvites.invitedBy", "name avatar");
};

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
    .populate("leader", "name avatar")
    .populate("members", "name avatar")
    .populate("pendingInvites.user", "name email avatar")
    .populate("pendingInvites.invitedBy", "name avatar");

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
    .populate("leader", "name avatar")
    .populate("members", "name avatar")
    .populate("pendingInvites.user", "name email avatar")
    .populate("pendingInvites.invitedBy", "name avatar");

export default {
  create,
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