import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/useOnboardingStore';
import { useAuthStore } from '../../store/useAuthStore';
import { supabase } from '../../lib/supabase';
import { useAppStore } from '../../store/useAppStore';

export default function GeneratingScreen() {
  const router = useRouter();
  const { selectedInterests, topicsToReduce, reset } = useOnboardingStore();
  const { user } = useAuthStore();
  const { setHasCompletedOnboarding } = useAppStore();
  const [status, setStatus] = useState('Saving preferences...');

  useEffect(() => {
    const generateDNA = async () => {
      if (!user) return;

      try {
        // 1. Save Interests
        const interestsToInsert = selectedInterests.map(topic => ({
          user_id: user.id,
          topic
        }));
        await supabase.from('user_interests').insert(interestsToInsert);

        setStatus('Saving blocked topics...');

        // 2. Save Blocked Topics
        const topicsToInsert = topicsToReduce.map(topic => ({
          user_id: user.id,
          topic
        }));
        await supabase.from('blocked_topics').insert(topicsToInsert);

        setStatus('Generating AI Interest DNA...');

        // 3. Mock AI DNA Generation (Later we will call the Edge Function)
        // For now, we simulate a delay to show the animation
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Save initial mock DNA
        const mockComposition = selectedInterests.reduce((acc, curr, index) => {
          // simple even split distribution for the mock
          acc[curr] = Math.floor(100 / selectedInterests.length);
          return acc;
        }, {} as Record<string, number>);

        await supabase.from('interest_dna').insert({
          user_id: user.id,
          composition: mockComposition,
          emerging_interests: [selectedInterests[0]],
          declining_interests: [topicsToReduce[0]]
        });

        setStatus('Complete!');
        setHasCompletedOnboarding(true);
        reset();
        
        // Navigate to Main Dashboard
        router.replace('/(main)');

      } catch (error: any) {
        Alert.alert('Error', error.message);
      }
    };

    generateDNA();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-zinc-950 px-6">
      <View className="w-24 h-24 rounded-full bg-blue-900/30 items-center justify-center mb-8">
         <ActivityIndicator size="large" color="#3b82f6" />
      </View>
      <Text className="text-2xl font-bold text-white mb-2 text-center">Constructing Profile</Text>
      <Text className="text-zinc-400 text-base text-center">{status}</Text>
    </View>
  );
}
