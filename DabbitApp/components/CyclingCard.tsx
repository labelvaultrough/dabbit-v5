import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { GradientButton } from './GradientButton';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type CyclingCardProps = {
  distance?: number;
  time?: number;
  onStartCycling: () => void;
};

export const CyclingCard = ({ 
  distance = 8, 
  time = 25, 
  onStartCycling 
}: CyclingCardProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: colors.surface,
        borderColor: colors.border,
        shadowColor: colors.text,
      }
    ]}>
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="bike" size={24} color={colors.secondary} />
          <Text style={[styles.statValue, { color: colors.text }]}>{distance}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>min</Text>
        </View>
        
        <View style={styles.statItem}>
          <MaterialCommunityIcons name="clock-outline" size={24} color={colors.text} />
          <Text style={[styles.statValue, { color: colors.text }]}>{time}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>min</Text>
        </View>
      </View>
      
      <GradientButton
        title="Let's Go cycling!"
        onPress={onStartCycling}
        icon="navigation"
        colors={colors.secondaryGradient as string[]}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: metrics.spacing.l,
    marginHorizontal: metrics.spacing.l,
    marginVertical: metrics.spacing.m,
    borderRadius: metrics.borderRadius.large,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: metrics.spacing.l,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    marginTop: metrics.spacing.xs,
  },
  statLabel: {
    fontSize: metrics.fontSize.s,
  },
  button: {
    marginTop: metrics.spacing.m,
  },
}); 