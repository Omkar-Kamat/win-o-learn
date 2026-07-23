/**
 * File: User.repository.js
 * Description: Implementation of User.repository.js
 */
import User from '../models/User.model.js';

// Performs the find by email operation
const findByEmail = (email) => {
    return User.findOne({
        email,
    }).select('+password +refreshToken');
};


// Performs the find by id operation
const findById = (id) => {
    return User.findById(id);
};


// Performs the find by id with password operation
const findByIdWithPassword = (id) => {
    return User.findById(id).select('+password');
};


// Creates a new create
const create = (userData) => {
    return User.create(userData);
};


// Updates the refresh token data
const updateRefreshToken = (id, refreshToken) => {
    return User.findByIdAndUpdate(
        id,
        {
            refreshToken,
        },
        {
            new: true,
        }
    );
};


// Performs the clear refresh token operation
const clearRefreshToken = (id) => {
    return User.findByIdAndUpdate(
        id,
        {
            $unset: {
                refreshToken: '',
            },
        },
        {
            new: true,
        }
    );
};


// Updates the password data
const updatePassword = async (id, password) => {
    const user = await User.findById(id).select('+password');
    user.password = password;

    return user.save();
};


// Performs the save reset password token operation
const saveResetPasswordToken = (id, token, expires) => {
    return User.findByIdAndUpdate(
        id,
        {
            resetPasswordToken: token,
            resetPasswordExpires: expires,
        },
        {
            new: true,
        }
    );
};


// Performs the find by reset token operation
const findByResetToken = (token) => {
    return User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: {
            $gt: Date.now(),
        },
    }).select('+password +resetPasswordToken +resetPasswordExpires');
};


// Performs the find by id with refresh token operation
const findByIdWithRefreshToken = (id) => {
    return User.findById(id).select('+refreshToken');
};


// Updates the by id data
const updateById = (id, fields) => {
    return User.findByIdAndUpdate(id, fields, {
        new: true,
        runValidators: true,
    });
};


// Updates the avatar data
const updateAvatar = (id, avatar, avatarPublicId) => {
    return User.findByIdAndUpdate(
        id,
        {
            avatar,
            avatarPublicId,
        },
        {
            new: true,
            runValidators: true,
        }
    );
};


// Performs the find all operation
const findAll = async ({ search = '', role, isBlocked, page = 1, limit = 20 }) => {
    const filter = {};
    if (search) {
        filter.$or = [
            {
                name: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                email: {
                    $regex: search,
                    $options: 'i',
                },
            },
        ];
    }
    if (role) {
        filter.role = role;
    }
    if (typeof isBlocked !== 'undefined') {
        filter.isBlocked = isBlocked;
    }
    limit = Math.min(Math.max(limit, 1), 100);
    const users = await User.find(filter)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({
            createdAt: -1,
        });
    const total = await User.countDocuments(filter);

    return {
        users,
        total,
    };
};


// Removes the by id
const deleteById = (id) => {
    return User.findByIdAndDelete(id);
};


// Updates the blocked status data
const setBlockedStatus = (id, isBlocked) => {
    return User.findByIdAndUpdate(
        id,
        {
            isBlocked,
        },
        {
            new: true,
            runValidators: true,
        }
    );
};


// Updates the role data
const updateRole = (id, role) => {
    return User.findByIdAndUpdate(
        id,
        {
            role,
        },
        {
            new: true,
            runValidators: true,
        }
    );
};


export default {
    findByEmail,
    findById,
    findByIdWithPassword,
    findByIdWithRefreshToken,
    create,
    updateRefreshToken,
    clearRefreshToken,
    updatePassword,
    saveResetPasswordToken,
    findByResetToken,
    updateById,
    updateAvatar,
    findAll,
    deleteById,
    setBlockedStatus,
    updateRole,
};
