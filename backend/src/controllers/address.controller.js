const Address = require("../../models/address.model");
const { successResponse, errorResponse } = require("../utils/responseHandler");

// CREATE ADDRESS
const createAddress = async (req, res) => {
  try {
    if (req.role !== "store") {
      return errorResponse(res, 403, "Only store users can create addresses");
    }

    const storeId = req.user.id;

    const { fullName, phone, addressLine1, addressLine2, city, state, zipCode, country, isDefault } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !zipCode) {
      return errorResponse(res, 400, "Required fields missing");
    }

    const address = await Address.create({
      storeId,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      zipCode,
      country: country || "India",
      isDefault: isDefault || false,
    });

    return successResponse(res, 201, "Address created successfully", address);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET ALL ADDRESSES FOR STORE
const getStoreAddresses = async (req, res) => {
  try {
    if (req.role !== "store") {
      return errorResponse(res, 403, "Only store users can view addresses");
    }

    const storeId = req.user.id;
    const addresses = await Address.find({ storeId }).sort({ isDefault: -1, createdAt: -1 });

    return successResponse(res, 200, "Addresses fetched successfully", addresses);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// GET ADDRESS BY ID
const getAddressById = async (req, res) => {
  try {
    if (req.role !== "store") {
      return errorResponse(res, 403, "Only store users can view addresses");
    }

    const { id } = req.params;
    const storeId = req.user.id;

    const address = await Address.findOne({ _id: id, storeId });
    if (!address) {
      return errorResponse(res, 404, "Address not found");
    }

    return successResponse(res, 200, "Address fetched successfully", address);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// UPDATE ADDRESS
const updateAddress = async (req, res) => {
  try {
    if (req.role !== "store") {
      return errorResponse(res, 403, "Only store users can update addresses");
    }

    const { id } = req.params;
    const storeId = req.user.id;
    const { fullName, phone, addressLine1, addressLine2, city, state, zipCode, country } = req.body;

    const address = await Address.findOne({ _id: id, storeId });
    if (!address) {
      return errorResponse(res, 404, "Address not found");
    }

    const updated = await Address.findByIdAndUpdate(
      id,
      { fullName, phone, addressLine1, addressLine2, city, state, zipCode, country },
      { new: true, runValidators: true }
    );

    return successResponse(res, 200, "Address updated successfully", updated);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// DELETE ADDRESS
const deleteAddress = async (req, res) => {
  try {
    if (req.role !== "store") {
      return errorResponse(res, 403, "Only store users can delete addresses");
    }

    const { id } = req.params;
    const storeId = req.user.id;

    const address = await Address.findOne({ _id: id, storeId });
    if (!address) {
      return errorResponse(res, 404, "Address not found");
    }

    await Address.findByIdAndDelete(id);

    return successResponse(res, 200, "Address deleted successfully");
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

// SET DEFAULT ADDRESS
const setDefaultAddress = async (req, res) => {
  try {
    if (req.role !== "store") {
      return errorResponse(res, 403, "Only store users can set default address");
    }

    const { id } = req.params;
    const storeId = req.user.id;

    const address = await Address.findOne({ _id: id, storeId });
    if (!address) {
      return errorResponse(res, 404, "Address not found");
    }

    // Remove default from all other addresses
    await Address.updateMany({ storeId, _id: { $ne: id } }, { isDefault: false });

    // Set this address as default
    address.isDefault = true;
    await address.save();

    return successResponse(res, 200, "Default address set successfully", address);
  } catch (err) {
    return errorResponse(res, 500, "Server error", err.message);
  }
};

module.exports = {
  createAddress,
  getStoreAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
