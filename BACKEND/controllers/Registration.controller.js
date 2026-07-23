import asyncHandler from '../middlewares/AsyncHandler.js';
import RegistrationService from '../services/Registration.service.js';
import SendResponse from '../utils/SendResponse.js';
const registerTeam = asyncHandler(async (req, res) => {
    const registration = await RegistrationService.registerTeam(
        req.hackathon,
        req.team,
        req.user._id
    );
    return SendResponse(res, 201, true, 'Team registered successfully.', registration);
});
const cancelRegistration = asyncHandler(async (req, res) => {
    await RegistrationService.cancelRegistration(req.hackathon, req.team, req.user._id);
    return SendResponse(res, 200, true, 'Registration cancelled successfully.');
});
const getRegistrationStatus = asyncHandler(async (req, res) => {
    const status = await RegistrationService.getRegistrationStatus(req.hackathon, req.team);
    return SendResponse(res, 200, true, 'Registration status fetched successfully.', status);
});
const getHackathonRegistrations = asyncHandler(async (req, res) => {
    const registrations = await RegistrationService.getHackathonRegistrations(
        req.hackathon,
        req.query
    );
    return SendResponse(res, 200, true, 'Registrations fetched successfully.', registrations);
});
const approveRegistration = asyncHandler(async (req, res) => {
    const registration = await RegistrationService.approveRegistration(
        req.registration,
        req.user._id
    );
    return SendResponse(res, 200, true, 'Registration approved successfully.', registration);
});
const rejectRegistration = asyncHandler(async (req, res) => {
    const registration = await RegistrationService.rejectRegistration(
        req.registration,
        req.user._id
    );
    return SendResponse(res, 200, true, 'Registration rejected successfully.', registration);
});
export default {
    registerTeam: registerTeam,
    cancelRegistration: cancelRegistration,
    getRegistrationStatus: getRegistrationStatus,
    getHackathonRegistrations: getHackathonRegistrations,
    approveRegistration: approveRegistration,
    rejectRegistration: rejectRegistration,
};
