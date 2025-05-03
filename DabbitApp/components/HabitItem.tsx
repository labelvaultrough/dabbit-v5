import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { Habit } from '@/types/habit';
import { useHabits } from '@/context/HabitContext';
import { format } from 'date-fns';
import { getHabitBackgroundColor, getActionButtonColor, getLightPastelShade } from '@/utils/colorUtils';
import { Colors } from '@/constants/Colors';

// Get time bucket emoji based on the time
export const getTimeBucketEmoji = (timeString: string | undefined) => {
  if (!timeString) return null;
  
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Convert to 24-hour time for comparison
  const timeHour = hours;
  
  if (timeHour >= 5 && timeHour < 12) {
    return { emoji: '🌞', label: 'Morning' };
  } else if (timeHour >= 12 && timeHour < 17) {
    return { emoji: '⛅', label: 'Afternoon' };
  } else if (timeHour >= 17 && timeHour < 21) {
    return { emoji: '✨', label: 'Evening' };
  } else {
    return { emoji: '🌕', label: 'Night' };
  }
};

// Get current time bucket based on current time
export const getCurrentTimeBucket = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const timeString = `${currentHour}:00`;
  return getTimeBucketEmoji(timeString)?.label || null;
};

type HabitItemProps = {
  habit: Habit;
  date: string;
  onPress: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
};

