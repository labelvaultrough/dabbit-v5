import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';

type StatsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  colors?: string[];
  icon?: React.ReactNode;
  style?: ViewStyle;
  large?: boolean;
};

export const StatsCard = ({
  title,
  value,
  subtitle,
  colors,
  icon,
  style,
  large = false,
}: StatsCardProps) => {
  const { colors: themeColors } = useTheme();

  // Use provided colors or fallback to theme primary gradient
  const gradientColors = colors || themeColors.primaryGradient;

  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      style={[
        styles.container,
        large ? styles.containerLarge : styles.containerRegular,
        style,
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.title}>{title}</Text>
      <View style={styles.valueContainer}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.value, large && styles.valueLarge]}>{value}</Text>
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: metrics.borderRadius.large,
    padding: metrics.spacing.m,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  containerRegular: {
    flex: 1,
    minHeight: 120,
  },
  containerLarge: {
    minHeight: 160,
  },
  title: {
    color: '#FFFFFF',
    fontSize: metrics.fontSize.s,
    opacity: 0.9,
    marginBottom: metrics.spacing.xs,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: metrics.spacing.s,
  },
  value: {
    color: '#FFFFFF',
    fontSize: metrics.fontSize.xxl,
    fontWeight: 'bold',
  },
  valueLarge: {
    fontSize: metrics.fontSize.xxxl,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: metrics.fontSize.xs,
    opacity: 0.8,
    marginTop: metrics.spacing.xs,
  },
  iconContainer: {
    marginRight: metrics.spacing.s,
  },
}); 