import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
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

// Mock points value - in a real implementation this would come from a points context
const MOCK_POINTS = 450;

type CategoryTab = 'all' | 'workshops' | 'comedy' | 'classes';

export default function RedeemPointsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all');
  
  // Filter events based on active category
  const filteredEvents = MOCK_EVENTS.filter(event => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'workshops') return event.category === 'workshop';
    if (activeCategory === 'comedy') return event.category === 'comedy';
    if (activeCategory === 'classes') return event.category === 'classes';
    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style="auto" />
      
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Feather 
            name="arrow-left" 
            size={24} 
            color={colors.text} 
          />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Redeem Points
        </Text>
        
        <View style={styles.pointsContainer}>
          <Feather 
            name="award" 
            size={20} 
            color="#FBBF24" 
          />
          <Text style={styles.pointsText}>
            {MOCK_POINTS} pts
          </Text>
        </View>
      </View>
      
      {/* Category Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.categoryTabsContainer}
        contentContainerStyle={styles.categoryTabs}
      >
        <CategoryTab 
          label="All" 
          isActive={activeCategory === 'all'} 
          onPress={() => setActiveCategory('all')} 
        />
        <CategoryTab 
          label="Workshops" 
          isActive={activeCategory === 'workshops'} 
          onPress={() => setActiveCategory('workshops')} 
        />
        <CategoryTab 
          label="Comedy" 
          isActive={activeCategory === 'comedy'} 
          onPress={() => setActiveCategory('comedy')} 
        />
        <CategoryTab 
          label="Classes" 
          isActive={activeCategory === 'classes'} 
          onPress={() => setActiveCategory('classes')} 
        />
      </ScrollView>
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Available Discounts Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Discounts
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.discountsContainer}
          >
            {MOCK_DISCOUNTS.map((discount) => (
              <DiscountCard 
                key={discount.id} 
                title={discount.name} 
                points={discount.pointsCost} 
                value={discount.discountAmount}
              />
            ))}
          </ScrollView>
        </View>
        
        {/* Events You Can Redeem Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Events You Can Redeem
          </Text>
          
          <View style={styles.eventsGrid}>
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onViewDetails={() => {
                  console.log("Navigating to event details:", event.id);
                  router.push(`/event-details/${event.id}`);
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type CategoryTabProps = {
  label: string;
  isActive: boolean;
  onPress: () => void;
};

function CategoryTab({ label, isActive, onPress }: CategoryTabProps) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        {
          backgroundColor: isActive ? '#FF3980' : colors.surface,
          borderColor: isActive ? '#FF3980' : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.categoryTabText,
          { color: isActive ? '#FFFFFF' : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type DiscountCardProps = {
  title: string;
  points: number;
  value: number;
};

function DiscountCard({ title, points, value }: DiscountCardProps) {
  const { colors } = useTheme();
  
  return (
    <LinearGradient
      colors={['#FF6B6B', '#FF3980']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.discountCard}
    >
      <Text style={styles.discountTitle}>{title}</Text>
      <View style={styles.discountDetails}>
        <View style={styles.discountPoints}>
          <Feather name="award" size={16} color="#FBBF24" />
          <Text style={styles.discountPointsText}>{points} pts</Text>
        </View>
        <Text style={styles.discountValue}>₹{value}</Text>
      </View>
    </LinearGradient>
  );
}

type EventCardProps = {
  event: Event;
  onViewDetails: () => void;
};

function EventCard({ event, onViewDetails }: EventCardProps) {
  const { colors } = useTheme();
  
  const formattedDate = event.date 
    ? format(parseISO(event.date), 'MMM d, yyyy')
    : '';
  
  return (
    <View style={[styles.eventCard, { backgroundColor: colors.surface }]}>
      <Image 
        source={{ uri: event.imageUrl }} 
        style={styles.eventImage} 
        resizeMode="cover"
      />
      
      <View style={styles.eventContent}>
        <Text style={[styles.eventTitle, { color: colors.text }]}>
          {event.name}
        </Text>
        
        <View style={styles.eventDetails}>
          <View style={styles.eventDetailRow}>
            <Feather name="calendar" size={14} color={colors.textSecondary} />
            <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
              {formattedDate}
            </Text>
          </View>
          
          <View style={styles.eventDetailRow}>
            <Feather name="map-pin" size={14} color={colors.textSecondary} />
            <Text style={[styles.eventDetailText, { color: colors.textSecondary }]}>
              {event.location.name}, {event.location.city}
            </Text>
          </View>
        </View>
        
        <View style={styles.eventPricing}>
          <View>
            <Text style={[styles.eventOriginalPrice, { color: colors.textSecondary }]}>
              ₹{event.price}
            </Text>
            <Text style={[styles.eventDiscountedPrice, { color: colors.text }]}>
              ₹{event.discountedPrice}
            </Text>
          </View>
          
          <GradientButton
            title="View Details"
            onPress={onViewDetails}
            style={styles.viewDetailsButton}
            colors={[colors.secondary, colors.secondaryGradient[1]]}
            fullWidth={false}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: metrics.spacing.l,
    paddingVertical: metrics.spacing.m,
  },
  backButton: {
    padding: metrics.spacing.s,
    marginLeft: -metrics.spacing.s,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: '600',
    flex: 1,
    marginLeft: metrics.spacing.s,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: metrics.spacing.m,
    paddingVertical: metrics.spacing.s,
    borderRadius: metrics.borderRadius.medium,
  },
  pointsText: {
    color: '#FBBF24',
    fontWeight: '600',
    marginLeft: metrics.spacing.xs,
  },
  categoryTabsContainer: {
    marginTop: metrics.spacing.xs,
    marginBottom: metrics.spacing.xs,
  },
  categoryTabs: {
    paddingHorizontal: metrics.spacing.l,
  },
  categoryTab: {
    paddingVertical: metrics.spacing.xs,
    paddingHorizontal: metrics.spacing.m,
    borderRadius: 20,
    marginRight: metrics.spacing.m,
    borderWidth: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTabText: {
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingTop: metrics.spacing.m,
  },
  sectionContainer: {
    marginBottom: metrics.spacing.xl,
  },
  sectionTitle: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
    marginHorizontal: metrics.spacing.l,
    marginBottom: metrics.spacing.m,
  },
  discountsContainer: {
    paddingHorizontal: metrics.spacing.l,
    paddingBottom: metrics.spacing.s,
  },
  discountCard: {
    width: 200,
    borderRadius: metrics.borderRadius.large,
    padding: metrics.spacing.l,
    marginRight: metrics.spacing.l,
  },
  discountTitle: {
    color: '#FFFFFF',
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
    marginBottom: metrics.spacing.m,
  },
  discountDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: metrics.spacing.xs,
    paddingHorizontal: metrics.spacing.s,
    borderRadius: metrics.borderRadius.medium,
  },
  discountPointsText: {
    color: '#FFFFFF',
    fontWeight: '500',
    marginLeft: metrics.spacing.xs,
  },
  discountValue: {
    color: '#FFFFFF',
    fontSize: metrics.fontSize.l,
    fontWeight: '700',
  },
  eventsGrid: {
    paddingHorizontal: metrics.spacing.l,
    paddingBottom: metrics.spacing.l,
  },
  eventCard: {
    borderRadius: metrics.borderRadius.large,
    overflow: 'hidden',
    marginBottom: metrics.spacing.l,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  eventImage: {
    width: '100%',
    height: 180,
  },
  eventContent: {
    padding: metrics.spacing.l,
  },
  eventTitle: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
    marginBottom: metrics.spacing.s,
  },
  eventDetails: {
    marginBottom: metrics.spacing.m,
  },
  eventDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: metrics.spacing.xs,
  },
  eventDetailText: {
    marginLeft: metrics.spacing.s,
    fontSize: metrics.fontSize.s,
  },
  eventPricing: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: metrics.spacing.s,
  },
  eventOriginalPrice: {
    fontSize: metrics.fontSize.s,
    textDecorationLine: 'line-through',
  },
  eventDiscountedPrice: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
  },
  viewDetailsButton: {
    paddingVertical: metrics.spacing.s,
    paddingHorizontal: metrics.spacing.m,
  },
}); 