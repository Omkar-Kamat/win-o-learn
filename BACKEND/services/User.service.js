/**
 * File: User.service.js
 * Description: Implementation of User.service.js
 */
import UserRepository from '../repository/User.repository.js';
import ApiError from '../utils/ApiError.js';
import cloudinary from '../config/Cloudinary.js';

class UserService {
    // Retrieves the profile data
    async getProfile(userId) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return user.toJSON();
    }

    // Updates the profile data
    async updateProfile(userId, data) {
        const user = await UserRepository.updateById(userId, data);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return user.toJSON();
    }

    // Retrieves the all users data
    async getAllUsers(query) {
        let { search, role, isBlocked, page = 1, limit = 20 } = query;
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
        const { users, total } = await UserRepository.findAll({
            search,
            role,
            isBlocked,
            page,
            limit,
        });

        return {
            users,
            pagination: {
                totalUsers: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit,
            },
        };
    }

    // Retrieves the user by id data
    async getUserById(id) {
        const user = await UserRepository.findById(id);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return user.toJSON();
    }

    // Updates the user data
    async updateUser(id, data) {
        const user = await UserRepository.updateById(id, data);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return user.toJSON();
    }

    // Removes the user
    async deleteUser(id, currentUserId) {
        if (id === currentUserId.toString()) {
            throw new ApiError(400, 'You cannot delete your own account');
        }
        const user = await UserRepository.deleteById(id);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        return;
    }

    // Performs the block user operation
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

    // Performs the unblock user operation
    async unblockUser(id) {
        const user = await UserRepository.setBlockedStatus(id, false);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return user.toJSON();
    }

    // Updates the role data
    async updateRole(id, role) {
        const user = await UserRepository.updateRole(id, role);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return user.toJSON();
    }

    // Performs the upload avatar operation
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
