// composables/useAuth.js
import { computed } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'

export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()
  const route = useRoute()

  // Computed properties
  const isAuthenticated = computed(() => authStore.isAuthenticated)
  const user = computed(() => authStore.user)
  const userRole = computed(() => authStore.userRole)
  const isLoading = computed(() => authStore.isLoading)
  const error = computed(() => authStore.error)

  // Role checking methods
  const isUser = computed(() => authStore.isUser)
  const isSeller = computed(() => authStore.isSeller)
  const isAdmin = computed(() => authStore.isAdmin)
  const hasRole = (role) => authStore.hasRole(role)
  const hasAnyRole = (roles) => authStore.hasAnyRole(roles)

  // Auth methods with navigation
  const login = async (credentials, redirectTo = '/') => {
    try {
      const result = await authStore.login(credentials)
      
      // Navigate to intended route or default
      const intended = route.query.redirect || redirectTo
      await router.push(intended)
      
      return result
    } catch (err) {
      throw err
    }
  }

  const register = async (userData, redirectTo = '/') => {
    try {
      const result = await authStore.register(userData)
      
      // Navigate to intended route or default
      const intended = route.query.redirect || redirectTo
      await router.push(intended)
      
      return result
    } catch (err) {
      throw err
    }
  }

  const logout = async (redirectTo = '/login') => {
    try {
      await authStore.logout()
      await router.push(redirectTo)
    } catch (err) {
      // Even if logout fails, clear local state and redirect
      authStore.clearAuth()
      await router.push(redirectTo)
      throw err
    }
  }

  // Password management
  const requestPasswordReset = async (email) => {
    return authStore.requestPasswordReset(email)
  }

const resetPassword = async (email, otp, newPassword) => {
  return authStore.resetPassword(email, otp, newPassword)
}

const changePassword = async (currentPassword, newPassword, confirmPassword) => {
  return authStore.changePassword(currentPassword, newPassword, confirmPassword);
};

const checkUsernameAvailability = async (username) => {
  return authStore.checkUsernameAvailability(username)
}
  // Route protection helpers
  const requireAuth = (redirectTo = '/login') => {
    if (!isAuthenticated.value) {
      const currentRoute = route.fullPath
      router.push({
        path: redirectTo,
        query: currentRoute !== '/' ? { redirect: currentRoute } : {}
      })
      return false
    }
    return true
  }

  const requireRole = (requiredRole, redirectTo = '/unauthorized') => {
    if (!requireAuth()) return false
    
    if (!hasRole(requiredRole)) {
      router.push(redirectTo)
      return false
    }
    
    return true
  }

  const requireAnyRole = (requiredRoles, redirectTo = '/unauthorized') => {
    if (!requireAuth()) return false
    
    if (!hasAnyRole(requiredRoles)) {
      router.push(redirectTo)
      return false
    }
    
    return true
  }

  const requireGuest = (redirectTo = '/') => {
    if (isAuthenticated.value) {
      router.push(redirectTo)
      return false
    }
    return true
  }

  // Utility methods
  const clearError = () => {
    authStore.clearError()
  }

  const refreshToken = async () => {
    return authStore.refreshToken()
  }

  const verifyToken = async () => {
    return authStore.verifyToken()
  }

  const initialize = async () => {
    return authStore.initialize()
  }

  // Check if current user can access specific roles
  const canAccessUserRoutes = computed(() => hasAnyRole(['user', 'seller', 'admin']))
  const canAccessSellerRoutes = computed(() => hasAnyRole(['seller', 'admin']))
  const canAccessAdminRoutes = computed(() => hasRole('admin'))

  return {
    // State
    isAuthenticated,
    user,
    userRole,
    isLoading,
    error,

    // Role checks
    isUser,
    isSeller,
    isAdmin,
    hasRole,
    hasAnyRole,
    canAccessUserRoutes,
    canAccessSellerRoutes,
    canAccessAdminRoutes,

    // Auth methods
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    changePassword,
    checkUsernameAvailability,
    refreshToken,
    verifyToken,
    initialize,

    // Route protection
    requireAuth,
    requireRole,
    requireAnyRole,
    requireGuest,

    // Utilities
    clearError
  }
}