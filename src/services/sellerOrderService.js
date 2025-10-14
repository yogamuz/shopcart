// services/sellerOrderService.js
import { useApiClient } from "@/composables/useApiClient";

export class SellerOrderService {
  constructor() {
    this.api = useApiClient();
  }
  // Tambahkan method ini SETELAH constructor di SellerOrderService class

  /**
   * Test connection to seller orders endpoint
   */
  async testConnection() {
    try {
      // Try a lightweight request to check if endpoint exists
      const response = await this.api.get("api/seller/orders?page=1&limit=1");
      return { success: true, data: response };
    } catch (error) {
      // If 404, endpoint doesn't exist
      if (error.status === 404) {
        return { success: false, error: "Endpoint not found" };
      }
      // Other errors might be auth issues but endpoint exists
      return { success: error.status !== 404, error: error.message };
    }
  }

  /**
   * Get seller orders with filtering and pagination
   */
async getSellerOrders(params = {}) {
  const queryParams = new URLSearchParams();

  // Add pagination
  if (params.page) queryParams.set("page", params.page);
  if (params.limit) queryParams.set("limit", params.limit);

  // Add filters
  if (params.status) queryParams.set("status", params.status);
  if (params.sortBy) queryParams.set("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);
  
  // Add date range filters - TAMBAHKAN INI
  if (params.startDate) queryParams.set("startDate", params.startDate);
  if (params.endDate) queryParams.set("endDate", params.endDate);

  // Add search query - TAMBAHKAN INI
  if (params.customer) queryParams.set("customer", params.customer);
  if (params.productName) queryParams.set("productName", params.productName);

  const query = queryParams.toString();
  return await this.api.get(`/api/seller/orders${query ? `?${query}` : ""}`);
}

  /**
   * Ship order - Change status to shipped
   */
async shipOrder(orderId, shippingDetails) {
  return await this.api.patch(
    `/api/seller/orders/${orderId}/ship`,
    shippingDetails
  );
}


  /**
   * Get seller earnings
   */
async getSellerEarnings(params = {}) {
  const queryParams = new URLSearchParams();

  if (params.period) queryParams.set("period", params.period);
  if (params.status) queryParams.set("status", params.status);

  const query = queryParams.toString();
  return await this.api.get(
    `/api/seller/orders/earnings${query ? `?${query}` : ""}`
  );
}

  /**
   * Get seller reviews
   */
  async getSellerReviews(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.set("page", params.page);
    if (params.limit) queryParams.set("limit", params.limit);
    if (params.productId) queryParams.set("productId", params.productId);
    if (params.rating) queryParams.set("rating", params.rating);
    if (params.sortBy) queryParams.set("sortBy", params.sortBy);
    if (params.sortOrder) queryParams.set("sortOrder", params.sortOrder);

    const query = queryParams.toString();
    return await this.api.get(
      `api/seller/orders/reviews${query ? `?${query}` : ""}`
    );
  }

  /**
   * Get seller review statistics
   */
  async getSellerReviewStats(params = {}) {
    const queryParams = new URLSearchParams();

    if (params.period) queryParams.set("period", params.period);

    const query = queryParams.toString();
    return await this.api.get(
      `api/seller/orders/reviews/stats${query ? `?${query}` : ""}`
    );
  }
}
