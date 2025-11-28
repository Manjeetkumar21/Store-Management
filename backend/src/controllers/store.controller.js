const Store = require("../../models/store.model");
const Company = require("../../models/company.model");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// CREATE STORE
const createStore = async (req, res) => {
  try {
    const { companyId, name, email, password, location, address } = req.body;

    if (!companyId || !name || !email || !password) {
      return errorResponse(res, 400, "Required fields missing", {
        companyId: !companyId ? "Company ID required" : null,
        name: !name ? "Store name required" : null,
        email: !email ? "Email required" : null,
        password: !password ? "Password required" : null,
      });
    }

    const companyExists = await Company.findById(companyId);
    if (!companyExists) return errorResponse(res, 404, "Company not found");

    const exists = await Store.findOne({ email });
    if (exists) return errorResponse(res, 409, "Store with email already exists");

    const store = await Store.create({
      companyId,
      name,
      email,
      password,
      location,
      address,
      createdBy: req.user._id,
    });

    const storeData = store.toObject();
    delete storeData.password;

    return successResponse(res, 201, "Store created successfully", storeData);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

//GET ALL STORES
const getAllStores = async (req, res) => {
  try {
    const stores = await Store.find()
      .select("-password")
      .populate("companyId", "name description createdBy")
      .populate("products", "name price qty brand image category description");

    return successResponse(res, 200, "Stores with company & products fetched", stores);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};


// GET STORES BY COMPANY
const getStoresByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) return errorResponse(res, 400, "Company ID required");

    const stores = await Store.find({ companyId });
    return successResponse(res, 200, "Stores fetched", stores);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET STORE BY ID
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return errorResponse(res, 400, "Store ID is required");

    const store = await Store.findById(id);
    if (!store) return errorResponse(res, 404, "Store not found");

    return successResponse(res, 200, "Store details fetched", store);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// UPDATE STORE
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, location } = req.body;

    if (!id) return errorResponse(res, 400, "Store ID is required");
    if (!name && !email && !location)
      return errorResponse(res, 400, "Provide at least 1 field to update");

    const updated = await Store.findByIdAndUpdate(
      id,
      { name, email, location },
      { new: true }
    );

    if (!updated) return errorResponse(res, 404, "Store not found");

    return successResponse(res, 200, "Store updated successfully", updated);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// DELETE STORE
const deleteStore = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return errorResponse(res, 400, "Store ID required");

    const deleted = await Store.findByIdAndDelete(id);
    if (!deleted) return errorResponse(res, 404, "Store not found");

    return successResponse(res, 200, "Store deleted successfully");
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

module.exports = {
  createStore,
  getAllStores,
  getStoresByCompany,
  getStoreById,
  updateStore,
  deleteStore
};
