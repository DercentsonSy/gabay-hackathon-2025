import { Image } from 'expo-image';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { Card, IconButton, Button, Badge } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import VoiceAssistant from '@/components/VoiceAssistant';

// Transaction data with the GCash style
type TransactionType = 'credit' | 'debit';

interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  type: TransactionType;
  icon: any; // Using any type to avoid Ionicons type restrictions
}

const recentTransactions: Transaction[] = [
  { 
    id: '1', 
    title: 'Coffee Shop', 
    amount: 150.00, 
    date: 'Today', 
    category: 'Food & Drinks',
    type: 'debit',
    icon: 'cafe-outline'
  },
  { 
    id: '2', 
    title: 'Salary Deposit', 
    amount: 2500.00, 
    date: 'Yesterday', 
    category: 'Income',
    type: 'credit',
    icon: 'cash-outline'
  },
  { 
    id: '3', 
    title: 'Uber Ride', 
    amount: 350.75, 
    date: 'Jun 28', 
    category: 'Transportation',
    type: 'debit',
    icon: 'car-outline'
  },
  { 
    id: '4', 
    title: 'Grocery Store', 
    amount: 1250.50, 
    date: 'Jun 27', 
    category: 'Groceries',
    type: 'debit',
    icon: 'cart-outline'
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const [voiceModalVisible, setVoiceModalVisible] = useState(false);
  const [showBalance, setShowBalance] = useState(true);

  // Function to navigate to transaction details
  const handleTransactionPress = (id: string) => {
    console.log(`Transaction ${id} pressed`);
    // router.push(`/(tabs)/transactions/${id}`);
  };

  // Function to format amount with currency symbol
  const formatAmount = (amount: number) => {
    return amount >= 0 ? `₱${amount.toFixed(2)}` : `-₱${Math.abs(amount).toFixed(2)}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      
      {/* Header section with gradient background */}
      <LinearGradient
        colors={['#0070e0', '#0089dc']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Ionicons name="person-circle" size={30} color="#fff" style={styles.userIcon} />
            <Text style={styles.userName}>Dercentson Sy</Text>
          </View>
          <View style={styles.headerActions}>
            <IconButton icon="qrcode" size={24} iconColor="#fff" onPress={() => console.log('Scan QR')} style={styles.headerButton} />
            <IconButton icon="bell-outline" size={24} iconColor="#fff" onPress={() => console.log('Notifications')} style={styles.headerButton} />
          </View>
        </View>
      </LinearGradient>

      {/* Balance Card - GCash style */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <TouchableOpacity 
            onPress={() => setShowBalance(!showBalance)}
            style={styles.eyeButton}
          >
            <Ionicons name={showBalance ? "eye-outline" : "eye-off-outline"} size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.balanceAmount}>
          {showBalance ? '₱ 24,500.00' : '₱ ••••••'}
        </Text>
        
        <Text style={styles.accountNumber}>Account: •••• 1234</Text>
        
        <View style={styles.balanceActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            accessibilityLabel="Cash In"
            accessibilityHint="Add money to your account"
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="cash-outline" size={20} color="#0070e0" />
            </View>
            <Text style={styles.quickActionText}>Cash In</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            accessibilityLabel="Transfer"
            accessibilityHint="Transfer money to another account"
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="arrow-forward-outline" size={20} color="#0070e0" />
            </View>
            <Text style={styles.quickActionText}>Transfer</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            accessibilityLabel="View Activity"
            accessibilityHint="View your transaction history"
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="list-outline" size={20} color="#0070e0" />
            </View>
            <Text style={styles.quickActionText}>Activity</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Core Features Section */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => console.log('Send Money')}
            accessible={true}
            accessibilityLabel="Send Money"
            accessibilityHint="Send money to another user"
          >
            <View style={styles.actionIcon}>
              <Ionicons name="arrow-forward" size={22} color="#0070e0" />
            </View>
            <Text style={styles.quickActionText}>Send Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => console.log('Pay Bills')}
            accessible={true}
            accessibilityLabel="Pay Bills"
            accessibilityHint="Pay your bills"
          >
            <View style={styles.actionIcon}>
              <Ionicons name="receipt" size={22} color="#0070e0" />
              <Badge style={styles.actionBadge} size={16}>!</Badge>
            </View>
            <Text style={styles.quickActionText}>Pay Bills</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem} 
            onPress={() => console.log('Buy Load')}
            accessible={true}
            accessibilityLabel="Buy Load"
            accessibilityHint="Purchase mobile phone load"
          >
            <View style={styles.actionIcon}>
              <Ionicons name="phone-portrait" size={22} color="#0070e0" />
            </View>
            <Text style={styles.quickActionText}>Buy Load</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Second Row of Actions */}
      <View style={[styles.quickActionsContainer, { marginTop: -5 }]}>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => console.log('QR Pay')}
            accessible={true}
            accessibilityLabel="QR Pay"
            accessibilityHint="Pay using QR code"
          >
            <View style={styles.actionIcon}>
              <Ionicons name="qr-code" size={22} color="#0070e0" />
            </View>
            <Text style={styles.quickActionText}>QR Pay</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => console.log('Bank Transfer')}
            accessible={true}
            accessibilityLabel="Bank Transfer"
            accessibilityHint="Transfer money to a bank account"
          >
            <View style={styles.actionIcon}>
              <Ionicons name="business" size={22} color="#0070e0" />
            </View>
            <Text style={styles.quickActionText}>Bank</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => console.log('GInsure')}
            accessible={true}
            accessibilityLabel="GInsure"
            accessibilityHint="Access insurance services"
          >
            <View style={styles.actionIcon}>
              <Ionicons name="shield-checkmark" size={22} color="#0070e0" />
            </View>
            <Text style={styles.quickActionText}>GInsure</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionItem}
            onPress={() => setVoiceModalVisible(true)}
            accessible={true}
            accessibilityLabel="Voice Assistant"
            accessibilityHint="Open voice assistant"
          >
            <View style={styles.actionIcon}>
              <Ionicons name="mic" size={22} color="#0070e0" />
            </View>
            <Text style={styles.quickActionText}>Assistant</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Transactions - GCash style */}
      <View style={styles.transactionsContainer}>
        <View style={styles.transactionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity 
            onPress={() => console.log('View all transactions')}
            style={styles.viewAllButton}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.transactionList}>
          {recentTransactions.map(transaction => (
            <TouchableOpacity 
              key={transaction.id}
              style={styles.transactionItem}
              onPress={() => handleTransactionPress(transaction.id)}
              accessible={true}
              accessibilityLabel={`${transaction.title} transaction ${transaction.amount} pesos`}
              accessibilityHint={`View details of ${transaction.title} transaction`}
            >
              <View style={[styles.transactionIconContainer, {
                backgroundColor: transaction.type === 'debit' ? '#f2f7ff' : '#f0fff4'
              }]}>
                <Ionicons 
                  name={transaction.icon} 
                  size={20} 
                  color={transaction.type === 'debit' ? '#0070e0' : '#4CAF50'} 
                />
              </View>
              
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              
              <Text 
                style={[styles.transactionAmount, {
                  color: transaction.type === 'debit' ? '#F44336' : '#4CAF50'
                }]}
              >
                {transaction.type === 'debit' ? '-' : '+'} ₱{transaction.amount}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      {/* Voice Assistant */}
      <VoiceAssistant position="bottom-right" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    margin: 0, 
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userIcon: {
    marginRight: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  balanceCard: {
    backgroundColor: '#0070e0',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: -20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    color: '#e0e0e0',
    fontSize: 14,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginVertical: 6,
    letterSpacing: 0.5,
  },
  accountNumber: {
    color: '#e0e0e0',
    fontSize: 12,
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#5299e0',
    paddingTop: 16,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'white',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  actionText: {
    color: 'white',
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  quickActionsContainer: {
    marginBottom: 15,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
    letterSpacing: 0.2,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  actionItem: {
    alignItems: 'center',
    width: '22%',
    marginBottom: 12,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 12, 
    backgroundColor: '#e6f2ff', 
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4500',
    fontSize: 8,
  },
  quickActionText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#444',
  },
  transactionsContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  viewAllText: {
    color: '#0070e0',
    fontWeight: '600',
    fontSize: 13,
  },
  transactionList: {
    flex: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#333',
  },
  transactionCategory: {
    fontSize: 12,
    color: '#666',
  },
  transactionAmountContainer: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontWeight: '600',
    fontSize: 16,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666',
  },
});
