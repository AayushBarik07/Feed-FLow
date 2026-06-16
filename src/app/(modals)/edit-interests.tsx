import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../store/useThemeStore';
import { useAppStore } from '../../store/useAppStore';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import Toast from 'react-native-toast-message';

export default function EditInterestsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { colors, deriveAccentFromInterest } = useThemeStore();
  
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [customInterest, setCustomInterest] = useState('');
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>([]);
  const [customDislike, setCustomDislike] = useState('');
  const [loading, setLoading] = useState(false);

  const PRESET_INTERESTS = ["AI", "Technology", "Startups", "Finance", "Travel", "Fitness", "Design", "Photography", "Health & Wellness", "Productivity", "Art & Culture", "Mindfulness", "Entrepreneurship", "Self Improvement", "Investing"];
  const PRESET_DISLIKES = ["Politics", "Celebrity Gossip", "Memes", "Clickbait", "Reality TV", "Pranks", "Drama", "Polarizing News", "Scams/Hustle Culture", "Rage Bait", "Doomerism", "Toxicity"];

  useEffect(() => {
    fetchCurrentData();
  }, []);

  const fetchCurrentData = async () => {
    if (!user) return;
    const { data: dnaData } = await supabase.from('interest_dna').select('*').eq('user_id', user.id).order('generated_at', { ascending: false }).limit(1).single();
    if (dnaData && dnaData.composition) {
      setSelectedInterests(Object.keys(dnaData.composition));
    }

    const { data: profileData } = await supabase.from('profiles').select('disliked_topics').eq('id', user.id).single();
    if (profileData && profileData.disliked_topics) {
      setSelectedDislikes(profileData.disliked_topics);
    }
  };

  const toggleInterest = (topic: string) => {
    setSelectedInterests(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  const toggleDislike = (topic: string) => {
    setSelectedDislikes(prev => prev.includes(topic) ? prev.filter(t => t !== topic) : [...prev, topic]);
  };

  const addCustomInterest = () => {
    if (customInterest.trim() && !selectedInterests.includes(customInterest.trim())) {
      toggleInterest(customInterest.trim());
      setCustomInterest('');
    }
  };

  const addCustomDislike = () => {
    if (customDislike.trim() && !selectedDislikes.includes(customDislike.trim())) {
      toggleDislike(customDislike.trim());
      setCustomDislike('');
    }
  };

  const handleSave = async () => {
    if (selectedInterests.length === 0) {
      Toast.show({ type: 'error', text1: 'Please select at least one interest' });
      return;
    }

    setLoading(true);
    if (!user) return;

    // Recalculate DNA composition
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

    const { error: insertError } = await supabase.from('interest_dna').insert({
      user_id: user.id,
      composition
    });

    if (insertError) {
      setLoading(false);
      Toast.show({ type: 'error', text1: 'Failed to save interests', text2: insertError.message });
      return;
    }

    // Update Dislikes
    const { error: profileError } = await supabase.from('profiles').update({
      disliked_topics: selectedDislikes
    }).eq('id', user.id);

    if (profileError) {
      console.warn('Dislikes update failed:', profileError);
    }

    // Update Theme instantly based on top interest
    if (selectedInterests.length > 0) {
      deriveAccentFromInterest(selectedInterests[0]);
    }

    useAppStore.getState().triggerUpdate();

    setLoading(false);
    Toast.show({ type: 'success', text1: 'Preferences Saved', text2: 'Analytics recalculating...' });
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="flex-row items-center justify-between px-6 pt-16 pb-4 border-b" style={{ borderBottomColor: colors.border }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium' }}>Cancel</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>Edit Preferences</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold' }}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pt-6 pb-12">
        
        {/* Interests Section */}
        <Text className="text-xs uppercase tracking-widest mb-4" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Desired Topics (Missions)</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {PRESET_INTERESTS.map(topic => {
            const isSelected = selectedInterests.includes(topic);
            return (
              <TouchableOpacity
                key={topic}
                onPress={() => toggleInterest(topic)}
                className="px-4 py-2 rounded-full border"
                style={{ 
                  backgroundColor: isSelected ? colors.primary : 'transparent', 
                  borderColor: isSelected ? colors.primary : colors.border 
                }}
              >
                <Text style={{ color: isSelected ? '#FFF' : colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>
                  {topic} {isSelected ? '×' : '+'}
                </Text>
              </TouchableOpacity>
            );
          })}
          
          {selectedInterests.filter(t => !PRESET_INTERESTS.includes(t)).map(topic => (
            <TouchableOpacity
              key={topic}
              onPress={() => toggleInterest(topic)}
              className="px-4 py-2 rounded-full border"
              style={{ backgroundColor: colors.primary, borderColor: colors.primary }}
            >
              <Text style={{ color: '#FFF', fontFamily: 'Inter_600SemiBold' }}>{topic} ×</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row items-center rounded-xl px-4 py-1 h-14 mb-10" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
          <TextInput
            className="flex-1 h-full"
            style={{ color: colors.text, fontFamily: 'Inter_400Regular' }}
            placeholder="Add new interest..."
            placeholderTextColor={colors.textMuted}
            value={customInterest}
            onChangeText={setCustomInterest}
            onSubmitEditing={addCustomInterest}
          />
          <TouchableOpacity onPress={addCustomInterest}>
            <Feather name="plus" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Dislikes Section */}
        <Text className="text-xs uppercase tracking-widest mb-4" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Avoidance Topics (Dislikes)</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {PRESET_DISLIKES.map(topic => {
            const isSelected = selectedDislikes.includes(topic);
            return (
              <TouchableOpacity
                key={topic}
                onPress={() => toggleDislike(topic)}
                className="px-4 py-2 rounded-full border"
                style={{ 
                  backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.1)' : 'transparent', 
                  borderColor: isSelected ? 'rgba(239, 68, 68, 0.3)' : colors.border 
                }}
              >
                <Text style={{ color: isSelected ? '#EF4444' : colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>
                  {topic} {isSelected ? '×' : '+'}
                </Text>
              </TouchableOpacity>
            );
          })}

          {selectedDislikes.filter(t => !PRESET_DISLIKES.includes(t)).map(topic => (
            <TouchableOpacity
              key={topic}
              onPress={() => toggleDislike(topic)}
              className="px-4 py-2 rounded-full border"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
            >
              <Text style={{ color: '#EF4444', fontFamily: 'Inter_600SemiBold' }}>{topic} ×</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View className="flex-row items-center rounded-xl px-4 py-1 h-14 mb-10" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
          <TextInput
            className="flex-1 h-full"
            style={{ color: colors.text, fontFamily: 'Inter_400Regular' }}
            placeholder="Add topic to avoid..."
            placeholderTextColor={colors.textMuted}
            value={customDislike}
            onChangeText={setCustomDislike}
            onSubmitEditing={addCustomDislike}
          />
          <TouchableOpacity onPress={addCustomDislike}>
            <Feather name="plus" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}
