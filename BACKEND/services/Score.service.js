/**
 * File: Score.service.js
 * Description: Shared service for updating submission scores.
 */

import ReviewRepository from '../repository/Review.repository.js';
import SubmissionRepository from '../repository/Submission.repository.js';

class ScoreService {
    // Updates cached average score and review count for a submission
    async updateSubmissionAverage(submissionId) {
        const stats =
            await ReviewRepository.calculateSubmissionStats(submissionId);

        await SubmissionRepository.updateById(submissionId, {
            averageScore: Number(stats.averageScore.toFixed(2)),
            reviewCount: stats.reviewCount,
        });
    }
}

export default new ScoreService();