import Hackathon from "../models/Hackathon.model.js";

const create = (hackathonData) => {
  return Hackathon.create(hackathonData);
};

const findById = (id) => {
  return Hackathon.findById(id).populate(
    "organizer",
    "name avatar"
  );
};

const findAll = async ({
  search = "",
  mode,
  registrationOpen,
  timeStatus,
  page = 1,
  limit = 20,
}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      {
        title: {
          $regex: search,
          $options: "i",
        },
      },
      {
        theme: {
          $regex: search,
          $options: "i",
        },
      },
    ];
  }

  if (mode) {
    filter.mode = mode;
  }

  if (typeof registrationOpen !== "undefined") {
    filter.registrationOpen = registrationOpen;
  }

  const now = new Date();

  if (timeStatus === "upcoming") {
    filter.startDate = { $gt: now };
  }

  if (timeStatus === "ongoing") {
    filter.startDate = { $lte: now };
    filter.endDate = { $gte: now };
  }

  if (timeStatus === "completed") {
    filter.endDate = { $lt: now };
  }

  const hackathons = await Hackathon.find(filter)
    .populate("organizer", "name avatar")
    .sort({ startDate: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Hackathon.countDocuments(filter);

  return {
    hackathons,
    total,
  };
};

const findByOrganizer = async (
  organizerId,
  {page = 1,
  limit = 20} = {}
) => {
  const hackathons = await Hackathon.find({
    organizer: organizerId,
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await Hackathon.countDocuments({
    organizer: organizerId,
  });

  return {
    hackathons,
    total,
  };
};

const updateById = (id, fields) => {
  return Hackathon.findByIdAndUpdate(
    id,
    fields,
    {
      new: true,
      runValidators: true,
    }
  );
};

const deleteById = (id) => {
  return Hackathon.findByIdAndDelete(id);
};

const setRegistrationStatus = (
  id,
  registrationOpen
) => {
  return Hackathon.findByIdAndUpdate(
    id,
    { registrationOpen },
    {
      new: true,
      runValidators: true,
    }
  );
};

const publishResults = (id) => {
  return Hackathon.findByIdAndUpdate(
    id,
    {
      resultsPublished: true,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

const updateBanner = (
  id,
  banner,
  bannerPublicId
) => {
  return Hackathon.findByIdAndUpdate(
    id,
    {
      banner,
      bannerPublicId,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

export default {
  create,
  findById,
  findAll,
  findByOrganizer,
  updateById,
  deleteById,
  setRegistrationStatus,
  publishResults,
  updateBanner,
};