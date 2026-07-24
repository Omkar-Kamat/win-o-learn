import ApiError from '../utils/ApiError.js';
import SubmissionRepository from '../repository/Submission.repository.js';
import HackathonRepository from '../repository/Hackathon.repository.js';
import JudgeAssignmentRepository from '../repository/JudgeAssignment.repository.js';
import RegistrationRepository from '../repository/Registration.repository.js';
// Creates a new submission by executing underlying operations (findByRegistration, create). Includes validation checks preventing actions if only approved teams can submit a project. or submission deadline has passed.. 
const createSubmission = async (hackathon, registration, body) => {
  if (registration.status !== 'approved') {
    throw new ApiError(400, 'Only approved teams can submit a project.');
  }
  const deadline = hackathon.submissionDeadline;
  if (deadline && new Date() > new Date(deadline)) {
    throw new ApiError(400, 'Submission deadline has passed.');
  }
  const existing = await SubmissionRepository.findByRegistration(registration._id);
  if (existing) {
    throw new ApiError(400, 'Submission already exists.');
  }
  return SubmissionRepository.create({
    registration: registration._id,
    ...body
  });
};
// Retrieves my submission by executing underlying operations (findByRegistration). Validates inputs and throws an error if submission not found.. 
const getMySubmission = async registration => {
  const submission = await SubmissionRepository.findByRegistration(registration._id);
  if (!submission) {
    throw new ApiError(404, 'Submission not found.');
  }
  return submission;
};
// Updates an existing submission by executing underlying operations (updateById). Validates inputs and throws an error if submission deadline has passed.. 
const updateSubmission = async (submission, body) => {
  const deadline = submission.registration.hackathon.submissionDeadline;
  if (deadline && new Date() > new Date(deadline)) {
    throw new ApiError(400, 'Submission deadline has passed.');
  }
  return SubmissionRepository.updateById(submission._id, body);
};
// Updates an existing submission files by executing underlying operations (updateById). Validates inputs and throws an error if submission deadline has passed.. 
const updateSubmissionFiles = async (submission, files) => {
  const deadline = submission.registration.hackathon.submissionDeadline;
  if (deadline && new Date() > new Date(deadline)) {
    throw new ApiError(400, 'Submission deadline has passed.');
  }
  return SubmissionRepository.updateById(submission._id, files);
};
// Retrieves hackathon submissions by executing underlying operations (findAllByHackathon). 
const getHackathonSubmissions = async hackathonId => SubmissionRepository.findAllByHackathon(hackathonId);
// Retrieves submissions by executing underlying operations (findAll). 
const getSubmissions = async (queryParams, user) => {
  let allowedRegistrationIds = undefined;

  if (user.role === 'admin') {
    allowedRegistrationIds = null;
  } else if (user.role === 'organizer') {
    const { hackathons } = await HackathonRepository.findByOrganizer(user._id);
    const hackathonIds = hackathons.map(h => h._id);
    const registrations = await RegistrationRepository.findAllByHackathons(hackathonIds);
    allowedRegistrationIds = registrations.map(r => r._id);
  } else if (user.role === 'judge') {
    const assignments = await JudgeAssignmentRepository.findAllByJudge(user._id);
    const hackathonIds = assignments.map(a => a.hackathon);
    const registrations = await RegistrationRepository.findAllByHackathons(hackathonIds);
    allowedRegistrationIds = registrations.map(r => r._id);
  } else {
    throw new ApiError(403, 'Participants cannot access this route.');
  }

  return await SubmissionRepository.findAll(queryParams, allowedRegistrationIds);
};
// Updates an existing submission status by executing underlying operations (updateById). 
const updateSubmissionStatus = async (submission, status) => SubmissionRepository.updateById(submission._id, {
  status: status
});
export default {
  createSubmission: createSubmission,
  getMySubmission: getMySubmission,
  updateSubmission: updateSubmission,
  updateSubmissionFiles: updateSubmissionFiles,
  getHackathonSubmissions: getHackathonSubmissions,
  getSubmissions: getSubmissions,
  updateSubmissionStatus: updateSubmissionStatus
};