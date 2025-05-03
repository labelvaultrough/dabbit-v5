import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Modal, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { metrics } from '@/constants/metrics';
import { Habit } from '@/types/habit';
import Svg, { Circle, G } from 'react-native-svg';
import { format } from 'date-fns';

// Safe haptic feedback function (no dependency on native modules)
const triggerHaptic = (type: string) => {
  try {
    // In a real implementation, we would check if the platform supports haptics
    // and only trigger if available
    console.log(`Haptic feedback triggered: ${type}`);
  } catch (error) {
    console.log('Haptic feedback not available');
  }
};

type HabitItemProps = {
  habit: Habit;
  date: string;
  onPress: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habit: Habit) => void;
};

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

export const HabitItem = ({ habit, date, onPress, onEdit, onDelete }: HabitItemProps) => {
  const { colors } = useTheme();
  const { 
    getHabitCompletionStatus, 
    getHabitStreak, 
    categories,
    startHabitTimer,
    pauseHabitTimer,
    resumeHabitTimer,
    stopHabitTimer,
    getHabitTimerState,
    getHabitHistory
  } = useHabits();
  
  const [menuVisible, setMenuVisible] = useState(false);
  
  const completed = getHabitCompletionStatus(habit.id, date);
  const streak = getHabitStreak(habit.id);
  
  // Get timer state
  const timerState = getHabitTimerState(habit.id);
  const isTimerActive = timerState?.isActive || false;
  const progress = timerState?.progress || 0;
  
  // For animation
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  // Find category color
  const category = categories.find(cat => cat.id === habit.category);
  const categoryColor = category 
    ? colors.categories[category.color as keyof typeof colors.categories] 
    : colors.primary;
  
  // Ensure we're using a string for colors
  const categoryColorStr = typeof categoryColor === 'string' ? categoryColor : colors.primary;
  
  // Get habit history for stats
  const history = useMemo(() => getHabitHistory(habit.id), [habit.id, getHabitHistory]);
  const historyStats = useMemo(() => {
    if (history.length === 0) return { attempts: 0, completions: 0 };
    
    return {
      attempts: history.length,
      completions: history.filter(h => h.completed).length
    };
  }, [history]);
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: completed ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [completed, animatedValue]);
  
  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.2, 1],
  });
  
  const backgroundColor = completed ? `${categoryColorStr}20` : 'transparent';

  const handleEdit = useCallback(() => {
    setMenuVisible(false);
    if (onEdit) {
      onEdit(habit);
    }
  }, [onEdit, habit]);

  const handleDelete = useCallback(() => {
    setMenuVisible(false);
    if (onDelete) {
      onDelete(habit);
    }
  }, [onDelete, habit]);
  
  // Handle play button actions
  const handlePlayButton = useCallback(() => {
    // If already completed, show a message
    if (completed) {
      Alert.alert('Already Completed', 'This habit has already been completed for today.');
      return;
    }
    
    // If timer exists and is active, pause it
    if (timerState && timerState.isActive) {
      pauseHabitTimer(habit.id);
      triggerHaptic('impact');
    } 
    // If timer exists but is paused, resume it
    else if (timerState && !timerState.isActive) {
      resumeHabitTimer(habit.id);
      triggerHaptic('impact');
    } 
    // Otherwise start a new timer
    else {
      startHabitTimer(habit.id);
      triggerHaptic('impact');
    }
  }, [habit.id, timerState, completed, startHabitTimer, pauseHabitTimer, resumeHabitTimer]);
  
  const timeBucket = getTimeBucketEmoji(habit.time);
  
  // Calculate circle properties for SVG
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  // Render the circular progress indicator and play button
  const renderCompletionButton = () => {
    if (!habit.duration) {
      // For habits without duration, show the original circle/check icon
      return (
        <Animated.View style={{ transform: [{ scale }] }}>
          <TouchableOpacity onPress={() => onPress(habit.id)}>
            <Feather 
              name={completed ? "check-circle" : "circle"} 
              size={metrics.iconSize.large} 
              color={completed ? categoryColorStr : colors.border} 
            />
          </TouchableOpacity>
        </Animated.View>
      );
    }
    
    // For habits with duration, show the play button with progress
    return (
      <View style={styles.playButtonWrapper}>
        {/* Main play button */}
        <TouchableOpacity 
          onPress={handlePlayButton} 
          activeOpacity={0.6}
          style={styles.playButtonContainer}
          hitSlop={{ top: 12, right: 12, bottom: 12, left: 12 }}
        >
          <View style={[
            styles.playButtonCircle,
            { 
              backgroundColor: completed ? `${categoryColorStr}20` : colors.background,
              borderColor: isTimerActive ? categoryColorStr : colors.border
            }
          ]}>
            {/* SVG Progress Circle */}
            <Svg width={48} height={48} style={styles.svg}>
              <G rotation="-90" origin="24, 24">
                <Circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke={categoryColorStr}
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </G>
            </Svg>
            
            {/* Icon - play, pause, or check */}
            <Feather 
              name={completed ? "check" : (isTimerActive ? "pause" : "play")} 
              size={metrics.iconSize.medium} 
              color={completed ? categoryColorStr : (isTimerActive ? categoryColorStr : colors.text)} 
            />
          </View>
        </TouchableOpacity>
      </View>
    );
  };
  
  // Format duration display with progress
  const formatTimerDisplay = () => {
    if (!habit.duration || !timerState) return null;
    
    const totalMinutes = habit.duration;
    const progressMinutes = Math.floor((progress / 100) * totalMinutes);
    
    return `${progressMinutes}/${totalMinutes} min`;
  };
  
  return (
    <View>
      <TouchableOpacity
        style={[
          styles.container,
          { 
            backgroundColor: backgroundColor,
            borderColor: colors.border,
          }
        ]}
        activeOpacity={0.8}
        disabled={habit.duration !== undefined}
      >
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <View style={styles.titleContainer}>
              {/* Show custom icon if available, otherwise show time bucket emoji */}
              {habit.icon ? (
                <View style={[styles.iconWrapper, { backgroundColor: `${categoryColorStr}20` }]}>
                  <Feather name={habit.icon as any} size={24} color={categoryColorStr} />
                </View>
              ) : timeBucket ? (
                <Text style={styles.timeEmoji}>
                  {timeBucket.emoji}
                </Text>
              ) : null}
              
              {category && (
                <View 
                  style={[
                    styles.categoryDot, 
                    { backgroundColor: categoryColorStr }
                  ]}
                />
              )}
              <Text style={[styles.title, { color: colors.text }]}>{habit.name}</Text>
            </View>
            
            {/* Details and info section */}
            <View style={styles.detailsContainer}>
              {/* Show duration indicator */}
              {habit.duration && (
                <View style={styles.durationContainer}>
                  <Feather name="clock" size={14} color={colors.textSecondary} />
                  <Text style={[styles.durationText, { color: colors.textSecondary }]}>
                    {formatTimerDisplay() || `${habit.duration} min`}
                  </Text>
                </View>
              )}
              
              {/* Show end date if available */}
              {habit.endDate && (
                <View style={styles.endDateContainer}>
                  <Feather name="calendar" size={14} color={colors.textSecondary} />
                  <Text style={[styles.endDateText, { color: colors.textSecondary }]}>
                    Ends {format(new Date(habit.endDate), 'MMM d, yyyy')}
                  </Text>
                </View>
              )}
              
              {/* Show history stats if available */}
              {historyStats.attempts > 0 && (
                <View style={styles.historyContainer}>
                  <Feather name="bar-chart-2" size={14} color={colors.textSecondary} />
                  <Text style={[styles.historyText, { color: colors.textSecondary }]}>
                    {historyStats.completions}/{historyStats.attempts} completed
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.rightContainer}>
            {streak > 0 && (
              <Text style={[styles.streak, { color: colors.textSecondary }]}>
                🔥 x{streak}
              </Text>
            )}
            {(onEdit || onDelete) && (
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => setMenuVisible(true)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <Feather 
                  name="more-vertical" 
                  size={metrics.iconSize.medium} 
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
            
            {renderCompletionButton()}
          </View>
        </View>
      </TouchableOpacity>
      
      {/* Options Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setMenuVisible(false)}
        >
          <View 
            style={[
              styles.menuContainer,
              { backgroundColor: colors.background, borderColor: colors.border }
            ]}
          >
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleEdit}
            >
              <Feather name="edit" size={20} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>Edit</Text>
            </TouchableOpacity>
            
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleDelete}
            >
              <Feather name="trash-2" size={20} color={colors.error} />
              <Text style={[styles.menuText, { color: colors.error }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: metrics.borderRadius.medium,
    padding: metrics.spacing.m,
    paddingLeft: metrics.spacing.s,
    marginBottom: metrics.spacing.m,
    borderWidth: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: metrics.spacing.m,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.spacing.xs,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: metrics.spacing.s,
  },
  timeEmoji: {
    fontSize: 24,
    marginRight: metrics.spacing.s,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: metrics.spacing.s,
  },
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  durationText: {
    fontSize: metrics.fontSize.xs,
    marginLeft: metrics.spacing.xs,
  },
  detailsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: 4,
  },
  historyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyText: {
    fontSize: metrics.fontSize.xs,
    marginLeft: metrics.spacing.xs,
  },
  endDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  endDateText: {
    fontSize: metrics.fontSize.xs,
    marginLeft: metrics.spacing.xs,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    marginRight: metrics.spacing.m,
    padding: metrics.spacing.xs,
  },
  title: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
  },
  streak: {
    fontSize: metrics.fontSize.s,
    marginRight: metrics.spacing.m,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  menuContainer: {
    width: 200,
    borderRadius: metrics.borderRadius.medium,
    borderWidth: 1,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.spacing.m,
  },
  menuText: {
    marginLeft: metrics.spacing.m,
    fontSize: metrics.fontSize.m,
  },
  menuDivider: {
    height: 1,
  },
  
  // Styles for play button and timer controls
  playButtonWrapper: {
    position: 'relative',
  },
  playButtonContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  playButtonCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  svg: {
    position: 'absolute',
    top: -3,
    left: -3,
    zIndex: 1,
  },
}); 