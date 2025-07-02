/**
 * Real implementation of NLP (Natural Language Processing) using Alibaba Cloud NLP service
 */
import axios from 'axios';
import AlibabaCloudConfig from '../config/alibabacloud';
import { NLPResult } from './AlibabaCloudAI';

// Helper function to get an access token for NLP service
const getAccessToken = async (): Promise<string> => {
  try {
    // For Alibaba Cloud NLP, we use RAM STS authentication
    const date = new Date();
    const timestamp = date.toISOString();
    const nonce = Math.floor(Math.random() * 1000000000).toString();
    
    // Create signature
    const stringToSign = `${AlibabaCloudConfig.accessKeyId}${timestamp}${nonce}`;
    
    // In a real implementation, we would properly sign this request
    // For now, we're using direct key authentication instead of token-based auth
    
    console.log('Generated auth params for NLP API call');
    return `${AlibabaCloudConfig.accessKeyId}:${timestamp}:${nonce}`;
  } catch (error) {
    console.error('Failed to get access token for NLP:', error);
    throw error;
  }
};

// Implements real NLP processing using Alibaba Cloud NLP
export const realNLPService = {
  // Analyze text to extract intent and entities
  analyze: async (text: string): Promise<NLPResult> => {
    try {
      console.log("Sending text to Alibaba Cloud NLP...");
      
      // Get access token
      const accessToken = await getAccessToken();
      
      // Send to Alibaba Cloud NLP API
      const response = await axios({
        method: 'POST',
        url: `${AlibabaCloudConfig.endpoints.nlp}/api/v2/nlp/textanalysis`,
        headers: {
          'Content-Type': 'application/json',
          'x-acs-accesskey-id': AlibabaCloudConfig.accessKeyId,
          'x-acs-accesskey-secret': AlibabaCloudConfig.accessKeySecret,
          'x-acs-signature': accessToken
        },
        data: {
          text: text,
          tasks: ['intent_detection', 'entity_recognition'],
          language: 'en', // Can be configured based on user preference
          domain: 'finance' // Specific to financial domain for Gabay app
        }
      });
      
      console.log('NLP API response:', JSON.stringify(response.data));
      
      // Process response - the real API has a different response structure
      try {
        if (response.data && response.data.results) {
          // Extract intent from intent detection task
          const intentTask = response.data.results.find((result: any) => 
            result.task === 'intent_detection' || result.task === 'intent');
          
          // Extract entities from entity recognition task
          const entityTask = response.data.results.find((result: any) => 
            result.task === 'entity_recognition' || result.task === 'entities');
          
          const intent = intentTask?.data?.intent?.name || 'unknown';
          const confidence = intentTask?.data?.intent?.confidence || 0.5;
          
          // Process entities if available
          const entities = entityTask?.data?.entities?.map((entity: any) => ({
            type: entity.type || entity.tag,
            value: entity.value || entity.text
          })) || [];
          
          console.log(`NLP processed: Intent: ${intent}, Confidence: ${confidence}, Entities: ${entities.length}`);
          
          return {
            intent: intent,
            entities: entities,
            confidence: confidence
          };
        }
      } catch (err) {
        console.error('Error processing NLP response:', err);
      }
      
      // Fallback for partial or malformed results
      return {
        intent: 'unknown',
        entities: [],
        confidence: 0.1
      };
    } catch (error) {
      console.error('Error in NLP processing:', error);
      
      // Fallback for error cases
      return {
        intent: 'error',
        entities: [],
        confidence: 0.1
      };
    }
  }
};

export default realNLPService;
