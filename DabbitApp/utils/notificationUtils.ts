import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Storage key for notification records
export const NOTIFICATION_RECORDS_KEY = 'notification_records';

// Interface for notification record
export interface NotificationRecord {
  habitId: string;
  date: string; // ISO format: YYYY-MM-DD
  notified: boolean;
}

// Category to emoji mapping
export const CATEGORY_EMOJIS: Record<string, string> = {
  'green': '🍎', // Health
  'orange': '💪', // Fitness
  'teal': '🥗', // Nutrition
  'cyan': '💼', // Work
  'blue': '⏱️', // Productivity
  'purple': '🧠', // Learning
  'lime': '🌱', // Personal
  'pink': '👥', // Social
  'indigo': '🧘', // Mindfulness
  'amber': '🎨', // Creativity
  'emerald': '💰', // Finance
  'violet': '😴', // Sleep
  'default': '⭐' // Default
};

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('habit-reminders', {
        name: 'Habit Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      return finalStatus === 'granted';
    }
    
    return false;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Get notification records from AsyncStorage
export const getNotificationRecords = async (): Promise<NotificationRecord[]> => {
  try {
    const records = await AsyncStorage.getItem(NOTIFICATION_RECORDS_KEY);
    const parsedRecords = records ? JSON.parse(records) : [];
    console.log(`📋 Retrieved ${parsedRecords.length} notification records`);
    return parsedRecords;
  } catch (error) {
    console.error('Error retrieving notification records:', error);
    return [];
  }
};

// Save notification records to AsyncStorage
export const saveNotificationRecords = async (records: NotificationRecord[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(NOTIFICATION_RECORDS_KEY, JSON.stringify(records));
    console.log(`💾 Saved ${records.length} notification records`);
  } catch (error) {
    console.error('Error saving notification records:', error);
  }
};

// Get the emoji for a category
const getCategoryEmoji = (categoryColor: string): string => {
  return CATEGORY_EMOJIS[categoryColor] || CATEGORY_EMOJIS.default;
};

// Send a notification for a habit
export const sendHabitNotification = async (
  habitId: string,
  habitName: string,
  categoryColor: string = 'default'
): Promise<string | null> => {
  try {
    console.log(`📩 Preparing notification for habit: ${habitName} (${habitId})`);
    
    // Get the emoji for this category
    const emoji = getCategoryEmoji(categoryColor);
    
    // Format the message
    const message = `${emoji} Time for your Habit - ${habitName}`;
    console.log(`📝 Notification message: "${message}"`);
    
    // Configure notification content
    const notificationContent: any = {
      title: 'Habit Reminder',
      body: message,
      data: { habitId },
    };
    
    // Send the notification
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null, // Send immediately
    });
    
    console.log(`✅ Notification scheduled with ID: ${notificationId}`);

    // Current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Update notification record
    const records = await getNotificationRecords();
    const existingRecordIndex = records.findIndex(
      record => record.habitId === habitId && record.date === today
    );

    if (existingRecordIndex !== -1) {
      // Update existing record
      console.log(`📝 Updating existing notification record for habit ${habitId}`);
      records[existingRecordIndex].notified = true;
    } else {
      // Create new record
      console.log(`📝 Creating new notification record for habit ${habitId}`);
      records.push({
        habitId,
        date: today,
        notified: true,
      });
    }

    await saveNotificationRecords(records);
    return notificationId;
  } catch (error) {
    console.error('❌ Error sending habit notification:', error);
    return null;
  }
};

// Clean up old notification records (keep records only for a week)
export const cleanupOldNotificationRecords = async (): Promise<void> => {
  try {
    const records = await getNotificationRecords();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0];

    const filteredRecords = records.filter(record => record.date >= oneWeekAgoStr);
    
    if (filteredRecords.length !== records.length) {
      await saveNotificationRecords(filteredRecords);
    }
  } catch (error) {
    console.error('Error cleaning up old notification records:', error);
  }
};

// Reset notification records for a specific habit on a specific day
export const resetHabitNotificationRecord = async (habitId: string, date: string): Promise<void> => {
  try {
    const records = await getNotificationRecords();
    const existingRecordIndex = records.findIndex(
      record => record.habitId === habitId && record.date === date
    );

    if (existingRecordIndex !== -1) {
      // Remove the record to reset notification eligibility
      records.splice(existingRecordIndex, 1);
      await saveNotificationRecords(records);
      console.log(`🔄 Reset notification record for habit ${habitId} on ${date}`);
    } else {
      console.log(`ℹ️ No notification record found to reset for habit ${habitId} on ${date}`);
    }
  } catch (error) {
    console.error('Error resetting habit notification record:', error);
  }
};

// Check if a notification has already been sent for a specific habit on a specific day
export const hasNotificationBeenSent = async (habitId: string, date: string): Promise<boolean> => {
  try {
    const records = await getNotificationRecords();
    const record = records.find(r => r.habitId === habitId && r.date === date);
    const result = record ? record.notified : false;
    console.log(`🔍 Checking if notification sent for habit ${habitId} on ${date}: ${result}`);
    return result;
  } catch (error) {
    console.error('Error checking if notification has been sent:', error);
    return false;
  }
}; 