import UserRepository from '../repository/User.repository.js';
import ApiError from '../utils/ApiError.js';
import cloudinary from '../config/Cloudinary.js';
class UserService {
  // Retrieves profile by executing underlying operations (findById). Validates inputs and throws an error if user not found. 
  async getProfile(userId) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.toJSON();
  }
  // Updates an existing profile by executing underlying operations (updateById). Validates inputs and throws an error if user not found. 
  async updateProfile(userId, data) {
    const user = await UserRepository.updateById(userId, data);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.toJSON();
  }
  // Retrieves all users by executing underlying operations (findAll). 
  async getAllUsers(query) {
    let {
      search: search,
      role: role,
      isBlocked: isBlocked,
      page = 1,
      limit = 20
    } = query;
    page = Number(page);
    limit = Number(limit);
    if (page < 1) page = 1;
    if (limit < 1) {
      limit = 20;
    }
    if (limit > 100) {
      limit = 100;
    }
    if (isBlocked !== undefined) {
      isBlocked = isBlocked === 'true';
    }
    const {
      users: users,
      total: total
    } = await UserRepository.findAll({
      search: search,
      role: role,
      isBlocked: isBlocked,
      page: page,
      limit: limit
    });
    return {
      users: users,
      pagination: {
        totalUsers: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit: limit
      }
    };
  }
  // Retrieves user by id by executing underlying operations (findById). Validates inputs and throws an error if user not found. 
  async getUserById(id) {
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.toJSON();
  }
  // Updates an existing user by executing underlying operations (updateById). Validates inputs and throws an error if user not found. 
  async updateUser(id, data) {
    const user = await UserRepository.updateById(id, data);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.toJSON();
  }
  // Removes the specified user by executing underlying operations (deleteById). Includes validation checks preventing actions if you cannot delete your own account or user not found. 
  async deleteUser(id, currentUserId) {
    if (id === currentUserId.toString()) {
      throw new ApiError(400, 'You cannot delete your own account');
    }
    const user = await UserRepository.deleteById(id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }
    return;
  }
  // Blocks user by executing underlying operations (setBlockedStatus). Includes validation checks preventing actions if you cannot block your own account or user not found. 
  async blockUser(id, currentUserId) {
    if (id === currentUserId.toString()) {
      throw new ApiError(400, 'You cannot block your own account');
    }
    const user = await UserRepository.setBlockedStatus(id, true);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.toJSON();
  }
  // Unblocks user by executing underlying operations (setBlockedStatus). Validates inputs and throws an error if user not found. 
  async unblockUser(id) {
    const user = await UserRepository.setBlockedStatus(id, false);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.toJSON();
  }
  // Updates an existing role by executing underlying operations (updateRole). Validates inputs and throws an error if user not found. 
  async updateRole(id, role) {
    const user = await UserRepository.updateRole(id, role);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }
    return user.toJSON();
  }
  // Uploads avatar by executing underlying operations (findById, updateAvatar). Includes validation checks preventing actions if avatar image is required or user not found. 
  async uploadAvatar(userId, file) {
    if (!file) {
      throw new ApiError(400, 'Avatar image is required');
    }
    const currentUser = await UserRepository.findById(userId);
    if (!currentUser) {
      throw new ApiError(404, 'User not found');
    }
    if (currentUser.avatarPublicId) {
      await cloudinary.uploader.destroy(currentUser.avatarPublicId);
    }
    const updatedUser = await UserRepository.updateAvatar(userId, file.path, file.filename);
    return updatedUser.toJSON();
  }
}
export default new UserService();