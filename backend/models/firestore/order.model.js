const { defineModel, DataTypes } = require('../../util/firesequelize');

const Order = defineModel('orders', {
  id: { type: DataTypes.STRING },
  storeId: { type: DataTypes.STRING, required: true },
  products: { type: DataTypes.ARRAY, required: true }, // Array of { productId, qty, price }
  totalAmount: { type: DataTypes.NUMBER, required: true },
  shippingAddress: { type: DataTypes.OBJECT, required: true },
  status: { type: DataTypes.STRING, default: 'pending' }, // pending, confirmed, cancelled, completed
  paymentStatus: { type: DataTypes.STRING, default: 'pending' }, // pending, submitted, verified, failed
  shippingStatus: { type: DataTypes.STRING, default: 'pending' }, // pending, processing, shipped, delivered
  paymentId: { type: DataTypes.STRING, default: null },
  confirmedBy: { type: DataTypes.STRING, default: null },
  confirmedAt: { type: DataTypes.NUMBER, default: null },
  cancelledBy: { type: DataTypes.STRING, default: null },
  cancelledAt: { type: DataTypes.NUMBER, default: null },
  cancellationReason: { type: DataTypes.STRING, default: '' },
  shippedAt: { type: DataTypes.NUMBER, default: null },
  deliveredAt: { type: DataTypes.NUMBER, default: null },
  orderReceivedConfirmation: { type: DataTypes.BOOLEAN, default: false },
  orderReceivedAt: { type: DataTypes.NUMBER, default: null },
  createdAt: { type: DataTypes.TIMESTAMP },
  updatedAt: { type: DataTypes.TIMESTAMP }
});

module.exports = Order;
