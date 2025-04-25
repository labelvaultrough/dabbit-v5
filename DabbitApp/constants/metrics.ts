import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const metrics = {
  screenWidth: width,
  screenHeight: height,
  
  // Follow 8-point grid system
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border radius
  borderRadius: {
    small: 4,
    medium: 8,
    large: 16,
    round: 9999,
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    s: 14,
    m: 16,
    l: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  iconSize: {
    small: 16,
    medium: 24,
    large: 32,
  },
}; 