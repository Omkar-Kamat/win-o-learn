import CookieOptions from '../utils/CookieOptions.js';
import AsyncHandler from '../middlewares/AsyncHandler.js';
import AuthService from '../services/Auth.service.js';
import SendResponse from '../utils/SendResponse.js';
class AuthController {
  // Registers a new user account by executing underlying operations (signup). Constructs and sends the final API response to the client. 
  signup = AsyncHandler(async (req, res) => {
    const result = await AuthService.signup(req.body);
    res.cookie('refreshToken', result.refreshToken, CookieOptions);
    delete result.refreshToken;
    SendResponse(res, 201, true, 'User registered successfully', result);
  });
  // Authenticates and starts a user session by executing underlying operations (login). Constructs and sends the final API response to the client. 
  login = AsyncHandler(async (req, res) => {
    const {
      email: email,
      password: password
    } = req.body;
    const result = await AuthService.login(email, password);
    res.cookie('refreshToken', result.refreshToken, CookieOptions);
    delete result.refreshToken;
    SendResponse(res, 200, true, 'Login successful', result);
  });
  // Terminates the current user session by executing underlying operations (logout). Constructs and sends the final API response to the client. 
  logout = AsyncHandler(async (req, res) => {
    await AuthService.logout(req.user._id);
    res.clearCookie('refreshToken', CookieOptions);
    SendResponse(res, 200, true, 'Logout successful');
  });
  // Retrieves me by executing underlying operations (getMe). Constructs and sends the final API response to the client. 
  getMe = AsyncHandler(async (req, res) => {
    const user = await AuthService.getMe(req.user);
    SendResponse(res, 200, true, 'User profile fetched successfully', user);
  });
  // Refreshes token by executing underlying operations (refreshToken). Constructs and sends the final API response to the client. 
  refreshToken = AsyncHandler(async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const result = await AuthService.refreshToken(refreshToken);
    SendResponse(res, 200, true, 'Access token refreshed', result);
  });
  // Changes password by executing underlying operations (changePassword). Constructs and sends the final API response to the client. 
  changePassword = AsyncHandler(async (req, res) => {
    const {
      oldPassword: oldPassword,
      newPassword: newPassword
    } = req.body;
    await AuthService.changePassword(req.user._id, oldPassword, newPassword);
    SendResponse(res, 200, true, 'Password changed successfully');
  });
  // Forgots password by executing underlying operations (forgotPassword). Constructs and sends the final API response to the client. 
  forgotPassword = AsyncHandler(async (req, res) => {
    const {
      email: email
    } = req.body;
    const resetToken = await AuthService.forgotPassword(email);
    SendResponse(res, 200, true, 'Password reset instructions generated', process.env.NODE_ENV === 'development' ? {
      resetToken: resetToken
    } : null);
  });
  // Resets password by executing underlying operations (resetPassword). Constructs and sends the final API response to the client. 
  resetPassword = AsyncHandler(async (req, res) => {
    const {
      token: token
    } = req.params;
    const {
      password: password
    } = req.body;
    await AuthService.resetPassword(token, password);
    SendResponse(res, 200, true, 'Password reset successful');
  });
}
export default new AuthController();