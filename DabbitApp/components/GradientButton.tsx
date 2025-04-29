import React from 'react';
import { StyleSheet, TouchableOpacity, Text, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { Feather } from '@expo/vector-icons';

type GradientButtonProps = {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: keyof typeof Feather.glyphMap;
  colors?: string[];
  fullWidth?: boolean;
};

export const GradientButton = ({
  title,
  onPress,
  style,
  textStyle,
  icon,
  colors,
  fullWidth = true,
}: GradientButtonProps) => {
  const { colors: themeColors } = useTheme();
  
  // Use provided colors or default to primary gradient
  const gradientColors = colors || themeColors.primaryGradient;
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        fullWidth && styles.fullWidth,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={gradientColors as [string, string, ...string[]]}
        style={[styles.button, style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {icon && (
          <Feather 
            name={icon} 
            size={20} 
            color="#FFFFFF"
            style={styles.icon}
          />
        )}
        <Text style={[styles.text, textStyle]}>
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: metrics.borderRadius.large,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  button: {
    paddingVertical: metrics.spacing.m,
    paddingHorizontal: metrics.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
  },
  icon: {
    marginRight: metrics.spacing.s,
  },
}); 