const { defineModel, DataTypes } = require('../../util/firesequelize');

const Address = defineModel('addresses', {
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
  createdAt: { type: DataTypes.NUMBER, default: () => Date.now() },
  updatedAt: { type: DataTypes.NUMBER, default: () => Date.now() }
});

module.exports = Address;
