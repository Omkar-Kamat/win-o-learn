import AsyncHandler from '../middlewares/AsyncHandler.js';
import HackathonService from '../services/Hackathon.service.js';
import SendResponse from '../utils/SendResponse.js';
const createHackathon = AsyncHandler(async (req, res) => {
  const hackathon = await HackathonService.createHackathon(req.body, req.user._id);
  return SendResponse(res, 201, true, 'Hackathon created successfully', hackathon);
});
const getHackathons = AsyncHandler(async (req, res) => {
  const hackathons = await HackathonService.getHackathons(req.query);
  return SendResponse(res, 200, true, 'Hackathons fetched successfully', hackathons);
});
const getHackathonById = AsyncHandler(async (req, res) => {
  const hackathon = await HackathonService.getHackathonById(req.params.id);
  return SendResponse(res, 200, true, 'Hackathon fetched successfully', hackathon);
});
const getMyHackathons = AsyncHandler(async (req, res) => {
  const hackathons = await HackathonService.getMyHackathons(req.user._id, req.query);
  return SendResponse(res, 200, true, 'Hackathons fetched successfully', hackathons);
});
const updateHackathon = AsyncHandler(async (req, res) => {
  const hackathon = await HackathonService.updateHackathon(req.hackathon, req.body);
  return SendResponse(res, 200, true, 'Hackathon updated successfully', hackathon);
});
const deleteHackathon = AsyncHandler(async (req, res) => {
  await HackathonService.deleteHackathon(req.hackathon);
  return SendResponse(res, 200, true, 'Hackathon deleted successfully');
});
const openRegistration = AsyncHandler(async (req, res) => {
  const hackathon = await HackathonService.openRegistration(req.hackathon);
  return SendResponse(res, 200, true, 'Registration opened successfully', hackathon);
});
const closeRegistration = AsyncHandler(async (req, res) => {
  const hackathon = await HackathonService.closeRegistration(req.hackathon);
  return SendResponse(res, 200, true, 'Registration closed successfully', hackathon);
});
const publishResults = AsyncHandler(async (req, res) => {
  const hackathon = await HackathonService.publishResults(req.hackathon);
  return SendResponse(res, 200, true, 'Results published successfully', hackathon);
});
const updateBanner = AsyncHandler(async (req, res) => {
  const hackathon = await HackathonService.updateBanner(req.hackathon, req.file);
  return SendResponse(res, 200, true, 'Banner updated successfully', hackathon);
});
export default {
  createHackathon: createHackathon,
  getHackathons: getHackathons,
  getHackathonById: getHackathonById,
  getMyHackathons: getMyHackathons,
  updateHackathon: updateHackathon,
  deleteHackathon: deleteHackathon,
  openRegistration: openRegistration,
  closeRegistration: closeRegistration,
  publishResults: publishResults,
  updateBanner: updateBanner
};