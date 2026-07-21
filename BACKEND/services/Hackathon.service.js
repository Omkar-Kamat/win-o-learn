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
  const page = filters.page ? Number(filters.page) : 1;
  const limit = filters.limit ? Number(filters.limit) : 20;

  const { hackathons, total } =
    await HackathonRepository.findAll({
      ...filters,
      page,
      limit,
    });

  return {
    hackathons,
    pagination: {
      totalHackathons: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
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
  filters = {}
) => {
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;

  const { hackathons, total } =
    await HackathonRepository.findByOrganizer(
      organizerId,
      {
        page,
        limit,
      }
    );

  return {
    hackathons,
    pagination: {
      totalHackathons: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit,
    },
  };
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

const updateBanner = async (hackathon, file) => {
  if (!file) {
    throw new ApiError(400, "Banner image is required");
  }

  if (hackathon.bannerPublicId) {
    await DeleteImageFromCloudinary(hackathon.bannerPublicId);
  }

  return await HackathonRepository.updateBanner(hackathon._id, file.path, file.filename);
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