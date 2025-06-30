import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { Text, TextInput, Button, Card, Chip, ActivityIndicator, Divider } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import VoiceAssistant from '../../components/VoiceAssistant';
import AlibabaCloudAI from '../../services/AlibabaCloudAI';

export default function PayBillsScreen() {
  const router = useRouter();
  const [selectedBiller, setSelectedBiller] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  
  // Categories and billers
  const categories = ['Utilities', 'Telecoms', 'Credit Cards', 'Government', 'Insurance'];
  const [selectedCategory, setSelectedCategory] = useState('Utilities');
  
  // Sample billers
  const billers = {
    'Utilities': [
      { id: '1', name: 'Meralco', logo: 'https://via.placeholder.com/60x60/f8d800/000000?text=Meralco', popular: true },
      { id: '2', name: 'Manila Water', logo: 'https://via.placeholder.com/60x60/00b4e6/ffffff?text=MW', popular: false },
      { id: '3', name: 'Maynilad', logo: 'https://via.placeholder.com/60x60/0070b9/ffffff?text=Maynilad', popular: true },
    ],
    'Telecoms': [
      { id: '4', name: 'Globe', logo: 'https://via.placeholder.com/60x60/0066B3/ffffff?text=Globe', popular: true },
      { id: '5', name: 'PLDT', logo: 'https://via.placeholder.com/60x60/ee3124/ffffff?text=PLDT', popular: true },
      { id: '6', name: 'Smart', logo: 'https://via.placeholder.com/60x60/00B140/ffffff?text=Smart', popular: false },
    ],
    'Credit Cards': [
      { id: '7', name: 'BPI', logo: 'https://via.placeholder.com/60x60/0066b3/ffffff?text=BPI', popular: true },
      { id: '8', name: 'BDO', logo: 'https://via.placeholder.com/60x60/0052a5/ffffff?text=BDO', popular: true },
    ],
    'Government': [
      { id: '9', name: 'SSS', logo: 'https://via.placeholder.com/60x60/1f4e79/ffffff?text=SSS', popular: true },
      { id: '10', name: 'Pag-IBIG', logo: 'https://via.placeholder.com/60x60/d71921/ffffff?text=Pag-IBIG', popular: false },
    ],
    'Insurance': [
      { id: '11', name: 'PhilHealth', logo: 'https://via.placeholder.com/60x60/005aab/ffffff?text=PhilHealth', popular: false },
      { id: '12', name: 'Manulife', logo: 'https://via.placeholder.com/60x60/00a758/ffffff?text=Manulife', popular: false },
    ],
  };

  // Bill history for quick re-payment
  const billHistory = [
    { id: '1', biller: 'Meralco', accountNumber: '12345-678-901', amount: '1,520.75', dueDate: '07/15/2025' },
    { id: '2', biller: 'Globe', accountNumber: '0917-123-4567', amount: '999.00', dueDate: '07/05/2025' },
  ];

  // Simulated OCR for bill scanning using Alibaba Cloud OCR
  const simulateScanBill = async () => {
    try {
      setOcrProcessing(true);
      
      // In a real app, this would capture an image from the camera
      // and send it to Alibaba Cloud OCR service
      
      // Simulating OCR processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulated OCR result
      const mockBillBlob = new Blob([], { type: 'image/png' });
      const ocrResult = await AlibabaCloudAI.OCR.extractText(mockBillBlob);
      
      // Parse OCR result
      console.log('OCR result:', ocrResult.text);
      
      // Set values based on simulated OCR result
      setSelectedBiller('Meralco');
      setAccountNumber('12345-678-901');
      setAmount('1520.75');
      
    } catch (error) {
      console.error('Error scanning bill:', error);
    } finally {
      setOcrProcessing(false);
    }
  };

  // Process bill payment
  const handlePayBill = async () => {
    if (!selectedBiller || !accountNumber || !amount) {
      // In a real app, we would show proper validation errors
      alert('Please enter all required information');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Simulate API call to process payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use Alibaba Cloud TTS to provide audio confirmation
      const confirmMessage = `Successfully paid ${amount} pesos to ${selectedBiller}`;
      await AlibabaCloudAI.TextToSpeech.synthesize(confirmMessage);
      
      // Log interaction for personalization
      AlibabaCloudAI.Personalization.logUserInteraction('user123', `pay_bill:${selectedBiller}:${amount}`);
      
      // Show success and navigate back
      alert(confirmMessage);
      router.back();
    } catch (error) {
      console.error('Error paying bill:', error);
      alert('Failed to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityHint="Returns to the previous screen"
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay Bills</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.billCard}>
          <Card.Content>
            {/* Bill History */}
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Recent Bills
              </Text>
              
              {billHistory.map((bill) => (
                <TouchableOpacity 
                  key={bill.id}
                  style={styles.billHistoryItem}
                  onPress={() => {
                    setSelectedBiller(bill.biller);
                    setAccountNumber(bill.accountNumber);
                    setAmount(bill.amount.replace(/,/g, ''));
                  }}
                  accessible={true}
                  accessibilityLabel={`${bill.biller} bill`}
                  accessibilityHint={`${bill.biller} bill for ${bill.accountNumber}, amount ${bill.amount} pesos, due on ${bill.dueDate}`}
                >
                  <View style={styles.billInfo}>
                    <Text style={styles.billName}>{bill.biller}</Text>
                    <Text style={styles.billAccount}>{bill.accountNumber}</Text>
                    <Text style={styles.billDueDate}>Due: {bill.dueDate}</Text>
                  </View>
                  <View style={styles.billAmount}>
                    <Text style={styles.billAmountText}>₱{bill.amount}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#666" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
            
            <Divider style={{marginVertical: 16}} />
            
            {/* Scan Bill Button */}
            <Button
              mode="outlined"
              onPress={simulateScanBill}
              disabled={ocrProcessing}
              style={styles.scanButton}
              icon={ocrProcessing ? 'loading' : 'camera'}
              accessibilityLabel="Scan bill button"
              accessibilityHint="Scan a bill using your camera to automatically fill details"
            >
              {ocrProcessing ? 'Scanning...' : 'Scan Bill'}
            </Button>
            
            {/* Categories */}
            <Text style={[styles.sectionTitle, {marginTop: 16}]} accessibilityRole="header">
              Categories
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              accessibilityLabel="Bill categories"
            >
              {categories.map((category) => (
                <Chip
                  key={category}
                  selected={selectedCategory === category}
                  onPress={() => setSelectedCategory(category)}
                  style={styles.categoryChip}
                  accessibilityLabel={category}
                  accessibilityHint={`Select ${category} category`}
                >
                  {category}
                </Chip>
              ))}
            </ScrollView>
            
            {/* Billers Grid */}
            <Text style={[styles.sectionTitle, {marginTop: 16}]} accessibilityRole="header">
              Select Biller
            </Text>
            <View style={styles.billersGrid}>
              {billers[selectedCategory].map((biller) => (
                <TouchableOpacity
                  key={biller.id}
                  style={[
                    styles.billerItem,
                    selectedBiller === biller.name && styles.selectedBillerItem
                  ]}
                  onPress={() => setSelectedBiller(biller.name)}
                  accessible={true}
                  accessibilityLabel={`${biller.name} biller`}
                  accessibilityHint={`Select ${biller.name} as your biller`}
                >
                  <Image source={{ uri: biller.logo }} style={styles.billerLogo} />
                  <Text style={styles.billerName}>{biller.name}</Text>
                  {biller.popular && (
                    <Chip compact mode="flat" style={styles.popularChip}>Popular</Chip>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            {/* Account Number and Amount */}
            {selectedBiller && (
              <View style={styles.paymentDetailsSection}>
                <Text style={styles.payingTo}>Paying to: {selectedBiller}</Text>
                
                <TextInput
                  label="Account Number"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  style={styles.detailsInput}
                  accessibilityLabel="Account number field"
                  accessibilityHint={`Enter your ${selectedBiller} account number`}
                />
                
                <TextInput
                  label="Amount (PHP)"
                  value={amount}
                  onChangeText={setAmount}
                  style={styles.detailsInput}
                  keyboardType="numeric"
                  accessibilityLabel="Amount field"
                  accessibilityHint="Enter the amount in Philippine pesos you want to pay"
                  left={<TextInput.Affix text="₱" />}
                />
                
                <Button 
                  mode="contained"
                  loading={isProcessing}
                  disabled={isProcessing || !selectedBiller || !accountNumber || !amount}
                  onPress={handlePayBill}
                  style={styles.payButton}
                  labelStyle={styles.payButtonLabel}
                  accessibilityLabel="Pay bill button"
                  accessibilityHint="Confirms and processes the bill payment"
                >
                  {isProcessing ? 'Processing...' : 'Pay Bill'}
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* Voice Assistant */}
      <VoiceAssistant />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 16,
    backgroundColor: '#6200ee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  billCard: {
    marginBottom: 16,
    borderRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  historySection: {
    marginBottom: 16,
  },
  billHistoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  billAccount: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  billDueDate: {
    fontSize: 12,
    color: '#e53935',
    marginTop: 2,
  },
  billAmount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  billAmountText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 4,
  },
  scanButton: {
    marginVertical: 8,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  billersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 8,
  },
  billerItem: {
    width: '31%',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  selectedBillerItem: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  billerLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  billerName: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
  popularChip: {
    backgroundColor: '#ffecb3',
    height: 20,
  },
  paymentDetailsSection: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  payingTo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  detailsInput: {
    marginBottom: 16,
  },
  payButton: {
    padding: 8,
    marginTop: 8,
    borderRadius: 8,
  },
  payButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 4,
  },
});
