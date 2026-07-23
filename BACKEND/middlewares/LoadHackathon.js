import HackathonRepository from '../repository/Hackathon.repository.js';
import ApiError from '../utils/ApiError.js';
import AsyncHandler from './AsyncHandler.js';
const LoadHackathon = AsyncHandler(async (req, res, next) => {
  const hackathon = await HackathonRepository.findById(req.params.hackathonId ?? req.params.id);
  if (!hackathon) {
    throw new ApiError(404, 'Hackathon not found');
  }
  req.hackathon = hackathon;
  next();
});
export default LoadHackathon;