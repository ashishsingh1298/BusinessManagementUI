/**
 * API Configuration File
 * 
 * This file centralizes API configuration for easy switching between
 * local development and production environments.
 * 
 * Usage:
 *   - For local development: Set API_BASE to "http://localhost/api"
 *   - For production: Set API_BASE to "https://businessmanagementapi.onrender.com/api"
 */

// API Configuration
const API_CONFIG = {
  // Base URL for the API
  // Production API deployed at: https://businessmanagementapi.onrender.com
  BASE_URL: "https://businessmanagementapi.onrender.com/api",
  
  // Alternative: Local Development URL
  // BASE_URL: "http://localhost/api",
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: "/Auth",
    CUSTOMERS: "/Customers",
    BILLS: "/Bills",
    PAYMENTS: "/Payments"
  },
  
  // Swagger Documentation URL
  SWAGGER_URL: "https://businessmanagementapi.onrender.com/swagger/index.html",
  
  // Environment
  ENVIRONMENT: "production" // "local" or "production"
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

