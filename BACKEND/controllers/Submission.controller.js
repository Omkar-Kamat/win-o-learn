import asyncHandler from "../middlewares/AsyncHandler.js";
import SubmissionService from "../services/Submission.service.js";
import successResponse from "../utils/successResponse.js";

const createSubmission = asyncHandler(
  async (req, res) => {
    const submission =
      await SubmissionService.createSubmission(
        req.params.hackathonId,
        req.team,
        req.body
      );

    successResponse(
      res,
      201,
      "Submission created successfully.",
      submission
    );
  }
);

const getMySubmission = asyncHandler(
  async (req, res) => {
    const submission =
      await SubmissionService.getMySubmission(
        req.params.hackathonId,
        req.team
      );

    successResponse(
      res,
      200,
      "Submission retrieved successfully.",
      submission
    );
  }
);

const getSubmission = asyncHandler(
  async (req, res) => {
    successResponse(
      res,
      200,
      "Submission retrieved successfully.",
      req.submission
    );
  }
);

const updateSubmission = asyncHandler(
  async (req, res) => {
    const submission =
      await SubmissionService.updateSubmission(
        req.submission,
        req.body
      );

    successResponse(
      res,
      200,
      "Submission updated successfully.",
      submission
    );
  }
);

const updateSubmissionFiles = asyncHandler(
  async (req, res) => {
    const submission =
      await SubmissionService.updateSubmissionFiles(
        req.submission,
        req.body
      );

    successResponse(
      res,
      200,
      "Submission files updated successfully.",
      submission
    );
  }
);

const getHackathonSubmissions =
  asyncHandler(async (req, res) => {
    const submissions =
      await SubmissionService.getHackathonSubmissions(
        req.params.hackathonId
      );

    successResponse(
      res,
      200,
      "Submissions retrieved successfully.",
      submissions
    );
  });

const updateSubmissionStatus =
  asyncHandler(async (req, res) => {
    const submission =
      await SubmissionService.updateSubmissionStatus(
        req.submission,
        req.body.status
      );

    successResponse(
      res,
      200,
      "Submission status updated successfully.",
      submission
    );
  });

export default {
  createSubmission,
  getMySubmission,
  getSubmission,
  updateSubmission,
  updateSubmissionFiles,
  getHackathonSubmissions,
  updateSubmissionStatus,
};