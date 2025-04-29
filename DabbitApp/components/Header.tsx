import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { format } from 'date-fns';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BucketDropdown } from './BucketDropdown';
import { BucketType } from './BucketSelector';
import { LinearGradient } from 'expo-linear-gradient';

type HeaderProps = {
  title: string;
  date?: Date;
  showAddButton?: boolean;
  onAddPress?: () => void;
  showBucketSelector?: boolean;
  selectedBucket?: BucketType;
  onSelectBucket?: (bucket: BucketType) => void;
};

export const Header = ({ 
  title, 
  date, 
  showAddButton, 
  onAddPress,
  showBucketSelector,
  selectedBucket,
  onSelectBucket
}: HeaderProps) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[
      styles.container, 
      { 
        borderBottomColor: colors.border,
        paddingTop: insets.top || (Platform.OS === 'ios' ? metrics.spacing.xxl : metrics.spacing.l)
      }
    ]}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {date && (
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {format(date, 'EEEE, MMMM d')}
          </Text>
        )}
      </View>
      
      <View style={styles.rightContainer}>
        {showBucketSelector && selectedBucket && onSelectBucket && (
          <BucketDropdown 
            selectedBucket={selectedBucket}
            onSelectBucket={onSelectBucket}
          />
        )}
        
        {showAddButton && (
          <TouchableOpacity
            style={[
              styles.addButtonContainer, 
              { 
                marginLeft: showBucketSelector ? metrics.spacing.m : 0
              }
            ]}
            onPress={onAddPress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={colors.primaryGradient as [string, string, ...string[]]}
              style={styles.addButton}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Feather name="plus" size={metrics.iconSize.medium} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: metrics.spacing.l,
    paddingBottom: metrics.spacing.m,
    borderBottomWidth: 1,
    marginBottom: metrics.spacing.m,
  },
  titleContainer: {
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: metrics.fontSize.xl,
    marginBottom: metrics.spacing.s,
    fontWeight: 'bold',
  },
  date: {
    fontSize: metrics.fontSize.m,
  },
  addButtonContainer: {
    width: 42,
    height: 42,
    borderRadius: metrics.borderRadius.round,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  addButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 