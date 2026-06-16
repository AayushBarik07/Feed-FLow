import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';

export type DemoPersona = 'ai_founder' | 'fitness_creator' | 'travel_blogger' | 'student_builder';

export const DEMO_PERSONAS = {
  ai_founder: {
    name: 'AI Founder',
    theme: 'startups',
    dna: { 'AI': 60, 'Startups': 25, 'Finance': 15 },
    history: [
      { day: 1, dna: { 'AI': 20, 'Startups': 40, 'Finance': 40 } },
      { day: 7, dna: { 'AI': 35, 'Startups': 40, 'Finance': 25 } },
      { day: 14, dna: { 'AI': 45, 'Startups': 35, 'Finance': 20 } },
      { day: 21, dna: { 'AI': 55, 'Startups': 30, 'Finance': 15 } },
      { day: 30, dna: { 'AI': 60, 'Startups': 25, 'Finance': 15 } }
    ],
    health: 87,
    alignment: 92,
    training_score: 95
  },
  fitness_creator: {
    name: 'Fitness Enthusiast',
    theme: 'fitness',
    dna: { 'Fitness': 70, 'Health': 20, 'Nutrition': 10 },
    history: [
      { day: 1, dna: { 'Fitness': 30, 'Health': 40, 'Nutrition': 30 } },
      { day: 15, dna: { 'Fitness': 50, 'Health': 30, 'Nutrition': 20 } },
      { day: 30, dna: { 'Fitness': 70, 'Health': 20, 'Nutrition': 10 } }
    ],
    health: 92,
    alignment: 88,
    training_score: 89
  },
  travel_blogger: {
    name: 'Travel Creator',
    theme: 'travel',
    dna: { 'Travel': 55, 'Photography': 30, 'Lifestyle': 15 },
    history: [
      { day: 1, dna: { 'Travel': 20, 'Photography': 40, 'Lifestyle': 40 } },
      { day: 15, dna: { 'Travel': 40, 'Photography': 35, 'Lifestyle': 25 } },
      { day: 30, dna: { 'Travel': 55, 'Photography': 30, 'Lifestyle': 15 } }
    ],
    health: 78,
    alignment: 75,
    training_score: 82
  },
  student_builder: {
    name: 'Student Builder',
    theme: 'technology',
    dna: { 'Technology': 40, 'AI': 30, 'Startups': 20, 'Productivity': 10 },
    history: [
      { day: 1, dna: { 'Technology': 25, 'AI': 15, 'Startups': 10, 'Productivity': 50 } },
      { day: 15, dna: { 'Technology': 35, 'AI': 25, 'Startups': 15, 'Productivity': 25 } },
      { day: 30, dna: { 'Technology': 40, 'AI': 30, 'Startups': 20, 'Productivity': 10 } }
    ],
    health: 84,
    alignment: 81,
    training_score: 85
  }
};

export const seedDemoPersona = async (personaKey: DemoPersona) => {
  const { user } = useAuthStore.getState();
  if (!user) return;

  const data = DEMO_PERSONAS[personaKey];

  // 1. Set Theme Accent
  useThemeStore.getState().setAccent(data.theme as any);

  // 2. Wipe existing history and DNA for clean slate
  await supabase.from('interest_history').delete().eq('user_id', user.id);
  await supabase.from('interest_dna').delete().eq('user_id', user.id);
  await supabase.from('feed_health_scores').delete().eq('user_id', user.id);
  await supabase.from('weekly_reports').delete().eq('user_id', user.id);

  // 3. Inject new DNA
  await supabase.from('interest_dna').insert({
    user_id: user.id,
    composition: data.dna
  });

  // 4. Inject Dense History Timeline
  for (const hist of data.history) {
    await supabase.from('interest_history').insert({
      user_id: user.id,
      day_number: hist.day,
      interest_dna: hist.dna
    });
  }

  // 5. Inject Feed Health Score with Breakdown
  await supabase.from('feed_health_scores').insert({
    user_id: user.id,
    score: data.health,
    factors: {
      interest_completion: Math.round(data.health * 0.4),
      mission_completion: Math.round(data.health * 0.2),
      discovery_activity: Math.round(data.health * 0.2),
      consistency: Math.round(data.health * 0.2),
      alignment_score: data.alignment,
      training_score: data.training_score
    }
  });

  // 6. Generate "Gemini" Weekly Report for UI (Mocked for speed during demo load)
  const topInterest = Object.keys(data.dna)[0];
  const secondInterest = Object.keys(data.dna)[1];
  
  await supabase.from('weekly_reports').insert({
    user_id: user.id,
    summary: `Your profile shifted heavily toward ${topInterest} and ${secondInterest} this week. Discovery behavior indicates growing engagement with advanced concepts.`,
    insights: { top_mover: topInterest, growth: "+14%" },
    recommended_topics: [`Advanced ${topInterest}`, `Related to ${secondInterest}`]
  });

  console.log('✅ Demo Persona Seeded with 30-day rich history:', data.name);
};
