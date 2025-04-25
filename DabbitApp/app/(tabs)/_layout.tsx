import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { BlurView } from 'expo-blur';

function TabBarIcon({ name, color }: { name: React.ComponentProps<typeof Feather>['name']; color: string }) {
  return <Feather size={24} name={name} color={color} />;
}

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background,
          position: Platform.OS === 'ios' ? 'absolute' : 'relative',
          borderTopWidth: 1,
          elevation: 0,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarBackground: () => 
          Platform.OS === 'ios' ? (
            <BlurView 
              tint={isDark ? 'dark' : 'light'} 
              intensity={90} 
              style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} 
            />
          ) : null,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color }) => <TabBarIcon name="bar-chart-2" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
        }}
      />
    </Tabs>
  );
}
