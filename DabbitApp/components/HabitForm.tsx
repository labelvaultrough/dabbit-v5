import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Pressable,
  Alert,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { metrics } from '@/constants/metrics';
import { Feather } from '@expo/vector-icons';
import { Habit, FrequencyType } from '@/types/habit';
import { Dropdown } from './Dropdown';
import { TimePickerField } from './TimePickerField';

type HabitFormProps = {
  habit?: Habit | null;
  onClose: () => void;
  onSave: () => void;
};

export const HabitForm = ({ habit, onClose, onSave }: HabitFormProps) => {
  const { colors } = useTheme();
  const { addHabit, updateHabit, categories } = useHabits();

  const [name, setName] = useState('');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true); // Default to enabled
  const [showReminderInfo, setShowReminderInfo] = useState<boolean>(false);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    category?: string;
    time?: string;
  }>({});
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  // Initialize form with habit data if editing
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setFrequencyType(habit.frequency.type);
      setSelectedDays(habit.frequency.custom_days || []);
      setSelectedCategory(habit.category);
      
      // Set the time if it exists
      if (habit.time) {
        const [hours, minutes] = habit.time.split(':').map(Number);
        const timeDate = new Date();
        timeDate.setHours(hours);
        timeDate.setMinutes(minutes);
        setSelectedTime(timeDate);
      }
      
      // Set reminder enabled status (default to true if not specified)
      setReminderEnabled(habit.reminderEnabled !== false);
    }
  }, [habit]);

  // Validate form and return true if valid
  const validateForm = () => {
    const errors: {
      name?: string;
      category?: string;
      time?: string;
    } = {};
    
    if (!name.trim()) {
      errors.name = 'Please add a habit name';
    }
    
    if (!selectedCategory) {
      errors.category = 'Please select a category';
    }
    
    if (!selectedTime) {
      errors.time = 'Please set a reminder time';
    }
    
    setValidationErrors(errors);
    
    // If we have any errors, show them
    if (Object.keys(errors).length > 0) {
      setShowValidationErrors(true);
      
      // Hide validation errors after 3 seconds
      setTimeout(() => {
        setShowValidationErrors(false);
      }, 3000);
      
      return false;
    }
    
    return true;
  };

  const handleSave = async () => {
    // Validate the form
    if (!validateForm()) {
      return;
    }

    // Format time to HH:MM string if selected
    const timeString = selectedTime 
      ? `${selectedTime.getHours().toString().padStart(2, '0')}:${selectedTime.getMinutes().toString().padStart(2, '0')}` 
      : undefined;

    const habitData = {
      name: name.trim(),
      frequency: {
        type: frequencyType,
        custom_days: frequencyType === 'custom' ? selectedDays : undefined,
      },
      category: selectedCategory,
      time: timeString,
      reminderEnabled,
      archived: false,
    };

    if (habit) {
      await updateHabit({
        ...habit,
        ...habitData,
      });
    } else {
      await addHabit(habitData);
    }

    onSave();
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };
  
  const toggleReminder = () => {
    setReminderEnabled(!reminderEnabled);
  };
  
  const toggleReminderInfo = () => {
    setShowReminderInfo(!showReminderInfo);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Format categories for dropdown
  const categoryItems = categories.map(category => ({
    id: category.id,
    label: category.name,
    color: category.color,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {habit ? 'Edit Habit' : 'New Habit'}
        </Text>
        <TouchableOpacity onPress={handleSave}>
          <Feather name="check" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.form}>
        {/* Name Input */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Name</Text>
          <TextInput
            style={[
              styles.input,
              validationErrors.name && showValidationErrors ? { borderColor: colors.error } : { borderColor: colors.border },
              { color: colors.text, backgroundColor: colors.surface },
            ]}
            value={name}
            onChangeText={setName}
            placeholder="Habit name"
            placeholderTextColor={colors.textSecondary}
          />
          {validationErrors.name && showValidationErrors && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {validationErrors.name}
            </Text>
          )}
        </View>

        {/* Frequency Selection */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Frequency</Text>
          <View style={styles.frequencyOptions}>
            {(['daily', 'weekly', 'custom'] as FrequencyType[]).map(type => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.frequencyOption,
                  {
                    backgroundColor:
                      frequencyType === type ? `${colors.primary}20` : colors.surface,
                    borderColor: frequencyType === type ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setFrequencyType(type)}
              >
                <Text
                  style={[
                    styles.frequencyText,
                    { color: frequencyType === type ? colors.primary : colors.text },
                  ]}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Days Selection (for custom frequency) */}
        {frequencyType === 'custom' && (
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Select Days</Text>
            <View style={styles.daysContainer}>
              {dayNames.map((day, index) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayButton,
                    {
                      backgroundColor: selectedDays.includes(index)
                        ? colors.primary
                        : colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => toggleDay(index)}
                >
                  <Text
                    style={[
                      styles.dayText,
                      { color: selectedDays.includes(index) ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Time and Reminder Selection (side by side) */}
        <View style={styles.formGroup}>
          <View style={styles.timeReminderContainer}>
            {/* Time Selection - Left Side */}
            <View style={styles.timeContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Time</Text>
              <TimePickerField
                value={selectedTime}
                onChange={setSelectedTime}
                placeholder="Set time"
                error={validationErrors.time && showValidationErrors ? validationErrors.time : undefined}
                errorColor={colors.error}
              />
            </View>

            {/* Reminder Toggle - Right Side */}
            <View style={styles.reminderContainer}>
              <View style={styles.reminderLabelContainer}>
                <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>Reminders</Text>
                <TouchableOpacity 
                  style={styles.infoButton} 
                  onPress={toggleReminderInfo}
                >
                  <Feather name="info" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity 
                style={[styles.reminderToggle, { marginTop: 8 }]} 
                onPress={toggleReminder}
                activeOpacity={0.7}
              >
                <Feather 
                  name={reminderEnabled ? "bell" : "bell-off"} 
                  size={24} 
                  color={reminderEnabled ? colors.primary : colors.textSecondary} 
                />
                <Text style={[
                  styles.reminderText, 
                  { color: reminderEnabled ? colors.primary : colors.textSecondary }
                ]}>
                  {reminderEnabled ? "Enabled" : "Disabled"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reminder Info Message (shows only when info button clicked) */}
          {showReminderInfo && (
            <View style={[styles.infoBox, { backgroundColor: `${colors.primary}10`, borderColor: colors.primary }]}>
              <Text style={[styles.infoText, { color: colors.text }]}>
                Toggle to enable or disable reminders for this specific habit. Note: If reminders are turned off in settings, no reminders will be shown even if enabled here.
              </Text>
            </View>
          )}
        </View>

        {/* Category Selection with Dropdown */}
        <View style={styles.formGroup}>
          <Dropdown
            label="Category"
            items={categoryItems}
            selectedItemId={selectedCategory}
            onSelect={(categoryId) => {
              if (categoryId) {
                setSelectedCategory(categoryId);
              }
            }}
            placeholder="Select a category"
          />
          {validationErrors.category && showValidationErrors && (
            <Text style={[styles.errorText, { color: colors.error }]}>
              {validationErrors.category}
            </Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {habit ? 'Update Habit' : 'Create Habit'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: metrics.spacing.l,
    paddingVertical: metrics.spacing.m,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
  },
  form: {
    padding: metrics.spacing.l,
  },
  formGroup: {
    marginBottom: metrics.spacing.l,
  },
  label: {
    fontSize: metrics.fontSize.m,
    marginBottom: metrics.spacing.s,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: metrics.borderRadius.medium,
    padding: metrics.spacing.m,
    fontSize: metrics.fontSize.m,
  },
  frequencyOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  frequencyOption: {
    flex: 1,
    padding: metrics.spacing.m,
    borderRadius: metrics.borderRadius.medium,
    alignItems: 'center',
    marginHorizontal: metrics.spacing.xs,
    borderWidth: 1,
  },
  frequencyText: {
    fontSize: metrics.fontSize.s,
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  dayButton: {
    width: '13%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: metrics.borderRadius.small,
    marginBottom: metrics.spacing.s,
    borderWidth: 1,
  },
  dayText: {
    fontSize: metrics.fontSize.xs,
    fontWeight: '500',
  },
  timeReminderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeContainer: {
    flex: 1,
    marginRight: metrics.spacing.m,
  },
  reminderContainer: {
    flex: 1,
  },
  reminderLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoButton: {
    marginLeft: metrics.spacing.xs,
    padding: metrics.spacing.xs,
  },
  infoBox: {
    padding: metrics.spacing.m,
    borderRadius: metrics.borderRadius.small,
    marginTop: metrics.spacing.xs,
    borderWidth: 1,
  },
  infoText: {
    fontSize: metrics.fontSize.xs,
    lineHeight: 16,
  },
  reminderToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.spacing.s,
    borderRadius: metrics.borderRadius.small,
  },
  reminderText: {
    fontSize: metrics.fontSize.s,
    fontWeight: '500',
    marginLeft: metrics.spacing.s,
  },
  saveButton: {
    padding: metrics.spacing.m,
    borderRadius: metrics.borderRadius.medium,
    alignItems: 'center',
    marginTop: metrics.spacing.m,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
  },
  errorText: {
    fontSize: metrics.fontSize.xs,
    marginTop: 4,
    marginLeft: 2,
  },
}); 