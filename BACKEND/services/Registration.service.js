import ApiError from '../utils/ApiError.js';
import RegistrationRepository from '../repository/Registration.repository.js';
// Registers for the team by executing underlying operations (findByHackathonAndTeam, findByHackathon, create). Includes validation checks preventing actions if registration is closed. or registration deadline has passed.. 
const registerTeam = async (hackathon, team, userId) => {
  if (!hackathon.registrationOpen) {
    throw new ApiError(400, 'Registration is closed.');
  }
  if (new Date() > hackathon.registrationDeadline) {
    throw new ApiError(400, 'Registration deadline has passed.');
  }
  if (!team.leader.equals(userId)) {
    throw new ApiError(403, 'Only the team leader can register the team.');
  }
  if (team.members.length > hackathon.maxTeamSize) {
    throw new ApiError(400, 'Team exceeds the maximum allowed size.');
  }
  const existingRegistration = await RegistrationRepository.findByHackathonAndTeam(hackathon._id, team._id);
  if (existingRegistration) {
    throw new ApiError(409, 'Team is already registered for this hackathon.');
  }
  const registrations = await RegistrationRepository.findByHackathon(hackathon._id);
  const teamMembers = team.members.map(m => String(m._id ?? m));
  for (const registration of registrations) {
    if (registration.status === 'rejected') {
      continue;
    }
    const registeredMembers = registration.team.members.map(String);
    const overlap = registeredMembers.some(member => teamMembers.includes(member));
    if (overlap) {
      throw new ApiError(409, 'One or more team members are already registered for this hackathon.');
    }
  }
  return await RegistrationRepository.create({
    hackathon: hackathon._id,
    team: team._id
  });
};
// Cancels registration by executing underlying operations (findByHackathonAndTeam, deleteByHackathonAndTeam). Includes validation checks preventing actions if only the team leader can cancel the registration. or registration not found.. 
const cancelRegistration = async (hackathon, team, userId) => {
  if (!team.leader.equals(userId)) {
    throw new ApiError(403, 'Only the team leader can cancel the registration.');
  }
  const registration = await RegistrationRepository.findByHackathonAndTeam(hackathon._id, team._id);
  if (!registration) {
    throw new ApiError(404, 'Registration not found.');
  }
  await RegistrationRepository.deleteByHackathonAndTeam(hackathon._id, team._id);
};
// Retrieves registration status by executing underlying operations (findByHackathonAndTeam). 
const getRegistrationStatus = async (hackathon, team) => {
  const registration = await RegistrationRepository.findByHackathonAndTeam(hackathon._id, team._id);
  if (!registration) {
    return {
      registered: false
    };
  }
  return {
    registered: true,
    status: registration.status
  };
};
// Retrieves hackathon registrations by executing underlying operations (findAllByHackathon). 
const getHackathonRegistrations = async (hackathon, filters = {}) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  const {
    registrations: registrations,
    total: total
  } = await RegistrationRepository.findAllByHackathon(hackathon._id, {
    ...filters,
    page: page,
    limit: limit
  });
  return {
    registrations: registrations,
    pagination: {
      totalRegistrations: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit: limit
    }
  };
};
// Approves registration by executing underlying operations (setStatus). 
const approveRegistration = async (registration, organizerId) => {
  if (registration.status !== 'pending') {
    throw new ApiError(400, `Registration is already ${registration.status}.`);
  }
  return await RegistrationRepository.setStatus(registration._id, 'approved', organizerId);
};
// Rejects registration by executing underlying operations (setStatus). 
const rejectRegistration = async (registration, organizerId) => {
  if (registration.status !== 'pending') {
    throw new ApiError(400, `Registration is already ${registration.status}.`);
  }
  return await RegistrationRepository.setStatus(registration._id, 'rejected', organizerId);
};
export default {
  registerTeam: registerTeam,
  cancelRegistration: cancelRegistration,
  getRegistrationStatus: getRegistrationStatus,
  getHackathonRegistrations: getHackathonRegistrations,
  approveRegistration: approveRegistration,
  rejectRegistration: rejectRegistration
};