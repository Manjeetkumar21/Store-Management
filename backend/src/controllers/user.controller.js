const User = require("../models/user.model.js");
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

    req.user.name = name;
    await req.user.save();

    return successResponse(res, 200, "Profile updated", req.user);
  } catch (error) {
    return errorResponse(res, 500, "Server error", error.message);
  }
};

module.exports = { getMyProfile, updateMyProfile };
