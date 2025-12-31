// services/cartService.js
import { useApiClient } from "@/composables/useApiClient";

const apiClient = useApiClient();

/**
 * Cart API service
 * Handles cart-related API calls only
 */
export const cartService = {
  /**
   * Fetches the current user's cart
   */
  async getCart() {
    return apiClient.get("/api/cart");
  },

  /**
   * Adds a product to the cart
   */
  async addToCart(productId, quantity = 1) {
    return apiClient.post("/api/cart", { productId, quantity });
  },

  /**
   * Updates cart item quantity
   */
  async updateCartItem(productId, quantity) {
    return apiClient.put(`/api/cart/${productId}`, { quantity });
  },

  /**
   * Removes an item from the cart
   */
  async removeFromCart(productId) {
    return apiClient.delete(`/api/cart/${productId}`);
  },

  /**
   * Clears all cart items
   */
  async clearCart() {
    return apiClient.delete("/api/cart");
  },

  /**
   * Applies a coupon code
   */
  async applyCoupon(couponCode) {
    return apiClient.post("/api/cart/coupon", { couponCode });
  },

  /**
   * Removes applied coupon
   */
  async removeCoupon() {
    return apiClient.delete("/api/cart/coupon");
  },

  /**
   * Fetches cart item count only
   */
  async getCartCount() {
    return apiClient.get("/api/cart/count");
  },

  /**
   * Batch updates cart items
   */
  async batchUpdateCart(updates) {
    return apiClient.put("/api/cart/batch", { updates });
  },
};
