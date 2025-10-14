import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWallet } from '../useWallet'
import { useWalletStore } from '@/stores/walletStore'

vi.mock('@/stores/walletStore')

describe('useWallet Composable', () => {
  let mockStore
  let wallet

  beforeEach(() => {
    setActivePinia(createPinia())
    
    // Create comprehensive mock store
    mockStore = {
      // Reactive state
      wallet: { balance: 100000, availableBalance: 90000 },
      transactions: [],
      isLoading: false,
      isLoadingBalance: false,
      isLoadingTransactions: false,
      isProcessingPayment: false,
      error: null,
      pagination: { currentPage: 1, hasNextPage: false },
      
      // Methods
      fetchBalance: vi.fn(),
      checkBalance: vi.fn(),
      payOrder: vi.fn(),
      validateOrderPayment: vi.fn(),
      startAutoRefresh: vi.fn(),
      clearError: vi.fn(),
      fetchTransactions: vi.fn(),
      searchTransactions: vi.fn(),
      filterTransactionsByType: vi.fn(),
      resetStore: vi.fn()
    }

    // Mock the store hook
    vi.mocked(useWalletStore).mockReturnValue(mockStore)
    
    // Initialize composable
    wallet = useWallet()
  })

  describe('Initialization', () => {
    it('should initialize with store data', () => {
      expect(wallet.balance.value).toBe(100000)
      expect(wallet.availableBalance.value).toBe(90000)
      expect(wallet.isLoading.value).toBe(false)
    })
  })

  describe('Balance Operations', () => {
    it('should fetch balance with default options', async () => {
      mockStore.fetchBalance.mockResolvedValue({ success: true })

      const result = await wallet.fetchBalance()

      expect(mockStore.fetchBalance).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })

    it('should fetch balance with silent option', async () => {
      mockStore.fetchBalance.mockResolvedValue({ success: true })

      const result = await wallet.fetchBalance({ silent: true })

      expect(mockStore.fetchBalance).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })

    it('should check sufficient balance', async () => {
      mockStore.checkBalance.mockResolvedValue({ 
        success: true, 
        sufficient: true 
      })

      const result = await wallet.checkSufficientBalance(50000)

      expect(mockStore.checkBalance).toHaveBeenCalledWith(50000)
      expect(result.success).toBe(true)
    })

    it('should handle insufficient balance with warning', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      mockStore.checkBalance.mockResolvedValue({ 
        success: false, 
        error: 'Insufficient balance' 
      })

      const result = await wallet.checkSufficientBalance(150000)

      expect(result.success).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Insufficient balance:', 'Insufficient balance')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Payment Operations', () => {
    it('should validate payment successfully', async () => {
      mockStore.checkBalance.mockResolvedValue({ success: true })
      mockStore.validatePayment = vi.fn().mockResolvedValue({ success: true })

      const result = await wallet.validatePayment(50000, 'order-123')

      expect(mockStore.checkBalance).toHaveBeenCalledWith(50000)
      expect(result.success).toBe(true)
    })

    it('should handle insufficient balance in validation', async () => {
      mockStore.checkBalance.mockResolvedValue({ 
        success: false, 
        error: 'Insufficient balance' 
      })

      const result = await wallet.validatePayment(150000)

      expect(result).toEqual({
        success: false,
        error: 'Insufficient balance',
        code: 'INSUFFICIENT_BALANCE'
      })
    })

    it('should process order payment with refresh', async () => {
      mockStore.validateOrderPayment.mockResolvedValue({ success: true })
      mockStore.payOrder.mockResolvedValue({ success: true })
      
      // Mock refresh methods
      const refreshBalance = vi.fn().mockResolvedValue({ success: true })
      const refreshTransactions = vi.fn().mockResolvedValue({ success: true })
      wallet.refreshBalance = refreshBalance
      wallet.refreshTransactions = refreshTransactions

      const result = await wallet.payOrder('order-123', '123456')

      expect(mockStore.validateOrderPayment).toHaveBeenCalledWith('order-123')
      expect(mockStore.payOrder).toHaveBeenCalledWith('order-123', '123456')
      expect(result.success).toBe(true)
    })
  })

  describe('Transaction Operations', () => {
    it('should fetch transactions with default params', async () => {
      mockStore.fetchTransactions.mockResolvedValue({ success: true })

      const result = await wallet.fetchTransactions()

      expect(mockStore.fetchTransactions).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        status: 'completed',
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })
      expect(result.success).toBe(true)
    })

    it('should search transactions', async () => {
      mockStore.searchTransactions.mockResolvedValue({ 
        success: true,
        data: { transactions: [] }
      })

      const result = await wallet.searchTransactions('coffee')

      expect(mockStore.searchTransactions).toHaveBeenCalledWith('coffee')
      expect(result.success).toBe(true)
    })

    it('should handle empty search term', async () => {
      mockStore.fetchTransactions.mockResolvedValue({ success: true })

      const result = await wallet.searchTransactions('')

      expect(mockStore.fetchTransactions).toHaveBeenCalled()
    })
  })

  describe('Error Handling', () => {
    it('should handle API errors gracefully', async () => {
      const error = new Error('Network error')
      mockStore.fetchBalance.mockRejectedValue(error)

      const result = await wallet.fetchBalance()

      expect(result).toEqual({
        success: false,
        error: { 
          message: 'Network error',
          details: error
        }
      })
    })

    it('should clear errors', () => {
      wallet.clearError()
      expect(mockStore.clearError).toHaveBeenCalled()
    })
  })

  describe('Wallet Management', () => {
    it('should initialize wallet with default options', async () => {
      mockStore.fetchBalance.mockResolvedValue({ success: true })
      mockStore.fetchTransactions.mockResolvedValue({ success: true })

      const result = await wallet.initializeWallet()

      expect(result.success).toBe(true)
    })

    it('should initialize with auto-refresh', async () => {
      mockStore.fetchBalance.mockResolvedValue({ success: true })
      mockStore.fetchTransactions.mockResolvedValue({ success: true })
      mockStore.startAutoRefresh.mockReturnValue(() => {})

      const result = await wallet.initializeWallet({
        autoRefresh: true,
        refreshInterval: 15000
      })

      expect(result.success).toBe(true)
      expect(mockStore.startAutoRefresh).toHaveBeenCalledWith(15000)
    })

    it('should reset wallet', () => {
      wallet.resetWallet()
      expect(mockStore.resetStore).toHaveBeenCalled()
    })
  })
})