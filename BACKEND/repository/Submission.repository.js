import Submission from "../models/Submission.model.js";
import Registration from "../models/Registration.model.js";
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

const findAllByHackathon = async (hackathonId) => {
  const registrations = await Registration.find({ hackathon: hackathonId }).select("_id");
  const registrationIds = registrations.map((r) => r._id);

  return Submission.find({ registration: { $in: registrationIds } })
    .populate({
      path: "registration",
      populate: [{ path: "team" }, { path: "hackathon" }],
    });
};

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

export default {
  create,
  findById,
  findByRegistration,
  findAllByHackathon,
  updateById,
};