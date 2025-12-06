const { Address } = require("../../models/firestore");
const { formatDoc, formatDocs } = require("../../util/firestore-helpers");
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

    // If setting as default, unset other defaults first
    if (isDefault) {
      const existingAddresses = await Address.findAll({ where: { storeId } });
      await Promise.all(
        existingAddresses.map(addr => addr.update({ isDefault: false }))
      );
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

    return successResponse(res, 201, "Address created successfully", formatDoc(address));
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
    const addresses = await Address.findAll({ where: { storeId } });

    // Sort: default first, then by creation date
    const sortedAddresses = formatDocs(addresses).sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return successResponse(res, 200, "Addresses fetched successfully", sortedAddresses);
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

    const address = await Address.findOne({ id });
    if (!address || address.getData().storeId !== storeId) {
      return errorResponse(res, 404, "Address not found");
    }

    return successResponse(res, 200, "Address fetched successfully", formatDoc(address));
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

    const address = await Address.findOne({ id });
    if (!address || address.getData().storeId !== storeId) {
      return errorResponse(res, 404, "Address not found");
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (addressLine1) updateData.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) updateData.addressLine2 = addressLine2;
    if (city) updateData.city = city;
    if (state) updateData.state = state;
    if (zipCode) updateData.zipCode = zipCode;
    if (country) updateData.country = country;

    await Address.update(updateData, { id });

    const updated = await Address.findOne({ id });
    return successResponse(res, 200, "Address updated successfully", formatDoc(updated));
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

    const address = await Address.findOne({ id });
    if (!address || address.getData().storeId !== storeId) {
      return errorResponse(res, 404, "Address not found");
    }

    await Address.destroy({ id });

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

    const address = await Address.findOne({ id });
    if (!address || address.getData().storeId !== storeId) {
      return errorResponse(res, 404, "Address not found");
    }

    // Remove default from all other addresses
    const allAddresses = await Address.findAll({ where: { storeId } });
    await Promise.all(
      allAddresses.map(addr => {
        if (addr.getId() !== id) {
          return addr.update({ isDefault: false });
        }
      })
    );

    // Set this address as default
    await address.update({ isDefault: true });

    const updated = await Address.findOne({ id });
    return successResponse(res, 200, "Default address set successfully", formatDoc(updated));
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
