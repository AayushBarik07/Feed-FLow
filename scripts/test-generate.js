const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say hello");
    console.log(`SUCCESS: ${modelName} -> ${result.response.text()}`);
  } catch (e) {
    console.error(`FAILED: ${modelName} -> ${e.message}`);
  }
}

async function run() {
  await testModel('gemini-2.5-pro');
  await testModel('gemini-2.5-flash-lite');
  await testModel('gemini-1.5-pro');
}

run();
