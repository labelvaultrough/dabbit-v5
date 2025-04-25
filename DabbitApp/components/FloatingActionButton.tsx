import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';

interface FloatingActionButtonProps {
  onPress: () => void;
}

const FloatingActionButton = ({ onPress }: FloatingActionButtonProps) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.button, { backgroundColor: colors.primary }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <AntDesign name="plus" size={24} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default FloatingActionButton; 