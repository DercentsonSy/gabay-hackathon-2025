/**
 * Real implementation of Text-to-Speech using Alibaba Cloud Intelligent Speech Interaction
 */
import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import AlibabaCloudConfig from '../config/alibabacloud';
import { Voice } from './AlibabaCloudAI';

// Get NLS token for speech synthesis
const getNLSToken = async (): Promise<string> => {
  try {
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
    console.error('Failed to get NLS token for TTS:', error);
    throw error;
  }
};

// Implements real text-to-speech service using Alibaba Cloud NLS
export const realTextToSpeechService = {
  // Available voices - these will be fetched from API in production
  voices: [
    { id: "en_us_female_1", name: "US English Female", language: "en-US" },
    { id: "en_us_male_1", name: "US English Male", language: "en-US" },
    { id: "fil_female_1", name: "Filipino Female", language: "fil-PH" },
    { id: "fil_male_1", name: "Filipino Male", language: "fil-PH" },
    { id: "en_ph_female_1", name: "Filipino English Female", language: "en-PH" },
    { id: "en_ph_male_1", name: "Filipino English Male", language: "en-PH" }
  ],
  
  // Synthesize text to speech
  synthesize: async (text: string, voiceId: string = "en_us_female_1"): Promise<string> => {
    try {
      console.log(`Synthesizing speech for text: "${text}" with voice: ${voiceId}`);
      
      // Get NLS token
      const token = await getNLSToken();
      
      // Get the appropriate voice language from the voiceId
      const voice = realTextToSpeechService.voices.find(v => v.id === voiceId) || 
                    realTextToSpeechService.voices[0]; // Default to first voice
      
      // Configure language settings based on voice
      const languageConfig = {
        language: voice.language.split('-')[0], // Extract primary language code
        voice: voiceId
      };
      
      // Send to Alibaba Cloud TTS API
      const response = await axios({
        method: 'POST',
        url: `${AlibabaCloudConfig.endpoints.nls}/nls-service/v1/tts`,
        headers: {
          'Content-Type': 'application/json',
          'X-NLS-Token': token,
          'Accept': 'audio/mpeg' // Specify we want audio back
        },
        data: {
          appkey: AlibabaCloudConfig.nls.appKey,
          text: text,
          format: 'mp3',
          sample_rate: 16000,
          voice: languageConfig.voice,
          volume: 50, // Volume from 0-100
          speech_rate: 0, // Speed from -500 to 500
          pitch_rate: 0  // Pitch from -500 to 500
        },
        responseType: 'arraybuffer'
      });
      
      console.log('TTS API call successful, received audio data of length:', response.data.length);
      
      // Save audio file to local storage
      const timestamp = Date.now();
      const audioFilePath = `${FileSystem.documentDirectory}tts-${timestamp}.mp3`;
      
      // Convert response to base64 for saving
      const base64Audio = Buffer.from(response.data).toString('base64');
      await FileSystem.writeAsStringAsync(audioFilePath, base64Audio, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Return the file URI for playback
      return audioFilePath;
    } catch (error) {
      console.error('Error in text-to-speech synthesis:', error);
      throw error;
    }
  },
  
  // Get available voices from the service
  getVoices: async (): Promise<Voice[]> => {
    try {
      // In a real implementation, we would fetch the available voices from the API
      // For now, we'll return our predefined list
      return realTextToSpeechService.voices;
    } catch (error) {
      console.error('Error fetching available voices:', error);
      return realTextToSpeechService.voices; // Fall back to predefined list
    }
  }
};

export default realTextToSpeechService;
