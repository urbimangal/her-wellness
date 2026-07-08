const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const calculatePrediction = (lastPeriodDate, cycleLength) => {
  const nextPeriod = addDays(lastPeriodDate, cycleLength);

  const ovulationDate = addDays(nextPeriod, -14);

  const fertileStart = addDays(ovulationDate, -5);

  const fertileEnd = addDays(ovulationDate, 1);

  return {
    nextPeriod,
    ovulationDate,
    fertileStart,
    fertileEnd,
  };
};

module.exports = {
  calculatePrediction,
};