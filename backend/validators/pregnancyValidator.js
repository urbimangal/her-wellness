module.exports = function validatePregnancy(data) {
  const errors = [];

  if (!data.lastPeriodDate) {
    errors.push({
      field: "lastPeriodDate",
      message: "Last Period Date is required.",
    });
  }

  if (data.lastPeriodDate) {
    const lmp = new Date(data.lastPeriodDate);

    if (isNaN(lmp.getTime())) {
      errors.push({
        field: "lastPeriodDate",
        message: "Invalid date.",
      });
    }

    if (lmp > new Date()) {
      errors.push({
        field: "lastPeriodDate",
        message: "Last Period Date cannot be in the future.",
      });
    }
  }

  return errors;
};