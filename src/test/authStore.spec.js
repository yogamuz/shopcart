// tests/stores/authStore.spec.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/authStore'
import { authService } from '@/services/authService'
import { queryClient } from '@/main.js'

// Mock dependencies
vi.mock('@/services/authService')
vi.mock('@/main.js', () => ({
  queryClient: {
    clear: vi.fn().mockResolvedValue(undefined)
  }
}))

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString() }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value.toString() }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: ''
})

describe('AuthStore - Token Management', () => {
  let authStore

  beforeEach(() => {
    // Setup fresh pinia instance
    setActivePinia(createPinia())
    authStore = useAuthStore()

    // Replace global storage
    global.localStorage = localStorageMock
    global.sessionStorage = sessionStorageMock

    // Clear all mocks
    vi.clearAllMocks()
    localStorageMock.clear()
    sessionStorageMock.clear()
    document.cookie = ''
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Token Refresh - Success Cases', () => {
    it('should refresh token when near expiry', async () => {
      // Setup: Token yang hampir expired
      const nearExpiryToken = createMockToken(Date.now() / 1000 + 60) // 1 minute left
      authStore.accessToken = nearExpiryToken
      authStore.user = { id: 1, username: 'testuser', role: 'user' }

      // Mock refresh cookie exists
      document.cookie = 'refreshToken=valid_refresh_token'

      // Mock successful refresh
      authService.refresh.mockResolvedValue({
        success: true,
        accessToken: createMockToken(Date.now() / 1000 + 3600),
        user: { id: 1, username: 'testuser', role: 'user' }
      })

      const result = await authStore.refreshToken()

      expect(result).toBe(true)
      expect(authService.refresh).toHaveBeenCalledTimes(1)
      expect(authStore.accessToken).toBeTruthy()
      expect(authStore.user).toEqual(expect.objectContaining({
        username: 'testuser'
      }))
    })

    it('should skip refresh when token is still valid', async () => {
      // Setup: Fresh token (1 hour left)
      const validToken = createMockToken(Date.now() / 1000 + 3600)
      authStore.accessToken = validToken
      authStore.user = { id: 1, username: 'testuser', role: 'user' }
      
      // Set fresh verification
      localStorage.setItem('lastVerified', Date.now().toString())
      authStore.lastVerified = Date.now().toString()

      const result = await authStore.refreshToken()

      expect(result).toBe(true)
      expect(authService.refresh).not.toHaveBeenCalled()
    })

    it('should handle concurrent refresh requests', async () => {
      // Setup - Force refresh by making token near expiry
      authStore.accessToken = createMockToken(Date.now() / 1000 + 60)
      authStore.user = { id: 1, username: 'testuser', role: 'user' }
      authStore.lastVerified = null // Force verification to be stale
      document.cookie = 'refreshToken=valid_refresh_token'

      authService.refresh.mockResolvedValue({
        success: true,
        accessToken: createMockToken(Date.now() / 1000 + 3600),
        user: { id: 1, username: 'testuser', role: 'user' }
      })

      // Trigger multiple concurrent refreshes
      const results = await Promise.all([
        authStore.refreshToken(),
        authStore.refreshToken(),
        authStore.refreshToken()
      ])

      // Should only call API once
      expect(authService.refresh).toHaveBeenCalledTimes(1)
      // All should return true (first gets the promise, others wait for it)
      expect(results.every(r => r === true)).toBe(true)
    })
  })

  describe('Token Refresh - Failure Cases', () => {
    it('should clear auth when refresh token is missing', async () => {
      // Setup: No refresh cookie
      authStore.accessToken = createMockToken(Date.now() / 1000 + 60)
      authStore.user = { id: 1, username: 'testuser', role: 'user' }
      document.cookie = '' // No refresh token

      const result = await authStore.refreshToken()

      expect(result).toBe(false)
      expect(authService.refresh).not.toHaveBeenCalled()
    })

    it('should clear auth when refresh token cookie is empty', async () => {
      // Setup: Empty refresh cookie value
      authStore.accessToken = createMockToken(Date.now() / 1000 + 60)
      authStore.user = { id: 1, username: 'testuser', role: 'user' }
      document.cookie = 'refreshToken=' // Empty value

      const result = await authStore.refreshToken()

      expect(result).toBe(false)
      expect(authService.refresh).not.toHaveBeenCalled()
    })

    it('should clear auth when refresh token is too short', async () => {
      // Setup: Very short token (likely invalid)
      authStore.accessToken = createMockToken(Date.now() / 1000 + 60)
      authStore.user = { id: 1, username: 'testuser', role: 'user' }
      document.cookie = 'refreshToken=abc' // Too short (< 10 chars)

      const result = await authStore.refreshToken()

      expect(result).toBe(false)
      expect(authService.refresh).not.toHaveBeenCalled()
    })

    it('should clear auth when refresh returns 401', async () => {
      // Setup
      authStore.accessToken = createMockToken(Date.now() / 1000 + 60)
      authStore.user = { id: 1, username: 'testuser', role: 'user' }
      document.cookie = 'refreshToken=expired_token'

      // Mock 401 response
      authService.refresh.mockRejectedValue({
        status: 401,
        message: 'Refresh token expired'
      })

      const result = await authStore.refreshToken()

      expect(result).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.accessToken).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    })

    it('should clear auth when refresh returns 400', async () => {
      // Setup
      authStore.accessToken = createMockToken(Date.now() / 1000 + 60)
      authStore.user = { id: 1, username: 'testuser', role: 'user' }
      document.cookie = 'refreshToken=invalid_token'

      // Mock 400 response (bad request)
      authService.refresh.mockRejectedValue({
        status: 400,
        message: 'Invalid refresh token'
      })

      const result = await authStore.refreshToken()

      expect(result).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.accessToken).toBeNull()
    })

    it('should keep session on network errors', async () => {
      // Setup
      authStore.accessToken = createMockToken(Date.now() / 1000 + 60)
      authStore.user = { id: 1, username: 'testuser', role: 'user' }
      document.cookie = 'refreshToken=valid_token'

      // Mock network error
      authService.refresh.mockRejectedValue({
        code: 'ERR_NETWORK',
        message: 'Network Error'
      })

      const result = await authStore.refreshToken()

      expect(result).toBe(false)
      // Should NOT clear auth on network errors
      expect(authStore.user).toBeTruthy()
      expect(authStore.accessToken).toBeTruthy()
    })

    it('should handle invalid refresh response', async () => {
      // Setup
      authStore.accessToken = createMockToken(Date.now() / 1000 + 60)
      authStore.user = { id: 1, username: 'testuser', role: 'user' }
      document.cookie = 'refreshToken=valid_token'

      // Mock invalid response
      authService.refresh.mockResolvedValue({
        success: false,
        message: 'Invalid refresh token'
      })

      const result = await authStore.refreshToken()

      expect(result).toBe(false)
    })
  })

  describe('Initialize - With/Without Refresh Token', () => {
    it('should initialize successfully with valid refresh token', async () => {
      // Setup: User in localStorage + valid refresh cookie
      const storedUser = { id: 1, username: 'testuser', role: 'user' }
      localStorage.setItem('user', JSON.stringify(storedUser))
      document.cookie = 'refreshToken=valid_long_token_string'

      authService.refresh.mockResolvedValue({
        success: true,
        accessToken: createMockToken(Date.now() / 1000 + 3600),
        user: storedUser
      })

      await authStore.initialize()

      expect(authStore.user).toEqual(storedUser)
      expect(authStore.accessToken).toBeTruthy()
      expect(authStore.isAuthenticated).toBe(true)
    })

    it('should clear stale data when refresh token is missing', async () => {
      // Setup: User in localStorage but NO refresh cookie
      localStorage.setItem('user', JSON.stringify({ 
        id: 1, username: 'testuser', role: 'user' 
      }))
      document.cookie = '' // No refresh token

      await authStore.initialize()

      expect(authStore.user).toBeNull()
      expect(authStore.accessToken).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
    })

    it('should handle guest mode when no session exists', async () => {
      // Setup: No user, no cookie
      document.cookie = ''

      await authStore.initialize()

      expect(authStore.user).toBeNull()
      expect(authStore.accessToken).toBeNull()
      expect(authStore.isAuthenticated).toBe(false)
    })

    it('should clear auth when refresh fails on init', async () => {
      // Setup
      localStorage.setItem('user', JSON.stringify({ 
        id: 1, username: 'testuser', role: 'user' 
      }))
      document.cookie = 'refreshToken=invalid_token'

      authService.refresh.mockRejectedValue({
        status: 401,
        message: 'Invalid token'
      })

      await authStore.initialize()

      expect(authStore.user).toBeNull()
      expect(authStore.accessToken).toBeNull()
    })

    it('should skip initialization after logout', async () => {
      // Setup: Mark as just logged out
      sessionStorage.setItem('justLoggedOut', 'true')

      await authStore.initialize()

      expect(authService.refresh).not.toHaveBeenCalled()
      expect(sessionStorage.removeItem).toHaveBeenCalledWith('justLoggedOut')
    })

    it('should prevent duplicate initialization', async () => {
      // Setup
      document.cookie = 'refreshToken=valid_token'
      authService.refresh.mockResolvedValue({
        success: true,
        accessToken: createMockToken(Date.now() / 1000 + 3600),
        user: { id: 1, username: 'testuser', role: 'user' }
      })

      // Trigger multiple initializations
      const promises = [
        authStore.initialize(),
        authStore.initialize(),
        authStore.initialize()
      ]

      await Promise.all(promises)

      // Should only refresh once
      expect(authService.refresh).toHaveBeenCalledTimes(1)
    })
  })

  describe('Login/Logout Flow', () => {
    it('should store token in memory only on login', async () => {
      const mockResponse = {
        success: true,
        accessToken: createMockToken(Date.now() / 1000 + 3600),
        user: { id: 1, username: 'testuser', email: 'test@example.com', role: 'user' }
      }

      authService.login.mockResolvedValue(mockResponse)

      await authStore.login({ email: 'test@example.com', password: 'Password123' })

      // Token should be in memory
      expect(authStore.accessToken).toBeTruthy()
      
      // User should be in localStorage (without token)
      const storedUser = JSON.parse(localStorage.getItem('user'))
      expect(storedUser.username).toBe('testuser')
      expect(storedUser.accessToken).toBeUndefined()
    })

    it('should clear all state on logout', async () => {
      // Setup authenticated state
      authStore.user = { id: 1, username: 'testuser', role: 'user' }
      authStore.accessToken = createMockToken(Date.now() / 1000 + 3600)
      localStorage.setItem('user', JSON.stringify(authStore.user))

      authService.logout.mockResolvedValue({ success: true })

      await authStore.logout()

      expect(authStore.user).toBeNull()
      expect(authStore.accessToken).toBeNull()
      expect(localStorage.removeItem).toHaveBeenCalledWith('user')
      expect(sessionStorage.setItem).toHaveBeenCalledWith('justLoggedOut', 'true')
    })
  })

  describe('Token Verification', () => {
    it('should skip verification when still fresh', async () => {
      // Setup: Fresh verification (< 5 minutes ago)
      authStore.accessToken = createMockToken(Date.now() / 1000 + 3600)
      authStore.user = { id: 1, username: 'testuser', role: 'user' }
      authStore.lastVerified = Date.now().toString()
      localStorage.setItem('lastVerified', Date.now().toString())

      const result = await authStore.verifyToken()

      // When verification is fresh, it returns early with success object
      expect(result).toEqual({ success: true, user: authStore.user })
      expect(authService.verify).not.toHaveBeenCalled()
    })

    it('should verify token when forced', async () => {
      // Setup
      authStore.accessToken = createMockToken(Date.now() / 1000 + 3600)
      authStore.user = { id: 1, username: 'testuser', role: 'user' }
      authStore.lastVerified = Date.now().toString()

      authService.verify.mockResolvedValue({
        success: true,
        user: { id: 1, username: 'testuser', role: 'user' }
      })

      const result = await authStore.verifyToken(true) // force = true

      expect(result.success).toBe(true)
      expect(authService.verify).toHaveBeenCalledTimes(1)
    })

    it('should keep existing token when verify succeeds', async () => {
      // Setup
      const originalToken = createMockToken(Date.now() / 1000 + 3600)
      authStore.accessToken = originalToken
      authStore.user = { id: 1, username: 'testuser', role: 'user' }

      // Mock verify (tidak return accessToken)
      authService.verify.mockResolvedValue({
        success: true,
        user: { id: 1, username: 'testuser', role: 'user' }
      })

      await authStore.verifyToken(true)

      // Token harus tetap sama
      expect(authStore.accessToken).toBe(originalToken)
    })

    it('should clear auth when verify returns 401', async () => {
      // Setup
      authStore.accessToken = createMockToken(Date.now() / 1000 + 3600)
      authStore.user = { id: 1, username: 'testuser', role: 'user' }

      authService.verify.mockRejectedValue({
        status: 401,
        message: 'Token invalid'
      })

      const result = await authStore.verifyToken(true)

      expect(result).toBe(false)
      expect(authStore.user).toBeNull()
      expect(authStore.accessToken).toBeNull()
    })
  })

  describe('Token Expiry Detection', () => {
    it('should detect near-expiry token (< 2 minutes)', () => {
      // Token expires in 1 minute
      const nearExpiryToken = createMockToken(Date.now() / 1000 + 60)
      authStore.accessToken = nearExpiryToken

      expect(authStore.isTokenNearExpiry()).toBe(true)
    })

    it('should detect valid token (> 2 minutes)', () => {
      // Token expires in 10 minutes
      const validToken = createMockToken(Date.now() / 1000 + 600)
      authStore.accessToken = validToken

      expect(authStore.isTokenNearExpiry()).toBe(false)
    })

    it('should return true when no token exists', () => {
      authStore.accessToken = null

      expect(authStore.isTokenNearExpiry()).toBe(true)
    })

    it('should handle malformed tokens', () => {
      authStore.accessToken = 'invalid.token.format'

      expect(authStore.isTokenNearExpiry()).toBe(true)
    })
  })

  describe('ensureTokenReady', () => {
    it('should wait for initialization to complete', async () => {
      // Mock isInitializing as a ref
      authStore.isInitializing = { value: true }

      // Simulate initialization completing
      setTimeout(() => {
        authStore.accessToken = createMockToken(Date.now() / 1000 + 3600)
        authStore.isInitializing.value = false
      }, 200)

      const hasToken = await authStore.ensureTokenReady(1000)

      expect(hasToken).toBe(true)
    })

    it('should timeout if initialization takes too long', async () => {
      // Mock isInitializing as a ref that never completes
      authStore.isInitializing = { value: true }

      const hasToken = await authStore.ensureTokenReady(500)

      expect(hasToken).toBe(false)
    })

    it('should return true immediately if token already exists', async () => {
      authStore.accessToken = createMockToken(Date.now() / 1000 + 3600)
      authStore.isInitializing = { value: false }

      const hasToken = await authStore.ensureTokenReady(1000)

      expect(hasToken).toBe(true)
    })
  })
})

// Helper: Create mock JWT token
function createMockToken(expiryTimestamp) {
  const header = { alg: 'HS256', typ: 'JWT' }
  const payload = { 
    userId: 1, 
    username: 'testuser',
    exp: Math.floor(expiryTimestamp)
  }

  const encodedHeader = btoa(JSON.stringify(header))
  const encodedPayload = btoa(JSON.stringify(payload))
  
  return `${encodedHeader}.${encodedPayload}.mock_signature`
}