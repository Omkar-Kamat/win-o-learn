/**
 * File: LoadReview.js
 * Description: Middleware to load a review by id.
 */

import AsyncHandler from './AsyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ReviewRepository from '../repository/Review.repository.js';

const LoadReview = AsyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const review = await ReviewRepository.findById(id);

    if (!review) {
        throw new ApiError(404, 'Review not found.');
    }

    req.review = review;

    next();
});

export default LoadReview;