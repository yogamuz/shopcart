// stores/cartStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { cartService } from "@/services/cartService";
import { useAuthStore } from "@/stores/authStore";

export const useCartStore = defineStore("cart", () => {
  const cart = ref(null);
  const cartItems = ref([]);
  const appliedCoupon = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  // Batch update management
  const pendingUpdates = ref(new Map());
  const batchUpdateTimer = ref(null);

  /**
   * Total number of unique items in cart
   */
  const cartCount = computed(() => {
    return cart.value?.summary?.itemsCount ?? cartItems.value.length;
  });

  /**
   * Total quantity of all items combined
   */
  const totalQuantities = computed(() => {
    if (!cartItems.value.length) return 0;

    return cartItems.value.reduce((sum, item) => {
      return sum + (parseInt(item.quantity) || 0);
    }, 0);
  });

  /**
   * Subtotal before discounts and shipping
   */
  const subtotal = computed(() => {
    if (cart.value?.summary?.subtotal !== undefined) {
      return cart.value.summary.subtotal;
    }

    if (!cartItems.value.length) return 0;

    return cartItems.value.reduce((sum, item) => {
      const price = parseFloat(item.unitPrice || item.product?.price) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return sum + price * quantity;
    }, 0);
  });

  /**
   * Discount amount from applied coupon
   */
  const discountAmount = computed(() => {
    return appliedCoupon.value?.discountAmount || 0;
  });

  /**
   * Final total after discounts
   */
  const total = computed(() => {
    return Math.max(0, subtotal.value - discountAmount.value);
  });

  /**
   * Check if a product is in the cart
   */
  const isInCart = computed(() => productId => {
    if (!cartItems.value.length || !productId) return false;

    return cartItems.value.some(item => item.product?._id === productId || item.productId === productId);
  });

  /**
   * Get quantity of a specific product in cart
   */
  const getQuantity = computed(() => productId => {
    if (!cartItems.value.length || !productId) return 0;

    const item = cartItems.value.find(item => item.product?._id === productId || item.productId === productId);

    return parseInt(item?.quantity) || 0;
  });
  /**
   * Updates cart state from API response
   */
  function updateCartData(cartData) {
    if (cartData) {
      cart.value = cartData;
      cartItems.value = Array.isArray(cartData.items) ? cartData.items : [];
      appliedCoupon.value = cartData.appliedCoupon || null;
    } else {
      cart.value = null;
      cartItems.value = [];
      appliedCoupon.value = null;
    }
  }

  /**
   * Handles API response and updates state accordingly
   */
  function handleApiResponse(response, successMessage = null) {
    if (response.success) {
      if (response.data) {
        updateCartData(response.data.cart || response.data);
      }
      return {
        success: true,
        message: response.message || successMessage,
        data: response.data,
      };
    } else {
      error.value = response.message;
      return {
        success: false,
        message: response.message,
      };
    }
  }

  /**
   * Sends batched quantity updates to API
   */
  async function sendBatchUpdate() {
    if (pendingUpdates.value.size === 0) return;

    try {
      const updates = Array.from(pendingUpdates.value.entries()).map(([productId, quantity]) => ({
        productId,
        quantity,
      }));

      const response = await cartService.batchUpdateCart(updates);

      if (response.success) {
        updateCartData(response.data);
      }

      pendingUpdates.value.clear();
    } catch (err) {
      console.error("Batch update failed:", err);
      await initializeCart();
    }
  }
  /**
   * Initializes cart by fetching from API
   * Called on app mount or after login
   */
  async function initializeCart() {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      updateCartData(null);
      return { success: true, data: null };
    }

    try {
      isLoading.value = true;
      error.value = null;

      const response = await cartService.getCart();

      if (response.success) {
        updateCartData(response.data);
        return { success: true, data: response.data };
      } else {
        updateCartData(null);
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error("Cart initialization error:", err);
      error.value = err.message || "Failed to load cart";
      updateCartData(null);
      return { success: false, message: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Refreshes cart data from API
   */
  async function refreshCart() {
    return await initializeCart();
  }

  /**
   * Fetches only the cart count (lightweight operation)
   */
  async function refreshCartCount() {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) return 0;

    try {
      const response = await cartService.getCartCount();
      return response.success ? parseInt(response.data.count) || 0 : 0;
    } catch (err) {
      console.error("Failed to refresh cart count:", err);
      return 0;
    }
  }

  /**
   * Adds a product to the cart
   */
  async function addToCart(productId, quantity = 1) {
    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      return {
        success: false,
        requiresAuth: true,
        message: "Please login to add items to cart",
      };
    }

    try {
      isLoading.value = true;
      error.value = null;

      const response = await cartService.addToCart(productId, quantity);
      return handleApiResponse(response, "Item added to cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Updates cart item quantity immediately
   */
  async function updateCartItem(productId, quantity) {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await cartService.updateCartItem(productId, quantity);
      return handleApiResponse(response);
    } catch (err) {
      console.error("Update cart item error:", err);
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Queues quantity update for batched API call
   * Useful for rapid increment/decrement actions
   */
  function updateQuantityBatched(productId, quantity) {
    pendingUpdates.value.set(productId, quantity);

    if (batchUpdateTimer.value) {
      clearTimeout(batchUpdateTimer.value);
    }

    batchUpdateTimer.value = setTimeout(async () => {
      await sendBatchUpdate();
    }, 1000);
  }

  /**
   * Removes an item from the cart
   */
  async function removeFromCart(productId) {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await cartService.removeFromCart(productId);
      return handleApiResponse(response, "Item removed from cart");
    } catch (err) {
      console.error("Remove from cart error:", err);
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Clears all items from the cart
   */
  async function clearCart() {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await cartService.clearCart();
      return handleApiResponse(response, "Cart cleared");
    } catch (err) {
      console.error("Clear cart error:", err);
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Applies a coupon code to the cart
   */
  async function applyCoupon(couponCode) {
    try {
      isLoading.value = true;
      error.value = null;

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
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Removes the currently applied coupon
   */
  async function removeCoupon() {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await cartService.removeCoupon();

      if (response.success) {
        updateCartData(response.data);
        appliedCoupon.value = null;
        return {
          success: true,
          message: response.message || "Coupon removed",
        };
      } else {
        error.value = response.message;
        return { success: false, message: response.message };
      }
    } catch (err) {
      console.error("Remove coupon error:", err);
      error.value = err.message;
      return { success: false, message: err.message };
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Resets cart state (called on logout)
   */
  function resetCart() {
    cart.value = null;
    cartItems.value = [];
    appliedCoupon.value = null;
    error.value = null;
    isLoading.value = false;
    pendingUpdates.value.clear();
    if (batchUpdateTimer.value) {
      clearTimeout(batchUpdateTimer.value);
    }
  }

  /**
   * Clears error state
   */
  function clearError() {
    error.value = null;
  }

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
  };
});
