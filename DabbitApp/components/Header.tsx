import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { BucketType } from './BucketSelector';

type HeaderProps = {
  title: string;
  showBucketSelector?: boolean;
  selectedBucket?: BucketType;
  onSelectBucket?: (bucket: BucketType) => void;
};

export const Header = ({ 
  title, 
  showBucketSelector,
  selectedBucket,
  onSelectBucket
}: HeaderProps) => {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>
      
      {showBucketSelector && selectedBucket && onSelectBucket && (
        <TouchableOpacity 
          style={styles.filterContainer}
          onPress={() => onSelectBucket('All')}
        >
          <Feather name="filter" size={18} color={colors.primary} style={styles.filterIcon} />
          <Text style={[styles.filterText, { color: colors.primary }]}>All</Text>
          <Feather name="chevron-down" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 4,
  },
});

export default Header; 