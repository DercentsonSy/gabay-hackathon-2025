import axios from 'axios';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AlibabaCloudConfig from '../config/alibabacloud';
import { SpeechRecognitionResult } from './AlibabaCloudAI';
import { Platform } from 'react-native';

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

const getNLSToken = async (): Promise<string> => {
  try {
    if (AlibabaCloudConfig.nls.token && AlibabaCloudConfig.nls.token !== 'YOUR_NLS_TOKEN') {
      return AlibabaCloudConfig.nls.token;
    }
    
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
    throw new Error('Failed to get NLS token');
  }
};

export const realSpeechRecognitionService = {
  startRecording: async (): Promise<{ recording: Audio.Recording }> => {
    try {
      console.log('Requesting audio recording permissions...');
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        console.error('Audio recording permission denied');
        throw new Error('Audio recording permission not granted');
      }
      
      console.log('Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DUCK_OTHERS,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      console.log('Preparing to record...');
      const recording = new Audio.Recording();
      
      // Configure audio recording options based on platform
      const recordingOptions = {
        android: {
          extension: '.wav',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_PCM_16BIT,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
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
      };
      
      await recording.prepareToRecordAsync(recordingOptions);
      console.log('Starting recording...');
      await recording.startAsync();
      console.log('Recording started successfully');
      
      return { recording };
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  },
  
  // Stop recording and get audio file
  stopRecording: async (recording: Audio.Recording): Promise<string> => {
    try {
      console.log('Stopping recording...');
      await recording.stopAndUnloadAsync();
      console.log('Recording stopped successfully');
      
      const uri = recording.getURI();
      if (!uri) {
        console.error('No recording URI available');
        throw new Error('No recording URI available');
      }
      
      console.log('Recording URI:', uri);
      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      throw error;
    }
  },
  
  recognize: async (audioBlob: Blob): Promise<SpeechRecognitionResult> => {
    try {
      console.log("Sending audio to Alibaba Cloud Speech Recognition...");
      console.log("Audio blob size:", audioBlob.size, "bytes");
      
      if (audioBlob.size === 0) {
        console.error("Audio blob is empty");
        return {
          text: "I couldn't hear anything. Please try again.",
          confidence: 0.1
        };
      }
      
      const token = await getNLSToken();
      console.log("Got NLS token:", token.substring(0, 10) + "...");
      
      const base64Audio = await blobToBase64(audioBlob);
      console.log("Converted audio to base64, length:", base64Audio.length);
      
      console.log("Sending request to Alibaba Cloud NLS service...");
      const response = await axios({
        method: 'POST',
        url: `${AlibabaCloudConfig.endpoints.nls}/nls-service/v1/asr`,
        headers: {
          'Content-Type': 'application/json',
          'X-NLS-Token': token
        },
        data: {
          appkey: AlibabaCloudConfig.nls.appKey,
          format: 'wav',
          sample_rate: 16000,
          enable_punctuation: true,
          enable_inverse_text_normalization: true,
          enable_voice_detection: true,
          enable_model: "general",
          audio: base64Audio
        },
        timeout: 10000 // 10 seconds timeout
      });
      
      console.log('NLS ASR Response status:', response.status);
      console.log('NLS ASR Response data:', JSON.stringify(response.data));
      
      if (response.data && response.data.result) {
        console.log("Recognition succeeded with result:", response.data.result);
        return {
          text: response.data.result,
          confidence: response.data.confidence || 0.8
        };
      } else if (response.data && response.data.flash_result) {
        const text = response.data.flash_result.sentences[0]?.text || "";
        console.log("Recognition succeeded with flash result:", text);
        return {
          text: text,
          confidence: response.data.flash_result.sentences[0]?.confidence || 0.8
        };
      } else {
        console.warn("Recognition returned no result");
        return {
          text: "I couldn't understand that. Please try again.",
          confidence: 0.1
        };
      }
    } catch (error) {
      console.error('Error in speech recognition:', error);
      
      return {
        text: "Sorry, I encountered an error processing your speech.",
        confidence: 0.1
      };
    }
  },
  
  audioFileToBlob: async (fileUri: string): Promise<Blob> => {
    try {
      console.log('Getting file info:', fileUri);
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        console.error('Audio file does not exist');
        throw new Error('Audio file does not exist');
      }
      
      console.log('Reading audio file content as base64...');
      const base64Audio = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      console.log('Converting base64 to binary...');
      // Handle conversion based on platform
      if (Platform.OS === 'web') {
        // Web-specific handling
        const response = await fetch(`data:audio/wav;base64,${base64Audio}`);
        return await response.blob();
      } else {
        // Native platforms
        const binaryString = atob(base64Audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        console.log('Creating blob from binary data...');
        return new Blob([bytes], { type: 'audio/wav' });
      }
    } catch (error) {
      console.error('Error converting audio file to blob:', error);
      throw error;
    }
  }
};

export default realSpeechRecognitionService;
