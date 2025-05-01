import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  ActivityIndicator,
  GestureResponderEvent 
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { addAlpha } from '@/utils/colorUtils';

interface CircleButtonProps {
  icon: keyof typeof Feather.glyphMap;
  size?: 'small' | 'medium' | 'large';
  onPress: (event: GestureResponderEvent) => void;
  color?: string;
  gradient?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
}

/**
 * A circular button component with optional gradient background
 */
export default function CircleButton({
  icon,
  size = 'medium',
  onPress,
  color,
  gradient = true,
  disabled = false,
  loading = false,
  style
}: CircleButtonProps) {
  const { colors } = useTheme();

  // Determine the actual size values
  const sizeMap = {
    small: { buttonSize: 36, iconSize: 16 },
    medium: { buttonSize: 48, iconSize: 20 },
    large: { buttonSize: 56, iconSize: 24 }
  };
  
  const { buttonSize, iconSize } = sizeMap[size];
  
  // Determine colors to use
  const buttonColor = color || colors.primary;
  const gradientColors = gradient 
    ? [(color || colors.primaryGradient[0]), (color || colors.primaryGradient[1])]
    : [buttonColor, buttonColor];
  
  // Apply opacity for disabled state
  const shadowColorWithOpacity = addAlpha('#000', 0.25);
  
  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color="white" />;
    }
    return <Feather name={icon} size={iconSize} color="white" />;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { 
          width: buttonSize, 
          height: buttonSize,
          borderRadius: buttonSize / 2,
          shadowColor: shadowColorWithOpacity,
          opacity: disabled ? 0.6 : 1
        },
        style
      ]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.8}
      disabled={disabled || loading}
    >
      {gradient ? (
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          style={[
            styles.button,
            { 
              width: buttonSize, 
              height: buttonSize,
              borderRadius: buttonSize / 2
            }
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderContent()}
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.button,
            { 
              width: buttonSize, 
              height: buttonSize,
              borderRadius: buttonSize / 2,
              backgroundColor: buttonColor
            }
          ]}
        >
          {renderContent()}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  }
});
