const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';

async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Available models:");
    data.models.forEach(m => {
        if (m.supportedGenerationMethods.includes('generateContent')) {
            console.log(m.name);
        }
    });
  } catch (e) {
    console.error("Failed to fetch models", e);
  }
}

listModels();
