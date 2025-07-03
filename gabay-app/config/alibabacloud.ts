
export const AlibabaCloudConfig = {
  region: 'ap-southeast-1',
  accessKeyId: process.env.ALIBABA_ACCESS_KEY_ID || 'LTAI5tEHTzsY5Upp1v2YXpoR',
  accessKeySecret: process.env.ALIBABA_ACCESS_KEY_SECRET || 'Zu0H4V5RraXDitAoIqm2U5cKUNHCLR',
  
  endpoints: {
    nlp: 'https://nlp.ap-southeast-1.aliyuncs.com',
    nls: 'https://nls.aliyuncs.com',
    ocr: 'https://ocr.ap-southeast-1.aliyuncs.com',
    imageRecognition: 'https://imagerecog.ap-southeast-1.aliyuncs.com'
  },

  nls: {
    appKey: process.env.ALIBABA_NLS_APP_KEY || 'ap08gzIrS6G44WaV',
    token: null
  }
};

export default AlibabaCloudConfig;
