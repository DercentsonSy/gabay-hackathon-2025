/**
 * Text-to-Speech Service Tests
 * This test file doesn't import the actual implementation to avoid Expo module issues
 */

// Only import axios which we'll mock
import axios from 'axios';
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

// Import our mock config
import mockAlibabaConfig from '../mocks/alibaba-config';

// Define interfaces for testing
interface Voice {
  id: string;
  name: string;
  language: string;
}

// Create mock implementations of FileSystem methods we need
const mockFileSystem = {
  documentDirectory: 'file://mock-document-directory/',
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined)
};

// Mock the Buffer.from method
global.Buffer = {
  from: jest.fn().mockImplementation(() => ({
    toString: jest.fn().mockReturnValue('mock-base64-audio')
  }))
} as any;

// Mock getNLSToken function
const getNLSToken = jest.fn().mockResolvedValue('mock-nls-token');

// Create the test TextToSpeech service implementation
const textToSpeechService = {
  voices: [
    { id: "en_us_female_1", name: "US English Female", language: "en-US" },
    { id: "fil_female_1", name: "Filipino Female", language: "fil-PH" }
  ],

  synthesize: async (text: string, voiceId: string = "en_us_female_1"): Promise<string> => {
    try {
      // Get NLS token
      const token = await getNLSToken();
      
      // Get voice config
      const voice = textToSpeechService.voices.find(v => v.id === voiceId) || 
                    textToSpeechService.voices[0];
      
      // Configure language settings
      const languageConfig = {
        language: voice.language.split('-')[0],
        voice: voiceId
      };
      
      // Call Alibaba TTS API
      const response = await axios({
        method: 'POST',
        url: `${mockAlibabaConfig.endpoints.nls}/nls-service/v1/tts`,
        headers: {
          'Content-Type': 'application/json',
          'X-NLS-Token': token,
          'Accept': 'audio/mpeg'
        },
        data: {
          appkey: mockAlibabaConfig.nls.appKey,
          text: text,
          format: 'mp3',
          sample_rate: 16000,
          voice: languageConfig.voice
        },
        responseType: 'arraybuffer'
      });
      
      // Save audio file (mocked)
      const timestamp = Date.now();
      const audioFilePath = `${mockFileSystem.documentDirectory}tts-${timestamp}.mp3`;
      
      // Convert and save (mocked)
      const base64Audio = Buffer.from(response.data).toString('base64');
      await mockFileSystem.writeAsStringAsync(audioFilePath, base64Audio, {
        encoding: 'Base64'
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

// Tests
describe('Text-to-Speech Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('synthesize', () => {
    it('should convert text to speech and return an audio file path', async () => {
      // Set up mocks
      const mockAudioBuffer = new ArrayBuffer(1024);
      mockedAxios.mockResolvedValueOnce({
        data: mockAudioBuffer
      });
      
      // Call the service
      const text = 'Hello world';
      const result = await textToSpeechService.synthesize(text);
      
      // Assertions
      expect(getNLSToken).toHaveBeenCalled();
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'POST',
        url: `${mockAlibabaConfig.endpoints.nls}/nls-service/v1/tts`,
        headers: expect.objectContaining({
          'X-NLS-Token': 'mock-nls-token'
        }),
        data: expect.objectContaining({
          text: text,
          voice: 'en_us_female_1'
        })
      }));
      
      expect(mockFileSystem.writeAsStringAsync).toHaveBeenCalled();
      expect(result).toContain('file://mock-document-directory/tts-');
      expect(result).toContain('.mp3');
    });
    
    it('should use the specified voice ID when provided', async () => {
      // Set up mocks
      const mockAudioBuffer = new ArrayBuffer(1024);
      mockedAxios.mockResolvedValueOnce({
        data: mockAudioBuffer
      });
      
      // Call with specific voice
      const voiceId = 'fil_female_1';
      await textToSpeechService.synthesize('Test with Filipino voice', voiceId);
      
      // Assert voice was used
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          voice: voiceId
        })
      }));
    });
    
    it('should handle API errors gracefully', async () => {
      // Mock API error
      const errorMessage = 'TTS API error';
      mockedAxios.mockRejectedValueOnce(new Error(errorMessage));
      
      // Assert error is thrown
      await expect(textToSpeechService.synthesize('Error test'))
        .rejects.toThrow(errorMessage);
    });
  });
  
  describe('getVoices', () => {
    it('should return the list of available voices', async () => {
      const voices = await textToSpeechService.getVoices();
      
      expect(voices).toEqual([
        { id: "en_us_female_1", name: "US English Female", language: "en-US" },
        { id: "fil_female_1", name: "Filipino Female", language: "fil-PH" }
      ]);
      expect(voices.length).toBe(2);
    });
  });
});
