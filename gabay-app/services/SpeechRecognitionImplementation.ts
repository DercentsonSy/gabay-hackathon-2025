import axios from 'axios';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AlibabaCloudConfig from '../config/alibabacloud';
import { SpeechRecognitionResult } from './AlibabaCloudAI';

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
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error('Audio recording permission not granted');
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
      });
      
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.wav',
          outputFormat: 2, // ENCODING_PCM_16BIT
          audioEncoder: 3, // AMR_NB
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: 1, // kAudioFormatLinearPCM
          audioQuality: 0x7E, // AVAudioQualityHigh
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
  
  recognize: async (audioBlob: Blob): Promise<SpeechRecognitionResult> => {
    try {
      console.log("Sending audio to Alibaba Cloud Speech Recognition...");
      
      const token = await getNLSToken();
      
      const base64Audio = await blobToBase64(audioBlob);
      
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
        }
      });
      
      console.log('NLS ASR Response:', JSON.stringify(response.data));
      
      if (response.data && response.data.result) {
        return {
          text: response.data.result,
          confidence: response.data.confidence || 0.8
        };
      } else if (response.data && response.data.flash_result) {
        return {
          text: response.data.flash_result.sentences[0]?.text || "",
          confidence: response.data.flash_result.sentences[0]?.confidence || 0.8
        };
      } else {
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
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('Audio file does not exist');
      }
      
      const base64Audio = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      return new Blob([bytes], { type: 'audio/wav' });
    } catch (error) {
      console.error('Error converting audio file to blob:', error);
      throw error;
    }
  }
};

export default realSpeechRecognitionService;
