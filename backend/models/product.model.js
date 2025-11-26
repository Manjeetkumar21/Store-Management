const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    brand: { type: String },
    qty: { type: Number, default: 0, min: 0 },
    image: { type: String },
    description: { type: String },
    category: { type: String },
  },
  { timestamps: true }
);

productSchema.index({ storeId: 1, name: 1 });

module.exports = mongoose.model("Product", productSchema);
