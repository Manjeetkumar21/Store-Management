const { defineModel, DataTypes } = require('../../util/firesequelize');

const Company = defineModel('companies', {
  id: { type: DataTypes.STRING },
  name: { type: DataTypes.STRING, required: true },
  logo: { type: DataTypes.STRING, default: '' },
  description: { type: DataTypes.STRING, default: '' },
  email: { type: DataTypes.STRING, default: '' },
  createdBy: { type: DataTypes.STRING, required: true },
  createdAt: { type: DataTypes.TIMESTAMP },
  updatedAt: { type: DataTypes.TIMESTAMP }
});

module.exports = Company;
