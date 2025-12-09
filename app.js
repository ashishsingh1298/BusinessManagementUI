// app.js - common helpers for pages
// API Configuration - Change this to switch between local and production
const API_BASE = "http://localhost/api";

/**
 * SECURITY FIX #1: XSS Protection
 * Escapes HTML special characters to prevent XSS attacks
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text safe for HTML insertion
 */
function escapeHtml(text) {
  if (text == null) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { "Content-Type": "application/json", "Authorization": "Bearer " + token } :
                 { "Content-Type": "application/json" };
}

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  const text = await res.text();
  try { 
    const parsed = text ? JSON.parse(text) : null;
    // Handle new API response format: {status, message, body, errors}
    if (parsed && typeof parsed === 'object' && 'status' in parsed) {
      return { 
        ok: res.ok && parsed.status, 
        status: res.status, 
        data: parsed.body || parsed.data || parsed,
        apiResponse: parsed // Store full response for error messages
      };
    }
    // Fallback for old format
    return { ok: res.ok, status: res.status, data: parsed };
  }
  catch (e) { return { ok: res.ok, status: res.status, data: text }; }
}

function requireAuthRedirect() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function logoutAndRedirect() {
  clearAllLocalStorage();
  window.location.href = "login.html";
}

/**
 * Clear all localStorage data (useful for debugging/testing)
 */
function clearAllLocalStorage() {
  // Authentication & User Data
  localStorage.removeItem("token");
  localStorage.removeItem("userRole");
  localStorage.removeItem("userType");
  localStorage.removeItem("userCode");
  localStorage.removeItem("userName");
  localStorage.removeItem("username"); // Alternative key
  localStorage.removeItem("fname");
  localStorage.removeItem("lname");
  localStorage.removeItem("organizationName");
  localStorage.removeItem("organizationLogo");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userInfo");
  
  // Feature Management System
  localStorage.removeItem("availableFeatures");
  localStorage.removeItem("businessInformation");
  
  // UI Preferences
  localStorage.removeItem("darkMode");
  
}

// ==================== FEATURE MANAGEMENT SYSTEM ====================
/**
 * Check if user has access to a specific feature
 * @param {string} featureCode - Feature code (e.g., "DASHBOARD_ANALYTICS")
 * @returns {boolean} - True if feature is available
 */
function hasFeature(featureCode) {
  try {
    const featuresJson = localStorage.getItem("availableFeatures");
    if (!featuresJson) {
      // Default features for backward compatibility - ONLY basic features
      const defaultFeatures = ["DASHBOARD_BASIC", "CUSTOMER_MANAGEMENT", "BILL_MANAGEMENT", "PAYMENT_MANAGEMENT"];
      const hasAccess = defaultFeatures.includes(featureCode);
      return hasAccess;
    }
    const features = JSON.parse(featuresJson);
    if (!Array.isArray(features)) {
      return false;
    }
    const hasAccess = features.includes(featureCode);
    return hasAccess;
  } catch (e) {
    return false;
  }
}

/**
 * Get all available features
 * @returns {string[]} - Array of feature codes
 */
function getAvailableFeatures() {
  try {
    const featuresJson = localStorage.getItem("availableFeatures");
    if (!featuresJson) {
      return ["DASHBOARD_BASIC", "CUSTOMER_MANAGEMENT", "BILL_MANAGEMENT", "PAYMENT_MANAGEMENT"];
    }
    return JSON.parse(featuresJson);
  } catch (e) {
    return [];
  }
}

/**
 * Get business information
 * @returns {string} - Business information text
 */
function getBusinessInformation() {
  return localStorage.getItem("businessInformation") || "";
}

/**
 * Check if user has any of the specified features
 * @param {string[]} featureCodes - Array of feature codes
 * @returns {boolean} - True if at least one feature is available
 */
function hasAnyFeature(featureCodes) {
  return featureCodes.some(code => hasFeature(code));
}

/**
 * Check if user has all of the specified features
 * @param {string[]} featureCodes - Array of feature codes
 * @returns {boolean} - True if all features are available
 */
function hasAllFeatures(featureCodes) {
  return featureCodes.every(code => hasFeature(code));
}

