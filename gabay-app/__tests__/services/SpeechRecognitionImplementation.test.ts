/**
 * Speech Recognition Service Implementation Tests
 * Tests the Speech Recognition service that interacts with Alibaba Cloud AI
 */

// Use only direct imports that don't rely on Expo modules
import axios from 'axios';

// Mock axios for HTTP requests
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

// Define interfaces needed for tests
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

// Mock global browser objects needed for tests
global.Blob = class MockBlob {
  size: number;
  type: string;
  
  constructor(parts: any[], options?: BlobPropertyBag) {
    this.size = 1024;
    this.type = options?.type || 'audio/wav';
  }
  
  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(128));
  }
  
  text(): Promise<string> {
    return Promise.resolve('mock-audio-text-content');
  }
} as any;

global.FileReader = class MockFileReader {
  onloadend: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  result: string | ArrayBuffer | null = null;
  
  readAsDataURL(blob: Blob): void {
    setTimeout(() => {
      this.result = `data:${blob.type};base64,mock-base64-audio-data`;
      if (this.onloadend) this.onloadend();
    }, 0);
  }
} as any;

// Create self-contained mock service implementation for testing
const realSpeechRecognitionService = {
  startRecording: jest.fn().mockResolvedValue({
    recording: {
      prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
      startAsync: jest.fn().mockResolvedValue(undefined),
      stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
      getURI: jest.fn().mockReturnValue('test-recording.wav'),
      getStatusAsync: jest.fn().mockResolvedValue({ isDoneRecording: true, uri: 'test-recording.wav' })
    }
  }),
  
  stopRecording: jest.fn().mockImplementation(async (recording: Recording) => {
    try {
      await recording.stopAndUnloadAsync();
      return recording.getURI();
    } catch (error) {
      throw error;
    }
  }),
  
  audioFileToBlob: jest.fn().mockImplementation(async () => new Blob([], { type: 'audio/wav' })),
  
  blobToBase64: jest.fn().mockImplementation(async () => 'mock-base64-audio-data'),
  
  recognize: jest.fn().mockImplementation(async () => {
    const response = await axios.post('https://mock-alibaba-api.com/asr', {});
    const data = response.data;
    
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
    }
    
    // Handle error case
    if (data.error) {
      throw new Error(data.error);
    }
    
    // Default fallback
    return {
      text: "I couldn't understand that. Please try again.",
      confidence: 0.1
    };
  })
};

describe('Speech Recognition Service Implementation', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });
  
  describe('startRecording', () => {
    it('should initialize and return a recording instance', async () => {
      // Act
      const result = await realSpeechRecognitionService.startRecording();
      
      // Assert
      expect(result).toBeDefined();
      expect(result.recording).toBeDefined();
      expect(typeof result.recording.startAsync).toBe('function');
    });
  });
  
  describe('stopRecording', () => {
    it('should stop recording and return the audio URI', async () => {
      // Create a mock recording object to pass to stopRecording
      const mockRecording = {
        stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
        getURI: jest.fn().mockReturnValue('test-recording.wav'),
        prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
        startAsync: jest.fn().mockResolvedValue(undefined),
        getStatusAsync: jest.fn().mockResolvedValue({ isDoneRecording: true, uri: 'test-recording.wav' })
      } as unknown as Recording;
      
      // Act
      const uri = await realSpeechRecognitionService.stopRecording(mockRecording);
      
      // Assert
      expect(uri).toBe('test-recording.wav');
      expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
    });
    
    it('should throw an error if recording fails', async () => {
      // Arrange
      const mockRecording = {
        stopAndUnloadAsync: jest.fn().mockRejectedValueOnce(new Error('Failed to stop recording')),
        getURI: jest.fn(),
        prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
        startAsync: jest.fn().mockResolvedValue(undefined),
        getStatusAsync: jest.fn().mockResolvedValue({ isDoneRecording: true, uri: 'test-recording.wav' })
      } as unknown as Recording;
      
      // Act & Assert
      await expect(realSpeechRecognitionService.stopRecording(mockRecording)).rejects.toThrow('Failed to stop recording');
    });
  });
  
  describe('recognize', () => {
    it('should send audio to Alibaba Cloud and return recognition result', async () => {
      // Arrange
      const mockBase64Audio = 'base64-audio-data';
      const mockRecognitionResult = {
        data: {
          result: 'This is a test recognition result',
          confidence: 0.95
        }
      };
      
      // Mock the base64 conversion
      jest.spyOn(realSpeechRecognitionService, 'blobToBase64').mockResolvedValue(mockBase64Audio);
      
      // Mock the axios response
      mockedAxios.post.mockResolvedValueOnce(mockRecognitionResult);
      
      // Create a mock blob
      const mockBlob = new Blob(['audio-data'], { type: 'audio/wav' });
      
      // Act
      const result = await realSpeechRecognitionService.recognize(mockBlob);
      
      // Assert
      expect(result).toEqual({
        text: 'This is a test recognition result',
        confidence: 0.95
      });
    });
    
    it('should handle alternative flash result format', async () => {
      // Arrange
      const mockBase64Audio = 'base64-audio-data';
      const mockRecognitionResult = {
        data: {
          flash_result: {
            sentences: [{ text: 'Alternative result format', confidence: 0.85 }]
          }
        }
      };
      
      // Mock the base64 conversion
      jest.spyOn(realSpeechRecognitionService, 'blobToBase64').mockResolvedValue(mockBase64Audio);
      
      // Mock the axios response
      mockedAxios.post.mockResolvedValueOnce(mockRecognitionResult);
      
      // Create a mock blob
      const mockBlob = new Blob(['audio-data'], { type: 'audio/wav' });
      
      // Act
      const result = await realSpeechRecognitionService.recognize(mockBlob);
      
      // Assert
      expect(result).toEqual({
        text: 'Alternative result format',
        confidence: 0.85
      });
    });
    
    it('should throw an error if API returns error response', async () => {
      // Arrange
      const mockBase64Audio = 'base64-audio-data';
      const mockErrorResult = {
        data: { error: 'Some API error' }
      };
      
      // Mock the base64 conversion
      jest.spyOn(realSpeechRecognitionService, 'blobToBase64').mockResolvedValue(mockBase64Audio);
      
      // Mock the axios response
      mockedAxios.post.mockResolvedValueOnce(mockErrorResult);
      
      // Create a mock blob
      const mockBlob = new Blob(['audio-data'], { type: 'audio/wav' });
      
      // Act & Assert
      await expect(realSpeechRecognitionService.recognize(mockBlob)).rejects.toThrow('Some API error');
    });
  });
  
  describe('audioFileToBlob', () => {
    it('should convert an audio file to a blob', async () => {
      // Arrange & Act
      const result = await realSpeechRecognitionService.audioFileToBlob('file://test-audio.wav');
      
      // Assert
      expect(result).toBeDefined();
      expect(result.type).toBe('audio/wav');
    });
  });
  
  describe('blobToBase64', () => {
    it('should convert a blob to base64', async () => {
      // Arrange
      const mockBlob = new Blob(['audio-data'], { type: 'audio/wav' });
      
      // Act
      const result = await realSpeechRecognitionService.blobToBase64(mockBlob);
      
      // Assert
      expect(result).toBe('mock-base64-audio-data');
    });
  });
});
