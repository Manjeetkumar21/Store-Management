const User = require("../../models/user.model.js");
const bcrypt = require("bcryptjs");
const { asyncHandler } = require("../utils/asyncHandler.js");
const { generateToken } = require("../utils/jwt.js");
const { successResponse, errorResponse } = require("../utils/responseHandler.js");


const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password)
    return errorResponse(res, 400, "All fields are required");

  const existed = await User.findOne({ email });
  if (existed)
    return errorResponse(res, 409, "User already exists");

  const user = await User.create({
    name,
    email,
    password,
    role: role || "store",
  });

  return successResponse(res, 201, "User registered successfully", { user });
});


const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return errorResponse(res, 400, "Email & password required");

  const user = await User.findOne({ email }).select("+password");
  if (!user)
    return errorResponse(res, 401, "Invalid credentials");

  const match = await bcrypt.compare(password, user.password);
  console.log("match : ", match);
  console.log("user : ", user);
  if (!match)
    return errorResponse(res, 401, "Invalid credentials");

  const token = generateToken(user);

  return successResponse(res, 200, "Login successful", {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

module.exports = { registerUser, loginUser };
