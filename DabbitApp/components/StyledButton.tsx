import React from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  Text, 
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { Feather } from '@expo/vector-icons';

type StyledButtonProps = {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
  gradient?: boolean;
};

export const StyledButton = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  icon,
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  gradient = false,
}: StyledButtonProps) => {
  const { colors } = useTheme();
  
  const getBackgroundColor = () => {
    if (disabled) return colors.textSecondary;
    
    switch (variant) {
      case 'primary':
        return colors.primary;
      case 'secondary':
        return colors.secondary;
      case 'outline':
      case 'text':
        return 'transparent';
      default:
        return colors.primary;
    }
  };
  
  const getTextColor = () => {
    if (disabled) return colors.surface;
    
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#FFFFFF';
      case 'outline':
        return colors.primary;
      case 'text':
        return colors.primary;
      default:
        return '#FFFFFF';
    }
  };
  
  const getBorderColor = () => {
    if (disabled) return colors.textSecondary;
    
    switch (variant) {
      case 'outline':
        return colors.primary;
      default:
        return 'transparent';
    }
  };
  
  const getGradientColors = () => {
    if (disabled) return [colors.textSecondary, colors.textSecondary];
    
    switch (variant) {
      case 'primary':
        return colors.primaryGradient;
      case 'secondary':
        return colors.secondaryGradient;
      default:
        return [colors.primary, colors.primary];
    }
  };
  
  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { 
          paddingVertical: metrics.spacing.xs,
          paddingHorizontal: metrics.spacing.m,
          borderRadius: metrics.borderRadius.medium,
        };
      case 'large':
        return { 
          paddingVertical: metrics.spacing.m,
          paddingHorizontal: metrics.spacing.xl,
          borderRadius: metrics.borderRadius.large,
        };
      default: // medium
        return { 
          paddingVertical: metrics.spacing.s,
          paddingHorizontal: metrics.spacing.l,
          borderRadius: metrics.borderRadius.medium,
        };
    }
  };
  
  const getFontSize = (): number => {
    switch (size) {
      case 'small':
        return metrics.fontSize.s;
      case 'large':
        return metrics.fontSize.l;
      default: // medium
        return metrics.fontSize.m;
    }
  };
  
  const buttonStyles = [
    styles.button,
    getSizeStyles(),
    {
      backgroundColor: getBackgroundColor(),
      borderColor: getBorderColor(),
      borderWidth: variant === 'outline' ? 1 : 0,
    },
    fullWidth && styles.fullWidth,
    style,
  ];
  
  const content = (
    <>
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={getTextColor()} 
        />
      ) : (
        <>
          {icon && (
            <Feather 
              name={icon} 
              size={getFontSize() + 2} 
              color={getTextColor()} 
              style={styles.icon} 
            />
          )}
          <Text 
            style={[
              { 
                color: getTextColor(), 
                fontSize: getFontSize(),
                fontWeight: '600'
              },
              textStyle
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </>
  );
  
  if (gradient && (variant === 'primary' || variant === 'secondary')) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.8}
        style={[styles.container, fullWidth && styles.fullWidth, style]}
      >
        <LinearGradient
          colors={getGradientColors() as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[buttonStyles, { backgroundColor: 'transparent' }]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
    width: '100%',
  },
  icon: {
    marginRight: metrics.spacing.xs,
  },
}); 