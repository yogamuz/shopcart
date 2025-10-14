// services/walletService.js
import { useApiClient } from '@/composables/useApiClient'
import { useAuthStore } from '@/stores/authStore'

class WalletService {
  constructor() {
    this.authStore = useAuthStore()
  }

  // Get fresh API client with current token
  getApiClient() {
    return useApiClient(this.authStore.user?.accessToken)
  }

  /**
   * Get wallet balance
   * @returns {Promise<Object>} API response
   */
  async getBalance() {
    try {
      const api = this.getApiClient()
      const response = await api.get('/api/wallet/balance')

      return {
        success: true,
        data: response.data,
        message: response.message || 'Balance retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get balance',
        details: error.data || null,
        statusCode: error.status || 0
      }
    }
  }

  /**
   * Get wallet transaction history
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=20] - Items per page
   * @param {string} [params.type] - Transaction type filter
   * @param {string} [params.status='completed'] - Transaction status
   * @param {string} [params.dateFrom] - Start date filter
   * @param {string} [params.dateTo] - End date filter
   * @param {string} [params.sortBy='createdAt'] - Sort field
   * @param {string} [params.sortOrder='desc'] - Sort order
   * @returns {Promise<Object>} API response
   */
  async getTransactions(params = {}) {
    try {
      const api = this.getApiClient()
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
        status: params.status || 'completed',
        sortBy: params.sortBy || 'createdAt',
        sortOrder: params.sortOrder || 'desc'
      })

      if (params.type) queryParams.append('type', params.type)
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom)
      if (params.dateTo) queryParams.append('dateTo', params.dateTo)

      const response = await api.get(`/api/wallet/transactions?${queryParams}`)

      return {
        success: true,
        data: response.data,
        message: response.message || 'Transactions retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get transactions',
        details: error.data || null,
        statusCode: error.status || 0
      }
    }
  }

  /**
   * Get wallet statistics
   * @param {string} [period='30d'] - Statistics period
   * @returns {Promise<Object>} API response
   */
  async getStats(period = '30d') {
    try {
      const api = this.getApiClient()
      const response = await api.get(`/api/wallet/statistics?period=${period}`)

      return {
        success: true,
        data: response.data,
        message: response.message || 'Statistics retrieved successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get statistics',
        details: error.data || null,
        statusCode: error.status || 0
      }
    }
  }

  /**
   * Check if user has sufficient balance
   * @param {number} amount - Amount to check
   * @returns {Promise<Object>} API response
   */
