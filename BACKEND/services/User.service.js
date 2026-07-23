import UserRepository from '../repository/User.repository.js';
import ApiError from '../utils/ApiError.js';
import cloudinary from '../config/Cloudinary.js';
class UserService {
    async getProfile(userId) {
        const user = await UserRepository.findById(userId);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        return user.toJSON();
    }
    async updateProfile(userId, data) {
        const user = await UserRepository.updateById(userId, data);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        return user.toJSON();
    }
    async getAllUsers(query) {
        let {
            search: search,
            role: role,
            isBlocked: isBlocked,
            page: page = 1,
            limit: limit = 20,
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
        const { users: users, total: total } = await UserRepository.findAll({
            search: search,
            role: role,
            isBlocked: isBlocked,
            page: page,
            limit: limit,
        });
        return {
            users: users,
            pagination: {
                totalUsers: total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit: limit,
            },
        };
    }
    async getUserById(id) {
        const user = await UserRepository.findById(id);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        return user.toJSON();
    }
    async updateUser(id, data) {
        const user = await UserRepository.updateById(id, data);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        return user.toJSON();
    }
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
    async unblockUser(id) {
        const user = await UserRepository.setBlockedStatus(id, false);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        return user.toJSON();
    }
    async updateRole(id, role) {
        const user = await UserRepository.updateRole(id, role);
        if (!user) {
            throw new ApiError(404, 'User not found');
        }
        return user.toJSON();
    }
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
