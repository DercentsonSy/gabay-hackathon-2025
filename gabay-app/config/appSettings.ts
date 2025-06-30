/**
 * App Settings Configuration
 * 
 * This file contains global settings and flags for the application.
 */

export const AppSettings = {
  // Set to true to use real Alibaba Cloud APIs, false to use simulation
  useRealAPIs: false,
  
  // Development flags
  isDevelopment: true,
  
  // Simulation settings
  simulation: {
    // How long to simulate processing for API calls (ms)
    processingDelay: 1000,
    
    // Success rate for simulated API calls (0-1)
    successRate: 0.95
  }
};

export default AppSettings;
