const Store = require("../../models/store.model.js");
const Company = require("../../models/company.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiResponse } = require("../utils/apiResponse.js");
const { ApiError } = require("../utils/apiError.js");

// Create Store (ADMIN)
const createStore = asyncHandler(async (req, res) => {
  const { name, location, company, email, password, address, image } = req.body;

  if (!name || !location || !company || !email || !password) {
    throw new ApiError(400, "Required fields missing");
  }

  // Check company exists
  const existingCompany = await Company.findById(company);
  if (!existingCompany) throw new ApiError(404, "Company not found");

  const store = await Store.create({
    name,
    location,
    company,
    email,
    password,
    address,
    image,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, store, "Store created successfully"));
});

// Get stores of a company
const getStoresByCompany = asyncHandler(async (req, res) => {
  const { companyId } = req.params;
  const stores = await Store.find({ company: companyId }).select("-password");
  return res.status(200).json(new ApiResponse(200, stores));
});

// Get single store
const getStoreById = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id).select("-password");
  if (!store) throw new ApiError(404, "Store not found");
  return res.status(200).json(new ApiResponse(200, store));
});

// Update store
const updateStore = asyncHandler(async (req, res) => {
  const updates = req.body;
  const store = await Store.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  }).select("-password");

  if (!store) throw new ApiError(404, "Store not found");

  return res
    .status(200)
    .json(new ApiResponse(200, store, "Store updated successfully"));
});

// Delete store
const deleteStore = asyncHandler(async (req, res) => {
  const store = await Store.findByIdAndDelete(req.params.id);
  if (!store) throw new ApiError(404, "Store not found");
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Store deleted successfully"));
});

module.exports = {
  createStore,
  getStoresByCompany,
  getStoreById,
  updateStore,
  deleteStore,
};
