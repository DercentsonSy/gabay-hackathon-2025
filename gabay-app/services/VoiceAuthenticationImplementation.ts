import axios from 'axios';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import AlibabaCloudConfig from '../config/alibabacloud';

export interface VoiceVerificationResult {
  verified: boolean;
  confidence: number;
  message: string;
}

export interface VoiceEnrollmentResult {
  success: boolean;
  voiceId: string;
  message: string;
}

export interface VoiceProfile {
  voiceId: string;
  userId: string;
  createdAt: string;
  status: 'active' | 'pending' | 'failed';
}

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

const getAuthToken = async (): Promise<string> => {
  try {
    const response = await axios({
      method: 'POST',
      url: 'https://auth.aliyuncs.com/v1/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: AlibabaCloudConfig.accessKeyId,
        client_secret: AlibabaCloudConfig.accessKeySecret,
      }),
    });
    
    return response.data.access_token;
  } catch (error) {
    console.error('Failed to get auth token:', error);
    throw error;
  }
};

export const realVoiceAuthenticationService = {
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
          outputFormat: 2,
          audioEncoder: 3,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: 1,
          audioQuality: 0x7F,
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
      console.error('Error starting voice recording:', error);
      throw error;
    }
  },
  
  stopRecording: async (recording: Audio.Recording): Promise<string> => {
    try {
      await recording.stopAndUnloadAsync();
      
      const uri = recording.getURI();
      if (!uri) {
        throw new Error('No recording URI available');
      }
      
      return uri;
    } catch (error) {
      console.error('Error stopping voice recording:', error);
      throw error;
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
      
      // Create blob
      return new Blob([bytes], { type: 'audio/wav' });
    } catch (error) {
      console.error('Error converting audio file to blob:', error);
      throw error;
    }
  },
  
  enrollVoice: async (userId: string, audioBlob: Blob, phrase?: string): Promise<VoiceEnrollmentResult> => {
    try {
      console.log(`Enrolling voice for user ID: ${userId}`);
      
      const token = await getAuthToken();
      
      const base64Audio = await blobToBase64(audioBlob);
      
      const response = await axios({
        method: 'POST',
        url: `${AlibabaCloudConfig.endpoints.nls}/speaker/enrollment`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          userId: userId,
          audio: base64Audio,
          audioFormat: 'wav',
          sampleRate: 16000,
          phrase: phrase || 'my voice is my password',
          modelType: 'text_dependent'
        }
      });
      
      if (response.data && response.data.voiceId) {
        return {
          success: true,
          voiceId: response.data.voiceId,
          message: 'Voice enrolled successfully'
        };
      } else {
        throw new Error('Voice enrollment failed: No voice ID returned');
      }
    } catch (error) {
      console.error('Error in voice enrollment:', error);
      return {
        success: false,
        voiceId: '',
        message: `Voice enrollment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
  
  // Verify a user's identity using their voice
  verifyVoice: async (voiceId: string, audioBlob: Blob, phrase?: string): Promise<VoiceVerificationResult> => {
    try {
      console.log(`Verifying voice against ID: ${voiceId}`);
      
      const token = await getAuthToken();
      
      const base64Audio = await blobToBase64(audioBlob);
      
      const response = await axios({
        method: 'POST',
        url: `${AlibabaCloudConfig.endpoints.nls}/speaker/verify`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        data: {
          voiceId: voiceId,
          audio: base64Audio,
          audioFormat: 'wav',
          sampleRate: 16000,
          phrase: phrase || 'my voice is my password',
          minConfidenceThreshold: 0.7
        }
      });
      
      if (response.data) {
        const confidence = response.data.confidence || 0;
        const verified = confidence >= 0.7;
        
        return {
          verified,
          confidence,
          message: verified ? 
            'Voice verified successfully' : 
            'Voice verification failed: Confidence below threshold'
        };
      } else {
        throw new Error('Voice verification failed: Invalid response');
      }
    } catch (error) {
      console.error('Error in voice verification:', error);
      return {
        verified: false,
        confidence: 0,
        message: `Voice verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  },
  
  getVoiceProfiles: async (userId: string): Promise<VoiceProfile[]> => {
    try {
      console.log(`Getting voice profiles for user ID: ${userId}`);
      
      const token = await getAuthToken();
      
      const response = await axios({
        method: 'GET',
        url: `${AlibabaCloudConfig.endpoints.nls}/speaker/profiles`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        params: {
          userId
        }
      });
      
      if (response.data && Array.isArray(response.data.profiles)) {
        return response.data.profiles.map((profile: any) => ({
          voiceId: profile.voiceId,
          userId: profile.userId,
          createdAt: profile.createdAt,
          status: profile.status || 'active'
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error getting voice profiles:', error);
      return [];
    }
  },
  
  deleteVoiceProfile: async (voiceId: string): Promise<boolean> => {
    try {
      console.log(`Deleting voice profile with ID: ${voiceId}`);
      
      const token = await getAuthToken();
      
      const response = await axios({
        method: 'DELETE',
        url: `${AlibabaCloudConfig.endpoints.nls}/speaker/profiles/${voiceId}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.status === 200 || response.status === 204;
    } catch (error) {
      console.error('Error deleting voice profile:', error);
      return false;
    }
  }
};

export default realVoiceAuthenticationService;
