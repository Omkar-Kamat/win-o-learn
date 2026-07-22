import ApiError from "../utils/ApiError.js";

import SubmissionRepository from "../repository/Submission.repository.js";

const createSubmission = async (
  hackathon,
  registration,
  body
) => {
  if (registration.status !== "approved") {
     throw new ApiError(400, "Only approved teams can submit a project.");
   }

  const deadline = hackathon.submissionDeadline;

  if (
    deadline &&
    new Date() > new Date(deadline)
  ) {
    throw new ApiError(
      400,
      "Submission deadline has passed."
    );
  }

  const existing =
    await SubmissionRepository.findByRegistration(
      registration._id
    );

  if (existing) {
    throw new ApiError(
      400,
      "Submission already exists."
    );
  }

  return SubmissionRepository.create({
    registration: registration._id,
    ...body,
  });
};

const getMySubmission = async (
  registration
) => {
  const submission =
    await SubmissionRepository.findByRegistration(
      registration._id
    );

  if (!submission) {
    throw new ApiError(
      404,
      "Submission not found."
    );
  }

  return submission;
};

const updateSubmission = async (
  submission,
  body
) => {
  const deadline =
    submission.registration.hackathon.submissionDeadline;

  if (
    deadline &&
    new Date() > new Date(deadline)
  ) {
    throw new ApiError(
      400,
      "Submission deadline has passed."
    );
  }

  return SubmissionRepository.updateById(
    submission._id,
    body
  );
};

const updateSubmissionFiles = async (
  submission,
  files
) => {
  const deadline =
    submission.registration.hackathon.submissionDeadline;

  if (
    deadline &&
    new Date() > new Date(deadline)
  ) {
    throw new ApiError(
      400,
      "Submission deadline has passed."
    );
  }

  return SubmissionRepository.updateById(
    submission._id,
    files
  );
};

const getHackathonSubmissions = async (
  hackathonId
) => {
  return SubmissionRepository.findAllByHackathon(
    hackathonId
  );
};

const updateSubmissionStatus = async (
  submission,
  status
) => {
  return SubmissionRepository.updateById(
    submission._id,
    { status }
  );
};

export default {
  createSubmission,
  getMySubmission,
  updateSubmission,
  updateSubmissionFiles,
  getHackathonSubmissions,
  updateSubmissionStatus,
};