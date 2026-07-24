import { Router } from 'express';
import VerifyToken from '../middlewares/VerifyToken.js';
import LoadHackathon from '../middlewares/LoadHackathon.js';
import HasHackathonAccess from '../middlewares/HasHackathonAccess.js';
import ReviewController from '../controllers/Review.controller.js';

const router = Router();
router.get('/:hackathonId/reviews', VerifyToken, LoadHackathon, HasHackathonAccess({
  allowAdmin: true,
  allowOrganizer: true
}), ReviewController.getHackathonReviews);

export default router;
