/**
 * Color utility functions for Dabbit app
 * Provides consistent color handling and manipulation across the app
 */

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Regular expression to validate hex color codes with or without alpha
 */
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;

/**
 * Adds alpha value to a hex color
 * @param color - Hex color string (e.g. '#FF5500')
 * @param opacity - Opacity value between 0 and 1
 * @returns Hex color with alpha (e.g. '#FF5500CC' for opacity 0.8)
 */
export const addAlpha = (color: string, opacity: number): string => {
  // Safety check for invalid inputs
  if (!color || typeof color !== 'string') {
    console.warn('Invalid color provided to addAlpha:', color);
    return '#00000000'; // Transparent black as fallback
  }

  // If not a valid hex color, return the original
  if (!HEX_COLOR_REGEX.test(color)) {
    console.warn(`Invalid hex color format: ${color}`);
    return color;
  }

  // Normalize opacity to be between 0-1
  const safeOpacity = Math.max(0, Math.min(1, opacity));

  // Normalize to 6 digits if 3
  let normalizedColor = color;
  if (color.length === 4) { // #RGB format
    normalizedColor = `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`;
  }

  // If already has alpha (8 chars), replace it
  if (color.length === 9) {
    return `${normalizedColor.substring(0, 7)}${Math.round(safeOpacity * 255).toString(16).padStart(2, '0')}`;
  }

  // Convert opacity to hex (0-1 to 00-FF)
  const alpha = Math.round(safeOpacity * 255).toString(16).padStart(2, '0').toUpperCase();
  return `${normalizedColor}${alpha}`;
};

/**
 * Get color with standard opacity values
 * 
 * @param color - Hex color string
 * @param opacity - Opacity value or predefined opacity key
 * @returns Color with consistent alpha
 */
export const getColorWithOpacity = (color: string, opacity: number | 'bg' | 'disabled' | 'hover'): string => {
  if (!color) {
    console.warn('Invalid color provided to getColorWithOpacity');
    return '#00000000'; // Transparent black as fallback
  }

  // Map named opacity levels to actual values
  const opacityValues = {
    bg: 0.12,      // Background opacity - for subtle backgrounds (e.g. category indicators)
    disabled: 0.5, // Disabled state opacity - for disabled elements
    hover: 0.8,    // Hover state opacity - for hover effects
  };

  // Determine actual opacity value
  const actualOpacity = typeof opacity === 'number' 
    ? opacity 
    : opacityValues[opacity] || 0.3; // Default to 0.3 if unknown key

  return addAlpha(color, actualOpacity);
};

/**
 * Normalize color string by ensuring it follows proper hexadecimal format
 * 
 * @param color - Input color string (can be hex, named color, etc.)
 * @returns Normalized hex color string
 */
export const normalizeColor = (color: string): string => {
  if (!color || typeof color !== 'string') {
    console.warn('Invalid color provided to normalizeColor:', color);
    return '#000000'; // Black as fallback
  }

  // If already a valid hex color, return as is
  if (HEX_COLOR_REGEX.test(color)) {
    return color;
  }

  // If it's a named color or other format, we can expand this later
  // For now, return the original if we can't normalize it
  return color;
};

/**
 * Adds standard opacity suffix to color string
 * 
 * @param color - Base color as hex string
 * @param opacity - Opacity value from 0-100 as string (e.g. '30')
 * @returns Color with opacity suffix
 */
export const addOpacitySuffix = (color: string, opacity: string): string => {
  if (!color || typeof color !== 'string') {
    console.warn('Invalid color provided to addOpacitySuffix:', color);
    return '#000000'; // Black as fallback
  }

  // Simple string concatenation to match the app's existing pattern
  return `${color}${opacity}`;
};

/**
 * Extracts the base color from a color string that may contain opacity
 * 
 * @param colorWithOpacity - Color string that might have opacity suffix
 * @returns Clean color string without opacity
 */
export const getBaseColor = (colorWithOpacity: string): string => {
  // Safety check
  if (!colorWithOpacity || typeof colorWithOpacity !== 'string') {
    console.warn('Invalid color provided to getBaseColor:', colorWithOpacity);
    return '#000000'; // Black as fallback
  }
  
  // If it's a hex color with alpha (8 chars), remove the alpha
  if (colorWithOpacity.length === 9 && colorWithOpacity.startsWith('#')) {
    return colorWithOpacity.substring(0, 7);
  }

  // Check if the color ends with a two-digit opacity value
  const opacityMatch = colorWithOpacity.match(/^(.+?)(\d{2})$/);
  if (opacityMatch) {
    return opacityMatch[1];
  }
  
  return colorWithOpacity;
};

