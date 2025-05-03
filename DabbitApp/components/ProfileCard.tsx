import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

type ProfileCardProps = {
  name: string;
  streak?: number;
  habitCount?: number;
  photoUrl?: string;
  onPhotoPress?: () => void;
};

export const ProfileCard = ({
  name,
  streak = 0,
  habitCount = 0,
  photoUrl,
  onPhotoPress,
}: ProfileCardProps) => {
  const { colors } = useTheme();
  
  return (
    <LinearGradient
      colors={colors.primaryGradient as [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.photoContainer}
          onPress={onPhotoPress}
          activeOpacity={0.8}
        >
          {photoUrl ? (
            <View style={styles.photoWrapper}>
              <Image source={{ uri: photoUrl }} style={styles.photo} />
              <View style={styles.editIconContainer}>
                <Feather name="edit-2" size={14} color="#FFFFFF" />
              </View>
            </View>
          ) : (
            <View style={styles.photoWrapper}>
              <View style={[styles.photoPlaceholder, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]}>
                <Feather name="user" size={40} color="#FFFFFF" />
              </View>
              <View style={styles.editIconContainer}>
                <Feather name="edit-2" size={14} color="#FFFFFF" />
              </View>
            </View>
          )}
        </TouchableOpacity>
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{name}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{habitCount}</Text>
              <Text style={styles.statLabel}>Habits</Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: metrics.borderRadius.large,
    marginHorizontal: metrics.spacing.l,
    marginVertical: metrics.spacing.m,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  content: {
    padding: metrics.spacing.l,
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoContainer: {
    marginRight: metrics.spacing.l,
  },
  photoWrapper: {
    position: 'relative',
  },
  photo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  photoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: metrics.fontSize.xl,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: metrics.spacing.m,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: metrics.fontSize.l,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: metrics.fontSize.xs,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  divider: {
    height: 30,
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: metrics.spacing.s,
  },
}); 