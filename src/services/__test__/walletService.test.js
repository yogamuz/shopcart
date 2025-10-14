// src/services/__tests__/walletService.test.js
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Mock authStore SEBELUM import walletService
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: { accessToken: 'test-token' }
  })
}))

// Import setelah mock
import walletService from '../walletService'

describe('WalletService', () => {
  let mockApiClient

  beforeEach(() => {
    setActivePinia(createPinia())
    
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn()
    }
    
    vi.spyOn(walletService, 'getApiClient').mockReturnValue(mockApiClient)
  })

  describe('Utility Methods', () => {
    it('should format currency correctly', () => {
      const formatted = walletService.formatCurrency(100000)
      expect(formatted).toContain('100')
      expect(formatted).toContain('Rp')
    })

    it('should handle negative amounts', () => {
      const formatted = walletService.formatCurrency(-50000)
      expect(formatted).toContain('50')
      expect(formatted).toMatch(/^-/)
    })

    it('should format transaction types', () => {
      expect(walletService.formatTransactionType('payment')).toBe('Pembayaran')
      expect(walletService.formatTransactionType('receive')).toBe('Penerimaan')
      expect(walletService.formatTransactionType('topup')).toBe('Top Up')
    })

    it('should get transaction colors', () => {
      expect(walletService.getTransactionTypeColor('payment')).toBe('text-red-600')
      expect(walletService.getTransactionTypeColor('receive')).toBe('text-green-600')
    })

    it('should identify income transactions', () => {
      expect(walletService.isIncomeTransaction({ amount: 100000 })).toBe(true)
      expect(walletService.isIncomeTransaction({ amount: -50000 })).toBe(false)
    })

    it('should get absolute amount', () => {
      expect(walletService.getAbsoluteAmount(100000)).toBe(100000)
      expect(walletService.getAbsoluteAmount(-50000)).toBe(50000)
    })
  })

  describe('Input Validation', () => {
    it('should validate PIN format', async () => {
      const result = await walletService.setPin('123')
      expect(result.success).toBe(false)
      expect(result.error).toBe('PIN must be exactly 6 digits')
    })

    it('should validate payOrder parameters', async () => {
      const result = await walletService.payOrder('', '123456')
      expect(result.success).toBe(false)
      expect(result.error).toBe('Order ID is required')
    })

    it('should validate checkBalance amount', async () => {
      const result = await walletService.checkBalance(0)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Invalid amount')
    })
  })

  describe('API Methods', () => {
    it('should fetch balance successfully', async () => {
      const mockResponse = {
        data: {
          balance: 100000,
          availableBalance: 90000,
          pendingBalance: 10000
        },
        message: 'Success'
      }

      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await walletService.getBalance()

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/wallet/balance')
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockResponse.data)
    })

    it('should handle API errors', async () => {
      const mockError = new Error('Network error')
      mockError.status = 500
      
      mockApiClient.get.mockRejectedValueOnce(mockError)

      const result = await walletService.getBalance()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
      expect(result.statusCode).toBe(500)
    })

    it('should set PIN successfully', async () => {
      const mockResponse = {
        data: { success: true },
        message: 'PIN set successfully'
      }

      mockApiClient.patch.mockResolvedValueOnce(mockResponse)

      const result = await walletService.setPin('123456')

      expect(mockApiClient.patch).toHaveBeenCalledWith('/api/wallet/pin', {
        pin: '123456'
      })
      expect(result.success).toBe(true)
    })

    it('should process payment successfully', async () => {
      const mockResponse = {
        data: {
          transaction: { id: 'txn-123', amount: -50000 },
          wallet: { balance: 50000 }
        },
        message: 'Payment successful'
      }

      mockApiClient.post.mockResolvedValueOnce(mockResponse)

      const result = await walletService.payOrder('order-123', '123456')

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/wallet/order-123/payment',
        { pin: '123456' }
      )
      expect(result.success).toBe(true)
    })

    it('should fetch transactions with parameters', async () => {
      const mockResponse = {
        data: {
          transactions: [{ id: 1, amount: 50000 }],
          pagination: { currentPage: 1 }
        },
        message: 'Success'
      }

      mockApiClient.get.mockResolvedValueOnce(mockResponse)

      const result = await walletService.getTransactions({ page: 1 })

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/wallet/transactions?')
      )
      expect(result.success).toBe(true)
    })
  })
})