import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '@/components/GradientButton';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { MOCK_DISCOUNTS, MOCK_EVENTS } from '@/constants/mockEvents';
import { Event } from '@/types/points';
import { format, parseISO } from 'date-fns';
import DabbitCoinsCard from '@/components/PointsInsightsCard';

// Mock coins value
const MOCK_COINS = 450;

export default function RewardsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  // Calculate screen width for proper two-column layout
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - (metrics.spacing.l * 3)) / 2; // Two items per row with margins
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style="auto" />
      
      <Stack.Screen options={{ headerShown: false }} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Dabbit Coins
        </Text>
        
        <View style={styles.coinsContainer}>
          <Feather name="dollar-sign" size={20} color="#FBBF24" />
          <Text style={styles.coinsText}>{MOCK_COINS} DC</Text>
        </View>
      </View>
      
      {/* Main Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.mainContent}
        contentContainerStyle={styles.mainContentContainer}
      >
        {/* Dabbit Coins Card */}
        <DabbitCoinsCard currentCoins={MOCK_COINS} />
        
        {/* Discounts Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Discounts
          </Text>
          
          {/* Horizontal scrolling container with extra right padding */}
          <View style={styles.discountScrollContainer}>
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: metrics.spacing.l }}
              alwaysBounceHorizontal={true}
              overScrollMode="always"
            >
              {MOCK_DISCOUNTS.map((discount, index) => (
                <View
                  key={discount.id}
                  style={[
                    styles.discountWrapper,
                    // Add extra padding to last item
                    index === MOCK_DISCOUNTS.length - 1 ? { marginRight: metrics.spacing.xxl * 2 } : {}
                  ]}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF3980']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.discountCard}
                  >
                    <Text style={styles.discountTitle}>{discount.name}</Text>
                    <View style={styles.discountDetails}>
                      <View style={styles.discountCoins}>
                        <Feather name="dollar-sign" size={16} color="#FBBF24" />
                        <Text style={styles.discountCoinsText}>{discount.pointsCost} DC</Text>
                      </View>
                      <Text style={styles.discountValue}>₹{discount.discountAmount}</Text>
                    </View>
                  </LinearGradient>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
        
        {/* Experiences Section - Changed from "Events" */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Experiences You Can Redeem
          </Text>
          
          <View style={styles.experiencesGrid}>
            {MOCK_EVENTS.map((event) => (
              <TouchableOpacity 
                key={event.id} 
                style={[styles.experienceCard, { width: itemWidth }]}
                onPress={() => router.push(`/event-details/${event.id}`)}
              >
                <Image 
                  source={{ uri: event.imageUrl }} 
                  style={styles.experienceImage} 
                  resizeMode="cover"
                />
                
                <View style={[styles.experienceContent, { backgroundColor: colors.surface }]}>
                  <Text 
                    style={[styles.experienceTitle, { color: colors.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {event.name}
                  </Text>
                  
                  <View style={styles.experienceDetail}>
                    <Feather name="map-pin" size={12} color={colors.textSecondary} />
                    <Text 
                      style={[styles.experienceLocation, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {event.location.city}
                    </Text>
                  </View>
                  
                  <View style={styles.experiencePricing}>
                    <Text style={[styles.experienceOriginalPrice, { color: colors.textSecondary }]}>
                      ₹{event.price}
                    </Text>
                    <Text style={[styles.experienceDiscountedPrice, { color: colors.text }]}>
                      ₹{event.discountedPrice}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Subscriptions Section - New */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Subscriptions
          </Text>
          
          <View style={styles.comingSoonContainer}>
            <Feather name="clock" size={32} color={colors.textSecondary} />
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              Premium app subscriptions coming soon
            </Text>
          </View>
        </View>
        
        {/* Merchandise Section - New */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Wellness Essentials
          </Text>
          
          <View style={styles.comingSoonContainer}>
            <Feather name="package" size={32} color={colors.textSecondary} />
            <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
              Redeem coins for wellness products soon
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type DiscountCardProps = {
  title: string;
  coins: number;
  value: number;
};

function DiscountCard({ title, coins, value }: DiscountCardProps) {
  return (
    <LinearGradient
      colors={['#FF6B6B', '#FF3980']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.discountCard}
    >
      <Text style={styles.discountTitle}>{title}</Text>
      <View style={styles.discountDetails}>
        <View style={styles.discountCoins}>
          <Feather name="dollar-sign" size={16} color="#FBBF24" />
          <Text style={styles.discountCoinsText}>{coins} DC</Text>
        </View>
        <Text style={styles.discountValue}>₹{value}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.spacing.l,
    paddingVertical: metrics.spacing.m,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: '600',
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: metrics.spacing.m,
    paddingVertical: metrics.spacing.s,
    borderRadius: metrics.borderRadius.medium,
  },
  coinsText: {
    color: '#FBBF24',
    fontWeight: '600',
    marginLeft: metrics.spacing.xs,
  },
  mainContent: {
    flex: 1,
  },
  mainContentContainer: {
    paddingBottom: metrics.spacing.xl,
  },
  section: {
    marginBottom: metrics.spacing.l,
  },
  sectionTitle: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
    marginHorizontal: metrics.spacing.l,
    marginBottom: metrics.spacing.m,
  },
  discountsRow: {
    paddingHorizontal: metrics.spacing.l,
    paddingRight: metrics.spacing.xxl,
  },
  discountScrollContainer: {
    marginBottom: metrics.spacing.m,
    // Add a small indicator that there are more cards
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
    marginRight: metrics.spacing.l,
  },
  discountWrapper: {
    marginRight: metrics.spacing.m,
    // Add subtle shadow to make cards stand out
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  discountCard: {
    width: 180,
    borderRadius: metrics.borderRadius.large,
    padding: metrics.spacing.m,
  },
  discountTitle: {
    color: '#FFFFFF',
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
    marginBottom: metrics.spacing.s,
  },
  discountDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountCoins: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: metrics.spacing.xs,
    paddingHorizontal: metrics.spacing.s,
    borderRadius: metrics.borderRadius.medium,
  },
  discountCoinsText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: metrics.spacing.xs,
  },
  discountValue: {
    color: '#FFFFFF',
    fontSize: metrics.fontSize.l,
    fontWeight: '700',
  },
  experiencesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.spacing.l,
    marginTop: metrics.spacing.s,
  },
  experienceCard: {
    borderRadius: metrics.borderRadius.large,
    overflow: 'hidden',
    marginBottom: metrics.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  experienceImage: {
    width: '100%',
    height: 120,
  },
  experienceContent: {
    padding: metrics.spacing.m,
  },
  experienceTitle: {
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
    marginBottom: metrics.spacing.xs,
  },
  experienceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.spacing.xs,
  },
  experienceLocation: {
    marginLeft: metrics.spacing.xs,
    fontSize: metrics.fontSize.xs,
  },
  experiencePricing: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: metrics.spacing.xs,
  },
  experienceOriginalPrice: {
    fontSize: metrics.fontSize.xs,
    textDecorationLine: 'line-through',
    marginRight: metrics.spacing.xs,
  },
  experienceDiscountedPrice: {
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: metrics.spacing.xl,
    borderRadius: metrics.borderRadius.large,
    marginHorizontal: metrics.spacing.l,
  },
  comingSoonText: {
    marginTop: metrics.spacing.m,
    textAlign: 'center',
    fontSize: metrics.fontSize.m,
  },
}); 