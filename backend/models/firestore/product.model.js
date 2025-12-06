const { defineModel, DataTypes } = require('../../util/firesequelize');

const Product = defineModel('products', {
  id: { type: DataTypes.STRING },
  storeId: { type: DataTypes.STRING, required: true },
  name: { type: DataTypes.STRING, required: true },
  price: { type: DataTypes.NUMBER, required: true },
  brand: { type: DataTypes.STRING, default: '' },
  qty: { type: DataTypes.NUMBER, default: 0 },
  image: { type: DataTypes.STRING, default: '' },
  description: { type: DataTypes.STRING, default: '' },
  category: { type: DataTypes.STRING, default: '' },
  dimensions: { 
    type: DataTypes.OBJECT, 
    default: { length: null, width: null, height: null } 
  }, // length, width, height in cm
  createdAt: { type: DataTypes.TIMESTAMP },
  updatedAt: { type: DataTypes.TIMESTAMP }
});

module.exports = Product;
