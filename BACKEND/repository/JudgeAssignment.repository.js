import JudgeAssignment from '../models/JudgeAssignment.model.js';
const create = (data) => JudgeAssignment.create(data);
const findById = (id) =>
    JudgeAssignment.findById(id).populate('judge').populate('hackathon').populate('assignedBy');
const findByHackathonAndJudge = (hackathonId, judgeId) =>
    JudgeAssignment.findOne({ hackathon: hackathonId, judge: judgeId });
const findAllByHackathon = (hackathonId) =>
    JudgeAssignment.find({ hackathon: hackathonId })
        .populate('judge')
        .populate('assignedBy')
        .sort({ assignedAt: 1 });
const findAllByJudge = (judgeId) =>
    JudgeAssignment.find({ judge: judgeId }).populate('hackathon').sort({ assignedAt: -1 });
const countByHackathon = (hackathonId) =>
    JudgeAssignment.countDocuments({ hackathon: hackathonId });
const deleteByHackathonAndJudge = (hackathonId, judgeId) =>
    JudgeAssignment.findOneAndDelete({ hackathon: hackathonId, judge: judgeId });
export default {
    create: create,
    findById: findById,
    findByHackathonAndJudge: findByHackathonAndJudge,
    findAllByHackathon: findAllByHackathon,
    findAllByJudge: findAllByJudge,
    countByHackathon: countByHackathon,
    deleteByHackathonAndJudge: deleteByHackathonAndJudge,
};
