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
};