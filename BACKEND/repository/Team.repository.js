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

export default {
  create,
  findById,
  findByLeader,
  findByMember,
  isMember,
  updateById,
  deleteById,
};