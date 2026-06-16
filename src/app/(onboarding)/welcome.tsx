import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '../../store/useThemeStore';
import { Feather } from '@expo/vector-icons';

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 32, justifyContent: 'center' }}>
      <View className="mb-16">
        <View className="w-16 h-16 rounded-2xl mb-8 items-center justify-center" style={{ backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }}>
          <Feather name="layers" size={32} color={colors.primary} />
        </View>
        <Text className="text-4xl tracking-tighter mb-4" style={{ color: colors.text, fontFamily: 'Inter_900Black' }}>
          Welcome to FeedFlow.
        </Text>
        <Text className="text-lg leading-relaxed" style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular' }}>
          Your personal coach for training social media algorithms. Stop scrolling passively. Start designing your digital diet.
        </Text>
      </View>

      <TouchableOpacity 
        className="w-full rounded-full py-4 flex-row justify-center items-center shadow-lg"
        style={{ backgroundColor: colors.text }}
        onPress={() => router.push('/(auth)/login')}
      >
        <Text className="font-semibold text-base" style={{ color: colors.background, fontFamily: 'Inter_600SemiBold' }}>
          Get Started
        </Text>
        <Feather name="arrow-right" size={20} color={colors.background} style={{ marginLeft: 8 }} />
      </TouchableOpacity>
    </View>
  );
}
