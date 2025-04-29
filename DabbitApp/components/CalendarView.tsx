import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { metrics } from '@/constants/metrics';
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
  
  // Find the category color for habit
  const category = categories.find(cat => cat.id === habit.category);
  const categoryColorStr = category 
    ? colors.categories[category.color as keyof typeof colors.categories] as string
    : colors.primary as string;
  
  // Set up the calendar month, defaulting to current month if not provided
  const [currentMonth, setCurrentMonth] = useState(
    new Date(year || new Date().getFullYear(), (month || new Date().getMonth()) - 1, 1)
  );
  
  // Update when external month/year changes
  useEffect(() => {
    if (year && month) {
      setCurrentMonth(new Date(year, month - 1, 1));
    }
  }, [year, month]);
  
  // Calculate days to display in calendar
  const renderCalendarDays = () => {
    const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    
    // Month starts on day X, we need to add padding days
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDay = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Calculate how many days in month to display
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    
    // Create day grid
    let days = [];
    let week = [];
    
    // Create day name header
    const dayNamesRow = (
      <View style={styles.dayNamesContainer}>
        {dayNames.map((name, index) => (
          <Text 
            key={`day-name-${index}`} 
            style={[styles.dayName, { color: colors.textSecondary }]}
          >
            {name}
          </Text>
        ))}
      </View>
    );
    
    // Add empty cells for start padding
    for (let i = 0; i < startDay; i++) {
      week.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), -startDay + i + 1));
    }
    
    // Add month days
    for (let day = 1; day <= daysInMonth; day++) {
      week.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
      
      if (week.length === 7) {
        days.push(week);
        week = [];
      }
    }
    
    // Add empty cells for end padding to complete the last week
    if (week.length > 0) {
      const nextMonthDays = 7 - week.length;
      for (let i = 1; i <= nextMonthDays; i++) {
        week.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, i));
      }
      days.push(week);
    }
    
    return (
      <>
        {days.map((week, weekIndex) => (
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
                  <View style={{
                    flex: 1,
                    justifyContent: 'center' as 'center',
                    alignItems: 'center' as 'center',
                    borderRadius: metrics.borderRadius.small,
                    backgroundColor: isCompleted ? categoryColorStr : undefined,
                    borderWidth: isCurrentDay || isCompleted ? 1 : 0,
                    borderColor: isCompleted 
                      ? categoryColorStr 
                      : (isCurrentDay ? colors.calendarHighlight as string : undefined)
                  }}>
                    <Text style={{
                      fontSize: metrics.fontSize.s,
                      fontWeight: isCurrentDay ? 'bold' : 'normal',
                      color: isCompleted 
                        ? '#FFFFFF' 
                        : (isCurrentMonth ? colors.text : colors.textSecondary)
                    }}>
                      {day.getDate()}
                    </Text>
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
    <View style={{ 
      padding: metrics.spacing.m,
      backgroundColor: colors.surface
    }}>
      <View style={styles.calendarGrid}>
        {renderCalendarDays()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
}); 