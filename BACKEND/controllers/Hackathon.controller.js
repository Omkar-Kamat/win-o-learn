/**
 * File: Hackathon.controller.js
 * Description: Implementation of Hackathon.controller.js
 */
import AsyncHandler from '../middlewares/AsyncHandler.js';
import HackathonService from '../services/Hackathon.service.js';
import SendResponse from '../utils/SendResponse.js';

// Creates a new hackathon
const createHackathon = AsyncHandler(async (req, res) => {
    const hackathon = await HackathonService.createHackathon(req.body, req.user._id);

    return SendResponse(res, 201, true, 'Hackathon created successfully', hackathon);
});


// Retrieves the hackathons data
const getHackathons = AsyncHandler(async (req, res) => {
    const hackathons = await HackathonService.getHackathons(req.query);

    return SendResponse(res, 200, true, 'Hackathons fetched successfully', hackathons);
});


// Retrieves the hackathon by id data
const getHackathonById = AsyncHandler(async (req, res) => {
    const hackathon = await HackathonService.getHackathonById(req.params.id);

    return SendResponse(res, 200, true, 'Hackathon fetched successfully', hackathon);
});


// Retrieves the my hackathons data
const getMyHackathons = AsyncHandler(async (req, res) => {
    const hackathons = await HackathonService.getMyHackathons(req.user._id, req.query);

    return SendResponse(res, 200, true, 'Hackathons fetched successfully', hackathons);
});


// Updates the hackathon data
const updateHackathon = AsyncHandler(async (req, res) => {
    const hackathon = await HackathonService.updateHackathon(req.hackathon, req.body);

    return SendResponse(res, 200, true, 'Hackathon updated successfully', hackathon);
});


// Removes the hackathon
const deleteHackathon = AsyncHandler(async (req, res) => {
    await HackathonService.deleteHackathon(req.hackathon);

    return SendResponse(res, 200, true, 'Hackathon deleted successfully');
});


// Performs the open registration operation
const openRegistration = AsyncHandler(async (req, res) => {
    const hackathon = await HackathonService.openRegistration(req.hackathon);

    return SendResponse(res, 200, true, 'Registration opened successfully', hackathon);
});


// Performs the close registration operation
const closeRegistration = AsyncHandler(async (req, res) => {
    const hackathon = await HackathonService.closeRegistration(req.hackathon);

    return SendResponse(res, 200, true, 'Registration closed successfully', hackathon);
});


// Performs the publish results operation
const publishResults = AsyncHandler(async (req, res) => {
    const hackathon = await HackathonService.publishResults(req.hackathon);

    return SendResponse(res, 200, true, 'Results published successfully', hackathon);
});


// Updates the banner data
const updateBanner = AsyncHandler(async (req, res) => {
    const hackathon = await HackathonService.updateBanner(req.hackathon, req.file);

    return SendResponse(res, 200, true, 'Banner updated successfully', hackathon);
});


export default {
    createHackathon,
    getHackathons,
    getHackathonById,
    getMyHackathons,
    updateHackathon,
    deleteHackathon,
    openRegistration,
    closeRegistration,
    publishResults,
    updateBanner,
};
