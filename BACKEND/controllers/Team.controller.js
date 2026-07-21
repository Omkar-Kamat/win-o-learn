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
    "Team created successfully.",
    team
  );
});

export default {
  createTeam,
};