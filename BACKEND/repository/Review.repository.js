import Review from '../models/Review.model.js';
const create = (reviewData) => Review.create(reviewData);
const findById = (id) =>
    Review.findById(id)
        .populate('judge', 'name email avatar')
        .populate('submission')
        .populate({ path: 'hackathon', select: 'title judgingCriteria organizer' });
const findBySubmission = (submissionId) =>
    Review.find({ submission: submissionId })
        .populate('judge', 'name email avatar')
        .sort({ createdAt: 1 });
const findByHackathon = (hackathonId) =>
    Review.find({ hackathon: hackathonId })
        .populate('judge', 'name email avatar')
        .populate('submission')
        .sort({ createdAt: 1 });
const findByJudge = (judgeId) =>
    Review.find({ judge: judgeId })
        .populate('submission')
        .populate('hackathon', 'title')
        .sort({ createdAt: -1 });
const calculateSubmissionStats = async (submissionId) => {
    const result = await Review.aggregate([
        { $match: { submission: submissionId } },
        {
            $group: {
                _id: '$submission',
                averageScore: { $avg: '$totalScore' },
                reviewCount: { $sum: 1 },
            },
        },
    ]);
    if (!result.length) {
        return { averageScore: 0, reviewCount: 0 };
    }
    return { averageScore: result[0].averageScore, reviewCount: result[0].reviewCount };
};
const findBySubmissionAndJudge = (submissionId, judgeId) =>
    Review.findOne({ submission: submissionId, judge: judgeId });
const updateById = (id, fields) =>
    Review.findByIdAndUpdate(id, fields, { new: true, runValidators: true })
        .populate('judge', 'name email avatar')
        .populate('submission')
        .populate('hackathon', 'title');
const deleteById = (id) => Review.findByIdAndDelete(id);
const countBySubmission = (submissionId) => Review.countDocuments({ submission: submissionId });
const findAllBySubmission = (submissionId) => Review.find({ submission: submissionId });
export default {
    create: create,
    findById: findById,
    findBySubmission: findBySubmission,
    findByHackathon: findByHackathon,
    findByJudge: findByJudge,
    findBySubmissionAndJudge: findBySubmissionAndJudge,
    updateById: updateById,
    deleteById: deleteById,
    countBySubmission: countBySubmission,
    findAllBySubmission: findAllBySubmission,
    calculateSubmissionStats: calculateSubmissionStats,
};
