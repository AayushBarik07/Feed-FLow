import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { GoogleGenerativeAI } from 'https://esm.sh/@google/generative-ai@0.1.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    const geminiKey = Deno.env.get('GEMINI_API_KEY') ?? '';
    const genAI = new GoogleGenerativeAI(geminiKey);

    // Only process users who have automation turned ON
    const { data: activeUsers } = await supabase.from('automation_status').select('user_id').eq('is_active', true);
    if (!activeUsers) throw new Error('No active users to process');

    let processedCount = 0;

    for (const { user_id } of activeUsers) {
      // 1. Fetch real behavioral data
      const { data: interactions } = await supabase.from('interest_interactions').select('*').eq('user_id', user_id);
      const { data: missions } = await supabase.from('daily_missions').select('*').eq('user_id', user_id);
      const { data: discovery } = await supabase.from('discovery_actions').select('*').eq('user_id', user_id);
      const { data: sessions } = await supabase.from('session_activity').select('*').eq('user_id', user_id);
      
      // Calculate Deterministic Interest DNA based on interaction weights
      const topicWeights: Record<string, number> = {};
      let totalWeight = 0;
      
      if (interactions && interactions.length > 0) {
        interactions.forEach(interaction => {
          topicWeights[interaction.topic] = (topicWeights[interaction.topic] || 0) + interaction.weight;
          totalWeight += interaction.weight;
        });
      } else {
        // Fallback to base interests if no interactions exist yet
        const { data: baseInterests } = await supabase.from('user_interests').select('topic').eq('user_id', user_id);
        if (baseInterests && baseInterests.length > 0) {
          const splitWeight = 100 / baseInterests.length;
          baseInterests.forEach(bi => {
            topicWeights[bi.topic] = splitWeight;
          });
          totalWeight = 100;
        }
      }

      let newComposition: Record<string, number> = {};
      if (totalWeight > 0) {
        Object.keys(topicWeights).forEach(topic => {
          newComposition[topic] = Math.round((topicWeights[topic] / totalWeight) * 100);
        });
      } else {
        newComposition = { "Welcome": 100 };
      }

      // Calculate Deterministic Feed Health Score (Legacy fallback)
      const totalMissions = missions?.length || 1;
      const completedMissions = missions?.filter(m => m.is_completed).length || 0;
      const missionCompletionRate = (completedMissions / totalMissions) * 100;
      
      const interestScore = Math.min(100, (interactions?.length || 0) * 5); 
      const discoveryScore = Math.min(100, (discovery?.length || 0) * 10);
      const consistencyScore = Math.min(100, (sessions?.length || 0) * 15);
      
      const healthScore = Math.round((interestScore * 0.40) + (missionCompletionRate * 0.20) + (discoveryScore * 0.20) + (consistencyScore * 0.20));

      // NEW: Interest Training Score
      const trainingScore = Math.round((interestScore * 0.3) + (discoveryScore * 0.3) + (missionCompletionRate * 0.2) + (consistencyScore * 0.2));

      // NEW: Instagram Alignment Score
      const alignmentScore = Math.round((interestScore * 0.25) + (missionCompletionRate * 0.25) + (discoveryScore * 0.25) + (consistencyScore * 0.25));

      // NEW: Action Explanation Engine
      const explanation = `Reason:\n+${interactions?.length || 0} topic interactions\n+${discovery?.length || 0} discoveries\n+${completedMissions} completed missions`;

      // Save to database
      await supabase.from('interest_dna').insert({ user_id, composition: newComposition });
      await supabase.from('feed_health_scores').insert({ 
        user_id, 
        score: healthScore,
        factors: {
          interest_completion: interestScore,
          mission_completion: Math.round(missionCompletionRate),
          discovery_activity: discoveryScore,
          consistency: consistencyScore,
          training_score: trainingScore,
          alignment_score: alignmentScore,
          explanation: explanation
        }
      });
      
      // Update automation status
      await supabase.from('automation_status').update({
        last_analysis_at: new Date().toISOString(),
        last_report_generated_at: new Date().toISOString()
      }).eq('user_id', user_id);

      processedCount++;
    }

    return new Response(
      JSON.stringify({ success: true, message: `Processed ${processedCount} users deterministically.` }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
