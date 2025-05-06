import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';

// Mock data for the 7-day coins graph
const MOCK_DAILY_COINS = [60, 45, 70, 85, 90, 65, 40];
const WEEKLY_TARGET = 600;

type DabbitCoinsCardProps = {
  currentCoins: number;
};

export default function DabbitCoinsCard({ currentCoins }: DabbitCoinsCardProps) {
  const { colors } = useTheme();
  const [infoExpanded, setInfoExpanded] = useState(false);
  
  // Calculate weekly progress percentage
  const weeklyProgress = Math.min(100, (currentCoins / WEEKLY_TARGET) * 100);
  
  // Find the max value in the daily coins array for scaling the graph
  const maxCoins = Math.max(...MOCK_DAILY_COINS);
  
  return (
    <View style={styles.containerWrapper}>
      <View style={[styles.container, { backgroundColor: colors.surface, shadowColor: '#000' }]}>
        {/* Dabbit Coins Balance and Weekly Target */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.coinsBalance}>{currentCoins} DC</Text>
            <Text style={[styles.weeklyTarget, { color: colors.textSecondary }]}>
              Weekly Target: {WEEKLY_TARGET} DC
            </Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.infoButton, { backgroundColor: 'rgba(86, 204, 242, 0.1)' }]}
            onPress={() => setInfoExpanded(!infoExpanded)}
          >
            <Text style={styles.infoButtonText}>How Coins Work</Text>
          </TouchableOpacity>
        </View>
        
        {/* Weekly Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBarBackground, { backgroundColor: colors.border }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { width: `${weeklyProgress}%`, backgroundColor: '#FF3980' }
              ]} 
            />
          </View>
        </View>
        
        {/* Coins Info Panel (collapsible) */}
        {infoExpanded && (
          <View style={[styles.infoPanel, { backgroundColor: 'rgba(86, 204, 242, 0.05)', borderColor: 'rgba(86, 204, 242, 0.2)' }]}>
            <Text style={styles.infoPanelTitle}>How Dabbit Coins Are Earned:</Text>
            <Text style={styles.infoPanelText}>• First 15 mins: 5 DC</Text>
            <Text style={styles.infoPanelText}>• Second 15 mins: 4 DC</Text>
            <Text style={styles.infoPanelText}>• Third 15 mins: 3 DC</Text>
            <Text style={styles.infoPanelText}>• Daily cap per habit: 15 DC</Text>
            <TouchableOpacity style={styles.learnMoreButton}>
              <Text style={styles.learnMoreText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* 7-Day Coins Graph */}
        <View style={styles.graphContainer}>
          {MOCK_DAILY_COINS.map((coins, index) => {
            const barHeight = (coins / maxCoins) * 70; // Max height 70
            const isToday = index === MOCK_DAILY_COINS.length - 1;
            return (
              <View key={index} style={styles.graphBarContainer}>
                <View 
                  style={[
                    styles.graphBar, 
                    { 
                      height: barHeight, 
                      backgroundColor: isToday ? '#FF3980' : 'rgba(255, 57, 128, 0.7)' 
                    }
                  ]} 
                />
                <Text style={[styles.graphBarDay, { color: colors.textSecondary }]}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                </Text>
              </View>
            );
          })}
        </View>
        
        {/* Bonus Coins Opportunity */}
        <LinearGradient
          colors={['#FFDD80', '#FFB347']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bonusCard}
        >
          <View style={styles.bonusCardContent}>
            <View>
              <Text style={styles.bonusCardTitle}>2x Coins Weekend!</Text>
              <Text style={styles.bonusCardDescription}>Complete habits this weekend</Text>
            </View>
            
            <TouchableOpacity style={styles.learnMoreButton}>
              <Text style={styles.learnMoreText}>Learn More</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  containerWrapper: {
    paddingHorizontal: metrics.spacing.l,
    marginBottom: metrics.spacing.m,
  },
  container: {
    borderRadius: metrics.borderRadius.large,
    paddingHorizontal: metrics.spacing.l,
    paddingVertical: metrics.spacing.m,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: metrics.spacing.s,
  },
  coinsBalance: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  weeklyTarget: {
    fontSize: 14,
    marginTop: 2,
  },
  infoButton: {
    paddingHorizontal: metrics.spacing.m,
    paddingVertical: metrics.spacing.xs,
    borderRadius: 16,
  },
  infoButtonText: {
    fontSize: 12,
    color: '#56CCF2',
    fontWeight: '500',
  },
  progressBarContainer: {
    marginBottom: metrics.spacing.m,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  infoPanel: {
    padding: metrics.spacing.m,
    borderRadius: metrics.borderRadius.medium,
    borderWidth: 1,
    marginBottom: metrics.spacing.m,
  },
  infoPanelTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: metrics.spacing.s,
    color: '#333',
  },
  infoPanelText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  graphContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 90,
    marginBottom: metrics.spacing.m,
  },
  graphBarContainer: {
    alignItems: 'center',
    flex: 1,
  },
  graphBar: {
    width: 6,
    borderRadius: 3,
    marginBottom: 6,
  },
  graphBarDay: {
    fontSize: 12,
  },
  bonusCard: {
    borderRadius: metrics.borderRadius.medium,
    overflow: 'hidden',
  },
  bonusCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: metrics.spacing.m,
  },
  bonusCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#703D00',
    marginBottom: 2,
  },
  bonusCardDescription: {
    fontSize: 13,
    color: '#703D00',
    opacity: 0.8,
  },
  learnMoreButton: {
    paddingHorizontal: metrics.spacing.s,
    paddingVertical: metrics.spacing.xs,
  },
  learnMoreText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#703D00',
  },
}); 