// ==================== DARK MODE ====================
function initDarkMode() {
  const isDark = localStorage.getItem('darkMode') === 'true';
  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

function toggleDarkMode() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (isDark) {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('darkMode', 'false');
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('darkMode', 'true');
  }
}

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = 'info', duration = 3000) {
  // Remove existing toasts
  const existing = document.querySelectorAll('.toast');
  existing.forEach(t => t.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${getToastIcon(type)}</span>
      <span class="toast-message">${escapeHtml(message)}</span>
      <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Auto remove
  if (duration > 0) {
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
  
  return toast;
}

function getToastIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || icons.info;
}

// Enhanced showSuccess and showError with toast
function showSuccessToast(message, elementId = null) {
  showToast(message, 'success');
  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = escapeHtml(message);
      el.className = 'success';
    }
  }
}

function showErrorToast(message, elementId = null) {
  showToast(message, 'error');
  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = escapeHtml(message);
      el.className = 'error';
    }
  }
}

// ==================== KEYBOARD SHORTCUTS ====================
function initKeyboardShortcuts() {
  // Ctrl/Cmd + K - Quick search
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.querySelector('input[type="text"][placeholder*="Search"], input[type="text"][placeholder*="search"]');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
    
    // Esc - Close modals
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('[style*="display:flex"], [style*="display: block"]');
      modals.forEach(modal => {
        if (modal.id && (modal.id.includes('Modal') || modal.id.includes('modal'))) {
          modal.style.display = 'none';
        }
      });
    }
    
    // Ctrl/Cmd + / - Show keyboard shortcuts help
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      showKeyboardShortcutsHelp();
    }
  });
}

