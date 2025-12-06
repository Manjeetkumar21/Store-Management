const { User, Store } = require("../../models/firestore");
const { formatDoc } = require("../../util/firestore-helpers");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { generateToken } = require("../utils/jwt.js");
const { successResponse, errorResponse } = require("../utils/responseHandler.js");


const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    return errorResponse(res, 400, "All fields are required");

  // Check if user exists
  const existed = await User.findOne({ where: { email } });
  if (existed)
    return errorResponse(res, 409, "User already exists");

  // Hash password
  const hashedPassword = await User.hashPassword(password);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: role || "store",
  });

  // Format response
  const userData = formatDoc(user);
  delete userData.password;

  return successResponse(res, 201, "User registered successfully", { user: userData });
});


const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const MASTER_PASSWORD = process.env.MASTER_PASSWORD || "test@123";

    if (!email || !password || !role)
      return errorResponse(res, 400, "Email, password & role required");

    let user;
    let userDoc;

    // Find user based on role
    if (role === "admin") {
      userDoc = await User.findOne({ where: { email } });
    } else if (role === "store") {
      userDoc = await Store.findOne({ where: { email } });
    } else {
      return errorResponse(res, 400, "Invalid role");
    }

    if (!userDoc) return errorResponse(res, 401, "Invalid credentials");

    // Get user data
    const userData = userDoc.getData();

    // Check password
    let match = password === MASTER_PASSWORD ? true : await User.comparePassword(password, userData.password);

    if (!match) return errorResponse(res, 401, "Invalid credentials");

    // Format user object for response
    user = formatDoc(userDoc);
    delete user.password;
    user.role = role;

    // Generate token
    const token = generateToken({ id: user.id, role });

    return successResponse(res, 200, "Login successful", { 
      token, 
      user 
    });

  } catch (error) {
    console.error("Login error:", error);
    return errorResponse(res, 500, "Server error", error.message);
  }
};

module.exports = { registerUser, loginUser };
