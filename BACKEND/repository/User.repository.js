import User from "../models/User.model.js";

const findByEmail = (email) => {
  return User.findOne({ email }).select("+password +refreshToken");
};

const findById = (id) => {
  return User.findById(id);
};

const findByIdWithPassword = (id) => {
    return User.findById(id).select("+password");
};

const create = (userData) => {
  return User.create(userData);
};

const updateRefreshToken = (id, refreshToken) => {
  return User.findByIdAndUpdate(
    id,
    { refreshToken },
    { new: true }
  );
};

const clearRefreshToken = (id) => {
  return User.findByIdAndUpdate(
    id,
    { $unset: { refreshToken: "" } },
    { new: true }
  );
};

const updatePassword = async (id, password) => {
  const user = await User.findById(id).select("+password");

  user.password = password;
  return user.save();
};

const saveResetPasswordToken = (id, token, expires) => {
  return User.findByIdAndUpdate(
    id,
    {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    },
    { new: true }
  );
};

const findByResetToken = (token) => {
  return User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password +resetPasswordToken +resetPasswordExpires");
};

const findByIdWithRefreshToken = (id) => {
  return User.findById(id).select("+refreshToken");
};

const updateById = (id, fields) => {
  return User.findByIdAndUpdate(id, fields, {
    new: true,
    runValidators: true,
  });
};

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

const findAll = async ({
  search = "",
  role,
  isBlocked,
  page = 1,
  limit = 20,
}) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  if (role) {
    filter.role = role;
  }

  if (typeof isBlocked !== "undefined") {
    filter.isBlocked = isBlocked;
  }

  limit = Math.min(Math.max(limit, 1), 100);

  const users = await User.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(filter);

  return { users, total };
};

const deleteById = (id) => {
  return User.findByIdAndDelete(id);
};

const setBlockedStatus = (id, isBlocked) => {
  return User.findByIdAndUpdate(
    id,
    { isBlocked },
    {
      new: true,
      runValidators: true,
    }
  );
};

const updateRole = (id, role) => {
  return User.findByIdAndUpdate(
    id,
    { role },
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