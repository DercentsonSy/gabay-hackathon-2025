/**
 * Mock Alibaba Cloud configuration for tests
 */
export const mockAlibabaConfig = {
  accessKeyId: 'mock-access-key-id',
  accessKeySecret: 'mock-access-key-secret',
  nls: {
    appKey: 'mock-app-key',
  },
  endpoints: {
    nls: 'https://nls-gateway.mock-region.aliyuncs.com',
    nlp: 'https://nlp-automl.mock-region.aliyuncs.com',
    ocr: 'https://ocr.mock-region.aliyuncs.com',
  }
};

export default mockAlibabaConfig;
