import ApiError from "../utils/ApiError.js";

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          "You do not have permission to perform this action"
        )
      );
    }

    next();
  };
};

export default authorizeRoles;