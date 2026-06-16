import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Check your email to confirm your account!');
    }
    setLoading(false);
  };

  return (
    <View className="flex-1 justify-center items-center bg-zinc-950 px-6">
      <View className="w-full max-w-sm">
        <Text className="text-4xl font-bold text-white mb-2 tracking-tight">Create Account</Text>
        <Text className="text-zinc-400 mb-8 text-base">Take control of what Instagram learns about you.</Text>

        <View className="space-y-4">
          <View>
            <Text className="text-zinc-400 mb-1 ml-1 text-sm">Email</Text>
            <TextInput
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white"
              placeholder="name@example.com"
              placeholderTextColor="#52525b"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View>
            <Text className="text-zinc-400 mb-1 ml-1 text-sm mt-4">Password</Text>
            <TextInput
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-white"
              placeholder="Create a strong password"
              placeholderTextColor="#52525b"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            className="w-full bg-blue-600 rounded-xl py-4 mt-8 flex-row justify-center items-center"
            onPress={handleSignup}
            disabled={loading}
          >
            <Text className="text-white font-semibold text-lg">{loading ? 'Creating...' : 'Sign Up'}</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-8 flex-row justify-center">
          <Text className="text-zinc-400">Already have an account? </Text>
          <Link href="/(auth)/login">
            <Text className="text-blue-500 font-semibold">Sign in</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
