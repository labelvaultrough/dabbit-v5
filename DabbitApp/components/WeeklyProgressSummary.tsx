import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { ProgressBar } from './ProgressBar';
import { ProgressCard } from './ProgressCard';

type WeeklyProgressSummaryProps = {
  completedCount: number;
  totalCount: number;
};

export const WeeklyProgressSummary = ({
  completedCount,
  totalCount,
}: WeeklyProgressSummaryProps) => {
  const { colors } = useTheme();
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <ProgressCard title="Weekly Completions">
      <View style={styles.progressContainer}>
        <Text style={[styles.fractionText, { color: colors.primary }]}>
          {completedCount}/{totalCount}
        </Text>

        <View style={styles.percentageContainer}>
          <Text style={[styles.percentageText, { color: colors.textSecondary }]}>
            {progressPercentage}%
          </Text>
        </View>
      </View>

      <ProgressBar 
        progress={progressPercentage} 
        showPercentage={false} 
      />
    </ProgressCard>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.spacing.l,
  },
  fractionText: {
    fontSize: metrics.fontSize.xxxl,
    fontWeight: 'bold',
  },
  percentageContainer: {
    alignItems: 'flex-end',
  },
  percentageText: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
  },
}); 