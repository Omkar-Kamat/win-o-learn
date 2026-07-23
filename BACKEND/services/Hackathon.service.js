import HackathonRepository from '../repository/Hackathon.repository.js';
import ApiError from '../utils/ApiError.js';
import { DeleteImageFromCloudinary } from '../utils/Cloudinary.js';
// Creates a new hackathon by executing underlying operations (create). 
const createHackathon = async (data, organizerId) => await HackathonRepository.create({
  ...data,
  organizer: organizerId
});
// Retrieves hackathons by executing underlying operations (findAll). 
const getHackathons = async filters => {
  const page = filters.page ? Number(filters.page) : 1;
  const limit = filters.limit ? Number(filters.limit) : 20;
  const {
    hackathons: hackathons,
    total: total
  } = await HackathonRepository.findAll({
    ...filters,
    page: page,
    limit: limit
  });
  return {
    hackathons: hackathons,
    pagination: {
      totalHackathons: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit: limit
    }
  };
};
// Retrieves hackathon by id by executing underlying operations (findById). Validates inputs and throws an error if hackathon not found. 
const getHackathonById = async id => {
  const hackathon = await HackathonRepository.findById(id);
  if (!hackathon) {
    throw new ApiError(404, 'Hackathon not found');
  }
  return hackathon;
};
// Retrieves my hackathons by executing underlying operations (findByOrganizer). 
const getMyHackathons = async (organizerId, filters = {}) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  const {
    hackathons: hackathons,
    total: total
  } = await HackathonRepository.findByOrganizer(organizerId, {
    page: page,
    limit: limit
  });
  return {
    hackathons: hackathons,
    pagination: {
      totalHackathons: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit: limit
    }
  };
};
// Updates an existing hackathon by executing underlying operations (updateById). 
const updateHackathon = async (hackathon, data) => await HackathonRepository.updateById(hackathon._id, data);
// Removes the specified hackathon by executing underlying operations (deleteById). 
const deleteHackathon = async hackathon => {
  if (hackathon.bannerPublicId) {
    await DeleteImageFromCloudinary(hackathon.bannerPublicId);
  }
  await HackathonRepository.deleteById(hackathon._id);
  return null;
};
// Opens the registration by executing underlying operations (setRegistrationStatus). Includes validation checks preventing actions if registration is already open or registration deadline has already passed. 
const openRegistration = async hackathon => {
  if (hackathon.registrationOpen) {
    throw new ApiError(400, 'Registration is already open');
  }
  if (new Date() > hackathon.registrationDeadline) {
    throw new ApiError(400, 'Registration deadline has already passed');
  }
  if (new Date() >= hackathon.startDate) {
    throw new ApiError(400, 'Registration cannot be opened after the hackathon has started');
  }
  return await HackathonRepository.setRegistrationStatus(hackathon._id, true);
};
// Closes the registration by executing underlying operations (setRegistrationStatus). Validates inputs and throws an error if registration is already closed. 
const closeRegistration = async hackathon => {
  if (!hackathon.registrationOpen) {
    throw new ApiError(400, 'Registration is already closed');
  }
  return await HackathonRepository.setRegistrationStatus(hackathon._id, false);
};
// Publishes the results by executing underlying operations (publishResults). Validates inputs and throws an error if results are already published. 
const publishResults = async hackathon => {
  if (hackathon.resultsPublished) {
    throw new ApiError(400, 'Results are already published');
  }
  return await HackathonRepository.publishResults(hackathon._id);
};
// Updates an existing banner by executing underlying operations (updateBanner). Validates inputs and throws an error if banner image is required. 
const updateBanner = async (hackathon, file) => {
  if (!file) {
    throw new ApiError(400, 'Banner image is required');
  }
  if (hackathon.bannerPublicId) {
    await DeleteImageFromCloudinary(hackathon.bannerPublicId);
  }
  return await HackathonRepository.updateBanner(hackathon._id, file.path, file.filename);
};
export default {
  createHackathon: createHackathon,
  getHackathons: getHackathons,
  getHackathonById: getHackathonById,
  getMyHackathons: getMyHackathons,
  updateHackathon: updateHackathon,
  deleteHackathon: deleteHackathon,
  openRegistration: openRegistration,
  closeRegistration: closeRegistration,
  publishResults: publishResults,
  updateBanner: updateBanner
};