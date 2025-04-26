import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useHabits } from '@/context/HabitContext';
import { format } from 'date-fns';
import { resetHabitNotificationRecord } from '@/utils/notificationUtils';

// Define the context type
type NotificationContextType = {
  checkForDueNotifications: () => Promise<void>;
};

// Create the context with a default value
const NotificationContext = createContext<NotificationContextType>({
  checkForDueNotifications: async () => {},
});

// Custom hook to use the notification context
export const useNotificationContext = () => useContext(NotificationContext);

// Provider component
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { habits, toggleHabitCompletion, getHabitCompletionStatus } = useHabits();
  const { checkHabitsForNotifications, resetNotificationOnCompletion } = useNotifications();

  // Monitor habit completion status changes
  useEffect(() => {
    const handleHabitCompletionChange = async () => {
      // For each habit, check if it was just completed and reset notification record
      const today = format(new Date(), 'yyyy-MM-dd');
      
      for (const habit of habits) {
        if (getHabitCompletionStatus(habit.id, today)) {
          await resetNotificationOnCompletion(habit.id);
        }
      }
    };

    handleHabitCompletionChange();
  }, [habits]);

  // The context value
  const value: NotificationContextType = {
    checkForDueNotifications: checkHabitsForNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}; 