import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { supabase } from '../../lib/supabase';
import { Feather } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Toast.show({ type: 'error', text1: 'Missing Fields', text2: 'Please enter both email and password.' });
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        // Sign Up
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
        });
        
        if (error) {
          if (error.message.includes('already registered')) {
            throw new Error('User already exists. Please switch to Sign In.');
          }
          throw error;
        }
        
        if (!data.session) {
          Toast.show({ type: 'info', text1: 'Verify Email', text2: 'Check your inbox for a confirmation link.' });
        } else {
          Toast.show({ type: 'success', text1: 'Account Created', text2: 'Welcome to FeedFlow!' });
        }
      } else {
        // Log In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('User does not exist or incorrect password.');
          }
          throw error;
        }
        
        Toast.show({ type: 'success', text1: 'Welcome Back' });
      }
    } catch (error: any) {
      Toast.show({ type: 'error', text1: 'Authentication Failed', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: '#09090b' }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}>
        
        <View className="mb-12">
          <View className="w-12 h-12 rounded-xl mb-6 items-center justify-center bg-zinc-900 border border-zinc-800">
            <Feather name="layers" size={24} color="#3b82f6" />
          </View>
          <Text className="text-white text-3xl tracking-tighter" style={{ fontFamily: 'Inter_900Black' }}>
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </Text>
          <Text className="text-zinc-400 text-base mt-2 leading-relaxed" style={{ fontFamily: 'Inter_400Regular' }}>
            {isSignUp ? 'Start training your social media algorithms today.' : 'Sign in to access your behavioral intelligence dashboard.'}
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-xs uppercase tracking-widest text-zinc-500 mb-2" style={{ fontFamily: 'Inter_600SemiBold' }}>Email Address</Text>
          <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-1 h-14">
            <Feather name="mail" size={20} color="#71717a" className="mr-3" />
            <TextInput
              className="flex-1 text-white ml-2"
              style={{ fontFamily: 'Inter_400Regular' }}
              placeholder="you@startup.com"
              placeholderTextColor="#71717a"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-xs uppercase tracking-widest text-zinc-500 mb-2" style={{ fontFamily: 'Inter_600SemiBold' }}>Password</Text>
          <View className="flex-row items-center bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-1 h-14">
            <Feather name="lock" size={20} color="#71717a" className="mr-3" />
            <TextInput
              className="flex-1 text-white ml-2"
              style={{ fontFamily: 'Inter_400Regular' }}
              placeholder="••••••••"
              placeholderTextColor="#71717a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity 
          className="w-full bg-white rounded-full py-4 flex-row justify-center items-center shadow-lg shadow-white/10 mb-6"
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Text className="text-black font-semibold text-base" style={{ fontFamily: 'Inter_600SemiBold' }}>
                {isSignUp ? 'Sign Up' : 'Sign In'}
              </Text>
              <Feather name="arrow-right" size={20} color="#000" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center mt-4">
          <Text className="text-zinc-500" style={{ fontFamily: 'Inter_400Regular' }}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </Text>
          <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
            <Text className="text-blue-500 font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}
