import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';

// Bucket types
export type BucketType = 'All' | 'Morning' | 'Afternoon' | 'Evening' | 'Night';

// Props
interface BucketSelectorProps {
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

export const BucketSelector = ({ selectedBucket, onSelectBucket }: BucketSelectorProps) => {
  const { colors } = useTheme();

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {buckets.map((bucket) => (
        <TouchableOpacity
          key={bucket.id}
          style={[
            styles.bucketButton,
            {
              backgroundColor: selectedBucket === bucket.id 
                ? `${colors.primary}20` 
                : 'transparent',
              borderColor: selectedBucket === bucket.id 
                ? colors.primary 
                : colors.border,
            },
          ]}
          onPress={() => onSelectBucket(bucket.id)}
        >
          <Text style={styles.bucketEmoji}>{bucket.emoji}</Text>
          <Text 
            style={[
              styles.bucketText, 
              { 
                color: selectedBucket === bucket.id 
                  ? colors.primary 
                  : colors.text 
              }
            ]}
          >
            {bucket.id}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: metrics.spacing.m,
    paddingVertical: metrics.spacing.s,
  },
  bucketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: metrics.spacing.m,
    paddingVertical: metrics.spacing.s,
    borderRadius: metrics.borderRadius.medium,
    marginRight: metrics.spacing.s,
    borderWidth: 1,
  },
  bucketEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  bucketText: {
    fontSize: metrics.fontSize.s,
    fontWeight: '500',
  },
}); 