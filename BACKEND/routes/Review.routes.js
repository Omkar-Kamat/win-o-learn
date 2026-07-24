import { Router } from "express";
import VerifyToken from "../middlewares/VerifyToken.js";
import AuthorizeRoles from "../middlewares/AuthorizeRoles.js";
import { ROLES } from "../utils/Constants.js";
import LoadReview from "../middlewares/LoadReview.js"
import HasHackathonAccess from "../middlewares/HasHackathonAccess.js"
import ReviewController from "../controllers/Review.controller.js"

const router = Router();
router.put(
  "/:id",
  VerifyToken,
  AuthorizeRoles(ROLES.JUDGE),
  LoadReview,
  HasHackathonAccess({
    allowJudge: true,
  }),
  ReviewController.updateReview,
);
router.get(
  "/:id",
  VerifyToken,
  LoadReview,
  HasHackathonAccess({
    allowAdmin: true,
    allowOrganizer: true,
    allowJudge: true,
  }),
  ReviewController.getReview,
);
export default router;