function showKeyboardShortcutsHelp() {
  const helpModal = document.createElement('div');
  helpModal.className = 'keyboard-shortcuts-modal';
  helpModal.innerHTML = `
    <div class="keyboard-shortcuts-content">
      <div class="keyboard-shortcuts-header">
        <h2>⌨️ Keyboard Shortcuts</h2>
        <button onclick="this.closest('.keyboard-shortcuts-modal').remove()" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666;">×</button>
      </div>
      <div class="keyboard-shortcuts-list">
        <div class="shortcut-item">
          <kbd>Ctrl</kbd> + <kbd>K</kbd>
          <span>Quick Search</span>
        </div>
        <div class="shortcut-item">
          <kbd>Ctrl</kbd> + <kbd>/</kbd>
          <span>Show this help</span>
        </div>
        <div class="shortcut-item">
          <kbd>Esc</kbd>
          <span>Close modals</span>
        </div>
        <div class="shortcut-item">
          <kbd>Tab</kbd>
          <span>Navigate between tabs</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(helpModal);
  setTimeout(() => helpModal.classList.add('show'), 10);
  
  // Close on click outside
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.classList.remove('show');
      setTimeout(() => helpModal.remove(), 300);
    }
  });
}

/**
 * PERMISSION SYSTEM: User Role Management
 * Handles user permissions based on user hierarchy (SuperAdmin, Admin, SubUser)
 */

/**
 * Stores user information after login
 * @param {object} userInfo - User information from login response
 */
function storeUserInfo(userInfo) {
  if (userInfo) {
    if (userInfo.role) localStorage.setItem("userRole", userInfo.role);
    if (userInfo.userType) localStorage.setItem("userType", userInfo.userType);
    if (userInfo.username) localStorage.setItem("username", userInfo.username);
    localStorage.setItem("userInfo", JSON.stringify(userInfo));
  }
}

/**
 * Gets user type from localStorage (SuperAdmin, Admin, SubUser)
 * @returns {string} - User type or null
 */
function getUserType() {
  return localStorage.getItem("userType");
}

/**
 * Gets user role from localStorage (for backward compatibility)
 * @returns {string} - User role (admin, user, etc.) or null
 */
function getUserRole() {
  const userType = getUserType();
  if (userType) return userType;
  return localStorage.getItem("userRole");
}

/**
 * Checks if current user is Super Admin
 * @returns {boolean} - true if user is SuperAdmin
 */
function isSuperAdmin() {
  const userType = getUserType();
  return userType && userType.toLowerCase() === 'superadmin';
}

/**
 * Checks if current user is Admin
 * @returns {boolean} - true if user is Admin
 */
function isAdmin() {
  const userType = getUserType();
  return userType && (userType.toLowerCase() === 'admin' || userType.toLowerCase() === 'superadmin');
}

/**
 * Checks if current user is Sub User
 * @returns {boolean} - true if user is SubUser
 */
function isSubUser() {
  const userType = getUserType();
  return userType && userType.toLowerCase() === 'subuser';
}

/**
 * Checks if user has permission for a specific action
 * @param {string} action - Action to check (edit, delete, create, view)
 * @returns {boolean} - true if user has permission
 */
function hasPermission(action) {
  const userType = getUserType();
  
  // SuperAdmin: Full access (but typically doesn't access business data)
  if (isSuperAdmin()) {
    // SuperAdmin typically doesn't access customers/bills/payments
    // But if they do, they have full permissions
    return true;
  }
  
  // Admin: Full CRUD permissions
  if (isAdmin()) {
    return true;
  }
  
  // SubUser: Create and Read only (no Update/Delete)
  if (isSubUser()) {
    if (action === 'create' || action === 'view' || action === 'read') {
      return true;
    }
    // No edit/delete for SubUser
    return false;
  }
  
  // Default: no permission (fallback for backward compatibility)
  const role = getUserRole();
  if (role && role.toLowerCase() === 'admin') {
    return true;
  }
  
  return false;
}

/**
 * Decodes JWT token to extract user info (if role is in token)
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded token payload or null
 */
function decodeToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload;
  } catch (e) {
    return null;
  }
}

/**
 * Extracts user info from token and stores it
 * This is called after successful login
 */
function extractUserInfoFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return;
  
  const decoded = decodeToken(token);
  if (decoded) {
    // Check if role is in token payload
    if (decoded.role) {
      localStorage.setItem("userRole", decoded.role);
    }
    if (decoded.username) {
      localStorage.setItem("username", decoded.username);
    }
    // Store full decoded info
    localStorage.setItem("userInfo", JSON.stringify(decoded));
  }
}

/**
 * SECURITY FIX #3: Input Validation Functions
 * Validates user input to prevent invalid data and potential attacks
 */

/**
 * Validates phone number (10 digits, numbers only)
 * @param {string} phone - Phone number to validate
 * @returns {object} - {valid: boolean, message: string}
 */
function validatePhone(phone) {
  if (!phone || phone.trim() === '') {
    return { valid: false, message: 'Phone number is required' };
  }
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Check if it's 10 digits
  if (!/^\d{10}$/.test(cleaned)) {
    return { valid: false, message: 'Phone must be 10 digits' };
  }
  return { valid: true, message: '' };
}

/**
 * Validates amount (must be positive number)
 * @param {string|number} amount - Amount to validate
 * @returns {object} - {valid: boolean, message: string}
 */
function validateAmount(amount) {
  if (amount === '' || amount === null || amount === undefined) {
    return { valid: false, message: 'Amount is required' };
  }
  const num = parseFloat(amount);
  if (isNaN(num)) {
    return { valid: false, message: 'Amount must be a number' };
  }
  if (num <= 0) {
    return { valid: false, message: 'Amount must be greater than 0' };
  }
  if (num > 999999999) {
    return { valid: false, message: 'Amount is too large' };
  }
  return { valid: true, message: '' };
}

/**
 * Validates required text field
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field (for error message)
 * @param {number} minLength - Minimum length (optional)
 * @param {number} maxLength - Maximum length (optional)
 * @returns {object} - {valid: boolean, message: string}
 */
function validateRequired(value, fieldName, minLength = 1, maxLength = 500) {
  if (!value || value.trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  const trimmed = value.trim();
  if (trimmed.length < minLength) {
    return { valid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }
  if (trimmed.length > maxLength) {
    return { valid: false, message: `${fieldName} must be less than ${maxLength} characters` };
  }
  return { valid: true, message: '' };
}

/**
 * Validates customer name (alphanumeric, spaces, and common characters)
 * @param {string} name - Name to validate
 * @returns {object} - {valid: boolean, message: string}
 */
function validateName(name) {
  const required = validateRequired(name, 'Name', 2, 100);
  if (!required.valid) return required;
  
  // Allow letters, numbers, spaces, hyphens, apostrophes, and periods
  if (!/^[a-zA-Z0-9\s\-'\.]+$/.test(name)) {
    return { valid: false, message: 'Name contains invalid characters' };
  }
  return { valid: true, message: '' };
}

/**
 * Validates address (allows most characters, reasonable length)
 * @param {string} address - Address to validate
 * @returns {object} - {valid: boolean, message: string}
 */
function validateAddress(address) {
  // Address is optional, but if provided, validate length
  if (address && address.trim() !== '') {
    if (address.length > 200) {
      return { valid: false, message: 'Address must be less than 200 characters' };
    }
  }
  return { valid: true, message: '' };
}

/**
 * Shows validation error message in the UI
 * @param {string} elementId - ID of the element to show error
 * @param {string} message - Error message to display
 */
function showValidationError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = message;
    element.className = 'error';
    element.style.display = 'block';
  }
}

/**
 * Clears validation error message
 * @param {string} elementId - ID of the element to clear
 */
function clearValidationError(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = '';
    element.style.display = 'none';
  }
}

/**
 * Validates customer form data
 * @param {object} data - {name, phone, address}
 * @returns {object} - {valid: boolean, errors: array}
 */
function validateCustomerForm(data) {
  const errors = [];
  
  const nameValidation = validateName(data.name);
  if (!nameValidation.valid) errors.push({ field: 'name', message: nameValidation.message });
  
  const phoneValidation = validatePhone(data.phone);
  if (!phoneValidation.valid) errors.push({ field: 'phone', message: phoneValidation.message });
  
  const addressValidation = validateAddress(data.address);
  if (!addressValidation.valid) errors.push({ field: 'address', message: addressValidation.message });
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates bill form data
 * @param {object} data - {customerId, billAmount, notes, status}
 * @returns {object} - {valid: boolean, errors: array}
 */
function validateBillForm(data) {
  const errors = [];
  
  if (!data.customerId || data.customerId === 0) {
    errors.push({ field: 'customer', message: 'Customer is required' });
  }
  
  const amountValidation = validateAmount(data.billAmount);
  if (!amountValidation.valid) errors.push({ field: 'amount', message: amountValidation.message });
  
  if (data.notes && data.notes.length > 500) {
    errors.push({ field: 'notes', message: 'Notes must be less than 500 characters' });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * Validates payment form data
 * @param {object} data - {customerId, billId, amount, mode}
 * @returns {object} - {valid: boolean, errors: array}
 */
function validatePaymentForm(data) {
  const errors = [];
  
  if (!data.customerId || data.customerId === 0) {
    errors.push({ field: 'customer', message: 'Customer is required' });
  }
  
  if (!data.billId || data.billId === 0) {
    errors.push({ field: 'bill', message: 'Bill is required' });
  }
  
  const amountValidation = validateAmount(data.amount);
  if (!amountValidation.valid) errors.push({ field: 'amount', message: amountValidation.message });
  
  const validModes = ['Cash', 'UPI', 'Cheque'];
  if (!data.mode || !validModes.includes(data.mode)) {
    errors.push({ field: 'mode', message: 'Payment mode is required' });
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

/**
 * SECURITY FIX #4: Unified Error Handling System
 * Provides consistent error handling across the application
 */

/**
 * Handles API errors and displays user-friendly messages
 * @param {object} response - API response object from fetchJson
 * @param {string} defaultMessage - Default error message if none found
 * @returns {string} - User-friendly error message
 */
function getErrorMessage(response, defaultMessage = 'An error occurred') {
  if (!response) return defaultMessage;
  
  // Try to extract error message from response
  if (response.data) {
    // Check common error message fields
    if (response.data.message) return response.data.message;
    if (response.data.error) return response.data.error;
    if (response.data.errors && Array.isArray(response.data.errors)) {
      return response.data.errors.map(e => e.message || e).join(', ');
    }
    if (typeof response.data === 'string') return response.data;
  }
  
  // HTTP status code based messages
  if (response.status) {
    switch(response.status) {
      case 400: return 'Invalid request. Please check your input.';
      case 401: return 'Authentication failed. Please login again.';
      case 403: return 'You do not have permission to perform this action.';
      case 404: return 'Resource not found.';
      case 409: return 'This record already exists.';
      case 422: return 'Validation failed. Please check your input.';
      case 500: return 'Server error. Please try again later.';
      case 503: return 'Service temporarily unavailable. Please try again later.';
      default: return `${defaultMessage} (Status: ${response.status})`;
    }
  }
  
  return defaultMessage;
}

/**
 * Shows error message in a consistent way
 * @param {string} elementId - ID of the element to show error
 * @param {string} message - Error message to display
 */
function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = message;
    element.className = 'error';
    element.style.display = 'block';
    // Scroll to error if possible
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Shows success message in a consistent way
 * @param {string} elementId - ID of the element to show success message
 * @param {string} message - Success message to display
 */
function showSuccess(elementId, message) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = message;
    element.className = 'success';
    element.style.display = 'block';
  }
}

/**
 * Shows loading/processing message
 * @param {string} elementId - ID of the element to show loading message
 * @param {string} message - Loading message (default: "Processing...")
 */
function showLoading(elementId, message = 'Processing...') {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<span class="loading-spinner"></span>${message}`;
    element.className = '';
    element.style.display = 'block';
  }
}

