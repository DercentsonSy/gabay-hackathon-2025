/**
 * Alibaba Cloud Configuration
 * 
 * This file contains configuration for connecting to Alibaba Cloud services.
 * IMPORTANT: Never commit this file with real credentials to version control.
 * In production, use environment variables or a secure vault service.
 */

// The keys below should be replaced with your actual keys from the Alibaba Cloud console
// after creating an AccessKey pair under your account
export const AlibabaCloudConfig = {
  // Common configuration
  region: 'ap-southeast-1', // Singapore region
  accessKeyId: process.env.ALIBABA_ACCESS_KEY_ID || 'LTAI5tEHTzsY5Upp1v2YXpoR',
  accessKeySecret: process.env.ALIBABA_ACCESS_KEY_SECRET || 'Zu0H4V5RraXDitAoIqm2U5cKUNHCLR',
  
  // Service-specific endpoints
  endpoints: {
    nlp: 'https://nlp.ap-southeast-1.aliyuncs.com',
    nls: 'https://nls.aliyuncs.com', // Updated NLS endpoint for global access
    ocr: 'https://ocr.ap-southeast-1.aliyuncs.com',
    imageRecognition: 'https://imagerecog.ap-southeast-1.aliyuncs.com'
  },

  // NLS (Natural Language Speech) configuration
  // These values can be found in the NLS console after creating a project
  nls: {
    appKey: process.env.ALIBABA_NLS_APP_KEY || 'ap08gzIrS6G44WaV', // Real app key for NLS service
    token: null // Will be obtained dynamically via API call
  }
};

// Export as default for easy importing
export default AlibabaCloudConfig;
