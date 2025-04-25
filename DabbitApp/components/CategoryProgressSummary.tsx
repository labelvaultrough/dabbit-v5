import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { ProgressBar } from './ProgressBar';
import { ProgressCard } from './ProgressCard';
import { Category } from '@/types/habit';

type CategoryProgressItem = {
  category: Category;
  progress: number;
  habitCount: number;
};

type CategoryProgressSummaryProps = {
  categoryProgress: CategoryProgressItem[];
};

export const CategoryProgressSummary = ({ categoryProgress }: CategoryProgressSummaryProps) => {
  const { colors } = useTheme();

  // Sort categories by progress in descending order
  const sortedCategories = [...categoryProgress].sort((a, b) => b.progress - a.progress);

  return (
    <ProgressCard title="Weekly Category Progress">
      {sortedCategories.map((item) => {
        const categoryColor = colors.categories[item.category.color as keyof typeof colors.categories];
        
        return (
          <ProgressBar
            key={item.category.id}
            progress={item.progress}
            label={item.category.name}
            color={categoryColor}
          />
        );
      })}
    </ProgressCard>
  );
};

const styles = StyleSheet.create({}); 