/**
 * UX IMPROVEMENT: Loading Indicators
 * Provides visual feedback during operations
 */

/**
 * Shows a loading spinner on a button
 * @param {string} buttonId - ID of the button
 * @param {string} text - Button text while loading
 */
function setButtonLoading(buttonId, text = 'Loading...') {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = true;
    button.classList.add('button-loading');
    button.dataset.originalText = button.innerText;
    button.innerHTML = `<span class="loading-spinner"></span>${text}`;
  }
}

/**
 * Removes loading state from a button
 * @param {string} buttonId - ID of the button
 */
function removeButtonLoading(buttonId) {
  const button = document.getElementById(buttonId);
  if (button) {
    button.disabled = false;
    button.classList.remove('button-loading');
    button.innerText = button.dataset.originalText || button.innerText;
  }
}

/**
 * Shows a full-page loading overlay
 */
function showLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'loadingOverlay';
  overlay.className = 'loading-overlay';
  overlay.innerHTML = '<div class="loading-spinner-large"></div>';
  document.body.appendChild(overlay);
}

/**
 * Hides the full-page loading overlay
 */
function hideLoadingOverlay() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.remove();
  }
}

/**
 * Clears any message from an element
 * @param {string} elementId - ID of the element to clear
 */
function clearMessage(elementId) {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerText = '';
    element.style.display = 'none';
    element.className = '';
  }
}

