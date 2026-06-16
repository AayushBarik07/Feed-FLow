import { Alert } from 'react-native';

// MOCK NOTIFICATIONS SERVICE for Expo Go Hackathon Demo
// (Expo Go SDK 53+ removed native push notification support, so we mock it for the demo)

export async function registerForPushNotificationsAsync() {
  // Mock permission granted
  return 'mock-push-token-123';
}

export async function scheduleDailyReminder() {
  // Mock scheduling
  console.log('Daily reminder scheduled for 9:00 AM');
}

// For Hackathon Demo: Trigger instantly via Alert instead of Native Push
export async function sendTestNotification() {
  setTimeout(() => {
    Alert.alert(
      'FeedFlow Active 🧬',
      'Notifications are working perfectly. Your AI algorithm coach is ready.'
    );
  }, 2000);
}
