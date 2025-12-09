/**
 * API Configuration File
 * 
 * This file centralizes API configuration for easy switching between
 * local development and production environments.
 * 
 * Usage:
 *   - For local development: Set API_BASE to "http://localhost/api"
 *   - For production: Set API_BASE to "https://businessapi-njcw.onrender.com/api"
 */

// API Configuration
const API_CONFIG = {
  // Base URL for the API
  BASE_URL: "http://localhost/api",
  
  // Alternative: Production URL
  // BASE_URL: "https://businessapi-njcw.onrender.com/api",
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: "/Auth",
    CUSTOMERS: "/Customers",
    BILLS: "/Bills",
    PAYMENTS: "/Payments"
  },
  
  // Swagger Documentation URL
  SWAGGER_URL: "http://localhost/swagger/index.html",
  
  // Environment
  ENVIRONMENT: "local" // "local" or "production"
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API_CONFIG;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.API_CONFIG = API_CONFIG;
}

// Set API_BASE for backward compatibility
const API_BASE = API_CONFIG.BASE_URL;

