// services/orderService.js - Refactored (API Calls Only)
import { useApiClient } from "@/composables/useApiClient";
import { useAuthStore } from "@/stores/authStore";

/**
 * Get authenticated API client instance
 */
const getApiClient = () => {
  const authStore = useAuthStore();
  return useApiClient(authStore.user?.accessToken);
};

/**
 * Build query string from params
 */
const buildQueryString = (params = {}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value);
    }
  });

  return queryParams.toString();
};

/**
 * Validate confirmation data before sending to API
 */
const validateConfirmData = (confirmData) => {
  const validatedData = {};

  if (confirmData.productIds && Array.isArray(confirmData.productIds)) {
    if (confirmData.productIds.length === 0) {
      throw new Error("productIds array cannot be empty");
    }
    validatedData.productIds = confirmData.productIds;
  }

  if (confirmData.sellerId) {
    validatedData.sellerId = confirmData.sellerId;
  }

  if (confirmData.rating) {
    if (confirmData.rating < 1 || confirmData.rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }
    validatedData.rating = Number(confirmData.rating);
  }

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

  return validatedData;
};

/**
 * Validate review data before sending to API
 */
const validateReviewData = (reviewData) => {
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

  return validatedData;
};

/**
 * Validate feedback data before sending to API
 */
const validateFeedbackData = (feedbackData) => {
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

  return validatedData;
};

/**
 * Order API Service
 * Responsibility: API calls only
 */
export const orderService = {
  /**
   * Create order from cart
   */
  async createOrder(orderData) {
    const api = getApiClient();
    return api.post("/api/orders", {
      paymentMethod: orderData.paymentMethod || "shop_pay",
      address_id: orderData.address_id,
      notes: orderData.notes || "",
    });
  },

  /**
   * Pay for order using ShopPay
   */
  async payOrder(orderId, pin) {
    const api = getApiClient();
    return api.post(`/api/orders/${orderId}/payment`, { pin });
  },

  /**
   * Get user orders with filtering and pagination
   */
  async getOrders(params = {}) {
    const api = getApiClient();
    const query = buildQueryString({
      page: params.page || 1,
      limit: params.limit || 10,
      sortBy: params.sortBy || "createdAt",
      sortOrder: params.sortOrder || "desc",
      ...(params.status && params.status !== "all" && { status: params.status }),
      ...(params.sellerStatus && { sellerStatus: params.sellerStatus }),
    });

    return api.get(query ? `/api/orders?${query}` : "/api/orders");
  },

  /**
   * Get order by ID
   */
  async getOrderById(orderId) {
    const api = getApiClient();
    return api.get(`/api/orders/${orderId}`);
  },

  /**
   * Get order by ID with cache busting
   */
  async getOrderByIdFresh(orderId, bustCache = true) {
    const api = getApiClient();
    const url = bustCache 
      ? `/api/orders/${orderId}?t=${Date.now()}` 
      : `/api/orders/${orderId}`;
    
    return api.get(url);
  },

  /**
   * Cancel order (supports partial cancellation)
   */
  async cancelOrder(orderId, reason, itemsToCancel = []) {
    if (!reason || reason.trim() === "") {
      throw new Error("Cancellation reason is required");
    }

    const api = getApiClient();
    return api.patch(`/api/orders/${orderId}/cancel`, {
      reason: reason.trim(),
      itemsToCancel,
    });
  },

  /**
   * Confirm items delivery
   */
  async confirmItemsDelivery(orderId, confirmData = {}) {
    const validatedData = validateConfirmData(confirmData);
    const api = getApiClient();
    return api.patch(`/api/orders/${orderId}/items/received`, validatedData);
  },

  /**
   * Update product review
   */
  async updateProductReview(orderId, productId, reviewData) {
    const validatedData = validateReviewData(reviewData);
    const api = getApiClient();
    return api.patch(
      `/api/orders/${orderId}/items/${productId}/review`,
      validatedData
    );
  },

  /**
   * Update order-level feedback
   */
  async updateOrderFeedback(orderId, feedbackData) {
    const validatedData = validateFeedbackData(feedbackData);
    const api = getApiClient();
    return api.patch(`/api/orders/${orderId}/feedback`, validatedData);
  },
};

export default orderService;