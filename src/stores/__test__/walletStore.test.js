import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useWalletStore } from '../walletStore'
import walletService from '@/services/walletService'

// Mock the service
vi.mock('@/services/walletService')

describe('WalletStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useWalletStore()
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(store.wallet).toEqual({
        balance: 0,
        pendingBalance: 0,
        availableBalance: 0,
        totalBalance: 0,
        lastTransaction: null,
        isActive: true
      })
      
      expect(store.transactions).toEqual([])
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })
  })

  describe('computed properties', () => {
    it('should compute hasBalance correctly', () => {
      expect(store.hasBalance).toBe(false)
      
      store.wallet.balance = 100000
      expect(store.hasBalance).toBe(true)
    })

    it('should compute recentTransactions correctly', () => {
      const mockTransactions = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        amount: 1000,
        type: 'receive'
      }))

      store.transactions = mockTransactions
      expect(store.recentTransactions).toHaveLength(10)
      expect(store.recentTransactions[0].id).toBe(1)
    })
  })

  describe('actions', () => {
    describe('fetchBalance', () => {
      it('should fetch balance successfully', async () => {
        const mockResponse = {
          success: true,
          data: {
            balance: 100000,
            availableBalance: 90000,
            pendingBalance: 10000
          }
        }

        vi.mocked(walletService.getBalance).mockResolvedValueOnce(mockResponse)

        const result = await store.fetchBalance()

        expect(store.isLoadingBalance).toBe(false)
        expect(store.wallet.balance).toBe(100000)
        expect(store.wallet.availableBalance).toBe(90000)
        expect(result.success).toBe(true)
        expect(store.error).toBe(null)
      })

      it('should handle fetch balance error', async () => {
        const mockError = {
          success: false,
          error: 'Network error',
          statusCode: 500
        }

        vi.mocked(walletService.getBalance).mockResolvedValueOnce(mockError)

        const result = await store.fetchBalance()

        expect(result.success).toBe(false)
        expect(store.error).toEqual({
          message: 'Network error',
          details: undefined,
          statusCode: 500,
          code: undefined
        })
      })
    })

    describe('fetchTransactions', () => {
      it('should fetch transactions with pagination', async () => {
        const mockResponse = {
          success: true,
          data: {
            transactions: [
              { id: 1, amount: 50000, type: 'receive' },
              { id: 2, amount: -25000, type: 'payment' }
            ],
            pagination: {
              currentPage: 1,
              totalPages: 1,
              hasNextPage: false
            }
          }
        }

        vi.mocked(walletService.getTransactions).mockResolvedValueOnce(mockResponse)

        await store.fetchTransactions({ page: 1 })

        expect(store.transactions).toHaveLength(2)
        expect(store.pagination.currentPage).toBe(1)
        expect(store.isLoadingTransactions).toBe(false)
      })
    })

    describe('payOrder', () => {
      it('should process payment and update state', async () => {
        const mockResponse = {
          success: true,
          data: {
            transaction: { id: 'txn-123', amount: -50000 },
            wallet: { balance: 50000, availableBalance: 50000 }
          }
        }

        vi.mocked(walletService.payOrder).mockResolvedValueOnce(mockResponse)

        const result = await store.payOrder('order-123', '123456')

        expect(result.success).toBe(true)
        expect(store.wallet.balance).toBe(50000)
        expect(store.transactions[0].id).toBe('txn-123')
      })
    })
  })

  describe('utility methods', () => {
    it('should search transactions locally', async () => {
      store.transactions = [
        { id: 1, description: 'Coffee purchase', type: 'payment' },
        { id: 2, description: 'Salary payment', type: 'receive' },
        { id: 3, description: 'Grocery shopping', type: 'payment' }
      ]

      const result = await store.searchTransactions('coffee')
      
      expect(result.success).toBe(true)
      expect(result.data.transactions).toHaveLength(1)
      expect(result.data.transactions[0].description).toBe('Coffee purchase')
    })

    it('should filter transactions by type', () => {
      store.transactions = [
        { id: 1, type: 'payment', amount: -50000 },
        { id: 2, type: 'receive', amount: 100000 },
        { id: 3, type: 'payment', amount: -25000 }
      ]

      const payments = store.filterTransactionsByType('payment')
      expect(payments).toHaveLength(2)
      expect(payments.every(t => t.type === 'payment')).toBe(true)
    })
  })
})