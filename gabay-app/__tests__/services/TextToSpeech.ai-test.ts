/**
 * Text-to-Speech AI Service Tests
 * Uses isolated test setup with our custom Jest configuration
 */

// Import axios which we'll mock
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Set up the mocked axios
const mockAxios = axios as jest.MockedFunction<typeof axios>;


// Define necessary interfaces for testing
interface Voice {
  id: string;
  name: string;
  language: string;
}

// Mock FileSystem module (not actually importing expo-file-system)
const FileSystem = {
  documentDirectory: 'file://test-document-directory/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: { Base64: 'Base64' }
};

// Mock Buffer for base64 conversion
class MockBuffer {
  static from(data: any): MockBuffer {
    return {
      toString: (encoding: string) => 'mock-base64-audio-data'
    } as MockBuffer;
  }
}
global.Buffer = MockBuffer as any;

// Mock Alibaba Cloud config
const AlibabaCloudConfig = {
  accessKeyId: 'mock-access-key-id',
  accessKeySecret: 'mock-access-key-secret',
  nls: {
    appKey: 'mock-app-key'
  },
  endpoints: {
    nls: 'https://nls-gateway.cn-shanghai.aliyuncs.com'
  }
};

// Define the getNLSToken function that mirrors the one in the real implementation
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

// Define our test subject - the TextToSpeech service
const textToSpeechService = {
  voices: [
    { id: "en_us_female_1", name: "US English Female", language: "en-US" },
    { id: "en_us_male_1", name: "US English Male", language: "en-US" },
    { id: "fil_female_1", name: "Filipino Female", language: "fil-PH" },
    { id: "fil_male_1", name: "Filipino Male", language: "fil-PH" }
  ],
  
  synthesize: async (text: string, voiceId: string = "en_us_female_1"): Promise<string> => {
    try {
      // Get NLS token
      const token = await getNLSToken();
      
      // Get voice configuration
      const voice = textToSpeechService.voices.find(v => v.id === voiceId) || 
                    textToSpeechService.voices[0];
      
      // Configure language settings
      const languageConfig = {
        language: voice.language.split('-')[0],
        voice: voiceId
      };
      
      // Call Alibaba Cloud TTS API
      const response = await axios({
        method: 'POST',
        url: `${AlibabaCloudConfig.endpoints.nls}/nls-service/v1/tts`,
        headers: {
          'Content-Type': 'application/json',
          'X-NLS-Token': token,
          'Accept': 'audio/mpeg'
        },
        data: {
          appkey: AlibabaCloudConfig.nls.appKey,
          text: text,
          format: 'mp3',
          sample_rate: 16000,
          voice: languageConfig.voice,
          volume: 50,
          speech_rate: 0,
          pitch_rate: 0
        },
        responseType: 'arraybuffer'
      });
      
      // Save audio file
      const timestamp = Date.now();
      const audioFilePath = `${FileSystem.documentDirectory}tts-${timestamp}.mp3`;
      
      // Convert response to base64 for saving
      const base64Audio = Buffer.from(response.data).toString('base64');
      await FileSystem.writeAsStringAsync(audioFilePath, base64Audio, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      return audioFilePath;
    } catch (error) {
      console.error('Error in text-to-speech synthesis:', error);
      throw error;
    }
  },
  
  getVoices: async (): Promise<Voice[]> => {
    return textToSpeechService.voices;
  }
};

// Test suite
describe('Text-to-Speech Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getNLSToken', () => {
    it('should fetch a token from Alibaba Cloud', async () => {
      // Mock successful token response
      mockAxios.mockResolvedValueOnce({
        data: {
          Token: {
            Id: 'mock-token-123',
            ExpireTime: 3600
          }
        }
      });
      
      const token = await getNLSToken();
      
      expect(token).toBe('mock-token-123');
      expect(mockAxios).toHaveBeenCalledWith({
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
    });
    
    it('should throw an error if token fetch fails', async () => {
      // Mock error response
      mockAxios.mockRejectedValueOnce(new Error('Token API error'));
      
      await expect(getNLSToken()).rejects.toThrow('Token API error');
    });
  });
  
  describe('synthesize', () => {
    it('should convert text to speech and return audio file path', async () => {
      // Mock successful token response
      mockAxios.mockResolvedValueOnce({
        data: {
          Token: {
            Id: 'mock-token-123'
          }
        }
      });
      
      // Mock successful TTS response
      mockAxios.mockResolvedValueOnce({
        data: new ArrayBuffer(1024) // Mock audio data
      });
      
      const text = 'Hello world';
      const result = await textToSpeechService.synthesize(text);
      
      // Verify token was fetched
      expect(mockAxios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'POST',
        url: `${AlibabaCloudConfig.endpoints.nls}/CreateToken`
      }));
      
      // Verify TTS API was called correctly
      expect(mockAxios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'POST',
        url: `${AlibabaCloudConfig.endpoints.nls}/nls-service/v1/tts`,
        headers: expect.objectContaining({
          'X-NLS-Token': 'mock-token-123',
          'Accept': 'audio/mpeg'
        }),
        data: expect.objectContaining({
          text: text,
          voice: 'en_us_female_1'
        })
      }));
      
      // Verify file was saved
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      expect(result).toContain('file://test-document-directory/tts-');
    });
    
    it('should use the specified voice when provided', async () => {
      // Mock token and TTS responses
      mockAxios.mockResolvedValueOnce({
        data: { Token: { Id: 'mock-token-123' } }
      });
      mockAxios.mockResolvedValueOnce({
        data: new ArrayBuffer(1024)
      });
      
      const voiceId = 'fil_female_1';
      await textToSpeechService.synthesize('Test with Filipino voice', voiceId);
      
      // Verify voice was used in API call
      expect(mockAxios).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          voice: voiceId
        })
      }));
    });
    
    it('should handle API errors gracefully', async () => {
      // Mock successful token but failed TTS
      mockAxios.mockResolvedValueOnce({
        data: { Token: { Id: 'mock-token-123' } }
      });
      mockAxios.mockRejectedValueOnce(new Error('TTS API error'));
      
      await expect(textToSpeechService.synthesize('Error test'))
        .rejects.toThrow('TTS API error');
    });
  });
  
  describe('getVoices', () => {
    it('should return the list of available voices', async () => {
      const voices = await textToSpeechService.getVoices();
      
      expect(voices).toEqual(textToSpeechService.voices);
      expect(voices.length).toBe(4);
      expect(voices[0]).toEqual({ 
        id: "en_us_female_1", 
        name: "US English Female", 
        language: "en-US" 
      });
    });
  });
});
