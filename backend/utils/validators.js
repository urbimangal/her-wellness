/**
 * Plain-function validators (no external validation library) so the
 * project has zero extra dependencies beyond what was requested.
 */

// Basic international-friendly phone check: optional leading +, 10-15 digits.
const PHONE_REGEX = /^\+?[1-9]\d{9,14}$/;

// Min 8 chars, at least 1 uppercase, 1 lowercase, 1 number, 1 special char.
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;

const isValidPhone = (phone) =>
  isNonEmptyString(phone) && PHONE_REGEX.test(phone.trim());

const isValidPassword = (password) =>
  isNonEmptyString(password) && PASSWORD_REGEX.test(password);

const isValidFullName = (fullName) =>
  isNonEmptyString(fullName) &&
  fullName.trim().length >= 2 &&
  fullName.trim().length <= 100;

const isValidOtp = (otp) =>
  isNonEmptyString(otp) && /^\d{6}$/.test(otp.trim());

/**
 * Validates the register payload.
 * Returns an array of { field, message } errors (empty array = valid).
 */
const validateRegisterInput = ({ fullName, phone, password, confirmPassword }) => {
  const errors = [];

  if (!isValidFullName(fullName)) {
    errors.push({
      field: 'fullName',
      message: 'Full name is required and must be between 2 and 100 characters',
    });
  }

  if (!isValidPhone(phone)) {
    errors.push({
      field: 'phone',
      message: 'A valid phone number is required (10-15 digits, optional leading +)',
    });
  }

  if (!isNonEmptyString(password)) {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (!isValidPassword(password)) {
    errors.push({
      field: 'password',
      message:
        'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character',
    });
  }

  if (!isNonEmptyString(confirmPassword)) {
    errors.push({
      field: 'confirmPassword',
      message: 'Confirm password is required',
    });
  } else if (password !== confirmPassword) {
    errors.push({
      field: 'confirmPassword',
      message: 'Password and confirm password do not match',
    });
  }

  return errors;
};

const validateLoginInput = ({ phone, password }) => {
  const errors = [];

  if (!isValidPhone(phone)) {
    errors.push({ field: 'phone', message: 'A valid phone number is required' });
  }

  if (!isNonEmptyString(password)) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};

const validateOtpInput = ({ phone, otp }) => {
  const errors = [];

  if (!isValidPhone(phone)) {
    errors.push({ field: 'phone', message: 'A valid phone number is required' });
  }

  if (!isValidOtp(otp)) {
    errors.push({ field: 'otp', message: 'OTP must be a 6-digit number' });
  }

  return errors;
};

const validateResendOtpInput = ({ phone }) => {
  const errors = [];

  if (!isValidPhone(phone)) {
    errors.push({ field: 'phone', message: 'A valid phone number is required' });
  }

  return errors;
};

/**
 * Validates the profile update payload. All fields optional individually,
 * but whichever are provided must be well-formed.
 */
const validateProfileInput = (payload) => {
  const errors = [];
  const {
    age,
    height,
    weight,
    bloodGroup,
    emergencyContactMother,
    emergencyContactFather,
    emergencyContactGuardian,
    medicalConditions,
    allergies,
  } = payload;

  const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  if (age !== undefined) {
    const numAge = Number(age);
    if (Number.isNaN(numAge) || numAge <= 0 || numAge > 120) {
      errors.push({ field: 'age', message: 'Age must be a number between 1 and 120' });
    }
  }

  if (height !== undefined) {
    const numHeight = Number(height);
    if (Number.isNaN(numHeight) || numHeight <= 0) {
      errors.push({ field: 'height', message: 'Height must be a positive number (cm)' });
    }
  }

  if (weight !== undefined) {
    const numWeight = Number(weight);
    if (Number.isNaN(numWeight) || numWeight <= 0) {
      errors.push({ field: 'weight', message: 'Weight must be a positive number (kg)' });
    }
  }

  if (bloodGroup !== undefined && !VALID_BLOOD_GROUPS.includes(bloodGroup)) {
    errors.push({
      field: 'bloodGroup',
      message: `Blood group must be one of: ${VALID_BLOOD_GROUPS.join(', ')}`,
    });
  }

  const validateEmergencyContact = (contact, fieldName) => {
    if (contact === undefined) return;
    if (typeof contact !== 'object' || contact === null || Array.isArray(contact)) {
      errors.push({ field: fieldName, message: `${fieldName} must be an object with name and phone` });
      return;
    }
    if (contact.name !== undefined && !isNonEmptyString(contact.name)) {
      errors.push({ field: `${fieldName}.name`, message: 'Contact name must be a non-empty string' });
    }
    if (contact.phone !== undefined && !isValidPhone(contact.phone)) {
      errors.push({ field: `${fieldName}.phone`, message: 'Contact phone must be a valid phone number' });
    }
  };

  validateEmergencyContact(emergencyContactMother, 'emergencyContactMother');
  validateEmergencyContact(emergencyContactFather, 'emergencyContactFather');
  validateEmergencyContact(emergencyContactGuardian, 'emergencyContactGuardian');

  if (medicalConditions !== undefined && !Array.isArray(medicalConditions)) {
    errors.push({ field: 'medicalConditions', message: 'medicalConditions must be an array of strings' });
  }

  if (allergies !== undefined && !Array.isArray(allergies)) {
    errors.push({ field: 'allergies', message: 'allergies must be an array of strings' });
  }

  return errors;
};

module.exports = {
  isValidPhone,
  isValidPassword,
  isValidFullName,
  isValidOtp,
  validateRegisterInput,
  validateLoginInput,
  validateOtpInput,
  validateResendOtpInput,
  validateProfileInput,
};
