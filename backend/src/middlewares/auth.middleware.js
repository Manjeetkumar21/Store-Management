const jwt = require("jsonwebtoken");
const User = require("../../models/user.model");
const Store = require("../../models/store.model");
const { ApiError } = require("../utils/apiError");
const { asyncHandler } = require("../utils/asyncHandler");

const auth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Unauthorized - Token Required");
  }

  const token = authHeader.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid Token");
  }

  console.log("decode : ", decoded)

  if (!decoded || !decoded.role) {
    throw new ApiError(401, "Invalid Token Payload");
  }



  // Check role and query correct collection
  if (decoded.role === "admin") {
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) throw new ApiError(404, "Admin Not Found");
  } else if (decoded.role === "store") {
    req.user = await Store.findById(decoded.id).select("-password");
    req.user.role = "store";
    if (!req.user) throw new ApiError(404, "Store Not Found");
  } else {
    throw new ApiError(403, "Invalid Role");
  }


  console.log("user : ", req.user)
  req.role = decoded.role; // store role info if needed later
  next();
});

module.exports = { auth };
