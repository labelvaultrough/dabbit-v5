import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';

// Simplified duration presets
const DURATION_PRESETS = [5, 10, 30, 60];

interface DurationSelectorProps {
  value: number | undefined;
  onChange: (duration: number | undefined) => void;
  label?: string;
}

export const DurationSelector = ({ value, onChange, label }: DurationSelectorProps) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [customDuration, setCustomDuration] = useState<string>('');

  const handleSelect = (duration: number | undefined) => {
    onChange(duration);
    setModalVisible(false);
  };

  const handleCustomDuration = () => {
    const duration = parseInt(customDuration);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert('Invalid Duration', 'Please enter a valid positive number');
      return;
    }
    
    onChange(duration);
    setModalVisible(false);
  };

  // Format duration for display
  const formatDuration = (minutes: number | undefined) => {
    if (minutes === undefined) return 'No Duration';
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMins = minutes % 60;
      if (remainingMins === 0) {
        return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      } else {
        return `${hours}h ${remainingMins}m`;
      }
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.selector,
          { backgroundColor: colors.surface, borderColor: colors.border }
        ]}
        onPress={() => setModalVisible(true)}
      >
        {value !== undefined ? (
          <View style={styles.selectedContainer}>
            <Feather name="clock" size={20} color={colors.primary} style={styles.icon} />
            <Text style={[styles.selectedText, { color: colors.text }]}>
              {formatDuration(value)}
            </Text>
          </View>
        ) : (
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            Duration
          </Text>
        )}
        <Feather name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Duration</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.optionsContainer}>
              {/* No Duration Option */}
              <TouchableOpacity
                style={[
                  styles.optionItem,
                  value === undefined && { 
                    backgroundColor: `${colors.primary}20`, 
                    borderColor: colors.primary 
                  },
                  { borderColor: colors.border }
                ]}
                onPress={() => handleSelect(undefined)}
              >
                <Feather 
                  name="x-circle" 
                  size={20} 
                  color={value === undefined ? colors.primary : colors.text} 
                />
                <Text 
                  style={[
                    styles.optionText, 
                    { color: value === undefined ? colors.primary : colors.text }
                  ]}
                >
                  No Duration
                </Text>
              </TouchableOpacity>
              
              {/* Preset Durations */}
              {DURATION_PRESETS.map((minutes) => (
                <TouchableOpacity
                  key={minutes.toString()}
                  style={[
                    styles.optionItem,
                    value === minutes && { 
                      backgroundColor: `${colors.primary}20`, 
                      borderColor: colors.primary 
                    },
                    { borderColor: colors.border }
                  ]}
                  onPress={() => handleSelect(minutes)}
                >
                  <Feather 
                    name="clock" 
                    size={20} 
                    color={value === minutes ? colors.primary : colors.text} 
                  />
                  <Text 
                    style={[
                      styles.optionText, 
                      { color: value === minutes ? colors.primary : colors.text }
                    ]}
                  >
                    {formatDuration(minutes)}
                  </Text>
                </TouchableOpacity>
              ))}
              
              {/* Custom Duration Input */}
              <View style={[styles.customDurationContainer, { borderColor: colors.border }]}>
                <Text style={[styles.customDurationLabel, { color: colors.text }]}>
                  Custom Duration
                </Text>
                <View style={styles.customInputRow}>
                  <TextInput
                    style={[styles.customDurationInput, { 
                      color: colors.text, 
                      borderColor: colors.border,
                      backgroundColor: colors.surface
                    }]}
                    value={customDuration}
                    onChangeText={setCustomDuration}
                    placeholder="Enter minutes"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                  />
                  <TouchableOpacity
                    style={[styles.customDurationButton, { backgroundColor: colors.primary }]}
                    onPress={handleCustomDuration}
                  >
                    <Text style={styles.customDurationButtonText}>Set</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: metrics.spacing.l,
  },
  label: {
    fontSize: metrics.fontSize.m,
    marginBottom: metrics.spacing.s,
    fontWeight: '500',
  },
  selector: {
    height: 50,
    borderRadius: metrics.borderRadius.medium,
    borderWidth: 1,
    paddingHorizontal: metrics.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: metrics.spacing.s,
  },
  selectedText: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: metrics.fontSize.m,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: metrics.borderRadius.large,
    borderTopRightRadius: metrics.borderRadius.large,
    maxHeight: '70%',
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
  optionsContainer: {
    padding: metrics.spacing.m,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionItem: {
    width: '48%',
    borderRadius: metrics.borderRadius.medium,
    borderWidth: 1,
    padding: metrics.spacing.m,
    marginBottom: metrics.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
    marginLeft: metrics.spacing.s,
  },
  customDurationContainer: {
    width: '100%',
    borderRadius: metrics.borderRadius.medium,
    borderWidth: 1,
    padding: metrics.spacing.m,
    marginBottom: metrics.spacing.m,
  },
  customDurationLabel: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
    marginBottom: metrics.spacing.s,
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customDurationInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: metrics.borderRadius.small,
    paddingHorizontal: metrics.spacing.m,
    marginRight: metrics.spacing.s,
  },
  customDurationButton: {
    paddingHorizontal: metrics.spacing.m,
    paddingVertical: metrics.spacing.s,
    borderRadius: metrics.borderRadius.small,
  },
  customDurationButtonText: {
    color: 'white',
    fontWeight: '600',
  },
}); 