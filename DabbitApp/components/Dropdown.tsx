import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Modal, FlatList, SafeAreaView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';

interface DropdownItem {
  id: string;
  label: string;
  color?: string;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  selectedItemId: string | undefined;
  onSelect: (itemId: string | undefined) => void;
  placeholder?: string;
  required?: boolean;
  compact?: boolean;
}

export const Dropdown = ({ 
  label, 
  items, 
  selectedItemId, 
  onSelect, 
  placeholder = 'Select an option',
  required = false,
  compact = false
}: DropdownProps) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  
  const selectedItem = items.find(item => item.id === selectedItemId);
  const screenHeight = Dimensions.get('window').height;
  
  return (
    <View style={[
      styles.container, 
      compact && styles.compactContainer
    ]}>
      {label ? (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
          {required && <Text style={styles.requiredIndicator}>*</Text>}
        </View>
      ) : null}
      
      <TouchableOpacity
        style={[
          styles.dropdown,
          compact ? styles.compactDropdown : null,
          { 
            backgroundColor: compact ? 'transparent' : colors.surface, 
            borderColor: colors.border,
            borderWidth: compact ? 0 : 1,
          }
        ]}
        onPress={() => setModalVisible(true)}
      >
        {selectedItem ? (
          <View style={styles.selectedItemContainer}>
            {selectedItem.color && (
              <View 
                style={[
                  styles.colorIndicator, 
                  { backgroundColor: colors.categories[selectedItem.color as keyof typeof colors.categories] || selectedItem.color }
                ]} 
              />
            )}
            <Text style={[
              styles.selectedItemText, 
              compact ? styles.compactSelectedText : null,
              { color: compact ? colors.primary : colors.text }
            ]}>
              {selectedItem.label}
            </Text>
          </View>
        ) : (
          <Text style={[
            styles.placeholderText, 
            compact ? styles.compactPlaceholderText : null,
            { color: colors.textSecondary }
          ]}>
            {placeholder}
          </Text>
        )}
        <Feather 
          name="chevron-down" 
          size={compact ? metrics.iconSize.small - 2 : metrics.iconSize.small} 
          color={compact ? colors.primary : colors.textSecondary} 
        />
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setModalVisible(false)}
        >
          <View 
            style={[
              styles.modalContainer, 
              { 
                backgroundColor: colors.background,
                height: screenHeight * 0.6
              }
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={e => e.stopPropagation()}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {compact ? 'Select Habit' : `Select ${label}`}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.item,
                    { 
                      backgroundColor: selectedItemId === item.id 
                        ? `${colors.primary}20` 
                        : colors.background 
                    }
                  ]}
                  onPress={() => {
                    onSelect(selectedItemId === item.id ? undefined : item.id);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.itemContent}>
                    {item.color && (
                      <View 
                        style={[
                          styles.colorIndicator, 
                          { backgroundColor: colors.categories[item.color as keyof typeof colors.categories] || item.color }
                        ]} 
                      />
                    )}
                    <Text style={[styles.itemText, { color: colors.text }]}>
                      {item.label}
                    </Text>
                  </View>
                  
                  {selectedItemId === item.id && (
                    <Feather name="check" size={metrics.iconSize.medium} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => (
                <View style={[styles.separator, { backgroundColor: colors.border }]} />
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: metrics.spacing.m,
  },
  compactContainer: {
    marginBottom: metrics.spacing.s,
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
  dropdown: {
    height: 48,
    borderRadius: metrics.borderRadius.medium,
    borderWidth: 1,
    paddingHorizontal: metrics.spacing.m,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactDropdown: {
    height: 40,
    paddingHorizontal: 0,
  },
  selectedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedItemText: {
    fontSize: metrics.fontSize.m,
  },
  compactSelectedText: {
    fontSize: metrics.fontSize.s,
    fontWeight: '600',
    marginLeft: metrics.spacing.xs,
  },
  placeholderText: {
    fontSize: metrics.fontSize.m,
  },
  compactPlaceholderText: {
    fontSize: metrics.fontSize.s,
    marginLeft: metrics.spacing.xs,
  },
  colorIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: metrics.spacing.s,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    borderTopLeftRadius: metrics.borderRadius.large,
    borderTopRightRadius: metrics.borderRadius.large,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: metrics.spacing.l,
    paddingVertical: metrics.spacing.m,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.spacing.l,
    paddingVertical: metrics.spacing.m,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemText: {
    fontSize: metrics.fontSize.m,
  },
  separator: {
    height: 1,
  },
}); 