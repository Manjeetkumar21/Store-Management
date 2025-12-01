const Store = require("../../models/store.model");
const Company = require("../../models/company.model");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// CREATE STORE
const createStore = async (req, res) => {
  try {
    const { companyId, name, email, password, location, address, landingPage } = req.body;

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

    const storeData = {
      companyId,
      name,
      email,
      password,
      location,
      address,
      createdBy: req.user._id,
    };

    // Add landingPage if provided
    if (landingPage) {
      storeData.landingPage = landingPage;
    }

    const store = await Store.create(storeData);

    const responseData = store.toObject();
    delete responseData.password;

    return successResponse(res, 201, "Store created successfully", responseData);
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

    const store = await Store.findById(id)
      .select("-password")
      .populate("companyId", "name email description createdAt")
      .populate("products", "name price qty brand image category description");
      
    if (!store) return errorResponse(res, 404, "Store not found");

    return successResponse(res, 200, "Store fetched successfully", store);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET LOGGED-IN STORE'S OWN DETAILS
const getMyStoreDetails = async (req, res) => {
  try {
    const store = await Store.findById(req.user._id)
      .select("-password")
      .populate("companyId", "name email description")
      .populate("products", "name price qty brand image category description");
    
    if (!store) return errorResponse(res, 404, "Store not found");

    return successResponse(res, 200, "Store details fetched successfully", store);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// UPDATE STORE
const updateStore = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, location, address, landingPage } = req.body;

    if (!id) return errorResponse(res, 400, "Store ID is required");

    const store = await Store.findById(id);
    if (!store) return errorResponse(res, 404, "Store not found");

    if (email && email !== store.email) {
      const emailExists = await Store.findOne({ email });
      if (emailExists) return errorResponse(res, 409, "Email already in use");
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (password) updateData.password = password;
    if (location) updateData.location = location;
    if (address) updateData.address = address;
    if (landingPage) updateData.landingPage = landingPage;

    const updatedStore = await Store.findByIdAndUpdate(id, updateData, { new: true }).select("-password");

    return successResponse(res, 200, "Store updated successfully", updatedStore);
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
  getMyStoreDetails,
  updateStore,
  deleteStore
};
