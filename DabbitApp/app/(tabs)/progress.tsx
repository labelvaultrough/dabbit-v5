import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isToday, isFuture, isSameMonth } from 'date-fns';
import { Feather } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { metrics } from '@/constants/metrics';
import { formatTime } from '@/components/HabitItem';
import { Colors } from '@/constants/Colors';
import { Habit } from '@/types/habit';
import { getLightPastelShade } from '@/utils/colorUtils';

export default function ProgressScreen() {
  const { colors, isDark } = useTheme();
  const { 
    habits, 
    username, 
    getCompletedHabitsForDate, 
    getHabitCompletionStatus,
    getDailyProgress,
    getHabitTimerState,
    getHabitHistory,
    categories
  } = useHabits();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [daysInMonth, setDaysInMonth] = useState<Date[]>([]);
  
  // Update days in month when current month changes
  useEffect(() => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    setDaysInMonth(eachDayOfInterval({ start: firstDay, end: lastDay }));
  }, [currentMonth]);
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  // Navigate to next month (but not beyond current date)
  const goToNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    // Allow navigating to the current month (May 2024) but not future months
    const today = new Date();
    
    if (nextMonth.getFullYear() < today.getFullYear() || 
        (nextMonth.getFullYear() === today.getFullYear() && 
         nextMonth.getMonth() <= today.getMonth())) {
      setCurrentMonth(nextMonth);
    }
  };
  
  // Calculate progress intensity for a specific date (0-100%), including partial completions
  const getDateProgress = (date: Date): number => {
    // Use the actual date for data lookup instead of April 2024
    const formattedDate = format(date, 'yyyy-MM-dd');
    
    // Get all habits available on this date
    const availableHabits = habits.filter(habit => {
      const dayOfWeek = date.getDay();
      
      if (habit.frequency.type === 'daily') {
        return true;
      } else if (habit.frequency.type === 'weekly') {
        return dayOfWeek === 6; // Saturday
      } else if (habit.frequency.type === 'custom' && habit.frequency.custom_days) {
        return habit.frequency.custom_days.includes(dayOfWeek);
      }
      return false;
    });
    
    // If no habits exist for this date, return 0
    if (availableHabits.length === 0) return 0;
    
    let totalProgress = 0;
    
    for (const habit of availableHabits) {
      // Check if the habit is fully completed
      if (getHabitCompletionStatus(habit.id, formattedDate)) {
        console.log(`Habit ${habit.name} is completed on ${formattedDate}`);
        totalProgress += 100;
        continue;
      }
      
      // For current day, check active timers
      if (format(new Date(), 'yyyy-MM-dd') === formattedDate && habit.duration) {
        const timerState = getHabitTimerState(habit.id);
        if (timerState) {
          totalProgress += timerState.progress;
          continue;
        }
      }
      
      // For past days, check habit history
      const habitHistory = habit.duration ? getHabitHistory(habit.id) : [];
      const historyEntry = habitHistory.find(entry => entry.date === formattedDate);
      if (historyEntry) {
        console.log(`Habit ${habit.name} has progress ${historyEntry.progress}% on ${formattedDate}`);
        totalProgress += historyEntry.progress;
      }
    }
    
    // Calculate average progress (0-100%)
    const result = totalProgress / availableHabits.length;
    console.log(`Average progress for ${formattedDate}: ${result}%`);
    return result;
  };
  
  // Get all activities for selected date (both completed and in-progress)
  const getActivitiesForSelectedDate = () => {
    // Check if selected date is in the future
    const today = new Date();
    const isFutureDay = selectedDate > today;
    
    // If future date, return empty array
    if (isFutureDay) {
      console.log(`Selected date ${format(selectedDate, 'yyyy-MM-dd')} is in the future - no activities`);
      return [];
    }
    
    // Use the actual selected date for data lookup
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const isCurrentDay = format(new Date(), 'yyyy-MM-dd') === formattedDate;
    
    const activitiesMap = new Map(); // Use a map to prevent duplicate habits
    
    // First add completed habits
    const completedHabits = habits.filter(habit => 
      getHabitCompletionStatus(habit.id, formattedDate)
    );
    
    completedHabits.forEach(habit => {
      activitiesMap.set(habit.id, { 
        habit, 
        progress: 100, 
        isCompleted: true 
      });
    });
    
    // Then check for in-progress habits
    // For current day, use active timers
    if (isCurrentDay) {
      habits.forEach(habit => {
        // Skip already added completed habits
        if (activitiesMap.has(habit.id)) return;
        
        if (habit.duration) {
          const timerState = getHabitTimerState(habit.id);
          if (timerState && timerState.progress > 0) {
            activitiesMap.set(habit.id, { 
              habit, 
              progress: timerState.progress, 
              isCompleted: false 
            });
          }
        }
      });
    }
    
    // For any day, check habit history
    habits.forEach(habit => {
      // Skip already added habits
      if (activitiesMap.has(habit.id)) return;
      
      if (habit.duration) {
        const habitHistory = getHabitHistory(habit.id);
        const historyEntry = habitHistory.find(entry => entry.date === formattedDate);
        if (historyEntry && historyEntry.progress > 0) {
          activitiesMap.set(habit.id, { 
            habit, 
            progress: historyEntry.progress, 
            isCompleted: historyEntry.completed 
          });
        }
      }
    });
    
    // Convert map to array and sort by completion status (incompleted items first)
    const activities = Array.from(activitiesMap.values())
      .sort((a, b) => {
        // First sort by completion status (non-completed first)
        if (a.isCompleted && !b.isCompleted) return 1;
        if (!a.isCompleted && b.isCompleted) return -1;
        // Then by progress for incomplete items (highest progress first)
        if (!a.isCompleted && !b.isCompleted) {
          return b.progress - a.progress;
        }
        return 0; // Keep same order for completed items
      });
    
    console.log(`Found ${activities.length} activities for ${formattedDate}`);
    return activities;
  };
  
  // Get color for habit category
  const getHabitCategoryColor = (habit: Habit) => {
    // Find the category of this habit
    const category = categories.find(cat => cat.id === habit.category);
    if (!category) return colors.primary;
    
    // Get the color from Colors.categories based on category.color
    const categoryColors = isDark ? Colors.dark.categories : Colors.light.categories;
    const colorName = category.color as keyof typeof categoryColors;
    
    // Get the color value, which might be a string or string[] for gradients
    const colorValue = categoryColors[colorName];
    
    // If it's a string array (gradient), return the first color
    if (Array.isArray(colorValue)) {
      return colorValue[0];
    }
    
    // Otherwise return the string color
    return colorValue || colors.primary;
  };
  
  // Generate color based on intensity (0-100%) - continuous gradient
  const getIntensityColor = (progress: number): string => {
    // Base color is #FF6B6B (light red)
    // Create a truly linear gradient with no steps

    // For 0% progress, use background color
    if (progress === 0) {
      return colors.background;
    }
    
    // Calculate a truly linear alpha from 0.05 to 1.0
    const alpha = 0.05 + (progress / 100) * 0.95;
    
    // Get red component based on progress (255 is constant for red)
    const r = 255;
    
    // Green and blue decrease slightly as progress increases
    // This makes the color more vibrant red at higher percentages
    const g = Math.max(107 - progress * 0.5, 50);
    const b = Math.max(107 - progress * 0.5, 50);
    
    return `rgba(${r}, ${Math.round(g)}, ${Math.round(b)}, ${alpha})`;
  };

  // Helper function to create a lighter version of a color for backgrounds
  const getLighterColor = (color: string, opacity: number = 0.2) => {
    // Use getLightPastelShade for hex colors which properly maintains color hue
    if (color.startsWith('#')) {
      return getLightPastelShade(color, opacity);
    }
    
    // Fallback for non-hex colors
    return color;
  };
  
  // Render day cell in calendar
  const renderDay = (day: Date, index: number) => {
    const isSelectedDay = isSameDay(day, selectedDate);
    const isCurrentDay = isToday(day);
    
    // Check if the date is in the future compared to the real current date
    const today = new Date();
    const isFutureDay = day > today;
    
    // Use the actual day for data lookup instead of April 2024
    const progress = isFutureDay ? 0 : getDateProgress(day);
    const backgroundColor = getIntensityColor(progress);
    
    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.dayCell,
          { backgroundColor },
          isSelectedDay && { borderColor: colors.primary, borderWidth: 2 },
          isCurrentDay && { borderColor: '#FFD700', borderWidth: 2 },
          isFutureDay && { opacity: 0.5 }
        ]}
        disabled={isFutureDay}
        onPress={() => setSelectedDate(day)}
      >
        <Text 
          style={[
            styles.dayText, 
            { color: colors.text }
          ]}
        >
          {format(day, 'd')}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // Render habits list for selected date
  const renderSelectedDateHabits = () => {
    // Check if selected date is in the future
    const today = new Date();
    const isFutureDay = selectedDate > today;
    
    // Special message for future dates
    if (isFutureDay) {
      return (
        <View style={styles.emptyStateContainer}>
          <Feather name="clock" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            Future date - no activities yet
          </Text>
        </View>
      );
    }
    
    const activitiesForDate = getActivitiesForSelectedDate();
    
    if (activitiesForDate.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Feather name="calendar" size={48} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
            No activities on this day
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.habitsContainer}>
        {activitiesForDate.map((activity) => {
          const { habit, progress, isCompleted } = activity;
          const categoryColor = getHabitCategoryColor(habit);
          // Always use category color for background with consistent opacity, even for completed items
          const backgroundColor = getLighterColor(categoryColor, 0.15);
          
          return (
            <View 
              key={habit.id} 
              style={[
                styles.habitItem, 
                { backgroundColor, borderColor: getLighterColor(categoryColor, 0.3) }
              ]}
            >
              <View style={styles.habitItemLeft}>
                <View style={[
                  styles.habitIconContainer, 
                  { backgroundColor: 'white' }
                ]}>
                  <Feather 
                    name={(habit.icon || 'check') as any} 
                    size={22} 
                    color={categoryColor} 
                  />
                </View>
                <View>
                  <Text style={[styles.habitName, { color: colors.text }]}>
                    {habit.name}
                  </Text>
                  <View style={styles.habitDetails}>
                    {habit.time && (
                      <View style={styles.habitDetail}>
                        <Feather name="clock" size={14} color={colors.textSecondary} />
                        <Text style={[styles.habitDetailText, { color: colors.textSecondary }]}>
                          {formatTime(habit.time)}
                        </Text>
                      </View>
                    )}
                    {habit.duration && (
                      <View style={styles.habitDetail}>
                        <Feather name="clock" size={14} color={colors.textSecondary} />
                        <Text style={[styles.habitDetailText, { color: colors.textSecondary }]}>
                          {isCompleted ? habit.duration : Math.round((progress / 100) * habit.duration)} / {habit.duration} min
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
              {isCompleted ? (
                <View style={[
                  styles.completedBadge, 
                  { backgroundColor: categoryColor }
                ]}>
                  <Feather name="check" size={16} color="white" />
                </View>
              ) : (
                <View style={[
                  styles.progressBadge,
                  { backgroundColor: getLighterColor(categoryColor, 0.3) }
                ]}>
                  <Text style={[styles.progressText, { color: categoryColor }]}>{Math.round(progress)}%</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };
  
  // Get weekday labels
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Render progress stats for selected date
  const renderProgressStats = () => {
    // Check if selected date is in the future
    const today = new Date();
    const isFutureDay = selectedDate > today;
    
    // If future date, show empty stats
    if (isFutureDay) {
      return (
        <>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="check-square" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>Habits Completed</Text>
                <Text style={styles.statValue}>0/0</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="clock" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>Time Tracked</Text>
                <Text style={styles.statValue}>0 min</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="bar-chart-2" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>Overall Progress</Text>
                <Text style={styles.statValue}>0%</Text>
              </View>
            </View>
            
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Feather name="activity" size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.statLabel}>Activities</Text>
                <Text style={styles.statValue}>0</Text>
              </View>
            </View>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { width: '0%', backgroundColor: colors.primary }
                ]} 
              />
            </View>
          </View>
        </>
      );
    }
    
    // Use actual date for data lookup instead of April 2024
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const activitiesForDate = getActivitiesForSelectedDate();
    
    // Get all habits that should be available on this day
    const dayOfWeek = selectedDate.getDay(); // Use actual date for frequency
    const availableHabits = habits.filter(habit => {
      if (habit.frequency.type === 'daily') {
        return true;
      } else if (habit.frequency.type === 'weekly') {
        return dayOfWeek === 6; // Saturday
      } else if (habit.frequency.type === 'custom' && habit.frequency.custom_days) {
        return habit.frequency.custom_days.includes(dayOfWeek);
      }
      return false;
    });
    
    // Count completed habits
    const completedHabits = activitiesForDate.filter(activity => activity.isCompleted).length;
    
    // Calculate total time spent
    let totalTimeSpent = 0;
    activitiesForDate.forEach(activity => {
      if (activity.habit.duration) {
        if (activity.isCompleted) {
          totalTimeSpent += activity.habit.duration;
        } else {
          totalTimeSpent += Math.round((activity.progress / 100) * activity.habit.duration);
        }
      }
    });
    
    // Calculate overall progress percentage - use the actual date for data
    const progressPercentage = availableHabits.length > 0 
      ? Math.round((getDateProgress(selectedDate) + Number.EPSILON) * 100) / 100 
      : 0;
    
    return (
      <>
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Feather name="check-square" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statLabel}>Habits Completed</Text>
              <Text style={styles.statValue}>{completedHabits}/{availableHabits.length}</Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Feather name="clock" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statLabel}>Time Tracked</Text>
              <Text style={styles.statValue}>{totalTimeSpent} min</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statRow}>
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Feather name="bar-chart-2" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statLabel}>Overall Progress</Text>
              <Text style={styles.statValue}>{progressPercentage}%</Text>
            </View>
          </View>
          
          <View style={styles.statItem}>
            <View style={styles.statIconContainer}>
              <Feather name="activity" size={20} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.statLabel}>Activities</Text>
              <Text style={styles.statValue}>{activitiesForDate.length}</Text>
            </View>
          </View>
        </View>
        
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${progressPercentage}%`, backgroundColor: colors.primary }
              ]} 
            />
          </View>
        </View>
      </>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {/* Show the actual selected date (not April) */}
          {selectedDate > new Date() ? (
            // Show real date for future dates
            format(selectedDate, 'MMMM d, yyyy') + ' (Future)'
          ) : (
            // Show the real selected date month and day
            format(selectedDate, 'MMMM d, yyyy')
          )}
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Calendar Section */}
        <View style={[styles.calendarCard, { backgroundColor: colors.surface }]}>
          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={goToPreviousMonth}>
              <Feather name="chevron-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.monthTitle, { color: colors.text }]}>
              {format(currentMonth, 'MMMM yyyy')}
            </Text>
            <TouchableOpacity onPress={goToNextMonth}>
              <Feather 
                name="chevron-right" 
                size={24} 
                color={isSameMonth(addMonths(currentMonth, 1), new Date()) || addMonths(currentMonth, 1) < new Date() ? colors.text : colors.border} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Weekday Labels */}
          <View style={styles.weekdayLabels}>
            {weekdays.map((day, index) => (
              <Text key={index} style={[styles.weekdayLabel, { color: colors.textSecondary }]}>
                {day}
              </Text>
            ))}
          </View>
          
          {/* Calendar Grid */}
          <View style={styles.calendarGrid}>
            {/* Empty cells for days before the first day of month */}
            {Array.from({ length: daysInMonth[0]?.getDay() || 0 }).map((_, index) => (
              <View key={`empty-start-${index}`} style={styles.emptyCell} />
            ))}
            
            {/* Days of the month */}
            {daysInMonth.map((day, index) => renderDay(day, index))}
            
            {/* Empty cells for days after the last day of month */}
            {Array.from({ length: 6 - (daysInMonth[daysInMonth.length - 1]?.getDay() || 0) }).map((_, index) => (
              <View key={`empty-end-${index}`} style={styles.emptyCell} />
            ))}
          </View>
        </View>
        
        {/* Progress Summary Section */}
        <View style={[styles.progressCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 16 }]}>
            Progress
          </Text>
          
          {/* Progress Stats */}
          <View style={styles.statsContainer}>
            {renderProgressStats()}
          </View>
        </View>
        
        {/* Logs Section - Renamed from "Selected Day Details" */}
        <View style={[styles.logsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Logs
          </Text>
          
          {/* Activity List */}
          {renderSelectedDateHabits()}
        </View>
        
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60, // Increased top padding
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  calendarCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  logsCard: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekdayLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  weekdayLabel: {
    width: 40,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 40,
    height: 40,
    margin: 2,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCell: {
    width: 40,
    height: 40,
    margin: 2,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
  },
  habitsContainer: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  habitItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  habitIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  habitDetails: {
    flexDirection: 'row',
  },
  habitDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  habitDetailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  completedBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  statsContainer: {
    width: '100%',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#718096',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginTop: 8,
    width: '100%',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
}); 