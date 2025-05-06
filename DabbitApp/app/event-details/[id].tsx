import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '@/components/GradientButton';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { MOCK_EVENTS, MOCK_DISCOUNTS } from '@/constants/mockEvents';
import { format, parseISO } from 'date-fns';
import { generateId } from '@/utils/helpers';

// Mock points value - in a real implementation this would come from a points context
const MOCK_POINTS = 450;

export default function EventDetailsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const eventId = Array.isArray(id) ? id[0] : id;
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');
  
  // Find the event based on the id param
  const event = MOCK_EVENTS.find(e => e.id === eventId) || MOCK_EVENTS[0];
  
  // For simplicity, we're using the first discount in this example
  const discount = MOCK_DISCOUNTS[0];
  
  // Calculate price after discount
  const finalPrice = Math.max(event.price - discount.discountAmount, 0);
  
  // Format the date
  const formattedDate = event.date 
    ? format(parseISO(event.date), 'EEEE, MMMM d, yyyy')
    : '';
  
  const handleApplyDiscount = () => {
    setIsConfirmationVisible(true);
  };
  
  const handleConfirmRedemption = () => {
    // Generate a random redemption code
    const code = `DT${Math.floor(100000 + Math.random() * 900000)}`;
    setRedemptionCode(code);
    
    // Close confirmation modal and show success
    setIsConfirmationVisible(false);
    setIsSuccessVisible(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style="auto" />
      
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      {/* Header with back button */}
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
          Event Details
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
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Event Image */}
        <Image 
          source={{ uri: event.imageUrl }} 
          style={styles.eventImage}
          resizeMode="cover"
        />
        
        {/* Event Information */}
        <View style={styles.contentContainer}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>
            {event.name}
          </Text>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Feather name="calendar" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {formattedDate}
              </Text>
            </View>
            
            {event.time && (
              <View style={styles.detailRow}>
                <Feather name="clock" size={18} color={colors.textSecondary} />
                <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                  {event.time}
                </Text>
              </View>
            )}
            
            <View style={styles.detailRow}>
              <Feather name="map-pin" size={18} color={colors.textSecondary} />
              <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                {event.location.name}, {event.location.city}
              </Text>
            </View>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          {/* Price Breakdown */}
          <View style={styles.priceContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Price Breakdown
            </Text>
            
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                Original Price
              </Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>
                ₹{event.price}
              </Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                Discount ({discount.name})
              </Text>
              <Text style={[styles.discountValue, { color: colors.primary }]}>
                - ₹{discount.discountAmount}
              </Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.priceRow}>
              <Text style={[styles.finalPriceLabel, { color: colors.text }]}>
                Final Price
              </Text>
              <Text style={[styles.finalPriceValue, { color: colors.text }]}>
                ₹{finalPrice}
              </Text>
            </View>
          </View>
          
          <View style={[styles.discountInfoCard, { backgroundColor: colors.surface }]}>
            <View style={styles.discountInfoHeader}>
              <Feather name="info" size={20} color={colors.secondary} />
              <Text style={[styles.discountInfoTitle, { color: colors.secondary }]}>
                Redemption Details
              </Text>
            </View>
            <Text style={[styles.discountInfoText, { color: colors.textSecondary }]}>
              You will use {discount.pointsCost} points to get ₹{discount.discountAmount} off.
              Your current balance is {MOCK_POINTS} points.
            </Text>
          </View>
          
          <Text style={[styles.eventDescription, { color: colors.textSecondary }]}>
            {event.description}
          </Text>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            * This discount is valid for 30 days from redemption. 
            You can cancel your redemption within 24 hours without points loss.
          </Text>
        </View>
      </ScrollView>
      
      {/* Apply Discount Button */}
      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <GradientButton
          title="Apply Discount"
          onPress={handleApplyDiscount}
          colors={colors.primaryGradient}
        />
      </View>
      
      {/* Confirmation Modal - Completely Rebuilt */}
      <Modal
        visible={isConfirmationVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.confirmModalOverlay}>
          <View style={styles.confirmModalContainer}>
            {/* Header */}
            <View style={styles.confirmModalHeader}>
              <Text style={styles.confirmModalTitle}>Confirm Redemption</Text>
            </View>
            
            {/* Content */}
            <View style={styles.confirmModalContent}>
              {/* Event Name */}
              <View style={styles.confirmModalRow}>
                <Text style={styles.confirmModalLabel}>Event:</Text>
                <Text style={styles.confirmModalValue} numberOfLines={1} ellipsizeMode="tail">
                  {event.name}
                </Text>
              </View>
              
              {/* Points to Use */}
              <View style={styles.confirmModalRow}>
                <Text style={styles.confirmModalLabel}>Points to Use:</Text>
                <Text style={styles.confirmModalValue}>
                  {discount.pointsCost} pts
                </Text>
              </View>
              
              {/* Remaining Balance */}
              <View style={styles.confirmModalRow}>
                <Text style={styles.confirmModalLabel}>Remaining Balance:</Text>
                <Text style={styles.confirmModalValue}>
                  {MOCK_POINTS - discount.pointsCost} pts
                </Text>
              </View>
              
              {/* Divider */}
              <View style={styles.confirmModalDivider} />
              
              {/* Savings */}
              <View style={styles.confirmModalRow}>
                <Text style={styles.confirmModalLabel}>You Save:</Text>
                <Text style={styles.confirmModalSavings}>
                  ₹{discount.discountAmount}
                </Text>
              </View>
            </View>
            
            {/* Footer */}
            <View style={styles.confirmModalFooter}>
              <Text style={styles.confirmModalNote}>
                You can cancel this redemption within 24 hours without losing points.
              </Text>
              
              <View style={styles.confirmModalButtons}>
                <TouchableOpacity
                  style={styles.confirmModalCancelButton}
                  activeOpacity={0.7}
                  onPress={() => setIsConfirmationVisible(false)}
                >
                  <Text style={styles.confirmModalCancelText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.confirmModalConfirmButton}
                  activeOpacity={0.7}
                  onPress={handleConfirmRedemption}
                >
                  <LinearGradient
                    colors={['#FF3980', '#FF6B6B']}
                    style={styles.confirmModalConfirmGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.confirmModalConfirmText}>Confirm</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Success Modal */}
      <Modal
        visible={isSuccessVisible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.successModalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.successIconContainer}>
              <LinearGradient
                colors={['#20BF6B', '#4CAF50']}
                style={styles.successIcon}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Feather name="check" size={32} color="#FFFFFF" />
              </LinearGradient>
            </View>
            
            <Text style={[styles.successTitle, { color: colors.text }]}>
              Success!
            </Text>
            
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              Your discount has been applied successfully.
              Present this code at the venue:
            </Text>
            
            <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.redemptionCode, { color: colors.text }]}>
                {redemptionCode}
              </Text>
            </View>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.border }]}
                onPress={() => Alert.alert('Code copied to clipboard')}
              >
                <Feather name="copy" size={20} color={colors.secondary} />
                <Text style={[styles.actionButtonText, { color: colors.secondary }]}>
                  Copy
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.border }]}
                onPress={() => Alert.alert('Sharing is not implemented')}
              >
                <Feather name="share-2" size={20} color={colors.secondary} />
                <Text style={[styles.actionButtonText, { color: colors.secondary }]}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.validityText, { color: colors.textSecondary }]}>
              This code is valid for 30 days
            </Text>
            
            <GradientButton
              title="Find More Events"
              onPress={() => {
                setIsSuccessVisible(false);
                router.back();
              }}
              colors={colors.primaryGradient}
              style={styles.findMoreButton}
            />
          </View>
        </View>
      </Modal>
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
    paddingHorizontal: metrics.spacing.l,
    paddingVertical: metrics.spacing.m,
  },
  headerTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: '600',
    flex: 1,
    marginLeft: metrics.spacing.s,
  },
  backButton: {
    padding: metrics.spacing.s,
    marginLeft: -metrics.spacing.s,
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
  eventImage: {
    width: '100%',
    height: 240,
  },
  contentContainer: {
    padding: metrics.spacing.l,
  },
  eventTitle: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: '700',
    marginBottom: metrics.spacing.m,
  },
  detailsContainer: {
    marginBottom: metrics.spacing.l,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: metrics.spacing.s,
  },
  detailText: {
    marginLeft: metrics.spacing.m,
    fontSize: metrics.fontSize.m,
  },
  divider: {
    height: 1,
    marginVertical: metrics.spacing.l,
  },
  priceContainer: {
    marginBottom: metrics.spacing.l,
  },
  sectionTitle: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
    marginBottom: metrics.spacing.m,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: metrics.spacing.s,
  },
  priceLabel: {
    fontSize: metrics.fontSize.m,
  },
  priceValue: {
    fontSize: metrics.fontSize.m,
  },
  discountValue: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
  },
  finalPriceLabel: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
  },
  finalPriceValue: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
  },
  discountInfoCard: {
    borderRadius: metrics.borderRadius.large,
    padding: metrics.spacing.l,
    marginBottom: metrics.spacing.l,
  },
  discountInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: metrics.spacing.s,
  },
  discountInfoTitle: {
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
    marginLeft: metrics.spacing.s,
  },
  discountInfoText: {
    fontSize: metrics.fontSize.m,
    lineHeight: 22,
  },
  eventDescription: {
    fontSize: metrics.fontSize.m,
    lineHeight: 24,
    marginBottom: metrics.spacing.l,
  },
  termsText: {
    fontSize: metrics.fontSize.s,
    lineHeight: 18,
    marginBottom: metrics.spacing.l,
  },
  buttonContainer: {
    padding: metrics.spacing.l,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: metrics.spacing.l,
  },
  modalContent: {
    borderRadius: metrics.borderRadius.large,
    padding: metrics.spacing.l,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    marginBottom: metrics.spacing.m,
  },
  modalTitle: {
    fontSize: metrics.fontSize.xl,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmationDetails: {
    marginBottom: metrics.spacing.l,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: metrics.spacing.m,
  },
  confirmationLabel: {
    fontSize: metrics.fontSize.m,
    flex: 1,
  },
  confirmationValue: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
    marginLeft: metrics.spacing.m,
  },
  savingsValue: {
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
  },
  policyText: {
    fontSize: metrics.fontSize.s,
    textAlign: 'center',
    marginBottom: metrics.spacing.l,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: metrics.spacing.m,
    paddingHorizontal: metrics.spacing.l,
    borderRadius: metrics.borderRadius.large,
    borderWidth: 1,
    marginRight: metrics.spacing.s,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
  },
  confirmButton: {
    flex: 1,
    marginLeft: metrics.spacing.s,
  },
  successModalContent: {
    alignItems: 'center',
    paddingTop: metrics.spacing.xxl,
    paddingBottom: metrics.spacing.xl,
  },
  successIconContainer: {
    marginBottom: metrics.spacing.l,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  successTitle: {
    fontSize: metrics.fontSize.xxl,
    fontWeight: '700',
    marginBottom: metrics.spacing.m,
  },
  successMessage: {
    fontSize: metrics.fontSize.m,
    textAlign: 'center',
    marginBottom: metrics.spacing.l,
    paddingHorizontal: metrics.spacing.m,
    lineHeight: 22,
  },
  codeContainer: {
    paddingVertical: metrics.spacing.m,
    paddingHorizontal: metrics.spacing.xl,
    borderRadius: metrics.borderRadius.medium,
    marginBottom: metrics.spacing.l,
    width: '80%',
    alignItems: 'center',
  },
  redemptionCode: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: metrics.spacing.l,
    justifyContent: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: metrics.spacing.m,
    paddingHorizontal: metrics.spacing.l,
    borderRadius: metrics.borderRadius.large,
    marginHorizontal: metrics.spacing.s,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
    marginLeft: metrics.spacing.s,
  },
  validityText: {
    fontSize: metrics.fontSize.s,
    marginBottom: metrics.spacing.l,
  },
  findMoreButton: {
    width: '100%',
  },
  // New Confirmation Modal Styles - Complete Rebuild
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: metrics.spacing.l,
  },
  confirmModalContainer: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmModalHeader: {
    padding: metrics.spacing.l,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  confirmModalContent: {
    padding: metrics.spacing.l,
  },
  confirmModalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: metrics.spacing.s,
  },
  confirmModalLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  confirmModalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  confirmModalDivider: {
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginVertical: metrics.spacing.m,
  },
  confirmModalSavings: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    flex: 1,
    textAlign: 'right',
  },
  confirmModalFooter: {
    padding: metrics.spacing.l,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  confirmModalNote: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: metrics.spacing.l,
  },
  confirmModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmModalCancelButton: {
    flex: 1,
    paddingVertical: metrics.spacing.m,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    marginRight: metrics.spacing.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmModalConfirmButton: {
    flex: 1,
    marginLeft: metrics.spacing.s,
    borderRadius: 8,
    overflow: 'hidden',
  },
  confirmModalConfirmGradient: {
    paddingVertical: metrics.spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
}); 