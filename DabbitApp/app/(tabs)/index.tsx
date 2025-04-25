import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, Modal, SafeAreaView, Platform, Alert } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { Header } from '@/components/Header';
import { HabitItem, getTimeBucketEmoji, getCurrentTimeBucket } from '@/components/HabitItem';
import { EmptyState } from '@/components/EmptyState';
import { HabitForm } from '@/components/HabitForm';
import { format } from 'date-fns';
import { metrics } from '@/constants/metrics';
import { Habit } from '@/types/habit';
import { Text } from '@/components/Themed';
import FloatingActionButton from '@/components/FloatingActionButton';
import ProgressGreeting from '@/components/ProgressGreeting';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BucketType } from '@/components/BucketSelector';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { habits, toggleHabitCompletion, deleteHabit, username, getDailyProgress } = useHabits();
  const insets = useSafeAreaInsets();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  
  // Time bucket filter
  const [selectedBucket, setSelectedBucket] = useState<BucketType>('All');
  
  // Set default bucket to current time on initial load
  useEffect(() => {
    const currentBucket = getCurrentTimeBucket();
    if (currentBucket) {
      setSelectedBucket(currentBucket as BucketType);
    }
  }, []);
  
  const today = new Date();
  const todayFormatted = format(today, 'yyyy-MM-dd');
  
  // Filter out archived habits
  const activeHabits = habits.filter(habit => !habit.archived);
  
  // Filter habits by time bucket if needed
  const filteredHabits = selectedBucket === 'All' 
    ? activeHabits 
    : activeHabits.filter(habit => {
        const bucket = getTimeBucketEmoji(habit.time);
        return bucket && bucket.label === selectedBucket;
      });
  
  const handleAddHabit = () => {
    setSelectedHabit(null);
    setShowModal(true);
  };
  
  const handleEditHabit = (habit: Habit) => {
    setSelectedHabit(habit);
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
            } catch (error) {
              console.error('Error deleting habit:', error);
              Alert.alert('Error', 'Failed to delete the habit.');
            }
          },
        },
      ]
    );
  };
  
  const handleCompletionToggle = (habitId: string) => {
    toggleHabitCompletion(habitId, todayFormatted);
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHabit(null);
  };
  
  // Calculate remaining hours in the day
  const calculateTimeLeft = () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const diffInMillis = endOfDay.getTime() - now.getTime();
    const diffInHours = Math.floor(diffInMillis / (1000 * 60 * 60));
    return diffInHours;
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: insets.top + 12 }}>
        <ProgressGreeting 
          username={username}
          completionPercentage={getDailyProgress()}
          timeLeft={calculateTimeLeft()}
          date={today}
        />
      </View>
      
      <Header
        title="Today's Habits"
        showBucketSelector={true}
        selectedBucket={selectedBucket}
        onSelectBucket={setSelectedBucket}
      />
      
      {activeHabits.length === 0 ? (
        <EmptyState
          title="No habits yet!"
          message="Start tracking your habits by adding your first one."
          action={{
            label: 'Add Habit',
            onPress: handleAddHabit,
          }}
        />
      ) : filteredHabits.length === 0 ? (
        <EmptyState
          title={`No ${selectedBucket} habits`}
          message={`You don't have any habits scheduled for ${selectedBucket.toLowerCase()}.`}
          icon="clock"
          action={{
            label: 'Show All Habits',
            onPress: () => setSelectedBucket('All'),
          }}
        />
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.habitsContainer}>
            {filteredHabits.map(habit => (
              <HabitItem
                key={habit.id}
                habit={habit}
                date={todayFormatted}
                onPress={handleCompletionToggle}
                onEdit={handleEditHabit}
                onDelete={handleDeleteHabit}
              />
            ))}
          </View>
        </ScrollView>
      )}
      
      <FloatingActionButton onPress={handleAddHabit} />
      
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
              habit={selectedHabit}
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
  scrollView: {
    flex: 1,
  },
  habitsContainer: {
    padding: metrics.spacing.l,
    paddingTop: metrics.spacing.s,
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
