const { defineModel, DataTypes } = require('../../util/firesequelize');

const Cart = defineModel('carts', {
  id: { type: DataTypes.STRING },
  storeId: { type: DataTypes.STRING, required: true },
  items: { type: DataTypes.ARRAY, default: [] }, // Array of { productId, qty, price }
  updatedAt: { type: DataTypes.TIMESTAMP },
  createdAt: { type: DataTypes.TIMESTAMP }
});

module.exports = Cart;
