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
  getCompletedHabitsForDate: (date: string) => Habit[];
  
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
const BUDGET_ID = 'budget-habit';
const SLEEP_EARLY_ID = 'sleep-early-habit';
const DRAW_ID = 'draw-habit';
const CODE_ID = 'code-habit';
const JOURNAL_ID = 'journal-habit';
const MEETING_ID = 'meeting-habit';
const YOGA_ID = 'yoga-habit';
const COOK_ID = 'cook-habit';

const SAMPLE_HABITS: Habit[] = [
  // MORNING HABITS
  {
    id: DRINK_WATER_ID,
    name: 'Drink Water',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[2].id, // Nutrition
    time: '08:00', // 8:00 AM - Morning
    reminderEnabled: true,
    icon: 'droplet',
    duration: undefined,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: MEDITATE_ID,
    name: 'Meditate',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[8].id, // Mindfulness
    time: '07:15', // 7:15 AM - Morning
    reminderEnabled: true,
    icon: 'moon',
    duration: 15,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: YOGA_ID,
    name: 'Morning Yoga',
    frequency: { type: 'custom', custom_days: [1, 3, 5] }, // Mon, Wed, Fri
    category: SAMPLE_CATEGORIES[1].id, // Fitness
    time: '06:30', // 6:30 AM - Morning
    reminderEnabled: true,
    icon: 'sun',
    duration: 30,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // AFTERNOON HABITS
  {
    id: LANGUAGE_ID,
    name: 'Learn a Language',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[5].id, // Learning
    time: '13:00', // 1:00 PM - Afternoon
    reminderEnabled: true,
    icon: 'globe',
    duration: 20,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: DOCTOR_ID,
    name: 'Doctor Appointment',
    frequency: { type: 'custom', custom_days: [2] }, // Tuesday
    category: SAMPLE_CATEGORIES[0].id, // Health
    time: '14:30', // 2:30 PM - Afternoon
    reminderEnabled: true,
    icon: 'user',
    duration: 60,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: MEETING_ID,
    name: 'Team Meeting',
    frequency: { type: 'custom', custom_days: [1, 3] }, // Mon, Wed
    category: SAMPLE_CATEGORIES[3].id, // Work
    time: '15:00', // 3:00 PM - Afternoon
    reminderEnabled: true,
    icon: 'users',
    duration: 45,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // EVENING HABITS
  {
    id: EXERCISE_ID,
    name: 'Evening Run',
    frequency: { type: 'custom', custom_days: [1, 3, 5] }, // Mon, Wed, Fri
    category: SAMPLE_CATEGORIES[1].id, // Fitness
    time: '17:30', // 5:30 PM - Evening
    reminderEnabled: true,
    icon: 'activity',
    duration: 45,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: CODE_ID,
    name: 'Coding Practice',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[4].id, // Productivity
    time: '18:30', // 6:30 PM - Evening
    reminderEnabled: true,
    icon: 'code',
    duration: 60,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: COOK_ID,
    name: 'Cook Dinner',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[2].id, // Nutrition
    time: '19:00', // 7:00 PM - Evening
    reminderEnabled: true,
    icon: 'coffee',
    duration: 40,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // NIGHT HABITS
  {
    id: READ_ID,
    name: 'Read',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[6].id, // Personal
    time: '21:00', // 9:00 PM - Night
    reminderEnabled: true,
    icon: 'book',
    duration: 30,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: BUDGET_ID,
    name: 'Review Budget',
    frequency: { type: 'weekly' },
    category: SAMPLE_CATEGORIES[10].id, // Finance
    time: '20:30', // 8:30 PM - Night
    reminderEnabled: true,
    icon: 'dollar-sign',
    duration: 15,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: JOURNAL_ID,
    name: 'Journal',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[8].id, // Mindfulness
    time: '22:00', // 10:00 PM - Night
    reminderEnabled: true,
    icon: 'edit-3',
    duration: 15,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: SLEEP_EARLY_ID,
    name: 'Sleep by 11 PM',
    frequency: { type: 'daily' },
    category: SAMPLE_CATEGORIES[11].id, // Sleep
    time: '22:45', // 10:45 PM - Night
    reminderEnabled: true,
    icon: 'moon',
    duration: undefined,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // WEEKLY HABITS
  {
    id: COFFEE_ID,
    name: 'Coffee with Friend',
    frequency: { type: 'weekly' },
    category: SAMPLE_CATEGORIES[7].id, // Social
    time: '10:00', // 10:00 AM - Weekend Morning
    reminderEnabled: true,
    icon: 'coffee',
    duration: 90,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: DRAW_ID,
    name: 'Sketch/Draw',
    frequency: { type: 'weekly' },
    category: SAMPLE_CATEGORIES[9].id, // Creativity
    time: '16:00', // 4:00 PM - Weekend Afternoon
    reminderEnabled: true,
    icon: 'edit',
    duration: 60,
    archived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Some sample completions for the habits
const today = new Date();

// Generate entries for the last 30 days
const SAMPLE_ENTRIES: HabitEntry[] = [];

// Helper to generate comprehensive completion data
const generateCompletionData = () => {
  // Create a list of habit IDs for easier reference
  const habitIds = SAMPLE_HABITS.map(habit => habit.id);
  
  // Initialize habit history record for tracking partial completions
  const initialHistory: Record<string, Array<{date: string, progress: number, completed: boolean}>> = {};
  habitIds.forEach(id => {
    initialHistory[id] = [];
  });
  
  // Generate data for the last 20 days with good coverage
  for (let i = 0; i < 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // For each habit, decide if it was completed on this day based on frequency and randomness
    SAMPLE_HABITS.forEach(habit => {
      let shouldBeAvailable = false;
      
      // Check if the habit should be available on this day based on frequency
      if (habit.frequency.type === 'daily') {
        shouldBeAvailable = true;
      } else if (habit.frequency.type === 'weekly') {
        // Weekly habits on Saturday (day 6)
        shouldBeAvailable = dayOfWeek === 6;
      } else if (habit.frequency.type === 'custom' && habit.frequency.custom_days) {
        // Custom days - check if current day is in custom days
        shouldBeAvailable = habit.frequency.custom_days.includes(dayOfWeek);
      }
      
      if (shouldBeAvailable) {
        // Generate a random outcome: 
        // 0-50%: Partial completion or not started
        // 51-100%: Full completion
        const randomOutcome = Math.random() * 100;
        
        // For timed habits with duration, handle partial completion
        if (habit.duration && randomOutcome < 70) {
          // Create partial completion (10% to 95%)
          const partialProgress = Math.floor(Math.random() * 86) + 10;
          
          // Only add to habit entries if progress >= 95% (consider it completed)
          if (partialProgress >= 95) {
            SAMPLE_ENTRIES.push({
              id: generateId(),
              habitId: habit.id,
              date: dateString,
              completed: true,
            });
            
            // Add to history with full completion
            initialHistory[habit.id].push({
              date: dateString,
              progress: 100,
              completed: true
            });
          } else {
            // Add to history with partial progress
            initialHistory[habit.id].push({
              date: dateString,
              progress: partialProgress,
              completed: false
            });
          }
        } else if (randomOutcome >= 70) {
          // Regular full completion (30% chance)
          SAMPLE_ENTRIES.push({
            id: generateId(),
            habitId: habit.id,
            date: dateString,
            completed: true,
          });
          
          // Add to history with full completion
          initialHistory[habit.id].push({
            date: dateString,
            progress: 100,
            completed: true
          });
        }
      }
    });
  }
  
  // Return the generated history data
  return initialHistory;
};

// Generate the completion data and history
const initialHabitHistory = generateCompletionData();

// Add specifically for today and yesterday to ensure there's some recent data
const todayString = format(today, 'yyyy-MM-dd');
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayString = format(yesterday, 'yyyy-MM-dd');

// Ensure timer states are consistent with habit entries
// We'll have READ_ID and DOCTOR_ID with timers in progress
SAMPLE_ENTRIES.push({
  id: generateId(),
  habitId: READ_ID,
  date: todayString,
  completed: false, // Timer in progress
});

SAMPLE_ENTRIES.push({
  id: generateId(),
  habitId: DOCTOR_ID,
  date: todayString,
  completed: false, // Timer in progress
});

// Create sample timer states with varied progress
const SAMPLE_TIMERS: TimerState[] = [
  // Reading - 20% complete
  {
    habitId: READ_ID,
    startTimestamp: Date.now() - (6 * 60 * 1000), // Started 6 minutes ago
    pausedAt: null, // Currently active
    totalPausedTime: 0,
    isActive: true, // Active
    progress: 20, // 6/30 minutes = 20%
  },
  // Doctor Appointment - 68% complete
  {
    habitId: DOCTOR_ID,
    startTimestamp: Date.now() - (41 * 60 * 1000), // Started 41 minutes ago
    pausedAt: Date.now(), // Currently paused
    totalPausedTime: 0,
    isActive: false, // Paused
    progress: 68, // 41/60 minutes = 68%
  },
  // Exercise - 45% complete
  {
    habitId: EXERCISE_ID,
    startTimestamp: Date.now() - (20 * 60 * 1000), // Started 20 minutes ago
    pausedAt: null, // Currently active
    totalPausedTime: 0,
    isActive: true, 
    progress: 45, // 20/45 minutes = ~45%
  },
  // Coding Practice - 75% complete
  {
    habitId: CODE_ID,
    startTimestamp: Date.now() - (45 * 60 * 1000), // Started 45 minutes ago
    pausedAt: null, // Currently active
    totalPausedTime: 0,
    isActive: true, 
    progress: 75, // 45/60 minutes = 75%
  },
  // Language Learning - 30% complete
  {
    habitId: LANGUAGE_ID,
    startTimestamp: Date.now() - (6 * 60 * 1000), // Started 6 minutes ago
    pausedAt: null, // Currently active
    totalPausedTime: 0,
    isActive: true, 
    progress: 30, // 6/20 minutes = 30%
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
  const [activeTimers, setActiveTimers] = useState<TimerState[]>(SAMPLE_TIMERS);
  const [habitHistory, setHabitHistory] = useState<Record<string, Array<{date: string, progress: number, completed: boolean}>>>(initialHabitHistory);
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
        // Always use our sample data
        const useSampleData = true;
        
        // Clear all existing data to ensure clean state
        await AsyncStorage.clear();
        console.log('Cleared all storage to load fresh sample data');
        
        // Generate and use last 30 days data instead of April data
        const thirtyDaysData = generateLastThirtyDaysData();
        console.log(`Generated data with ${Object.keys(thirtyDaysData.history).length} habit histories`);
        
        // Set the data in state
        setHabits(thirtyDaysData.habits);
        setHabitHistory(thirtyDaysData.history);
        
        // Also set up entries for habit completion status
        const habitEntries: HabitEntry[] = [];
        Object.keys(thirtyDaysData.history).forEach(habitId => {
          thirtyDaysData.history[habitId].forEach(entry => {
            if (entry.completed) {
              habitEntries.push({
                id: generateId(),
                habitId: habitId,
                date: entry.date,
                completed: true
              });
            }
          });
        });
        setHabitEntries(habitEntries);
        console.log(`Set ${habitEntries.length} habit entries`);
        
        // Set categories
        setCategories(SAMPLE_CATEGORIES);
        
        // Skip the rest of the loading logic
        return;
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  // Load timer state and history from AsyncStorage
  useEffect(() => {
    const loadTimerData = async () => {
      try {
        // Always use sample timer data
        setActiveTimers(SAMPLE_TIMERS);
        console.log('Loaded sample timer data');
        
        // Skip the rest of the loading logic
        return;
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
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    
    // Filter out archived habits and get habits scheduled for today
    const availableHabits = habits.filter(habit => {
      if (habit.archived || habit.frequency.type === 'one-time') return false;
      
      const dayOfWeek = today.getDay();
      
      if (habit.frequency.type === 'daily') {
        return true;
      } else if (habit.frequency.type === 'weekly') {
        return dayOfWeek === 6; // Saturday
      } else if (habit.frequency.type === 'custom' && habit.frequency.custom_days) {
        return habit.frequency.custom_days.includes(dayOfWeek);
      }
      return false;
    });
    
    if (availableHabits.length === 0) return 0;
    
    let totalProgress = 0;
    
    for (const habit of availableHabits) {
      // Check if the habit is fully completed
      if (getHabitCompletionStatus(habit.id, todayString)) {
        totalProgress += 100;
        continue;
      }
      
      // For current day, check active timers for timed habits
      if (habit.duration) {
        const timerState = activeTimers.find(t => t.habitId === habit.id);
        if (timerState) {
          totalProgress += timerState.progress;
          continue;
        }
        
        // Check habit history
        const habitRecords = habitHistory[habit.id] || [];
        const historyEntry = habitRecords.find(entry => entry.date === todayString);
        if (historyEntry) {
          totalProgress += historyEntry.progress;
        }
      }
    }
    
    // Calculate average progress (0-100%)
    const result = totalProgress / availableHabits.length;
    return Math.round(result);
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

  // After getCompletionRate function but before startHabitTimer
  const getCompletedHabitsForDate = (date: string) => {
    return habits.filter(habit => {
      return getHabitCompletionStatus(habit.id, date);
    });
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
      
      // Check if we already have an entry for today
      const existingEntryIndex = habitRecords.findIndex(entry => entry.date === today);
      if (existingEntryIndex >= 0) {
        // Update the existing entry
        const updatedRecords = [...habitRecords];
        updatedRecords[existingEntryIndex] = {
          date: today,
          progress,
          completed
        };
        return {
          ...prev,
          [habitId]: updatedRecords
        };
      } else {
        // Add a new entry
        return {
          ...prev,
          [habitId]: [
            ...habitRecords,
            { date: today, progress, completed }
          ]
        };
      }
    });
  };
  
  const getHabitHistory = (habitId: string) => {
    return habitHistory[habitId] || [];
  };

  // Generate sample data with history for the last 30 days
  const generateLastThirtyDaysData = () => {
    const habitData = [...SAMPLE_HABITS];
    const historyData: {
      habitId: string;
      date: string;
      completed: boolean;
      progress: number;
    }[] = [];
    
    // Get today and 30 days ago
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Generate history entries for the last 30 days
    for (let i = 0; i <= 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Skip dates in the future
      if (date > today) continue;
      
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // For each habit, decide whether to create a completion entry
      habitData.forEach(habit => {
        const dayOfWeek = date.getDay();
        
        // Check if the habit should be available on this day based on frequency
        let shouldBeAvailable = false;
        if (habit.frequency.type === 'daily') {
          shouldBeAvailable = true;
        } else if (habit.frequency.type === 'weekly') {
          shouldBeAvailable = dayOfWeek === 6; // Saturday
        } else if (habit.frequency.type === 'custom' && habit.frequency.custom_days) {
          shouldBeAvailable = habit.frequency.custom_days.includes(dayOfWeek);
        }
        
        if (!shouldBeAvailable) return;
        
        // Create pattern based on habit and day
        let skipPattern = false;
        
        // 1. Reading - Skip weekends sometimes
        if (habit.id === READ_ID && (dayOfWeek === 0 || dayOfWeek === 6) && Math.random() < 0.6) {
          skipPattern = true;
        }
        
        // 2. Exercise - More consistent but occasional missed days
        if (habit.id === EXERCISE_ID && Math.random() < 0.2) {
          skipPattern = true;
        }
        
        // 3. Meditation - Very consistent
        if (habit.id === MEDITATE_ID && Math.random() < 0.1) {
          skipPattern = true;
        }
        
        // 4. Cleaning - Often missed or other habits
        if (habit.id === DRINK_WATER_ID && Math.random() < 0.4) {
          skipPattern = true;
        }
        
        // Add some randomness based on recency
        // Recent days: more likely to have activity
        // Older days: less likely to have activity
        if (i > 20 && Math.random() < 0.3) {
          skipPattern = true;
        }
        
        // Create some completely empty days (no progress) - about 10% of days
        if (Math.random() < 0.1) {
          skipPattern = true;
        }
        
        // If not skipped, add a history entry
        if (!skipPattern) {
          // Determine progress - mix of complete and partial completion
          let progress = 100; // Default to completed
          let completed = true;
          
          // Generate some partial progress days
          if (habit.duration && Math.random() < 0.3) {
            // Generate varied partial progress
            progress = Math.floor(Math.random() * 90) + 5; // 5% to 95%
            completed = false;
          }
          
          historyData.push({
            habitId: habit.id,
            date: formattedDate,
            completed,
            progress
          });
        }
      });
    }
    
    // Convert array to record format expected by the app
    const historyRecord: Record<string, { date: string; progress: number; completed: boolean; }[]> = {};
    
    historyData.forEach(entry => {
      if (!historyRecord[entry.habitId]) {
        historyRecord[entry.habitId] = [];
      }
      historyRecord[entry.habitId].push({
        date: entry.date,
        progress: entry.progress,
        completed: entry.completed
      });
    });
    
    console.log(`Generated ${historyData.length} history entries for ${Object.keys(historyRecord).length} habits (last 30 days)`);
    
    return { habits: habitData, history: historyRecord };
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
    getCompletedHabitsForDate,
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