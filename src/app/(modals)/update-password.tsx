import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useThemeStore } from '../../store/useThemeStore';
import Toast from 'react-native-toast-message';
import { Feather } from '@expo/vector-icons';

export default function UpdatePasswordModal() {
  const router = useRouter();
  const { colors } = useThemeStore();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    if (!password || !confirmPassword) {
      Toast.show({ type: 'error', text1: 'Missing fields', text2: 'Please fill in all fields.' });
      return;
    }
    
    if (password !== confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' });
      return;
    }

    if (password.length < 6) {
      Toast.show({ type: 'error', text1: 'Password too short', text2: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    setLoading(false);

    if (error) {
      Toast.show({ type: 'error', text1: 'Update failed', text2: error.message });
    } else {
      Toast.show({ type: 'success', text1: 'Password Updated', text2: 'Your password has been successfully changed.' });
      router.back();
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 40 }}>
      <View className="flex-row items-center justify-between mb-8">
        <Text className="text-2xl font-bold tracking-tight" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>
          Change Password
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <Text className="text-sm mb-6 leading-relaxed" style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular' }}>
        Enter your new password below. You will use this new password the next time you sign in.
      </Text>

      <View className="mb-4">
        <Text className="text-xs uppercase tracking-widest mb-2 ml-1" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>New Password</Text>
        <TextInput
          className="w-full h-14 rounded-2xl px-5 border"
          style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text, fontFamily: 'Inter_500Medium' }}
          placeholder="Enter new password"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <View className="mb-8">
        <Text className="text-xs uppercase tracking-widest mb-2 ml-1" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Confirm Password</Text>
        <TextInput
          className="w-full h-14 rounded-2xl px-5 border"
          style={{ backgroundColor: colors.card, borderColor: colors.border, color: colors.text, fontFamily: 'Inter_500Medium' }}
          placeholder="Confirm new password"
          placeholderTextColor={colors.textMuted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity 
        className="w-full h-14 rounded-full items-center justify-center shadow-sm"
        style={{ backgroundColor: colors.primary }}
        onPress={handleUpdate}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <Text className="text-white text-base font-semibold tracking-wide" style={{ fontFamily: 'Inter_600SemiBold' }}>
            Update Password
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
