import React from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity,
  ViewStyle,
  ColorValue
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { 
  format, 
  addDays, 
  startOfMonth, 
  endOfMonth, 
  getDay, 
  isToday,
  isBefore
} from 'date-fns';
import { Habit } from '@/types/habit';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type ModernCalendarViewProps = {
  year: number;
  month: number; // 1-based
  habit?: Habit;
  completedDates: Set<string>;
  onSelectDate?: (date: string) => void;
  style?: ViewStyle;
};

export const ModernCalendarView = ({
  year,
  month,
  habit,
  completedDates,
  onSelectDate,
  style,
}: ModernCalendarViewProps) => {
  const { colors } = useTheme();
  
  // Calculate the first day of the month
  const firstDay = startOfMonth(new Date(year, month - 1));
  
  // Calculate the last day of the month
  const lastDay = endOfMonth(firstDay);
  
  // Calculate the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = getDay(firstDay);
  
  // Get days of the week for header row
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Create a calendar grid with days
  const calendarGrid: Array<Array<Date | null>> = [];
  let currentDay = firstDay;
  let week: Array<Date | null> = Array(firstDayOfWeek).fill(null);
  
  // Fill days until the end of the month
  while (currentDay <= lastDay) {
    week.push(currentDay);
    
    if (week.length === 7) {
      calendarGrid.push(week);
      week = [];
    }
    
    currentDay = addDays(currentDay, 1);
  }
  
  // Fill remaining days in the last week
  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    calendarGrid.push(week);
  }

  // Determine if a date is a completed habit
  const isCompletedDate = (date: Date | null) => {
    if (!date || !completedDates) return false;
    const dateString = format(date, 'yyyy-MM-dd');
    return completedDates.has(dateString);
  };

  // Handle date selection
  const handleDateSelection = (date: Date | null) => {
    if (!date || isBefore(date, new Date()) === false) return;
    if (onSelectDate) {
      onSelectDate(format(date, 'yyyy-MM-dd'));
    }
  };

  // Get the category color for habit or fallback to primary gradient
  const getCategoryGradient = (): string[] => {
    if (!habit?.category) return colors.primaryGradient as string[];
    
    const categoryName = habit.category as string;
    const gradientKey = `${categoryName}Gradient` as keyof typeof colors.categories;
    
    // If there's a gradient available for this category, use it
    if (colors.categories[gradientKey]) {
      return colors.categories[gradientKey] as string[];
    }
    
    // Fallback to the category color as a solid gradient
    const categoryColor = colors.categories[categoryName as keyof typeof colors.categories] as string;
    return [categoryColor, categoryColor];
  };

  const categoryGradient = getCategoryGradient();

  // Render a single day cell
  const renderDayCell = (day: Date | null, index: number) => {
    if (!day) {
      return <View key={index} style={styles.emptyCell} />;
    }
    
    const isCompleted = isCompletedDate(day);
    const isTodayDate = isToday(day);
    const isPastDate = isBefore(day, new Date());
    const dateNumber = format(day, 'd');
    
    // Determine cell style based on state
    const borderStyle = isTodayDate ? 
      { borderColor: colors.calendarHighlight as string, borderWidth: 1 } : 
      { borderColor: 'transparent', borderWidth: 1 };
      
    // Text opacity for future dates
    const textOpacity = !isPastDate ? 0.5 : 1;
    
    return (
      <TouchableOpacity
        key={index}
        style={[styles.dayCell, borderStyle]}
        onPress={() => handleDateSelection(day)}
        disabled={!isPastDate}
        activeOpacity={0.7}
      >
        {isCompleted ? (
          // Completed day with gradient
          <LinearGradient
            colors={categoryGradient as [string, string, ...string[]]}
            style={styles.dayCellInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text
              style={[
                styles.dayText,
                { color: '#FFFFFF', fontWeight: 'bold' }
              ]}
            >
              {dateNumber}
            </Text>
            
            <View style={styles.checkIcon}>
              <Feather name="check" size={10} color="#FFFFFF" />
            </View>
          </LinearGradient>
        ) : (
          // Regular day
          <View 
            style={[
              styles.dayCellInner,
              { opacity: textOpacity }
            ]}
          >
            <Text
              style={[
                styles.dayText,
                {
                  color: isPastDate ? colors.text : colors.textSecondary,
                  fontWeight: isTodayDate ? 'bold' : '500'
                }
              ]}
            >
              {dateNumber}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Calendar header with days of week */}
      <View style={styles.header}>
        {daysOfWeek.map((day, index) => (
          <View key={index} style={styles.dayHeader}>
            <Text style={[styles.dayHeaderText, { color: colors.textSecondary }]}>
              {day}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Calendar grid */}
      {calendarGrid.map((week, weekIndex) => (
        <View key={weekIndex} style={styles.weekRow}>
          {week.map(renderDayCell)}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: metrics.spacing.m,
  },
  header: {
    flexDirection: 'row',
    marginBottom: metrics.spacing.s,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: metrics.spacing.xs,
  },
  dayHeaderText: {
    fontSize: metrics.fontSize.xs,
    fontWeight: '500',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: metrics.spacing.s,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    padding: 1,
    borderRadius: metrics.borderRadius.medium,
    overflow: 'hidden',
  },
  dayCellInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: metrics.borderRadius.small,
  },
  emptyCell: {
    flex: 1,
  },
  dayText: {
    fontSize: metrics.fontSize.s,
  },
  checkIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
  },
}); 