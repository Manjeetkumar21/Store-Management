const { defineModel, DataTypes } = require('../../util/firesequelize');

const Cart = defineModel('carts', {
  storeId: { type: DataTypes.STRING, required: true },
  items: { type: DataTypes.ARRAY, default: [] }, // Array of { productId, qty, price }
  updatedAt: { type: DataTypes.NUMBER, default: () => Date.now() },
  createdAt: { type: DataTypes.NUMBER, default: () => Date.now() }
});

module.exports = Cart;
