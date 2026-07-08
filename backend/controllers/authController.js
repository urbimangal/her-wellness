const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

const {
  validateRegisterInput,
  validateLoginInput,
} = require("../utils/validators");

const SALT_ROUNDS = 12;

/**
 * @route POST /api/auth/register
 * @access Public
 */
const register = asyncHandler(async (req, res) => {
  const { fullName, phone, password, confirmPassword } = req.body;

  const errors = validateRegisterInput({
    fullName,
    phone,
    password,
    confirmPassword,
  });

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed", errors);
  }

  const normalizedPhone = phone.trim();

  const existingUser = await User.findOne({ phone: normalizedPhone });

  if (existingUser) {
    throw new ApiError(
      409,
      "An account with this phone number already exists",
      [{ field: "phone", message: "Phone number is already registered" }]
    );
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    fullName: fullName.trim(),
    phone: normalizedPhone,
    password: hashedPassword,
    isVerified: false,
    profileCompleted: false,
  });

  res.status(201).json({
    success: true,
    message: "Registration successful. Complete phone verification using Firebase.",
    data: {
      userId: user._id,
      phone: user.phone,
    },
  });
});

/**
 * @route POST /api/auth/login
 * @access Public
 */
const login = asyncHandler(async (req, res) => {
  const { phone, password } = req.body;

  const errors = validateLoginInput({ phone, password });

  if (errors.length > 0) {
    throw new ApiError(400, "Validation failed", errors);
  }

  const normalizedPhone = phone.trim();

  const user = await User.findOne({ phone: normalizedPhone }).select("+password");

  if (!user) {
    throw new ApiError(401, "Invalid phone number or password");
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  if (!isPasswordMatch) {
    throw new ApiError(401, "Invalid phone number or password");
  }
  // TODO: Enable after Firebase Phone Authentication integration
  // if (!user.isVerified) {
  //   throw new ApiError(
  //     403,
  //     "Phone number not verified. Please verify your phone number using Firebase."
  //   );
  // }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      token,
      user: user.toSafeObject(),
    },
  });
});

module.exports = {
  register,
  login,
};