import Submission from "../models/Submission.model.js";

const create = (data) =>
  Submission.create(data);

const findById = (id) =>
  Submission.findById(id)
    .populate({
      path: "registration",
      populate: [
        {
          path: "team",
        },
        {
          path: "hackathon",
        },
      ],
    });

const findByRegistration = (registrationId) =>
  Submission.findOne({
    registration: registrationId,
  }).populate({
    path: "registration",
    populate: [
      {
        path: "team",
      },
      {
        path: "hackathon",
      },
    ],
  });

const findAllByHackathon = (hackathonId) =>
  Submission.find()
    .populate({
      path: "registration",
      match: {
        hackathon: hackathonId,
      },
      populate: {
        path: "team",
      },
    });

const updateById = (id, data) =>
  Submission.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  ).populate({
    path: "registration",
    populate: [
      {
        path: "team",
      },
      {
        path: "hackathon",
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
  })
    .populate("hackathon")
    .populate("team");

export default {
  create,
  findById,
  findByRegistration,
  findAllByHackathon,
  findByHackathonAndTeam,
  updateById,
};