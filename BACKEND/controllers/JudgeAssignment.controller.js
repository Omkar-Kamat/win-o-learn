import asyncHandler from '../middlewares/AsyncHandler.js';
import JudgeAssignmentService from '../services/JudgeAssignment.service.js';
const assignJudge = asyncHandler(async (req, res) => {
    const assignment = await JudgeAssignmentService.assignJudge(
        req.hackathon,
        req.body.judgeId,
        req.user._id
    );
    res.status(201).json({
        success: true,
        message: 'Judge assigned successfully.',
        data: assignment,
    });
});
const removeJudge = asyncHandler(async (req, res) => {
    await JudgeAssignmentService.removeJudge(req.hackathon, req.params.judgeId);
    res.status(200).json({ success: true, message: 'Judge removed successfully.', data: null });
});
const getHackathonJudges = asyncHandler(async (req, res) => {
    const judges = await JudgeAssignmentService.getHackathonJudges(req.hackathon);
    res.status(200).json({
        success: true,
        message: 'Assigned judges fetched successfully.',
        data: judges,
    });
});
const getAssignedHackathons = asyncHandler(async (req, res) => {
    const assignments = await JudgeAssignmentService.getAssignedHackathons(req.user._id);
    res.status(200).json({
        success: true,
        message: 'Assigned hackathons fetched successfully.',
        data: assignments,
    });
});
export default {
    assignJudge: assignJudge,
    removeJudge: removeJudge,
    getHackathonJudges: getHackathonJudges,
    getAssignedHackathons: getAssignedHackathons,
};
