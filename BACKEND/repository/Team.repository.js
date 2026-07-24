import Team from '../models/Team.model.js';
// Creates a new. 
const create = async teamData => {
  const team = await Team.create(teamData);
  return team.populate([{
    path: 'leader',
    select: 'name avatar'
  }, {
    path: 'members',
    select: 'name avatar'
  }]);
};
// Searches and retrieves all. 
const findAll = async ({
  search = '',
  page = 1,
  limit = 20,
  sort: sort
}) => {
  const filter = {};
  if (search) {
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.name = {
      $regex: escapedSearch,
      $options: 'i'
    };
  }
  let sortOption = {
    createdAt: -1
  };
  if (sort) {
    sortOption = {};
    if (sort.startsWith('-')) {
      sortOption[sort.substring(1)] = -1;
    } else {
      sortOption[sort] = 1;
    }
  }
  const parsedPage = Math.max(1, Number(page) || 1);
  const parsedLimit = Math.min(100, Math.max(1, Number(limit) || 20));

  const teams = await Team.find(filter).populate('leader', 'name avatar').populate('members', 'name avatar').sort(sortOption).skip((parsedPage - 1) * parsedLimit).limit(parsedLimit);
  const total = await Team.countDocuments(filter);
  return {
    teams: teams,
    total: total
  };
};
// Searches and retrieves by id. 
const findById = teamId => Team.findById(teamId).populate('leader', 'name avatar').populate('members', 'name avatar');
// Searches and retrieves by leader. 
const findByLeader = leaderId => Team.find({
  leader: leaderId
});
// Determines if it is member. 
const isMember = (teamId, userId) => Team.exists({
  _id: teamId,
  members: userId
});
// Searches and retrieves by member. 
const findByMember = userId => Team.find({
  members: userId
});
// Updates an existing by id. 
const updateById = (teamId, updates) => Team.findByIdAndUpdate(teamId, updates, {
  new: true,
  runValidators: true
}).populate('leader', 'name avatar').populate('members', 'name avatar');
// Removes the specified by id. 
const deleteById = teamId => Team.findByIdAndDelete(teamId);
// Adds a new invite. 
const addInvite = (teamId, invite) => Team.findByIdAndUpdate(teamId, {
  $push: {
    pendingInvites: invite
  }
}, {
  new: true,
  runValidators: true
}).populate('leader', 'name avatar').populate('members', 'name avatar').populate('pendingInvites.user', 'name email avatar').populate('pendingInvites.invitedBy', 'name avatar');
// Removes the specified invite. 
const removeInvite = (teamId, userId) => Team.findByIdAndUpdate(teamId, {
  $pull: {
    pendingInvites: {
      user: userId
    }
  }
}, {
  new: true,
  runValidators: true
}).populate('leader', 'name avatar').populate('members', 'name avatar').populate('pendingInvites.user', 'name email avatar').populate('pendingInvites.invitedBy', 'name avatar');
// Accepts invite. 
const acceptInvite = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  team.pendingInvites = team.pendingInvites.filter(invite => !invite.user.equals(userId));
  team.members.push(userId);
  await team.save();
  return Team.findById(teamId).populate('leader', 'name avatar').populate('members', 'name avatar').populate('pendingInvites.user', 'name email avatar').populate('pendingInvites.invitedBy', 'name avatar');
};
// Transfers leadership. 
const transferLeadership = (teamId, newLeaderId) => Team.findByIdAndUpdate(teamId, {
  leader: newLeaderId
}, {
  new: true,
  runValidators: true
}).populate('leader', 'name avatar').populate('members', 'name avatar').populate('pendingInvites.user', 'name email avatar').populate('pendingInvites.invitedBy', 'name avatar');
// Removes the specified member. 
const removeMember = (teamId, userId) => Team.findByIdAndUpdate(teamId, {
  $pull: {
    members: userId
  }
}, {
  new: true,
  runValidators: true
}).populate('leader', 'name avatar').populate('members', 'name avatar').populate('pendingInvites.user', 'name email avatar').populate('pendingInvites.invitedBy', 'name avatar');
export default {
  create: create,
  findAll: findAll,
  findById: findById,
  findByLeader: findByLeader,
  findByMember: findByMember,
  isMember: isMember,
  updateById: updateById,
  deleteById: deleteById,
  addInvite: addInvite,
  removeInvite: removeInvite,
  acceptInvite: acceptInvite,
  transferLeadership: transferLeadership,
  removeMember: removeMember
};