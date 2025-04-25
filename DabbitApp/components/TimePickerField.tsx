import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Platform, 
  Modal
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';

interface TimePickerFieldProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  errorColor?: string;
}

export const TimePickerField = ({ 
  label, 
  value, 
  onChange, 
  required = false,
  placeholder = 'Select a time',
  error,
  errorColor
}: TimePickerFieldProps) => {
  const { colors } = useTheme();
  const [show, setShow] = useState(false);
  
  // Format time in 12-hour format with AM/PM
  const formatTime = (date: Date | null) => {
    if (!date) return '';
    
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };
  
  const handleChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    
    if (selectedDate) {
      onChange(selectedDate);
    }
  };
  
  const handleClear = () => {
    onChange(null);
  };
  
  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          {required && <Text style={styles.requiredIndicator}>*</Text>}
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.timeButton,
          { 
            backgroundColor: colors.surface, 
            borderColor: error ? (errorColor || colors.error) : colors.border 
          }
        ]}
        onPress={() => setShow(true)}
      >
        <Text style={[
          styles.timeText,
          { 
            color: value ? colors.text : colors.textSecondary 
          }
        ]}>
          {value ? formatTime(value) : placeholder}
        </Text>
        
        <View style={styles.clockIconContainer}>
          <Feather 
            name="clock" 
            size={16} 
            color={colors.primary} 
          />
        </View>
      </TouchableOpacity>
      
      {error && (
        <Text style={[styles.errorText, { color: errorColor || colors.error }]}>
          {error}
        </Text>
      )}
      
      {show && (
        Platform.OS === 'ios' ? (
          <Modal
            transparent
            animationType="slide"
            visible={show}
          >
            <View style={styles.modalContainer}>
              <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                  <TouchableOpacity onPress={() => setShow(false)}>
                    <Text style={{ color: colors.primary }}>Cancel</Text>
                  </TouchableOpacity>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>Select Time</Text>
                  <TouchableOpacity onPress={() => setShow(false)}>
                    <Text style={{ color: colors.primary }}>Done</Text>
                  </TouchableOpacity>
                </View>
                
                <DateTimePicker
                  value={value || new Date()}
                  mode="time"
                  display="spinner"
                  onChange={handleChange}
                  textColor={colors.text}
                  style={{ width: '100%' }}
                />
              </View>
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={value || new Date()}
            mode="time"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: metrics.spacing.m,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.spacing.xs,
  },
  label: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
  },
  requiredIndicator: {
    color: '#E74C3C',
    marginLeft: 4,
    fontSize: metrics.fontSize.m,
  },
  timeButton: {
    height: 46,
    borderRadius: metrics.borderRadius.medium,
    borderWidth: 1,
    paddingHorizontal: metrics.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    borderTopLeftRadius: metrics.borderRadius.large,
    borderTopRightRadius: metrics.borderRadius.large,
    paddingBottom: 20,
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
  errorText: {
    marginTop: metrics.spacing.xs,
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
  },
  clockIconContainer: {
    padding: metrics.spacing.xs,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 