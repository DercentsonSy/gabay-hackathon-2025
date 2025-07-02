import axios from 'axios';
import FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import realTextToSpeechService from '../../services/TextToSpeechImplementation';
import AlibabaCloudConfig from '../../config/alibabacloud';

// Mock the modules
jest.mock('axios');
jest.mock('expo-file-system');
jest.mock('expo-av');

// Create proper mocks
const mockedAxios = jest.mocked(axios);

describe('realTextToSpeechService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('token handling in synthesize', () => {
    it('should use token for API calls', async () => {
      // Arrange
      const mockTokenResponse = {
        data: { Token: { Id: 'test-token', ExpireTime: 3600 } }
      };
      
      // Mock axios calls
      mockedAxios.mockImplementation(() => Promise.resolve(mockTokenResponse));
      mockedAxios.mockImplementation(() => Promise.resolve({
        data: Buffer.from('fake-audio-data'),
        headers: { 'content-type': 'audio/mpeg' }
      }));
      
      // Act - indirect test through synthesize
      await realTextToSpeechService.synthesize('Test text');
      
      // Assert
      expect(axios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'POST',
        url: expect.stringContaining('/CreateToken')
      }));
    });
  });

  describe('synthesize', () => {
    it('should convert text to speech and play the audio', async () => {
      // Arrange
      const text = 'Hello, this is a test';
      const language = 'en';
      
      // Mock token response
      const mockTokenResponse = {
        data: { Token: { Id: 'test-token', ExpireTime: 3600 } }
      };
      
      // Mock TTS response with audio data
      const mockAudioBuffer = Buffer.from('fake-audio-data');
      const mockTTSResponse = {
        data: mockAudioBuffer,
        headers: { 'content-type': 'audio/mpeg' }
      };
      
      // Setup mocks
      mockedAxios.mockResolvedValue(mockTokenResponse);  // First for token
      mockedAxios.mockResolvedValue(mockTTSResponse);    // Then for TTS call
      
      // Mock the Sound creation
      const mockSound = {
        playAsync: jest.fn().mockResolvedValue({}),
        unloadAsync: jest.fn().mockResolvedValue({})
      };
      (Audio.Sound.createAsync as jest.Mock).mockResolvedValue({
        sound: mockSound,
        status: { isLoaded: true }
      });
      
      // Act
      await realTextToSpeechService.synthesize(text, language);
      
      // Assert
      // Check if the TTS API was called with correct parameters
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'POST',
        url: `${AlibabaCloudConfig.endpoints.nls}/nls-service/v1/tts`,
        headers: expect.objectContaining({
          'X-NLS-Token': 'test-token'
        }),
        data: expect.objectContaining({
          text: text,
          format: 'mp3',
        }),
        responseType: 'arraybuffer'
      }));
      
      // Check if the file was saved
      expect(FileSystem.writeAsStringAsync).toHaveBeenCalled();
      
      // Check if the audio was played
      expect(Audio.Sound.createAsync).toHaveBeenCalled();
      expect(mockSound.playAsync).toHaveBeenCalled();
    });
    
    it('should handle language-specific voice configurations', async () => {
      // Arrange
      const text = 'Kamusta, ito ay isang pagsubok';
      const language = 'fil'; // Filipino
      
      // Mock token and TTS response
      mockedAxios.mockResolvedValue({ data: { Token: { Id: 'test-token' } } });
      mockedAxios.mockResolvedValue({ 
        data: Buffer.from('audio-data'),
        headers: { 'content-type': 'audio/mpeg' }
      });
      
      // Act
      await realTextToSpeechService.synthesize(text, language);
      
      // Assert
      // Check if the TTS API was called with Filipino voice configuration
      expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          text: text,
          voice: expect.any(String), // Should use Filipino voice if available
        })
      }));
    });
    
    it('should handle errors when TTS API fails', async () => {
      // Arrange
      const text = 'Test error handling';
      
      // Mock token success but TTS failure
      mockedAxios.mockResolvedValue({ data: { Token: { Id: 'test-token' } } });
      mockedAxios.mockRejectedValue(new Error('API Error'));
      
      // Act & Assert
      await expect(realTextToSpeechService.synthesize(text, 'en')).rejects.toThrow();
    });
  });
});
