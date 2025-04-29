import React from 'react';
import { StyleSheet, View, Text, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { Feather } from '@expo/vector-icons';

type GradientCardProps = {
  title?: string;
  colors: string[];
  children: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  icon?: keyof typeof Feather.glyphMap;
  showAction?: boolean;
  actionIcon?: keyof typeof Feather.glyphMap;
  onActionPress?: () => void;
};

export const GradientCard = ({
  title,
  colors,
  children,
  style,
  titleStyle,
  icon,
  showAction = false,
  actionIcon = 'arrow-right',
  onActionPress,
}: GradientCardProps) => {
  const { colors: themeColors } = useTheme();

  // Ensure we have at least 2 colors for the gradient
  const gradientColors = colors.length >= 2 ? colors : [colors[0], colors[0]];

  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {title && (
        <View style={styles.titleContainer}>
          {icon && (
            <Feather
              name={icon}
              size={metrics.iconSize.medium}
              color="#FFFFFF"
              style={styles.icon}
            />
          )}
          <Text style={[styles.title, titleStyle]}>
            {title}
          </Text>
          {showAction && onActionPress && (
            <Feather
              name={actionIcon}
              size={metrics.iconSize.medium}
              color="#FFFFFF"
              style={styles.actionIcon}
              onPress={onActionPress}
            />
          )}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: metrics.borderRadius.large,
    overflow: 'hidden',
    marginBottom: metrics.spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: metrics.spacing.l,
    paddingTop: metrics.spacing.l,
    paddingBottom: metrics.spacing.s,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: metrics.fontSize.l,
    flex: 1,
  },
  icon: {
    marginRight: metrics.spacing.s,
  },
  actionIcon: {
    marginLeft: metrics.spacing.s,
  },
  content: {
    padding: metrics.spacing.l,
    paddingTop: metrics.spacing.s,
  },
}); 