const ai = require("../config/gemini");
const healthPrompt = require("../prompts/healthPrompt");

const aiChatService = async (message) => {
  const prompt = `${healthPrompt}\n\nUser: ${message}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
};

module.exports = aiChatService;