/**
 * Service Mock Implementations
 * This file provides mock implementations for all Alibaba Cloud AI services
 * to be used in Jest tests without importing the actual implementations that rely on Expo modules
 */

// Mock for SpeechRecognitionImplementation
const mockSpeechRecognitionService = {
  startRecording: jest.fn().mockResolvedValue({
    recording: {
      prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
      startAsync: jest.fn().mockResolvedValue(undefined),
      stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
      getURI: jest.fn().mockReturnValue('file://test-recording.wav'),
      getStatusAsync: jest.fn().mockResolvedValue({ isDoneRecording: true, uri: 'file://test-recording.wav' })
    }
  }),
  
  stopRecording: jest.fn().mockImplementation(async (recording) => {
    await recording.stopAndUnloadAsync();
    return recording.getURI();
  }),
  
  audioFileToBlob: jest.fn().mockImplementation(async () => new Blob([], { type: 'audio/wav' })),
  
  blobToBase64: jest.fn().mockResolvedValue('mock-base64-audio-data'),
  
  recognize: jest.fn().mockResolvedValue({
    text: 'This is a test recognition result',
    confidence: 0.95
  })
};

// Mock for TextToSpeechImplementation
const mockTextToSpeechService = {
  speak: jest.fn().mockResolvedValue({
    sound: {
      playAsync: jest.fn().mockResolvedValue({}),
      unloadAsync: jest.fn().mockResolvedValue({})
    }
  }),
  
  synthesize: jest.fn().mockResolvedValue('file://synthesized-audio.mp3'),
  
  stopSpeaking: jest.fn().mockResolvedValue(true)
};

// Mock for NLPServiceImplementation
const mockNLPService = {
  analyze: jest.fn().mockResolvedValue({
    intent: 'test_intent',
    confidence: 0.92,
    entities: [
      { name: 'test_entity', value: 'test_value', confidence: 0.85 }
    ]
  })
};

// Mock for OCRServiceImplementation
const mockOCRService = {
  extractText: jest.fn().mockResolvedValue('This is extracted text from an image.')
};

// Mock for VoiceAuthenticationImplementation
const mockVoiceAuthenticationService = {
  startRecording: jest.fn().mockResolvedValue({
    recording: {
      prepareToRecordAsync: jest.fn().mockResolvedValue(undefined),
      startAsync: jest.fn().mockResolvedValue(undefined),
      stopAndUnloadAsync: jest.fn().mockResolvedValue(undefined),
      getURI: jest.fn().mockReturnValue('file://test-recording.wav'),
      getStatusAsync: jest.fn().mockResolvedValue({ isDoneRecording: true, uri: 'file://test-recording.wav' })
    }
  }),
  
  stopRecording: jest.fn().mockImplementation(async (recording) => {
    await recording.stopAndUnloadAsync();
    return recording.getURI();
  }),
  
  audioFileToBlob: jest.fn().mockImplementation(async () => new Blob([], { type: 'audio/wav' })),
  
  blobToBase64: jest.fn().mockResolvedValue('mock-base64-audio-data'),
  
  createVoiceProfile: jest.fn().mockResolvedValue('voice-profile-123'),
  
  enrollVoiceProfile: jest.fn().mockResolvedValue({
    status: 'enrolled',
    enrollmentCount: 1,
    remainingEnrollments: 0
  }),
  
  verifyVoice: jest.fn().mockResolvedValue({
    isMatch: true,
    confidence: 0.93,
    threshold: 0.7
  }),
  
  deleteVoiceProfile: jest.fn().mockResolvedValue(true),
  
  getAllVoiceProfiles: jest.fn().mockResolvedValue(['profile-1', 'profile-2'])
};

// Export all mock services
module.exports = {
  default: mockSpeechRecognitionService, // Default export for import statements
  realSpeechRecognitionService: mockSpeechRecognitionService,
  realTextToSpeechService: mockTextToSpeechService,
  realNLPService: mockNLPService,
  realOCRService: mockOCRService,
  realVoiceAuthenticationService: mockVoiceAuthenticationService
};
