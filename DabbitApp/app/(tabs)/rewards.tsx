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
import { MOCK_EVENTS, MOCK_SUBSCRIPTIONS, MOCK_GOODIES } from '@/constants/mockEvents';
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
                    <View>
                      <View style={styles.priceInfo}>
                        <Text style={[styles.experienceOriginalPrice, { color: colors.textSecondary }]}>
                          ₹{event.price}
                        </Text>
                        <Text style={[styles.experienceDiscountedPrice, { color: colors.text }]}>
                          ₹{event.discountedPrice}
                        </Text>
                      </View>
                      <View style={styles.coinsTag}>
                        <Feather name="dollar-sign" size={12} color="#FBBF24" />
                        <Text style={styles.coinsTagText}>{300} DC</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        {/* Subscriptions Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Subscriptions
          </Text>
          
          <View style={styles.subscriptionsGrid}>
            {MOCK_SUBSCRIPTIONS && MOCK_SUBSCRIPTIONS.length > 0 ? (
              MOCK_SUBSCRIPTIONS.map((subscription) => (
                <TouchableOpacity 
                  key={subscription.id} 
                  style={[styles.itemCard, { width: itemWidth, backgroundColor: colors.surface }]}
                  onPress={() => router.push({
                    pathname: "/subscription-details/[id]",
                    params: { id: subscription.id }
                  })}
                >
                  <View style={[styles.cardImageContainer, { backgroundColor: '#e0e0e0' }]}>
                    <Image 
                      source={{ uri: subscription.imageUrl }}
                      style={styles.cardImage}
                      resizeMode="cover"
                      onError={(e) => console.log('Image failed to load:', e.nativeEvent.error)}
                    />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.5)', 'transparent']}
                      style={styles.imageGradient}
                      start={{x: 0, y: 0}}
                      end={{x: 0, y: 0.6}}
                    />
                  </View>
                  
                  <View style={styles.cardContentContainer}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
                      {subscription.name}
                    </Text>
                    
                    <Text style={[styles.itemDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                      {subscription.description}
                    </Text>
                    
                    <View>
                      <View style={styles.priceInfo}>
                        <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                          ₹{subscription.originalPrice}
                        </Text>
                        <Text style={[styles.discountedPrice, { color: colors.text }]}>
                          ₹{subscription.discountedPrice}
                        </Text>
                      </View>
                      <View style={[styles.coinsTag, { marginTop: metrics.spacing.xs }]}>
                        <Feather name="dollar-sign" size={12} color="#FBBF24" />
                        <Text style={styles.coinsTagText}>{subscription.pointsCost} DC</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.comingSoonContainer}>
                <Feather name="clock" size={32} color={colors.textSecondary} />
                <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
                  Premium app subscriptions coming soon
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Goodies Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Goodies
          </Text>
          
          <View style={styles.goodiesGrid}>
            {MOCK_GOODIES && MOCK_GOODIES.length > 0 ? (
              MOCK_GOODIES.map((goodie) => (
                <TouchableOpacity 
                  key={goodie.id} 
                  style={[styles.itemCard, { width: itemWidth, backgroundColor: colors.surface }]}
                  onPress={() => router.push({
                    pathname: "/goodie-details/[id]",
                    params: { id: goodie.id }
                  })}
                >
                  <View style={[styles.cardImageContainer, { backgroundColor: '#e0e0e0' }]}>
                    <Image 
                      source={{ uri: goodie.imageUrl }}
                      style={styles.cardImage}
                      resizeMode="cover"
                      onError={(e) => console.log('Image failed to load:', e.nativeEvent.error)}
                    />
                    <LinearGradient
                      colors={['rgba(0,0,0,0.5)', 'transparent']}
                      style={styles.imageGradient}
                      start={{x: 0, y: 0}}
                      end={{x: 0, y: 0.6}}
                    />
                  </View>
                  
                  <View style={styles.cardContentContainer}>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
                      {goodie.name}
                    </Text>
                    
                    <Text style={[styles.itemDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                      {goodie.description}
                    </Text>
                    
                    <View>
                      <View style={styles.priceInfo}>
                        <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                          ₹{goodie.originalPrice}
                        </Text>
                        <Text style={[styles.discountedPrice, { color: colors.text }]}>
                          ₹{goodie.discountedPrice}
                        </Text>
                      </View>
                      <View style={[styles.coinsTag, { marginTop: metrics.spacing.xs }]}>
                        <Feather name="dollar-sign" size={12} color="#FBBF24" />
                        <Text style={styles.coinsTagText}>{goodie.pointsCost} DC</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.comingSoonContainer}>
                <Feather name="package" size={32} color={colors.textSecondary} />
                <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>
                  Redeem coins for wellness products soon
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingVertical: metrics.spacing.xs,
    paddingHorizontal: metrics.spacing.s,
    borderRadius: metrics.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  coinsTagText: {
    color: '#FBBF24',
    fontWeight: '600',
    fontSize: metrics.fontSize.xs,
    marginLeft: 2,
  },
  subscriptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.spacing.l,
  },
  itemCard: {
    borderRadius: metrics.borderRadius.large,
    overflow: 'hidden',
    marginBottom: metrics.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  cardContentContainer: {
    padding: metrics.spacing.m,
  },
  itemTitle: {
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
    marginBottom: metrics.spacing.xs,
  },
  itemDescription: {
    fontSize: metrics.fontSize.s,
    marginBottom: metrics.spacing.m,
    lineHeight: 18,
  },
  originalPrice: {
    fontSize: metrics.fontSize.s,
    textDecorationLine: 'line-through',
    marginRight: metrics.spacing.s,
  },
  discountedPrice: {
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
    width: '100%',
  },
  comingSoonText: {
    marginTop: metrics.spacing.m,
    textAlign: 'center',
    fontSize: metrics.fontSize.m,
  },
  goodiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.spacing.l,
  },
}); 