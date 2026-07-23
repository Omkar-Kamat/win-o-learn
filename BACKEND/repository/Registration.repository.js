import Registration from '../models/Registration.model.js';
import TeamRepository from './Team.repository.js';
// Creates a new. 
const create = registrationData => Registration.create(registrationData);
// Searches and retrieves by id. 
const findById = registrationId => Registration.findById(registrationId).populate({
  path: 'hackathon',
  populate: {
    path: 'organizer',
    select: 'name avatar'
  }
}).populate({
  path: 'team',
  populate: [{
    path: 'leader',
    select: 'name avatar'
  }, {
    path: 'members',
    select: 'name avatar'
  }]
});
// Searches and retrieves by hackathon and team. 
const findByHackathonAndTeam = (hackathonId, teamId) => Registration.findOne({
  hackathon: hackathonId,
  team: teamId
});
// Searches and retrieves by hackathon and user by executing underlying operations (findByMember). 
const findByHackathonAndUser = async (hackathonId, userId) => {
  const teams = await TeamRepository.findByMember(userId);
  const teamIds = teams.map(team => team._id);
  if (teamIds.length === 0) {
    return null;
  }
  return Registration.findOne({
    hackathon: hackathonId,
    team: {
      $in: teamIds
    }
  }).populate({
    path: 'team',
    populate: [{
      path: 'leader',
      select: 'name avatar'
    }, {
      path: 'members',
      select: 'name avatar'
    }]
  });
};
// Searches and retrieves all by hackathon. 
const findAllByHackathon = async (hackathonId, {
  status: status,
  page = 1,
  limit = 20
}) => {
  const filter = {
    hackathon: hackathonId
  };
  if (status) {
    filter.status = status;
  }
  const skip = (page - 1) * limit;
  const [registrations, total] = await Promise.all([Registration.find(filter).populate({
    path: 'team',
    populate: [{
      path: 'leader',
      select: 'name avatar'
    }, {
      path: 'members',
      select: 'name avatar'
    }]
  }).skip(skip).limit(limit).sort({
    createdAt: -1
  }), Registration.countDocuments(filter)]);
  return {
    registrations: registrations,
    total: total
  };
};
// Removes the specified by hackathon and team. 
const deleteByHackathonAndTeam = (hackathonId, teamId) => Registration.findOneAndDelete({
  hackathon: hackathonId,
  team: teamId
});
// Updates status. 
const setStatus = (registrationId, status, respondedBy) => Registration.findByIdAndUpdate(registrationId, {
  status: status,
  respondedBy: respondedBy,
  respondedAt: new Date()
}, {
  new: true
});
// Searches and retrieves by hackathon. 
const findByHackathon = hackathonId => Registration.find({
  hackathon: hackathonId,
  status: {
    $ne: 'rejected'
  }
}).populate({
  path: 'team',
  select: 'members'
});
// Existses by team. 
const existsByTeam = teamId => Registration.exists({
  team: teamId,
  status: {
    $ne: 'rejected'
  }
});
export default {
  create: create,
  findById: findById,
  findByHackathonAndTeam: findByHackathonAndTeam,
  findByHackathonAndUser: findByHackathonAndUser,
  findByHackathon: findByHackathon,
  findAllByHackathon: findAllByHackathon,
  deleteByHackathonAndTeam: deleteByHackathonAndTeam,
  setStatus: setStatus,
  existsByTeam: existsByTeam
};