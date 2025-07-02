// Mock implementation for expo-av
module.exports = {
  Audio: {
    Recording: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn().mockResolvedValue({}),
      startAsync: jest.fn().mockResolvedValue({}),
      stopAndUnloadAsync: jest.fn().mockResolvedValue({}),
      getURI: jest.fn().mockReturnValue('test-recording.wav'),
      getStatusAsync: jest.fn().mockResolvedValue({ isDoneRecording: true, uri: 'test-recording.wav' }),
      setProgressUpdateInterval: jest.fn(),
      setOnRecordingStatusUpdate: jest.fn()
    })),
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn().mockResolvedValue({}),
      playAsync: jest.fn().mockResolvedValue({}),
      unloadAsync: jest.fn().mockResolvedValue({}),
      getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, durationMillis: 1000 }),
      setOnPlaybackStatusUpdate: jest.fn()
    })),
    RECORDING_OPTIONS_PRESET_HIGH_QUALITY: {
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
        outputFormat: 'lpcm',
        audioQuality: 'max',
        sampleRate: 16000,
        numberOfChannels: 1,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    },
    setAudioModeAsync: jest.fn().mockResolvedValue({}),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true })
  }
};
