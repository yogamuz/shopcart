// composables/useWallet.js
import { computed, ref, nextTick } from 'vue'
import { useWalletStore } from '@/stores/walletStore'
import walletService from '@/services/walletService'

export const useWallet = () => {
  const walletStore = useWalletStore()

  // Internal state for composable-specific operations
  const internalLoading = ref(false)
  const lastRefreshTime = ref(null)
  
  // Auto-refresh cleanup function
  let autoRefreshCleanup = null

  // Computed properties from store
  const wallet = computed(() => walletStore.wallet)
  const balance = computed(() => walletStore.wallet.balance)
  const availableBalance = computed(() => walletStore.wallet.availableBalance)
  const pendingBalance = computed(() => walletStore.wallet.pendingBalance)
  const transactions = computed(() => walletStore.transactions)
  const recentTransactions = computed(() => walletStore.recentTransactions)
  const statistics = computed(() => walletStore.statistics)
  const pagination = computed(() => walletStore.pagination)
  const error = computed(() => walletStore.error)

  // Loading states
  const isLoading = computed(() => walletStore.isLoading || internalLoading.value)
  const isLoadingBalance = computed(() => walletStore.isLoadingBalance)
  const isLoadingTransactions = computed(() => walletStore.isLoadingTransactions)
  const isProcessingPayment = computed(() => walletStore.isProcessingPayment)
  const isSettingPin = computed(() => walletStore.isSettingPin)

  // Wallet status
  const hasBalance = computed(() => walletStore.hasBalance)
  const isWalletActive = computed(() => walletStore.isWalletActive)
  const pinStatus = computed(() => walletStore.pinStatus)

  // Enhanced balance operations
  const fetchBalance = async (options = {}) => {
    const { silent = false, force = false } = options

    if (!silent) internalLoading.value = true

    try {
      const result = await walletStore.fetchBalance()
      
      if (result.success) {
        lastRefreshTime.value = new Date()
      }

      return result
    } finally {
      if (!silent) internalLoading.value = false
    }
  }
const checkSufficientBalance = async (amount, options = {}) => {
  const { showError = true } = options

  console.log('🔍 Checking balance for amount:', amount)
  
  try {
    const result = await walletStore.checkBalance(amount)
    
    console.log('🔍 Check balance result:', result)
    console.log('🔍 Result success:', result.success)
    console.log('🔍 Result error:', result.error)
    
    if (!result.success && showError) {
      console.warn('❌ Insufficient balance:', result.error)
    }

    return result
  } catch (error) {
    console.error('❌ Balance check failed:', error)
    return { success: false, error: error.message }
  }
}

  const refreshBalance = async () => {
    return await fetchBalance({ silent: true, force: true })
  }

  // Enhanced transaction operations
  const fetchTransactions = async (params = {}) => {
    const defaultParams = {
      page: 1,
      limit: 20,
      status: 'completed',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      ...params
    }

    return await walletStore.fetchTransactions(defaultParams)
  }

  const loadMoreTransactions = async () => {
    return await walletStore.loadMoreTransactions()
  }

  const refreshTransactions = async () => {
    return await walletStore.refreshTransactions()
  }

  const searchTransactions = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return await fetchTransactions()
    }

    return await walletStore.searchTransactions(searchTerm.trim())
  }

  // Transaction filtering helpers
  const getTransactionsByType = (type) => {
    return walletStore.filterTransactionsByType(type)
  }

  const getTransactionsByStatus = (status) => {
    return walletStore.filterTransactionsByStatus(status)
  }

  const getTransactionsByDateRange = (startDate, endDate) => {
    return walletStore.filterTransactionsByDateRange(startDate, endDate)
  }

  const getTransactionById = (transactionId) => {
    return walletStore.getTransactionById(transactionId)
  }

  // Enhanced payment operations
  const validatePayment = async (amount, orderId = null) => {
    try {
      // First check if we have sufficient balance
      const balanceCheck = await checkSufficientBalance(amount, { showError: false })
      
      if (!balanceCheck.success) {
        return {
          success: false,
          error: 'Insufficient balance',
          code: 'INSUFFICIENT_BALANCE'
        }
      }

      // Then validate with server
      return await walletStore.validatePayment(amount, orderId)
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Payment validation failed'
      }
    }
  }

