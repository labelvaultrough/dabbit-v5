import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, ScrollView, Modal, SafeAreaView, Platform, TouchableOpacity, FlatList } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { Feather } from '@expo/vector-icons';
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

// Header component specific to the home screen
const Header = ({ 
  title, 
  selectedBucket, 
  onSelectBucket 
}: { 
  title: string; 
  selectedBucket: BucketType; 
  onSelectBucket: (bucket: BucketType) => void;
}) => {
  const { colors } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const bucketOptions: BucketType[] = ['All', 'Morning', 'Afternoon', 'Evening', 'Night'];
  
  // Get color for each bucket option
  const getBucketColor = (bucket: BucketType) => {
    switch(bucket) {
      case 'Morning': return '#FF9F1C'; // Orange
      case 'Afternoon': return '#3498DB'; // Blue
      case 'Evening': return '#9B59B6'; // Purple
      case 'Night': return '#34495E'; // Dark Blue
      default: return '#FF9F1C'; // Default orange
    }
  };
  
  // Get icon for each bucket option
  const getBucketIcon = (bucket: BucketType) => {
    switch(bucket) {
      case 'Morning': return 'sunrise';
      case 'Afternoon': return 'sun';
      case 'Evening': return 'sunset';
      case 'Night': return 'moon';
      default: return 'list';
    }
  };
  
  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>{title}</Text>
      
      <View style={styles.bucketSelector}>
        <TouchableOpacity 
          style={[styles.bucketButton, { backgroundColor: colors.surface }]}
          onPress={() => setShowDropdown(!showDropdown)}
          activeOpacity={0.7}
        >
          <Feather 
            name={getBucketIcon(selectedBucket)} 
            size={20} 
            color={getBucketColor(selectedBucket)} 
            style={styles.bucketIcon} 
          />
          <Text style={styles.bucketText}>{selectedBucket}</Text>
          <Feather name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color={colors.text} />
        </TouchableOpacity>
        
        {/* Dropdown menu */}
        {showDropdown && (
          <View style={[styles.dropdownContainer, { backgroundColor: colors.surface }]}>
            {bucketOptions.map((bucket) => (
              <TouchableOpacity
                key={bucket}
                style={[
                  styles.dropdownItem,
                  selectedBucket === bucket && { backgroundColor: colors.background }
                ]}
                onPress={() => {
                  onSelectBucket(bucket);
                  setShowDropdown(false);
                }}
              >
                <Feather 
                  name={getBucketIcon(bucket)} 
                  size={18} 
                  color={getBucketColor(bucket)} 
                  style={styles.dropdownIcon} 
                />
                <Text style={styles.dropdownText}>{bucket}</Text>
                {selectedBucket === bucket && (
                  <Feather name="check" size={18} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const { colors } = useTheme();
  const { 
    habits, 
    toggleHabitCompletion, 
    deleteHabit, 
    username, 
    getDailyProgress, 
    getHabitCompletionStatus 
  } = useHabits();
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
    
  // Sort habits by completion status (incomplete first, then completed)
  filteredHabits.sort((a, b) => {
    const aCompleted = getHabitCompletionStatus(a.id, todayFormatted);
    const bCompleted = getHabitCompletionStatus(b.id, todayFormatted);
    
    // Sort by completion status (non-completed first)
    if (aCompleted && !bCompleted) return 1;
    if (!aCompleted && bCompleted) return -1;
    
    // For habits with equal completion status, sort by time
    if (a.time && b.time) {
      return a.time.localeCompare(b.time);
    }
    
    return 0;
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
    // Simple confirmation
    if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      deleteHabit(habit.id);
    }
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
      <View style={{ paddingTop: insets.top }}>
        <ProgressGreeting 
          username={username}
          completionPercentage={getDailyProgress()}
          timeLeft={calculateTimeLeft()}
          date={today}
        />
        
        <Header
          title="Today's Habits"
          selectedBucket={selectedBucket}
          onSelectBucket={setSelectedBucket}
        />
      </View>
      
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
          <View style={{ height: 80 }} />
        </ScrollView>
      )}
      
      <FloatingActionButton onPress={handleAddHabit} />
      
      {showModal && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }}>
          <View style={{
            width: 320,
            maxHeight: 600,
            backgroundColor: 'white',
            borderRadius: 16,
          }}>
            <HabitForm
              habit={selectedHabit}
              onClose={handleCloseModal}
              onSave={handleCloseModal}
            />
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  bucketSelector: {
    position: 'relative',
  },
  bucketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bucketIcon: {
    marginRight: 6,
  },
  bucketText: {
    fontSize: 16,
    marginRight: 6,
  },
  dropdownContainer: {
    position: 'absolute',
    top: 45,
    right: 0,
    width: 180,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownIcon: {
    marginRight: 10,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  scrollView: {
    flex: 1,
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  floatingModal: {
    width: 320,
    maxHeight: 600,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
