import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';

interface ProgressGreetingProps {
  username: string;
  completionPercentage: number;
  timeLeft: number;
  date: Date;
}

export function ProgressGreeting({ username, completionPercentage, timeLeft, date }: ProgressGreetingProps) {
  const { colors } = useTheme();
  
  // Get the appropriate greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get motivational message based on completion percentage
  const getMotivationalMessage = () => {
    if (completionPercentage === 100) return 'All done for today! Amazing work! 🎉';
    if (completionPercentage >= 75) return 'Almost there! Keep going! 💪';
    if (completionPercentage >= 50) return 'Halfway there! You got this! 🚀';
    if (completionPercentage >= 25) return 'Good progress! Keep it up! 👍';
    if (completionPercentage > 0) return 'You\'ve made a start! Keep going! 🌱';
    return 'Time to start building your habits! 🌟';
  };

  // Get appropriate emoji for progress
  const getProgressEmoji = () => {
    if (completionPercentage === 100) return '🎯';
    if (completionPercentage >= 75) return '🔥';
    if (completionPercentage >= 50) return '💫';
    if (completionPercentage >= 25) return '✨';
    if (completionPercentage > 0) return '🌱';
    return '🚀';
  };

  return (
    <LinearGradient
      colors={colors.primaryGradient as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>{getGreeting()}, {username}!</Text>
          <Text style={styles.emoji}>{getProgressEmoji()}</Text>
        </View>
        
        <Text style={styles.dateText}>{format(date, 'EEEE, MMMM d')}</Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>{Math.round(completionPercentage)}% complete</Text>
            <Text style={styles.timeLeft}>{timeLeft} {timeLeft === 1 ? 'hour' : 'hours'} left today</Text>
          </View>
          
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${completionPercentage}%` }
              ]} 
            />
          </View>
          
          <Text style={styles.motivationalText}>{getMotivationalMessage()}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  contentContainer: {
    padding: 16,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  emoji: {
    fontSize: 24,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  timeLeft: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  motivationalText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default ProgressGreeting; 