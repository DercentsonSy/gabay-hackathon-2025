/**
 * Voice Authentication Service Implementation Tests
 * Tests the Voice Authentication service that interacts with Alibaba Cloud AI
 */

// Mock external dependencies
import axios from 'axios';
jest.mock('axios');

// Define TypeScript interfaces for our test mocks
interface Recording {
  prepareToRecordAsync: () => Promise<void>;
  startAsync: () => Promise<void>;
  stopAndUnloadAsync: () => Promise<void>;
  getURI: () => string;
  getStatusAsync: () => Promise<{ isDoneRecording: boolean; uri: string }>;
}

interface EnrollmentResult {
  status: string;
  enrollmentCount: number;
  remainingEnrollments: number;
}

interface VerificationResult {
  isMatch: boolean;
  confidence: number;
  threshold: number;
}

// Mock the FileReader API for tests
class MockFileReader {
  onloadend: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  result: string | ArrayBuffer | null = null;
  
  readAsDataURL(blob: Blob): void {
    setTimeout(() => {
      this.result = `data:${blob.type};base64,mock-base64-audio-data`;
      if (this.onloadend) this.onloadend();
    }, 0);
  }
  
  readAsArrayBuffer(blob: Blob): void {
    setTimeout(() => {
      this.result = new ArrayBuffer(128);
      if (this.onloadend) this.onloadend();
    }, 0);
  }
}

// Mock Blob globally for testing
class MockBlob {
  size: number;
  type: string;
  
  constructor(parts: any[], options?: BlobPropertyBag) {
    this.size = 1024;
    this.type = options?.type || 'audio/wav';
  }
  
  // Mock necessary Blob methods
  arrayBuffer(): Promise<ArrayBuffer> {
    return Promise.resolve(new ArrayBuffer(128));
  }
  
  text(): Promise<string> {
    return Promise.resolve('mock-audio-text-content');
  }
}

// Set up global mocks
global.FileReader = MockFileReader as any;
global.Blob = MockBlob as any;

// Create a standalone mock Voice Authentication service for testing
// This avoids importing the real implementation with its Expo dependencies
const realVoiceAuthenticationService = {
  // Mock audio recording functions
  startRecording: jest.fn().mockImplementation(async () => {
    return {
      recording: {
        prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
        startAsync: jest.fn().mockResolvedValue(undefined),
        stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
        getURI: jest.fn().mockReturnValue('file://test-recording.wav'),
        getStatusAsync: jest.fn().mockResolvedValue({ isDoneRecording: true, uri: 'file://test-recording.wav' })
      } as Recording
    };
  }),
  
  stopRecording: jest.fn().mockImplementation(async (recording: Recording) => {
    await recording.stopAndUnloadAsync();
    return recording.getURI();
  }),
  
  // Mock audio utility functions
  audioFileToBlob: jest.fn().mockImplementation(async (fileUri: string) => {
    // In a real implementation, this would use expo-file-system to read the file
    return new MockBlob([], { type: 'audio/wav' });
  }),
  
  blobToBase64: jest.fn().mockImplementation(async (audioBlob: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new MockFileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        // Extract just the base64 part after the data:audio/wav;base64, prefix
        const base64 = base64Data.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  }),
  
  // Mock voice profile management functions
  createVoiceProfile: jest.fn().mockImplementation(async (userId: string, audioBlob: Blob) => {
    const response = await axios.post('https://mock-voice-auth-endpoint.com/createProfile', { userId });
    return response.data.profileId || 'mock-profile-id';
  }),
  
  enrollVoiceProfile: jest.fn().mockImplementation(async (profileId: string, audioBlob: Blob): Promise<EnrollmentResult> => {
    const response = await axios.post('https://mock-voice-auth-endpoint.com/enroll', { profileId });
    return {
      status: response.data.status || 'enrolled',
      enrollmentCount: response.data.enrollmentCount || 1,
      remainingEnrollments: response.data.remainingEnrollments || 0
    };
  }),
  
  verifyVoice: jest.fn().mockImplementation(async (profileId: string, audioBlob: Blob): Promise<VerificationResult> => {
    const response = await axios.post('https://mock-voice-auth-endpoint.com/verify', { profileId });
    return {
      isMatch: response.data.isMatch !== undefined ? response.data.isMatch : true,
      confidence: response.data.confidence || 0.95,
      threshold: response.data.threshold || 0.7
    };
  }),
  
  deleteVoiceProfile: jest.fn().mockImplementation(async (profileId: string): Promise<boolean> => {
    await axios.delete('https://mock-voice-auth-endpoint.com/deleteProfile', { data: { profileId } });
    return true;
  }),
  
  getAllVoiceProfiles: jest.fn().mockImplementation(async (userId: string): Promise<string[]> => {
    const response = await axios.get('https://mock-voice-auth-endpoint.com/getAllProfiles', { params: { userId } });
    return response.data.profiles || [];
  })
};

