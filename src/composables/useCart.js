 // composables/useCart.js - Cart Composable with Store Integration
import { computed, nextTick, watch } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { useToast } from '@/composables/useToast'

export const useCart = () => {
  const cartStore = useCartStore()
  const authStore = useAuthStore()
const { success: showToastSuccess, error: showToastError, warning: showToastWarning, info: showToastInfo } = useToast()

  // Reactive cart state from store
  const cartItems = computed(() => cartStore.cartItems)
  const cart = computed(() => cartStore.cart)
  const isLoading = computed(() => cartStore.isLoading)
  const error = computed(() => cartStore.error)
  const appliedCoupon = computed(() => cartStore.appliedCoupon)

  // Cart computations
  const cartCount = computed(() => cartStore.cartCount)
  const totalQuantities = computed(() => cartStore.totalQuantities)
  const subtotal = computed(() => cartStore.subtotal)
  const discountAmount = computed(() => cartStore.discountAmount)
  const cartTotal = computed(() => cartStore.total)

  // Item utilities
  const isInCart = computed(() => cartStore.isInCart)
  const getQuantity = computed(() => cartStore.getQuantity)

  // Authentication check
  const isUserAuthenticated = () => {
    return authStore.isAuthenticated && authStore.user
  }

/**
 * Show notification with toast
 */
const showCartNotification = (message, type = 'success') => {
  const duration = type === 'error' ? 5000 : 3000
  
  switch (type) {
    case 'success':
      showToastSuccess(message, duration)
      break
    case 'error':
      showToastError(message, duration)
      break
    case 'warning':
      showToastWarning(message, duration)
      break
    case 'info':
    default:
      showToastInfo(message, duration)
      break
  }
}

  /**
   * Initialize cart
   */
  const initializeCart = async () => {
    
    try {
      const result = await cartStore.initializeCart()

      
      return result
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  /**
   * Refresh cart data
   */
  const refreshCart = async () => {
    
    try {
      const result = await cartStore.refreshCart()

      return result
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  /**
   * Refresh cart count only (lightweight)
   */
  const refreshCartCount = async () => {
    try {
      const newCount = await cartStore.refreshCartCount()
      
      // Validate the returned count
      if (typeof newCount === 'number' && !isNaN(newCount) && newCount >= 0) {
        return newCount
      } else {
        return cartCount.value || 0
      }
    } catch (error) {
      return cartCount.value || 0
    }
  }

  /**
   * Add item to cart with enhanced error handling
   */
  const addToCart = async (productId, quantity = 1) => {
    if (!isUserAuthenticated()) {
      return { 
        success: false, 
        requiresAuth: true, 
        message: 'Please login to add items to cart' 
      }
    }

    try {
      const result = await cartStore.addToCart(productId, quantity)
      return result
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to add item to cart' 
      }
    }
  }

  /**
   * Safe add to cart with comprehensive error handling
   */
  const safeAddToCart = async (productId, quantity = 1) => {
    // Input validation
    if (!productId) {
      return { success: false, message: 'Invalid product ID' }
    }

    if (quantity < 1 || isNaN(quantity)) {
      return { success: false, message: 'Invalid quantity' }
    }

    // Authentication check
    if (!isUserAuthenticated()) {
      return { 
        success: false, 
        requiresAuth: true, 
        message: 'Please login to add items to cart' 
      }
    }

    try {
      
      const result = await cartStore.addToCart(productId, quantity)
      
      if (result.success) {
        
        // Force cart count refresh with validation
        await nextTick()
        const refreshedCount = await refreshCartCount()
        
        // Dispatch event for immediate UI updates
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('cart-updated', {
            detail: { 
              count: refreshedCount,
              action: 'add',
              productId,
              quantity
            }
          }))
        }
        
        return result
      } else {
        return result
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Failed to add item to cart' 
      }
    }
  }

  /**
   * Update cart item quantity
   */
  const updateCartItem = async (productId, quantity) => {
    if (!isUserAuthenticated()) {
      return { success: false, message: 'Authentication required' }
    }

    try {
      const result = await cartStore.updateCartItem(productId, quantity)
      
      if (result.success) {
        // Refresh count after update
        await refreshCartCount()
      }
      
      return result
    } catch (error) {
      return { success: false, message: error.message || 'Failed to update item' }
    }
  }

  /**
   * Remove item from cart
   */
  const removeFromCart = async (productId) => {
    if (!isUserAuthenticated()) {
      return { success: false, message: 'Authentication required' }
    }

    try {
      const result = await cartStore.removeFromCart(productId)
      
      if (result.success) {
        // Refresh count after removal
        await refreshCartCount()
      }
      
      return result
    } catch (error) {
      return { success: false, message: error.message || 'Failed to remove item' }
    }
  }

  /**
   * Clear entire cart
   */
  const clearCart = async () => {
    if (!isUserAuthenticated()) {
      return { success: false, message: 'Authentication required' }
    }

    try {
      const result = await cartStore.clearCart()
      
      if (result.success) {
        await refreshCartCount()
      }
      
      return result
    } catch (error) {
      return { success: false, message: error.message || 'Failed to clear cart' }
    }
  }

  /**
   * Apply coupon to cart
   */
  const applyCoupon = async (couponCode) => {
    if (!couponCode?.trim()) {
      return { success: false, message: 'Please enter a coupon code' }
    }

    if (!isUserAuthenticated()) {
      return { success: false, message: 'Authentication required' }
    }

    try {
      const result = await cartStore.applyCoupon(couponCode.trim())
      return result
    } catch (error) {
      return { success: false, message: error.message || 'Failed to apply coupon' }
    }
  }

  /**
   * Remove coupon from cart
   */
  const removeCoupon = async () => {
    if (!isUserAuthenticated()) {
      return { success: false, message: 'Authentication required' }
    }

    try {
      const result = await cartStore.removeCoupon()
      return result
    } catch (error) {
      return { success: false, message: error.message || 'Failed to remove coupon' }
    }
  }

  /**
   * Format price for display
   */
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '0'
    return parseInt(price).toLocaleString('id-ID')
  }

  /**
   * Format currency for display
   */
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return 'Rp 0'
    return `Rp ${formatPrice(amount)}`
  }

  /**
   * Reset cart state (for logout)
   */
  const resetCart = () => {
    cartStore.resetCart()
  }

  // Watch for auth changes and handle cart accordingly
  watch(
    () => authStore.isAuthenticated,
    async (isAuthenticated, wasAuthenticated) => {
      if (isAuthenticated && !wasAuthenticated) {
        // User just logged in - initialize cart
        await initializeCart()
      } else if (!isAuthenticated && wasAuthenticated) {
        // User just logged out - reset cart
        resetCart()
      }
    },
    { immediate: false }
  )

  // Watch cart count changes for debugging
  watch(
    cartCount,
    (newCount, oldCount) => {
      const validNewCount = typeof newCount === 'number' && !isNaN(newCount) ? newCount : 0
      const validOldCount = typeof oldCount === 'number' && !isNaN(oldCount) ? oldCount : 0
      
      if (validNewCount !== validOldCount) {
      }
    },
    { immediate: true }
  )

  return {
    // State
    cartItems,
    cart,
    isLoading,
    error,
    appliedCoupon,

    // Computed
    cartCount,
    totalQuantities,
    subtotal,
    discountAmount,
    cartTotal,
    isInCart,
    getQuantity,

    // Actions
    initializeCart,
    refreshCart,
    refreshCartCount,
    addToCart,
    safeAddToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    resetCart,

    // Utilities
    isUserAuthenticated,
    showCartNotification,
    formatPrice,
    formatCurrency
  }
}