const { defineModel, DataTypes } = require('../../util/firesequelize');

const Payment = defineModel('payments', {
  orderId: { type: DataTypes.STRING, required: true },
  storeId: { type: DataTypes.STRING, required: true },
  transactionId: { type: DataTypes.STRING, default: '' },
  amount: { type: DataTypes.NUMBER, required: true },
  paymentMethod: { type: DataTypes.STRING, default: 'qr_code' }, // qr_code, upi, bank_transfer
  status: { type: DataTypes.STRING, default: 'pending' }, // pending, submitted, verified, failed
  paidAt: { type: DataTypes.NUMBER, default: null },
  verifiedBy: { type: DataTypes.STRING, default: null },
  verifiedAt: { type: DataTypes.NUMBER, default: null },
  receiptUrl: { type: DataTypes.STRING, default: '' },
  qrCodeUrl: { type: DataTypes.STRING, default: '' },
  notes: { type: DataTypes.STRING, default: '' },
  createdAt: { type: DataTypes.NUMBER, default: () => Date.now() },
  updatedAt: { type: DataTypes.NUMBER, default: () => Date.now() }
});

module.exports = Payment;
