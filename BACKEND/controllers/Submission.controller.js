import asyncHandler from '../middlewares/AsyncHandler.js';
import SubmissionService from '../services/Submission.service.js';
import SendResponse from '../utils/SendResponse.js';
import { ROLES } from '../utils/Constants.js';
const filterSubmissionScores = (submission, userRole) => {
  const doc = submission.toObject ? submission.toObject() : submission;
  const isParticipant = userRole === ROLES.PARTICIPANT;
  if (isParticipant && !doc.registration.hackathon.resultsPublished) {
    delete doc.averageScore;
    delete doc.reviewCount;
  }
  return doc;
};
const createSubmission = asyncHandler(async (req, res) => {
  const submission = await SubmissionService.createSubmission(req.hackathon, req.registration, req.body);
  SendResponse(res, 201, true, 'Submission created successfully.', filterSubmissionScores(submission, req.user.role));
});
const getMySubmission = asyncHandler(async (req, res) => {
  const submission = await SubmissionService.getMySubmission(req.registration);
  SendResponse(res, 200, true, 'Submission retrieved successfully.', filterSubmissionScores(submission, req.user.role));
});
const getSubmission = asyncHandler(async (req, res) => {
  SendResponse(res, 200, true, 'Submission retrieved successfully.', filterSubmissionScores(req.submission, req.user.role));
});
const updateSubmission = asyncHandler(async (req, res) => {
  const submission = await SubmissionService.updateSubmission(req.submission, req.body);
  SendResponse(res, 200, true, 'Submission updated successfully.', submission);
});
const updateSubmissionFiles = asyncHandler(async (req, res) => {
  const submission = await SubmissionService.updateSubmissionFiles(req.submission, req.body);
  SendResponse(res, 200, true, 'Submission files updated successfully.', submission);
});
const getHackathonSubmissions = asyncHandler(async (req, res) => {
  const submissions = await SubmissionService.getHackathonSubmissions(req.hackathon._id);
  SendResponse(res, 200, true, 'Submissions retrieved successfully.', submissions);
});
const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await SubmissionService.getSubmissions(req.query, req.user);
  SendResponse(res, 200, true, 'Submissions retrieved successfully.', submissions);
});
const updateSubmissionStatus = asyncHandler(async (req, res) => {
  const submission = await SubmissionService.updateSubmissionStatus(req.submission, req.body.status);
  SendResponse(res, 200, true, 'Submission status updated successfully.', submission);
});
export default {
  createSubmission: createSubmission,
  getMySubmission: getMySubmission,
  getSubmission: getSubmission,
  updateSubmission: updateSubmission,
  updateSubmissionFiles: updateSubmissionFiles,
  getHackathonSubmissions: getHackathonSubmissions,
  getSubmissions: getSubmissions,
  updateSubmissionStatus: updateSubmissionStatus
};