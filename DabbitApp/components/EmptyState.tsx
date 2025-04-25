import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { Feather } from '@expo/vector-icons';

type EmptyStateAction = {
  label: string;
  onPress: () => void;
};

type EmptyStateProps = {
  title: string;
  message: string;
  icon?: keyof typeof Feather.glyphMap;
  action?: EmptyStateAction;
};

export const EmptyState = ({ title, message, icon = 'inbox', action }: EmptyStateProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <Feather name={icon} size={64} color={colors.border} />
      
      <Text style={[styles.title, { color: colors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>
      
      {action && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={action.onPress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>{action.label}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: metrics.spacing.xl,
  },
  title: {
    fontSize: metrics.fontSize.xl,
    fontWeight: '600',
    marginTop: metrics.spacing.l,
    marginBottom: metrics.spacing.s,
    textAlign: 'center',
  },
  message: {
    fontSize: metrics.fontSize.m,
    textAlign: 'center',
    marginBottom: metrics.spacing.l,
  },
  button: {
    paddingHorizontal: metrics.spacing.l,
    paddingVertical: metrics.spacing.m,
    borderRadius: metrics.borderRadius.medium,
    marginTop: metrics.spacing.m,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
  },
}); 