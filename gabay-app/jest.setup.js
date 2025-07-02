// Mock Expo's modules that might be used in tests
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://test-directory/',
  cacheDirectory: 'file://test-cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(true),
  readAsStringAsync: jest.fn().mockResolvedValue('base64-audio-data'),
  deleteAsync: jest.fn().mockResolvedValue(true),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, isDirectory: false, size: 1024 }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(true),
  downloadAsync: jest.fn().mockResolvedValue({
    uri: 'file://downloaded-audio.mp3',
    status: 200
  }),
  getContentUriAsync: jest.fn().mockResolvedValue('content://test-uri')
}));

jest.mock('expo-av', () => ({
  Audio: {
    Sound: jest.fn().mockImplementation(() => ({
      loadAsync: jest.fn().mockResolvedValue({}),
      playAsync: jest.fn().mockResolvedValue({}),
      unloadAsync: jest.fn().mockResolvedValue({}),
      getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, durationMillis: 1000 }),
      setOnPlaybackStatusUpdate: jest.fn()
    })),
    createAsync: jest.fn().mockResolvedValue({
      sound: {
        playAsync: jest.fn().mockResolvedValue({}),
        unloadAsync: jest.fn().mockResolvedValue({}),
        getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, durationMillis: 1000 }),
        setOnPlaybackStatusUpdate: jest.fn()
      },
      status: { isLoaded: true },
    }),
    Recording: jest.fn().mockImplementation(() => ({
      prepareToRecordAsync: jest.fn().mockResolvedValue({}),
      startAsync: jest.fn().mockResolvedValue({}),
      stopAndUnloadAsync: jest.fn().mockResolvedValue({}),
      getURI: jest.fn().mockReturnValue('test-recording.wav'),
      getStatusAsync: jest.fn().mockResolvedValue({ isDoneRecording: true, uri: 'test-recording.wav' }),
      setProgressUpdateInterval: jest.fn(),
      setOnRecordingStatusUpdate: jest.fn(),
      createNewLoadedSoundAsync: jest.fn().mockResolvedValue({
        sound: {
          getStatusAsync: jest.fn().mockResolvedValue({ durationMillis: 1000 }),
          playAsync: jest.fn().mockResolvedValue({}),
          unloadAsync: jest.fn().mockResolvedValue({}),
        },
      }),
    })),
    requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
    setAudioModeAsync: jest.fn().mockResolvedValue({}),
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
        outputFormat: 1,
        audioQuality: 127,
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
    },
    RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_DEFAULT: 0,
    RECORDING_OPTION_ANDROID_AUDIO_ENCODER_DEFAULT: 0,
    RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM: 0,
    RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX: 0,
  },
}));

// Mock axios
jest.mock('axios', () => {
  const mockAxios = jest.fn(() => Promise.resolve({ data: {} }));
  mockAxios.mockResolvedValue = jest.fn(() => mockAxios);
  mockAxios.mockRejectedValue = jest.fn(() => mockAxios);
  mockAxios.mockImplementation = jest.fn(() => mockAxios);
  mockAxios.get = jest.fn().mockResolvedValue({ data: {} });
  mockAxios.post = jest.fn().mockResolvedValue({ data: {} });
  mockAxios.put = jest.fn().mockResolvedValue({ data: {} });
  mockAxios.delete = jest.fn().mockResolvedValue({ data: {} });
  mockAxios.create = jest.fn(() => mockAxios);
  return {
    __esModule: true,
    default: mockAxios,
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
}))