/**
 * Handles API response errors consistently
 * @param {object} response - API response from fetchJson
 * @param {string} errorElementId - ID of element to show error
 * @param {string} defaultMessage - Default error message
 * @returns {boolean} - true if error occurred, false if success
 */
function handleApiError(response, errorElementId, defaultMessage = 'Operation failed') {
  if (!response || !response.ok) {
    // Handle new API error format: {status: false, message, errors: []}
    let errorMsg = defaultMessage;
    if (response.apiResponse) {
      if (response.apiResponse.errors && response.apiResponse.errors.length > 0) {
        errorMsg = response.apiResponse.errors.join(', ');
      } else if (response.apiResponse.message) {
        errorMsg = response.apiResponse.message;
      }
    } else {
      errorMsg = getErrorMessage(response, defaultMessage);
    }
    showError(errorElementId, errorMsg);
    return true; // Error occurred
  }
  return false; // No error
}

/**
 * Logs error to console for debugging (only in development)
 * @param {string} context - Context where error occurred
 * @param {object} error - Error object or response
 */
function logError(context, error) {
  if (console && console.error) {
    console.error(`[${context}]`, error);
  }
}

/**
 * FEATURE #2: Search and Filter Functions
 * Provides search and filtering capabilities for tables
 */

/**
 * Debounce function to limit how often a function is called
 * @param {function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {function} - Debounced function
 */
function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Filters customers based on search term
 * @param {array} customers - Array of customers
 * @param {string} searchTerm - Search term
 * @returns {array} - Filtered customers
 */
function filterCustomers(customers, searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') return customers;
  
  const term = searchTerm.toLowerCase().trim();
  return customers.filter(c => {
    return (
      (c.name && c.name.toLowerCase().includes(term)) ||
      (c.phone && c.phone.includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term)) ||
      (c.id && c.id.toString().includes(term))
    );
  });
}

/**
 * Filters bills based on search term
 * @param {array} bills - Array of bills
 * @param {string} searchTerm - Search term
 * @param {object} customerMap - Map of customer IDs to names
 * @returns {array} - Filtered bills
 */
function filterBills(bills, searchTerm, customerMap = {}) {
  if (!searchTerm || searchTerm.trim() === '') return bills;
  
  const term = searchTerm.toLowerCase().trim();
  return bills.filter(b => {
    const customerName = customerMap[b.customerId] || '';
    return (
      (b.id && b.id.toString().includes(term)) ||
      (b.customerId && b.customerId.toString().includes(term)) ||
      (customerName && customerName.toLowerCase().includes(term)) ||
      (b.billAmount && b.billAmount.toString().includes(term)) ||
      (b.status && b.status.toLowerCase().includes(term)) ||
      (b.notes && b.notes.toLowerCase().includes(term))
    );
  });
}

/**
 * Filters payments based on search term
 * @param {array} payments - Array of payments
 * @param {string} searchTerm - Search term
 * @returns {array} - Filtered payments
 */
function filterPayments(payments, searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') return payments;
  
  const term = searchTerm.toLowerCase().trim();
  return payments.filter(p => {
    return (
      (p.id && p.id.toString().includes(term)) ||
      (p.customerId && p.customerId.toString().includes(term)) ||
      (p.billId && p.billId.toString().includes(term)) ||
      (p.amount && p.amount.toString().includes(term)) ||
      (p.mode && p.mode.toLowerCase().includes(term)) ||
      (p.chequeNumber && p.chequeNumber.toLowerCase().includes(term))
    );
  });
}

