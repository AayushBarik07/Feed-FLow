import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../../store/useOnboardingStore';

const REDUCE_TOPICS = [
  'Celebrity Content', 'Memes', 'Politics', 'Gossip', 'Entertainment',
  'Pranks', 'Drama', 'Clickbait', 'Astrology'
];

export default function ReduceScreen() {
  const router = useRouter();
  const { topicsToReduce, toggleReduceTopic } = useOnboardingStore();

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-20">
      <Text className="text-3xl font-bold text-white mb-2 tracking-tight">Reduce Noise</Text>
      <Text className="text-zinc-400 mb-8 text-base">What do you want to see less of?</Text>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="flex-row flex-wrap gap-3">
          {REDUCE_TOPICS.map((topic) => {
            const isSelected = topicsToReduce.includes(topic);
            return (
              <TouchableOpacity
                key={topic}
                onPress={() => toggleReduceTopic(topic)}
                className={`px-5 py-3 rounded-full border ${
                  isSelected ? 'bg-rose-600 border-rose-500' : 'bg-zinc-900 border-zinc-800'
                }`}
              >
                <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                  {topic}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        className={`w-full rounded-xl py-4 mb-12 flex-row justify-center items-center ${
          topicsToReduce.length > 0 ? 'bg-blue-600' : 'bg-zinc-800'
        }`}
        disabled={topicsToReduce.length === 0}
        onPress={() => router.push('/(onboarding)/generating')}
      >
        <Text className={`font-bold text-lg ${topicsToReduce.length > 0 ? 'text-white' : 'text-zinc-500'}`}>
          Generate DNA
        </Text>
      </TouchableOpacity>
    </View>
  );
}
