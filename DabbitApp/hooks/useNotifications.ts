import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useHabits } from '@/context/HabitContext';
import { format } from 'date-fns';
import {
  requestNotificationPermissions,
  sendHabitNotification,
  hasNotificationBeenSent,
  cleanupOldNotificationRecords,
  resetHabitNotificationRecord
} from '@/utils/notificationUtils';

export function useNotifications() {
  const { habits, globalSettings, getHabitCompletionStatus, categories } = useHabits();
  const appState = useRef(AppState.currentState);
  const notificationCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Function to check which habits need notifications
  const checkHabitsForNotifications = async () => {
    console.log("🔍 Checking for habits that need notifications...");
    
    // Skip if global reminders are disabled
    if (!globalSettings.remindersEnabled) {
      console.log("⚠️ Global reminders are disabled. Skipping notification check.");
      return;
    }

    // Request permissions if needed
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.log("⚠️ Notification permissions not granted. Skipping notification check.");
      return;
    }

    // Get the current date and time
    const now = new Date();
    const currentTime = format(now, 'HH:mm');
    const today = format(now, 'yyyy-MM-dd');
    console.log(`📅 Current date: ${today}, Current time: ${currentTime}`);

    // Clean up old notification records
    await cleanupOldNotificationRecords();

    console.log(`📋 Found ${habits.length} habits to check for notifications`);
    
    // Check each habit
    for (const habit of habits) {
      console.log(`\n🧩 Checking habit: ${habit.name}`);
      
      // Skip if habit has no time, is archived, or reminders are disabled for this habit
      if (!habit.time) {
        console.log(`  ⏭️ Skipping: No time set for habit`);
        continue;
      }
      
      if (habit.archived) {
        console.log(`  ⏭️ Skipping: Habit is archived`);
        continue;
      }
      
      if (habit.reminderEnabled === false) {
        console.log(`  ⏭️ Skipping: Reminders are disabled for this habit`);
        continue;
      }

      // Skip if the habit is already completed for today
      const isCompleted = getHabitCompletionStatus(habit.id, today);
      if (isCompleted) {
        console.log(`  ⏭️ Skipping: Habit is already completed for today`);
        continue;
      }

      // Skip if the habit's time hasn't passed yet
      if (habit.time > currentTime) {
        console.log(`  ⏭️ Skipping: Habit time (${habit.time}) hasn't passed current time (${currentTime})`);
        continue;
      }

      // Skip if a notification has already been sent today
      const alreadyNotified = await hasNotificationBeenSent(habit.id, today);
      if (alreadyNotified) {
        console.log(`  ⏭️ Skipping: Notification already sent for today`);
        continue;
      }

      // Find the category color for this habit
      const category = categories.find(cat => cat.id === habit.category);
      const categoryColor = category ? category.color : 'default';
      console.log(`  ✅ All conditions met. Sending notification for ${habit.name}`);

      // Send a notification with category-specific fun message
      try {
        await sendHabitNotification(habit.id, habit.name, categoryColor);
        console.log(`  ✉️ Notification sent successfully!`);
      } catch (error) {
        console.error(`  ❌ Error sending notification:`, error);
      }
    }
    
    console.log("\n✅ Finished checking for notifications");
  };

  // Set up the interval for periodic checking
  useEffect(() => {
    console.log("⏰ Setting up notification check interval");
    
    // Check immediately on mount
    checkHabitsForNotifications();

    // Set up interval for checking (every 5 minutes)
    const intervalTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    notificationCheckIntervalRef.current = setInterval(checkHabitsForNotifications, intervalTime);

    return () => {
      // Clean up interval on unmount
      if (notificationCheckIntervalRef.current) {
        clearInterval(notificationCheckIntervalRef.current);
        console.log("🧹 Notification check interval cleared");
      }
    };
  }, [habits, globalSettings.remindersEnabled]);

  // Handle app state changes (background/foreground)
  useEffect(() => {
    console.log("📱 Setting up app state change listener");
    
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      console.log(`🔄 App state changed from ${appState.current} to ${nextAppState}`);
      
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log("📲 App came to foreground - checking for notifications");
        checkHabitsForNotifications();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
      console.log("🧹 App state change listener removed");
    };
  }, [habits, globalSettings.remindersEnabled]);

  // Listen for when a user completes a habit
  useEffect(() => {
    console.log("🎯 Setting up notification response listener");
    
    // Set up a listener for notification responses
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      // Extract habitId from the notification data
      const habitId = response.notification.request.content.data?.habitId;
      if (habitId) {
        console.log(`👆 User tapped on notification for habit ID: ${habitId}`);
        // Do something when user interacts with the notification
        // For example, navigate to the specific habit
      }
    });

    return () => {
      subscription.remove();
      console.log("🧹 Notification response listener removed");
    };
  }, []);

  // Reset notification records when a habit is completed
  const resetNotificationOnCompletion = async (habitId: string) => {
    console.log(`🔄 Resetting notification record for habit ID: ${habitId}`);
    const today = format(new Date(), 'yyyy-MM-dd');
    await resetHabitNotificationRecord(habitId, today);
  };

  return {
    checkHabitsForNotifications,
    resetNotificationOnCompletion
  };
} 