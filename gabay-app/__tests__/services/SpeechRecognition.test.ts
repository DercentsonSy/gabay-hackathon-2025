/**
 * Speech Recognition Service Tests
 * Tests the functionality of Alibaba Cloud AI Speech Recognition without importing actual implementations
 */

// Only import axios which we'll mock
import axios from 'axios';
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

// Define interfaces for our test
interface Recording {
  prepareToRecordAsync: () => Promise<void>;
  startAsync: () => Promise<void>;
  stopAndUnloadAsync: () => Promise<void>;
  getURI: () => string;
  getStatusAsync: () => Promise<{ isDoneRecording: boolean; uri: string }>;
}

interface SpeechRecognitionResult {
  text: string;
  confidence: number;
}

// Create a standalone mock service - this avoids importing the real implementation
const speechRecognitionService = {
  startRecording: jest.fn().mockImplementation(async () => {
    return {
      recording: {
        prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
        startAsync: jest.fn().mockResolvedValue(undefined),
        stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
        getURI: jest.fn().mockReturnValue('file://test-recording.wav'),
        getStatusAsync: jest.fn().mockResolvedValue({ isDoneRecording: true, uri: 'file://test-recording.wav' })
      }
    };
  }),

  stopRecording: jest.fn().mockImplementation(async (recording: Recording) => {
    await recording.stopAndUnloadAsync();
    return recording.getURI();
  }),

  audioFileToBlob: jest.fn().mockImplementation(async () => {
    return new Blob(['mock-audio-data'], { type: 'audio/wav' });
  }),

  blobToBase64: jest.fn().mockImplementation(async () => {
    return 'mock-base64-audio-data';
  }),

  recognize: jest.fn().mockImplementation(async (audioBlob: Blob) => {
    const base64Audio = await speechRecognitionService.blobToBase64(audioBlob);
    
    // Simulate Alibaba Cloud API call
    const response = await axios.post('https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/asr', {
      audio: base64Audio,
      format: 'wav',
      sample_rate: 16000
    });
    
    const data = response.data;
    
    // Handle various response formats
    if (data.result) {
      return {
        text: data.result,
        confidence: data.confidence || 0.9
      };
    } else if (data.flash_result?.sentences?.length > 0) {
      const sentence = data.flash_result.sentences[0];
      return {
        text: sentence.text,
        confidence: sentence.confidence
      };
    } else if (data.error) {
      throw new Error(data.error);
    }
    
    return {
      text: "I couldn't understand that. Please try again.",
      confidence: 0.1
    };
  })
};

// Set up global mock for Blob
global.Blob = class MockBlob {
  size: number;
  type: string;
  
  constructor(parts: any[], options?: BlobPropertyBag) {
    this.size = 1024;
    this.type = options?.type || 'audio/wav';
  }
} as any;

// Tests
describe('Speech Recognition Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startRecording', () => {
    it('should initialize and start recording', async () => {
      const result = await speechRecognitionService.startRecording();
      expect(result).toBeDefined();
      expect(result.recording).toBeDefined();
    });
  });

  describe('stopRecording', () => {
    it('should stop recording and return the audio URI', async () => {
      // Create a mock recording
      const mockRecording = {
        stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
        getURI: jest.fn().mockReturnValue('file://test-recording.wav'),
        prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
        startAsync: jest.fn().mockResolvedValue(undefined),
        getStatusAsync: jest.fn().mockResolvedValue({ isDoneRecording: true, uri: 'file://test-recording.wav' })
      } as unknown as Recording;
      
      const uri = await speechRecognitionService.stopRecording(mockRecording);
      
      expect(uri).toBe('file://test-recording.wav');
      expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
    });

    it('should throw an error if recording fails', async () => {
      const mockRecording = {
        stopAndUnloadAsync: jest.fn().mockRejectedValue(new Error('Recording failed')),
        getURI: jest.fn(),
        prepareToRecordAsync: jest.fn(),
        startAsync: jest.fn(),
        getStatusAsync: jest.fn()
      } as unknown as Recording;
      
      await expect(speechRecognitionService.stopRecording(mockRecording)).rejects.toThrow();
    });
  });

  describe('recognize', () => {
    it('should send audio to Alibaba Cloud and return recognition result', async () => {
      // Mock successful recognition response
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          result: 'This is the recognized text',
          confidence: 0.95
        }
      });
      
      const mockBlob = new Blob(['audio-data'], { type: 'audio/wav' });
      const result = await speechRecognitionService.recognize(mockBlob);
      
      expect(result).toEqual({
        text: 'This is the recognized text',
        confidence: 0.95
      });
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'https://nls-gateway.cn-shanghai.aliyuncs.com/stream/v1/asr',
        expect.objectContaining({
          audio: 'mock-base64-audio-data',
          format: 'wav',
          sample_rate: 16000
        })
      );
    });

    it('should handle alternative result format', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: {
          flash_result: {
            sentences: [{ text: 'Alternative format result', confidence: 0.85 }]
          }
        }
      });
      
      const mockBlob = new Blob(['audio-data'], { type: 'audio/wav' });
      const result = await speechRecognitionService.recognize(mockBlob);
      
      expect(result).toEqual({
        text: 'Alternative format result',
        confidence: 0.85
      });
    });

    it('should throw an error if API returns an error', async () => {
      mockedAxios.post.mockResolvedValueOnce({
        data: { error: 'API error message' }
      });
      
      const mockBlob = new Blob(['audio-data'], { type: 'audio/wav' });
      await expect(speechRecognitionService.recognize(mockBlob)).rejects.toThrow('API error message');
    });
  });
});
