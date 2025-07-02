/**
 * Real implementation of OCR using Alibaba Cloud OCR service
 */
import axios from 'axios';
import AlibabaCloudConfig from '../config/alibabacloud';
import { OCRResult } from './AlibabaCloudAI';

// Helper function to encode blob as base64
const blobToBase64 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        const base64data = (reader.result as string).split(',')[1];
        resolve(base64data);
      } else {
        reject(new Error('Failed to read blob data'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Sign request for OCR service
const signRequest = async (): Promise<{signature: string, timestamp: string, nonce: string}> => {
  try {
    const timestamp = new Date().toISOString();
    const nonce = Math.floor(Math.random() * 1000000000).toString();
    
    // In a production app, we would use proper signature calculation
    // For now we're using a simplified approach for the prototype
    const signature = `${AlibabaCloudConfig.accessKeyId}:${timestamp}`;
    
    console.log('Generated auth params for OCR API call');
    return {
      signature,
      timestamp,
      nonce
    };
  } catch (error) {
    console.error('Failed to sign request for OCR:', error);
    throw error;
  }
};

// Implements real OCR processing using Alibaba Cloud OCR
export const realOCRService = {
  // Extract text from images
  extractText: async (imageBlob: Blob): Promise<OCRResult> => {
    try {
      console.log("Sending image to Alibaba Cloud OCR...");
      
      // Get request signature
      const { signature, timestamp, nonce } = await signRequest();
      
      // Convert image blob to base64
      const base64Image = await blobToBase64(imageBlob);
      
      // Send to Alibaba Cloud OCR API
      const response = await axios({
        method: 'POST',
        url: `${AlibabaCloudConfig.endpoints.ocr}/ocr/general`,
        headers: {
          'Content-Type': 'application/json',
          'x-acs-accesskey-id': AlibabaCloudConfig.accessKeyId,
          'x-acs-accesskey-secret': AlibabaCloudConfig.accessKeySecret,
          'x-acs-signature': signature,
          'x-acs-timestamp': timestamp,
          'x-acs-nonce': nonce
        },
        data: {
          image: base64Image,
          configure: {
            language: 'auto', // Auto detect language
            min_confidence: 0.6, // Minimum confidence for returned text
            output_format: 'structured' // Get structured output with bounding boxes
          }
        }
      });
      
      console.log('OCR API response received');
      
      // Process OCR response - handle structured output from Alibaba Cloud OCR API
      console.log('Processing OCR response structure');
      
      if (response.data) {
        if (response.data.content) {
          // Handle regular OCR result format
          return {
            text: response.data.content,
            confidence: response.data.confidence || 0.8
          };
        } else if (response.data.blocks && Array.isArray(response.data.blocks)) {
          // Handle structured OCR result with text blocks
          const textBlocks = response.data.blocks
            .filter((block: any) => block.text && block.confidence > 0.6)
            .map((block: any) => block.text)
            .join('\n');
          
          // Calculate average confidence
          const avgConfidence = response.data.blocks.length > 0 ?
            response.data.blocks.reduce((sum: number, block: any) => sum + (block.confidence || 0), 0) / 
            response.data.blocks.length : 0.8;
          
          console.log(`OCR extracted ${response.data.blocks.length} text blocks with avg confidence: ${avgConfidence}`);
          
          return {
            text: textBlocks,
            confidence: avgConfidence
          };
        } else if (response.data.text) {
          // Handle simple OCR result format
          return {
            text: response.data.text,
            confidence: response.data.confidence || 0.8
          };
        }
      }
      
      console.error('Unexpected OCR response format:', JSON.stringify(response.data).substring(0, 200) + '...');
      
      // Fallback for partial or unexpected results
      return {
        text: "No text could be extracted from this image.",
        confidence: 0.1
      };
    } catch (error) {
      console.error('Error in OCR processing:', error);
      
      // Fallback for error cases
      return {
        text: "Error processing image. Please try again.",
        confidence: 0.1
      };
    }
  }
};

export default realOCRService;
