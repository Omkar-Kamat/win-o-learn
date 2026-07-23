/**
 * File: HasHackathonAccess.js
 * Description: Generic middleware for hackathon resource authorization.
 */

import AsyncHandler from './AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import JudgeAssignmentRepository from '../repository/JudgeAssignment.repository.js';
import { ROLES } from '../utils/Constants.js';

const HasHackathonAccess = ({
    allowAdmin = false,
    allowOrganizer = false,
    allowJudge = false,
} = {}) => {
    return AsyncHandler(async (req, res, next) => {
        const { user } = req;

        let hackathon = null;

        /**
         * Determine the hackathon from the loaded resource.
         */

        // LoadHackathon
        if (req.hackathon) {
            hackathon = req.hackathon;
        }

        // LoadSubmission
        else if (req.submission?.registration?.hackathon) {
            hackathon = req.submission.registration.hackathon;
        }

        // LoadReview
        else if (req.review?.hackathon) {
            hackathon = req.review.hackathon;
        }

        if (!hackathon) {
            throw new ApiError(
                500,
                'Unable to determine the hackathon for authorization.'
            );
        }

        /**
         * Admin
         */
        if (allowAdmin && user.role === ROLES.ADMIN) {
            return next();
        }

        /**
         * Organizer
         */
        if (allowOrganizer && user.role === ROLES.ORGANIZER) {
            if (String(hackathon.organizer) === String(user._id)) {
                return next();
            }
        }

        /**
         * Judge
         */
        if (allowJudge && user.role === ROLES.JUDGE) {
            const assignment =
                await JudgeAssignmentRepository.findByHackathonAndJudge(
                    hackathon._id,
                    user._id
                );

            if (assignment) {
                return next();
            }
        }

        throw new ApiError(
            403,
            'You are not authorized to access this resource.'
        );
    });
};

export default HasHackathonAccess;