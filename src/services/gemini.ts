import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export const generateDailyMissions = async (interestDna: Record<string, number>, blockedTopics: string[]) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are an expert AI Instagram Feed Personalization Coach.
      Your job is to generate 3 highly actionable, specific "daily missions" for a user to train their Instagram algorithm.

      The user's Interest DNA (Topics they want to see more of, and current percentage weights):
      ${JSON.stringify(interestDna)}

      The user's Blocked Topics (Topics they explicitly want to avoid):
      ${JSON.stringify(blockedTopics)}

      Generate 3 diverse missions that the user can do on Instagram today to push the algorithm towards their Interest DNA.
      Action types can be: 'search_and_save', 'like_and_engage', 'not_interested', or 'watch_duration'.

      Respond ONLY with a valid JSON array of objects, with each object following this schema:
      {
        "title": "A punchy, 3-5 word title",
        "description": "A 1-2 sentence detailed instruction on what to do.",
        "action_type": "The type of action (e.g. search_and_save)",
        "target_topic": "The specific topic from their DNA"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    const missions = JSON.parse(text);
    return missions;

  } catch (error) {
    console.error('Error generating missions with Gemini:', error);
    return null;
  }
};
