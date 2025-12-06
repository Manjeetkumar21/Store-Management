const jwt = require("jsonwebtoken");
const { User, Store } = require("../../models/firestore");
const { formatDoc } = require("../../util/firestore-helpers");
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

  if (!decoded || !decoded.role) {
    throw new ApiError(401, "Invalid Token Payload");
  }

  // Check role and query correct collection
  if (decoded.role === "admin") {
    const userDoc = await User.findOne({ id: decoded.id });
    if (!userDoc) throw new ApiError(404, "Admin Not Found");
    
    req.user = formatDoc(userDoc);
    delete req.user.password;
  } else if (decoded.role === "store") {
    const storeDoc = await Store.findOne({ id: decoded.id });
    if (!storeDoc) throw new ApiError(404, "Store Not Found");
    
    req.user = formatDoc(storeDoc);
    delete req.user.password;
    req.user.role = "store";
  } else {
    throw new ApiError(403, "Invalid Role");
  }

  req.role = decoded.role; // store role info if needed later
  next();
});

module.exports = { auth };
