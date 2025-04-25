import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { metrics } from '@/constants/metrics';
import { ProgressCard } from './ProgressCard';
import { CalendarView } from './CalendarView';
import { Dropdown } from './Dropdown';
import { Habit } from '@/types/habit';
import { Ionicons } from '@expo/vector-icons';
import { format, isAfter, startOfMonth } from 'date-fns';

type HabitCalendarSummaryProps = {
  habit: Habit;
  onSelectDate: (date: string) => void;
  onSelectHabit: (habitId: string | undefined) => void;
  habitItems: Array<{ id: string; label: string; color?: string }>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  year: number;
  month: number;
};

export const HabitCalendarSummary = ({ 
  habit, 
  onSelectDate, 
  onSelectHabit,
  habitItems,
  onPrevMonth,
  onNextMonth,
  year,
  month
}: HabitCalendarSummaryProps) => {
  const { colors } = useTheme();
  const { getHabitStreak, getCompletionRate } = useHabits();

  const streakCount = getHabitStreak(habit.id);
  const completionRate = getCompletionRate(habit.id);

  // Get the category color for the border
  const category = useHabits().categories.find(cat => cat.id === habit.category);
  const categoryColor = category 
    ? colors.categories[category.color as keyof typeof colors.categories] 
    : colors.primary;

  // Validate year and month to prevent invalid date errors
  const validYear = Number.isFinite(year) ? year : new Date().getFullYear();
  const validMonth = Number.isFinite(month) && month >= 1 && month <= 12 
    ? month - 1 // JavaScript months are 0-indexed
    : new Date().getMonth();

  // Create current date for comparison
  const currentDate = new Date();
  const selectedDate = new Date(validYear, validMonth, 1);
  
  // Check if selected month is in the future
  const isNextMonthDisabled = isAfter(
    startOfMonth(selectedDate), 
    startOfMonth(currentDate)
  );
  
  // Format month name safely
  const monthName = (() => {
    try {
      return format(selectedDate, 'MMMM yyyy');
    } catch (error) {
      console.warn('Invalid date values:', { year, month, error });
      return format(new Date(), 'MMMM yyyy'); // Fallback to current date
    }
  })();

  return (
    <ProgressCard title="Habit Calendar">
      {/* Compact habit selector */}
      <View style={[styles.titleContainer, { borderColor: `${categoryColor}30` }]}>
        <Text style={[styles.habitTitlePrefix, { color: colors.textSecondary }]}>
          Tracking:
        </Text>
        <View style={styles.dropdownContainer}>
          <Dropdown
            label=""
            items={habitItems}
            selectedItemId={habit?.id}
            onSelect={onSelectHabit}
            placeholder="Select habit"
            compact={true}
          />
        </View>
      </View>
      
      {/* Stats summary */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {streakCount > 0 ? `🔥 × ${streakCount}` : '0'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Current Streak
          </Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>
            {completionRate}%
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]} numberOfLines={1}>
            Completion
          </Text>
        </View>
      </View>
      
      {/* Month switcher */}
      <View style={styles.monthSwitcherContainer}>
        <TouchableOpacity 
          style={styles.arrowButton} 
          onPress={onPrevMonth}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.monthText, { color: colors.text }]}>
          {monthName}
        </Text>
        
        <TouchableOpacity 
          style={[
            styles.arrowButton,
            isNextMonthDisabled && styles.disabledButton
          ]} 
          onPress={isNextMonthDisabled ? undefined : onNextMonth}
          disabled={isNextMonthDisabled}
        >
          <Ionicons 
            name="chevron-forward" 
            size={24} 
            color={isNextMonthDisabled ? colors.textSecondary : colors.text} 
          />
        </TouchableOpacity>
      </View>
      
      <CalendarView 
        habit={habit} 
        onSelectDate={onSelectDate} 
        year={validYear}
        month={validMonth + 1}
      />
    </ProgressCard>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.spacing.m,
    padding: metrics.spacing.m,
    paddingVertical: metrics.spacing.s,
    borderRadius: metrics.borderRadius.medium,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  habitTitlePrefix: {
    fontSize: metrics.fontSize.m,
    marginRight: metrics.spacing.s,
    fontWeight: '500',
    marginTop: -5,
  },
  dropdownContainer: {
    marginBottom: 0,
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: metrics.spacing.l,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    padding: metrics.spacing.m,
    borderRadius: metrics.borderRadius.medium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  statValue: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: metrics.spacing.s,
    textAlign: 'center',
  },
  statLabel: {
    fontSize: metrics.fontSize.xs,
    textAlign: 'center',
  },
  monthSwitcherContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: metrics.spacing.m,
  },
  monthText: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
    minWidth: 160,
    textAlign: 'center',
  },
  arrowButton: {
    padding: metrics.spacing.xs,
    borderRadius: metrics.borderRadius.small,
  },
  disabledButton: {
    opacity: 0.5,
  },
}); 