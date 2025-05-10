import React from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/context/ThemeContext';
import { metrics } from '@/constants/metrics';
import DabbitCoinsCard from '@/components/PointsInsightsCard';
import { format } from 'date-fns';

// Mock coins value
const MOCK_COINS = 450;

// Mock transaction history
const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'credit' as const,
    amount: 200,
    description: 'Daily habit streak bonus',
    date: new Date(2023, 5, 10, 8, 30),
  },
  {
    id: '2',
    type: 'debit' as const,
    amount: 300,
    description: 'Redeemed for Mindfulness Workshop',
    date: new Date(2023, 5, 9, 14, 15),
  },
  {
    id: '3',
    type: 'credit' as const,
    amount: 150,
    description: 'Completed weekly meditation goal',
    date: new Date(2023, 5, 8, 20, 0),
  },
  {
    id: '4',
    type: 'credit' as const,
    amount: 50,
    description: 'Referred a friend',
    date: new Date(2023, 5, 7, 12, 45),
  },
  {
    id: '5',
    type: 'debit' as const,
    amount: 450,
    description: 'Redeemed for Calm Premium Subscription',
    date: new Date(2023, 5, 5, 17, 20),
  },
  {
    id: '6',
    type: 'credit' as const,
    amount: 300,
    description: 'Completed Beach Clean-up Volunteering',
    date: new Date(2023, 5, 2, 9, 10),
  },
  {
    id: '7',
    type: 'credit' as const,
    amount: 100,
    description: 'First time meditation completion',
    date: new Date(2023, 5, 1, 7, 0),
  },
];

export default function RewardsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  
  const renderTransactionItem = ({ item }: { item: typeof MOCK_TRANSACTIONS[0] }) => {
    const isCredit = item.type === 'credit';
    
    return (
      <View style={[styles.transactionItem, { backgroundColor: colors.surface }]}>
        <View style={styles.transactionIconContainer}>
          <View style={[
            styles.transactionIcon, 
            { backgroundColor: isCredit ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
          ]}>
            <Feather 
              name={isCredit ? 'arrow-down-left' : 'arrow-up-right'} 
              size={18} 
              color={isCredit ? '#34D399' : '#EF4444'} 
            />
          </View>
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionDescription, { color: colors.text }]} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {format(item.date, 'MMM d, yyyy • h:mm a')}
          </Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.transactionAmountText, 
            { color: isCredit ? '#34D399' : '#EF4444' }
          ]}>
            {isCredit ? '+' : '-'}{item.amount} DC
          </Text>
        </View>
      </View>
    );
  };
  
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
      <View style={styles.mainContent}>
        {/* Dabbit Coins Card */}
        <View style={styles.coinsCardContainer}>
          <DabbitCoinsCard currentCoins={MOCK_COINS} />
        </View>
        
        {/* Marketplace Button */}
        <TouchableOpacity 
          style={[styles.marketplaceButton, { backgroundColor: colors.primary }]}
          onPress={() => {
            // @ts-ignore - We know this route will exist
            router.push('/marketplace');
          }}
        >
          <Feather name="shopping-bag" size={18} color="#FFFFFF" />
          <Text style={styles.marketplaceButtonText}>
            Go to Marketplace
          </Text>
        </TouchableOpacity>
        
        {/* Transaction History */}
        <View style={styles.transactionsContainer}>
          <View style={styles.transactionsHeader}>
            <Text style={[styles.transactionsTitle, { color: colors.text }]}>
              Transaction History
            </Text>
            <TouchableOpacity>
              <Text style={[styles.viewAllText, { color: colors.primary }]}>
                View All
              </Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={MOCK_TRANSACTIONS}
            renderItem={renderTransactionItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.transactionsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
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
    paddingHorizontal: metrics.spacing.l,
  },
  coinsCardContainer: {
    marginBottom: metrics.spacing.l,
  },
  marketplaceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: metrics.spacing.m,
    borderRadius: metrics.borderRadius.large,
    marginBottom: metrics.spacing.l,
  },
  marketplaceButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: metrics.spacing.s,
  },
  transactionsContainer: {
    flex: 1,
  },
  transactionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: metrics.spacing.m,
  },
  transactionsTitle: {
    fontSize: metrics.fontSize.l,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: metrics.fontSize.s,
    fontWeight: '500',
  },
  transactionsList: {
    paddingBottom: metrics.spacing.xl,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: metrics.spacing.m,
    borderRadius: metrics.borderRadius.large,
    marginBottom: metrics.spacing.s,
  },
  transactionIconContainer: {
    marginRight: metrics.spacing.m,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: metrics.fontSize.m,
    fontWeight: '500',
    marginBottom: metrics.spacing.xs,
  },
  transactionDate: {
    fontSize: metrics.fontSize.xs,
  },
  transactionAmount: {
    marginLeft: metrics.spacing.m,
  },
  transactionAmountText: {
    fontSize: metrics.fontSize.m,
    fontWeight: '600',
  },
}); 