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