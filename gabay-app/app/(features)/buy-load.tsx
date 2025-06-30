import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { Text, TextInput, Button, Card, Chip, RadioButton, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import VoiceAssistant from '../../components/VoiceAssistant';
import AlibabaCloudAI from '../../services/AlibabaCloudAI';

export default function BuyLoadScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [telco, setTelco] = useState('Globe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  
  // Predefined load amounts
  const loadAmounts = [50, 100, 300, 500, 1000];
  
  // Recent load transactions
  const recentTransactions = [
    { id: '1', number: '0917-123-4567', telco: 'Globe', name: 'John (Me)', lastLoaded: '2 days ago' },
    { id: '2', number: '0999-888-7654', telco: 'Smart', name: 'Mom', lastLoaded: 'Last week' },
    { id: '3', number: '0927-765-4321', telco: 'Globe', name: 'Sister', lastLoaded: 'Yesterday' },
  ];

  // Load user preferences on component mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const preferences = await AlibabaCloudAI.Personalization.getUserPreferences('user123');
        setUserPreferences(preferences);
        
        // Set default phone number if found in preferences
        if (preferences?.frequentNumbers?.length > 0) {
          setPhoneNumber(preferences.frequentNumbers[0]);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, []);

  // Use Alibaba Cloud NLP to detect carrier based on phone number
  const detectCarrier = async (number: string) => {
    if (!number || number.length < 10) return;
    
    try {
      // In a real implementation, this would call Alibaba Cloud NLP 
      // with pattern recognition to determine carrier from number prefix
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simple prefix detection for demo
      if (number.startsWith('0917') || number.startsWith('0915')) {
        setTelco('Globe');
      } else if (number.startsWith('0999') || number.startsWith('0998')) {
        setTelco('Smart');
      } else if (number.startsWith('0922') || number.startsWith('0923')) {
        setTelco('Sun');
      }
    } catch (error) {
      console.error('Error detecting carrier:', error);
    }
  };

  // Handle phone number change
  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    detectCarrier(text);
  };

  // Handle selection of recent transaction
  const handleSelectRecent = (item: any) => {
    setPhoneNumber(item.number);
    setTelco(item.telco);
  };

  // Process buy load request
  const handleBuyLoad = async () => {
    if (!phoneNumber || !amount) {
      alert('Please enter phone number and amount');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Simulate API call to process load purchase
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use Alibaba Cloud TTS to provide audio confirmation
      const confirmMessage = `Successfully bought ${amount} pesos load for ${phoneNumber}`;
      await AlibabaCloudAI.TextToSpeech.synthesize(confirmMessage);
      
      // Log interaction for personalization
      AlibabaCloudAI.Personalization.logUserInteraction('user123', `buy_load:${phoneNumber}:${amount}`);
      
      // Show success and navigate back
      alert(confirmMessage);
      router.back();
    } catch (error) {
      console.error('Error buying load:', error);
      alert('Failed to process transaction. Please try again.');
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
        <Text style={styles.headerTitle}>Buy Load</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.loadCard}>
          <Card.Content>
            {/* Recent Loads */}
            <View style={styles.recentSection}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Recent Numbers
              </Text>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.recentNumbers}
                accessibilityLabel="Recent phone numbers"
              >
                {recentTransactions.map((item) => (
                  <TouchableOpacity 
                    key={item.id}
                    style={styles.recentItem}
                    onPress={() => handleSelectRecent(item)}
                    accessible={true}
                    accessibilityLabel={`${item.name}, ${item.number}`}
                    accessibilityHint={`Select ${item.name}'s ${item.telco} number ${item.number}, last loaded ${item.lastLoaded}`}
                  >
                    <View style={[styles.telcoIndicator, { backgroundColor: item.telco === 'Globe' ? '#0066B3' : item.telco === 'Smart' ? '#00B140' : '#FBC108' }]} />
                    <View style={styles.recentItemContent}>
                      <Text style={styles.recentName}>{item.name}</Text>
                      <Text style={styles.recentNumber}>{item.number}</Text>
                      <Text style={styles.recentLastLoaded}>{item.lastLoaded}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            {/* Phone Number Input */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Mobile Number
              </Text>
              
              <TextInput
                label="Phone Number"
                value={phoneNumber}
                onChangeText={handlePhoneNumberChange}
                style={styles.phoneInput}
                keyboardType="phone-pad"
                accessibilityLabel="Phone number field"
                accessibilityHint="Enter the mobile number to buy load for"
              />
              
              {/* Network Selection */}
              <Text style={styles.networkLabel}>Select Network:</Text>
              <RadioButton.Group onValueChange={(value) => setTelco(value)} value={telco}>
                <View style={styles.networkOptions}>
                  <View style={styles.networkOption}>
                    <RadioButton 
                      value="Globe" 
                      accessibilityLabel="Globe network"
                    />
                    <TouchableOpacity 
                      onPress={() => setTelco('Globe')}
                      accessible={true}
                      accessibilityLabel="Globe network"
                      accessibilityHint="Select Globe as the mobile network"
                    >
                      <View style={styles.networkLabel}>
                        <View style={[styles.networkDot, { backgroundColor: '#0066B3' }]} />
                        <Text>Globe</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.networkOption}>
                    <RadioButton 
                      value="Smart" 
                      accessibilityLabel="Smart network"
                    />
                    <TouchableOpacity 
                      onPress={() => setTelco('Smart')}
                      accessible={true}
                      accessibilityLabel="Smart network"
                      accessibilityHint="Select Smart as the mobile network"
                    >
                      <View style={styles.networkLabel}>
                        <View style={[styles.networkDot, { backgroundColor: '#00B140' }]} />
                        <Text>Smart</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.networkOption}>
                    <RadioButton 
                      value="Sun" 
                      accessibilityLabel="Sun network"
                    />
                    <TouchableOpacity 
                      onPress={() => setTelco('Sun')}
                      accessible={true}
                      accessibilityLabel="Sun network"
                      accessibilityHint="Select Sun as the mobile network"
                    >
                      <View style={styles.networkLabel}>
                        <View style={[styles.networkDot, { backgroundColor: '#FBC108' }]} />
                        <Text>Sun</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </RadioButton.Group>
            </View>
            
            {/* Amount Selection */}
            <View style={styles.amountSection}>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                Load Amount
              </Text>
              
              {/* Amount input */}
              <TextInput
                label="Amount (PHP)"
                value={amount}
                onChangeText={setAmount}
                style={styles.amountInput}
                keyboardType="numeric"
                accessibilityLabel="Amount field"
                accessibilityHint="Enter the amount in Philippine pesos"
                left={<TextInput.Affix text="₱" />}
              />
              
              {/* Predefined amounts */}
              <View style={styles.amountOptions}>
                {loadAmounts.map((value) => (
                  <TouchableOpacity 
                    key={value}
                    style={[
                      styles.amountOption,
                      amount === value.toString() && styles.selectedAmount
                    ]}
                    onPress={() => setAmount(value.toString())}
                    accessible={true}
                    accessibilityLabel={`${value} pesos`}
                    accessibilityHint={`Set amount to ${value} pesos`}
                  >
                    <Text style={[
                      styles.amountText,
                      amount === value.toString() && styles.selectedAmountText
                    ]}>
                      ₱{value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Promos section */}
              <View style={styles.promosSection}>
                <Text style={styles.promoTitle}>Available Promos</Text>
                <TouchableOpacity 
                  style={styles.promoItem}
                  onPress={() => {
                    setAmount('50');
                  }}
                  accessible={true}
                  accessibilityLabel="All-net texts promo"
                  accessibilityHint="50 pesos for unlimited texts to all networks for 3 days"
                >
                  <View style={styles.promoContent}>
                    <Text style={styles.promoName}>All-net Texts</Text>
                    <Text style={styles.promoDesc}>Unlimited texts to all networks for 3 days</Text>
                  </View>
                  <Text style={styles.promoPrice}>₱50</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.promoItem}
                  onPress={() => {
                    setAmount('100');
                  }}
                  accessible={true}
                  accessibilityLabel="Data plus promo"
                  accessibilityHint="100 pesos for 5GB data valid for 7 days"
                >
                  <View style={styles.promoContent}>
                    <Text style={styles.promoName}>Data Plus</Text>
                    <Text style={styles.promoDesc}>5GB data valid for 7 days</Text>
                  </View>
                  <Text style={styles.promoPrice}>₱100</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Buy Load Button */}
            <Button 
              mode="contained"
              loading={isProcessing}
              disabled={isProcessing || !phoneNumber || !amount}
              onPress={handleBuyLoad}
              style={styles.buyButton}
              labelStyle={styles.buyButtonLabel}
              accessibilityLabel="Buy load button"
              accessibilityHint="Confirms and processes the load purchase"
            >
              {isProcessing ? 'Processing...' : 'Buy Load'}
            </Button>
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
  loadCard: {
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
  recentSection: {
    marginBottom: 24,
  },
  recentNumbers: {
    flexDirection: 'row',
  },
  recentItem: {
    flexDirection: 'row',
    width: 150,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  telcoIndicator: {
    width: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  recentItemContent: {
    flex: 1,
  },
  recentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  recentNumber: {
    fontSize: 13,
    color: '#666',
  },
  recentLastLoaded: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  inputSection: {
    marginBottom: 24,
  },
  phoneInput: {
    marginBottom: 16,
  },
  networkLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  networkOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  amountSection: {
    marginBottom: 24,
  },
  amountInput: {
    marginBottom: 16,
  },
  amountOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  amountOption: {
    width: '18%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  selectedAmount: {
    borderColor: '#6200ee',
    backgroundColor: '#f3e5f5',
  },
  amountText: {
    color: '#333',
  },
  selectedAmountText: {
    color: '#6200ee',
    fontWeight: 'bold',
  },
  promosSection: {
    marginTop: 16,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  promoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 8,
  },
  promoContent: {
    flex: 1,
  },
  promoName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  promoDesc: {
    fontSize: 13,
    color: '#666',
  },
  promoPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6200ee',
  },
  buyButton: {
    padding: 8,
    borderRadius: 8,
    marginTop: 16,
  },
  buyButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 4,
  },
});
