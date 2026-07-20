import AsyncHandler from "../middlewares/AsyncHandler.js";
import UserService from "../services/User.service.js";
import SendResponse from "../utils/SendResponse.js";

class UserController {

    getProfile = AsyncHandler(async (req, res) => {
    const user = await UserService.getProfile(req.user._id);
    SendResponse(res, 200, true, "Profile fetched successfully", user);
    });

    updateProfile = AsyncHandler(async (req, res) => {
    const user = await UserService.updateProfile(req.user._id, req.body);
    SendResponse(res, 200, true, "Profile updated successfully", user);
    });

    uploadAvatar = AsyncHandler(async (req, res) => {
    const user = await UserService.uploadAvatar(req.user._id, req.file);
    SendResponse(res, 200, true, "Avatar updated successfully", user);
    });

    getAllUsers = AsyncHandler(async (req, res) => {
    const users = await UserService.getAllUsers(req.query);
    SendResponse(res, 200, true, "Users fetched successfully", users);
    });

    getUserById = AsyncHandler(async (req, res) => {
    const user = await UserService.getUserById(req.params.id);
    SendResponse(res, 200, true, "User fetched successfully", user);
    });

    updateUser = AsyncHandler(async (req, res) => {
    const user = await UserService.updateUser(req.params.id, req.body);
    SendResponse(res, 200, true, "User updated successfully", user);
    });

    deleteUser = AsyncHandler(async (req, res) => {
    await UserService.deleteUser(req.params.id, req.user._id);
    SendResponse(res, 200, true, "User deleted successfully");
    });

    blockUser = AsyncHandler(async (req, res) => {
    const user = await UserService.blockUser(req.params.id, req.user._id);
    SendResponse(res, 200, true, "User blocked successfully", user);
    });

    unblockUser = AsyncHandler(async (req, res) => {
    const user = await UserService.unblockUser(req.params.id);
    SendResponse(res, 200, true, "User unblocked successfully", user);
    });

    updateRole = AsyncHandler(async (req, res) => {
    const user = await UserService.updateRole(req.params.id, req.body.role);
    SendResponse(res, 200, true, "User role updated successfully", user);
    });

}

export default new UserController();