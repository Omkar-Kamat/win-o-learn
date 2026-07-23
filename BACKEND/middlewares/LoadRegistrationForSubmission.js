/**
 * File: LoadRegistrationForSubmission.js
 * Description: Implementation of LoadRegistrationForSubmission.js
 */
import asyncHandler from './AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import RegistrationRepository from '../repository/Registration.repository.js';

// Performs the load registration for submission operation
const LoadRegistrationForSubmission = (options = {}) =>
    asyncHandler(async (req, res, next) => {
        const { requireLeader = false, requireMember = false } = options;
        const registration = await RegistrationRepository.findByHackathonAndUser(
            req.params.hackathonId,
            req.user._id
        );
        if (!registration || !registration.team) {
            throw new ApiError(404, 'Registration not found.');
        }
        const team = registration.team;
        const leaderId = team.leader._id ?? team.leader;
        if (requireLeader && !leaderId.equals(req.user._id)) {
            throw new ApiError(403, 'Only the team leader can perform this action.');
        }
        if (
            requireMember &&
            !(
                leaderId.equals(req.user._id) ||
                team.members.some((member) => (member._id ?? member).equals(req.user._id))
            )
        ) {
            throw new ApiError(403, 'You are not a member of this team.');
        }
        req.registration = registration;
        req.team = team;
        next();
    });

export default LoadRegistrationForSubmission;
