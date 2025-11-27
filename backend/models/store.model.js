const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const storeSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    password: { type: String, required: true, select: false },
    image: { type: String },
    address: { type: String },
    phone: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

storeSchema.index({ companyId: 1, location: 1 });

storeSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("Store", storeSchema);
