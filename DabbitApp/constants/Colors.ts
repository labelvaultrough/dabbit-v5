/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.vercel.app/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Color scheme for the Dabbit habit tracker app, following modern gradient design principles
 */

export const Colors = {
  light: {
    text: '#11181C',
    textSecondary: '#687076',
    background: '#F4F2FA', // Light purple tint
    surface: '#FFFFFF',
    primary: '#FF6B6B', // Vibrant red/pink
    primaryGradient: ['#FF6B6B', '#FF3980'], // Red to Pink gradient
    secondary: '#38B2D3', // Bright blue
    secondaryGradient: ['#38B2D3', '#6366F1'], // Blue to Purple gradient
    accent: '#A855F7', // Purple accent
    border: '#E6E8EB',
    success: '#20BF6B',
    error: '#E74C3C',
    warning: '#F39C12',
    tabIconDefault: '#687076',
    tabIconSelected: '#FF3980',
    iconTint: '#FF3980', // Icon tint color
    // Action buttons
    actionButton: '#FF6B6B',
    actionButtonGradient: ['#FF6B6B', '#FF3980'],
    // Progress bars
    progressBackground: '#E6E8EB',
    progressFill: '#FF3980',
    // Calendar
    calendarHighlight: '#FF3980',
    calendarBackground: '#FFFFFF',
    // Energy icon
    energyIcon: '#FF3980',
    // Categories with gradient options
    categories: {
      blue: '#3B82F6',
      blueGradient: ['#3B82F6', '#2563EB'],
      green: '#22C55E',
      greenGradient: ['#22C55E', '#16A34A'],
      purple: '#A855F7',
      purpleGradient: ['#A855F7', '#7E22CE'],
      orange: '#FB923C',
      orangeGradient: ['#FB923C', '#EA580C'],
      pink: '#EC4899',
      pinkGradient: ['#EC4899', '#DB2777'],
      indigo: '#818CF8',
      indigoGradient: ['#818CF8', '#6366F1'],
      teal: '#2DD4BF',
      tealGradient: ['#2DD4BF', '#0D9488'],
      amber: '#FBBF24',
      amberGradient: ['#FBBF24', '#D97706'],
      emerald: '#34D399',
      emeraldGradient: ['#34D399', '#10B981'],
      violet: '#A78BFA',
      violetGradient: ['#A78BFA', '#8B5CF6'],
      cyan: '#67E8F9',
      cyanGradient: ['#67E8F9', '#22D3EE'],
      lime: '#A3E635',
      limeGradient: ['#A3E635', '#84CC16'],
    },
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: '#9BA1A6',
    background: '#151718',
    surface: '#1E2022',
    primary: '#FF6B6B', // Keeping vibrant colors even in dark mode
    primaryGradient: ['#FF6B6B', '#FF3980'],
    secondary: '#38B2D3',
    secondaryGradient: ['#38B2D3', '#6366F1'],
    accent: '#A855F7',
    border: '#2B2F31',
    success: '#2ECC71',
    error: '#E74C3C',
    warning: '#F39C12',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#FF3980',
    iconTint: '#FF3980',
    // Action buttons
    actionButton: '#FF6B6B',
    actionButtonGradient: ['#FF6B6B', '#FF3980'],
    // Progress bars
    progressBackground: '#2B2F31',
    progressFill: '#FF3980',
    // Calendar
    calendarHighlight: '#FF3980',
    calendarBackground: '#1E2022',
    // Energy icon
    energyIcon: '#FF3980',
    // Categories with gradient options
    categories: {
      blue: '#3B82F6',
      blueGradient: ['#3B82F6', '#2563EB'],
      green: '#22C55E',
      greenGradient: ['#22C55E', '#16A34A'],
      purple: '#A855F7',
      purpleGradient: ['#A855F7', '#7E22CE'],
      orange: '#FB923C',
      orangeGradient: ['#FB923C', '#EA580C'],
      pink: '#EC4899',
      pinkGradient: ['#EC4899', '#DB2777'],
      indigo: '#818CF8',
      indigoGradient: ['#818CF8', '#6366F1'],
      teal: '#2DD4BF',
      tealGradient: ['#2DD4BF', '#0D9488'],
      amber: '#FBBF24',
      amberGradient: ['#FBBF24', '#D97706'],
      emerald: '#34D399',
      emeraldGradient: ['#34D399', '#10B981'],
      violet: '#A78BFA',
      violetGradient: ['#A78BFA', '#8B5CF6'],
      cyan: '#67E8F9',
      cyanGradient: ['#67E8F9', '#22D3EE'],
      lime: '#A3E635',
      limeGradient: ['#A3E635', '#84CC16'],
    },
  },
};
