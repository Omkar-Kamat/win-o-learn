/**
 * File: Review.controller.js
 * Description: Implementation of Review.controller.js
 */

import AsyncHandler from '../middlewares/AsyncHandler.js';
import ReviewService from '../services/Review.service.js';
import SendResponse from '../utils/SendResponse.js';

// Submit review
const submitReview = AsyncHandler(async (req, res) => {
    const review = await ReviewService.submitReview(
        req.submission,
        req.user._id,
        req.body
    );

    return SendResponse(
        res,
        201,
        true,
        'Review submitted successfully.',
        review
    );
});

// Update review
const updateReview = AsyncHandler(async (req, res) => {
    const review = await ReviewService.updateReview(
        req.review,
        req.user._id,
        req.body
    );

    return SendResponse(
        res,
        200,
        true,
        'Review updated successfully.',
        review
    );
});

// Get review
const getReview = AsyncHandler(async (req, res) => {
    const review = await ReviewService.getReview(req.review);

    return SendResponse(
        res,
        200,
        true,
        'Review retrieved successfully.',
        review
    );
});

// Get reviews for a submission
const getSubmissionReviews = AsyncHandler(async (req, res) => {
    const reviews = await ReviewService.getSubmissionReviews(
        req.submission._id
    );

    return SendResponse(
        res,
        200,
        true,
        'Reviews retrieved successfully.',
        reviews
    );
});

// Get reviews for a hackathon
const getHackathonReviews = AsyncHandler(async (req, res) => {
    const reviews = await ReviewService.getHackathonReviews(
        req.hackathon._id
    );

    return SendResponse(
        res,
        200,
        true,
        'Reviews retrieved successfully.',
        reviews
    );
});

// Get logged-in judge reviews
const getMyReviews = AsyncHandler(async (req, res) => {
    const reviews = await ReviewService.getJudgeReviews(
        req.user._id
    );

    return SendResponse(
        res,
        200,
        true,
        'Reviews retrieved successfully.',
        reviews
    );
});

export default {
    submitReview,
    updateReview,
    getReview,
    getSubmissionReviews,
    getHackathonReviews,
    getMyReviews,
};