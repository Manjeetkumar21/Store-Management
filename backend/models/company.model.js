const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  logo: String,
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, 
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

companySchema.virtual("stores", {
  ref: "Store",
  localField: "_id",
  foreignField: "companyId",
});


const Company = mongoose.model("Company", companySchema);

module.exports = Company;