/**
 * DATE FORMATTING FUNCTIONS
 * Formats dates for display in the UI
 */

/**
 * Formats a date string to a readable format
 * @param {string} dateString - ISO date string
 * @param {object} options - Formatting options
 * @returns {string} - Formatted date string
 */
function formatDate(dateString, options = {}) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      ...options
    };
    
    return date.toLocaleDateString('en-IN', defaultOptions);
  } catch (e) {
    return 'Invalid Date';
  }
}

/**
 * Formats date to show only date (no time)
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date
 */
function formatDateOnly(dateString) {
  return formatDate(dateString, { hour: undefined, minute: undefined });
}

/**
 * Formats date to show relative time (e.g., "2 days ago")
 * @param {string} dateString - ISO date string
 * @returns {string} - Relative time string
 */
function formatRelativeTime(dateString) {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return formatDateOnly(dateString);
  } catch (e) {
    return 'Invalid Date';
  }
}

/**
 * Gets the age of a record in days
 * @param {string} dateString - ISO date string
 * @returns {number} - Age in days
 */
function getRecordAge(dateString) {
  if (!dateString) return 0;
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 0;
  }
}

/**
 * FEATURE #4: Export Functions
 * Export data to CSV/Excel format
 */

/**
 * Converts array of objects to CSV string
 * @param {array} data - Array of objects
 * @param {array} headers - Array of header objects {key, label}
 * @returns {string} - CSV string
 */
