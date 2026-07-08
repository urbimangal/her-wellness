const validateCycle = (data) => {
  const errors = [];

  if (!data.lastPeriodDate) {
    errors.push("Last Period Date is required.");
  }

  if (
    data.cycleLength &&
    (data.cycleLength < 20 || data.cycleLength > 45)
  ) {
    errors.push("Cycle Length should be between 20 and 45 days.");
  }

  if (
    data.periodLength &&
    (data.periodLength < 2 || data.periodLength > 10)
  ) {
    errors.push("Period Length should be between 2 and 10 days.");
  }

  if (
    data.flow &&
    !["Light", "Medium", "Heavy"].includes(data.flow)
  ) {
    errors.push("Invalid Flow Type.");
  }

  return errors;
};

module.exports = validateCycle;