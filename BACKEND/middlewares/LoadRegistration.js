/**
 * File: LoadRegistration.js
 * Description: Implementation of LoadRegistration.js
 */
import asyncHandler from './AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import RegistrationRepository from '../repository/Registration.repository.js';

// Performs the load registration operation
const LoadRegistration = asyncHandler(async (req, res, next) => {
    const registration = await RegistrationRepository.findById(req.params.registrationId);
    if (!registration) {
        throw new ApiError(404, 'Registration not found.');
    }
    req.registration = registration;
    req.hackathon = registration.hackathon;
    next();
});


export default LoadRegistration;
