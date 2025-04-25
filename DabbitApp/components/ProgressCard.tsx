import React, { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';

type ProgressCardProps = {
  title: string;
  children: ReactNode;
};

export const ProgressCard = ({ title, children }: ProgressCardProps) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.title, { color: colors.textSecondary }]}>{title}</Text>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: metrics.borderRadius.medium,
    padding: metrics.spacing.l,
    marginBottom: metrics.spacing.l,
    marginHorizontal: metrics.spacing.l,
    borderWidth: 1,
    overflow: 'hidden',
  },
  title: {
    fontSize: metrics.fontSize.s,
    fontWeight: '600',
    marginBottom: metrics.spacing.m,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
  },
}); 