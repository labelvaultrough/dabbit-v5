import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { addAlpha } from '@/utils/colorUtils';

interface FloatingActionButtonProps {
  onPress: () => void;
}

const FloatingActionButton = ({ onPress }: FloatingActionButtonProps) => {
  const { colors } = useTheme();
  
  // Use our utility function to get a consistent shadow color with opacity
  const shadowColorWithOpacity = addAlpha('#000', 0.25);
  
  return (
    <TouchableOpacity 
      style={[
        styles.container,
        {
          shadowColor: shadowColorWithOpacity,
        }
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={colors.primaryGradient as [string, string, ...string[]]}
        style={styles.button}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <AntDesign name="plus" size={24} color="white" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, // This opacity is still needed for the shadow system
    shadowRadius: 3.84,
  },
  button: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FloatingActionButton; 