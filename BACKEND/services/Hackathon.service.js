import HackathonRepository from "../repository/Hackathon.repository.js";
import ApiError from "../utils/ApiError.js";
import { DeleteImageFromCloudinary } from "../utils/Cloudinary.js";

const createHackathon = async (data, organizerId) => {
  return await HackathonRepository.create({
    ...data,
    organizer: organizerId,
  });
};

const getHackathons = async (filters) => {
  return await HackathonRepository.findAll(filters);
};

const getHackathonById = async (id) => {
  const hackathon = await HackathonRepository.findById(id);

  if (!hackathon) {
    throw new ApiError(404, "Hackathon not found");
  }

  return hackathon;
};

const getMyHackathons = async (
  organizerId,
  page,
  limit
) => {
  return await HackathonRepository.findByOrganizer(
    organizerId,
    { page, limit }
  );
};

const updateHackathon = async (hackathon, data) => {
  return await HackathonRepository.updateById(
    hackathon._id,
    data
  );
};

const deleteHackathon = async (hackathon) => {
  if (hackathon.bannerPublicId) {
    await DeleteImageFromCloudinary(
      hackathon.bannerPublicId
    );
  }

  await HackathonRepository.deleteById(hackathon._id);

  return null;
};

const openRegistration = async (hackathon) => {
  if (hackathon.registrationOpen) {
    throw new ApiError(400, "Registration is already open");
  }

  if (new Date() > hackathon.registrationDeadline) {
    throw new ApiError(
      400,
      "Registration deadline has already passed"
    );
  }

  if (new Date() >= hackathon.startDate) {
    throw new ApiError(
        400,
        "Registration cannot be opened after the hackathon has started"
    );
  }

  return await HackathonRepository.setRegistrationStatus(
    hackathon._id,
    true
  );
};

const closeRegistration = async (hackathon) => {
  if (!hackathon.registrationOpen) {
    throw new ApiError(
      400,
      "Registration is already closed"
    );
  }

  return await HackathonRepository.setRegistrationStatus(
    hackathon._id,
    false
  );
};

const publishResults = async (hackathon) => {
  if (hackathon.resultsPublished) {
    throw new ApiError(
      400,
      "Results are already published"
    );
  }

  return await HackathonRepository.publishResults(
    hackathon._id
  );
};

const updateBanner = async (
  hackathon,
  banner,
  bannerPublicId
) => {
  if (hackathon.bannerPublicId) {
    await DeleteImageFromCloudinary(
      hackathon.bannerPublicId
    );
  }

  return await HackathonRepository.updateBanner(
    hackathon._id,
    banner,
    bannerPublicId
  );
};

export default {
  createHackathon,
  getHackathons,
  getHackathonById,
  getMyHackathons,
  updateHackathon,
  deleteHackathon,
  openRegistration,
  closeRegistration,
  publishResults,
  updateBanner,
};