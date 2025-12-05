const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    storeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for performance
addressSchema.index({ storeId: 1, isDefault: 1 });

// Ensure only one default address per store
addressSchema.pre("save", async function () {
  if (this.isDefault) {
    await mongoose.model("Address").updateMany(
      { storeId: this.storeId, _id: { $ne: this.id } },
      { isDefault: false }
    );
  }
});

module.exports = mongoose.model("Address", addressSchema);
