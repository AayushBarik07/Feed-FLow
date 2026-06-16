import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize with Expo public variable.
// Make sure EXPO_PUBLIC_GEMINI_API_KEY is defined in .env
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const generateTopicExpansion = async (topic: string): Promise<string[]> => {
  if (!apiKey) return ['LLMs', 'Agents', 'Prompt Engineering']; // Fallback for demo without key
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const prompt = `You are an intelligence engine. For the broad interest topic "${topic}", generate exactly 5 highly specific, trending subtopics or concepts. Return ONLY a comma-separated list. No markdown, no extra text.`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    return response.split(',').map(s => s.trim());
  } catch (error) {
    return ['Advanced ' + topic, topic + ' Trends', 'Applied ' + topic];
  }
};

export const generateInterestInsight = async (topic: string, growth: number, actions: string[]): Promise<string> => {
  if (!apiKey) return `${topic} increased by ${growth}% this week based on your interactions.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const prompt = `You are an AI analyst writing a 2-sentence insight for a user. The user's interest in "${topic}" grew by ${growth}%. Their recent actions were: ${actions.join(', ')}. Write a concise, professional insight explaining this momentum.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return `Your engagement with ${topic} is driving a ${growth}% increase in its profile weight.`;
  }
};

export const generateWeeklyReport = async (topInterest: string, growth: number, decliningInterest: string, decline: number): Promise<string> => {
  if (!apiKey) return `Your profile shifted heavily toward ${topInterest} (+${growth}%) while ${decliningInterest} decreased by ${decline}%.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const prompt = `Write a professional 3-sentence weekly intelligence report. The user's top growing interest is ${topInterest} (+${growth}%). Their most declining interest is ${decliningInterest} (-${decline}%). Explain what this behavioral shift indicates about their current focus.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return `Analysis shows a strategic shift in your content consumption towards ${topInterest}, moving away from ${decliningInterest}.`;
  }
};

export const generateRecommendationExplanation = async (topic: string, userTopInterest: string): Promise<string> => {
  if (!apiKey) return `Recommended because it aligns with your interest in ${userTopInterest}.`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });
    const prompt = `Write a single sentence explaining why an article about "${topic}" is highly recommended for someone deeply interested in "${userTopInterest}". Make it sound like an expert AI agent.`;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    return `Matches your core DNA profile for ${userTopInterest}.`;
  }
};
