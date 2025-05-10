import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GradientButton } from '@/components/GradientButton';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import { MOCK_GOODIES } from '@/constants/mockEvents';

// Mock coins value
const MOCK_COINS = 450;

export default function GoodieDetailsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const goodieId = Array.isArray(id) ? id[0] : id;
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
  const [isSuccessVisible, setIsSuccessVisible] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  // Find the goodie based on the id param
  const goodie = MOCK_GOODIES.find(g => g.id === goodieId) || MOCK_GOODIES[0];
  
  const handleRedeem = () => {
    setIsConfirmationVisible(true);
  };
  
  const handleConfirmRedemption = () => {
    // Generate a random order number
    const code = `ORD${Math.floor(100000 + Math.random() * 900000)}`;
    setOrderNumber(code);
    
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
          Product Details
        </Text>
        
        <View style={styles.coinsContainer}>
          <Feather 
            name="dollar-sign" 
            size={20} 
            color="#FBBF24" 
          />
          <Text style={styles.coinsText}>
            {MOCK_COINS} DC
          </Text>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Goodie Image */}
        <Image 
          source={{ uri: goodie.imageUrl }} 
          style={styles.goodieImage}
          resizeMode="cover"
        />
        
        {/* Goodie Information */}
        <View style={styles.contentContainer}>
          <Text style={[styles.goodieTitle, { color: colors.text }]}>
            {goodie.name}
          </Text>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          {/* Price Breakdown */}
          <View style={styles.priceContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Price Breakdown
            </Text>
            
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                Market Price
              </Text>
              <Text style={[styles.priceValue, { color: colors.text }]}>
                ₹{goodie.originalPrice}
              </Text>
            </View>
            
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
                Discount (Dabbit Coins)
              </Text>
              <Text style={[styles.discountValue, { color: colors.primary }]}>
                - ₹{goodie.originalPrice - goodie.discountedPrice}
              </Text>
            </View>
            
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            
            <View style={styles.priceRow}>
              <Text style={[styles.finalPriceLabel, { color: colors.text }]}>
                Final Price
              </Text>
              <Text style={[styles.finalPriceValue, { color: colors.text }]}>
                ₹{goodie.discountedPrice}
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
              You will use {goodie.pointsCost} Dabbit Coins to get ₹{goodie.originalPrice - goodie.discountedPrice} off.
              Your current balance is {MOCK_COINS} DC.
            </Text>
          </View>
          
          <Text style={[styles.goodieDescription, { color: colors.textSecondary }]}>
            {goodie.description}
          </Text>
          
          <View style={[styles.shippingCard, { backgroundColor: colors.surface }]}>
            <View style={styles.discountInfoHeader}>
              <Feather name="truck" size={20} color={colors.secondary} />
              <Text style={[styles.discountInfoTitle, { color: colors.secondary }]}>
                Shipping Information
              </Text>
            </View>
            <Text style={[styles.discountInfoText, { color: colors.textSecondary }]}>
              Free shipping for all orders. Delivery within 5-7 business days.
              Returns accepted within 7 days of delivery.
            </Text>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            * This discount is valid for 30 days from redemption. 
            You can cancel your order within 24 hours without coin loss.
          </Text>
        </View>
      </ScrollView>
      
      {/* Redeem Button */}
      <View style={[styles.buttonContainer, { backgroundColor: colors.background }]}>
        <GradientButton
          title="Redeem with Dabbit Coins"
          onPress={handleRedeem}
          colors={colors.primaryGradient}
        />
      </View>
      
      {/* Confirmation Modal */}
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
              <Text style={styles.confirmModalTitle}>Confirm Order</Text>
            </View>
            
            {/* Content */}
            <View style={styles.confirmModalContent}>
              {/* Product Name */}
              <View style={styles.confirmModalRow}>
                <Text style={styles.confirmModalLabel}>Product:</Text>
                <Text style={styles.confirmModalValue} numberOfLines={1} ellipsizeMode="tail">
                  {goodie.name}
                </Text>
              </View>
              
              {/* Coins to Use */}
              <View style={styles.confirmModalRow}>
                <Text style={styles.confirmModalLabel}>Coins to Use:</Text>
                <Text style={styles.confirmModalValue}>
                  {goodie.pointsCost} DC
                </Text>
              </View>
              
              {/* Remaining Balance */}
              <View style={styles.confirmModalRow}>
                <Text style={styles.confirmModalLabel}>Remaining Balance:</Text>
                <Text style={styles.confirmModalValue}>
                  {MOCK_COINS - goodie.pointsCost} DC
                </Text>
              </View>
              
              {/* Divider */}
              <View style={styles.confirmModalDivider} />
              
              {/* Savings */}
              <View style={styles.confirmModalRow}>
                <Text style={styles.confirmModalLabel}>You Save:</Text>
                <Text style={styles.confirmModalSavings}>
                  ₹{goodie.originalPrice - goodie.discountedPrice}
                </Text>
              </View>
            </View>
            
            {/* Footer */}
            <View style={styles.confirmModalFooter}>
              <Text style={styles.confirmModalNote}>
                Proceed to place your order? Delivery address can be confirmed on the next screen.
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
                    <Text style={styles.confirmModalConfirmText}>Place Order</Text>
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
              Order Placed!
            </Text>
            
            <Text style={[styles.successMessage, { color: colors.textSecondary }]}>
              Your order has been successfully placed.
              Your order number is:
            </Text>
            
            <View style={[styles.codeContainer, { backgroundColor: colors.background }]}>
              <Text style={[styles.redemptionCode, { color: colors.text }]}>
                {orderNumber}
              </Text>
            </View>
            
            <Text style={[styles.shippingNote, { color: colors.textSecondary }]}>
              We'll ship your order to your registered address.
              You can track your order from the Orders section.
            </Text>
            
            <GradientButton
              title="Done"
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
    justifyContent: 'space-between',
    paddingHorizontal: metrics.spacing.l,
    paddingVertical: metrics.spacing.m,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: metrics.fontSize.l,
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
  goodieImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#E0E0E0',
  },
  contentContainer: {
    padding: metrics.spacing.l,
  },
  goodieTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: metrics.spacing.m,
  },
  divider: {
    height: 1,
    marginVertical: metrics.spacing.m,
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
    fontWeight: '500',
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
  goodieDescription: {
    fontSize: metrics.fontSize.m,
    lineHeight: 24,
    marginBottom: metrics.spacing.l,
  },
  shippingCard: {
    borderRadius: metrics.borderRadius.large,
    padding: metrics.spacing.l,
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
  shippingNote: {
    fontSize: metrics.fontSize.s,
    textAlign: 'center',
    marginBottom: metrics.spacing.l,
    paddingHorizontal: metrics.spacing.l,
  },
  findMoreButton: {
    width: '100%',
  },
}); 