const validateOrderPayment = async (orderId) => {
    try {
      return await walletStore.validateOrderPayment(orderId)
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Order payment validation failed'
      }
    }
  }


  const payOrder = async (orderId, pin, options = {}) => {
    const { refreshAfterPayment = true } = options

    try {
      // Validate order payment first
      const validation = await walletStore.validateOrderPayment(orderId)
      
      if (!validation.success) {
        return validation
      }

      // Process payment
      const result = await walletStore.payOrder(orderId, pin)
      
      if (result.success && refreshAfterPayment) {
        // Refresh wallet data after successful payment
        await nextTick()
        await Promise.all([
          refreshBalance(),
          refreshTransactions()
        ])
      }

      return result
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Payment processing failed'
      }
    }
  }

  // PIN management
  const setWalletPin = async (pin, currentPin = null) => {
    try {
      return await walletStore.setPin(pin, currentPin)
    } catch (error) {
      return {
        success: false,
        error: error.message || 'PIN setup failed'
      }
    }
  }

  const changeWalletPin = async (currentPin, newPin, confirmPin) => {
  try {
    if (newPin !== confirmPin) {
      return {
        success: false,
        error: 'PINs do not match'
      }
    }

    if (newPin.length !== 6 || !(/^\d{6}$/.test(newPin))) {
      return {
        success: false,
        error: 'PIN must be 6 digits'
      }
    }

    // currentPin bisa null (untuk first-time setup)
    // atau harus 6 digit (untuk change existing PIN)
    if (currentPin && (currentPin.length !== 6 || !(/^\d{6}$/.test(currentPin)))) {
      return {
        success: false,
        error: 'Current PIN must be 6 digits'
      }
    }

    return await walletStore.setPin(newPin, currentPin)
  } catch (error) {
    return {
      success: false,
      error: error.message || 'PIN operation failed'
    }
  }
}

  const isPinRequired = computed(() => {
    return !pinStatus.value.isSet || pinStatus.value.needsVerification
  })

  // Statistics and analytics
  const fetchStats = async (period = '30d') => {
    return await walletStore.fetchStats(period)
  }

  const getMonthlyTransactionSummary = computed(() => {
    return walletStore.getMonthlyTransactionSummary
  })

  const getTransactionTypesSummary = computed(() => {
    return walletStore.getTransactionTypesSummary
  })

  // Utility methods
  const formatCurrency = (amount) => {
    return walletService.formatCurrency(amount)
  }

  const formatTransactionType = (type) => {
    return walletService.formatTransactionType(type)
  }

  const getTransactionTypeColor = (type) => {
    return walletService.getTransactionTypeColor(type)
  }

  const getTransactionStatus = (status) => {
    return walletService.getTransactionStatus(status)
  }

  const getTransactionStatusColor = (status) => {
    return walletService.getTransactionStatusColor(status)
  }

  const isIncomeTransaction = (transaction) => {
    return walletService.isIncomeTransaction(transaction)
  }

  const getAbsoluteAmount = (amount) => {
    return walletService.getAbsoluteAmount(amount)
  }

  // Enhanced wallet refresh with debounce
  const refreshWallet = async (options = {}) => {
    const { includeStats = false, debounce = 1000 } = options

    // Simple debounce
    if (refreshWallet._timeout) {
      clearTimeout(refreshWallet._timeout)
    }

    return new Promise((resolve) => {
      refreshWallet._timeout = setTimeout(async () => {
        try {
          const promises = [
            walletStore.fetchBalance(),
            walletStore.fetchTransactions({ page: 1 })
          ]

          if (includeStats) {
            promises.push(walletStore.fetchStats())
          }

          const results = await Promise.allSettled(promises)
          
          const success = results.every(result => 
            result.status === 'fulfilled' && result.value?.success
          )

          lastRefreshTime.value = new Date()
          
          resolve({
            success,
            results: results.map(r => r.status === 'fulfilled' ? r.value : { success: false, error: r.reason })
          })
        } catch (error) {
          resolve({
            success: false,
            error: error.message
          })
        }
      }, debounce)
    })
  }

  // Auto-refresh functionality
  const startAutoRefresh = (interval = 30000) => { // 30 seconds default
    stopAutoRefresh() // Clear any existing auto-refresh

    autoRefreshCleanup = walletStore.startAutoRefresh(interval)
    
    return autoRefreshCleanup
  }

  const stopAutoRefresh = () => {
    if (autoRefreshCleanup) {
      autoRefreshCleanup()
      autoRefreshCleanup = null
    }
  }

  // Error handling helpers
  const clearError = () => {
    walletStore.clearError()
  }

  const hasError = computed(() => {
    return error.value !== null
  })

  const getErrorMessage = computed(() => {
    return error.value?.message || null
  })

  const isNetworkError = computed(() => {
    return error.value?.statusCode === 0 || error.value?.code === 'NETWORK_ERROR'
  })

  const isAuthError = computed(() => {
    return error.value?.statusCode === 401 || error.value?.code === 'UNAUTHORIZED'
  })

  const isServerError = computed(() => {
    return error.value?.statusCode >= 500
  })

  // Reset and cleanup
  const resetWallet = () => {
    stopAutoRefresh()
    walletStore.resetStore()
    lastRefreshTime.value = null
    internalLoading.value = false
  }

  // Lifecycle helpers
  const initializeWallet = async (options = {}) => {
    const { 
      autoRefresh = false, 
      refreshInterval = 30000,
      fetchStats = false 
    } = options

    try {
      internalLoading.value = true

      // Initial data fetch
      await refreshWallet({ includeStats: fetchStats })

      // Setup auto-refresh if requested
      if (autoRefresh) {
        startAutoRefresh(refreshInterval)
      }

      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Failed to initialize wallet' 
      }
    } finally {
      internalLoading.value = false
    }
  }

  // Return composable interface
  return {
    // Reactive data
    wallet,
    balance,
    availableBalance,
    pendingBalance,
    transactions,
    recentTransactions,
    statistics,
    pagination,
    error,
    lastRefreshTime,

    // Loading states
    isLoading,
    isLoadingBalance,
    isLoadingTransactions,
    isProcessingPayment,
    isSettingPin,

    // Wallet status
    hasBalance,
    isWalletActive,
    pinStatus,
    isPinRequired,

    // Core operations
    fetchBalance,
    checkSufficientBalance,
    refreshBalance,
    fetchTransactions,
    loadMoreTransactions,
    refreshTransactions,
    searchTransactions,

    // Transaction operations
    getTransactionsByType,
    getTransactionsByStatus,
    getTransactionsByDateRange,
    getTransactionById,

    // Payment operations
    validatePayment,
    validateOrderPayment,
    payOrder,
    setWalletPin,
    changeWalletPin,

    // Analytics
    fetchStats,
    getMonthlyTransactionSummary,
    getTransactionTypesSummary,

    // Utility methods
    formatCurrency,
    formatTransactionType,
    getTransactionTypeColor,
    getTransactionStatus,
    getTransactionStatusColor,
    isIncomeTransaction,
    getAbsoluteAmount,

    // Enhanced features
    refreshWallet,
    startAutoRefresh,
    stopAutoRefresh,
    initializeWallet,

    // Error handling
    clearError,
    hasError,
    getErrorMessage,
    isNetworkError,
    isAuthError,
    isServerError,

    // Cleanup
    resetWallet
  }
}