/**
 * Utility function to determine if a color is light or dark
 * Used for deciding on text color (black on light backgrounds, white on dark)
 * 
 * @param color - Hex color to analyze
 * @returns Boolean indicating if the color is light (true) or dark (false)
 */
export const isLightColor = (color: string): boolean => {
  if (!color || typeof color !== 'string') {
    console.warn('Invalid color provided to isLightColor:', color);
    return false; // Assume dark to be safe
  }

  // Extract the hex color without alpha
  const baseColor = getBaseColor(color);
  
  // If not a valid hex color, assume it's dark
  if (!baseColor.startsWith('#')) {
    return false;
  }
  
  // Convert hex to RGB
  let r = 0, g = 0, b = 0;
  
  try {
    if (baseColor.length === 4) { // #RGB format
      r = parseInt(baseColor[1] + baseColor[1], 16);
      g = parseInt(baseColor[2] + baseColor[2], 16);
      b = parseInt(baseColor[3] + baseColor[3], 16);
    } else { // #RRGGBB format
      r = parseInt(baseColor.substring(1, 3), 16);
      g = parseInt(baseColor.substring(3, 5), 16);
      b = parseInt(baseColor.substring(5, 7), 16);
    }
  } catch (error) {
    console.warn('Error parsing color in isLightColor:', error);
    return false; // Assume dark to be safe
  }
  
  // Calculate perceived brightness (ITU-R BT.709)
  const brightness = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
  
  // Return true for light colors (brightness > 0.5)
  return brightness > 0.5;
};

/**
 * Convert a hex color to its RGB components
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  // Remove hash if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex
  let r, g, b;
  if (hex.length === 3) {
    r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
    g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
    b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
  } else {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  }
  
  return { r, g, b };
};

/**
 * Convert RGB components to a hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Generate a light pastel shade from a color
 * intensity: 0-1, where 0 is lightest and 1 is the original color
 */
export const getLightPastelShade = (color: string, intensity: number = 0.15): string => {
  const { r, g, b } = hexToRgb(color);
  
  // Mix with white to create a pastel shade
  const pastelR = Math.round(r * intensity + 255 * (1 - intensity));
  const pastelG = Math.round(g * intensity + 255 * (1 - intensity));
  const pastelB = Math.round(b * intensity + 255 * (1 - intensity));
  
  return rgbToHex(pastelR, pastelG, pastelB);
};

/**
 * Get a theme-aware color for a category
 */
export const getCategoryColor = (categoryId: string, categories: any[], isDark: boolean): string => {
  const category = categories.find(cat => cat.id === categoryId);
  if (!category) return isDark ? Colors.dark.primary : Colors.light.primary;
  
  const colors = isDark ? Colors.dark.categories : Colors.light.categories;
  const colorKey = category.color as keyof typeof colors;
  const color = colors[colorKey];
  
  // Ensure we return a string (not an array for gradients)
  return typeof color === 'string' ? color : colors.blue;
};

/**
 * Get a theme-aware background color for a habit
 */
export const getHabitBackgroundColor = (
  categoryId: string, 
  isDark: boolean,
  isCompleted: boolean
): string => {
  // If completed, use a light gray background
  if (isCompleted) {
    return isDark ? '#2D3748' : '#F5F5F5';
  }
  
  // Base colors for categories
  const colors = isDark ? Colors.dark.categories : Colors.light.categories;
  
  // Find category color or use a default
  let baseColor = colors.blue;
  
  try {
    // Handle categories
    if (categoryId) {
      // Get the category color directly from our colors object
      // The key is the category color name like 'blue', 'green', etc.
      const category = colors[categoryId as keyof typeof colors];
      if (category) {
        baseColor = typeof category === 'string' ? category : colors.blue;
      }
    }
  } catch (error) {
    console.warn('Error getting category color:', error);
  }
  
  // Create a light pastel version for the background
  return getLightPastelShade(baseColor, 0.15);
};

/**
 * Get a theme-aware color for habit action buttons
 */
export const getActionButtonColor = (
  categoryId: string,
  isDark: boolean
): string => {
  const colors = isDark ? Colors.dark.categories : Colors.light.categories;
  
  // Default to blue if no category
  if (!categoryId) return colors.blue;
  
  // Get the category color directly from our colors object
  try {
    const categoryColor = colors[categoryId as keyof typeof colors];
    return typeof categoryColor === 'string' ? categoryColor : colors.blue;
  } catch (error) {
    console.warn('Error getting action button color:', error);
    return colors.blue;
  }
};

export default {
  hexToRgb,
  rgbToHex,
  getLightPastelShade,
  getCategoryColor,
  getHabitBackgroundColor,
  getActionButtonColor
}; 