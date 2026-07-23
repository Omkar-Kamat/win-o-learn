import ApiError from '../utils/ApiError.js';
import SubmissionRepository from '../repository/Submission.repository.js';
import ReviewRepository from '../repository/Review.repository.js';
import ScoreService from './Score.service.js';
class LeaderboardService {
  // Retrieves leaderboard by executing underlying operations (findAllByHackathon). Validates inputs and throws an error if leaderboard is not available yet.. 
  async getLeaderboard(hackathon) {
    if (!hackathon.resultsPublished) {
      throw new ApiError(403, 'Leaderboard is not available yet.');
    }
    const submissions = await SubmissionRepository.findAllByHackathon(hackathon._id);
    submissions.sort((a, b) => b.averageScore - a.averageScore);
    return submissions.map((submission, index) => ({
      rank: index + 1,
      teamName: submission.registration.team.name,
      projectName: submission.projectName,
      totalScore: submission.averageScore
    }));
  }
  // Re-evaluates and recalculates leaderboard by executing underlying operations (findAllByHackathon, updateSubmissionAverage). 
  async recalculateLeaderboard(hackathon) {
    const submissions = await SubmissionRepository.findAllByHackathon(hackathon._id);
    for (const submission of submissions) {
      await ScoreService.updateSubmissionAverage(submission._id);
    }
    return true;
  }
}
export default new LeaderboardService();