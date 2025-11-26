const jwt = require("jsonwebtoken");
const User = require("../../models/user.model.js");
const { ApiError } = require("../utils/apiError.js");
const { asyncHandler } = require("../utils/asyncHandler.js");

const auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized - Token Required");
  }

  const token = authHeader.split(" ")[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded) throw new ApiError(401, "Invalid Token");

  req.user = await User.findById(decoded.id).select("-password");
  if (!req.user) throw new ApiError(404, "User Not Found");

  next();
});

module.exports = { auth };