// Di walletService.js, modifikasi checkBalance method
async checkBalance(amount) {
  try {
    if (!amount || amount <= 0) {
      throw new Error('Invalid amount')
    }

    const api = this.getApiClient()
    // Tambahkan cache-busting parameter
    const timestamp = Date.now()
    const response = await api.get(`/api/wallet/balance/${amount}/validation?t=${timestamp}`)

    return {
      success: true,
      data: response.data,
      message: response.message || 'Balance check completed'
    }
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Failed to check balance',
      details: error.data || null,
      statusCode: error.status || 0
    }
  }
}

  /**
   * Validate payment before processing
   * @param {number} amount - Payment amount
   * @param {string} [orderId] - Order ID
   * @returns {Promise<Object>} API response
   */
  async validatePayment(amount, orderId) {
    try {
      const api = this.getApiClient()
      const payload = { amount }
      if (orderId) payload.orderId = orderId

      const response = await api.post('/api/wallet/payment/validation', payload)

      return {
        success: true,
        data: response.data,
        message: response.message || 'Payment validation completed'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Payment validation failed',
        details: error.data || null,
        statusCode: error.status || 0
      }
    }
  }

  /**
   * Set or update wallet PIN
   * @param {string} pin - New 6-digit PIN
   * @param {string} [currentPin] - Current PIN (required for updates)
   * @returns {Promise<Object>} API response
   */
  async setPin(pin, currentPin) {
    try {
      if (!pin || !/^\d{6}$/.test(pin)) {
        throw new Error('PIN must be exactly 6 digits')
      }

      const api = this.getApiClient()
      const payload = { pin }
      if (currentPin) payload.currentPin = currentPin

      const response = await api.patch('/api/wallet/pin', payload)

      return {
        success: true,
        data: response.data,
        message: response.message || 'PIN set successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to set PIN',
        details: error.data || null,
        statusCode: error.status || 0
      }
    }
  }

  /**
   * Pay for order using wallet
   * @param {string} orderId - Order ID
   * @param {string} pin - Wallet PIN
   * @returns {Promise<Object>} API response
   */
  async payOrder(orderId, pin) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required')
      }

      if (!pin || !/^\d{6}$/.test(pin)) {
        throw new Error('PIN must be exactly 6 digits')
      }

      const api = this.getApiClient()
      const response = await api.post(`/api/wallet/${orderId}/payment`, { pin })

      return {
        success: true,
        data: response.data,
        message: response.message || 'Payment processed successfully'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Payment failed',
        details: error.data || null,
        statusCode: error.status || 0,
        code: error.code || null
      }
    }
  }

  /**
   * Validate order payment before processing
   * @param {string} orderId - Order ID
   * @returns {Promise<Object>} API response
   */
  async validateOrderPayment(orderId) {
    try {
      if (!orderId) {
        throw new Error('Order ID is required')
      }

      const api = this.getApiClient()
      const response = await api.get(`/api/wallet/${orderId}/payment/validate`)

      return {
        success: true,
        data: response.data,
        message: response.message || 'Order payment validation completed'
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Order payment validation failed',
        details: error.data || null,
        statusCode: error.status || 0
      }
    }
  }
/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

  /**
   * Format transaction type for display
   * @param {string} type - Transaction type
   * @returns {string} Formatted type
   */
  formatTransactionType(type) {
    const typeLabels = {
      payment: 'Pembayaran',
      receive: 'Penerimaan',
      receive_pending: 'Penerimaan Tertunda',
      receive_confirmed: 'Penerimaan Dikonfirmasi',
      refund: 'Pengembalian Dana',
      topup: 'Top Up',
      withdraw: 'Penarikan'
    }
    return typeLabels[type] || type
  }

  /**
   * Get transaction type color for UI
   * @param {string} type - Transaction type
   * @returns {string} Color class
   */
  getTransactionTypeColor(type) {
    const typeColors = {
      payment: 'text-red-600',
      receive: 'text-green-600',
      receive_pending: 'text-orange-600',
      receive_confirmed: 'text-green-600',
      refund: 'text-blue-600',
      topup: 'text-green-600',
      withdraw: 'text-red-600'
    }
    return typeColors[type] || 'text-gray-600'
  }

  /**
   * Get transaction status text
   * @param {string} status - Transaction status
   * @returns {string} Status text
   */
  getTransactionStatus(status) {
    const statusLabels = {
      completed: 'Success',
      pending: 'Pending',
      failed: 'Failed',
      cancelled: 'Cancelled'
    }
    return statusLabels[status] || status
  }

  /**
   * Get transaction status color
   * @param {string} status - Transaction status
   * @returns {string} Color class
   */
  getTransactionStatusColor(status) {
    const statusColors = {
      completed: 'text-green-600',
      pending: 'text-orange-600',
      failed: 'text-red-600',
      cancelled: 'text-gray-600'
    }
    return statusColors[status] || 'text-gray-600'
  }

  /**
   * Check if transaction is income or expense
   * @param {Object} transaction - Transaction object
   * @returns {boolean} True if income, false if expense
   */
  isIncomeTransaction(transaction) {
    return transaction.amount > 0
  }

  /**
   * Get absolute amount for display
   * @param {number} amount - Transaction amount
   * @returns {number} Absolute amount
   */
  getAbsoluteAmount(amount) {
    return Math.abs(amount)
  }
}

// Export singleton instance
export default new WalletService()