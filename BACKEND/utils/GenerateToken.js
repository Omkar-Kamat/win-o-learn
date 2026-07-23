/**
 * File: GenerateToken.js
 * Description: Implementation of GenerateToken.js
 */
import jwt from 'jsonwebtoken';
export // Performs the generate access token operation
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        }
    );
};


export // Performs the generate refresh token operation
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        }
    );
};
