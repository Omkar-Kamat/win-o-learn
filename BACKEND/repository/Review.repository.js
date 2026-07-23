import Review from '../models/Review.model.js';
// Creates a new. 
const create = reviewData => Review.create(reviewData);
// Searches and retrieves by id. 
const findById = id => Review.findById(id).populate('judge', 'name email avatar').populate('submission').populate({
  path: 'hackathon',
  select: 'title judgingCriteria organizer'
});
// Searches and retrieves by submission. 
const findBySubmission = submissionId => Review.find({
  submission: submissionId
}).populate('judge', 'name email avatar').sort({
  createdAt: 1
});
// Searches and retrieves by hackathon. 
const findByHackathon = hackathonId => Review.find({
  hackathon: hackathonId
}).populate('judge', 'name email avatar').populate('submission').sort({
  createdAt: 1
});
// Searches and retrieves by judge. 
const findByJudge = judgeId => Review.find({
  judge: judgeId
}).populate('submission').populate('hackathon', 'title').sort({
  createdAt: -1
});
// Computes and calculates submission stats. 
const calculateSubmissionStats = async submissionId => {
  const result = await Review.aggregate([{
    $match: {
      submission: submissionId
    }
  }, {
    $group: {
      _id: '$submission',
      averageScore: {
        $avg: '$totalScore'
      },
      reviewCount: {
        $sum: 1
      }
    }
  }]);
  if (!result.length) {
    return {
      averageScore: 0,
      reviewCount: 0
    };
  }
  return {
    averageScore: result[0].averageScore,
    reviewCount: result[0].reviewCount
  };
};
// Searches and retrieves by submission and judge. 
const findBySubmissionAndJudge = (submissionId, judgeId) => Review.findOne({
  submission: submissionId,
  judge: judgeId
});
// Updates an existing by id. 
const updateById = (id, fields) => Review.findByIdAndUpdate(id, fields, {
  new: true,
  runValidators: true
}).populate('judge', 'name email avatar').populate('submission').populate('hackathon', 'title');
// Removes the specified by id. 
const deleteById = id => Review.findByIdAndDelete(id);
// Counts by submission. 
const countBySubmission = submissionId => Review.countDocuments({
  submission: submissionId
});
// Searches and retrieves all by submission. 
const findAllBySubmission = submissionId => Review.find({
  submission: submissionId
});
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
  calculateSubmissionStats: calculateSubmissionStats
};