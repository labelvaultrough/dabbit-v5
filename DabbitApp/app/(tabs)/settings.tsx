import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert, SafeAreaView, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { useNotificationContext } from '@/context/NotificationContext';
import { Header } from '@/components/Header';
import { SettingsItem } from '@/components/SettingsItem';
import { metrics } from '@/constants/metrics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { TimeBlockModal } from '@/components/TimeBlockModal';
import * as Notifications from 'expo-notifications';
import { requestNotificationPermissions } from '@/utils/notificationUtils';
import { ProfileCard } from '@/components/ProfileCard';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { globalSettings, setGlobalRemindersEnabled, username, habits } = useHabits();
  const { checkForDueNotifications } = useNotificationContext();
  const router = useRouter();
  
  // State for modals
  const [showTimeBlockModal, setShowTimeBlockModal] = useState(false);
  
  // Get active habits count and current streak
  const activeHabitsCount = habits.filter(habit => !habit.archived).length;
  const currentStreak = 7; // Placeholder, would be calculated in a real app
  
  // Request notification permissions when toggling notifications on
  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      const permissionGranted = await requestNotificationPermissions();
      if (!permissionGranted) {
        Alert.alert(
          'Permission Required',
          'You need to enable notifications in your device settings to receive habit reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      // If enabling notifications, check if any habits need notifications now
      await setGlobalRemindersEnabled(value);
      await checkForDueNotifications();
    } else {
      // Just disable notifications
      await setGlobalRemindersEnabled(value);
    }
  };

  const navigateToTimeBlocks = () => {
    try {
      // We need to use this approach because of Expo Router's typing issues
      // @ts-ignore
      router.push("/time-blocks");
    } catch (error) {
      console.error("Navigation error:", error);
      Alert.alert('Navigation Error', 'Could not navigate to Time Block Customization.');
    }
  };
  
  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your habits and progress. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              await AsyncStorage.removeItem('@app_first_launch');
              Alert.alert(
                'Success', 
                'All data has been cleared. The app will now restart.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      if (Platform.OS === 'web') {
                        window.location.reload();
                      } else {
                        Alert.alert('Please close and reopen the app to see changes.');
                      }
                    }
                  }
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Settings" />
      
      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <ProfileCard 
          name={username}
          streak={currentStreak}
          habitCount={activeHabitsCount}
        />
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            APPEARANCE
          </Text>
          
          <SettingsItem
            title="Dark Mode"
            subtitle="Toggle between light and dark theme"
            icon="moon"
            iconColor={colors.primary}
            showSwitch
            switchValue={isDark}
            onSwitchChange={toggleTheme}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            PREFERENCES
          </Text>
          
          <SettingsItem
            title="Time Block Customization"
            subtitle="Personalize your daily time blocks"
            icon="clock"
            iconColor={colors.primary}
            onPress={() => setShowTimeBlockModal(true)}
          />
          
          <SettingsItem
            title="Enable Reminders"
            subtitle="Get reminders for your habits"
            icon="bell"
            iconColor={colors.warning}
            showSwitch
            switchValue={globalSettings.remindersEnabled}
            onSwitchChange={handleNotificationsToggle}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            HABITS
          </Text>
          
          <SettingsItem
            title="Manage Habits"
            subtitle="Edit or delete your habits"
            icon="list"
            iconColor={colors.primary}
            onPress={() => {
              try {
                // @ts-ignore
                router.push("/manage-habits");
              } catch (error) {
                console.error("Navigation error:", error);
                Alert.alert('Navigation Error', 'Could not navigate to Manage Habits.');
              }
            }}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            DATA
          </Text>
          
          <SettingsItem
            title="Clear All Data"
            subtitle="Delete all habits and progress"
            icon="trash-2"
            iconColor={colors.error}
            onPress={handleClearData}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ACCOUNT
          </Text>
          
          <SettingsItem
            title="Logout"
            subtitle="Sign out of your account"
            icon="log-out"
            iconColor={colors.error}
            onPress={() => Alert.alert('Coming Soon', 'Authentication system will be implemented in a future update.')}
          />
        </View>
        
        {/* Time Block Modal */}
        <TimeBlockModal
          visible={showTimeBlockModal}
          onClose={() => setShowTimeBlockModal(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: metrics.spacing.m,
  },
  section: {
    marginBottom: metrics.spacing.xl,
  },
  sectionTitle: {
    fontSize: metrics.fontSize.xs,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: metrics.spacing.s,
  },
}); 