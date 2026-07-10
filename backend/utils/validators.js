/**
 * Utility validators for Profile Controller
 */

const PHONE_REGEX = /^[6-9]\d{9}$/;

const validateProfileInput = (payload) => {
  const errors = [];

  const {
    age,
    height,
    weight,
    bloodGroup,
    emergencyContact1,
    emergencyContact2,
    medicalConditions,
    allergies,
  } = payload;

  const VALID_BLOOD_GROUPS = [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-",
  ];

  // Age
  if (age !== undefined) {
    const numAge = Number(age);

    if (Number.isNaN(numAge) || numAge < 10 || numAge > 90) {
      errors.push({
        field: "age",
        message: "Age must be between 10 and 90",
      });
    }
  }

  // Height
  if (height !== undefined) {
    const numHeight = Number(height);

    if (Number.isNaN(numHeight) || numHeight < 100 || numHeight > 250) {
      errors.push({
        field: "height",
        message: "Height must be between 100 and 250 cm",
      });
    }
  }

  // Weight
  if (weight !== undefined) {
    const numWeight = Number(weight);

    if (Number.isNaN(numWeight) || numWeight < 20 || numWeight > 300) {
      errors.push({
        field: "weight",
        message: "Weight must be between 20 and 300 kg",
      });
    }
  }

  // Blood Group
  if (
    bloodGroup !== undefined &&
    bloodGroup !== "" &&
    !VALID_BLOOD_GROUPS.includes(bloodGroup)
  ) {
    errors.push({
      field: "bloodGroup",
      message: `Blood group must be one of: ${VALID_BLOOD_GROUPS.join(", ")}`,
    });
  }

  // Emergency Contact 1
  if (
    emergencyContact1 !== undefined &&
    !PHONE_REGEX.test(String(emergencyContact1))
  ) {
    errors.push({
      field: "emergencyContact1",
      message: "Emergency Contact 1 must be a valid 10-digit mobile number",
    });
  }

  // Emergency Contact 2
  if (
    emergencyContact2 !== undefined &&
    !PHONE_REGEX.test(String(emergencyContact2))
  ) {
    errors.push({
      field: "emergencyContact2",
      message: "Emergency Contact 2 must be a valid 10-digit mobile number",
    });
  }

  // Medical Conditions (optional string)
  if (
    medicalConditions !== undefined &&
    typeof medicalConditions !== "string"
  ) {
    errors.push({
      field: "medicalConditions",
      message: "Medical Conditions must be text",
    });
  }

  // Allergies (optional string)
  if (
    allergies !== undefined &&
    typeof allergies !== "string"
  ) {
    errors.push({
      field: "allergies",
      message: "Allergies must be text",
    });
  }

  return errors;
};

module.exports = {
  validateProfileInput,
};