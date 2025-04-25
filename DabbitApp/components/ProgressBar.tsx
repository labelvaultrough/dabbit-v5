import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';

type ProgressBarProps = {
  progress: number;
  label?: string;
  color?: string;
  showPercentage?: boolean;
};

export const ProgressBar = ({
  progress,
  label,
  color,
  showPercentage = true,
}: ProgressBarProps) => {
  const { colors } = useTheme();
  const progressValue = Math.min(Math.max(progress, 0), 100);
  const displayColor = color || colors.primary;

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      
      <View style={styles.barRow}>
        <View style={[styles.barContainer, { backgroundColor: `${displayColor}20` }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${progressValue}%`,
                backgroundColor: displayColor,
              },
            ]}
          />
        </View>
        
        {showPercentage && (
          <Text style={[styles.percentage, { color: colors.text }]}>
            {progressValue}%
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: metrics.spacing.m,
  },
  label: {
    fontSize: metrics.fontSize.s,
    fontWeight: '500',
    marginBottom: metrics.spacing.xs,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  percentage: {
    fontSize: metrics.fontSize.s,
    fontWeight: '600',
    marginLeft: metrics.spacing.m,
    width: 40,
    textAlign: 'right',
  },
}); 