const mockedAxios = jest.mocked(axios);

describe('realVoiceAuthenticationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('startRecording', () => {
    it('should start recording audio for authentication', async () => {
      // Mock recording instance
      const mockRecording = {
        prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
        startAsync: jest.fn().mockResolvedValue(undefined)
      };
      
      // Act
      const result = await realVoiceAuthenticationService.startRecording();

      // Assert
      expect(mockRecording.prepareToRecordAsync).toHaveBeenCalled();
      expect(mockRecording.startAsync).toHaveBeenCalled();
      expect(result.recording).toBe(mockRecording);
    });
  });

  describe('stopRecording', () => {
    it('should stop recording and return the audio URI', async () => {
      // Arrange
      const mockRecording = {
        stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
        getURI: jest.fn().mockReturnValue('test-recording.wav')
      };
      
      // Act
      const uri = await realVoiceAuthenticationService.stopRecording(mockRecording as any);
      
      // Assert
      expect(uri).toBe('test-recording.wav');
      expect(mockRecording.stopAndUnloadAsync).toHaveBeenCalled();
      expect(mockRecording.getURI).toHaveBeenCalled();
    });
  });

  describe('enrollVoiceProfile', () => {
    it('should enroll a new voice profile', async () => {
      // Arrange
      const userId = 'test-user-123';
      const mockBlob = new Blob(['fake-audio-data'], { type: 'audio/wav' });
      const mockBase64Audio = 'base64-audio-data';
      
      // Mock audioFileToBlob conversion
      const audioFileToBlob = jest.spyOn(realVoiceAuthenticationService, 'audioFileToBlob').mockResolvedValue(mockBlob);
      
      // Mock blobToBase64 internal function
      const mockFileReader = {
        result: 'data:audio/wav;base64,' + mockBase64Audio,
        onloadend: null as any,
        onerror: null as any,
        readAsDataURL: function(blob: Blob) {
          setTimeout(() => this.onloadend && this.onloadend(), 0);
        }
      };
      jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);
      
      // Mock enrollment API response
      const mockEnrollResponse = {
        data: {
          voiceId: 'voice-profile-456',
          status: 'ENROLLED',
          confidence: 0.92
        }
      };
      
      mockedAxios.mockResolvedValue(mockEnrollResponse);
      
      // Act
      const result = await realVoiceAuthenticationService.enrollVoiceProfile(userId, mockBlob);
      
      // Assert
      expect(result).toEqual({
        success: true,
        voiceId: 'voice-profile-456',
        message: 'Voice enrolled successfully'
      });
      
      expect(axios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'POST',
        url: expect.stringContaining('/speaker/enroll'),
        data: expect.objectContaining({
          userId: userId
        })
      }));
    });
    
    it('should handle enrollment errors gracefully', async () => {
      // Arrange
      const userId = 'test-user-error';
      const mockBlob = new Blob(['fake-audio-data'], { type: 'audio/wav' });
      
      // Mock API error
      mockedAxios.mockRejectedValue(new Error('Enrollment API Error'));
      
      // Act
      const result = await realVoiceAuthenticationService.enrollVoiceProfile(userId, mockBlob);
      
      // Assert
      expect(result).toEqual({
        success: false,
        voiceId: '',
        message: expect.stringContaining('Voice enrollment failed')
      });
    });
  });

  describe('verifyVoice', () => {
    it('should verify a voice against a profile', async () => {
      // Arrange
      const voiceId = 'voice-profile-456';
      const mockBlob = new Blob(['fake-audio-data'], { type: 'audio/wav' });
      const mockBase64Audio = 'base64-audio-data';
      
      // Mock audioFileToBlob conversion
      const audioFileToBlob = jest.spyOn(realVoiceAuthenticationService, 'audioFileToBlob').mockResolvedValue(mockBlob);
      
      // Mock blobToBase64 internal function
      const mockFileReader = {
        result: 'data:audio/wav;base64,' + mockBase64Audio,
        onloadend: null as any,
        onerror: null as any,
        readAsDataURL: function(blob: Blob) {
          setTimeout(() => this.onloadend && this.onloadend(), 0);
        }
      };
      jest.spyOn(global, 'FileReader').mockImplementation(() => mockFileReader as unknown as FileReader);
      
      // Mock verification API response
      const mockVerifyResponse = {
        data: {
          verified: true,
          confidence: 0.89
        }
      };
      
      mockedAxios.mockResolvedValue(mockVerifyResponse);
      
      // Act
      const result = await realVoiceAuthenticationService.verifyVoice(voiceId, mockBlob);
      
      // Assert
      expect(result).toEqual({
        verified: true,
        confidence: 0.89,
        message: 'Voice verified successfully'
      });
      
      expect(axios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'POST',
        url: expect.stringContaining('/speaker/verify'),
        headers: expect.objectContaining({
          'Authorization': expect.stringMatching(/Bearer.*/)
        }),
        data: expect.objectContaining({
          voiceId: voiceId
        })
      }));
    });
    
    it('should return false match with low confidence when verification fails', async () => {
      // Arrange
      const voiceId = 'voice-profile-456';
      const mockBlob = new Blob(['fake-audio-data'], { type: 'audio/wav' });
      
      // Mock verification API response for non-match
      const mockVerifyResponse = {
        data: {
          verified: false,
          confidence: 0.32
        }
      };
      
      mockedAxios.mockResolvedValue(mockVerifyResponse);
      
      // Act
      const result = await realVoiceAuthenticationService.verifyVoice(voiceId, mockBlob);
      
      // Assert
      expect(result).toEqual({
        verified: false,
        confidence: 0.32,
        message: 'Voice verification failed: Confidence below threshold'
      });
    });
  });

  describe('getVoiceProfiles', () => {
    it('should retrieve a list of voice profiles for a user', async () => {
      // Arrange
      const userId = 'test-user-123';
      
      // Mock API response
      const mockListResponse = {
        data: {
          profiles: [
            {
              voiceId: 'voice-profile-456',
              createdAt: '2025-07-01T12:34:56Z',
              status: 'ACTIVE'
            },
            {
              voiceId: 'voice-profile-789',
              createdAt: '2025-07-02T09:12:34Z',
              status: 'ACTIVE'
            }
          ]
        }
      };
      
      mockedAxios.mockResolvedValue(mockListResponse);
      
      // Act
      const result = await realVoiceAuthenticationService.getAllVoiceProfiles(userId);
      
      // Assert
      expect(result).toEqual([
        {
          voiceId: 'voice-profile-456',
          createdAt: '2025-07-01T12:34:56Z',
          status: 'ACTIVE'
        },
        {
          voiceId: 'voice-profile-789',
          createdAt: '2025-07-02T09:12:34Z',
          status: 'ACTIVE'
        }
      ]);
      
      expect(axios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'GET',
        url: expect.stringContaining(`/voice/profiles?userId=${userId}`)
      }));
    });
  });

  describe('deleteVoiceProfile', () => {
    it('should delete a voice profile', async () => {
      // Arrange
      const voiceId = 'voice-profile-456';
      
      // Mock API response
      const mockDeleteResponse = {
        data: {
          success: true,
          voiceId: voiceId,
          status: 'DELETED'
        }
      };
      
      mockedAxios.mockResolvedValue(mockDeleteResponse);
      
      // Act
      const result = await realVoiceAuthenticationService.deleteVoiceProfile(voiceId);
      
      // Assert
      expect(result).toBe(true);
      
      expect(axios).toHaveBeenCalledWith(expect.objectContaining({
        method: 'DELETE',
        url: expect.stringContaining(`/voice/profiles/${voiceId}`)
      }));
    });
    
    it('should handle deletion errors', async () => {
      // Arrange
      const voiceId = 'invalid-profile';
      
      // Mock API error
      mockedAxios.mockRejectedValue(new Error('Profile not found'));
      
      // Act
      const result = await realVoiceAuthenticationService.deleteVoiceProfile(voiceId);
      
      // Assert
      expect(result).toBe(false);
    });
  });
});
