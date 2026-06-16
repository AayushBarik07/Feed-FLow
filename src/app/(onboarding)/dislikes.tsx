import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../store/useThemeStore';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { useAppStore } from '../../store/useAppStore';
import Toast from 'react-native-toast-message';

const DEFAULT_DISLIKES = ['Politics', 'Celebrity Gossip', 'Memes', 'Clickbait', 'Reality TV', 'Pranks', 'Drama', 'Polarizing News', 'Scams/Hustle Culture', 'Rage Bait', 'Doomerism', 'Toxicity'];

export default function DislikesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setHasCompletedOnboarding } = useAppStore();
  const { colors } = useThemeStore();
  
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>([]);
  const [customDislike, setCustomDislike] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleDislike = (topic: string) => {
    if (selectedDislikes.includes(topic)) {
      setSelectedDislikes(prev => prev.filter(t => t !== topic));
    } else {
      setSelectedDislikes(prev => [...prev, topic]);
    }
  };

  const addCustomDislike = () => {
    if (customDislike.trim() && !selectedDislikes.includes(customDislike.trim())) {
      toggleDislike(customDislike.trim());
      setCustomDislike('');
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    if (user && selectedDislikes.length > 0) {
      await supabase.from('profiles').update({
        disliked_topics: selectedDislikes
      }).eq('id', user.id);
    }

    Toast.show({ type: 'success', text1: 'Profile Configured', text2: "Let's start training your feed." });
    setHasCompletedOnboarding(true);
    router.replace('/(main)');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1 px-8 pt-16 pb-8">
        <TouchableOpacity onPress={() => router.back()} className="mb-6 w-10 h-10 items-center justify-center rounded-full bg-zinc-800/20">
          <Feather name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text className="text-xs uppercase tracking-widest mb-2" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>
          Step 2 of 2
        </Text>
        <Text className="text-3xl tracking-tighter mb-4" style={{ color: colors.text, fontFamily: 'Inter_900Black' }}>
          What do you want less of?
        </Text>
        <Text className="text-base leading-relaxed mb-8" style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular' }}>
          Select the topics you are trying to remove from your feed. Our analytics will help ensure you aren't engaging with these.
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-8">
          {DEFAULT_DISLIKES.map(topic => {
            const isSelected = selectedDislikes.includes(topic);
            return (
              <TouchableOpacity
                key={topic}
                onPress={() => toggleDislike(topic)}
                className="px-5 py-3 rounded-full border"
                style={{ 
                  backgroundColor: isSelected ? colors.card : 'transparent',
                  borderColor: isSelected ? '#EF4444' : colors.border
                }}
              >
                <Text 
                  style={{ 
                    color: isSelected ? '#EF4444' : colors.text, 
                    fontFamily: isSelected ? 'Inter_600SemiBold' : 'Inter_500Medium' 
                  }}
                >
                  {topic}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text className="text-sm mb-3" style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>Add Custom Avoidance Topic</Text>
        <View className="flex-row items-center rounded-xl px-4 py-1 mb-8" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
          <TextInput
            className="flex-1 h-12"
            style={{ color: colors.text, fontFamily: 'Inter_400Regular' }}
            placeholder="e.g. Crypto Drama"
            placeholderTextColor={colors.textMuted}
            value={customDislike}
            onChangeText={setCustomDislike}
            onSubmitEditing={addCustomDislike}
          />
          <TouchableOpacity onPress={addCustomDislike}>
            <Feather name="plus-circle" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>

      </ScrollView>

      <View className="p-8 border-t" style={{ backgroundColor: colors.background, borderTopColor: colors.border }}>
        <TouchableOpacity 
          className="w-full rounded-full py-4 flex-row justify-center items-center shadow-lg"
          style={{ backgroundColor: colors.text }}
          onPress={handleFinish}
          disabled={loading}
        >
          <Text className="font-semibold text-base" style={{ color: colors.background, fontFamily: 'Inter_600SemiBold' }}>
            Complete Setup
          </Text>
          <Feather name="check" size={20} color={colors.background} style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
