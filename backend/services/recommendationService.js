const recommendationService = async (disease) => {
  return {
    disease,

    tips: [
      "Drink enough water",
      "Sleep 8 hours",
      "Exercise regularly",
      "Consult a doctor if symptoms persist",
    ],
  };
};

module.exports = recommendationService;