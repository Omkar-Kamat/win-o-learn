import ApiError from '../utils/ApiError.js';
import ReviewRepository from '../repository/Review.repository.js';
import JudgeAssignmentRepository from '../repository/JudgeAssignment.repository.js';
import SubmissionRepository from '../repository/Submission.repository.js';
import ScoreService from './Score.service.js';
class ReviewService {
    calculateTotalScore(scores) {
        return scores.reduce((sum, item) => sum + item.score, 0);
    }
    validateScores(criteria, scores) {
        if (!scores || !Array.isArray(scores)) {
            throw new ApiError(400, 'Scores must be provided as an array.');
        }
        if (criteria.length !== scores.length) {
            throw new ApiError(400, 'All judging criteria must be scored exactly once.');
        }
        const seenCriteria = new Set();
        for (const submitted of scores) {
            if (seenCriteria.has(submitted.criterion)) {
                throw new ApiError(400, `Duplicate score for criterion: ${submitted.criterion}`);
            }
            seenCriteria.add(submitted.criterion);
            const criterion = criteria.find((item) => item.criterion === submitted.criterion);
            if (!criterion) {
                throw new ApiError(400, `Invalid criterion: ${submitted.criterion}`);
            }
            if (
                typeof submitted.score !== 'number' ||
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
    async submitReview(submission, judgeId, data) {
        const assignment = await JudgeAssignmentRepository.findByHackathonAndJudge(
            submission.registration.hackathon._id,
            judgeId
        );
        if (!assignment) {
            throw new ApiError(403, 'You are not assigned to review this hackathon.');
        }
        const existing = await ReviewRepository.findBySubmissionAndJudge(submission._id, judgeId);
        if (existing) {
            throw new ApiError(409, 'You have already reviewed this submission.');
        }
        const criteria = submission.registration.hackathon.judgingCriteria;
        this.validateScores(criteria, data.scores);
        const totalScore = this.calculateTotalScore(data.scores);
        const review = await ReviewRepository.create({
            submission: submission._id,
            hackathon: submission.registration.hackathon._id,
            judge: judgeId,
            scores: data.scores,
            totalScore: totalScore,
            feedback: data.feedback,
        });
        await ScoreService.updateSubmissionAverage(submission._id);
        return review;
    }
    async updateReview(review, judgeId, data) {
        const reviewJudgeId = String(review.judge._id || review.judge);
        if (reviewJudgeId !== String(judgeId)) {
            throw new ApiError(403, 'You can only edit your own review.');
        }
        if (review.isFinal) {
            throw new ApiError(400, 'This review has been locked.');
        }
        const criteria = review.hackathon.judgingCriteria;
        this.validateScores(criteria, data.scores);
        const totalScore = this.calculateTotalScore(data.scores);
        const updated = await ReviewRepository.updateById(review._id, {
            scores: data.scores,
            feedback: data.feedback,
            totalScore: totalScore,
        });
        await ScoreService.updateSubmissionAverage(review.submission._id || review.submission);
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
