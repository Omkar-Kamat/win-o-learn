/**
 * File: Team.controller.js
 * Description: Implementation of Team.controller.js
 */
import asyncHandler from '../middlewares/AsyncHandler.js';
import TeamService from '../services/Team.service.js';
import SendResponse from '../utils/SendResponse.js';

// Creates a new team
const createTeam = asyncHandler(async (req, res) => {
    const team = await TeamService.createTeam(req.user._id, req.body);

    return SendResponse(res, 201, true, 'Team created successfully.', team);
});


// Retrieves the team data
const getTeam = asyncHandler(async (req, res) => {
    const team = await TeamService.getTeamById(req.team);

    return SendResponse(res, 200, true, 'Team fetched successfully.', team);
});


// Updates the team data
const updateTeam = asyncHandler(async (req, res) => {
    const team = await TeamService.updateTeam(req.team, req.body);

    return SendResponse(res, 200, true, 'Team updated successfully.', team);
});


// Removes the team
const deleteTeam = asyncHandler(async (req, res) => {
    await TeamService.deleteTeam(req.team);

    return SendResponse(res, 200, true, 'Team deleted successfully.');
});


// Performs the invite member operation
const inviteMember = asyncHandler(async (req, res) => {
    const team = await TeamService.inviteMember(req.team, req.body.email, req.user._id);
    SendResponse(res, 200, true, 'Invite sent successfully.', team);
});


// Performs the accept invite operation
const acceptInvite = asyncHandler(async (req, res) => {
    const team = await TeamService.acceptInvite(req.team, req.user._id);
    SendResponse(res, 200, true, 'Invite accepted successfully.', team);
});


// Performs the reject invite operation
const rejectInvite = asyncHandler(async (req, res) => {
    const team = await TeamService.rejectInvite(req.team, req.user._id);
    SendResponse(res, 200, true, 'Invite rejected successfully.', team);
});


// Performs the transfer leadership operation
const transferLeadership = asyncHandler(async (req, res) => {
    const team = await TeamService.transferLeadership(req.team, req.body.userId);
    SendResponse(res, 200, true, 'Leadership transferred successfully.', team);
});


// Performs the leave team operation
const leaveTeam = asyncHandler(async (req, res) => {
    const team = await TeamService.leaveTeam(req.team, req.user._id);
    SendResponse(res, 200, true, 'Left team successfully.', team);
});


// Removes the member
const removeMember = asyncHandler(async (req, res) => {
    const team = await TeamService.removeMember(req.team, req.params.userId);
    SendResponse(res, 200, true, 'Member removed successfully.', team);
});


export default {
    createTeam,
    getTeam,
    updateTeam,
    deleteTeam,
    inviteMember,
    acceptInvite,
    rejectInvite,
    transferLeadership,
    leaveTeam,
    removeMember,
};
