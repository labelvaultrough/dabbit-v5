import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/Themed';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
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
    if (completionPercentage >= 50) return 'Halfway there! You got this! 🚀';
    return 'Time to start building your habits! 🌟';
  };

  return (
    <LinearGradient
      colors={['#FF6B81', '#FF8A9B']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.container}
    >
      <View style={styles.contentContainer}>
        <View style={styles.greetingRow}>
          <Text style={styles.greeting}>{getGreeting()}, {username}!</Text>
          <Feather name="star" size={24} color="#FFD700" />
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
    borderRadius: 24,
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
    padding: 20,
  },
  greetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  dateText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    marginBottom: 16,
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
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  timeLeft: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
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
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default ProgressGreeting; 