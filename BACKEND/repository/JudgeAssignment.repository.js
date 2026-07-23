import JudgeAssignment from '../models/JudgeAssignment.model.js';
// Creates a new. 
const create = data => JudgeAssignment.create(data);
// Searches and retrieves by id. 
const findById = id => JudgeAssignment.findById(id).populate('judge').populate('hackathon').populate('assignedBy');
// Searches and retrieves by hackathon and judge. 
const findByHackathonAndJudge = (hackathonId, judgeId) => JudgeAssignment.findOne({
  hackathon: hackathonId,
  judge: judgeId
});
// Searches and retrieves all by hackathon. 
const findAllByHackathon = hackathonId => JudgeAssignment.find({
  hackathon: hackathonId
}).populate('judge').populate('assignedBy').sort({
  assignedAt: 1
});
// Searches and retrieves all by judge. 
const findAllByJudge = judgeId => JudgeAssignment.find({
  judge: judgeId
}).populate('hackathon').sort({
  assignedAt: -1
});
// Counts by hackathon. 
const countByHackathon = hackathonId => JudgeAssignment.countDocuments({
  hackathon: hackathonId
});
// Removes the specified by hackathon and judge. 
const deleteByHackathonAndJudge = (hackathonId, judgeId) => JudgeAssignment.findOneAndDelete({
  hackathon: hackathonId,
  judge: judgeId
});
export default {
  create: create,
  findById: findById,
  findByHackathonAndJudge: findByHackathonAndJudge,
  findAllByHackathon: findAllByHackathon,
  findAllByJudge: findAllByJudge,
  countByHackathon: countByHackathon,
  deleteByHackathonAndJudge: deleteByHackathonAndJudge
};