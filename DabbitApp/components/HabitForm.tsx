import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { format } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';
import { useHabits } from '@/context/HabitContext';
import { metrics } from '@/constants/metrics';
import { Feather } from '@expo/vector-icons';
import { Habit, FrequencyType, Frequency } from '@/types/habit';
import { Dropdown } from './Dropdown';
import { TimePickerField } from './TimePickerField';
import { DatePickerField } from './DatePickerField';
import { IconSelector } from './IconSelector';
import { DurationSelector } from './DurationSelector';

type HabitFormProps = {
  habit?: Habit | null;
  onClose: () => void;
  onSave: () => void;
};

export const HabitForm = ({ habit, onClose, onSave }: HabitFormProps) => {
  const { colors } = useTheme();
  const { addHabit, updateHabit, categories } = useHabits();

  // Form state
  const [name, setName] = useState('');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState<boolean>(true);
  const [selectedIcon, setSelectedIcon] = useState<string | undefined>(undefined);
  const [selectedDuration, setSelectedDuration] = useState<number | undefined>(undefined);

  // Error state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with habit data if editing
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setFrequencyType(habit.frequency.type);
      setSelectedDays(habit.frequency.custom_days || []);
      setSelectedCategory(habit.category);
      
      if (habit.time) {
        const [hours, minutes] = habit.time.split(':').map(Number);
        const timeDate = new Date();
        timeDate.setHours(hours);
        timeDate.setMinutes(minutes);
        setSelectedTime(timeDate);
      }
      
      if (habit.endDate) {
        setSelectedEndDate(new Date(habit.endDate));
      }
      
      setReminderEnabled(habit.reminderEnabled !== false);
      
      if (habit.icon) {
        setSelectedIcon(habit.icon);
      }
      
      if (habit.duration) {
        setSelectedDuration(habit.duration);
      }
    }
  }, [habit]);

  const handleSave = async () => {
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!selectedCategory) newErrors.category = 'Category is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Format time if set
    let formattedTime: string | undefined;
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      formattedTime = `${hours}:${minutes}`;
    }
    
    // Format end date if set
    let formattedEndDate: string | undefined;
    if (selectedEndDate) {
      formattedEndDate = format(selectedEndDate, 'yyyy-MM-dd');
    }

    // Prepare frequency data
    const frequency: Frequency = {
      type: frequencyType,
      ...(frequencyType === 'custom' ? { custom_days: selectedDays } : {}),
    };

    if (habit) {
      // Editing existing habit
      await updateHabit({
        ...habit,
        name,
        frequency,
        category: selectedCategory,
        time: formattedTime,
        endDate: formattedEndDate,
        reminderEnabled,
        icon: selectedIcon,
        duration: selectedDuration,
      });
    } else {
      // Adding new habit
      await addHabit({
        name,
        frequency,
        category: selectedCategory,
        time: formattedTime,
        endDate: formattedEndDate,
        reminderEnabled,
        icon: selectedIcon,
        duration: selectedDuration,
        archived: false,
      });
    }

    onSave();
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Format categories for dropdown
  const categoryItems = categories.map(category => ({
    id: category.id,
    label: category.name,
    color: category.color,
  }));

  // Consistent styles
  const styles = {
    labelText: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: '#333333',
      marginBottom: 6
    },
    inputHeight: 42,
    spacing: 16,
    borderRadius: 8,
    controlBorderColor: '#E2E2E2',
    primaryColor: '#F95A7F',
    errorText: {
      color: 'red',
      fontSize: 12,
      marginTop: 2
    }
  };

  return (
    <View style={{width: '100%', height: '100%', backgroundColor: 'white', borderRadius: 16, overflow: 'hidden'}}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: styles.primaryColor,
        height: 50,
        paddingHorizontal: 16,
      }}>
        <TouchableOpacity onPress={onClose}>
          <Feather name="x" size={22} color="white" />
        </TouchableOpacity>
        
        <Text style={{fontSize: 16, fontWeight: '600', color: 'white'}}>
          {habit ? 'Edit Habit' : 'New Habit'}
        </Text>
        
        <TouchableOpacity onPress={handleSave}>
          <Feather name="check" size={22} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{flex: 1, padding: 16, backgroundColor: 'white'}}>
        {/* Name Input */}
        <View style={{marginBottom: styles.spacing}}>
          <Text style={styles.labelText}>Name</Text>
          <TextInput
            style={{
              height: styles.inputHeight, 
              borderWidth: 1, 
              borderColor: styles.controlBorderColor, 
              borderRadius: styles.borderRadius,
              paddingHorizontal: 12,
              fontSize: 14,
              backgroundColor: 'white',
              color: '#333333'
            }}
            value={name}
            onChangeText={setName}
            placeholder="Habit name"
            placeholderTextColor="#999999"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Icon and Duration row */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: styles.spacing}}>
          <View style={{width: '48%'}}>
            <Text style={styles.labelText}>Icon</Text>
            <View style={{
              height: styles.inputHeight,
              borderWidth: 1,
              borderColor: styles.controlBorderColor,
              borderRadius: styles.borderRadius,
              overflow: 'hidden'
            }}>
              <IconSelector
                value={selectedIcon}
                onChange={setSelectedIcon}
              />
            </View>
          </View>

          <View style={{width: '48%'}}>
            <Text style={styles.labelText}>Duration</Text>
            <View style={{
              height: styles.inputHeight,
              borderWidth: 1,
              borderColor: styles.controlBorderColor,
              borderRadius: styles.borderRadius,
              overflow: 'hidden'
            }}>
              <DurationSelector
                value={selectedDuration}
                onChange={setSelectedDuration}
              />
            </View>
          </View>
        </View>

        {/* Frequency */}
        <View style={{marginBottom: styles.spacing}}>
          <Text style={styles.labelText}>Frequency</Text>
          <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6}}>
            {(['daily', 'weekly', 'custom', 'one-time'] as FrequencyType[]).map(type => (
              <TouchableOpacity
                key={type}
                style={{
                  height: 32,
                  paddingHorizontal: 8,
                  borderRadius: 16,
                  borderWidth: 1,
                  backgroundColor: frequencyType === type ? '#FEE5E9' : 'white',
                  borderColor: frequencyType === type ? styles.primaryColor : styles.controlBorderColor,
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '23%'
                }}
                onPress={() => setFrequencyType(type)}
              >
                <Text style={{
                  color: frequencyType === type ? styles.primaryColor : '#666666',
                  fontWeight: '600',
                  fontSize: 12
                }}>
                  {type === 'one-time' ? 'Today' : type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {frequencyType === 'custom' && (
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 6}}>
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <TouchableOpacity
                  key={day}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: selectedDays.includes(day) ? styles.primaryColor : '#F5F5F5',
                  }}
                  onPress={() => toggleDay(day)}
                >
                  <Text style={{
                    color: selectedDays.includes(day) ? 'white' : '#666666',
                    fontWeight: '500',
                    fontSize: 12
                  }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][day]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Time and Reminder in single row */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: styles.spacing}}>
          {/* Time */}
          <View style={{width: '48%'}}>
            <Text style={styles.labelText}>Time</Text>
            <View style={{
              height: styles.inputHeight,
              borderWidth: 1,
              borderColor: styles.controlBorderColor,
              borderRadius: styles.borderRadius,
              overflow: 'hidden'
            }}>
              <TimePickerField
                value={selectedTime}
                onChange={setSelectedTime}
                placeholder="Set time"
              />
            </View>
            {errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
          </View>

          {/* Reminder */}
          <View style={{width: '48%'}}>
            <Text style={styles.labelText}>Reminder</Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              height: styles.inputHeight,
              borderRadius: styles.borderRadius,
              borderWidth: 1,
              borderColor: styles.controlBorderColor,
              paddingHorizontal: 12,
              backgroundColor: 'white'
            }}>
              <Feather name="bell" size={16} color={styles.primaryColor} style={{marginRight: 6}} />
              <TouchableOpacity 
                style={{
                  width: 40,
                  height: 24,
                  backgroundColor: reminderEnabled ? '#FEE5E9' : '#F5F5F5',
                  borderRadius: 12,
                  alignItems: reminderEnabled ? 'flex-end' : 'flex-start',
                  paddingHorizontal: 2,
                  justifyContent: 'center',
                  marginLeft: 'auto'
                }}
                onPress={() => setReminderEnabled(!reminderEnabled)}
              >
                <View style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: reminderEnabled ? styles.primaryColor : '#CCCCCC'
                }} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Category and End Date in single row */}
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: styles.spacing}}>
          {/* Category */}
          <View style={{width: '48%'}}>
            <Text style={styles.labelText}>Category</Text>
            <View style={{
              height: styles.inputHeight,
              borderWidth: 1,
              borderColor: styles.controlBorderColor,
              borderRadius: styles.borderRadius,
              overflow: 'hidden'
            }}>
              <Dropdown
                label=""
                items={categoryItems}
                selectedItemId={selectedCategory}
                onSelect={(id) => setSelectedCategory(id || categories[0]?.id)}
              />
            </View>
            {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
          </View>
          
          {/* End Date */}
          <View style={{width: '48%'}}>
            <Text style={styles.labelText}>End Date</Text>
            <View style={{
              height: styles.inputHeight,
              borderWidth: 1,
              borderColor: styles.controlBorderColor,
              borderRadius: styles.borderRadius,
              overflow: 'hidden'
            }}>
              <DatePickerField
                value={selectedEndDate}
                onChange={setSelectedEndDate}
                placeholder="Optional"
                minimumDate={new Date()}
              />
            </View>
          </View>
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={{
            backgroundColor: styles.primaryColor,
            height: 46,
            borderRadius: 23,
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 8,
            marginBottom: 16
          }}
          onPress={handleSave}
        >
          <Text style={{color: 'white', fontSize: 16, fontWeight: '600'}}>
            {habit ? 'Update Habit' : 'Create Habit'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default HabitForm; 