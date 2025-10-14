// services/cartService.js
import { useApiClient } from "@/composables/useApiClient";

class CartServiceClass {
  constructor() {
    this.apiClient = useApiClient();
  }

  /**
   * Get user's cart with populated data
   */
  async getCart() {
    try {
      return await this.apiClient.get("/api/cart");
    } catch (error) {
      console.error("Failed to get cart:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Add item to cart
   */
  async addToCart(productId, quantity = 1) {
    try {
      const response = await this.apiClient.post("/api/cart", {
        productId,
        quantity,
      });
      return response;
    } catch (error) {
      console.error("Failed to add to cart:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Update item quantity in cart
   */
  async updateCartItem(productId, quantity) {
    try {
      const response = await this.apiClient.put(`/api/cart/${productId}`, {
        quantity,
      });
      return response;
    } catch (error) {
      console.error("Failed to update cart item:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(productId) {
    try {
      const response = await this.apiClient.delete(`/api/cart/${productId}`);
      return response;
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Clear entire cart
   */
  async clearCart() {
    try {
      const response = await this.apiClient.delete("/api/cart");
      return response;
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(couponCode) {
    try {
      const response = await this.apiClient.post("/api/cart/coupon", {
        couponCode,
      });
      return response;
    } catch (error) {
      console.error("Failed to apply coupon:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon() {
    try {
      const response = await this.apiClient.delete("/api/cart/coupon");
      return response;
    } catch (error) {
      console.error("Failed to remove coupon:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Get cart items count
   */
  async getCartCount() {
    try {
      const response = await this.apiClient.get("/api/cart/count");
      return response;
    } catch (error) {
      console.error("Failed to get cart count:", error);
      throw this.handleError(error);
    }
  }
  /**
   * Batch update multiple cart items
   */
  async batchUpdateCart(updates) {
    try {
      const response = await this.apiClient.put("/api/cart/batch", {
        updates,
      });
      return response;
    } catch (error) {
      console.error("Failed to batch update cart:", error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  handleError(error) {
    // Return standardized error format
    return {
      success: false,
      message: error.message || "An error occurred",
      status: error.status || 500,
      errors: error.errors || [],
      isNetworkError: error.isNetworkError || false,
    };
  }
}

// Export singleton instance
export const cartService = new CartServiceClass();
export default cartService;
