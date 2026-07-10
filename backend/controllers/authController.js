const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");
const { validationResult } = require("express-validator");

const SALT_ROUNDS = 12;

/**
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }

  const {
    fullName,
    email,
    phone,
    password
  } = req.body;

  // Check Email
  const emailExists = await User.findOne({
    email: email.toLowerCase().trim(),
  });

  if (emailExists) {
    throw new ApiError(409, "Email already registered", [
      {
        field: "email",
        message: "Email already exists",
      },
    ]);
  }

  // Check Phone
  const phoneExists = await User.findOne({
    phone: phone.trim(),
  });

  if (phoneExists) {
    throw new ApiError(409, "Phone number already registered", [
      {
        field: "phone",
        message: "Phone number already exists",
      },
    ]);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    fullName: fullName.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.trim(),
    password: hashedPassword,
    isVerified: false,
    profileCompleted: false,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "Registration successful",
    token,
    data: {
      userId: user._id,
      user: user.toSafeObject(),
    },
  });
});

/**
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation failed", errors.array());
  }


  const { identifier, password } = req.body;

const value = identifier.trim();

const query = value.includes("@")
  ? { email: value.toLowerCase() }
  : { phone: value };

const user = await User.findOne(query).select("+password");

  if (!user) {
    throw new ApiError(
      401,
      "Invalid email/phone or password"
    );
  }

  const match = await bcrypt.compare(
    password,
    user.password
  );

  if (!match) {
    throw new ApiError(
      401,
      "Invalid email/phone or password"
    );
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    token,
    data: {
      userId: user._id,
      user: user.toSafeObject(),
    },
  });
});

/**
 * @route POST /api/auth/logout
 * @access Private
 */
const logout = asyncHandler(async (req, res) => {

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });

});

module.exports = {
  register,
  login,
  logout,
};