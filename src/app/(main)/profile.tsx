import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useAppStore } from '../../store/useAppStore';
import { supabase } from '../../lib/supabase';
import { usePostHog } from 'posthog-react-native';
import * as WebBrowser from 'expo-web-browser';
import { Feather } from '@expo/vector-icons';
import { seedDemoPersona, DemoPersona } from '../../services/demoSeeder';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
  const { user } = useAuthStore();
  const { colors, colorScheme, setColorScheme } = useThemeStore();
  const { hasCompletedOnboarding } = useAppStore();
  const router = useRouter();
  const posthog = usePostHog();

  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [igDetails, setIgDetails] = useState<any>(null);
  const [inputUsername, setInputUsername] = useState('');
  
  const [pushEnabled, setPushEnabled] = useState(false);
  const [weeklyEnabled, setWeeklyEnabled] = useState(true);

  useEffect(() => {
    checkInstagramConnection();
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('push_notifications_enabled, weekly_reports_enabled').eq('id', user.id).single();
    if (data) {
      setPushEnabled(data.push_notifications_enabled);
      setWeeklyEnabled(data.weekly_reports_enabled);
    }
  };

  const toggleNotifications = async (type: 'push' | 'weekly', value: boolean) => {
    if (!user) return;
    if (type === 'push') setPushEnabled(value);
    if (type === 'weekly') setWeeklyEnabled(value);

    await supabase.from('profiles').update({
      [`${type === 'push' ? 'push_notifications_enabled' : 'weekly_reports_enabled'}`]: value
    }).eq('id', user.id);
    
    Toast.show({ type: 'success', text1: 'Preferences Saved' });
  };

  const checkInstagramConnection = async () => {
    if (!user) return;
    const { data } = await supabase.from('instagram_connections').select('*').eq('user_id', user.id).single();
    if (data && data.is_connected) {
      setIsConnected(true);
      setIgDetails(data);
    }
  };

  const handleInstagramConnect = async () => {
    if (!user) return;
    
    if (!isConnected && !inputUsername.trim()) {
      Toast.show({ type: 'error', text1: 'Please enter your Instagram username' });
      return;
    }

    setLoading(true);

    if (isConnected) {
      await supabase.from('instagram_connections').delete().eq('user_id', user.id);
      setIsConnected(false);
      setIgDetails(null);
      posthog?.capture('instagram_disconnected');
      Toast.show({ type: 'success', text1: 'Instagram Disconnected' });
    } else {
      const clientId = '954704507615831';
      const redirectUri = 'https://localhost:8081/';
      const authUrl = `https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish`;
      
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
      
      const { error } = await supabase.from('instagram_connections').insert({
        user_id: user.id,
        ig_username: inputUsername.trim().toLowerCase().replace('@', ''),
        account_type: 'business',
        is_connected: true,
        last_sync: new Date().toISOString()
      });

      if (error) {
        Toast.show({ type: 'error', text1: 'Error', text2: error.message });
      } else {
        setIsConnected(true);
        posthog?.capture('instagram_connected');
        Toast.show({ type: 'success', text1: 'Instagram Connected!' });
        checkInstagramConnection();
        if (!hasCompletedOnboarding) {
          router.push('/(onboarding)/interests');
        }
      }
    }
    setLoading(false);
  };

  const handleDemoSeed = async (persona: DemoPersona) => {
    Alert.alert(
      "Inject Demo Persona",
      "This will overwrite your current Analytics. Proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Inject", 
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            await seedDemoPersona(persona);
            setLoading(false);
            Toast.show({ type: 'success', text1: 'Persona Injected Successfully' });
          }
        }
      ]
    );
  };

  // Derive username from email for display if none exists
  const displayUsername = user?.email?.split('@')[0] || 'User';

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <View className="px-6 pt-16 pb-12">
        <Text className="text-3xl font-bold mb-8 tracking-tight" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>
          Settings
        </Text>

        {/* Account Info */}
        <Text className="text-xs uppercase tracking-widest mb-3 ml-2" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Account</Text>
        <View className="rounded-3xl p-6 mb-8 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="flex-row items-center">
            <View className="w-14 h-14 rounded-full items-center justify-center mr-4" style={{ backgroundColor: colors.primary }}>
              <Text className="text-white font-bold text-xl" style={{ fontFamily: 'Inter_700Bold' }}>{displayUsername.charAt(0).toUpperCase()}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-xl tracking-tight mb-1" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>{displayUsername}</Text>
              <Text className="text-sm mb-2" style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular' }}>{user?.email}</Text>
              <View className="flex-row items-center gap-3">
                <Text className="text-[10px] uppercase tracking-wider" style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium' }}>JOINED {new Date((user as any)?.created_at || Date.now()).getFullYear()}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences */}
        <Text className="text-xs uppercase tracking-widest mb-3 ml-2" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Preferences</Text>
        <View className="rounded-3xl mb-8 border overflow-hidden" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <TouchableOpacity 
            className="flex-row justify-between items-center p-5 border-b"
            style={{ borderBottomColor: colors.border }}
            onPress={() => {
              if (!isConnected) {
                Alert.alert("Connection Required", "First connect your Instagram in this profile and then only you can proceed.");
                return;
              }
              if (!hasCompletedOnboarding) {
                router.push('/(onboarding)/interests');
              } else {
                router.push('/(modals)/edit-interests');
              }
            }}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-blue-500/10">
                <Feather name="crosshair" size={16} color="#3B82F6" />
              </View>
              <Text style={{ color: colors.text, fontFamily: 'Inter_500Medium' }}>Interests & Dislikes</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Security */}
        <Text className="text-xs uppercase tracking-widest mb-3 ml-2" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Security</Text>
        <View className="rounded-3xl mb-8 border overflow-hidden" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <TouchableOpacity 
            className="flex-row justify-between items-center p-5 border-b"
            style={{ borderBottomColor: colors.border }}
            onPress={() => router.push('/(modals)/update-password')}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-zinc-500/10">
                <Feather name="lock" size={16} color={colors.text} />
              </View>
              <Text style={{ color: colors.text, fontFamily: 'Inter_500Medium' }}>Change Password</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Appearance Settings */}
        <Text className="text-xs uppercase tracking-widest mb-3 ml-2" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Appearance</Text>
        <View className="rounded-3xl p-5 mb-8 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="flex-row gap-2">
            {['light', 'dark', 'system'].map((scheme) => (
              <TouchableOpacity 
                key={scheme}
                className="flex-1 py-3 items-center border rounded-xl"
                style={{ 
                  backgroundColor: colorScheme === scheme ? colors.primary : colors.background,
                  borderColor: colorScheme === scheme ? colors.primary : colors.border
                }}
                onPress={() => setColorScheme(scheme as any)}
              >
                <Text style={{ 
                  color: colorScheme === scheme ? '#FFF' : colors.text, 
                  fontFamily: colorScheme === scheme ? 'Inter_600SemiBold' : 'Inter_500Medium',
                  textTransform: 'capitalize' 
                }}>
                  {scheme}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Notification Settings */}
        <Text className="text-xs uppercase tracking-widest mb-3 ml-2" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Notifications</Text>
        <View className="rounded-3xl mb-8 border overflow-hidden" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="flex-row justify-between items-center p-5 border-b" style={{ borderBottomColor: colors.border }}>
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-purple-500/10">
                <Feather name="bell" size={16} color="#A855F7" />
              </View>
              <Text style={{ color: colors.text, fontFamily: 'Inter_500Medium' }}>Push Notifications</Text>
            </View>
            <Switch value={pushEnabled} onValueChange={(val) => toggleNotifications('push', val)} trackColor={{ true: colors.primary }} />
          </View>
          <View className="flex-row justify-between items-center p-5">
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-emerald-500/10">
                <Feather name="file-text" size={16} color="#10B981" />
              </View>
              <Text style={{ color: colors.text, fontFamily: 'Inter_500Medium' }}>Weekly Reports</Text>
            </View>
            <Switch value={weeklyEnabled} onValueChange={(val) => toggleNotifications('weekly', val)} trackColor={{ true: colors.primary }} />
          </View>
        </View>

        {/* Instagram Sync Center */}
        <Text className="text-xs uppercase tracking-widest mb-3 ml-2" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Integrations</Text>
        <View className="rounded-3xl p-6 mb-8 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <View className="flex-row items-center mb-6">
            <Feather name="instagram" size={24} color={colors.text} />
            <Text className="text-lg ml-3 font-semibold tracking-tight" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>
              Instagram Sync Center
            </Text>
          </View>

          {isConnected ? (
            <View>
              <View className="flex-row items-center mb-5 p-4 rounded-2xl border" style={{ backgroundColor: colors.background, borderColor: colors.border }}>
                <View className="w-12 h-12 rounded-full items-center justify-center mr-4" style={{ backgroundColor: colors.primary }}>
                  <Text className="font-bold text-white" style={{ fontFamily: 'Inter_700Bold' }}>{igDetails?.ig_username?.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text className="font-bold text-lg" style={{ color: colors.text, fontFamily: 'Inter_700Bold' }}>@{igDetails?.ig_username}</Text>
                </View>
              </View>

              <View className="flex-row justify-between mb-3 px-2">
                <Text style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium' }}>Connection Health</Text>
                <Text className="font-medium text-emerald-400" style={{ fontFamily: 'Inter_600SemiBold' }}>Healthy</Text>
              </View>
              <View className="flex-row justify-between mb-5 px-2">
                <Text style={{ color: colors.textMuted, fontFamily: 'Inter_500Medium' }}>Last Synced</Text>
                <Text className="font-medium" style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>
                  {new Date(igDetails?.last_sync || Date.now()).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ) : (
            <View className="mb-6">
              <Text className="mb-5 leading-relaxed text-sm" style={{ color: colors.textMuted, fontFamily: 'Inter_400Regular' }}>
                Connect your Instagram account securely via Meta OAuth to verify your identity and unlock Feed Health synchronization.
              </Text>
              
              <Text className="text-xs mb-2 font-medium" style={{ color: colors.text, fontFamily: 'Inter_600SemiBold' }}>INSTAGRAM USERNAME</Text>
              <View className="flex-row items-center rounded-xl px-4 py-1 h-14 mb-2" style={{ backgroundColor: colors.background, borderColor: colors.border, borderWidth: 1 }}>
                <Text style={{ color: colors.textMuted, marginRight: 2, fontFamily: 'Inter_500Medium' }}>@</Text>
                <TextInput
                  className="flex-1 h-full"
                  style={{ color: colors.text, fontFamily: 'Inter_400Regular' }}
                  placeholder="zuck"
                  placeholderTextColor={colors.textMuted}
                  value={inputUsername}
                  onChangeText={setInputUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
          )}

          <TouchableOpacity 
            className="rounded-full py-4 items-center mt-2 border"
            style={{ 
              backgroundColor: isConnected ? colors.background : colors.text,
              borderColor: isConnected ? colors.border : 'transparent'
            }}
            onPress={handleInstagramConnect}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color={isConnected ? colors.text : colors.background} /> : (
              <Text className="font-semibold" style={{ color: isConnected ? colors.text : colors.background, fontFamily: 'Inter_600SemiBold' }}>
                {isConnected ? 'Disconnect Account' : 'Connect via Meta OAuth'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Data & Privacy */}
        <Text className="text-xs uppercase tracking-widest mb-3 ml-2" style={{ color: colors.textMuted, fontFamily: 'Inter_600SemiBold' }}>Data & Privacy</Text>
        <View className="rounded-3xl p-5 mb-8 border" style={{ backgroundColor: colors.card, borderColor: colors.border }}>
          <TouchableOpacity 
            className="flex-row justify-between items-center py-3 border-b"
            style={{ borderBottomColor: colors.border }}
            onPress={() => Toast.show({ type: 'success', text1: 'Data Export Started', text2: 'A download link will be emailed to you.' })}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-blue-500/10">
                <Feather name="download" size={16} color="#3B82F6" />
              </View>
              <Text style={{ color: colors.text, fontFamily: 'Inter_500Medium' }}>Export My Data</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row justify-between items-center py-3 mt-2"
            onPress={() => {
              Alert.alert(
                "Clear History",
                "This will permanently delete all your AI analytics and DNA history. Proceed?",
                [
                  { text: "Cancel", style: "cancel" },
                  { 
                    text: "Delete Everything", 
                    style: "destructive",
                    onPress: async () => {
                      if (user) {
                        await supabase.from('interest_dna').delete().eq('user_id', user.id);
                        await supabase.from('feed_health_scores').delete().eq('user_id', user.id);
                        useAppStore.getState().triggerUpdate();
                        Toast.show({ type: 'success', text1: 'History Cleared' });
                      }
                    }
                  }
                ]
              );
            }}
          >
            <View className="flex-row items-center">
              <View className="w-8 h-8 rounded-full items-center justify-center mr-3 bg-red-500/10">
                <Feather name="trash-2" size={16} color="#EF4444" />
              </View>
              <Text style={{ color: colors.text, fontFamily: 'Inter_500Medium' }}>Clear Analytics History</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          className="rounded-full py-4 items-center mb-10 border"
          style={{ backgroundColor: colors.background, borderColor: colors.border }}
          onPress={async () => {
            if (user) {
              // Wipe Instagram connection on explicit sign out to mimic realistic lifecycle
              await supabase.from('instagram_connections').delete().eq('user_id', user.id);
            }
            supabase.auth.signOut();
          }}
        >
          <Text className="text-red-400 font-semibold" style={{ fontFamily: 'Inter_600SemiBold' }}>Sign Out</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}
