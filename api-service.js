/**
 * BusinessApi Service - Ready to use in your UI
 * Copy this file to your UI project and use it
 */

class BusinessApiService {
  constructor(baseUrl = 'https://businessmanagementapi.onrender.com/api') {
    this.baseUrl = baseUrl;
  }

  /**
   * Get authorization headers with token
   */
  getHeaders() {
    const token = localStorage.getItem('token');
    if (!token) {
      // Redirect to login if no token
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return {};
    }

    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Generic API call method
   */
  async apiCall(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: this.getHeaders()
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      const data = await response.json();

      // Handle 401 Unauthorized - token expired
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userCode');
        localStorage.removeItem('userType');
        window.location.href = '/login';
        return null;
      }

      // Handle API errors
      if (!response.ok || !data.status) {
        const errorMessage = data.message || data.errors?.join(', ') || 'Request failed';
        throw new Error(errorMessage);
      }

      return data.body;
    } catch (error) {
      console.error(`API Error (${method} ${endpoint}):`, error);
      throw error;
    }
  }

  // ==================== AUTHENTICATION ====================

  /**
   * Login
   * @param {string} username - Username/Email
   * @param {string} password - Password
   * @returns {Promise<Object>} User data with token
   */
  async login(username, password) {
    const user = await this.apiCall('/auth/Login', 'POST', { username, password });
    
    if (user) {
      // Store user data
      localStorage.setItem('token', user.token);
      localStorage.setItem('userCode', user.userCode);
      localStorage.setItem('userType', user.userType);
      localStorage.setItem('userName', user.userName);
      localStorage.setItem('fname', user.fname);
      localStorage.setItem('lname', user.lname);
      localStorage.setItem('organizationName', user.organizationName);
      localStorage.setItem('organizationLogo', user.organizationLogo || '');
      localStorage.setItem('userEmail', user.userEmail);
    }
    
    return user;
  }

  /**
   * Logout - Clear stored data
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userCode');
    localStorage.removeItem('userType');
    localStorage.removeItem('userName');
    localStorage.removeItem('fname');
    localStorage.removeItem('lname');
    localStorage.removeItem('organizationName');
    localStorage.removeItem('organizationLogo');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
  }

  /**
   * Get current user info from localStorage
   */
  getCurrentUser() {
    return {
      userCode: localStorage.getItem('userCode'),
      userType: localStorage.getItem('userType'),
      userName: localStorage.getItem('userName'),
      fname: localStorage.getItem('fname'),
      lname: localStorage.getItem('lname'),
      organizationName: localStorage.getItem('organizationName'),
      organizationLogo: localStorage.getItem('organizationLogo'),
      userEmail: localStorage.getItem('userEmail')
    };
  }

  // ==================== CUSTOMERS ====================

  /**
   * Get all customers
   * @returns {Promise<Array>} Array of customers
   */
  async getCustomers() {
    return await this.apiCall('/customers');
  }

  /**
   * Get customer by ID
   * @param {number} id - Customer ID
   * @returns {Promise<Object>} Customer data
   */
  async getCustomer(id) {
    return await this.apiCall(`/customers/${id}`);
  }

  /**
   * Create customer
   * @param {Object} customerData - Customer data
   * @returns {Promise<Object>} Created customer
   */
  async createCustomer(customerData) {
    return await this.apiCall('/customers', 'POST', customerData);
  }

  /**
   * Update customer
   * @param {number} id - Customer ID
   * @param {Object} customerData - Updated customer data
   * @returns {Promise<Object>} Updated customer
   */
  async updateCustomer(id, customerData) {
    return await this.apiCall(`/customers/${id}`, 'PUT', customerData);
  }

  /**
   * Delete customer
   * @param {number} id - Customer ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteCustomer(id) {
    return await this.apiCall(`/customers/${id}`, 'DELETE');
  }

  // ==================== BILLS ====================

  /**
   * Get all bills
   * @returns {Promise<Array>} Array of bills
   */
  async getBills() {
    return await this.apiCall('/bills');
  }

  /**
   * Get bill by ID
   * @param {number} id - Bill ID
   * @returns {Promise<Object>} Bill data
   */
  async getBill(id) {
    return await this.apiCall(`/bills/${id}`);
  }

  /**
   * Get bills by customer ID
   * @param {number} customerId - Customer ID
   * @returns {Promise<Array>} Array of bills
   */
  async getBillsByCustomer(customerId) {
    return await this.apiCall(`/bills/customer/${customerId}`);
  }

  /**
   * Create bill
   * @param {Object} billData - Bill data
   * @returns {Promise<Object>} Created bill
   */
  async createBill(billData) {
    return await this.apiCall('/bills', 'POST', billData);
  }

  /**
   * Update bill
   * @param {number} id - Bill ID
   * @param {Object} billData - Updated bill data
   * @returns {Promise<Object>} Updated bill
   */
  async updateBill(id, billData) {
    return await this.apiCall(`/bills/${id}`, 'PUT', billData);
  }

  /**
   * Update bill status
   * @param {number} id - Bill ID
   * @param {string} status - Status: "Paid", "Unpaid", "Partial"
   * @returns {Promise<Object>} Updated bill
   */
  async updateBillStatus(id, status) {
    return await this.apiCall(`/bills/${id}/status`, 'PUT', {
      billId: id,
      status: status
    });
  }

  /**
   * Delete bill
   * @param {number} id - Bill ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteBill(id) {
    return await this.apiCall(`/bills/${id}`, 'DELETE');
  }

  // ==================== PAYMENTS ====================

  /**
   * Get all payments
   * @returns {Promise<Array>} Array of payments
   */
  async getPayments() {
    return await this.apiCall('/payments');
  }

  /**
   * Get payment by ID
   * @param {number} id - Payment ID
   * @returns {Promise<Object>} Payment data with linked bills
   */
  async getPayment(id) {
    return await this.apiCall(`/payments/${id}`);
  }

  /**
   * Get payments by bill ID
   * @param {number} billId - Bill ID
   * @returns {Promise<Array>} Array of payments
   */
  async getPaymentsByBill(billId) {
    return await this.apiCall(`/payments/bill/${billId}`);
  }

  /**
   * Create payment
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Created payment
   */
  async createPayment(paymentData) {
    return await this.apiCall('/payments', 'POST', paymentData);
  }

  /**
   * Update payment status (cleared)
   * @param {number} paymentId - Payment ID
   * @param {boolean} cleared - Cleared status
   * @returns {Promise<Object>} Updated payment
   */
  async updatePaymentStatus(paymentId, cleared) {
    return await this.apiCall('/payments/update-status', 'PUT', {
      paymentId: paymentId,
      cleared: cleared
    });
  }

  /**
   * Delete payment
   * @param {number} id - Payment ID
   * @returns {Promise<boolean>} Success status
   */
  async deletePayment(id) {
    return await this.apiCall(`/payments/${id}`, 'DELETE');
  }

  // ==================== REPORTS ====================

  /**
   * Get outstanding bills
   * @returns {Promise<Array>} Array of outstanding bills
   */
  async getOutstandingBills() {
    return await this.apiCall('/reports/outstanding');
  }

  /**
   * Get upcoming cheques
   * @returns {Promise<Array>} Array of upcoming cheques
   */
  async getUpcomingCheques() {
    return await this.apiCall('/reports/cheques/upcoming');
  }

  // ==================== SUPER ADMIN ====================

  /**
   * Get all admins (Super Admin only)
   * @returns {Promise<Array>} Array of admins
   */
  async getAdmins() {
    return await this.apiCall('/superadmin/admins');
  }

  /**
   * Get admin by ID (Super Admin only)
   * @param {number} id - Admin ID
   * @returns {Promise<Object>} Admin data
   */
  async getAdmin(id) {
    return await this.apiCall(`/superadmin/admins/${id}`);
  }

  /**
   * Create admin (Super Admin only)
   * @param {Object} adminData - Admin data
   * @returns {Promise<Object>} Created admin
   */
  async createAdmin(adminData) {
    return await this.apiCall('/superadmin/admins', 'POST', adminData);
  }

  /**
   * Update admin (Super Admin only)
   * @param {number} id - Admin ID
   * @param {Object} adminData - Updated admin data
   * @returns {Promise<Object>} Updated admin
   */
  async updateAdmin(id, adminData) {
    return await this.apiCall(`/superadmin/admins/${id}`, 'PUT', adminData);
  }

  /**
   * Suspend admin (Super Admin only)
   * @param {number} id - Admin ID
   * @returns {Promise<boolean>} Success status
   */
  async suspendAdmin(id) {
    return await this.apiCall(`/superadmin/admins/${id}/suspend`, 'PUT');
  }

  /**
   * Activate admin (Super Admin only)
   * @param {number} id - Admin ID
   * @returns {Promise<boolean>} Success status
   */
  async activateAdmin(id) {
    return await this.apiCall(`/superadmin/admins/${id}/activate`, 'PUT');
  }

  /**
   * Get all subscriptions (Super Admin only)
   * @returns {Promise<Array>} Array of subscriptions
   */
  async getSubscriptions() {
    return await this.apiCall('/superadmin/subscriptions');
  }

  /**
   * Get subscription by admin ID (Super Admin only)
   * @param {number} adminId - Admin ID
   * @returns {Promise<Object>} Subscription data
   */
  async getSubscriptionByAdmin(adminId) {
    return await this.apiCall(`/superadmin/subscriptions/admin/${adminId}`);
  }

  /**
   * Create subscription (Super Admin only)
   * @param {Object} subscriptionData - Subscription data
   * @returns {Promise<Object>} Created subscription
   */
  async createSubscription(subscriptionData) {
    return await this.apiCall('/superadmin/subscriptions', 'POST', subscriptionData);
  }

  /**
   * Update subscription (Super Admin only)
   * @param {Object} subscriptionData - Updated subscription data
   * @returns {Promise<Object>} Updated subscription
   */
  async updateSubscription(subscriptionData) {
    return await this.apiCall('/superadmin/subscriptions', 'PUT', subscriptionData);
  }

  /**
   * Get platform statistics (Super Admin only)
   * @returns {Promise<Object>} Platform statistics
   */
  async getStatistics() {
    return await this.apiCall('/superadmin/statistics');
  }

  // ==================== ADMIN ====================

  /**
   * Get all sub users (Admin only)
   * @returns {Promise<Array>} Array of sub users
   */
  async getSubUsers() {
    return await this.apiCall('/admin/subusers');
  }

  /**
   * Get sub user by ID (Admin only)
   * @param {number} id - Sub User ID
   * @returns {Promise<Object>} Sub User data
   */
  async getSubUser(id) {
    return await this.apiCall(`/admin/subusers/${id}`);
  }

  /**
   * Create sub user (Admin only)
   * @param {Object} subUserData - Sub User data
   * @returns {Promise<Object>} Created sub user
   */
  async createSubUser(subUserData) {
    return await this.apiCall('/admin/subusers', 'POST', subUserData);
  }

  /**
   * Update sub user (Admin only)
   * @param {number} id - Sub User ID
   * @param {Object} subUserData - Updated sub user data
   * @returns {Promise<Object>} Updated sub user
   */
  async updateSubUser(id, subUserData) {
    return await this.apiCall(`/admin/subusers/${id}`, 'PUT', subUserData);
  }

  /**
   * Suspend sub user (Admin only)
   * @param {number} id - Sub User ID
   * @returns {Promise<boolean>} Success status
   */
  async suspendSubUser(id) {
    return await this.apiCall(`/admin/subusers/${id}/suspend`, 'PUT');
  }

  /**
   * Activate sub user (Admin only)
   * @param {number} id - Sub User ID
   * @returns {Promise<boolean>} Success status
   */
  async activateSubUser(id) {
    return await this.apiCall(`/admin/subusers/${id}/activate`, 'PUT');
  }

  /**
   * Get own subscription (Admin only)
   * @returns {Promise<Object>} Subscription data with usage stats
   */
  async getOwnSubscription() {
    return await this.apiCall('/admin/subscription');
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BusinessApiService;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.BusinessApiService = BusinessApiService;
}

