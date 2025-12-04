const { defineModel, DataTypes } = require('../../util/firesequelize');

const Company = defineModel('companies', {
  name: { type: DataTypes.STRING, required: true },
  logo: { type: DataTypes.STRING, default: '' },
  description: { type: DataTypes.STRING, default: '' },
  email: { type: DataTypes.STRING, default: '' },
  createdBy: { type: DataTypes.STRING, required: true },
  createdAt: { type: DataTypes.NUMBER, default: () => Date.now() },
  updatedAt: { type: DataTypes.NUMBER, default: () => Date.now() }
});

module.exports = Company;
