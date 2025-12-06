const { defineModel, DataTypes } = require('../util/firesequelize');

const Address = defineModel('addresses', {
  id: { type: DataTypes.STRING },
  storeId: { type: DataTypes.STRING, required: true },
  fullName: { type: DataTypes.STRING, required: true },
  phone: { type: DataTypes.STRING, required: true },
  addressLine1: { type: DataTypes.STRING, required: true },
  addressLine2: { type: DataTypes.STRING, default: '' },
  city: { type: DataTypes.STRING, required: true },
  state: { type: DataTypes.STRING, required: true },
  zipCode: { type: DataTypes.STRING, required: true },
  country: { type: DataTypes.STRING, default: 'India' },
  isDefault: { type: DataTypes.BOOLEAN, default: false },
  createdAt: { type: DataTypes.TIMESTAMP },
  updatedAt: { type: DataTypes.TIMESTAMP }
});

module.exports = Address;
