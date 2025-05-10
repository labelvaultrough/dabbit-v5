import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { MOCK_EVENTS, MOCK_SUBSCRIPTIONS, MOCK_GOODIES } from '@/constants/mockEvents';

// Mock coins value
const MOCK_COINS = 450;

// Mock volunteering events
const MOCK_VOLUNTEERING = [
  {
    id: '1',
    name: 'Beach Clean-up Drive',
    description: 'Help clean the local beach and earn Dabbit Coins',
    date: '2025-06-10',
    location: { name: 'Juhu Beach', city: 'Mumbai' },
    duration: '3 hours',
    coinsEarnable: 200,
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '2',
    name: 'Food Distribution Drive',
    description: 'Distribute food packages to the homeless',
    date: '2025-06-15',
    location: { name: 'City Center', city: 'Delhi' },
    duration: '4 hours',
    coinsEarnable: 250,
    imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd59c036b8ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
  {
    id: '3',
    name: 'Tree Planting Initiative',
    description: 'Plant trees in your local community park',
    date: '2025-06-20',
    location: { name: 'Central Park', city: 'Bangalore' },
    duration: '5 hours',
    coinsEarnable: 300,
    imageUrl: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  },
];

// Main category tabs
const MAIN_CATEGORIES = [
  { id: 'redeem', label: 'Redeem', icon: 'gift' as const },
  { id: 'earn', label: 'Earn', icon: 'award' as const },
];

// Redeem subcategory tabs
const REDEEM_CATEGORIES = [
  { id: 'experiences', label: 'Experiences', icon: 'compass' as const },
  { id: 'subscriptions', label: 'Subscriptions', icon: 'smartphone' as const },
  { id: 'goodies', label: 'Goodies', icon: 'package' as const },
];

export default function MarketplaceScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeMainCategory, setActiveMainCategory] = useState<'redeem' | 'earn'>('redeem');
  const [activeRedeemCategory, setActiveRedeemCategory] = useState('experiences');
  
  // Calculate screen width for proper two-column layout
  const screenWidth = Dimensions.get('window').width;
  const itemWidth = (screenWidth - (metrics.spacing.l * 3)) / 2; // Two items per row with margins
  
  const renderRedeemContent = () => {
    switch(activeRedeemCategory) {
      case 'experiences':
        return (
          <View style={styles.grid}>
            {MOCK_EVENTS.map((event) => (
              <TouchableOpacity 
                key={event.id} 
                style={[styles.card, { width: itemWidth }]}
                onPress={() => router.push({
                  pathname: "/event-details/[id]",
                  params: { id: event.id }
                })}
              >
                <Image 
                  source={{ uri: event.imageUrl }} 
                  style={styles.cardImage} 
                  resizeMode="cover"
                />
                
                <View style={[styles.cardContent, { backgroundColor: colors.surface }]}>
                  <Text 
                    style={[styles.cardTitle, { color: colors.text }]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {event.name}
                  </Text>
                  
                  <View style={styles.cardDetail}>
                    <Feather name="map-pin" size={12} color={colors.textSecondary} />
                    <Text 
                      style={[styles.cardLocation, { color: colors.textSecondary }]}
                      numberOfLines={1}
                    >
                      {event.location.city}
                    </Text>
                  </View>
                  
                  <View style={styles.cardPricing}>
                    <View>
                      <View style={styles.priceInfo}>
                        <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                          ₹{event.price}
                        </Text>
                        <Text style={[styles.discountedPrice, { color: colors.text }]}>
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
        );
      
      case 'subscriptions':
        return (
          <View style={styles.grid}>
            {MOCK_SUBSCRIPTIONS.map((subscription) => (
              <TouchableOpacity 
                key={subscription.id} 
                style={[styles.card, { width: itemWidth, backgroundColor: colors.surface }]}
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
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.5)', 'transparent']}
                    style={styles.imageGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 0, y: 0.6}}
                  />
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                    {subscription.name}
                  </Text>
                  
                  <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
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
            ))}
          </View>
        );
      
      case 'goodies':
        return (
          <View style={styles.grid}>
            {MOCK_GOODIES.map((goodie) => (
              <TouchableOpacity 
                key={goodie.id} 
                style={[styles.card, { width: itemWidth, backgroundColor: colors.surface }]}
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
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.5)', 'transparent']}
                    style={styles.imageGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 0, y: 0.6}}
                  />
                </View>
                
                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                    {goodie.name}
                  </Text>
                  
                  <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
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
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };
  
  const renderEarnContent = () => {
    return (
      <View style={styles.grid}>
        {MOCK_VOLUNTEERING.map((opportunity) => (
          <TouchableOpacity 
            key={opportunity.id} 
            style={[styles.card, { width: itemWidth, backgroundColor: colors.surface }]}
            // In a full implementation, this would link to a volunteering details page
            onPress={() => alert(`You would register for ${opportunity.name} here`)}
          >
            <View style={[styles.cardImageContainer, { backgroundColor: '#e0e0e0' }]}>
              <Image 
                source={{ uri: opportunity.imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'transparent']}
                style={styles.imageGradient}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 0.6}}
              />
            </View>
            
            <View style={styles.cardContent}>
              <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                {opportunity.name}
              </Text>
              
              <Text style={[styles.cardDescription, { color: colors.textSecondary }]} numberOfLines={2}>
                {opportunity.description}
              </Text>
              
              <View style={styles.earnDetailsRow}>
                <View style={styles.earnDetailsItem}>
                  <Feather name="calendar" size={12} color={colors.textSecondary} />
                  <Text style={[styles.earnDetailsText, { color: colors.textSecondary }]}>
                    {opportunity.date}
                  </Text>
                </View>
                <View style={styles.earnDetailsItem}>
                  <Feather name="clock" size={12} color={colors.textSecondary} />
                  <Text style={[styles.earnDetailsText, { color: colors.textSecondary }]}>
                    {opportunity.duration}
                  </Text>
                </View>
              </View>
              
              <View style={[styles.earnCoinsContainer, { backgroundColor: 'rgba(251, 191, 36, 0.1)' }]}>
                <Feather name="dollar-sign" size={14} color="#FBBF24" />
                <Text style={styles.earnCoinsText}>
                  Earn {opportunity.coinsEarnable} DC
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style="auto" />
      
      <Stack.Screen options={{ 
        headerTitle: "Marketplace",
        headerLeft: () => (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <View style={styles.coinsContainer}>
            <Feather name="dollar-sign" size={20} color="#FBBF24" />
            <Text style={styles.coinsText}>{MOCK_COINS} DC</Text>
          </View>
        ),
      }} />
      
      {/* Main Content */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.mainContent}
        contentContainerStyle={styles.mainContentContainer}
      >
        {/* Main Category Tabs */}
        <View style={styles.mainTabsContainer}>
          {MAIN_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.mainTabButton,
                activeMainCategory === category.id && styles.activeMainTabButton,
                { 
                  backgroundColor: activeMainCategory === category.id 
                    ? colors.primary 
                    : 'transparent',
                  borderColor: colors.primary
                }
              ]}
              onPress={() => setActiveMainCategory(category.id as 'redeem' | 'earn')}
            >
              <Feather 
                name={category.icon} 
                size={20} 
                color={activeMainCategory === category.id ? '#FFF' : colors.primary} 
              />
              <Text 
                style={[
                  styles.mainTabText,
                  { color: activeMainCategory === category.id ? '#FFF' : colors.primary }
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Subcategory Tabs - Only shown for Redeem */}
        {activeMainCategory === 'redeem' && (
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subTabsContainer}
          >
            {REDEEM_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.subTabButton,
                  activeRedeemCategory === category.id && styles.activeSubTabButton,
                  { 
                    backgroundColor: activeRedeemCategory === category.id 
                      ? colors.secondary 
                      : colors.surface,
                    borderColor: colors.secondary
                  }
                ]}
                onPress={() => setActiveRedeemCategory(category.id)}
              >
                <Feather 
                  name={category.icon} 
                  size={16} 
                  color={activeRedeemCategory === category.id ? '#FFF' : colors.secondary} 
                />
                <Text 
                  style={[
                    styles.subTabText,
                    { color: activeRedeemCategory === category.id ? '#FFF' : colors.secondary }
                  ]}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        
        {/* Content Section */}
        <View style={styles.contentSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {activeMainCategory === 'redeem' 
              ? (activeRedeemCategory === 'experiences' 
                  ? 'Experiences You Can Redeem'
                  : activeRedeemCategory === 'subscriptions'
                    ? 'Premium Subscriptions'
                    : 'Wellness Products')
              : 'Volunteer & Earn Coins'
            }
          </Text>
          
          {activeMainCategory === 'redeem' ? renderRedeemContent() : renderEarnContent()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    paddingHorizontal: metrics.spacing.m,
  },
  coinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: metrics.spacing.m,
    paddingVertical: metrics.spacing.s,
    borderRadius: metrics.borderRadius.medium,
    marginRight: metrics.spacing.m,
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
  mainTabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.spacing.xl,
    paddingVertical: metrics.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  mainTabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: metrics.spacing.m,
    paddingHorizontal: metrics.spacing.xl,
    borderRadius: metrics.borderRadius.large,
    borderWidth: 2,
    flex: 1,
    marginHorizontal: metrics.spacing.s,
  },
  activeMainTabButton: {
    borderWidth: 0,
  },
  mainTabText: {
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
    marginLeft: metrics.spacing.s,
  },
  subTabsContainer: {
    paddingHorizontal: metrics.spacing.l,
    paddingTop: metrics.spacing.m,
    paddingBottom: metrics.spacing.s,
  },
  subTabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: metrics.spacing.s,
    paddingHorizontal: metrics.spacing.m,
    borderRadius: 50, // Large value for oval shape
    marginRight: metrics.spacing.m,
    borderWidth: 1,
  },
  activeSubTabButton: {
    borderWidth: 0,
  },
  subTabText: {
    marginLeft: metrics.spacing.xs,
    fontWeight: '600',
  },
  contentSection: {
    paddingTop: metrics.spacing.m,
  },
  sectionTitle: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
    marginHorizontal: metrics.spacing.l,
    marginBottom: metrics.spacing.m,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: metrics.spacing.l,
  },
  card: {
    borderRadius: metrics.borderRadius.large,
    overflow: 'hidden',
    marginBottom: metrics.spacing.m,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 120,
  },
  imageGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  cardContent: {
    padding: metrics.spacing.m,
  },
  cardTitle: {
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
    marginBottom: metrics.spacing.xs,
  },
  cardDescription: {
    fontSize: metrics.fontSize.s,
    marginBottom: metrics.spacing.m,
    lineHeight: 18,
  },
  cardDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.spacing.xs,
  },
  cardLocation: {
    marginLeft: metrics.spacing.xs,
    fontSize: metrics.fontSize.xs,
  },
  cardPricing: {
    marginTop: metrics.spacing.xs,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: metrics.fontSize.xs,
    textDecorationLine: 'line-through',
    marginRight: metrics.spacing.s,
  },
  discountedPrice: {
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
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
    alignSelf: 'flex-start',
    marginTop: metrics.spacing.xs,
  },
  coinsTagText: {
    color: '#FBBF24',
    fontWeight: '600',
    fontSize: metrics.fontSize.xs,
    marginLeft: 2,
  },
  earnDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: metrics.spacing.m,
  },
  earnDetailsItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earnDetailsText: {
    fontSize: metrics.fontSize.xs,
    marginLeft: metrics.spacing.xs,
  },
  earnCoinsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: metrics.spacing.xs,
    paddingHorizontal: metrics.spacing.m,
    borderRadius: metrics.borderRadius.medium,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.3)',
  },
  earnCoinsText: {
    color: '#FBBF24',
    fontWeight: '600',
    fontSize: metrics.fontSize.s,
    marginLeft: metrics.spacing.xs,
  },
}); 