import ReviewRepository from '../repository/Review.repository.js';
import SubmissionRepository from '../repository/Submission.repository.js';
class ScoreService {
  // Updates an existing submission average by executing underlying operations (calculateSubmissionStats, updateById). 
  async updateSubmissionAverage(submissionId) {
    const stats = await ReviewRepository.calculateSubmissionStats(submissionId);
    await SubmissionRepository.updateById(submissionId, {
      averageScore: Number(stats.averageScore.toFixed(2)),
      reviewCount: stats.reviewCount
    });
  }
}
export default new ScoreService();