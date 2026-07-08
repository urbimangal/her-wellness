const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name must be at most 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // never return password by default
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },

    // ---- Profile fields (filled in later via PUT /api/profile) ----
    age: {
      type: Number,
      min: [1, 'Age must be a positive number'],
      max: [120, 'Age must be realistic'],
    },
    height: {
      // in centimeters
      type: Number,
      min: [0, 'Height must be a positive number'],
    },
    weight: {
      // in kilograms
      type: Number,
      min: [0, 'Weight must be a positive number'],
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    },
    emergencyContactMother: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    emergencyContactFather: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    emergencyContactGuardian: {
      name: { type: String, trim: true },
      phone: { type: String, trim: true },
    },
    medicalConditions: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Never leak password even if select('+password') was used upstream and
// the document is serialized to JSON somewhere unexpected.
userSchema.methods.toSafeObject = function toSafeObject() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
