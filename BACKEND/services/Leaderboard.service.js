/**
 * File: Leaderboard.service.js
 * Description: Implementation of Leaderboard.service.js
 */

import ApiError from '../utils/ApiError.js';
import SubmissionRepository from '../repository/Submission.repository.js';
import ReviewRepository from '../repository/Review.repository.js';
import ScoreService from './Score.service.js';

class LeaderboardService {
    // Retrieves the leaderboard
    async getLeaderboard(hackathon) {
        if (!hackathon.resultsPublished) {
            throw new ApiError(403, 'Leaderboard is not available yet.');
        }

        const submissions = await SubmissionRepository.findAllByHackathon(
            hackathon._id
        );

        submissions.sort((a, b) => b.averageScore - a.averageScore);

        return submissions.map((submission, index) => ({
            rank: index + 1,
            teamName: submission.registration.team.name,
            projectName: submission.projectName,
            totalScore: submission.averageScore,
        }));
    }

    // Recalculates leaderboard
    async recalculateLeaderboard(hackathon) {
        const submissions =
            await SubmissionRepository.findAllByHackathon(
                hackathon._id
            );

        for (const submission of submissions) {
            await ScoreService.updateSubmissionAverage(submission._id);
        }

        return true;
    }

    // // Recalculates cached score of a submission
    // async recalculateSubmissionScore(submissionId) {
    //     const reviews = await ReviewRepository.findBySubmission(submissionId);

    //     const reviewCount = reviews.length;

    //     const totalScore = reviews.reduce(
    //         (sum, review) => sum + review.totalScore,
    //         0
    //     );

    //     const averageScore =
    //         reviewCount === 0 ? 0 : totalScore / reviewCount;

    //     await SubmissionRepository.updateById(submissionId, {
    //         averageScore,
    //         reviewCount,
    //     });
    // }
}

export default new LeaderboardService();