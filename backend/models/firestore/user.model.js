const { defineModel, DataTypes } = require('../../util/firesequelize');
const bcrypt = require('bcryptjs');

const User = defineModel('users', {
  name: { type: DataTypes.STRING, default: '' },
  email: { type: DataTypes.STRING, required: true },
  password: { type: DataTypes.STRING, required: true },
  role: { type: DataTypes.STRING, required: true }, // 'admin' or 'store'
  companyId: { type: DataTypes.STRING, default: null },
  storeId: { type: DataTypes.STRING, default: null },
  createdAt: { type: DataTypes.NUMBER, default: () => Date.now() },
  updatedAt: { type: DataTypes.NUMBER, default: () => Date.now() }
});

// Password hashing helper
User.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Password comparison helper
User.comparePassword = async (candidatePassword, hashedPassword) => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};

module.exports = User;
