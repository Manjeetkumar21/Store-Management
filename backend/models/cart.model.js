const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    qty: { type: Number, default: 1, min: 1 },
    price: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    storeId: {                             // Only required now
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      unique: true                        // One cart per store ✔
    },
    items: { type: [cartItemSchema], default: [] },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);
