import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isToday, parseISO, subDays } from 'date-fns';
import { Habit, HabitEntry, Category, GlobalSettings } from '@/types/habit';

// Define types for our context
type HabitContextType = {
  habits: Habit[];
  categories: Category[];
  username: string;
  globalSettings: GlobalSettings;
  setUsername: (name: string) => Promise<void>;
  setGlobalRemindersEnabled: (enabled: boolean) => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<void>;
  getHabitCompletionStatus: (habitId: string, date: string) => boolean;
  getHabitStreak: (habitId: string) => number;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  updateCategory: (category: Category) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  getDailyProgress: () => number;
  getCompletionRate: (habitId: string) => number;
};

// Storage keys
const HABITS_STORAGE_KEY = '@dabbit_habits';
const HABIT_ENTRIES_STORAGE_KEY = '@dabbit_habit_entries';
const CATEGORIES_STORAGE_KEY = '@dabbit_categories';
const USERNAME_STORAGE_KEY = '@dabbit_username';
const SETTINGS_STORAGE_KEY = '@dabbit_settings';

// Helper function to generate a simple ID without using UUID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

// Sample data for demonstration purposes
const SAMPLE_CATEGORIES: Category[] = [
  { id: generateId(), name: 'Health', color: 'green' },
  { id: generateId(), name: 'Fitness', color: 'orange' },
  { id: generateId(), name: 'Nutrition', color: 'teal' },
  { id: generateId(), name: 'Work', color: 'cyan' },
  { id: generateId(), name: 'Productivity', color: 'blue' },
  { id: generateId(), name: 'Learning', color: 'purple' },
  { id: generateId(), name: 'Personal', color: 'lime' },
  { id: generateId(), name: 'Social', color: 'pink' },
  { id: generateId(), name: 'Mindfulness', color: 'indigo' },
  { id: generateId(), name: 'Creativity', color: 'amber' },
  { id: generateId(), name: 'Finance', color: 'emerald' },
  { id: generateId(), name: 'Sleep', color: 'violet' },
];

