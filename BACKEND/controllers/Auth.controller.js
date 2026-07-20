import CookieOptions from "../utils/CookieOptions.js";
import AsyncHandler from "../middlewares/AsyncHandler.js";
import AuthService from "../services/Auth.service.js";
import SendResponse from "../utils/SendResponse.js";

class AuthController {
  signup = AsyncHandler(async (req, res) => {
    const result = await AuthService.signup(req.body);

    res.cookie("refreshToken", result.refreshToken, CookieOptions);

    delete result.refreshToken;

    SendResponse(res, 201, true, "User registered successfully", result);
  });

  login = AsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);

    res.cookie("refreshToken", result.refreshToken, CookieOptions);

    delete result.refreshToken;

    SendResponse(res, 200, true, "Login successful", result);
  });

  logout = AsyncHandler(async (req, res) => {
    await AuthService.logout(req.user._id);

    res.clearCookie("refreshToken", CookieOptions);

    SendResponse(res, 200, true, "Logout successful");
  });

  getMe = AsyncHandler(async (req, res) => {
    const user = await AuthService.getMe(req.user);

    SendResponse(res, 200, true, "User profile fetched successfully", user);
  });

  refreshToken = AsyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;

    const result = await AuthService.refreshToken(refreshToken);

    SendResponse(res, 200, true, "Access token refreshed", result);
  });

  changePassword = AsyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    await AuthService.changePassword(
      req.user._id,
      oldPassword,
      newPassword
    );

    SendResponse(res, 200, true, "Password changed successfully");
  });

  forgotPassword = AsyncHandler(async (req, res) => {
    const { email } = req.body;

    const resetToken = await AuthService.forgotPassword(email);

    SendResponse(
      res,
      200,
      true,
      "Password reset instructions generated",
      process.env.NODE_ENV === "development"
        ? { resetToken }
        : null
    );
  });

  resetPassword = AsyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    await AuthService.resetPassword(token, password);

    SendResponse(res, 200, true, "Password reset successful");
  });
}

export default new AuthController();