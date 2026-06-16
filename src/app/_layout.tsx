import { useEffect } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../store/useAuthStore';
import { useAppStore } from '../store/useAppStore';
import { supabase } from '../lib/supabase';
import { PostHogProvider } from 'posthog-react-native';
import '../global.css';

function AuthRouteGuard() {
  const { isAuthenticated } = useAuthStore();
  const { hasCompletedOnboarding } = useAppStore();
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    
    if (!isAuthenticated && !inAuthGroup && !inOnboardingGroup) {
      // If completely unauthenticated, default to the welcome screen
      router.replace('/(onboarding)/welcome');
    } else if (isAuthenticated) {
      const isProfile = segments[1] === 'profile';
      const isEditInterests = segments[1] === 'edit-interests';

      if (!hasCompletedOnboarding && !inOnboardingGroup && !isProfile && !isEditInterests) {
        // Authenticated but hasn't completed onboarding. Route to profile so they can connect IG.
        router.replace('/(main)/profile');
      } else if (hasCompletedOnboarding && (inAuthGroup || segments[1] === 'welcome' || segments[1] === 'interests')) {
        router.replace('/(main)');
      }
    }
  }, [isAuthenticated, hasCompletedOnboarding, segments, navigationState?.key]);

  return null;
}

import Toast from 'react-native-toast-message';

export default function RootLayout() {
  const { setUser, setLoading } = useAuthStore();
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser((session?.user as any) ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser((session?.user as any) ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!fontsLoaded) return null;

  return (
    <PostHogProvider 
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_KEY || 'dummy_key'} 
      options={{
        host: 'https://app.posthog.com',
      }}
    >
      <AuthRouteGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(modals)/edit-interests" options={{ presentation: 'modal' }} />
      </Stack>
      <Toast />
    </PostHogProvider>
  );
}
