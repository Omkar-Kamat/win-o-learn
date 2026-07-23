import jwt from 'jsonwebtoken';
import UserRepository from '../repository/User.repository.js';
import ApiError from '../utils/ApiError.js';
const VerifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'Access token is required');
        }
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await UserRepository.findById(decoded.id);
        if (!user) {
            throw new ApiError(401, 'User not found');
        }
        if (user.isBlocked) {
            throw new ApiError(403, 'Your account has been blocked');
        }
        req.user = user;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return next(new ApiError(401, 'Access token has expired'));
        }
        if (err.name === 'JsonWebTokenError') {
            return next(new ApiError(401, 'Invalid access token'));
        }
        next(err);
    }
};
export default VerifyToken;
