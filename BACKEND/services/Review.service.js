/**
 * File: Review.service.js
 * Description: Implementation of Review.service.js
 */

import ApiError from '../utils/ApiError.js';
import ReviewRepository from '../repository/Review.repository.js';
import JudgeAssignmentRepository from '../repository/JudgeAssignment.repository.js';
import SubmissionRepository from '../repository/Submission.repository.js';

class ReviewService {
    // Calculates total score
    calculateTotalScore(scores) {
        return scores.reduce((sum, item) => sum + item.score, 0);
    }

    // Validates submitted scores against hackathon criteria
    validateScores(criteria, scores) {
        if (criteria.length !== scores.length) {
            throw new ApiError(400, 'All judging criteria must be scored.');
        }

        for (const submitted of scores) {
            const criterion = criteria.find(
                (item) => item.criterion === submitted.criterion
            );

            if (!criterion) {
                throw new ApiError(
                    400,
                    `Invalid criterion: ${submitted.criterion}`
                );
            }

            if (
                submitted.score < 0 ||
                submitted.score > criterion.maxMarks
            ) {
                throw new ApiError(
                    400,
                    `${submitted.criterion} score must be between 0 and ${criterion.maxMarks}.`
                );
            }
        }
    }

    // Updates submission average score
    async updateSubmissionAverage(submissionId) {
        const stats =
            await ReviewRepository.calculateSubmissionStats(submissionId);

        await SubmissionRepository.updateById(submissionId, {
            averageScore: Number(stats.averageScore.toFixed(2)),
            reviewCount: stats.reviewCount,
        });
    }

    // Submit review
    async submitReview(submission, judgeId, data) {
        const assignment =
            await JudgeAssignmentRepository.findByHackathonAndJudge(
                submission.registration.hackathon._id,
                judgeId
            );

        if (!assignment) {
            throw new ApiError(
                403,
                'You are not assigned to review this hackathon.'
            );
        }

        const existing =
            await ReviewRepository.findBySubmissionAndJudge(
                submission._id,
                judgeId
            );

        if (existing) {
            throw new ApiError(
                409,
                'You have already reviewed this submission.'
            );
        }

        const criteria =
            submission.registration.hackathon.judgingCriteria;

        this.validateScores(criteria, data.scores);

        const totalScore =
            this.calculateTotalScore(data.scores);

        const review =
            await ReviewRepository.create({
                submission: submission._id,
                hackathon: submission.registration.hackathon._id,
                judge: judgeId,
                scores: data.scores,
                totalScore,
                feedback: data.feedback,
            });

        await this.updateSubmissionAverage(submission._id);

        return review;
    }

    // Update review
    async updateReview(review, judgeId, data) {
        if (String(review.judge) !== String(judgeId)) {
            throw new ApiError(
                403,
                'You can only edit your own review.'
            );
        }

        if (review.isFinal) {
            throw new ApiError(
                400,
                'This review has been locked.'
            );
        }

        const criteria =
            review.hackathon.judgingCriteria;

        this.validateScores(criteria, data.scores);

        const totalScore =
            this.calculateTotalScore(data.scores);

        const updated =
            await ReviewRepository.updateById(review._id, {
                scores: data.scores,
                feedback: data.feedback,
                totalScore,
            });

        await this.updateSubmissionAverage(review.submission);

        return updated;
    }

    async getReview(review) {
        return review;
    }

    async getSubmissionReviews(submissionId) {
        return ReviewRepository.findBySubmission(submissionId);
    }

    async getHackathonReviews(hackathonId) {
        return ReviewRepository.findByHackathon(hackathonId);
    }

    async getJudgeReviews(judgeId) {
        return ReviewRepository.findByJudge(judgeId);
    }
}

export default new ReviewService();