const { defineModel, DataTypes } = require('../../util/firesequelize');

const Product = defineModel('products', {
  storeId: { type: DataTypes.STRING, required: true },
  name: { type: DataTypes.STRING, required: true },
  price: { type: DataTypes.NUMBER, required: true },
  brand: { type: DataTypes.STRING, default: '' },
  qty: { type: DataTypes.NUMBER, default: 0 },
  image: { type: DataTypes.STRING, default: '' },
  description: { type: DataTypes.STRING, default: '' },
  category: { type: DataTypes.STRING, default: '' },
  createdAt: { type: DataTypes.NUMBER, default: () => Date.now() },
  updatedAt: { type: DataTypes.NUMBER, default: () => Date.now() }
});

module.exports = Product;
