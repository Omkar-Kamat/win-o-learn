import AsyncHandler from '../middlewares/AsyncHandler.js';
import UserService from '../services/User.service.js';
import SendResponse from '../utils/SendResponse.js';
class UserController {
  // Retrieves profile by executing underlying operations (getProfile). Constructs and sends the final API response to the client. 
  getProfile = AsyncHandler(async (req, res) => {
    const user = await UserService.getProfile(req.user._id);
    SendResponse(res, 200, true, 'Profile fetched successfully', user);
  });
  // Updates an existing profile by executing underlying operations (updateProfile). Constructs and sends the final API response to the client. 
  updateProfile = AsyncHandler(async (req, res) => {
    const user = await UserService.updateProfile(req.user._id, req.body);
    SendResponse(res, 200, true, 'Profile updated successfully', user);
  });
  // Uploads avatar by executing underlying operations (uploadAvatar). Constructs and sends the final API response to the client. 
  uploadAvatar = AsyncHandler(async (req, res) => {
    const user = await UserService.uploadAvatar(req.user._id, req.file);
    SendResponse(res, 200, true, 'Avatar updated successfully', user);
  });
  // Retrieves all users by executing underlying operations (getAllUsers). Constructs and sends the final API response to the client. 
  getAllUsers = AsyncHandler(async (req, res) => {
    const users = await UserService.getAllUsers(req.query);
    SendResponse(res, 200, true, 'Users fetched successfully', users);
  });
  // Retrieves user by id by executing underlying operations (getUserById). Constructs and sends the final API response to the client. 
  getUserById = AsyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.params.id);
    SendResponse(res, 200, true, 'User fetched successfully', user);
  });
  // Updates an existing user by executing underlying operations (updateUser). Constructs and sends the final API response to the client. 
  updateUser = AsyncHandler(async (req, res) => {
    const user = await UserService.updateUser(req.params.id, req.body);
    SendResponse(res, 200, true, 'User updated successfully', user);
  });
  // Removes the specified user by executing underlying operations (deleteUser). Constructs and sends the final API response to the client. 
  deleteUser = AsyncHandler(async (req, res) => {
    await UserService.deleteUser(req.params.id, req.user._id);
    SendResponse(res, 200, true, 'User deleted successfully');
  });
  // Blocks user by executing underlying operations (blockUser). Constructs and sends the final API response to the client. 
  blockUser = AsyncHandler(async (req, res) => {
    const user = await UserService.blockUser(req.params.id, req.user._id);
    SendResponse(res, 200, true, 'User blocked successfully', user);
  });
  // Unblocks user by executing underlying operations (unblockUser). Constructs and sends the final API response to the client. 
  unblockUser = AsyncHandler(async (req, res) => {
    const user = await UserService.unblockUser(req.params.id);
    SendResponse(res, 200, true, 'User unblocked successfully', user);
  });
  // Updates an existing role by executing underlying operations (updateRole). Constructs and sends the final API response to the client. 
  updateRole = AsyncHandler(async (req, res) => {
    const user = await UserService.updateRole(req.params.id, req.body.role);
    SendResponse(res, 200, true, 'User role updated successfully', user);
  });
}
export default new UserController();