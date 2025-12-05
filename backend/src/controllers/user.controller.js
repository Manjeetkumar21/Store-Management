const { User, Store } = require("../../models/firestore");
const { formatDoc } = require("../../util/firestore-helpers");
const { successResponse, errorResponse } = require("../utils/responseHandler.js");

// ================= GET MY PROFILE =================
const getMyProfile = async (req, res) => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "Unauthorized user");
    }

    return successResponse(res, 200, "Profile fetched", req.user);
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

// ================= UPDATE MY PROFILE =================
const updateMyProfile = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return errorResponse(res, 400, "Name is required");
    }

    // Update based on role
    if (req.role === "admin") {
      await User.update({ name }, { id: req.user.id });
      const updatedUser = await User.findOne({ id: req.user.id });
      const userData = formatDoc(updatedUser);
      delete userData.password;
      return successResponse(res, 200, "Profile updated", userData);
    } else if (req.role === "store") {
      await Store.update({ name }, { id: req.user.id });
      const updatedStore = await Store.findOne({ id: req.user.id });
      const storeData = formatDoc(updatedStore);
      delete storeData.password;
      return successResponse(res, 200, "Profile updated", storeData);
    }

    return errorResponse(res, 400, "Invalid role");
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

module.exports = { getMyProfile, updateMyProfile };
