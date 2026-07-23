import User from '../models/User.model.js';
// Searches and retrieves by email. 
const findByEmail = email => User.findOne({
  email: email
}).select('+password +refreshToken');
// Searches and retrieves by id. 
const findById = id => User.findById(id);
// Searches and retrieves by id with password. 
const findByIdWithPassword = id => User.findById(id).select('+password');
// Creates a new. 
const create = userData => User.create(userData);
// Updates an existing refresh token. 
const updateRefreshToken = (id, refreshToken) => User.findByIdAndUpdate(id, {
  refreshToken: refreshToken
}, {
  new: true
});
// Clears the refresh token. 
const clearRefreshToken = id => User.findByIdAndUpdate(id, {
  $unset: {
    refreshToken: ''
  }
}, {
  new: true
});
// Updates an existing password. 
const updatePassword = async (id, password) => {
  const user = await User.findById(id).select('+password');
  user.password = password;
  return user.save();
};
// Persists and saves reset password token. 
const saveResetPasswordToken = (id, token, expires) => User.findByIdAndUpdate(id, {
  resetPasswordToken: token,
  resetPasswordExpires: expires
}, {
  new: true
});
// Searches and retrieves by reset token. 
const findByResetToken = token => User.findOne({
  resetPasswordToken: token,
  resetPasswordExpires: {
    $gt: Date.now()
  }
}).select('+password +resetPasswordToken +resetPasswordExpires');
// Searches and retrieves by id with refresh token. 
const findByIdWithRefreshToken = id => User.findById(id).select('+refreshToken');
// Updates an existing by id. 
const updateById = (id, fields) => User.findByIdAndUpdate(id, fields, {
  new: true,
  runValidators: true
});
// Updates an existing avatar. 
const updateAvatar = (id, avatar, avatarPublicId) => User.findByIdAndUpdate(id, {
  avatar: avatar,
  avatarPublicId: avatarPublicId
}, {
  new: true,
  runValidators: true
});
// Searches and retrieves all. 
const findAll = async ({
  search = '',
  role: role,
  isBlocked: isBlocked,
  page = 1,
  limit = 20
}) => {
  const filter = {};
  if (search) {
    filter.$or = [{
      name: {
        $regex: search,
        $options: 'i'
      }
    }, {
      email: {
        $regex: search,
        $options: 'i'
      }
    }];
  }
  if (role) {
    filter.role = role;
  }
  if (typeof isBlocked !== 'undefined') {
    filter.isBlocked = isBlocked;
  }
  limit = Math.min(Math.max(limit, 1), 100);
  const users = await User.find(filter).skip((page - 1) * limit).limit(limit).sort({
    createdAt: -1
  });
  const total = await User.countDocuments(filter);
  return {
    users: users,
    total: total
  };
};
// Removes the specified by id. 
const deleteById = id => User.findByIdAndDelete(id);
// Updates blocked status. 
const setBlockedStatus = (id, isBlocked) => User.findByIdAndUpdate(id, {
  isBlocked: isBlocked
}, {
  new: true,
  runValidators: true
});
// Updates an existing role. 
const updateRole = (id, role) => User.findByIdAndUpdate(id, {
  role: role
}, {
  new: true,
  runValidators: true
});
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
  updateRole: updateRole
};