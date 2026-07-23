/**
 * File: Submission.service.js
 * Description: Implementation of Submission.service.js
 */
import ApiError from '../utils/ApiError.js';
import SubmissionRepository from '../repository/Submission.repository.js';

// Creates a new submission
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
        ...body,
    });
};


// Retrieves the my submission data
const getMySubmission = async (registration) => {
    const submission = await SubmissionRepository.findByRegistration(registration._id);
    if (!submission) {
        throw new ApiError(404, 'Submission not found.');
    }

    return submission;
};


// Updates the submission data
const updateSubmission = async (submission, body) => {
    const deadline = submission.registration.hackathon.submissionDeadline;
    if (deadline && new Date() > new Date(deadline)) {
        throw new ApiError(400, 'Submission deadline has passed.');
    }

    return SubmissionRepository.updateById(submission._id, body);
};


// Updates the submission files data
const updateSubmissionFiles = async (submission, files) => {
    const deadline = submission.registration.hackathon.submissionDeadline;
    if (deadline && new Date() > new Date(deadline)) {
        throw new ApiError(400, 'Submission deadline has passed.');
    }

    return SubmissionRepository.updateById(submission._id, files);
};


// Retrieves the hackathon submissions data
const getHackathonSubmissions = async (hackathonId) => {
    return SubmissionRepository.findAllByHackathon(hackathonId);
};


// Retrieves all submissions
const getSubmissions = async (queryParams) => {
    return await SubmissionRepository.findAll(queryParams);
};


// Updates the submission status data
const updateSubmissionStatus = async (submission, status) => {
    return SubmissionRepository.updateById(submission._id, {
        status,
    });
};


export default {
    createSubmission,
    getMySubmission,
    updateSubmission,
    updateSubmissionFiles,
    getHackathonSubmissions,
    getSubmissions,
    updateSubmissionStatus,
};