function convertToCSV(data, headers) {
  if (!data || data.length === 0) return '';
  
  // Create header row
  const headerRow = headers.map(h => h.label).join(',');
  
  // Create data rows
  const dataRows = data.map(item => {
    return headers.map(h => {
      let value = item[h.key] || '';
      // Handle nested values
      if (h.key.includes('.')) {
        const keys = h.key.split('.');
        value = keys.reduce((obj, key) => obj?.[key], item) || '';
      }
      // Escape commas and quotes
      if (typeof value === 'string') {
        value = value.replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
      }
      return value;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Downloads data as CSV file
 * @param {string} csvContent - CSV string content
 * @param {string} filename - Filename for download
 */
function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Exports customers to CSV
 * @param {array} customers - Array of customer objects
 */
function exportCustomersToCSV(customers) {
  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'phone', label: 'Phone' },
    { key: 'address', label: 'Address' },
    { key: 'createdAt', label: 'Created Date' }
  ];
  
  const csv = convertToCSV(customers, headers);
  const filename = `customers_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Exports bills to CSV
 * @param {array} bills - Array of bill objects
 * @param {object} customerMap - Map of customer IDs to names
 */
function exportBillsToCSV(bills, customerMap = {}) {
  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'billAmount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'billDate', label: 'Bill Date' },
    { key: 'notes', label: 'Notes' }
  ];
  
  // Add customer names
  const billsWithCustomer = bills.map(b => ({
    ...b,
    customerName: customerMap[b.customerId] || 'Unknown'
  }));
  
  const csv = convertToCSV(billsWithCustomer, [
    ...headers,
    { key: 'customerName', label: 'Customer Name' }
  ]);
  const filename = `bills_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * Exports payments to CSV
 * @param {array} payments - Array of payment objects
 */
function exportPaymentsToCSV(payments) {
  const headers = [
    { key: 'id', label: 'ID' },
    { key: 'customerId', label: 'Customer ID' },
    { key: 'billId', label: 'Bill ID' },
    { key: 'amount', label: 'Amount' },
    { key: 'mode', label: 'Payment Mode' },
    { key: 'paymentDate', label: 'Payment Date' },
    { key: 'cleared', label: 'Cleared' },
    { key: 'chequeNumber', label: 'Cheque Number' }
  ];
  
  const csv = convertToCSV(payments, headers);
  const filename = `payments_${new Date().toISOString().split('T')[0]}.csv`;
  downloadCSV(csv, filename);
}

/**
 * FEATURE: PDF Generation Functions
 * Generate PDF reports, invoices, and statements
 */

/**
 * Generates a PDF invoice for a bill
 * @param {object} bill - Bill object
 * @param {object} customer - Customer object
 */
function generatePDFInvoice(bill, customer) {
  try {
    if(!window.jspdf) {
      console.error('jsPDF library not loaded');
      return false;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Color scheme
    const primaryColor = [102, 126, 234]; // Purple
    const secondaryColor = [118, 75, 162]; // Dark purple
    const lightGray = [245, 245, 245];
    const darkGray = [44, 62, 80];
    const successGreen = [39, 174, 96];
    
    // ========== HEADER SECTION ==========
    // Gradient-like header background
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, 210, 50, 'F');
    
    // White text on colored background
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, 'bold');
    doc.text('INVOICE', 105, 25, { align: 'center' });
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Business Management System', 105, 35, { align: 'center' });
    doc.text('Invoice #' + bill.id, 105, 42, { align: 'center' });
    
    // ========== INVOICE INFO SECTION ==========
    let yPos = 60;
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Invoice Date:', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.text(bill.billDate ? formatDateOnly(bill.billDate) : formatDateOnly(bill.createdAt), 20, yPos + 6);
    
    doc.setFont(undefined, 'bold');
    doc.text('Status:', 20, yPos + 14);
    doc.setFont(undefined, 'normal');
    const statusColor = (bill.status === 'Pending' || bill.status === 'pending') ? [255, 193, 7] : successGreen;
    doc.setFillColor(...statusColor);
    doc.roundedRect(20, yPos + 16, 40, 6, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text((bill.status || 'Pending').toUpperCase(), 40, yPos + 20, { align: 'center' });
    
    // ========== CUSTOMER INFO SECTION ==========
    yPos = 60;
    doc.setTextColor(...darkGray);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Bill To:', 120, yPos);
    
    // Customer info box
    doc.setFillColor(...lightGray);
    doc.roundedRect(120, yPos + 3, 80, 35, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...darkGray);
    doc.text(customer.name || 'N/A', 125, yPos + 10);
    doc.text(customer.phone || 'N/A', 125, yPos + 17);
    
    // Address (wrapped if long)
    const address = customer.address || 'N/A';
    const addressLines = doc.splitTextToSize(address, 70);
    addressLines.forEach((line, index) => {
      doc.text(line, 125, yPos + 24 + (index * 6));
    });
    
    // ========== ITEMS TABLE SECTION ==========
    yPos = 105;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...darkGray);
    doc.text('Item Details', 20, yPos);
    
    yPos += 8;
    // Table header with gradient effect
    doc.setFillColor(...primaryColor);
    doc.roundedRect(20, yPos, 170, 10, 2, 2, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Description', 25, yPos + 7);
    doc.text('Quantity', 120, yPos + 7);
    doc.text('Amount', 180, yPos + 7, { align: 'right' });
    
    yPos += 12;
    // Item row with alternating background
    doc.setFillColor(...lightGray);
    doc.roundedRect(20, yPos, 170, 12, 2, 2, 'F');
    
    doc.setTextColor(...darkGray);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const description = bill.notes || 'Service/Product';
    const descLines = doc.splitTextToSize(description, 80);
    descLines.forEach((line, index) => {
      doc.text(line, 25, yPos + 6 + (index * 5));
    });
    
    doc.text('1', 120, yPos + 7);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('₹' + parseFloat(bill.billAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}), 180, yPos + 7, { align: 'right' });
    
    // ========== TOTALS SECTION ==========
    yPos += 20;
    doc.setFillColor(250, 250, 250);
    doc.roundedRect(120, yPos, 70, 25, 3, 3, 'F');
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(120, yPos + 15, 190, yPos + 15);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Subtotal:', 125, yPos + 10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...darkGray);
    doc.text('₹' + parseFloat(bill.billAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}), 185, yPos + 10, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...primaryColor);
    doc.text('Total Amount:', 125, yPos + 22);
    doc.setFontSize(14);
    doc.text('₹' + parseFloat(bill.billAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2}), 185, yPos + 22, { align: 'right' });
    
    // ========== PAYMENT INFO SECTION ==========
    yPos += 35;
    doc.setFillColor(255, 249, 237);
    doc.roundedRect(20, yPos, 170, 20, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...darkGray);
    doc.text('Payment Information', 25, yPos + 7);
    
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Payment Terms: Due on receipt', 25, yPos + 14);
    doc.text('Payment Methods: Cash, UPI, Cheque', 25, yPos + 20);
    
    // ========== FOOTER SECTION ==========
    yPos = 270;
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(20, yPos, 190, yPos);
    
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text('Thank you for your business!', 105, yPos + 8, { align: 'center' });
    doc.text('For any queries, please contact us.', 105, yPos + 14, { align: 'center' });
    doc.text('Generated on ' + formatDate(new Date().toISOString()), 105, yPos + 20, { align: 'center' });
    
    // ========== SAVE PDF ==========
    const filename = `Invoice_${bill.id}_${customer.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    return true;
  } catch(err) {
    logError('generatePDFInvoice', err);
    return false;
  }
}

/**
 * Generates a PDF customer statement
 * @param {object} customer - Customer object
 * @param {array} bills - Array of bill objects
 * @param {array} payments - Array of payment objects
 */
function generatePDFStatement(customer, bills, payments) {
  try {
    if(!window.jspdf) {
      console.error('jsPDF library not loaded');
      return false;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(102, 126, 234);
    doc.text('CUSTOMER STATEMENT', 105, 20, { align: 'center' });
    
    // Customer Info
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.text('Customer Information', 20, 35);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Name: ' + (customer.name || 'N/A'), 20, 42);
    doc.text('Phone: ' + (customer.phone || 'N/A'), 20, 47);
    doc.text('Address: ' + (customer.address || 'N/A'), 20, 52);
    doc.text('Statement Date: ' + formatDate(new Date().toISOString()), 20, 57);
    
    // Calculate totals
    const totalBilled = bills.reduce((sum, b) => sum + (parseFloat(b.billAmount) || 0), 0);
    const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const outstanding = totalBilled - totalPaid;
    
    // Summary
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Financial Summary', 20, 70);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('Total Billed: ₹' + totalBilled.toLocaleString('en-IN', {minimumFractionDigits: 2}), 20, 77);
    doc.text('Total Paid: ₹' + totalPaid.toLocaleString('en-IN', {minimumFractionDigits: 2}), 20, 82);
    doc.text('Outstanding: ₹' + outstanding.toLocaleString('en-IN', {minimumFractionDigits: 2}), 20, 87);
    
    // Bills Table
    let yPos = 100;
    if(bills.length > 0) {
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Bills (' + bills.length + ')', 20, yPos);
      yPos += 5;
      
      // Table Header
      doc.setFillColor(102, 126, 234);
      doc.rect(20, yPos, 170, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('ID', 25, yPos + 4);
      doc.text('Date', 50, yPos + 4);
      doc.text('Amount', 100, yPos + 4);
      doc.text('Status', 140, yPos + 4);
      yPos += 8;
      
      // Bill Rows
      doc.setTextColor(0, 0, 0);
      bills.slice(0, 10).forEach((bill, index) => {
        if(yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.text(bill.id.toString(), 25, yPos);
        doc.text(bill.billDate ? formatDateOnly(bill.billDate) : 'N/A', 50, yPos);
        doc.text('₹' + parseFloat(bill.billAmount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2}), 100, yPos);
        doc.text(bill.status || 'Pending', 140, yPos);
        yPos += 6;
      });
      
      if(bills.length > 10) {
        doc.text('... and ' + (bills.length - 10) + ' more bills', 25, yPos);
        yPos += 6;
      }
    }
    
    // Payments Table
    yPos += 5;
    if(payments.length > 0) {
      if(yPos > 270) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Payments (' + payments.length + ')', 20, yPos);
      yPos += 5;
      
      // Table Header
      doc.setFillColor(102, 126, 234);
      doc.rect(20, yPos, 170, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text('ID', 25, yPos + 4);
      doc.text('Date', 50, yPos + 4);
      doc.text('Amount', 100, yPos + 4);
      doc.text('Mode', 140, yPos + 4);
      yPos += 8;
      
      // Payment Rows
      doc.setTextColor(0, 0, 0);
      payments.slice(0, 10).forEach((payment) => {
        if(yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.setFont(undefined, 'normal');
        doc.setFontSize(8);
        doc.text(payment.id.toString(), 25, yPos);
        doc.text(payment.paymentDate ? formatDateOnly(payment.paymentDate) : 'N/A', 50, yPos);
        doc.text('₹' + parseFloat(payment.amount || 0).toLocaleString('en-IN', {minimumFractionDigits: 2}), 100, yPos);
        doc.text(payment.mode || 'N/A', 140, yPos);
        yPos += 6;
      });
      
      if(payments.length > 10) {
        doc.text('... and ' + (payments.length - 10) + ' more payments', 25, yPos);
      }
    }
    
    // Footer
    const pageCount = doc.internal.pages.length - 1;
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text('Page ' + i + ' of ' + pageCount, 105, 285, { align: 'center' });
      doc.text('Generated on ' + formatDate(new Date().toISOString()), 105, 290, { align: 'center' });
    }
    
    // Save PDF
    const filename = `Statement_${customer.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
    
    return true;
  } catch(err) {
    logError('generatePDFStatement', err);
    return false;
  }
}

