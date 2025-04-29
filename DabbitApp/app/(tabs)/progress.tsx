import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { HabitForm } from '@/components/HabitForm';
import { metrics } from '@/constants/metrics';
import { Feather } from '@expo/vector-icons';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addMonths, subMonths } from 'date-fns';
import { Habit } from '@/types/habit';
import { WeeklyProgressSummary } from '@/components/WeeklyProgressSummary';
import { CategoryProgressSummary } from '@/components/CategoryProgressSummary';
import { HabitCalendarSummary } from '@/components/HabitCalendarSummary';
import { CyclingCard } from '@/components/CyclingCard';

export default function ProgressScreen() {
  const { colors } = useTheme();
  const { 
    habits, 
    toggleHabitCompletion, 
    getHabitCompletionStatus, 
    categories, 
    deleteHabit 
  } = useHabits();
  
  // Modal state for editing habits
  const [showModal, setShowModal] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  
  // Filter out archived habits
  const activeHabits = useMemo(() => {
    return habits.filter(habit => !habit.archived);
  }, [habits]);
  
  // Currently selected habit for displaying calendar
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  
  // Set initial selected habit when habits load
  useEffect(() => {
    if (activeHabits.length > 0 && !selectedHabit) {
      setSelectedHabit(activeHabits[0]);
    }
  }, [activeHabits, selectedHabit]);
  
  // Weekly completion statistics
  const [weeklyCompletions, setWeeklyCompletions] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  
  // Category progress statistics
  const [categoryProgress, setCategoryProgress] = useState<Array<{ category: any; progress: number; habitCount: number }>>([]);
  
  // Format habits for dropdown - memoized to prevent recreating on each render
  const habitItems = useMemo(() => {
    return activeHabits.map(habit => {
      const category = habit.category 
        ? categories.find(cat => cat.id === habit.category) 
        : null;
        
      return {
        id: habit.id,
        label: habit.name,
        color: category?.color,
      };
    });
  }, [activeHabits, categories]);
  
  // Calculate weekly completions - memoized to prevent recalculating on each render
  const calculateWeeklyCompletions = useCallback(() => {
    const today = new Date();
    const startDay = startOfWeek(today, { weekStartsOn: 0 }); // 0 = Sunday
    const endDay = endOfWeek(today, { weekStartsOn: 0 });
    const daysInWeek = eachDayOfInterval({ start: startDay, end: endDay });
    
    // Calculate total possible completions for the week
    let totalPossible = 0;
    let completed = 0;
    
    daysInWeek.forEach(day => {
      const dateString = format(day, 'yyyy-MM-dd');
      
      activeHabits.forEach(habit => {
        // Skip one-time habits for analytics
        if (habit.frequency.type === 'one-time') return;
        
        // Check if the habit should be completed on this day based on frequency
        let shouldTrack = false;
        
        if (habit.frequency.type === 'daily') {
          shouldTrack = true;
        } else if (habit.frequency.type === 'weekly') {
          // Weekly means once per week, so only count Sunday
          shouldTrack = day.getDay() === 0;
        } else if (habit.frequency.type === 'custom' && habit.frequency.custom_days) {
          // Custom days, check if current day is in the custom days
          shouldTrack = habit.frequency.custom_days.includes(day.getDay());
        }
        
        if (shouldTrack) {
          totalPossible++;
          
          if (getHabitCompletionStatus(habit.id, dateString)) {
            completed++;
          }
        }
      });
    });
    
    return { completed, total: totalPossible };
  }, [activeHabits, getHabitCompletionStatus]);
  
  // Calculate category progress - memoized to prevent recalculating on each render
  const calculateCategoryProgress = useCallback(() => {
    const categoryStats = new Map();
    
    // Initialize with all categories that have habits
    categories.forEach(category => {
      // Exclude one-time habits from analytics
      const habitsInCategory = activeHabits.filter(h => h.category === category.id && h.frequency.type !== 'one-time');
      
      if (habitsInCategory.length > 0) {
        categoryStats.set(category.id, {
          category,
          completedCount: 0,
          possibleCount: 0,
          habitCount: habitsInCategory.length,
        });
      }
    });
    
    // Calculate completion rate for last 30 days per category
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateString = format(date, 'yyyy-MM-dd');
      
      activeHabits.forEach(habit => {
        // Skip one-time habits for analytics
        if (habit.frequency.type === 'one-time') return;
        
        const categoryId = habit.category;
        const categoryData = categoryStats.get(categoryId);
        
        if (categoryData) {
          // Only count if habit should be tracked on this day
          let shouldTrack = false;
          const dayOfWeek = date.getDay();
          
          if (habit.frequency.type === 'daily') {
            shouldTrack = true;
          } else if (habit.frequency.type === 'weekly') {
            // Weekly means once per week, so only count Sunday
            shouldTrack = dayOfWeek === 0;
          } else if (habit.frequency.type === 'custom' && habit.frequency.custom_days) {
            // Custom days, check if current day is in the custom days
            shouldTrack = habit.frequency.custom_days.includes(dayOfWeek);
          }
          
          if (shouldTrack) {
            categoryData.possibleCount++;
            
            if (getHabitCompletionStatus(habit.id, dateString)) {
              categoryData.completedCount++;
            }
          }
          
          categoryStats.set(categoryId, categoryData);
        }
      });
    }
    
    // Convert to percentage and format for display
    return Array.from(categoryStats.values()).map(stats => ({
      category: stats.category,
      progress: stats.possibleCount > 0 
        ? Math.round((stats.completedCount / stats.possibleCount) * 100) 
        : 0,
      habitCount: stats.habitCount,
    }));
  }, [activeHabits, categories, getHabitCompletionStatus]);
  
  // Use a separate effect to update state from the memoized calculations
  useEffect(() => {
    // Only calculate when we have active habits
    if (activeHabits.length > 0) {
      setWeeklyCompletions(calculateWeeklyCompletions());
      setCategoryProgress(calculateCategoryProgress());
    }
  }, [calculateWeeklyCompletions, calculateCategoryProgress, activeHabits.length]);
  
  const handleSelectHabit = (habit: Habit) => {
    setSelectedHabit(habit);
  };
  
  const handleHabitIdSelect = (habitId: string | undefined) => {
    if (habitId) {
      const habit = activeHabits.find(h => h.id === habitId);
      if (habit) {
        setSelectedHabit(habit);
      }
    }
  };
  
  const handleEditHabit = (habit: Habit) => {
    setHabitToEdit(habit);
    setShowModal(true);
  };
  
  const handleDeleteHabit = (habit: Habit) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteHabit(habit.id);
              // If the deleted habit was selected, select another one if available
              if (selectedHabit && selectedHabit.id === habit.id) {
                const remainingHabits = activeHabits.filter(h => h.id !== habit.id);
                setSelectedHabit(remainingHabits.length > 0 ? remainingHabits[0] : null);
              }
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete the habit.');
            }
          },
        },
      ]
    );
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setHabitToEdit(null);
  };
  
  const handleDateSelect = (date: string) => {
    if (selectedHabit) {
      toggleHabitCompletion(selectedHabit.id, date);
    }
  };
  
  // Calendar month state
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1); // 1-indexed for the component
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  
  // Handle month navigation
  const handlePrevMonth = () => {
    if (calendarMonth === 1) {
      setCalendarMonth(12);
      setCalendarYear(prevYear => prevYear - 1);
    } else {
      setCalendarMonth(prevMonth => prevMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    // Only allow navigating to future months up to current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 1-indexed
    const currentYear = currentDate.getFullYear();
    
    // Don't allow going into the future beyond current month
    if (
      (calendarYear < currentYear) || 
      (calendarYear === currentYear && calendarMonth < currentMonth)
    ) {
      if (calendarMonth === 12) {
        setCalendarMonth(1);
        setCalendarYear(prevYear => prevYear + 1);
      } else {
        setCalendarMonth(prevMonth => prevMonth + 1);
      }
    }
  };
  
  if (activeHabits.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Progress" />
        <EmptyState
          title="No habits to track"
          message="Add habits on the home screen to start tracking your progress."
          icon="bar-chart-2"
        />
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Progress" />
      
      <View style={styles.content}>
        {/* Progress Modules */}
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Weekly Progress Summary */}
          <WeeklyProgressSummary 
            completedCount={weeklyCompletions.completed}
            totalCount={weeklyCompletions.total}
          />
          
          {/* Add Cycling Card */}
          <CyclingCard 
            onStartCycling={() => Alert.alert('Ready for cycling!', 'Your cycling session is about to begin.')}
          />
          
          {/* Category Progress Summary */}
          <CategoryProgressSummary
            categoryProgress={categoryProgress}
          />
          
          {/* Habit Calendar */}
          {selectedHabit && (
            <HabitCalendarSummary
              habit={selectedHabit}
              onSelectDate={handleDateSelect}
              onSelectHabit={handleHabitIdSelect}
              habitItems={habitItems}
              onPrevMonth={handlePrevMonth}
              onNextMonth={handleNextMonth}
              year={calendarYear}
              month={calendarMonth}
            />
          )}
          
          {/* Space at bottom for better scrolling */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
      
      {/* Edit Habit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View 
            style={[
              styles.modalContent, 
              { 
                backgroundColor: colors.background,
                ...Platform.select({
                  ios: {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                  },
                  android: {
                    elevation: 5,
                  },
                }),
              }
            ]}
          >
            <HabitForm
              habit={habitToEdit}
              onClose={handleCloseModal}
              onSave={handleCloseModal}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  scrollContainer: {
    flex: 1,
  },
  bottomPadding: {
    height: metrics.spacing.xxl,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: metrics.borderRadius.large,
    borderTopRightRadius: metrics.borderRadius.large,
    height: '90%',
  },
}); 