import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatsCard } from './StatsCard';
import { GradientCard } from './GradientCard';
import { ProgressBar } from './ProgressBar';

// This would typically come from your data/context
type ActivitySummaryProps = {
  weeklyData: {
    day: string;
    completed: number;
    total: number;
  }[];
  stats: {
    steps: number;
    distance: number;
    sleep: number;
    completionRate: number;
  };
};

export const ActivitySummary = ({
  weeklyData,
  stats,
}: ActivitySummaryProps) => {
  const { colors } = useTheme();

  // Calculate max value for normalized chart heights
  const maxCompleted = Math.max(...weeklyData.map(item => item.completed));

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My Activity</Text>
        <View style={styles.tabContainer}>
          <View style={[
            styles.tabItem, 
            styles.activeTab,
            { backgroundColor: colors.primary }
          ]}>
            <Text style={styles.activeTabText}>Weekly</Text>
          </View>
          <View style={[styles.tabItem, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.tabText, { color: colors.textSecondary }]}>Monthly</Text>
          </View>
          <View style={[styles.tabItem, { backgroundColor: 'transparent' }]}>
            <Text style={[styles.tabText, { color: colors.textSecondary }]}>Daily</Text>
          </View>
        </View>
      </View>

      {/* Weekly Chart */}
      <View style={[styles.chartContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.chartHeader}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Habit Completion</Text>
          <Text style={[styles.chartSubtitle, { color: colors.textSecondary }]}>Last 7 days</Text>
        </View>
        <View style={styles.chart}>
          {weeklyData.map((day, index) => (
            <View key={index} style={styles.chartColumn}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar, 
                    { 
                      height: `${(day.completed / maxCompleted) * 100}%`,
                      backgroundColor: day.completed > 0 
                        ? colors.primary 
                        : `${colors.border}50`,
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>{day.day}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatsCard 
          title="Total"
          value={stats.steps}
          subtitle="steps"
          colors={colors.primaryGradient}
          icon={<MaterialCommunityIcons name="walk" size={24} color="#FFFFFF" />}
          style={styles.statCard}
        />
        <StatsCard 
          title="Distance"
          value={stats.distance}
          subtitle="km"
          colors={colors.secondaryGradient}
          icon={<MaterialCommunityIcons name="bike" size={24} color="#FFFFFF" />}
          style={styles.statCard}
        />
      </View>

      <View style={styles.statsRow}>
        <StatsCard 
          title="Sleep"
          value={stats.sleep}
          subtitle="hours"
          colors={[colors.categories.violet, colors.categories.indigo]}
          icon={<Ionicons name="moon" size={24} color="#FFFFFF" />}
          style={styles.statCard}
        />
        <StatsCard 
          title="Energy"
          value={`${stats.completionRate}%`}
          colors={[colors.categories.orange, colors.categories.pink]}
          icon={<Ionicons name="flash" size={24} color="#FFFFFF" />}
          style={styles.statCard}
        />
      </View>

      {/* Weekly Goal Progress */}
      <GradientCard 
        title="Weekly Goal Progress"
        colors={colors.secondaryGradient}
      >
        <View style={styles.progressContainer}>
          <View style={styles.progressRow}>
            <View style={styles.progressLabelContainer}>
              <Feather name="activity" size={18} color="#FFFFFF" />
              <Text style={styles.progressLabel}>Fitness Goal</Text>
            </View>
            <Text style={styles.progressValue}>80%</Text>
          </View>
          <View style={styles.customProgressBarContainer}>
            <View style={styles.customProgressBackground}>
              <View style={[styles.customProgressFill, { width: '80%' }]} />
            </View>
          </View>
        </View>

        <View style={[styles.progressContainer, styles.progressSpacing]}>
          <View style={styles.progressRow}>
            <View style={styles.progressLabelContainer}>
              <Feather name="book" size={18} color="#FFFFFF" />
              <Text style={styles.progressLabel}>Learning Goal</Text>
            </View>
            <Text style={styles.progressValue}>65%</Text>
          </View>
          <View style={styles.customProgressBarContainer}>
            <View style={styles.customProgressBackground}>
              <View style={[styles.customProgressFill, { width: '65%' }]} />
            </View>
          </View>
        </View>

        <View style={[styles.progressContainer, styles.progressSpacing]}>
          <View style={styles.progressRow}>
            <View style={styles.progressLabelContainer}>
              <Feather name="coffee" size={18} color="#FFFFFF" />
              <Text style={styles.progressLabel}>Mindfulness Goal</Text>
            </View>
            <Text style={styles.progressValue}>45%</Text>
          </View>
          <View style={styles.customProgressBarContainer}>
            <View style={styles.customProgressBackground}>
              <View style={[styles.customProgressFill, { width: '45%' }]} />
            </View>
          </View>
        </View>
      </GradientCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: metrics.spacing.l,
    paddingHorizontal: metrics.spacing.m,
  },
  title: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: metrics.spacing.m,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    borderRadius: metrics.borderRadius.medium,
    padding: metrics.spacing.xs,
  },
  tabItem: {
    paddingVertical: metrics.spacing.xs,
    paddingHorizontal: metrics.spacing.m,
    borderRadius: metrics.borderRadius.small,
    marginRight: metrics.spacing.xs,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabText: {
    fontWeight: '500',
  },
  chartContainer: {
    marginHorizontal: metrics.spacing.m,
    marginBottom: metrics.spacing.l,
    borderRadius: metrics.borderRadius.large,
    padding: metrics.spacing.m,
    borderWidth: 1,
  },
  chartHeader: {
    marginBottom: metrics.spacing.m,
  },
  chartTitle: {
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
  },
  chartSubtitle: {
    fontSize: metrics.fontSize.xs,
  },
  chart: {
    flexDirection: 'row',
    height: 150,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: metrics.spacing.m,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barContainer: {
    height: 120,
    width: 8,
    justifyContent: 'flex-end',
    marginBottom: metrics.spacing.xs,
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  dayLabel: {
    fontSize: metrics.fontSize.xs,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: metrics.spacing.m,
    marginBottom: metrics.spacing.m,
  },
  statCard: {
    marginRight: metrics.spacing.m,
    flex: 1,
  },
  progressContainer: {
    marginBottom: metrics.spacing.s,
  },
  progressSpacing: {
    marginTop: metrics.spacing.m,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.spacing.xs,
  },
  progressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressLabel: {
    marginLeft: metrics.spacing.xs,
    color: '#FFFFFF',
    fontSize: metrics.fontSize.s,
  },
  progressValue: {
    color: '#FFFFFF',
    fontSize: metrics.fontSize.s,
    fontWeight: '600',
  },
  customProgressBarContainer: {
    width: '100%',
    height: 8,
    marginTop: metrics.spacing.xs,
  },
  customProgressBackground: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  customProgressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
}); 