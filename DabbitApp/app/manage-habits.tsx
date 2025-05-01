import React, { useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, Alert, SafeAreaView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { Feather } from '@expo/vector-icons';
import { metrics } from '@/constants/metrics';
import { Header } from '@/components/Header';
import { HabitForm } from '@/components/HabitForm';
import { Stack, useRouter } from 'expo-router';
import { Habit } from '@/types/habit';

export default function ManageHabitsScreen() {
  const { colors } = useTheme();
  const { habits, getHabitStreak, deleteHabit, categories } = useHabits();
  const router = useRouter();
  
  const [showModal, setShowModal] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);
  
  const handleEdit = (habit: Habit) => {
    setHabitToEdit(habit);
    setShowModal(true);
  };
  
  const handleDelete = (habit: Habit) => {
    Alert.alert(
      'Delete Habit',
      `Are you sure you want to delete "${habit.name}"? This will remove all history and progress for this habit.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            await deleteHabit(habit.id);
          }
        }
      ]
    );
  };
  
  const handleCloseModal = () => {
    setShowModal(false);
    setHabitToEdit(null);
  };
  
  // Render each habit item with edit and delete options
  const renderHabitItem = ({ item }: { item: Habit }) => {
    const streak = getHabitStreak(item.id);
    const category = categories.find(cat => cat.id === item.category);
    const categoryColor = category 
      ? colors.categories[category.color as keyof typeof colors.categories] 
      : colors.primary;
    
    // Ensure we're working with a string
    const categoryColorStr = typeof categoryColor === 'string' ? categoryColor : colors.primary;
    
    return (
      <View style={[styles.habitItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.habitInfo}>
          {item.icon ? (
            <View style={[styles.iconWrapper, { backgroundColor: `${categoryColorStr}20` }]}>
              <Feather name={item.icon as any} size={24} color={categoryColorStr} />
            </View>
          ) : (
            <View style={[styles.iconPlaceholder, { backgroundColor: `${categoryColorStr}20` }]}>
              <Text style={{ color: categoryColorStr }}>?</Text>
            </View>
          )}
          
          <View style={styles.habitDetails}>
            <Text style={[styles.habitName, { color: colors.text }]}>{item.name}</Text>
            {streak > 0 && (
              <Text style={[styles.streak, { color: colors.textSecondary }]}>
                Current streak: 🔥 {streak} {streak === 1 ? 'day' : 'days'}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleEdit(item)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Feather name="edit-2" size={20} color={colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleDelete(item)}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Feather name="trash-2" size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // Custom header with back button
  const renderHeader = () => (
    <View style={[styles.headerContainer, { borderBottomColor: colors.border }]}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Feather name="arrow-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Habits</Text>
      <View style={styles.headerRight} />
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: 'Manage Habits', headerShown: false }} />
      {renderHeader()}
      
      <View style={styles.content}>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="clipboard" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              You don't have any habits yet.
            </Text>
            <Text style={[styles.emptyStateSubText, { color: colors.textSecondary }]}>
              Add habits from the main screen to get started.
            </Text>
          </View>
        ) : (
          <FlatList
            data={habits}
            renderItem={renderHabitItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
      
      {/* Habit Edit Modal */}
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
              { backgroundColor: colors.background }
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
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.spacing.m,
    paddingVertical: metrics.spacing.m,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
  },
  backButton: {
    padding: metrics.spacing.xs,
  },
  headerRight: {
    width: 24, // Same width as back button for balance
  },
  content: {
    flex: 1,
    padding: metrics.spacing.m,
  },
  list: {
    paddingBottom: metrics.spacing.xl,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: metrics.spacing.m,
    borderRadius: metrics.borderRadius.medium,
    marginBottom: metrics.spacing.m,
    borderWidth: 1,
  },
  habitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: metrics.spacing.m,
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: metrics.spacing.m,
  },
  habitDetails: {
    flex: 1,
  },
  habitName: {
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
    marginBottom: metrics.spacing.xs,
  },
  streak: {
    fontSize: metrics.fontSize.xs,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: metrics.spacing.s,
    marginLeft: metrics.spacing.m,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: metrics.spacing.xl,
  },
  emptyStateText: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
    marginTop: metrics.spacing.m,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: metrics.fontSize.m,
    marginTop: metrics.spacing.s,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
    height: '100%',
  },
}); 