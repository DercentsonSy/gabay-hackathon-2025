/**
 * Real implementation of Speech Recognition using Alibaba Cloud NLS service
 */
import axios from 'axios';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AlibabaCloudConfig from '../config/alibabacloud';
import { SpeechRecognitionResult } from './AlibabaCloudAI';

// Create a simple way to encode blob data
const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        const base64data = (reader.result as string).split(',')[1];
        resolve(base64data);
      } else {
        reject(new Error('Failed to read blob data'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Get NLS token - in a production app, you'd want to cache this token
const getNLSToken = async (): Promise<string> => {
  try {
    // If you already have a token from the Alibaba Cloud console, use that
    if (AlibabaCloudConfig.nls.token && AlibabaCloudConfig.nls.token !== 'YOUR_NLS_TOKEN') {
      return AlibabaCloudConfig.nls.token;
    }
    
    // Otherwise, request a token from the NLS API
    const response = await axios({
      method: 'POST',
      url: `${AlibabaCloudConfig.endpoints.nls}/CreateToken`,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: AlibabaCloudConfig.accessKeyId,
        password: AlibabaCloudConfig.accessKeySecret
      }
    });
    
    return response.data.Token.Id;
  } catch (error) {
    console.error('Failed to get NLS token:', error);
    throw error;
  }
};

// Implements real speech recognition using Alibaba Cloud NLS
export const realSpeechRecognitionService = {
  // Record audio from microphone
  startRecording: async (): Promise<{ recording: Audio.Recording }> => {
    try {
      // Request permission
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error('Audio recording permission not granted');
      }
      
      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      
      // Start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });
      
      await recording.startAsync();
      
      return { recording };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  },
  
  // Stop recording and get audio file
  stopRecording: async (recording: Audio.Recording): Promise<string> => {
    try {
      await recording.stopAndUnloadAsync();
      
      // Get recording URI
      const uri = recording.getURI();
      if (!uri) {
        throw new Error('No recording URI available');
      }
      
      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  },
  
  // Recognize speech from audio file
  recognize: async (audioBlob: Blob): Promise<SpeechRecognitionResult> => {
    try {
      console.log("Sending audio to Alibaba Cloud Speech Recognition...");
      
      // Get token for NLS service
      const token = await getNLSToken();
      
      // Convert blob to base64
      const base64Audio = await blobToBase64(audioBlob);
      
      // Send to Alibaba Cloud NLS API
      const response = await axios({
        method: 'POST',
        url: `${AlibabaCloudConfig.endpoints.nls}/recognize`,
        headers: {
          'Content-Type': 'application/json',
          'X-NLS-Token': token
        },
        data: {
          appkey: AlibabaCloudConfig.nls.appKey,
          format: 'wav',
          sample_rate: 16000,
          enable_punctuation_prediction: true,
          enable_inverse_text_normalization: true,
          audio: base64Audio
        }
      });
      
      // Parse response
      if (response.data && response.data.result) {
        return {
          text: response.data.result,
          confidence: response.data.confidence || 0.8
        };
      } else {
        // For prototype fallback, in case of API failure
        return {
          text: "I couldn't understand that. Please try again.",
          confidence: 0.1
        };
      }
    } catch (error) {
      console.error('Error in speech recognition:', error);
      
      // Fallback for prototype
      return {
        text: "Sorry, I encountered an error processing your speech.",
        confidence: 0.1
      };
    }
  },
  
  // Convert audio file to blob for processing
  audioFileToBlob: async (fileUri: string): Promise<Blob> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file does not exist');
      }
      
      // Read file as base64
      const base64Audio = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Convert to binary
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Create blob
      return new Blob([bytes], { type: 'audio/wav' });
    } catch (error) {
      console.error('Error converting audio file to blob:', error);
      throw error;
    }
  }
};

export default realSpeechRecognitionService;
