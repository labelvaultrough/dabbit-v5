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
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';

// List of common Feather icons to choose from
const ICON_LIST: string[] = [
  'activity', 'airplay', 'alert-circle', 'alert-triangle', 'align-center', 'align-justify', 
  'align-left', 'align-right', 'anchor', 'aperture', 'archive', 'arrow-down', 'arrow-left', 
  'arrow-right', 'arrow-up', 'at-sign', 'award', 'bar-chart', 'bar-chart-2', 'battery', 
  'battery-charging', 'bell', 'bell-off', 'bluetooth', 'bold', 'book', 'book-open', 'bookmark', 
  'box', 'briefcase', 'calendar', 'camera', 'camera-off', 'cast', 'check', 'check-circle', 
  'check-square', 'chevron-down', 'chevron-left', 'chevron-right', 'chevron-up', 'chrome', 
  'circle', 'clipboard', 'clock', 'cloud', 'cloud-drizzle', 'cloud-lightning', 'cloud-rain', 
  'cloud-snow', 'code', 'codepen', 'coffee', 'command', 'compass', 'copy', 'corner-down-left', 
  'corner-down-right', 'corner-left-down', 'corner-right-down', 'cpu', 'credit-card', 'crop', 
  'crosshair', 'database', 'delete', 'disc', 'dollar-sign', 'download', 'download-cloud', 
  'droplet', 'edit', 'edit-2', 'edit-3', 'external-link', 'eye', 'eye-off', 'facebook', 
  'fast-forward', 'feather', 'file', 'file-minus', 'file-plus', 'file-text', 'film', 'filter', 
  'flag', 'folder', 'folder-minus', 'folder-plus', 'gift', 'git-branch', 'git-commit', 
  'git-merge', 'git-pull-request', 'github', 'gitlab', 'globe', 'grid', 'hard-drive', 
  'hash', 'headphones', 'heart', 'help-circle', 'home', 'image', 'inbox', 'info', 
  'instagram', 'italic', 'key', 'layers', 'layout', 'life-buoy', 'link', 'link-2', 
  'linkedin', 'list', 'loader', 'lock', 'log-in', 'log-out', 'mail', 'map', 'map-pin', 
  'maximize', 'maximize-2', 'menu', 'message-circle', 'message-square', 'mic', 'mic-off', 
  'minimize', 'minimize-2', 'minus', 'minus-circle', 'minus-square', 'monitor', 'moon', 
  'more-horizontal', 'more-vertical', 'mouse-pointer', 'move', 'music', 'navigation', 
  'navigation-2', 'octagon', 'package', 'paperclip', 'pause', 'pause-circle', 'pen-tool', 
  'percent', 'phone', 'phone-call', 'phone-forwarded', 'phone-incoming', 'phone-missed', 
  'phone-off', 'phone-outgoing', 'pie-chart', 'play', 'play-circle', 'plus', 'plus-circle', 
  'plus-square', 'pocket', 'power', 'printer', 'radio', 'refresh-ccw', 'refresh-cw', 
  'repeat', 'rewind', 'rotate-ccw', 'rotate-cw', 'rss', 'save', 'scissors', 'search', 
  'send', 'server', 'settings', 'share', 'share-2', 'shield', 'shield-off', 'shopping-bag', 
  'shopping-cart', 'shuffle', 'sidebar', 'skip-back', 'skip-forward', 'slack', 'slash', 
  'sliders', 'smartphone', 'smile', 'speaker', 'square', 'star', 'stop-circle', 'sun', 
  'sunrise', 'sunset', 'tablet', 'tag', 'target', 'terminal', 'thermometer', 'thumbs-down', 
  'thumbs-up', 'toggle-left', 'toggle-right', 'tool', 'trash', 'trash-2', 'trello', 
  'trending-down', 'trending-up', 'triangle', 'truck', 'tv', 'twitch', 'twitter', 
  'type', 'umbrella', 'underline', 'unlock', 'upload', 'upload-cloud', 'user', 
  'user-check', 'user-minus', 'user-plus', 'user-x', 'users', 'video', 'video-off', 
  'voicemail', 'volume', 'volume-1', 'volume-2', 'volume-x', 'watch', 'wifi', 
  'wifi-off', 'wind', 'x', 'x-circle', 'x-octagon', 'x-square', 'youtube', 'zap', 'zap-off', 'zoom-in', 'zoom-out'
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
  
  // Icon categories for better organization
  const categories = [
    { name: 'Common', icons: ['home', 'calendar', 'bell', 'clock', 'heart', 'star', 'user', 'settings', 'book', 'flag'] },
    { name: 'Media', icons: ['music', 'play', 'film', 'video', 'image', 'camera', 'mic', 'headphones', 'speaker', 'tv'] },
    { name: 'Weather', icons: ['sun', 'moon', 'cloud', 'cloud-rain', 'cloud-snow', 'cloud-lightning', 'wind', 'umbrella'] },
    { name: 'Objects', icons: ['smartphone', 'tablet', 'monitor', 'watch', 'briefcase', 'coffee', 'gift', 'package', 'truck'] },
    { name: 'Actions', icons: ['edit', 'save', 'trash', 'download', 'upload', 'share', 'search', 'check', 'x', 'plus', 'minus'] }
  ];

  const filteredIcons = searchQuery 
    ? ICON_LIST.filter(icon => icon.includes(searchQuery.toLowerCase()))
    : ICON_LIST;
    
  // Function to show popular icons first when no search query
  const getOrganizedIcons = () => {
    if (searchQuery) {
      return { allIcons: filteredIcons, categorized: false };
    } else {
      // Return top categories when not searching
      return { allIcons: ICON_LIST, categorized: true };
    }
  };

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
            Select icon
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
              <Text style={[styles.modalTitle, { color: colors.text }]}>Select Icon</Text>
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
            
            {searchQuery ? (
              // Show simple list when searching
              <FlatList
                data={filteredIcons}
                keyExtractor={(item) => item}
                numColumns={5}
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
                      size={22} 
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
            ) : (
              // Show categorized view when not searching
              <ScrollView style={{flex: 1}}>
                {/* Show categories first */}
                {categories.map(category => (
                  <View key={category.name} style={styles.categoryContainer}>
                    <Text style={[styles.categoryTitle, {color: colors.text}]}>
                      {category.name}
                    </Text>
                    <View style={styles.categoryIconsContainer}>
                      {category.icons.map(icon => (
                        <TouchableOpacity
                          key={icon}
                          style={[
                            styles.iconItem,
                            value === icon && { 
                              backgroundColor: `${colors.primary}20`,
                              borderColor: colors.primary 
                            },
                            { borderColor: colors.border }
                          ]}
                          onPress={() => handleSelect(icon)}
                        >
                          <Feather 
                            name={icon as any} 
                            size={22} 
                            color={value === icon ? colors.primary : colors.text} 
                          />
                          <Text 
                            style={[
                              styles.iconText, 
                              { color: value === icon ? colors.primary : colors.textSecondary }
                            ]}
                            numberOfLines={1}
                          >
                            {icon}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                ))}

                {/* Show all icons header */}
                <Text style={[styles.categoryTitle, {color: colors.text, marginTop: 20}]}>
                  All Icons
                </Text>
                
                {/* All icons in grid */}
                <View style={styles.allIconsContainer}>
                  {ICON_LIST.map(icon => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconItem,
                        value === icon && { 
                          backgroundColor: `${colors.primary}20`,
                          borderColor: colors.primary 
                        },
                        { borderColor: colors.border }
                      ]}
                      onPress={() => handleSelect(icon)}
                    >
                      <Feather 
                        name={icon as any} 
                        size={22} 
                        color={value === icon ? colors.primary : colors.text} 
                      />
                      <Text 
                        style={[
                          styles.iconText, 
                          { color: value === icon ? colors.primary : colors.textSecondary }
                        ]}
                        numberOfLines={1}
                      >
                        {icon}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}
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
    width: '20%',
    aspectRatio: 1,
    padding: metrics.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: metrics.borderRadius.medium,
    margin: '1%',
  },
  iconText: {
    fontSize: 9,
    marginTop: metrics.spacing.xs,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: metrics.spacing.xl,
  },
  emptyText: {
    fontSize: metrics.fontSize.m,
  },
  categoryContainer: {
    marginHorizontal: metrics.spacing.m,
    marginBottom: metrics.spacing.m,
  },
  categoryTitle: {
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
    marginBottom: metrics.spacing.s,
    marginLeft: 4,
  },
  categoryIconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allIconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: metrics.spacing.m,
    paddingBottom: metrics.spacing.xl,
  },
}); 