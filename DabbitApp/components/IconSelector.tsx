import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';

// List of common Feather icons to choose from
const ICON_LIST: string[] = [
  'activity', 'award', 'battery', 'book', 'bookmark', 'calendar', 'coffee',
  'compass', 'edit', 'feather', 'file', 'film', 'flag', 'gift', 'heart',
  'home', 'image', 'layers', 'layout', 'life-buoy', 'link', 'list', 'map',
  'map-pin', 'maximize', 'message-circle', 'message-square', 'mic', 'moon',
  'music', 'paperclip', 'pen-tool', 'play', 'plus', 'power', 'printer',
  'radio', 'save', 'scissors', 'search', 'shield', 'shopping-bag', 'shopping-cart',
  'smile', 'star', 'sun', 'sunrise', 'sunset', 'tag', 'thumbs-up', 'tool',
  'trash', 'truck', 'tv', 'umbrella', 'video', 'watch', 'wifi', 'zap'
];

interface IconSelectorProps {
  value: string | undefined;
  onChange: (icon: string) => void;
  label?: string;
}

export const IconSelector = ({ value, onChange, label }: IconSelectorProps) => {
  const { colors } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIcons = searchQuery 
    ? ICON_LIST.filter(icon => icon.includes(searchQuery.toLowerCase()))
    : ICON_LIST;

  const handleSelect = (icon: string) => {
    onChange(icon);
    setModalVisible(false);
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
        {value ? (
          <View style={styles.selectedIconContainer}>
            <View style={[styles.iconWrapper, { backgroundColor: `${colors.primary}20` }]}>
              <Feather name={value as any} size={24} color={colors.primary} />
            </View>
            <Text style={[styles.selectedIconText, { color: colors.text }]}>
              {value}
            </Text>
          </View>
        ) : (
          <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
            Select an icon
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select an Icon</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.searchContainer, { borderColor: colors.border }]}>
              <Feather name="search" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search icons..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Feather name="x-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            
            <FlatList
              data={filteredIcons}
              keyExtractor={(item) => item}
              numColumns={4}
              contentContainerStyle={styles.iconList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.iconItem,
                    value === item && { 
                      backgroundColor: `${colors.primary}20`,
                      borderColor: colors.primary 
                    },
                    { borderColor: colors.border }
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Feather 
                    name={item as any} 
                    size={24} 
                    color={value === item ? colors.primary : colors.text} 
                  />
                  <Text 
                    style={[
                      styles.iconText, 
                      { color: value === item ? colors.primary : colors.textSecondary }
                    ]}
                    numberOfLines={1}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No icons found
                  </Text>
                </View>
              )}
            />
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
  selectedIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: metrics.spacing.s,
  },
  selectedIconText: {
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
    height: '80%',
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: metrics.borderRadius.medium,
    margin: metrics.spacing.m,
    paddingHorizontal: metrics.spacing.m,
    height: 44,
  },
  searchInput: {
    flex: 1,
    marginLeft: metrics.spacing.s,
    fontSize: metrics.fontSize.m,
  },
  iconList: {
    padding: metrics.spacing.m,
  },
  iconItem: {
    width: '25%',
    aspectRatio: 1,
    padding: metrics.spacing.s,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: metrics.borderRadius.medium,
    margin: '0%',
    marginBottom: metrics.spacing.s,
    marginRight: metrics.spacing.s,
  },
  iconText: {
    fontSize: metrics.fontSize.xs,
    marginTop: metrics.spacing.xs,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: metrics.spacing.xl,
  },
  emptyText: {
    fontSize: metrics.fontSize.m,
  },
}); 