const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    transactionId: {
      type: String,
      trim: true,
      sparse: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["qr_code", "upi", "bank_transfer"],
      default: "qr_code",
    },
    status: {
      type: String,
      enum: ["pending", "submitted", "verified", "failed"],
      default: "pending",
    },
    paidAt: {
      type: Date,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    receiptUrl: {
      type: String,
    },
    qrCodeUrl: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for performance
paymentSchema.index({ orderId: 1 }, { unique: true });
paymentSchema.index({ status: 1 });
paymentSchema.index({ transactionId: 1 }, { sparse: true });


module.exports = mongoose.model("Payment", paymentSchema);