// Format time to 12-hour format
export const formatTime = (timeString: string | undefined): string => {
  if (!timeString) return '';
  
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHour = hours % 12 || 12;
  return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * HabitItem component that displays a habit card with name, time, duration, and completion status
 */
export const HabitItem = ({ habit, date, onPress, onEdit, onDelete }: HabitItemProps) => {
  const { colors, isDark } = useTheme();
  const { 
    getHabitCompletionStatus, 
    getHabitStreak, 
    getHabitTimerState,
    startHabitTimer,
    pauseHabitTimer,
    resumeHabitTimer,
    stopHabitTimer,
    categories
  } = useHabits();
  
  const [animatedValue] = useState(new Animated.Value(0));
  
  const isCompleted = getHabitCompletionStatus(habit.id, date);
  const streak = getHabitStreak(habit.id);
  const timerState = getHabitTimerState?.(habit.id);
  const isTimerActive = timerState?.isActive || false;
  const progress = timerState?.progress || 0;
  
  // Animation for completion
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isCompleted ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isCompleted]);
  
  // Function to get the category color
  const getCategoryColor = () => {
    // Find the category of this habit
    const category = categories.find(cat => cat.id === habit.category);
    if (!category) return colors.primary;
    
    // Get the color from Colors based on category.color (e.g., "green", "blue", etc.)
    const categoryColors = isDark ? Colors.dark.categories : Colors.light.categories;
    const colorName = category.color as keyof typeof categoryColors;
    
    // Ensure we return a string color value (not an array for gradients)
    const colorValue = categoryColors[colorName];
    return typeof colorValue === 'string' ? colorValue : colors.primary;
  };
  
  // Function to get the background color based on habit category
  const getBackgroundColor = () => {
    // Always use the category color with pastel shade, even for completed items
    const categoryColor = getCategoryColor();
    return getLightPastelShade(categoryColor, 0.15);
  };
  
  // Handle action button press
  const handleActionButtonPress = () => {
    if (habit.duration) {
      // For timed habits, manage timer
      if (isCompleted) {
        // Do nothing if already completed
        return;
      }
      
      if (isTimerActive) {
        pauseHabitTimer(habit.id);
      } else if (timerState && !isTimerActive) {
        resumeHabitTimer(habit.id);
      } else {
        startHabitTimer(habit.id);
      }
    } else {
      // For non-timed habits, toggle completion
      onPress(habit.id);
    }
  };
  
  // Get icon based on habit
  const getHabitIcon = () => {
    // Use the provided icon if available
    if (habit.icon) {
      return habit.icon;
    }
    
    // Otherwise determine based on name
    if (habit.name.toLowerCase().includes('language')) {
      return 'globe';
    } else if (habit.name.toLowerCase().includes('doctor') || habit.name.toLowerCase().includes('appointment')) {
      return 'user';
    } else if (habit.name.toLowerCase().includes('coffee')) {
      return 'coffee';
    } else if (habit.name.toLowerCase().includes('exercise') || habit.name.toLowerCase().includes('workout') || habit.name.toLowerCase().includes('run')) {
      return 'activity';
    } else if (habit.name.toLowerCase().includes('read') || habit.name.toLowerCase().includes('book')) {
      return 'book';
    } else if (habit.name.toLowerCase().includes('meditate')) {
      return 'moon';
    } else if (habit.name.toLowerCase().includes('code') || habit.name.toLowerCase().includes('coding')) {
      return 'code';
    } else if (habit.name.toLowerCase().includes('cook') || habit.name.toLowerCase().includes('dinner')) {
      return 'coffee'; // Using coffee icon for cooking as in screenshot
    } else if (habit.name.toLowerCase().includes('yoga')) {
      return 'sun';
    } else if (habit.name.toLowerCase().includes('water') || habit.name.toLowerCase().includes('drink')) {
      return 'droplet';
    } else if (habit.name.toLowerCase().includes('meeting') || habit.name.toLowerCase().includes('team')) {
      return 'users';
    }
    
    return 'check';
  };
  
  // Function to determine the action button type
  const renderActionButton = () => {
    // For habits with duration, show timer controls
    const categoryColor = getCategoryColor();
    
    if (habit.duration) {
      if (isCompleted) {
        return (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: categoryColor }]}
            onPress={handleActionButtonPress}
          >
            <Feather name="check" size={24} color="white" />
          </TouchableOpacity>
        );
      }
      
      // Show progress and play/pause button
      return (
        <View style={styles.timerContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: isTimerActive ? categoryColor : '#2D3748' }]}
            onPress={handleActionButtonPress}
          >
            <Feather name={isTimerActive ? "pause" : "play"} size={24} color="white" />
          </TouchableOpacity>
          
          {/* Only show progress bar if timer has started */}
          {timerState && (
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progress}%`, backgroundColor: categoryColor }
                ]} 
              />
            </View>
          )}
        </View>
      );
    }
    
    // For non-duration habits, show check circle
    return (
      <Animated.View style={{ transform: [{ scale: animatedValue.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.2, 1],
      }) }] }}>
        <TouchableOpacity onPress={() => onPress(habit.id)}>
          <Feather 
            name={isCompleted ? "check-circle" : "circle"} 
            size={32} 
            color={isCompleted ? getCategoryColor() : colors.border} 
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // Get formatted duration text
  const getDurationText = () => {
    if (!habit.duration) return '';
    
    if (timerState) {
      const totalMinutes = habit.duration;
      const progressMinutes = Math.floor((progress / 100) * totalMinutes);
      return `${progressMinutes}/${totalMinutes} min`;
    }
    
    return `${habit.duration} min`;
  };
  
  // Get icon for the habit
  const iconName = getHabitIcon();
  
  return (
    <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: 'white' }]}>
          <Feather 
            name={iconName as any} 
            size={24} 
            color={getCategoryColor()} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>{habit.name}</Text>
          <View style={styles.detailsContainer}>
            <View style={styles.timeInfoContainer}>
              <Feather name="clock" size={16} color="#718096" style={styles.timeIcon} />
              <Text style={styles.timeText}>{formatTime(habit.time)}</Text>
            </View>
            
            {/* Bullet separator */}
            <Text style={styles.bullet}>•</Text>
            
            {/* Duration or frequency info */}
            <View style={styles.durationContainer}>
              <Text style={styles.durationText}>{getDurationText()}</Text>
              
              {/* Show streak if available */}
              {streak > 0 && (
                <View style={styles.streakContainer}>
                  <Text style={styles.fireEmoji}>🔥</Text>
                  <Text style={styles.streakText}>{streak}</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.rightSection}>
        {renderActionButton()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    maxWidth: '70%',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  timeInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 14,
    color: '#4A5568',
  },
  bullet: {
    fontSize: 14,
    color: '#4A5568',
    marginHorizontal: 4,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: 14,
    color: '#4A5568',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 101, 101, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  fireEmoji: {
    fontSize: 12,
    marginRight: 2,
  },
  streakText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  rightSection: {
    width: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
  },
  progressBar: {
    width: 64,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
});

export default HabitItem; 