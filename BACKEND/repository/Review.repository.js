/**
 * File: Review.repository.js
 * Description: Implementation of Review.repository.js
 */

import Review from '../models/Review.model.js';

// Creates a new review
const create = (reviewData) => {
    return Review.create(reviewData);
};

// Performs the find by id operation
const findById = (id) => {
    return Review.findById(id)
        .populate('judge', 'name email avatar')
        .populate('submission')
        .populate({
            path: 'hackathon',
            select: 'title judgingCriteria organizer',
        });
};

// Performs the find by submission operation
const findBySubmission = (submissionId) => {
    return Review.find({ submission: submissionId })
        .populate('judge', 'name email avatar')
        .sort({ createdAt: 1 });
};

// Performs the find by hackathon operation
const findByHackathon = (hackathonId) => {
    return Review.find({ hackathon: hackathonId })
        .populate('judge', 'name email avatar')
        .populate('submission')
        .sort({ createdAt: 1 });
};

// Performs the find by judge operation
const findByJudge = (judgeId) => {
    return Review.find({ judge: judgeId })
        .populate('submission')
        .populate('hackathon', 'title')
        .sort({ createdAt: -1 });
};

// Calculates average score for a submission
const calculateSubmissionStats = async (submissionId) => {
    const result = await Review.aggregate([
        {
            $match: {
                submission: submissionId,
            },
        },
        {
            $group: {
                _id: '$submission',
                averageScore: {
                    $avg: '$totalScore',
                },
                reviewCount: {
                    $sum: 1,
                },
            },
        },
    ]);

    if (!result.length) {
        return {
            averageScore: 0,
            reviewCount: 0,
        };
    }

    return {
        averageScore: result[0].averageScore,
        reviewCount: result[0].reviewCount,
    };
};

// Performs the find by submission and judge operation
const findBySubmissionAndJudge = (submissionId, judgeId) => {
    return Review.findOne({
        submission: submissionId,
        judge: judgeId,
    });
};

// Updates the review by id
const updateById = (id, fields) => {
    return Review.findByIdAndUpdate(id, fields, {
        new: true,
        runValidators: true,
    })
        .populate('judge', 'name email avatar')
        .populate('submission')
        .populate('hackathon', 'title');
};

// Removes the review by id
const deleteById = (id) => {
    return Review.findByIdAndDelete(id);
};

// Counts reviews for a submission
const countBySubmission = (submissionId) => {
    return Review.countDocuments({
        submission: submissionId,
    });
};

// Retrieves all reviews for a submission (used for average calculation)
const findAllBySubmission = (submissionId) => {
    return Review.find({ submission: submissionId });
};

export default {
    create,
    findById,
    findBySubmission,
    findByHackathon,
    findByJudge,
    findBySubmissionAndJudge,
    updateById,
    deleteById,
    countBySubmission,
    findAllBySubmission,
    calculateSubmissionStats,
};