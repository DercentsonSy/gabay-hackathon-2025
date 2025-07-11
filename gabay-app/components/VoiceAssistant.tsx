import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert, Animated, Easing, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AlibabaCloudAI, { NLPResult } from '../services/AlibabaCloudAI';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';

interface VoiceAssistantProps {
  position?: 'bottom-right' | 'bottom-center';
  userId?: string;
}

const VoiceAssistant = ({ position = 'bottom-right', userId = 'user123' }: VoiceAssistantProps) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [processingAI, setProcessingAI] = useState(false);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [voiceId, setVoiceId] = useState('female_1');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [maxRecordingDuration] = useState(10000); // 10 seconds maximum recording time
  const [isHoldingMic, setIsHoldingMic] = useState(false);
  
  const router = useRouter();
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rippleAnim = useRef(new Animated.Value(0)).current;
  const modalSlideAnim = useRef(new Animated.Value(0)).current;
  const recordingProgressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const preferences = await AlibabaCloudAI.Personalization.getUserPreferences(userId);
        setUserPreferences(preferences);
        
        if (preferences?.preferredVoice) {
          setVoiceId(preferences.preferredVoice);
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      }
    };
    
    loadUserPreferences();
  }, [userId]);
  
  useEffect(() => {
    let pulseAnimation: Animated.CompositeAnimation;
    let rippleAnimation: Animated.CompositeAnimation;
    
    if (isListening) {
      pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      
      rippleAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(rippleAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(rippleAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      
      pulseAnimation.start();
      rippleAnimation.start();
    }
    
    return () => {
      if (pulseAnimation) pulseAnimation.stop();
      if (rippleAnimation) rippleAnimation.stop();
    };
  }, [isListening, pulseAnim, rippleAnim]);
  
  useEffect(() => {
    if (modalVisible) {
      Animated.timing(modalSlideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease)
      }).start();
    } else {
      modalSlideAnim.setValue(0);
    }
  }, [modalVisible, modalSlideAnim]);

  const handleVoiceCommand = async (command: string) => {
    if (!command) return;
    
    try {
      setProcessingAI(true);
      
      AlibabaCloudAI.Personalization.logUserInteraction(userId, `voice_command:${command}`);
      const nlpResult: NLPResult = await AlibabaCloudAI.NLP.analyze(command);
      
      switch(nlpResult.intent) {
        case 'sendMoney':
          const recipient = nlpResult.entities.find(e => e.type === 'recipient')?.value || 'someone';
          const amount = nlpResult.entities.find(e => e.type === 'amount')?.value || '';
          
          const sendResponse = amount ? 
            `Opening send money to ${recipient} for ${amount} pesos...` : 
            `Opening send money to ${recipient}...`;
          
          await AlibabaCloudAI.TextToSpeech.synthesize(sendResponse, voiceId);
          setResponse(sendResponse);
          setTimeout(() => {
            setModalVisible(false);
            console.log('Navigating to Send Money');
            // router.push('/(features)/send-money');
          }, 2000);
          break;
          
        case 'payBill':
          const billType = nlpResult.entities.find(e => e.type === 'billType')?.value || 'bills';
          const billResponse = `Opening ${billType} payment...`;
          
          await AlibabaCloudAI.TextToSpeech.synthesize(billResponse, voiceId);
          setResponse(billResponse);
          setTimeout(() => {
            setModalVisible(false);
            console.log('Navigating to Pay Bills');
            // router.push('/(features)/pay-bills');
          }, 2000);
          break;
          
        case 'buyLoad':
          const loadResponse = 'Opening buy load feature...';
          await AlibabaCloudAI.TextToSpeech.synthesize(loadResponse, voiceId);
          
          setResponse(loadResponse);
          setTimeout(() => {
            setModalVisible(false);
            console.log('Navigating to Buy Load');
            // router.push('/(features)/buy-load');
          }, 2000);
          break;
          
        case 'checkBalance':
          const balanceResponse = 'Your current balance is 5,280 pesos.';
          await AlibabaCloudAI.TextToSpeech.synthesize(balanceResponse, voiceId);
          
          setResponse(balanceResponse);
          break;
          
        default:
          if (command.toLowerCase().includes('home')) {
            const homeResponse = 'Going to home screen...';
            await AlibabaCloudAI.TextToSpeech.synthesize(homeResponse, voiceId);
            setResponse(homeResponse);
            setTimeout(() => {
              setModalVisible(false);
              router.replace('/(tabs)');
            }, 1500);
          }
          else if (command.toLowerCase().includes('logout') || command.toLowerCase().includes('sign out')) {
            const logoutResponse = 'Logging you out...';
            await AlibabaCloudAI.TextToSpeech.synthesize(logoutResponse, voiceId);
            setResponse(logoutResponse);
            setTimeout(() => {
              setModalVisible(false);
              router.replace('/(auth)/login');
            }, 2000);
          }
          else {
            const unknownResponse = "I'm sorry, I didn't understand. You can try commands like 'send money', 'pay bills', 'buy load', or 'check balance'.";
            await AlibabaCloudAI.TextToSpeech.synthesize(unknownResponse, voiceId);
            setResponse(unknownResponse);
          }
      }
    } catch (error) {
      console.error('Error processing voice command:', error);
      setResponse("I'm sorry, there was a problem processing your request.");
    } finally {
      setProcessingAI(false);
    }
  };

  useEffect(() => {
    // Clean up any ongoing recording when the component unmounts
    return () => {
      if (recordingRef.current) {
        try {
          recordingRef.current.stopAndUnloadAsync();
        } catch (error) {
          console.error('Error cleaning up recording:', error);
        }
      }
      
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
      }
    };
  }, []);
  
  // Effect to handle recording duration animation
  useEffect(() => {
    if (isListening) {
      Animated.timing(recordingProgressAnim, {
        toValue: 1,
        duration: maxRecordingDuration,
        easing: Easing.linear,
        useNativeDriver: false
      }).start();
    } else {
      recordingProgressAnim.setValue(0);
    }
    
    return () => {
      recordingProgressAnim.stopAnimation();
    };
  }, [isListening, maxRecordingDuration, recordingProgressAnim]);

  const startListening = async () => {
    try {
      setIsListening(true);
      setTranscript('');
      setResponse('');
      setRecordingDuration(0);
      recordingProgressAnim.setValue(0);
      
      console.log('Starting voice recording...');
      const { recording } = await AlibabaCloudAI.SpeechRecognition.startRecording();
      recordingRef.current = recording;
      
      // Start a timer to track recording duration
      const startTime = Date.now();
      const durationTimer = setInterval(() => {
        const currentDuration = Date.now() - startTime;
        setRecordingDuration(currentDuration);
        
        if (currentDuration >= maxRecordingDuration) {
          clearInterval(durationTimer);
          stopListening();
        }
      }, 100);
      
      // Set up the automatic stop after max duration
      recordingTimerRef.current = setTimeout(() => {
        stopListening();
      }, maxRecordingDuration);
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      Alert.alert('Error', 'Could not access microphone. Please check permissions.');
      setIsListening(false);
    }
  };
  
  const stopListening = async () => {
    try {
      if (!recordingRef.current || !isListening) return;
      
      setIsListening(false);
      setProcessingAI(true);
      
      // Clear any timers
      if (recordingTimerRef.current) {
        clearTimeout(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
      const recording = recordingRef.current;
      recordingRef.current = null;
      
      console.log('Stopping voice recording...');
      const audioUri = await AlibabaCloudAI.SpeechRecognition.stopRecording(recording);
      console.log('Audio recorded, URI:', audioUri);
      
      const audioBlob = await AlibabaCloudAI.SpeechRecognition.audioFileToBlob(audioUri);
      console.log('Audio converted to blob, size:', audioBlob.size);
      
      const recognitionResult = await AlibabaCloudAI.SpeechRecognition.recognize(audioBlob);
      console.log('Speech recognition result:', recognitionResult);
      
      const transcribedText = recognitionResult.text;
      setTranscript(transcribedText);
      
      await handleVoiceCommand(transcribedText);
    } catch (error) {
      console.error('Error during speech recognition:', error);
      setResponse('Sorry, I had trouble processing your request. Please try again.');
    } finally {
      setProcessingAI(false);
    }
  };
  
  const useSampleCommand = (command: string) => {
    setTranscript(command);
    setProcessingAI(true);
    handleVoiceCommand(command);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.assistantButton, position === 'bottom-right' ? styles.bottomRight : styles.bottomCenter]}
        onPress={() => setModalVisible(true)}
        accessible={true}
        accessibilityLabel="Voice assistant"
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#0070e0', '#0089dc']}
          style={styles.assistantGradient}
        >
          <Ionicons name="mic-outline" size={24} color="white" />
        </LinearGradient>
      </TouchableOpacity>
      
      <Modal
        transparent={true}
        visible={modalVisible}
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              {
                transform: [{
                  translateY: modalSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0]
                  })
                }]
              }
            ]}
          >
            <LinearGradient
              colors={['#0070e0', '#0089dc']}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Voice Assistant</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close-outline" size={24} color="white" />
              </TouchableOpacity>
            </LinearGradient>
            
            <View style={styles.assistantContent}>
              {isListening ? (
                <View style={styles.listeningIndicator}>
                  <Text style={styles.listeningText}>Listening... {Math.floor(recordingDuration / 1000)}.{Math.floor((recordingDuration % 1000) / 100)}s</Text>
                  <View style={styles.recordingProgressContainer}>
                    <Animated.View 
                      style={[styles.recordingProgress, {
                        width: recordingProgressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%']
                        })
                      }]} 
                    />
                  </View>
                  <Animated.View 
                    style={[
                      styles.pulsingDot,
                      {transform: [{scale: pulseAnim}]}
                    ]} 
                  />
                </View>
              ) : processingAI ? (
                <View style={styles.listeningIndicator}>
                  <Text style={styles.listeningText}>Processing...</Text>
                  <ActivityIndicator color="#0070e0" size="small" />
                </View>
              ) : transcript ? (
                <View>
                  <Text style={styles.transcriptLabel}>You said:</Text>
                  <Text style={styles.transcript}>"{transcript}"</Text>
                  
                  {response && (
                    <>
                      <Text style={styles.responseLabel}>Assistant:</Text>
                      <Text style={styles.response}>{response}</Text>
                    </>
                  )}
                </View>
              ) : (
                <Text style={styles.instructionText}>
                  Tap the microphone and speak commands like "send money", 
                  "pay bills", "buy load", or "check balance"
                </Text>
              )}
            </View>
            
            <View style={styles.micButtonContainer}>
              <Animated.View
                style={[
                  styles.rippleCircle,
                  {
                    opacity: rippleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 0]
                    }),
                    transform: [{
                      scale: rippleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 2.5]
                      })
                    }]
                  }
                ]}
              />
              <TouchableOpacity 
                style={styles.micButton}
                onPressIn={() => {
                  if (!isListening && !processingAI) {
                    setIsHoldingMic(true);
                    startListening();
                  }
                }}
                onPressOut={() => {
                  if (isHoldingMic) {
                    setIsHoldingMic(false);
                    stopListening();
                  }
                }}
                disabled={processingAI}
                accessible={true}
                accessibilityLabel={isListening ? "Listening" : "Press and hold to speak"}
                accessibilityHint="Press and hold to activate voice assistant, release when done"
              >
                <LinearGradient
                  colors={['#0070e0', '#0089dc']}
                  style={styles.micButtonGradient}
                >
                  <Ionicons 
                    name={isListening ? "radio-outline" : "mic-outline"} 
                    size={32} 
                    color="#fff" 
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            
            <View style={styles.suggestionContainer}>
              <Text style={styles.suggestionTitle}>Try saying:</Text>
              <View style={styles.suggestions}>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => useSampleCommand("Send money to John")}
                  accessible={true}
                  accessibilityLabel="Send money voice command"
                >
                  <Text style={styles.suggestionText}>Send money</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => useSampleCommand("Pay my electricity bill")}
                  accessible={true}
                  accessibilityLabel="Pay bills voice command"
                >
                  <Text style={styles.suggestionText}>Pay bills</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => useSampleCommand("Buy load for my phone")}
                  accessible={true}
                  accessibilityLabel="Buy load voice command"
                >
                  <Text style={styles.suggestionText}>Buy load</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.suggestionChip}
                  onPress={() => useSampleCommand("Check my balance")}
                  accessible={true}
                  accessibilityLabel="Check balance voice command"
                >
                  <Text style={styles.suggestionText}>Check balance</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  assistantButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    position: 'absolute',
    zIndex: 1000,
    overflow: 'hidden',
  },
  assistantGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomRight: {
    bottom: 90,
    right: 20,
  },
  bottomCenter: {
    bottom: 90,
    alignSelf: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  assistantContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  listeningIndicator: {
    alignItems: 'center',
    width: '100%',
  },
  recordingProgressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginVertical: 10,
  },
  recordingProgress: {
    height: '100%',
    backgroundColor: '#0070e0',
    borderRadius: 2,
  },
  listeningText: {
    fontSize: 18,
    color: '#0070e0',
    marginBottom: 10,
    fontWeight: '500',
  },
  pulsingDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0070e0',
    opacity: 0.7,
  },
  transcriptLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  transcript: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    fontWeight: '500',
  },
  responseLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  response: {
    fontSize: 18,
    color: '#0070e0',
    fontWeight: '500',
  },
  micButtonContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    height: 90,
  },
  rippleCircle: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0070e0',
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    overflow: 'hidden',
  },
  micButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  suggestionTitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 12,
    fontWeight: '500',
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  suggestionChip: {
    backgroundColor: '#e6f2ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d9e6f2',
  },
  suggestionText: {
    color: '#0070e0',
    fontWeight: '500',
  },
});

export default VoiceAssistant;
