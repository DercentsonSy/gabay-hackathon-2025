// Mock implementation for expo-file-system
module.exports = {
  documentDirectory: 'file://test-directory/',
  cacheDirectory: 'file://test-cache/',
  writeAsStringAsync: jest.fn().mockResolvedValue(true),
  readAsStringAsync: jest.fn().mockResolvedValue('mock-base64-audio-data'),
  deleteAsync: jest.fn().mockResolvedValue(true),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, isDirectory: false, size: 1024 }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(true),
  downloadAsync: jest.fn().mockResolvedValue({
    uri: 'file://downloaded-audio.mp3',
    status: 200
  }),
  getContentUriAsync: jest.fn().mockResolvedValue('content://test-uri')
};