const SAMPLE_HABITS: Habit[] = [
  {
    id: generateId(),
    name: 'Drink Water',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[0].id, // Health
    time: '08:00', // Morning
    reminderEnabled: true,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Read',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[6].id, // Personal
    time: '21:00', // Night
    reminderEnabled: true,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Exercise',
    frequency: { type: 'custom', custom_days: [1, 3, 5] }, // Mon, Wed, Fri
    category: SAMPLE_CATEGORIES[1].id, // Fitness
    time: '17:30', // Evening
    reminderEnabled: true,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Meditate',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[8].id, // Mindfulness
    time: '07:15', // Morning
    reminderEnabled: true,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Learn a Language',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[5].id, // Learning
    time: '13:00', // Afternoon
    reminderEnabled: true,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Some sample completions for the habits
const today = new Date();
const yesterday = subDays(today, 1);
const dayBefore = subDays(today, 2);

const SAMPLE_ENTRIES: HabitEntry[] = [
  {
    id: generateId(),
    habitId: SAMPLE_HABITS[0].id, // Drink Water
    date: format(today, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: SAMPLE_HABITS[0].id, // Drink Water
    date: format(yesterday, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: SAMPLE_HABITS[0].id, // Drink Water
    date: format(dayBefore, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: SAMPLE_HABITS[1].id, // Read
    date: format(today, 'yyyy-MM-dd'),
    completed: false,
  },
  {
    id: generateId(),
    habitId: SAMPLE_HABITS[1].id, // Read
    date: format(yesterday, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: SAMPLE_HABITS[2].id, // Exercise
    date: format(today, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: SAMPLE_HABITS[3].id, // Meditate
    date: format(today, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: SAMPLE_HABITS[3].id, // Meditate
    date: format(yesterday, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: SAMPLE_HABITS[4].id, // Learn a Language
    date: format(today, 'yyyy-MM-dd'),
    completed: false,
  },
];

// Create the context
const HabitContext = createContext<HabitContextType | undefined>(undefined);

// Provider component
export function HabitProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [username, setUsernameState] = useState<string>('Abhishek');
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    remindersEnabled: true, // default to enabled
  });

  // Check if this is the first launch
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('@app_first_launch');
        if (hasLaunched === null) {
          // This is the first launch
          await AsyncStorage.setItem('@app_first_launch', 'true');
          setIsFirstLaunch(true);
        } else {
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstLaunch(false);
      }
    };

    checkFirstLaunch();
  }, []);

  // Load data from AsyncStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const habitsData = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
        const entriesData = await AsyncStorage.getItem(HABIT_ENTRIES_STORAGE_KEY);
        const categoriesData = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
        const usernameData = await AsyncStorage.getItem(USERNAME_STORAGE_KEY);
        const settingsData = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);

        // For development: force using sample data
        const useSampleData = true; // Set to true to always use sample data

        // If there's data in storage, use it
        if (habitsData && !useSampleData) {
          setHabits(JSON.parse(habitsData));
        } else if (isFirstLaunch || useSampleData) {
          // If this is the first launch and no habits data, use sample data
          setHabits(SAMPLE_HABITS);
          await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(SAMPLE_HABITS));
        }

        if (entriesData && !useSampleData) {
          setHabitEntries(JSON.parse(entriesData));
        } else if (isFirstLaunch || useSampleData) {
          setHabitEntries(SAMPLE_ENTRIES);
          await AsyncStorage.setItem(HABIT_ENTRIES_STORAGE_KEY, JSON.stringify(SAMPLE_ENTRIES));
        }

        if (categoriesData && !useSampleData) {
          setCategories(JSON.parse(categoriesData));
        } else if (isFirstLaunch || useSampleData) {
          setCategories(SAMPLE_CATEGORIES);
          await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(SAMPLE_CATEGORIES));
        }

        if (usernameData) {
          setUsernameState(usernameData);
        } else {
          // Set default username
          await AsyncStorage.setItem(USERNAME_STORAGE_KEY, username);
        }
        
        if (settingsData) {
          setGlobalSettings(JSON.parse(settingsData));
        } else {
          // Set default settings
          const defaultSettings = { remindersEnabled: true };
          await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
          setGlobalSettings(defaultSettings);
        }
      } catch (error) {
        console.error('Error loading data from AsyncStorage:', error);
      }
    };

    loadData();
  }, [isFirstLaunch]);

  // Save habits to AsyncStorage whenever they change
  useEffect(() => {
    const saveHabits = async () => {
      try {
        await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(habits));
      } catch (error) {
        console.error('Error saving habits to AsyncStorage:', error);
      }
    };

    if (habits.length > 0) {
      saveHabits();
    }
  }, [habits]);

  // Save habit entries to AsyncStorage whenever they change
  useEffect(() => {
    const saveHabitEntries = async () => {
      try {
        await AsyncStorage.setItem(HABIT_ENTRIES_STORAGE_KEY, JSON.stringify(habitEntries));
      } catch (error) {
        console.error('Error saving habit entries to AsyncStorage:', error);
      }
    };

    if (habitEntries.length > 0) {
      saveHabitEntries();
    }
  }, [habitEntries]);

  // Save categories to AsyncStorage whenever they change
  useEffect(() => {
    const saveCategories = async () => {
      try {
        await AsyncStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
      } catch (error) {
        console.error('Error saving categories to AsyncStorage:', error);
      }
    };

    if (categories.length > 0) {
      saveCategories();
    }
  }, [categories]);

  // Set username
  const setUsername = async (name: string) => {
    try {
      await AsyncStorage.setItem(USERNAME_STORAGE_KEY, name);
      setUsernameState(name);
    } catch (error) {
      console.error('Error saving username to AsyncStorage:', error);
    }
  };

  // Add a new habit
  const addHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newHabit: Habit = {
      ...habitData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    setHabits(prevHabits => [...prevHabits, newHabit]);
  };

  // Update an existing habit
  const updateHabit = async (updatedHabit: Habit) => {
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.id === updatedHabit.id
          ? { ...updatedHabit, updatedAt: new Date().toISOString() }
          : habit
      )
    );
  };

  // Delete a habit
  const deleteHabit = async (id: string) => {
    setHabits(prevHabits => prevHabits.filter(habit => habit.id !== id));
    // Also delete related entries
    setHabitEntries(prevEntries => prevEntries.filter(entry => entry.habitId !== id));
  };

  // Toggle habit completion for a specific date
  const toggleHabitCompletion = async (habitId: string, date: string) => {
    const existingEntry = habitEntries.find(
      entry => entry.habitId === habitId && entry.date === date
    );

    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const isCompleted = existingEntry ? !existingEntry.completed : true;

    if (existingEntry) {
      // Toggle the completion status of the existing entry
      setHabitEntries(prevEntries =>
        prevEntries.map(entry =>
          entry.id === existingEntry.id
            ? { ...entry, completed: !entry.completed }
            : entry
        )
      );
    } else {
      // Create a new entry
      const newEntry: HabitEntry = {
        id: generateId(),
        habitId,
        date,
        completed: true,
      };
      setHabitEntries(prevEntries => [...prevEntries, newEntry]);
    }

    // Reset notification record when habit is checked
    // This will be handled by the notification service via a custom hook
    // The actual reset logic occurs in the NotificationProvider
  };

  // Get habit completion status for a specific date
  const getHabitCompletionStatus = (habitId: string, date: string) => {
    const entry = habitEntries.find(
      entry => entry.habitId === habitId && entry.date === date
    );
    return entry ? entry.completed : false;
  };

  // Calculate streak for a habit
  const getHabitStreak = (habitId: string) => {
    const today = new Date();
    let streak = 0;
    let currentDate = today;
    
    while (true) {
      const dateString = format(currentDate, 'yyyy-MM-dd');
      const isCompleted = getHabitCompletionStatus(habitId, dateString);
      
      if (!isCompleted) break;
      
      streak++;
      currentDate = subDays(currentDate, 1);
    }
    
    return streak;
  };

  // Calculate daily progress percentage
  const getDailyProgress = () => {
    const todayString = format(new Date(), 'yyyy-MM-dd');
    const activeHabits = habits.filter(habit => !habit.archived);
    
    if (activeHabits.length === 0) return 0;
    
    const completedHabits = activeHabits.filter(habit => 
      getHabitCompletionStatus(habit.id, todayString)
    );
    
    return Math.round((completedHabits.length / activeHabits.length) * 100);
  };

  // Add a new category
  const addCategory = async (categoryData: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...categoryData,
      id: generateId(),
    };

    setCategories(prevCategories => [...prevCategories, newCategory]);
  };

  // Update a category
  const updateCategory = async (updatedCategory: Category) => {
    setCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === updatedCategory.id ? updatedCategory : category
      )
    );
  };

  // Delete a category
  const deleteCategory = async (id: string) => {
    setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
    
    // Update habits that use this category to use the first available category instead of undefined
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.category === id ? { 
          ...habit, 
          category: categories.length > 1 ? categories.find(c => c.id !== id)?.id || categories[0].id : categories[0].id 
        } : habit
      )
    );
  };

  // Set global reminders enabled status
  const setGlobalRemindersEnabled = async (enabled: boolean) => {
    const updatedSettings = {
      ...globalSettings,
      remindersEnabled: enabled
    };
    
    try {
      await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updatedSettings));
      setGlobalSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving global settings to AsyncStorage:', error);
    }
  };

  // Helper to get completion rate for last 30 days
  const getCompletionRate = (habitId: string) => {
    // This is a simplified implementation - in a real app you'd calculate the last 30 days
    // based on the habit creation date and frequency
    let completed = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      if (getHabitCompletionStatus(habitId, dateString)) {
        completed++;
      }
    }
    
    return Math.round((completed / 30) * 100);
  };

  const value = {
    habits,
    categories,
    username,
    globalSettings,
    setUsername,
    setGlobalRemindersEnabled,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitCompletion,
    getHabitCompletionStatus,
    getHabitStreak,
    addCategory,
    updateCategory,
    deleteCategory,
    getDailyProgress,
    getCompletionRate,
  };

  return <HabitContext.Provider value={value}>{children}</HabitContext.Provider>;
}

// Custom hook to use the habit context
export function useHabits() {
  const context = useContext(HabitContext);
  if (context === undefined) {
    throw new Error('useHabits must be used within a HabitProvider');
  }
  return context;
} 