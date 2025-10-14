// services/orderService.js
import { useApiClient } from "@/composables/useApiClient";
import { useAuthStore } from "@/stores/authStore";

class OrderService {
  constructor() {
    this.authStore = useAuthStore();
  }

  getApiClient() {
    return useApiClient(this.authStore.user?.accessToken);
  }

  /**
   * Create order from cart
   * Route: POST /api/orders
   */
  async createOrder(orderData) {
    try {
      const api = this.getApiClient();
      const response = await api.post("/api/orders", {
        paymentMethod: orderData.paymentMethod || "shop_pay",
        address_id: orderData.address_id,
        notes: orderData.notes || "",
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Pay for order using ShopPay
   * Route: POST /api/orders/:orderId/payment
   */
  async payOrder(orderId, pin) {
    try {
      const api = this.getApiClient();
      const response = await api.post(`/api/orders/${orderId}/payment`, { pin });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get user orders with filtering and pagination
   * Route: GET /api/orders
   */
  async getOrders(params = {}) {
    try {
      const api = this.getApiClient();
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        sortBy: params.sortBy || "createdAt",
        sortOrder: params.sortOrder || "desc",
      });

      if (params.status && params.status !== 'all') {
        queryParams.append("status", params.status);
      }

      if (params.sellerStatus) {
        queryParams.append("sellerStatus", params.sellerStatus);
      }

      const response = await api.get(`/api/orders?${queryParams}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order by ID
   * Route: GET /api/orders/:orderId
   */
  async getOrderById(orderId) {
    try {
      const api = this.getApiClient();
      const response = await api.get(`/api/orders/${orderId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order by ID with cache busting
   * Route: GET /api/orders/:orderId?t=timestamp
   */
  async getOrderByIdFresh(orderId, bustCache = true) {
    try {
      const api = this.getApiClient();
      const url = bustCache 
        ? `/api/orders/${orderId}?t=${Date.now()}` 
        : `/api/orders/${orderId}`;
      
      const response = await api.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Cancel order (supports partial cancellation)
   * Route: PATCH /api/orders/:orderId/cancel
   */
  async cancelOrder(orderId, reason, itemsToCancel = []) {
    try {
      if (!reason || reason.trim() === "") {
        throw new Error("Cancellation reason is required");
      }

      const api = this.getApiClient();
      const response = await api.patch(`/api/orders/${orderId}/cancel`, {
        reason: reason.trim(),
        itemsToCancel,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }
/**
 * Confirm items delivery (dynamic: specific products, seller parcel, or all items)
 * Route: PATCH /api/orders/:orderId/items/received
 */
async confirmItemsDelivery(orderId, confirmData = {}) {
  try {
    const api = this.getApiClient();
    
    const validatedData = {};

    // Validate productIds if provided
    if (confirmData.productIds && Array.isArray(confirmData.productIds)) {
      if (confirmData.productIds.length === 0) {
        throw new Error("productIds array cannot be empty");
      }
      validatedData.productIds = confirmData.productIds;
    }

    // Validate sellerId if provided
    if (confirmData.sellerId) {
      validatedData.sellerId = confirmData.sellerId;
    }

    // Validate rating if provided
    if (confirmData.rating) {
      if (confirmData.rating < 1 || confirmData.rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }
      validatedData.rating = Number(confirmData.rating);
    }

    // Validate review if provided
    if (confirmData.review) {
      const reviewText = confirmData.review.trim();
      if (reviewText.length < 10) {
        throw new Error("Review must be at least 10 characters");
      }
      if (reviewText.length > 1000) {
        throw new Error("Review cannot exceed 1000 characters");
      }
      validatedData.review = reviewText;
    }

    const response = await api.patch(
      `/api/orders/${orderId}/items/received`,
      validatedData
    );
    
    return response;
  } catch (error) {
    throw error;
  }
}

  /**
   * Update product review (after product already received)
   * Route: PATCH /api/orders/:orderId/items/:productId/review
   */
  async updateProductReview(orderId, productId, reviewData) {
    try {
      const api = this.getApiClient();

      const validatedData = {};

      if (reviewData.rating) {
        if (reviewData.rating < 1 || reviewData.rating > 5) {
          throw new Error("Rating must be between 1 and 5");
        }
        validatedData.rating = Number(reviewData.rating);
      }

      if (reviewData.review) {
        const reviewText = reviewData.review.trim();
        if (reviewText.length < 10) {
          throw new Error("Review must be at least 10 characters");
        }
        if (reviewText.length > 1000) {
          throw new Error("Review cannot exceed 1000 characters");
        }
        validatedData.review = reviewText;
      }

      const response = await api.patch(
        `/api/orders/${orderId}/items/${productId}/review`,
        validatedData
      );

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update order-level feedback
   * Route: PATCH /api/orders/:orderId/feedback
   */
  async updateOrderFeedback(orderId, feedbackData) {
    try {
      const api = this.getApiClient();

      const validatedData = {};

      if (feedbackData.rating) {
        if (feedbackData.rating < 1 || feedbackData.rating > 5) {
          throw new Error("Rating must be between 1 and 5");
        }
        validatedData.rating = Number(feedbackData.rating);
      }

      if (feedbackData.review) {
        const reviewText = feedbackData.review.trim();
        if (reviewText.length > 1000) {
          throw new Error("Review cannot exceed 1000 characters");
        }
        validatedData.review = reviewText;
      }

      if (feedbackData.productReviews && Array.isArray(feedbackData.productReviews)) {
        validatedData.productReviews = feedbackData.productReviews.map(review => {
          const validatedReview = { productId: review.productId };

          if (!review.productId) {
            throw new Error("Product ID is required for product reviews");
          }

          if (review.rating) {
            if (review.rating < 1 || review.rating > 5) {
              throw new Error("Product rating must be between 1 and 5");
            }
            validatedReview.rating = Number(review.rating);
          }

          if (review.comment) {
            const comment = review.comment.trim();
            if (comment.length < 10) {
              throw new Error("Product review must be at least 10 characters");
            }
            if (comment.length > 1000) {
              throw new Error("Product review cannot exceed 1000 characters");
            }
            validatedReview.comment = comment;
          }

          return validatedReview;
        });
      }

      const response = await api.patch(`/api/orders/${orderId}/feedback`, validatedData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Utility: Check if order can be cancelled
   */
  canCancelOrder(order) {
    return order.statusInfo?.canCancel || false;
  }

  /**
   * Utility: Check if order can be paid
   */
  canPayOrder(order) {
    return order.statusInfo?.canPay || false;
  }

  /**
   * Utility: Check if delivery can be confirmed
   */
  canConfirmDelivery(order) {
    return order.statusInfo?.canConfirmDelivery || false;
  }

  /**
   * Utility: Check if feedback can be added
   */
  canAddFeedback(order) {
    return order.statusInfo?.isCompleted || false;
  }

  /**
   * Utility: Check if order is expired
   */
  isOrderExpired(order) {
    if (!order.expiresAt) return false;
    return new Date(order.expiresAt) < new Date();
  }

  /**
   * Utility: Get time until order expires
   */
  getTimeUntilExpiry(order) {
    if (!order.expiresAt) return null;

    const expiryTime = new Date(order.expiresAt);
    const now = new Date();
    const diff = expiryTime - now;

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Utility: Format order status for display
   */
  formatOrderStatus(statusInfo) {
    return statusInfo?.displayStatus || statusInfo?.status || "Unknown";
  }

  /**
   * Utility: Get status color for UI
   */
  getOrderStatusColor(statusInfo) {
    const status = statusInfo?.status || statusInfo;
    const statusColors = {
      pending: "orange",
      packed: "blue",
      processing: "blue",
      shipped: "purple",
      delivered: "green",
      received: "emerald",
      cancelled: "red",
      cancellation_requested: "amber",
    };
    return statusColors[status] || "gray";
  }
}

export default new OrderService();