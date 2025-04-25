import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { metrics } from '@/constants/metrics';
import { Feather } from '@expo/vector-icons';
import { format, isSameMonth, isToday } from 'date-fns';
import { Habit } from '@/types/habit';

type CalendarViewProps = {
  habit: Habit;
  onSelectDate: (date: string) => void;
  // Optional props to control month externally
  year?: number;
  month?: number;
};

export const CalendarView = ({ 
  habit, 
  onSelectDate,
  year,
  month
}: CalendarViewProps) => {
  const { colors } = useTheme();
  const { getHabitCompletionStatus, categories } = useHabits();
  
  // If external year/month are provided, use them; otherwise use current date
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (year && month && Number.isFinite(year) && Number.isFinite(month) && month >= 1 && month <= 12) {
      return new Date(year, month - 1); // month is 0-indexed in JS Date
    }
    return new Date();
  });
  
  // Update currentMonth when props change
  useEffect(() => {
    if (year && month && Number.isFinite(year) && Number.isFinite(month) && month >= 1 && month <= 12) {
      setCurrentMonth(new Date(year, month - 1));
    }
  }, [year, month]);
  
  // Get category color
  const category = categories.find(cat => cat.id === habit.category);
  const categoryColor = category 
    ? colors.categories[category.color as keyof typeof colors.categories] 
    : colors.primary;
  
  // Day names for the header
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Generate calendar grid manually
  const renderCalendarDays = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    // Find the first day to display (might be from previous month)
    // Find the Sunday before or on the first day of the month
    const startDay = new Date(monthStart);
    while (startDay.getDay() !== 0) {
      startDay.setDate(startDay.getDate() - 1);
    }
    
    // Array to hold our weeks
    const weeks = [];
    
    // Current day we're tracking
    let currentDay = new Date(startDay);
    
    // Generate enough weeks to include the entire month plus padding
    // This ensures we have complete weeks
    while (currentDay <= monthEnd || currentDay.getDay() !== 0) {
      // Create a week
      const week = [];
      
      // Add 7 days to the week (Sun-Sat)
      for (let i = 0; i < 7; i++) {
        const day = new Date(currentDay);
        week.push(day);
        currentDay.setDate(currentDay.getDate() + 1);
      }
      
      weeks.push(week);
    }
    
    return (
      <>
        {weeks.map((week, weekIndex) => (
          <View key={`week-${weekIndex}`} style={styles.calendarRow}>
            {week.map(day => {
              const dateString = format(day, 'yyyy-MM-dd');
              const isCompleted = getHabitCompletionStatus(habit.id, dateString);
              const isCurrentDay = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              
              return (
                <TouchableOpacity
                  key={dateString}
                  style={styles.dayCell}
                  onPress={() => onSelectDate(dateString)}
                >
                  <View
                    style={[
                      styles.dayContent,
                      isCurrentDay && { borderColor: colors.primary, borderWidth: 1 },
                      isCompleted && { backgroundColor: `${categoryColor}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        { color: isCurrentMonth ? colors.text : colors.textSecondary },
                        isCurrentDay && { fontWeight: 'bold' },
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                    {isCompleted && (
                      <View style={[styles.completedDot, { backgroundColor: categoryColor }]} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Day Names */}
      <View style={styles.dayNamesContainer}>
        {dayNames.map(day => (
          <Text key={day} style={[styles.dayName, { color: colors.textSecondary }]}>
            {day}
          </Text>
        ))}
      </View>
      
      {/* Calendar Grid */}
      <View style={styles.calendarGrid}>
        {renderCalendarDays()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: metrics.spacing.m,
  },
  dayNamesContainer: {
    flexDirection: 'row',
    marginBottom: metrics.spacing.s,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: metrics.fontSize.s,
    fontWeight: '500',
  },
  calendarGrid: {
    flexDirection: 'column',
  },
  calendarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    padding: 2,
  },
  dayContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: metrics.borderRadius.small,
  },
  dayText: {
    fontSize: metrics.fontSize.s,
  },
  completedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 2,
  },
}); 