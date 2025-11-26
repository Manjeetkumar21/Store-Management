const User = require("../models/user.model.js");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { ApiResponse } = require("../utils/apiResponse.js");

const getMyProfile = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user));
});

const updateMyProfile = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) throw new ApiError(400, "Name is required");

  req.user.name = name;
  await req.user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Profile updated"));
});

module.exports = { getMyProfile, updateMyProfile };
