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
    landingPage: {
      hero: {
        heading: { type: String, default: "Streamline Your Store Operations" },
        subheading: { type: String, default: "Manage inventory, track orders, and grow your business with our comprehensive store management platform." },
        heroImage: { type: String, default: "/store_hero_illustration.png" },
      },
      navbar: {
        logoImage: { type: String, default: "" },
      },
      footer: {
        address: {
          street: { type: String, default: "" },
          city: { type: String, default: "" },
          state: { type: String, default: "" },
          zipCode: { type: String, default: "" },
          country: { type: String, default: "" },
        },
        phone: { type: String, default: "" },
        email: { type: String, default: "" },
      }
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },   // required
    toObject: { virtuals: true }  // required
  }
);

// virtual → get all products of store
storeSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "storeId"
});

// index for perf.
storeSchema.index({ companyId: 1, location: 1 });

// hash password
storeSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, await bcrypt.genSalt(10));
});

module.exports = mongoose.model("Store", storeSchema);
