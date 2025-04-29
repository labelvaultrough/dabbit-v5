import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Pressable, Animated, Platform, Dimensions } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { Feather } from '@expo/vector-icons';
import { BucketType } from './BucketSelector';
import { getCurrentTimeBucket } from './HabitItem';

// Props
interface BucketDropdownProps {
  selectedBucket: BucketType;
  onSelectBucket: (bucket: BucketType) => void;
}

// Bucket data with emojis
const buckets: { id: BucketType; emoji: string }[] = [
  { id: 'All', emoji: '📋' },
  { id: 'Morning', emoji: '🌞' },
  { id: 'Afternoon', emoji: '⛅' },
  { id: 'Evening', emoji: '✨' },
  { id: 'Night', emoji: '🌕' },
];

export const BucketDropdown = ({ selectedBucket, onSelectBucket }: BucketDropdownProps) => {
  const { colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(0);
  const { width: screenWidth } = Dimensions.get('window');
  
  // Animation for breathing effect
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  
  // Get the current time bucket
  const currentTimeBucket = getCurrentTimeBucket() as BucketType | null;
  
  // Get the current selected bucket data
  const currentBucket = buckets.find(b => b.id === selectedBucket) || buckets[0];

  useEffect(() => {
    if (isOpen) {
      // Start pulsing animation when dropdown is open
      const pulse = Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.5,
          duration: 800,
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: false,
        })
      ]);
      
      Animated.loop(pulse).start();
      
      // Animate dropdown opening
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      // Stop animation when dropdown is closed
      pulseAnim.setValue(1);
      pulseAnim.stopAnimation();
      
      // Animate dropdown closing
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
    
    return () => {
      pulseAnim.stopAnimation();
      dropdownAnim.stopAnimation();
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (bucket: BucketType) => {
    onSelectBucket(bucket);
    setIsOpen(false);
  };

  const handleLayout = (event: any) => {
    const { width } = event.nativeEvent.layout;
    setContainerWidth(width);
  };

  const maxHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300]  // Increased to accommodate all items
  });

  const opacity = dropdownAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1]
  });

  // Fixed width for both button and dropdown (150px to fit "Afternoon" completely)
  const FIXED_WIDTH = 150;

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          { 
            borderColor: colors.border,
            backgroundColor: `${colors.primary}10`,
            width: FIXED_WIDTH
          }
        ]}
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        <Text style={styles.bucketEmoji}>{currentBucket.emoji}</Text>
        <Text style={[styles.bucketText, { color: colors.text }]} numberOfLines={1}>
          {currentBucket.id}
        </Text>
        <Feather 
          name={isOpen ? "chevron-up" : "chevron-down"} 
          size={16} 
          color={colors.iconTint} 
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* Dropdown Overlay - only show when open */}
      {isOpen && (
        <Pressable 
          style={[styles.dropdownOverlay, { top: -200, left: -200 }]}
          onPress={() => setIsOpen(false)}
        />
      )}
      
      {/* Dropdown Menu */}
      {isOpen && (
        <Animated.View 
          style={[
            styles.dropdown, 
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
              shadowColor: '#000',
              top: 48, // Position below the button
              maxHeight,
              opacity,
              width: FIXED_WIDTH,
              ...Platform.select({
                ios: {
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                },
                android: {
                  elevation: 8,
                },
              }),
            }
          ]}
          pointerEvents={isOpen ? 'auto' : 'none'}
        >
          {buckets.map((bucket) => (
            <TouchableOpacity
              key={bucket.id}
              style={[
                styles.dropdownItem,
                { 
                  backgroundColor: selectedBucket === bucket.id 
                    ? `${colors.primary}20` 
                    : 'transparent'
                }
              ]}
              onPress={() => handleSelect(bucket.id)}
            >
              <Text style={styles.bucketEmoji}>{bucket.emoji}</Text>
              <Text 
                style={[
                  styles.dropdownItemText, 
                  { 
                    color: selectedBucket === bucket.id 
                      ? colors.primary 
                      : colors.text,
                    fontWeight: selectedBucket === bucket.id ? '600' : '400'
                  }
                ]}
                numberOfLines={1}
              >
                {bucket.id}
              </Text>
              
              {/* Current time indicator - red pulsing dot */}
              {currentTimeBucket === bucket.id && bucket.id !== 'All' && (
                <Animated.View 
                  style={[
                    styles.currentTimeDot,
                    { 
                      backgroundColor: colors.energyIcon,
                      width: pulseAnim.interpolate({
                        inputRange: [1, 1.5],
                        outputRange: [8, 12]
                      }),
                      height: pulseAnim.interpolate({
                        inputRange: [1, 1.5],
                        outputRange: [8, 12]
                      }),
                      borderRadius: pulseAnim.interpolate({
                        inputRange: [1, 1.5],
                        outputRange: [4, 6]
                      }),
                    }
                  ]} 
                />
              )}
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: metrics.spacing.m,
    paddingVertical: metrics.spacing.s,
    borderRadius: metrics.borderRadius.medium,
    borderWidth: 1,
  },
  dropdownOverlay: {
    position: 'absolute',
    width: 5000,
    height: 5000,
    backgroundColor: 'transparent',
    zIndex: 1000,
  },
  dropdown: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: metrics.borderRadius.medium,
    overflow: 'hidden',
    zIndex: 2000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: metrics.spacing.m,
    paddingVertical: metrics.spacing.m,
  },
  bucketEmoji: {
    fontSize: 20,
    marginRight: metrics.spacing.s,
  },
  bucketText: {
    fontSize: metrics.fontSize.m,
    flex: 1,
  },
  dropdownItemText: {
    fontSize: metrics.fontSize.m,
    flex: 1,
  },
  icon: {
    marginLeft: metrics.spacing.xs,
  },
  currentTimeDot: {
    marginLeft: metrics.spacing.s,
  },
}); 