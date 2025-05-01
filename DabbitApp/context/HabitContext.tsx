import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { format, isToday, parseISO, subDays } from 'date-fns';
import { Habit, HabitEntry, Category, GlobalSettings } from '@/types/habit';
import { AppState } from 'react-native';

// Add timer state type
export interface TimerState {
  habitId: string;
  startTimestamp: number;
  pausedAt: number | null;
  totalPausedTime: number;
  isActive: boolean;
  progress: number;
}

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
  
  // Add timer-related functions
  startHabitTimer: (habitId: string) => void;
  pauseHabitTimer: (habitId: string) => void;
  resumeHabitTimer: (habitId: string) => void;
  stopHabitTimer: (habitId: string, markCompleted?: boolean) => void;
  getHabitTimerState: (habitId: string) => TimerState | null;
  saveTimerProgress: (habitId: string, progress: number) => Promise<void>;
  getHabitHistory: (habitId: string) => Array<{date: string, progress: number, completed: boolean}>;
};

// Storage keys
const HABITS_STORAGE_KEY = '@dabbit_habits';
const HABIT_ENTRIES_STORAGE_KEY = '@dabbit_habit_entries';
const CATEGORIES_STORAGE_KEY = '@dabbit_categories';
const USERNAME_STORAGE_KEY = '@dabbit_username';
const SETTINGS_STORAGE_KEY = '@dabbit_settings';
const TIMER_STORAGE_KEY = '@dabbit_timers';
const HISTORY_STORAGE_KEY = '@dabbit_history';

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

// Create fixed IDs for sample habits to ensure consistent streak tracking
const DRINK_WATER_ID = 'drink-water-habit';
const READ_ID = 'read-habit';
const EXERCISE_ID = 'exercise-habit';
const MEDITATE_ID = 'meditate-habit';
const COFFEE_ID = 'coffee-habit';
const DOCTOR_ID = 'doctor-habit';
const LANGUAGE_ID = 'language-habit';

