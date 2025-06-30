import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Platform, Image } from 'react-native';
import { Text, TextInput, Button, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import VoiceAssistant from '../../components/VoiceAssistant';
import AlibabaCloudAI from '../../services/AlibabaCloudAI';

export default function SendMoneyScreen() {
  const router = useRouter();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  
  // Recent recipients with accessible data
  const recentRecipients = [
    { id: '1', name: 'John Smith', number: '0917-123-4567', image: 'https://via.placeholder.com/40/6200ee/ffffff?text=JS', lastSent: 'Last week' },
    { id: '2', name: 'Maria Garcia', number: '0999-888-7654', image: 'https://via.placeholder.com/40/6200ee/ffffff?text=MG', lastSent: 'Yesterday' },
    { id: '3', name: 'Carlos Reyes', number: '0918-555-1234', image: 'https://via.placeholder.com/40/6200ee/ffffff?text=CR', lastSent: '3 days ago' },
    { id: '4', name: 'Sarah Lee', number: '0927-765-4321', image: 'https://via.placeholder.com/40/6200ee/ffffff?text=SL', lastSent: 'Today' },
  ];

  // Simulated OCR for QR code scanning using Alibaba Cloud OCR
  const simulateQRScan = async () => {
    try {
      setOcrProcessing(true);
      // In a real app, this would capture an image from the camera
      // and send it to Alibaba Cloud OCR service
      
      // Simulating OCR processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulated OCR result
      const mockQrBlob = new Blob([], { type: 'image/png' });
      const ocrResult = await AlibabaCloudAI.OCR.extractText(mockQrBlob);
      
      // Handle QR content - in real app, this would parse QR data
      // For demo, just set a predetermined recipient
      setRecipient('Sarah Lee (0927-765-4321)');
      setAmount('500');
      
    } catch (error) {
      console.error('Error scanning QR code:', error);
    } finally {
      setOcrProcessing(false);
    }
  };

  // Process send money request
  const handleSendMoney = async () => {
    if (!recipient || !amount) {
      // In a real app, we would show proper validation errors
      alert('Please enter recipient and amount');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Simulate API call to process payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use Alibaba Cloud TTS to provide audio confirmation
      const confirmMessage = `Successfully sent ${amount} pesos to ${recipient.split('(')[0].trim()}`;
      await AlibabaCloudAI.TextToSpeech.synthesize(confirmMessage);
      
      // Log interaction for personalization
      AlibabaCloudAI.Personalization.logUserInteraction('user123', `send_money:${recipient}:${amount}`);
      
      // Show success and navigate back
      alert(confirmMessage);
      router.back();
    } catch (error) {
      console.error('Error sending money:', error);
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
        <Text style={styles.headerTitle}>Send Money</Text>
        <View style={styles.headerRight} />
      </View>
      
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Card style={styles.sendMoneyCard}>
          <Card.Content>
            <View style={styles.recipientSection}>
              <Text style={styles.sectionTitle}
                accessibilityRole="header">
                Recipient
              </Text>
              
              {/* QR Code Scan Button */}
              <View style={styles.qrCodeSection}>
                <TextInput
                  label="Recipient Name/Number"
                  value={recipient}
                  onChangeText={setRecipient}
                  style={styles.recipientInput}
                  accessibilityLabel="Recipient field"
                  accessibilityHint="Enter the name or phone number of the person you want to send money to"
                />
                <TouchableOpacity 
                  style={styles.qrButton}
                  onPress={simulateQRScan}
                  disabled={ocrProcessing}
                  accessible={true}
                  accessibilityLabel="Scan QR code"
                  accessibilityHint="Scan QR code to automatically fill recipient details"
                >
                  {ocrProcessing ? (
                    <ActivityIndicator size="small" color="#6200ee" />
                  ) : (
                    <Ionicons name="qr-code" size={24} color="#6200ee" />
                  )}
                </TouchableOpacity>
              </View>
              
              {/* Recent Recipients */}
              <Text style={styles.recentLabel}>Recent Recipients</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.recentRecipients}
                accessibilityLabel="Recent recipients list"
              >
                {recentRecipients.map(person => (
                  <TouchableOpacity 
                    key={person.id}
                    style={styles.recipientItem}
                    onPress={() => setRecipient(`${person.name} (${person.number})`)}
                    accessible={true}
                    accessibilityLabel={`${person.name}`}
                    accessibilityHint={`Select ${person.name} as recipient, last sent money ${person.lastSent}`}
                  >
                    <Image source={{ uri: person.image }} style={styles.recipientImage} />
                    <Text style={styles.recipientName} numberOfLines={1}>{person.name}</Text>
                    <Text style={styles.lastSent}>{person.lastSent}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            
            <View style={styles.amountSection}>
              <Text style={styles.sectionTitle}
                accessibilityRole="header">
                Amount
              </Text>
              <TextInput
                label="Amount (PHP)"
                value={amount}
                onChangeText={setAmount}
                style={styles.amountInput}
                keyboardType="numeric"
                accessibilityLabel="Amount field"
                accessibilityHint="Enter the amount in Philippine pesos you want to send"
                left={<TextInput.Affix text="₱" />}
              />
              
              {/* Quick Amount Buttons */}
              <View style={styles.quickAmounts}>
                {[100, 200, 500, 1000].map(value => (
                  <Chip 
                    key={value}
                    mode="outlined"
                    selected={amount === value.toString()}
                    onPress={() => setAmount(value.toString())}
                    style={styles.amountChip}
                    accessibilityLabel={`${value} pesos`}
                    accessibilityHint={`Set amount to ${value} pesos`}
                  >
                    ₱{value}
                  </Chip>
                ))}
              </View>
            </View>
            
            <View style={styles.noteSection}>
              <Text style={styles.sectionTitle}>Note (Optional)</Text>
              <TextInput
                label="Add a message"
                value={note}
                onChangeText={setNote}
                style={styles.noteInput}
                multiline
                numberOfLines={2}
                accessibilityLabel="Note field"
                accessibilityHint="Optional message to include with your money transfer"
              />
            </View>
            
            <Button 
              mode="contained"
              loading={isProcessing}
              disabled={isProcessing || !recipient || !amount}
              onPress={handleSendMoney}
              style={styles.sendButton}
              labelStyle={styles.sendButtonLabel}
              accessibilityLabel="Send money button"
              accessibilityHint="Confirms and processes the money transfer"
            >
              {isProcessing ? 'Processing...' : 'Send Money'}
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
  sendMoneyCard: {
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
  recipientSection: {
    marginBottom: 24,
  },
  qrCodeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipientInput: {
    flex: 1,
  },
  qrButton: {
    marginLeft: 8,
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recentLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recentRecipients: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  recipientItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 70,
  },
  recipientImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
  },
  lastSent: {
    fontSize: 10,
    color: '#888',
  },
  amountSection: {
    marginBottom: 24,
  },
  amountInput: {
    marginBottom: 12,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amountChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  noteSection: {
    marginBottom: 24,
  },
  noteInput: {
    marginBottom: 16,
  },
  sendButton: {
    padding: 8,
    borderRadius: 8,
  },
  sendButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 4,
  },
});
