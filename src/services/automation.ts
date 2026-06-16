import { supabase } from '../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.EXPO_PUBLIC_GEMINI_API_KEY || '');

export const runDailyAutomationAnalysis = async (userId: string, currentDna: any, completedMissions: any[]) => {
  try {
    // 1. If no missions completed, penalize health score slightly but keep DNA same
    if (completedMissions.length === 0) {
      return { success: false, message: 'No missions completed to analyze.' };
    }

    // 2. Ask Gemini to evolve the DNA based on completed missions
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are the core logic engine of FeedFlow. Your job is to evolve the user's Interest DNA.
      
      Current DNA Composition: ${JSON.stringify(currentDna.composition)}
      Missions the user successfully completed today: ${JSON.stringify(completedMissions.map(m => m.target_topic))}

      Rules:
      1. Increase the percentage of the topics the user completed missions for.
      2. Decrease other topics proportionally so the total sum is 100%.
      3. Do NOT invent new topics right now, just redistribute the existing ones.
      4. Output the new composition exactly matching the previous keys, with integer percentage values.

      Respond ONLY with a valid JSON object representing the new composition. Example: {"AI": 75, "Startups": 25}
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const newComposition = JSON.parse(text);

    // 3. Save new DNA to database
    await supabase.from('interest_dna').insert({
      user_id: userId,
      composition: newComposition,
      emerging_interests: currentDna.emerging_interests,
      declining_interests: currentDna.declining_interests
    });

    // 4. Update Automation Status
    await supabase.from('automation_status').update({
      last_analysis_at: new Date().toISOString(),
      is_active: true
    }).eq('user_id', userId);

    // 5. Update Feed Health Score (Give them +5 points for completing missions, capped at 100)
    // Fetch latest score
    const { data: latestScoreData } = await supabase
      .from('feed_health_scores')
      .select('score')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    const currentScore = latestScoreData?.score || 50;
    const newScore = Math.min(100, currentScore + 5);

    await supabase.from('feed_health_scores').insert({
      user_id: userId,
      score: newScore,
      factors: { "engagement_consistency": 100 }
    });

    // 6. Delete old missions so new ones generate tomorrow
    await supabase.from('daily_missions').delete().eq('user_id', userId);

    return { success: true, newComposition, newScore };

  } catch (error: any) {
    console.error('Automation Error:', error);
    return { success: false, message: error.message };
  }
};
