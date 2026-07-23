import ApiError from '../utils/ApiError.js';
import { ROLES } from '../utils/Constants.js';
const CheckHackathonOwnership =
    ({ allowAdminOverride: allowAdminOverride = false } = {}) =>
    (req, res, next) => {
        if (allowAdminOverride && req.user.role === ROLES.ADMIN) {
            return next();
        }
        if (req.hackathon.organizer._id.toString() !== req.user._id.toString()) {
            throw new ApiError(403, 'You are not authorized to manage this hackathon');
        }
        next();
    };
export default CheckHackathonOwnership;
