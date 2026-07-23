import ApiError from '../utils/ApiError.js';
import { ROLES } from '../utils/Constants.js';
// Checks the status of hackathon ownership. Validates inputs and throws an error if you are not authorized to manage this hackathon. 
const CheckHackathonOwnership = ({
  allowAdminOverride = false
} = {}) => (req, res, next) => {
  if (allowAdminOverride && req.user.role === ROLES.ADMIN) {
    return next();
  }
  if (req.hackathon.organizer._id.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You are not authorized to manage this hackathon');
  }
  next();
};
export default CheckHackathonOwnership;