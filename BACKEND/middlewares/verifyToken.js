import jwt from "jsonwebtoken";

import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new ApiError(401, "Access token is required"));
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ApiError(401, "User not found"));
    }

    if (user.isBlocked) {
      return next(new ApiError(403, "Your account has been blocked"));
    }

    req.user = user;

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ApiError(401, "Access token has expired"));
    }

    if (err.name === "JsonWebTokenError") {
      return next(new ApiError(401, "Invalid access token"));
    }

    next(err);
  }
};

export default verifyToken;