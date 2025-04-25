import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

// Define types for our theme context
type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  colors: typeof Colors.light | typeof Colors.dark;
};

// Create the context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Use the system's color scheme as the default theme
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(colorScheme === 'dark');

  // Update theme when system preference changes
  useEffect(() => {
    setIsDark(colorScheme === 'dark');
  }, [colorScheme]);

  // Toggle between light and dark modes
  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Current theme colors
  const colors = isDark ? Colors.dark : Colors.light;

  const value = {
    isDark,
    toggleTheme,
    colors,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Custom hook to use the theme context
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 