import asyncHandler from '../middlewares/AsyncHandler.js';
import SubmissionService from '../services/Submission.service.js';
import SendResponse from '../utils/SendResponse.js';
const createSubmission = asyncHandler(async (req, res) => {
  const submission = await SubmissionService.createSubmission(req.hackathon, req.registration, req.body);
  SendResponse(res, 201, true, 'Submission created successfully.', submission);
});
const getMySubmission = asyncHandler(async (req, res) => {
  const submission = await SubmissionService.getMySubmission(req.registration);
  SendResponse(res, 200, true, 'Submission retrieved successfully.', submission);
});
const getSubmission = asyncHandler(async (req, res) => {
  SendResponse(res, 200, true, 'Submission retrieved successfully.', req.submission);
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
  const submissions = await SubmissionService.getSubmissions(req.query);
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