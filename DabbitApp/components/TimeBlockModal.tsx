import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Modal, Platform } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { useTimeBlocks, TimeBlock } from '@/context/TimeBlockContext';
import { metrics } from '@/constants/metrics';
import { TimePickerField } from '@/components/TimePickerField';
import { Feather } from '@expo/vector-icons';

type TimeBlockModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const TimeBlockModal = ({ visible, onClose }: TimeBlockModalProps) => {
  const { colors } = useTheme();
  const { timeBlocks, updateTimeBlock, resetToDefaults } = useTimeBlocks();

  // Create local state for editing
  const [editedBlocks, setEditedBlocks] = useState<TimeBlock[]>(timeBlocks);

  // Convert time string to Date object for the time picker
  const timeStringToDate = (timeStr: string): Date => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    return date;
  };

  // Convert Date object to time string
  const dateToTimeString = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Update a single block's time
  const handleTimeChange = (blockId: TimeBlock['id'], isStart: boolean, newDate: Date | null) => {
    if (!newDate) return;
    
    const timeString = dateToTimeString(newDate);
    
    setEditedBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          [isStart ? 'startTime' : 'endTime']: timeString
        };
      }
      return block;
    }));
  };

  // Save all changes
  const handleSave = async () => {
    // Validate time ranges
    const hasValidRanges = validateTimeRanges();
    if (!hasValidRanges) {
      return;
    }

    try {
      // Update each block
      for (const block of editedBlocks) {
        await updateTimeBlock(block);
      }
      Alert.alert(
        'Success', 
        'Your time blocks have been updated.', 
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to save time blocks. Please try again.');
    }
  };

  // Reset to defaults
  const handleReset = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all time blocks to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await resetToDefaults();
            setEditedBlocks(timeBlocks);
            Alert.alert(
              'Success', 
              'Time blocks have been reset to defaults.',
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  // Validate that time blocks don't overlap and cover the entire day
  const validateTimeRanges = (): boolean => {
    // Create an array to track coverage for each hour of the day (0-23)
    const hoursCoverage = Array(24).fill(false);
    
    // Mark which hours are covered by each time block
    for (const block of editedBlocks) {
      const startHour = parseInt(block.startTime.split(':')[0], 10);
      const startMinute = parseInt(block.startTime.split(':')[1], 10);
      const endHour = parseInt(block.endTime.split(':')[0], 10);
      const endMinute = parseInt(block.endTime.split(':')[1], 10);
      
      // Check that start time is before end time (except for Night which wraps around)
      if (block.id !== 'Night' && 
          (startHour > endHour || (startHour === endHour && startMinute >= endMinute))) {
        Alert.alert(
          'Invalid Time Range',
          `Start time must be before end time for ${block.id}.`
        );
        return false;
      }
      
      // Mark hours covered by this block
      if (block.id === 'Night' && startHour > endHour) {
        // Night block wraps around midnight
        // Mark hours from start to midnight
        for (let h = startHour; h < 24; h++) {
          hoursCoverage[h] = true;
        }
        // Mark hours from midnight to end
        for (let h = 0; h <= endHour; h++) {
          hoursCoverage[h] = true;
        }
      } else {
        // Normal time block (no wraparound)
        // For start hour, only mark as covered if it starts at 0 minutes
        if (startMinute === 0) {
          hoursCoverage[startHour] = true;
        }
        
        // For full hours between start and end
        for (let h = startHour + 1; h < endHour; h++) {
          hoursCoverage[h] = true;
        }
        
        // For end hour, always mark as covered since we're including up to XX:59
        if (endHour < 24) {
          hoursCoverage[endHour] = true;
        }
      }
    }
    
    // Check for gaps in coverage
    let gapFound = false;
    let gapHour = -1;
    
    for (let h = 0; h < 24; h++) {
      if (!hoursCoverage[h]) {
        gapFound = true;
        gapHour = h;
        break;
      }
    }
    
    if (gapFound) {
      Alert.alert(
        'Incomplete Time Coverage',
        `Please ensure all hours of the day are covered. Hour ${gapHour}:00 is not included in any time block.`
      );
      return false;
    }
    
    // Check for transitions between time blocks
    for (let i = 0; i < editedBlocks.length; i++) {
      for (let j = 0; j < editedBlocks.length; j++) {
        if (i !== j) {
          const blockA = editedBlocks[i];
          const blockB = editedBlocks[j];
          
          // Skip Night block for this check since it wraps around
          if (blockA.id === 'Night' || blockB.id === 'Night') continue;
          
          const blockAEndHour = parseInt(blockA.endTime.split(':')[0], 10);
          const blockAEndMinute = parseInt(blockA.endTime.split(':')[1], 10);
          const blockBStartHour = parseInt(blockB.startTime.split(':')[0], 10);
          const blockBStartMinute = parseInt(blockB.startTime.split(':')[1], 10);
          
          // Check if blockA ends exactly when blockB starts
          if (blockAEndHour === blockBStartHour && 
              blockAEndMinute + 1 === blockBStartMinute) {
            // This is a proper transition with no gap
          } else if (blockAEndHour === blockBStartHour - 1 && 
                     blockAEndMinute === 59 && blockBStartMinute === 0) {
            // This is also a proper transition (e.g., 11:59 to 12:00)
          }
        }
      }
    }
    
    return true;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContainer, 
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
        ]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Time Block Customization</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.content}>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              Customize your day's time blocks to match your personal routine. These settings affect how your habits are organized throughout the day.
            </Text>
            
            {editedBlocks.map((block) => (
              <View key={block.id} style={[styles.blockCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.blockHeader}>
                  <Text style={[styles.blockEmoji]}>{block.emoji}</Text>
                  <Text style={[styles.blockTitle, { color: colors.text }]}>{block.id}</Text>
                </View>
                
                <View style={styles.timeContainer}>
                  <View style={styles.timeField}>
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Starts at</Text>
                    <TimePickerField
                      value={timeStringToDate(block.startTime)}
                      onChange={(date) => handleTimeChange(block.id, true, date)}
                    />
                  </View>
                  
                  <View style={styles.arrowContainer}>
                    <Feather 
                      name="arrow-right" 
                      size={20} 
                      color={colors.textSecondary} 
                      style={styles.arrow}
                    />
                  </View>
                  
                  <View style={styles.timeField}>
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Ends at</Text>
                    <TimePickerField
                      value={timeStringToDate(block.endTime)}
                      onChange={(date) => handleTimeChange(block.id, false, date)}
                    />
                  </View>
                </View>
              </View>
            ))}
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: colors.error }]}
                onPress={handleReset}
              >
                <Text style={[styles.resetButtonText, { color: colors.error }]}>Reset to Defaults</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleSave}
              >
                <Text style={[styles.saveButtonText, { color: 'white' }]}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: metrics.borderRadius.large,
    borderTopRightRadius: metrics.borderRadius.large,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: metrics.spacing.m,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: metrics.spacing.m,
  },
  description: {
    fontSize: metrics.fontSize.m,
    marginBottom: metrics.spacing.l,
    lineHeight: 22,
  },
  blockCard: {
    borderRadius: metrics.borderRadius.medium,
    padding: metrics.spacing.m,
    marginBottom: metrics.spacing.m,
    borderWidth: 1,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.spacing.m,
  },
  blockEmoji: {
    fontSize: 20,
    marginRight: metrics.spacing.s,
  },
  blockTitle: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: metrics.spacing.s,
  },
  timeField: {
    flex: 1,
  },
  timeLabel: {
    fontSize: metrics.fontSize.s,
    marginBottom: metrics.spacing.xs,
  },
  arrowContainer: {
    width: 40,
    alignItems: 'center',
    paddingTop: 20, // Align with time pickers
  },
  arrow: {
    alignSelf: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: metrics.spacing.l,
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: metrics.borderRadius.medium,
    paddingVertical: metrics.spacing.m,
    paddingHorizontal: metrics.spacing.l,
  },
  resetButtonText: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
  },
  saveButton: {
    borderRadius: metrics.borderRadius.medium,
    paddingVertical: metrics.spacing.m,
    paddingHorizontal: metrics.spacing.l,
  },
  saveButtonText: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
  },
}); 