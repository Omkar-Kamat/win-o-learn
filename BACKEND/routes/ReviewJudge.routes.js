import { Router } from 'express';
import VerifyToken from '../middlewares/VerifyToken.js';
import AuthorizeRoles from '../middlewares/AuthorizeRoles.js';
import { ROLES } from '../utils/Constants.js';
import ReviewController from '../controllers/Review.controller.js';

const router = Router();
router.get('/me/reviews', VerifyToken, AuthorizeRoles(ROLES.JUDGE), ReviewController.getMyReviews);

export default router;