const SAMPLE_HABITS: Habit[] = [
  {
    id: DRINK_WATER_ID,
    name: 'Drink Water',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[2].id, // Nutrition
    time: '08:00', // 8:00 AM
    reminderEnabled: true,
    icon: 'droplet',
    duration: undefined,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: READ_ID,
    name: 'Read',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[6].id, // Personal
    time: '21:00', // 9:00 PM
    reminderEnabled: true,
    icon: 'book',
    duration: 30,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: EXERCISE_ID,
    name: 'Exercise',
    frequency: { type: 'custom', custom_days: [1, 3, 5] }, // Mon, Wed, Fri
    category: SAMPLE_CATEGORIES[1].id, // Fitness
    time: '17:30', // 5:30 PM
    reminderEnabled: true,
    icon: 'activity',
    duration: 45,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: MEDITATE_ID,
    name: 'Meditate',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[8].id, // Mindfulness
    time: '07:15', // 7:15 AM
    reminderEnabled: true,
    icon: 'moon',
    duration: 15,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: COFFEE_ID,
    name: 'Coffee with Friend',
    frequency: { type: 'weekly' },
    category: SAMPLE_CATEGORIES[7].id, // Social
    time: '10:00', // 10:00 AM
    reminderEnabled: true,
    icon: 'coffee',
    duration: 90,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: DOCTOR_ID,
    name: 'Doctor Appointment',
    frequency: { type: 'custom', custom_days: [2] }, // Tuesday
    category: SAMPLE_CATEGORIES[0].id, // Health
    time: '14:30', // 2:30 PM
    reminderEnabled: true,
    icon: 'user',
    duration: 60,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: LANGUAGE_ID,
    name: 'Learn a Language',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[5].id, // Learning
    time: '13:00', // 1:00 PM
    reminderEnabled: true,
    icon: 'globe',
    duration: 20,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Some sample completions for the habits
const today = new Date();
const yesterday = subDays(today, 1);
const twoDaysAgo = subDays(today, 2);
const threeDaysAgo = subDays(today, 3);
const fourDaysAgo = subDays(today, 4);

const SAMPLE_ENTRIES: HabitEntry[] = [
  // Drink Water - streak of 3
  {
    id: generateId(),
    habitId: DRINK_WATER_ID,
    date: format(today, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: DRINK_WATER_ID,
    date: format(yesterday, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: DRINK_WATER_ID,
    date: format(twoDaysAgo, 'yyyy-MM-dd'),
    completed: true,
  },
  
  // Read - not completed, showing timer progress
  {
    id: generateId(),
    habitId: READ_ID,
    date: format(today, 'yyyy-MM-dd'),
    completed: false,
  },
  
  // Exercise - streak of 1
  {
    id: generateId(),
    habitId: EXERCISE_ID,
    date: format(today, 'yyyy-MM-dd'),
    completed: true,
  },
  
  // Meditate - streak of 2
  {
    id: generateId(),
    habitId: MEDITATE_ID,
    date: format(today, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: MEDITATE_ID,
    date: format(yesterday, 'yyyy-MM-dd'),
    completed: true,
  },
  
  // Coffee - streak of 3 (weekly habit)
  {
    id: generateId(),
    habitId: COFFEE_ID,
    date: format(today, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: COFFEE_ID,
    date: format(subDays(today, 7), 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: COFFEE_ID,
    date: format(subDays(today, 14), 'yyyy-MM-dd'),
    completed: true,
  },
  
  // Doctor - in progress with timer (not completed)
  {
    id: generateId(),
    habitId: DOCTOR_ID,
    date: format(today, 'yyyy-MM-dd'),
    completed: false,
  },
  
  // Language - streak of 4
  {
    id: generateId(),
    habitId: LANGUAGE_ID,
    date: format(today, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: LANGUAGE_ID,
    date: format(yesterday, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: LANGUAGE_ID,
    date: format(twoDaysAgo, 'yyyy-MM-dd'),
    completed: true,
  },
  {
    id: generateId(),
    habitId: LANGUAGE_ID,
    date: format(threeDaysAgo, 'yyyy-MM-dd'),
    completed: true,
  }
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
  
  // Add timer-related state
  const [activeTimers, setActiveTimers] = useState<TimerState[]>([
    // Timer state for Read habit (1 out of 30 minutes)
    {
      habitId: READ_ID,
      startTimestamp: Date.now() - (6 * 60 * 1000), // Started 6 minutes ago
      pausedAt: null, // Currently active
      totalPausedTime: 0,
      isActive: true, // Active
      progress: 20, // 6/30 minutes = 20%
    },
    // Timer state for Doctor Appointment (41 out of 60 minutes)
    {
      habitId: DOCTOR_ID,
      startTimestamp: Date.now() - (41 * 60 * 1000), // Started 41 minutes ago
      pausedAt: Date.now(), // Currently paused
      totalPausedTime: 0,
      isActive: false, // Paused
      progress: 68, // 41/60 minutes = 68%
    }
  ]);
  const [habitHistory, setHabitHistory] = useState<Record<string, Array<{date: string, progress: number, completed: boolean}>>>({});
  const appState = useRef(AppState.currentState);

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

  // Load data from AsyncStorage on first render
  useEffect(() => {
    const loadData = async () => {
      try {
        // For development, we can force using sample data
        const useSampleData = false;

        const habitsData = await AsyncStorage.getItem(HABITS_STORAGE_KEY);
        const entriesData = await AsyncStorage.getItem(HABIT_ENTRIES_STORAGE_KEY);
        const categoriesData = await AsyncStorage.getItem(CATEGORIES_STORAGE_KEY);
        const usernameData = await AsyncStorage.getItem(USERNAME_STORAGE_KEY);
        const settingsData = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        const timerData = await AsyncStorage.getItem(TIMER_STORAGE_KEY);

        if (habitsData && !useSampleData) {
          // Clean any timer-related properties from existing habits
          const parsedHabits = JSON.parse(habitsData);
          const cleanedHabits = parsedHabits.map((h: any) => ({
            ...h,
            timerActive: undefined,
            timerStartTime: undefined,
            timerElapsed: undefined
          }));
          setHabits(cleanedHabits);
          // Save the cleaned habits back to storage
          await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(cleanedHabits));
        } else if (isFirstLaunch || useSampleData) {
          // For first launch, use sample data but ensure no timer properties
          const cleanedSampleHabits = SAMPLE_HABITS.map(h => ({
            ...h,
            timerActive: undefined,
            timerStartTime: undefined,
            timerElapsed: undefined
          }));
          setHabits(cleanedSampleHabits);
          await AsyncStorage.setItem(HABITS_STORAGE_KEY, JSON.stringify(cleanedSampleHabits));
          
          // Set initial timer state for Read habit if this is first launch
          if (!timerData || isFirstLaunch || useSampleData) {
            const initialTimerState = [
              {
                habitId: READ_ID,
                startTimestamp: Date.now() - (6 * 60 * 1000),
                pausedAt: null,
                totalPausedTime: 0,
                isActive: true,
                progress: 20,
              },
              {
                habitId: DOCTOR_ID,
                startTimestamp: Date.now() - (41 * 60 * 1000),
                pausedAt: Date.now(),
                totalPausedTime: 0,
                isActive: false,
                progress: 68,
              }
            ];
            await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(initialTimerState));
          }
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

  // Load timer state and history from AsyncStorage
  useEffect(() => {
    const loadTimerData = async () => {
      try {
        const timerData = await AsyncStorage.getItem(TIMER_STORAGE_KEY);
        if (timerData) {
          setActiveTimers(JSON.parse(timerData));
        }
        
        const historyData = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
        if (historyData) {
          setHabitHistory(JSON.parse(historyData));
        }
      } catch (error) {
        console.error('Error loading timer data:', error);
      }
    };
    
    loadTimerData();
  }, []);

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

  // Save timer state to AsyncStorage when it changes
  useEffect(() => {
    const saveTimerState = async () => {
      try {
        await AsyncStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(activeTimers));
      } catch (error) {
        console.error('Error saving timer state:', error);
      }
    };
    
    saveTimerState();
  }, [activeTimers]);
  
  // Save history data to AsyncStorage when it changes
  useEffect(() => {
    const saveHistoryData = async () => {
      try {
        await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(habitHistory));
      } catch (error) {
        console.error('Error saving habit history:', error);
      }
    };
    
    saveHistoryData();
  }, [habitHistory]);
  
  // Track app state for background/foreground transitions
  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App going to background - save timestamp for each active timer
        setActiveTimers(prev => prev.map(timer => ({
          ...timer,
          pausedAt: timer.isActive ? Date.now() : timer.pausedAt
        })));
      } else if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App coming to foreground - adjust totalPausedTime for each timer
        setActiveTimers(prev => prev.map(timer => {
          if (timer.isActive && timer.pausedAt) {
            return {
              ...timer,
              totalPausedTime: timer.totalPausedTime + (Date.now() - timer.pausedAt),
              pausedAt: null
            };
          }
          return timer;
        }));
      }
      appState.current = nextAppState;
    });
    
    return () => {
      subscription.remove();
    };
  }, []);
  
  // Timer update interval for progress
  useEffect(() => {
    const updateInterval = setInterval(() => {
      const now = Date.now();
      
      setActiveTimers(prev => {
        let updated = false;
        const updatedTimers = prev.map(timer => {
          if (!timer.isActive) return timer;
          
          const habit = habits.find(h => h.id === timer.habitId);
          if (!habit?.duration) return timer;
          
          const totalDuration = habit.duration * 60 * 1000;
          const adjustedElapsed = now - timer.startTimestamp - timer.totalPausedTime;
          const newProgress = Math.min((adjustedElapsed / totalDuration) * 100, 100);
          
          if (newProgress !== timer.progress) {
            updated = true;
            
            // Check if the timer is complete
            if (newProgress >= 100) {
              // Schedule completion for after the interval update
              setTimeout(() => {
                toggleHabitCompletion(timer.habitId, format(new Date(), 'yyyy-MM-dd'));
                
                // Update history
                addToHistory(timer.habitId, 100, true);
                
                // Remove this timer from active timers
                setActiveTimers(current => current.filter(t => t.habitId !== timer.habitId));
              }, 0);
            }
            
            return { ...timer, progress: newProgress };
          }
          
          return timer;
        });
        
        return updated ? updatedTimers : prev;
      });
    }, 1000);
    
    return () => clearInterval(updateInterval);
  }, [habits]);

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
          ? { 
              ...updatedHabit, 
              updatedAt: new Date().toISOString(),
              // Remove any existing timer properties
              timerActive: undefined,
              timerStartTime: undefined,
              timerElapsed: undefined
            }
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
    // Filter out archived habits and one-time habits for analytics
    const activeHabits = habits.filter(habit => !habit.archived && habit.frequency.type !== 'one-time');
    
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
    // Skip one-time habits for analytics
    const habit = habits.find(h => h.id === habitId);
    if (habit?.frequency.type === 'one-time') return 0;
    
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

  // Timer management functions
  const startHabitTimer = (habitId: string) => {
    const now = Date.now();
    
    // Remove any existing timer for this habit first
    setActiveTimers(prev => {
      const existing = prev.find(t => t.habitId === habitId);
      if (existing) {
        // Save partial progress to history
        addToHistory(habitId, existing.progress, false);
      }
      
      return [
        ...prev.filter(t => t.habitId !== habitId),
        {
          habitId,
          startTimestamp: now,
          pausedAt: null,
          totalPausedTime: 0,
          isActive: true,
          progress: 0
        }
      ];
    });
  };
  
  const pauseHabitTimer = (habitId: string) => {
    setActiveTimers(prev => prev.map(timer => {
      if (timer.habitId === habitId && timer.isActive) {
        return {
          ...timer,
          pausedAt: Date.now(),
          isActive: false
        };
      }
      return timer;
    }));
  };
  
  const resumeHabitTimer = (habitId: string) => {
    setActiveTimers(prev => prev.map(timer => {
      if (timer.habitId === habitId && !timer.isActive && timer.pausedAt) {
        return {
          ...timer,
          totalPausedTime: timer.totalPausedTime + (Date.now() - timer.pausedAt),
          pausedAt: null,
          isActive: true
        };
      }
      return timer;
    }));
  };
  
  const stopHabitTimer = (habitId: string, markCompleted = false) => {
    // Get current progress before removing
    const timerState = activeTimers.find(t => t.habitId === habitId);
    
    if (timerState) {
      // Save to history
      addToHistory(habitId, timerState.progress, markCompleted);
      
      // If markCompleted is true, also toggle completion
      if (markCompleted) {
        setTimeout(() => {
          toggleHabitCompletion(habitId, format(new Date(), 'yyyy-MM-dd'));
        }, 0);
      }
    }
    
    // Remove the timer
    setActiveTimers(prev => prev.filter(timer => timer.habitId !== habitId));
  };
  
  const getHabitTimerState = (habitId: string): TimerState | null => {
    return activeTimers.find(timer => timer.habitId === habitId) || null;
  };
  
  const saveTimerProgress = async (habitId: string, progress: number) => {
    addToHistory(habitId, progress, false);
  };
  
  const addToHistory = (habitId: string, progress: number, completed: boolean) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    
    setHabitHistory(prev => {
      const habitRecords = prev[habitId] || [];
      return {
        ...prev,
        [habitId]: [
          ...habitRecords,
          { date: today, progress, completed }
        ]
      };
    });
  };
  
  const getHabitHistory = (habitId: string) => {
    return habitHistory[habitId] || [];
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
    // Add timer functions to context
    startHabitTimer,
    pauseHabitTimer,
    resumeHabitTimer,
    stopHabitTimer,
    getHabitTimerState,
    saveTimerProgress,
    getHabitHistory
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