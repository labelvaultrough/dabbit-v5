import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Animated, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { metrics } from '@/constants/metrics';
import { Habit } from '@/types/habit';

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
  const { getHabitCompletionStatus, getHabitStreak, categories } = useHabits();
  const [menuVisible, setMenuVisible] = useState(false);
  
  const completed = getHabitCompletionStatus(habit.id, date);
  const streak = getHabitStreak(habit.id);
  
  // For animation
  const animatedValue = React.useRef(new Animated.Value(0)).current;
  
  // Find category color
  const category = categories.find(cat => cat.id === habit.category);
  const categoryColor = category 
    ? colors.categories[category.color as keyof typeof colors.categories] 
    : colors.primary;
  
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
  
  const backgroundColor = completed ? `${categoryColor}20` : 'transparent';

  const handleEdit = () => {
    setMenuVisible(false);
    if (onEdit) {
      onEdit(habit);
    }
  };

  const handleDelete = () => {
    setMenuVisible(false);
    if (onDelete) {
      onDelete(habit);
    }
  };
  
  const timeBucket = getTimeBucketEmoji(habit.time);
  
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
        onPress={() => onPress(habit.id)}
        activeOpacity={0.8}
      >
        <View style={styles.contentContainer}>
          <View style={styles.textContainer}>
            <View style={styles.titleContainer}>
              {timeBucket && (
                <Text style={styles.timeEmoji}>
                  {timeBucket.emoji}
                </Text>
              )}
              {category && (
                <View 
                  style={[
                    styles.categoryDot, 
                    { backgroundColor: categoryColor }
                  ]}
                />
              )}
              <Text style={[styles.title, { color: colors.text }]}>{habit.name}</Text>
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
            
            <Animated.View style={{ transform: [{ scale }] }}>
              <Feather 
                name={completed ? "check-circle" : "circle"} 
                size={metrics.iconSize.large} 
                color={completed ? categoryColor : colors.border} 
              />
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>

      {/* Menu Modal */}
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
              { 
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }
            ]}
          >
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleEdit}
            >
              <Feather name="edit-2" size={metrics.iconSize.medium} color={colors.text} />
              <Text style={[styles.menuText, { color: colors.text }]}>Edit Habit</Text>
            </TouchableOpacity>
            
            <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleDelete}
            >
              <Feather name="trash-2" size={metrics.iconSize.medium} color={colors.error} />
              <Text style={[styles.menuText, { color: colors.error }]}>Delete Habit</Text>
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
}); 