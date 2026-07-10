const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { validateProfileInput } = require('../utils/validators');

// Fields that a user is allowed to update via PUT /api/profile.
const ALLOWED_PROFILE_FIELDS = [
  'age',
  'height',
  'weight',
  'bloodGroup',
  'emergencyContact1',
  'emergencyContact2',
  'medicalConditions',
  'allergies',
];

/**
 * @route   GET /api/profile
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  // req.user is already the full user doc (minus password) from authMiddleware.
  const user = await User.findById(req.user._id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json({
    success: true,
    message: 'Profile fetched successfully',
    data: { user: user.toSafeObject() },
  });
});

/**
 * @route   PUT /api/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const errors = validateProfileInput(req.body);
  if (errors.length > 0) {
    throw new ApiError(400, 'Validation failed', errors);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Only apply whitelisted fields that were actually provided in the request.
  ALLOWED_PROFILE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  user.profileCompleted = true;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: { user: user.toSafeObject() },
  });
});

module.exports = { getProfile, updateProfile };
