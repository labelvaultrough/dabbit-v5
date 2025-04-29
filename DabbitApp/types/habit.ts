// Types for habit tracking app

// Habit Frequency options
export type FrequencyType = 'daily' | 'weekly' | 'custom' | 'one-time';

export interface Frequency {
  type: FrequencyType;
  custom_days?: number[]; // 0 = Sunday, 1 = Monday, etc.
}

// Category for organizing habits
export interface Category {
  id: string;
  name: string;
  color: string; // References a color from the theme
}

// The main Habit type
export interface Habit {
  id: string;
  name: string;
  frequency: Frequency;
  category: string; // Category ID - now required
  time?: string; // Time for the habit (HH:MM format)
  reminderEnabled?: boolean; // Whether this specific habit should show reminders
  icon?: string; // Icon for the habit (Feather icon name)
  duration?: number; // Duration in minutes
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

// Habit entry for tracking completions
export interface HabitEntry {
  id: string;
  habitId: string;
  date: string; // ISO format: YYYY-MM-DD
  completed: boolean;
  notes?: string;
}

// Reminder for habits
export interface Reminder {
  id: string;
  habitId: string;
  time: string; // 24h format: HH:MM
  days: number[]; // 0-6, where 0 is Sunday
  enabled: boolean;
}

// Global app settings
export interface GlobalSettings {
  remindersEnabled: boolean;
} 