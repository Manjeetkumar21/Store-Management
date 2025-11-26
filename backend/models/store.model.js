const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    image: { type: String },
    address: { type: String },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Compound index to ensure unique store email per company (optional: enforce unique email globally via User model)
storeSchema.index({ companyId: 1, location: 1 });

module.exports = mongoose.model("Store", storeSchema);
