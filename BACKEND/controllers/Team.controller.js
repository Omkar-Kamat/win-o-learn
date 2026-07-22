import asyncHandler from "../middlewares/AsyncHandler.js";
import TeamService from "../services/Team.service.js";
import SendResponse from "../utils/SendResponse.js";

const createTeam = asyncHandler(async (req, res) => {
  const team = await TeamService.createTeam(
    req.user._id,
    req.body
  );

  return SendResponse(
    res,
    201,
    true,
    "Team created successfully.",
    team
  );
});

const getTeam = asyncHandler(async (req, res) => {
  const team = await TeamService.getTeamById(
    req.team
  );

  return SendResponse(
    res,
    200,
    true,
    "Team fetched successfully.",
    team
  );
});

const updateTeam = asyncHandler(async (req, res) => {
  const team = await TeamService.updateTeam(
    req.team,
    req.body
  );

  return SendResponse(
    res,
    200,
    true,
    "Team updated successfully.",
    team
  );
});

const deleteTeam = asyncHandler(async (req, res) => {
  await TeamService.deleteTeam(req.team);

  return SendResponse(
    res,
    200,
    true,
    "Team deleted successfully."
  );
});

const inviteMember = asyncHandler(async (req, res) => {
  const team = await TeamService.inviteMember(
    req.team,
    req.body.email,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "Invite sent successfully.",
    team,
  });
});

const acceptInvite = asyncHandler(async (req, res) => {
  const team = await TeamService.acceptInvite(
    req.team,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "Invite accepted successfully.",
    team,
  });
});

const rejectInvite = asyncHandler(async (req, res) => {
  const team = await TeamService.rejectInvite(
    req.team,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "Invite rejected successfully.",
    team,
  });
});

const transferLeadership = asyncHandler(async (req, res) => {
  const team = await TeamService.transferLeadership(
    req.team,
    req.body.userId
  );

  res.status(200).json({
    success: true,
    message: "Leadership transferred successfully.",
    team,
  });
});

const leaveTeam = asyncHandler(async (req, res) => {
  const team = await TeamService.leaveTeam(
    req.team,
    req.user._id
  );

  res.status(200).json({
    success: true,
    message: "Left team successfully.",
    team,
  });
});

const removeMember = asyncHandler(async (req, res) => {
  const team = await TeamService.removeMember(
    req.team,
    req.params.userId
  );

  res.status(200).json({
    success: true,
    message: "Member removed successfully.",
    team,
  });
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