import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../store/useThemeStore';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import Toast from 'react-native-toast-message';

const DEFAULT_TOPICS = ['AI', 'Technology', 'Startups', 'Finance', 'Travel', 'Fitness', 'Design', 'Photography', 'Health & Wellness', 'Productivity', 'Art & Culture', 'Mindfulness', 'Entrepreneurship', 'Self Improvement', 'Investing'];

export default function InterestsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors, setAccent, deriveAccentFromInterest } = useThemeStore();
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');

  const toggleInterest = (topic: string) => {
    if (selectedInterests.includes(topic)) {
      setSelectedInterests(prev => prev.filter(t => t !== topic));
    } else {
      setSelectedInterests(prev => [...prev, topic]);
      deriveAccentFromInterest(topic);
    }
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      toggleInterest(customInterest.trim());
      setCustomInterest('');
    }
  };

  const handleNext = async () => {
    if (selectedInterests.length === 0) {
      Toast.show({ type: 'error', text1: 'Please select at least one interest' });
      return;
    }

    if (!user) return;

    // Save initial DNA composition
    const composition: any = {};
    let rawWeights = selectedInterests.map(() => Math.random() * 50 + 10);
    rawWeights.sort((a, b) => b - a);
    const totalRaw = rawWeights.reduce((sum, w) => sum + w, 0);
    let remaining = 100;

    selectedInterests.forEach((topic, index) => {
      if (index === selectedInterests.length - 1) {
        composition[topic] = remaining; // Assign remainder to exact 100
      } else {
        const w = Math.round((rawWeights[index] / totalRaw) * 100);
        composition[topic] = w;
        remaining -= w;
      }
    });

    await supabase.from('interest_dna').insert({
      user_id: user.id,
      composition
    });

    router.push('/(onboarding)/dislikes');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 px-8 pt-16 pb-8">
        <Text className="text-xs uppercase tracking-widest mb-2" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>
          Step 1 of 2
        </Text>
        <Text className="text-3xl tracking-tighter mb-4" style={{ color: colors.text, fontFamily: 'Inter_900Black' }}>
          What do you want to see?
        </Text>
        <Text className="text-base leading-relaxed mb-8" style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular' }}>
          Select the topics you want Instagram to show you more of. We'll track your engagement against these goals.
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-8">
          {DEFAULT_TOPICS.map(topic => {
            const isSelected = selectedInterests.includes(topic);
            return (
              <TouchableOpacity
                key={topic}
                onPress={() => toggleInterest(topic)}
                className="px-5 py-3 rounded-full border"
                style={{ 
                  backgroundColor: isSelected ? colors.primary : colors.background,
                  borderColor: isSelected ? colors.primary : colors.border
                }}
              >
                <Text 
                  style={{ 
                    color: isSelected ? '#FFF' : colors.text, 
                    fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_500Medium' 
                  }}
                >
                  {topic}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-sm mb-3" style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>Add Custom Topic</Text>
        <View className="flex-row items-center rounded-xl px-4 py-1 mb-8" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
          <TextInput
            className="flex-1 h-12"
            style={{ color: colors.text, fontFamily: 'Inter_400Regular' }}
            placeholder="e.g. Neuroscience"
            placeholderTextColor={colors.textMuted}
            value={customInterest}
            onChangeText={setCustomInterest}
            onSubmitEditing={addCustomInterest}
          />
          <TouchableOpacity onPress={addCustomInterest}>
            <Feather name="plus-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View className="p-8 border-t" style={{ backgroundColor: colors.background, borderTopColor: colors.border }}>
        <TouchableOpacity 
          className="w-full rounded-full py-4 flex-row justify-center items-center shadow-lg"
          style={{ backgroundColor: colors.text }}
          onPress={handleNext}
        >
          <Text className="font-semibold text-base" style={{ color: colors.background, fontFamily: 'Inter_600SemiBold' }}>
            Continue
          </Text>
          <Feather name="arrow-right" size={20} color={colors.background} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
