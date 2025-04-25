import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Feather } from '@expo/vector-icons';
import { metrics } from '@/constants/metrics';

type SettingsItemProps = {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Feather.glyphMap;
  iconColor?: string;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
};

export const SettingsItem = ({
  title,
  subtitle,
  icon,
  iconColor,
  showSwitch,
  switchValue,
  onSwitchChange,
  onPress,
}: SettingsItemProps) => {
  const { colors } = useTheme();
  
  const handlePress = () => {
    if (!showSwitch && onPress) {
      onPress();
    }
  };
  
  return (
    <TouchableOpacity
      style={[styles.container, { borderBottomColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
    >
      <View style={styles.contentContainer}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: `${iconColor || colors.primary}20` }]}>
            <Feather
              name={icon}
              size={metrics.iconSize.medium}
              color={iconColor || colors.primary}
            />
          </View>
        )}
        
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
        
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: colors.border, true: `${colors.primary}50` }}
            thumbColor={switchValue ? colors.primary : '#f4f3f4'}
          />
        ) : onPress ? (
          <Feather name="chevron-right" size={metrics.iconSize.small} color={colors.textSecondary} />
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: metrics.spacing.m,
    paddingHorizontal: metrics.spacing.l,
    borderBottomWidth: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: metrics.borderRadius.medium,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: metrics.spacing.m,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
    marginBottom: metrics.spacing.xs,
  },
  subtitle: {
    fontSize: metrics.fontSize.s,
  },
}); 