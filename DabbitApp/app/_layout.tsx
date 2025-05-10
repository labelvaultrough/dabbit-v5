import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { ThemeProvider } from '@/context/ThemeContext';
import { HabitProvider } from '@/context/HabitContext';
import { TimeBlockProvider } from '@/context/TimeBlockContext';
import { NotificationProvider } from '@/context/NotificationContext';
import * as Notifications from 'expo-notifications';

// Configure notification handler for the entire app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...Feather.font,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <HabitProvider>
          <TimeBlockProvider>
            <NotificationProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="event-details/[id]" options={{ headerShown: false }} />
                <Stack.Screen name="manage-habits" options={{ title: 'Manage Habits' }} />
                <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
              </Stack>
              <StatusBar style="auto" />
            </NotificationProvider>
          </TimeBlockProvider>
        </HabitProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
