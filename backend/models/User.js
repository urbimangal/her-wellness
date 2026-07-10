const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email",
      ],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [
        /^[6-9]\d{9}$/,
        "Please enter a valid 10-digit phone number",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    age: {
      type: Number,
      min: 10,
      max: 90,
    },

    height: {
      type: Number,
      min: 100,
      max: 250,
    },

    weight: {
      type: Number,
      min: 20,
      max: 250,
    },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },

    emergencyContact1: {
      type: String,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },

    emergencyContact2: {
      type: String,
      match: [/^[6-9]\d{9}$/, "Invalid phone number"],
    },

    medicalConditions: {
      type: String,
      default: "",
    },

    allergies: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);