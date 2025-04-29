import { Tabs } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

function TabBarIcon({ 
  name, 
  color, 
  isActive 
}: { 
  name: React.ComponentProps<typeof Feather>['name']; 
  color: string;
  isActive: boolean;
}) {
  const { colors } = useTheme();
  
  if (isActive) {
    return (
      <View style={{ width: 40, height: 40, justifyContent: 'center', alignItems: 'center' }}>
        <LinearGradient
          colors={colors.primaryGradient as [string, string, ...string[]]}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 20,
            opacity: 0.1
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <Feather size={24} name={name} color={colors.primary} />
      </View>
    );
  }
  
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
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="bar-chart-2" color={color} isActive={focused} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="home" color={color} isActive={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, focused }) => <TabBarIcon name="settings" color={color} isActive={focused} />,
        }}
      />
    </Tabs>
  );
}
