import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ExplainScreen() {
  const router = useRouter();

  const features = [
    { title: 'Connect Instagram', desc: 'Securely link your account without sharing passwords.' },
    { title: 'Select Interests', desc: 'Tell the AI what you want to see more (and less) of.' },
    { title: 'Activate Personalization', desc: 'Let our engine generate daily feed-training missions.' },
    { title: 'Improve Recommendations', desc: 'Watch your feed transform to match your true goals.' },
  ];

  return (
    <View className="flex-1 bg-zinc-950 px-6 pt-20">
      <Text className="text-3xl font-bold text-white mb-10 tracking-tight">How it works</Text>
      
      <View className="space-y-8 flex-1">
        {features.map((item, index) => (
          <View key={index} className="flex-row items-start space-x-4">
            <View className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 items-center justify-center">
              <Text className="text-blue-500 font-bold">{index + 1}</Text>
            </View>
            <View className="flex-1 pt-1 ml-4">
              <Text className="text-white font-semibold text-lg mb-1">{item.title}</Text>
              <Text className="text-zinc-400 leading-relaxed">{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        className="w-full bg-blue-600 rounded-xl py-4 mb-12 flex-row justify-center items-center shadow-lg"
        onPress={() => router.push('/(onboarding)/interests')}
      >
        <Text className="text-white font-bold text-lg">Continue</Text>
      </TouchableOpacity>
    </View>
  );
}
