import User from '../models/User.model.js';
const findByEmail = (email) => User.findOne({ email: email }).select('+password +refreshToken');
const findById = (id) => User.findById(id);
const findByIdWithPassword = (id) => User.findById(id).select('+password');
const create = (userData) => User.create(userData);
const updateRefreshToken = (id, refreshToken) =>
    User.findByIdAndUpdate(id, { refreshToken: refreshToken }, { new: true });
const clearRefreshToken = (id) =>
    User.findByIdAndUpdate(id, { $unset: { refreshToken: '' } }, { new: true });
const updatePassword = async (id, password) => {
    const user = await User.findById(id).select('+password');
    user.password = password;
    return user.save();
};
const saveResetPasswordToken = (id, token, expires) =>
    User.findByIdAndUpdate(
        id,
        { resetPasswordToken: token, resetPasswordExpires: expires },
        { new: true }
    );
const findByResetToken = (token) =>
    User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } }).select(
        '+password +resetPasswordToken +resetPasswordExpires'
    );
const findByIdWithRefreshToken = (id) => User.findById(id).select('+refreshToken');
const updateById = (id, fields) =>
    User.findByIdAndUpdate(id, fields, { new: true, runValidators: true });
const updateAvatar = (id, avatar, avatarPublicId) =>
    User.findByIdAndUpdate(
        id,
        { avatar: avatar, avatarPublicId: avatarPublicId },
        { new: true, runValidators: true }
    );
const findAll = async ({
    search: search = '',
    role: role,
    isBlocked: isBlocked,
    page: page = 1,
    limit: limit = 20,
}) => {
    const filter = {};
    if (search) {
        filter.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
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
        .sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    return { users: users, total: total };
};
const deleteById = (id) => User.findByIdAndDelete(id);
const setBlockedStatus = (id, isBlocked) =>
    User.findByIdAndUpdate(id, { isBlocked: isBlocked }, { new: true, runValidators: true });
const updateRole = (id, role) =>
    User.findByIdAndUpdate(id, { role: role }, { new: true, runValidators: true });
export default {
    findByEmail: findByEmail,
    findById: findById,
    findByIdWithPassword: findByIdWithPassword,
    findByIdWithRefreshToken: findByIdWithRefreshToken,
    create: create,
    updateRefreshToken: updateRefreshToken,
    clearRefreshToken: clearRefreshToken,
    updatePassword: updatePassword,
    saveResetPasswordToken: saveResetPasswordToken,
    findByResetToken: findByResetToken,
    updateById: updateById,
    updateAvatar: updateAvatar,
    findAll: findAll,
    deleteById: deleteById,
    setBlockedStatus: setBlockedStatus,
    updateRole: updateRole,
};
