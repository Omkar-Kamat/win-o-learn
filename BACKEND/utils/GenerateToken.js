import jwt from 'jsonwebtoken';
export // Generates a new access token. 
// Generates a new access token using the provided parameters: user. 
const generateAccessToken = user => jwt.sign({
  id: user._id,
  role: user.role
}, process.env.JWT_SECRET, {
  expiresIn: process.env.JWT_EXPIRES_IN
});
export // Generates a new refresh token. 
// Generates a new refresh token using the provided parameters: user. 
const generateRefreshToken = user => jwt.sign({
  id: user._id
}, process.env.JWT_REFRESH_SECRET, {
  expiresIn: process.env.JWT_REFRESH_EXPIRES_IN
});