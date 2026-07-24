import { Router } from "express";
import AuthController from "../controllers/Auth.controller.js";
import VerifyToken from "../middlewares/VerifyToken.js";
import {
  validateSignup,
  validateLogin,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
} from "../validators/Auth.validator.js";
import { authLimiter } from "../middlewares/RateLimiter.js";
const router = Router();
router.post("/signup", authLimiter, validateSignup, AuthController.signup);
router.post("/login", authLimiter, validateLogin, AuthController.login);
router.post("/logout", VerifyToken, AuthController.logout);
router.get("/me", VerifyToken, AuthController.getMe);
router.post("/refresh-token", AuthController.refreshToken);
router.put(
  "/change-password",
  VerifyToken,
  validateChangePassword,
  AuthController.changePassword,
);
router.post(
  "/forgot-password",
  authLimiter,
  validateForgotPassword,
  AuthController.forgotPassword,
);
router.post(
  "/reset-password/:token",
  validateResetPassword,
  AuthController.resetPassword,
);
export default router;
