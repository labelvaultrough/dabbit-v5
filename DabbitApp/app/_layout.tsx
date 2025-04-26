import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    'SpaceMono': require('../assets/fonts/SpaceMono-Regular.ttf'),
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
