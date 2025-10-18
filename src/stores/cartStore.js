// stores/cartStore.js - Pinia Cart Store
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import cartService from "@/services/cartService";
import { useAuthStore } from "@/stores/authStore";

export const useCartStore = defineStore("cart", () => {
  // State
  const cart = ref(null);
  const cartItems = ref([]);
  const isLoading = ref(false);
  const error = ref(null);
  const pendingUpdates = ref(new Map()); // Track pending updates per productId
  const batchUpdateTimer = ref(null); // Timeout ID for batching
  const appliedCoupon = ref(null);

  const cartCount = computed(() => {
    // Use summary data from API if available
    if (cart.value?.summary?.itemsCount !== undefined) {
      return cart.value.summary.itemsCount;
    }

    // Fallback to array length
    const count = cartItems.value?.length || 0;
    return isNaN(count) ? 0 : Math.max(0, count);
  });

  const totalQuantities = computed(() => {
    if (!Array.isArray(cartItems.value) || cartItems.value.length === 0) {
      return 0;
    }

    const total = cartItems.value.reduce((sum, item) => {
      const quantity = parseInt(item.quantity) || 0;
      return sum + quantity;
    }, 0);

    // Ensure we never return NaN
    return isNaN(total) ? 0 : Math.max(0, total);
  });

  const subtotal = computed(() => {
    // Use summary data from API if available
    if (cart.value?.summary?.subtotal !== undefined) {
      return cart.value.summary.subtotal;
    }

    // Fallback to calculation
    if (!Array.isArray(cartItems.value) || cartItems.value.length === 0) {
      return 0;
    }

    const total = cartItems.value.reduce((sum, item) => {
      const price =
        parseFloat(
          item.unitPrice || item.product?.currentPrice || item.product?.price
        ) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);

    return isNaN(total) ? 0 : Math.max(0, total);
  });

  const discountAmount = computed(() => {
    return appliedCoupon.value?.discountAmount || 0;
  });

  const total = computed(() => {
    const finalTotal = subtotal.value - discountAmount.value;
    return Math.max(0, finalTotal); // Ensure total is never negative
  });

  const isInCart = computed(() => (productId) => {
    if (!Array.isArray(cartItems.value) || !productId) return false;
    return cartItems.value.some(
      (item) =>
        (item.product?._id || item.product?.id) === productId ||
        (item.productId || item.product_id) === productId
    );
  });

  const getQuantity = computed(() => (productId) => {
    if (!Array.isArray(cartItems.value) || !productId) return 0;
    const item = cartItems.value.find(
      (item) =>
        (item.product?._id || item.product?.id) === productId ||
        (item.productId || item.product_id) === productId
    );
    const quantity = parseInt(item?.quantity) || 0;
    return isNaN(quantity) ? 0 : Math.max(0, quantity);
  });

  // Actions
  const clearError = () => {
    error.value = null;
  };

  const setLoading = (loading) => {
    isLoading.value = loading;
  };

  const updateCartData = (cartData) => {
    if (cartData) {
      cart.value = cartData;
      cartItems.value = Array.isArray(cartData.items) ? cartData.items : [];
      appliedCoupon.value = cartData.appliedCoupon || null;
    } else {
      cart.value = null;
      cartItems.value = [];
      appliedCoupon.value = null;
    }
  };

  /**
   * Initialize cart - fetch current cart data
   */
  const initializeCart = async () => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      updateCartData(null);
      return { success: true, data: null };
    }

    try {
      setLoading(true);
      clearError();

      const response = await cartService.getCart();

      if (response.success) {
        updateCartData(response.data);

        return { success: true, data: response.data };
      } else {
        console.warn("Failed to initialize cart:", response.message);
        updateCartData(null);
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error("Cart initialization error:", err);
      error.value = err.message || "Failed to load cart";
      updateCartData(null);
      return { success: false, message: err.message || "Failed to load cart" };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh cart data
   */
  const refreshCart = async () => {
    return await initializeCart();
  };

  /**
   * Get cart count only (lightweight)
   */
  const refreshCartCount = async () => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      return 0;
    }

    try {
      const response = await cartService.getCartCount();

      if (response.success) {
        const count = parseInt(response.data.count) || 0;
        const validCount = isNaN(count) ? 0 : Math.max(0, count);
        return validCount;
      }

      return 0;
    } catch (err) {
      console.error("Failed to refresh cart count:", err);
      return 0;
    }
  };

  /**
   * Add item to cart
   */
  const addToCart = async (productId, quantity = 1) => {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      return {
        success: false,
        requiresAuth: true,
        message: "Please login to add items to cart",
      };
    }

    try {
      setLoading(true);
      clearError();

      const response = await cartService.addToCart(productId, quantity);

      if (response.success) {
        updateCartData(response.data);
        return {
          success: true,
          message: response.message || "Item added to cart",
          data: response.data,
        };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error("Add to cart error:", err);
      error.value = err.message || "Failed to add item to cart";
      return {
        success: false,
        message: err.message || "Failed to add item to cart",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update cart item quantity
   */
  const updateCartItem = async (productId, quantity) => {
    try {
      setLoading(true);
      clearError();

      const response = await cartService.updateCartItem(productId, quantity);

      if (response.success) {
        updateCartData(response.data);
        return {
          success: true,
          message: response.message,
          data: response.data,
        };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error("Update cart item error:", err);
      error.value = err.message || "Failed to update cart item";
      return {
        success: false,
        message: err.message || "Failed to update cart item",
      };
    } finally {
      setLoading(false);
    }
  };

  const updateQuantityBatched = (productId, quantity) => {
  // Store pending update
  pendingUpdates.value.set(productId, quantity)
  
  // Clear existing timer
  if (batchUpdateTimer.value) {
    clearTimeout(batchUpdateTimer.value)
  }
  
  // Set new timer to batch send after 1 second
  batchUpdateTimer.value = setTimeout(async () => {
    await sendBatchUpdate()
  }, 1000)
}
const sendBatchUpdate = async () => {
  if (pendingUpdates.value.size === 0) return
  
  try {
    // Send all updates in one request
    const updates = Array.from(pendingUpdates.value.entries()).map(([productId, quantity]) => ({
      productId,
      quantity
    }))
    
    const result = await cartService.batchUpdateCart(updates)
    
    if (result.success) {
      updateCartData(result.data)
    }
    
    pendingUpdates.value.clear()
  } catch (error) {
    console.error('Batch update failed:', error)
    // Refresh cart to get correct state
    await refreshCart()
  }
}

  /**
   * Remove item from cart
   */
  const removeFromCart = async (productId) => {
    try {
      setLoading(true);
      clearError();

      const response = await cartService.removeFromCart(productId);

      if (response.success) {
        updateCartData(response.data);
        return {
          success: true,
          message: response.message || "Item removed from cart",
          data: response.data,
        };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error("Remove from cart error:", err);
      error.value = err.message || "Failed to remove item from cart";
      return {
        success: false,
        message: err.message || "Failed to remove item from cart",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear entire cart
   */
  const clearCart = async () => {
    try {
      setLoading(true);
      clearError();

      const response = await cartService.clearCart();

      if (response.success) {
        updateCartData(response.data);
        return {
          success: true,
          message: response.message || "Cart cleared",
          data: response.data,
        };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error("Clear cart error:", err);
      error.value = err.message || "Failed to clear cart";
      return { success: false, message: err.message || "Failed to clear cart" };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply coupon to cart
   */
  const applyCoupon = async (couponCode) => {
    try {
      setLoading(true);
      clearError();

      const response = await cartService.applyCoupon(couponCode);

      if (response.success) {
        updateCartData(response.data.cart);
        return {
          success: true,
          message: response.message || "Coupon applied successfully",
          data: response.data,
        };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error("Apply coupon error:", err);
      error.value = err.message || "Failed to apply coupon";
      return {
        success: false,
        message: err.message || "Failed to apply coupon",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remove coupon from cart
   */
  const removeCoupon = async () => {
    try {
      setLoading(true);
      clearError();

      const response = await cartService.removeCoupon();

      if (response.success) {
        updateCartData(response.data);
        appliedCoupon.value = null;
        return {
          success: true,
          message: response.message || "Coupon removed",
          data: response.data,
        };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error("Remove coupon error:", err);
      error.value = err.message || "Failed to remove coupon";
      return {
        success: false,
        message: err.message || "Failed to remove coupon",
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset cart state (for logout)
   */
  const resetCart = () => {
    cart.value = null;
    cartItems.value = [];
    appliedCoupon.value = null;
    error.value = null;
    isLoading.value = false;
  };

  return {
    // State
    cart,
    cartItems,
    isLoading,
    error,
    appliedCoupon,

    // Computed
    cartCount,
    totalQuantities,
    subtotal,
    discountAmount,
    total,
    isInCart,
    getQuantity,

    // Actions
    initializeCart,
    refreshCart,
    refreshCartCount,
    addToCart,
    updateCartItem,
    updateQuantityBatched,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    resetCart,
    clearError,
    setLoading,
  };
});
