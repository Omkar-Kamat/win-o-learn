import AsyncHandler from '../middlewares/AsyncHandler.js';
import ReviewService from '../services/Review.service.js';
import SendResponse from '../utils/SendResponse.js';
const submitReview = AsyncHandler(async (req, res) => {
  const review = await ReviewService.submitReview(req.submission, req.user._id, req.body);
  return SendResponse(res, 201, true, 'Review submitted successfully.', review);
});
const updateReview = AsyncHandler(async (req, res) => {
  const review = await ReviewService.updateReview(req.review, req.user._id, req.body);
  return SendResponse(res, 200, true, 'Review updated successfully.', review);
});
const getReview = AsyncHandler(async (req, res) => {
  const review = await ReviewService.getReview(req.review);
  return SendResponse(res, 200, true, 'Review retrieved successfully.', review);
});
const getSubmissionReviews = AsyncHandler(async (req, res) => {
  const reviews = await ReviewService.getSubmissionReviews(req.submission._id);
  return SendResponse(res, 200, true, 'Reviews retrieved successfully.', reviews);
});
const getHackathonReviews = AsyncHandler(async (req, res) => {
  const reviews = await ReviewService.getHackathonReviews(req.hackathon._id);
  return SendResponse(res, 200, true, 'Reviews retrieved successfully.', reviews);
});
const getMyReviews = AsyncHandler(async (req, res) => {
  const reviews = await ReviewService.getJudgeReviews(req.user._id);
  return SendResponse(res, 200, true, 'Reviews retrieved successfully.', reviews);
});
export default {
  submitReview: submitReview,
  updateReview: updateReview,
  getReview: getReview,
  getSubmissionReviews: getSubmissionReviews,
  getHackathonReviews: getHackathonReviews,
  getMyReviews: getMyReviews
};