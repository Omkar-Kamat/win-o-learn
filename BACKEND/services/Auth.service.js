import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import UserRepository from '../repository/User.repository.js';
import ApiError from '../utils/ApiError.js';
import { generateAccessToken, generateRefreshToken } from '../utils/GenerateToken.js';
class AuthService {
  // Registers a new user account by executing underlying operations (findByEmail, create, updateRefreshToken). Validates inputs and throws an error if email already exists. 
  async signup(data) {
    const {
      name: name,
      email: email,
      password: password,
      role: role
    } = data;
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'Email already exists');
    }
    const user = await UserRepository.create({
      name: name,
      email: email,
      password: password,
      role: role
    });
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await UserRepository.updateRefreshToken(user._id, refreshToken);
    return {
      user: user.toJSON(),
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }
  // Authenticates and starts a user session by executing underlying operations (findByEmail, updateRefreshToken). Includes validation checks preventing actions if invalid email or password or your account has been blocked. 
  async login(email, password) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(401, 'Invalid email or password');
    }
    if (user.isBlocked) {
      throw new ApiError(403, 'Your account has been blocked');
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    await UserRepository.updateRefreshToken(user._id, refreshToken);
    return {
      user: user.toJSON(),
      accessToken: accessToken,
      refreshToken: refreshToken
    };
  }
  // Terminates the current user session by executing underlying operations (clearRefreshToken). 
  async logout(userId) {
    await UserRepository.clearRefreshToken(userId);
  }
  // Retrieves me. 
  async getMe(user) {
    return user.toJSON();
  }
  // Refreshes token by executing underlying operations (findByIdWithRefreshToken). Includes validation checks preventing actions if refresh token is required or invalid refresh token. 
  async refreshToken(token) {
    if (!token) {
      throw new ApiError(401, 'Refresh token is required');
    }
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      throw new ApiError(401, 'Invalid refresh token');
    }
    const user = await UserRepository.findByIdWithRefreshToken(decoded.id);
    if (!user) {
      throw new ApiError(401, 'User not found');
    }
    if (!user.refreshToken || !user.refreshToken.includes(token)) {
      throw new ApiError(401, 'Refresh token mismatch');
    }
    const accessToken = generateAccessToken(user);
    return {
      accessToken: accessToken
    };
  }
  // Changes password by executing underlying operations (findByIdWithPassword, updatePassword). Includes validation checks preventing actions if user not found or old password is incorrect. 
  async changePassword(userId, oldPassword, newPassword) {
    const user = await UserRepository.findByIdWithPassword(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Old password is incorrect');
    }
    await UserRepository.updatePassword(userId, newPassword);
    await UserRepository.clearRefreshToken(userId);
  }
  // Forgots password by orchestrating multiple underlying operations. 
  async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return;
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = Date.now() + 1e3 * 60 * 15;
    await UserRepository.saveResetPasswordToken(user._id, hashedToken, expires);
    return resetToken;
  }
  // Resets password by executing underlying operations (createHash, findByResetToken). Validates inputs and throws an error if invalid or expired reset token. 
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await UserRepository.findByResetToken(hashedToken);
    if (!user) {
      throw new ApiError(400, 'Invalid or expired reset token');
    }
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshToken = undefined;
    await user.save();
  }
}
export default new AuthService();