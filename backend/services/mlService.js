const axios = require("axios");

const predictionApi = axios.create({
  baseURL: process.env.PREDICTION_API || "http://localhost:5003",
  timeout: 10000,
});

const recommendationApi = axios.create({
  baseURL: process.env.RECOMMENDATION_API || "http://localhost:5002",
  timeout: 10000,
});

const predictPeriod = async (payload) => {
  try {
    const { data } = await predictionApi.post("/predict", payload);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      "Menstrual Prediction Service is unavailable"
    );
  }
};

const getRecommendations = async (payload) => {
  try {
    const { data } = await recommendationApi.post("/recommend", payload);
    return data;
  } catch (error) {
    throw new Error(
      error.response?.data?.error ||
      "Recommendation Engine is unavailable"
    );
  }
};

module.exports = {
  predictPeriod,
  getRecommendations,
};