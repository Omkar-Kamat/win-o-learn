import Registration from "../models/Registration.model.js";

const create = (registrationData) =>
  Registration.create(registrationData);

const findById = (registrationId) =>
  Registration.findById(registrationId)
    .populate({
        path: "hackathon",
        populate: {
            path: "organizer",
            select: "name avatar",
        },
        })
    .populate({
      path: "team",
      populate: [
        {
          path: "leader",
          select: "name avatar",
        },
        {
          path: "members",
          select: "name avatar",
        },
      ],
    });

const findByHackathonAndTeam = (
  hackathonId,
  teamId
) =>
  Registration.findOne({
    hackathon: hackathonId,
    team: teamId,
  });

const findAllByHackathon = async (
  hackathonId,
  {
    status,
    page = 1,
    limit = 20,
  }
) => {
  const filter = {
    hackathon: hackathonId,
  };

  if (status) {
    filter.status = status;
  }

  const skip = (page - 1) * limit;

  const [registrations, total] =
    await Promise.all([
      Registration.find(filter)
        .populate({
          path: "team",
          populate: [
            {
              path: "leader",
              select: "name avatar",
            },
            {
              path: "members",
              select: "name avatar",
            },
          ],
        })
        .skip(skip)
        .limit(limit)
        .sort({
          createdAt: -1,
        }),

      Registration.countDocuments(filter),
    ]);

  return {
    registrations,
    total,
  };
};

const deleteByHackathonAndTeam = (
  hackathonId,
  teamId
) =>
  Registration.findOneAndDelete({
    hackathon: hackathonId,
    team: teamId,
  });

const setStatus = (
  registrationId,
  status,
  respondedBy
) =>
  Registration.findByIdAndUpdate(
    registrationId,
    {
      status,
      respondedBy,
      respondedAt: new Date(),
    },
    {
      new: true,
    }
  );

const findByHackathon = (hackathonId) =>
  Registration.find({
    hackathon: hackathonId,
  }).populate({
    path: "team",
    select: "members",
  });

const existsByTeam = (teamId) =>
  Registration.exists({
    team: teamId,
  });

export default {
  create,
  findById,
  findByHackathonAndTeam,
  findByHackathon,
  findAllByHackathon,
  deleteByHackathonAndTeam,
  setStatus,
  existsByTeam,
};