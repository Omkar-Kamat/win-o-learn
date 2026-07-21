import Team from "../models/Team.model.js";

const create = (teamData) => Team.create(teamData);

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

export default {
  create,
  findById,
  findByLeader,
  findByMember,
  isMember,
};