// composables/useCancelRequests.js - Enhanced untuk handle order-specific cancel requests
import { ref, computed } from "vue";
import { CancelRequestService } from "@/services/sellerCancelRequestService";
import { useAuthStore } from "@/stores/authStore";
import { useApiClient } from "@/composables/useApiClient";

export const useCancelRequests = () => {
  const authStore = useAuthStore();
  const service = new CancelRequestService(authStore.user?.accessToken);
  const { get: apiGet } = useApiClient(authStore.user?.accessToken);

  const pendingRequests = ref([]);
  const cancelRequestsData = ref(new Map());
  const isLoading = ref(false);
  const error = ref(null);
  const pagination = ref({
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Fetch pending cancel requests
  const fetchPendingRequests = async (params = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await service.getPendingRequests(params);

      // Handle the API response structure based on your example
      if (result.success && result.data) {
        pendingRequests.value = result.data.requests || [];

        if (result.data.pagination) {
          pagination.value = {
            currentPage: result.data.pagination.currentPage,
            totalPages: result.data.pagination.totalPages,
            totalRequests: result.data.pagination.totalRequests,
            hasNextPage: result.data.pagination.hasNextPage,
            hasPrevPage: result.data.pagination.hasPrevPage,
          };
        }
      } else {
        // Fallback if structure is different
        pendingRequests.value = result.requests || [];
        pagination.value = result.pagination || pagination.value;
      }

      return result;
    } catch (err) {
      error.value = err.message || "Failed to fetch cancel requests";
      console.error("Error fetching cancel requests:", err);

      // Set empty state on error
      pendingRequests.value = [];
      pagination.value = {
        currentPage: 1,
        totalPages: 1,
        totalRequests: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };

      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch cancel request data for multiple orders - Updated to use existing pending requests
  const fetchCancelRequestsForOrders = async orderIds => {
    if (!orderIds || orderIds.length === 0) return;

    try {
      // Instead of fetching per order, use the pending requests data we already have
      // First fetch pending requests if not already loaded
      if (pendingRequests.value.length === 0) {
        await fetchPendingRequests();
      }

      // Map pending requests to order IDs
      orderIds.forEach(orderId => {
        const hasRequest = pendingRequests.value.some(
          request => request.order && (request.order.id === orderId || request.order.orderNumber === orderId)
        );

        cancelRequestsData.value.set(orderId, {
          hasPendingCancelRequest: hasRequest,
          cancelRequestId: hasRequest
            ? pendingRequests.value.find(r => r.order && (r.order.id === orderId || r.order.orderNumber === orderId))
                ?.id
            : null,
        });
      });
    } catch (error) {
      console.error("Error fetching cancel request data:", error);
      // Set default false for all orders
      orderIds.forEach(orderId => {
        cancelRequestsData.value.set(orderId, { hasPendingCancelRequest: false });
      });
    }
  };

  // Check if order has pending cancel request
  const hasOrderCancelRequest = orderId => {
    const data = cancelRequestsData.value.get(orderId);
    return data?.hasPendingCancelRequest || false;
  };

  // Get cancel request data for order
  const getOrderCancelRequest = orderId => {
    return (
      cancelRequestsData.value.get(orderId) || {
        hasPendingCancelRequest: false,
      }
    );
  };

  // FILE: composables/useCancelRequests.js

  const respondToCancelRequest = async (requestId, itemResponses = []) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Validate itemResponses structure
      if (!Array.isArray(itemResponses) || itemResponses.length === 0) {
        throw new Error("itemResponses must be a non-empty array");
      }

      // Validate each item has required fields
      for (const item of itemResponses) {
        if (!item.productId || !item.response) {
          throw new Error("Each item must have productId and response");
        }
        if (!["approved", "rejected"].includes(item.response)) {
          throw new Error('Response must be "approved" or "rejected"');
        }
      }

      // Call service with correct payload structure
      const result = await service.respondToRequest(requestId, itemResponses);

      // Handle successful response
      if (result.success) {
        // Update the local pending requests list
        const requestIndex = pendingRequests.value.findIndex(req => req.id === requestId);

        if (requestIndex !== -1) {
          // If all sellers have responded, remove from pending
          if (result.data?.allSellersResponded) {
            pendingRequests.value.splice(requestIndex, 1);
            // Update pagination
            pagination.value.totalRequests = Math.max(0, pagination.value.totalRequests - 1);
          }
        }

        return {
          success: true,
          allSellersResponded: result.data?.allSellersResponded || false,
          message: result.message || "Request processed successfully",
          data: result.data,
        };
      }

      throw new Error(result.message || "Failed to process request");
    } catch (err) {
      error.value = err.message || "Failed to process cancel request";
      console.error("Error responding to cancel request:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // REVISI fungsi approveCancelRequest (GANTI seluruh function - letakkan setelah respondToCancelRequest)
  const approveCancelRequest = async (orderId, orderData, reason = "") => {
    try {
      if (!orderData?.cancelRequestId) {
        throw new Error("Cancel request not found for this order");
      }

      // Build itemResponses array dari order items
      const itemResponses =
        orderData.items?.map(item => ({
          productId: item.productId,
          response: "approved",
          responseReason: reason,
        })) || [];

      if (itemResponses.length === 0) {
        throw new Error("No items found in order to approve");
      }

      const result = await respondToCancelRequest(orderData.cancelRequestId, itemResponses);

      // Update local data
      cancelRequestsData.value.set(orderId, {
        ...orderData,
        hasPendingCancelRequest: !result.allSellersResponded,
        yourResponse: "approved",
      });

      return result;
    } catch (error) {
      console.error("Error approving cancel request:", error);
      throw error;
    }
  };

  // REVISI fungsi rejectCancelRequest (GANTI seluruh function - letakkan setelah approveCancelRequest)
  const rejectCancelRequest = async (orderId, orderData, reason = "") => {
    try {
      if (!orderData?.cancelRequestId) {
        throw new Error("Cancel request not found for this order");
      }

      // Build itemResponses array dari order items
      const itemResponses =
        orderData.items?.map(item => ({
          productId: item.productId,
          response: "rejected",
          responseReason: reason,
        })) || [];

      if (itemResponses.length === 0) {
        throw new Error("No items found in order to reject");
      }

      const result = await respondToCancelRequest(orderData.cancelRequestId, itemResponses);

      // Update local data
      cancelRequestsData.value.set(orderId, {
        ...orderData,
        hasPendingCancelRequest: !result.allSellersResponded,
        yourResponse: "rejected",
      });

      return result;
    } catch (error) {
      console.error("Error rejecting cancel request:", error);
      throw error;
    }
  };

  // Get request details
const getRequestDetails = async requestId => {
  try {
    isLoading.value = true;
    error.value = null;

    const result = await service.getRequestDetails(requestId);

    if (result.success) {
      // Return full response object agar component bisa akses result.data
      return {
        success: true,
        data: result.data,
        message: result.message,
      };
    }

    throw new Error(result.message || "Failed to get request details");
  } catch (err) {
    error.value = err.message || "Failed to get request details";
    console.error("Error getting request details:", err);
    throw err;
  } finally {
    isLoading.value = false;
  }
};
  // Computed properties
  const hasPendingRequests = computed(() => pendingRequests.value.length > 0);

  const totalPendingCount = computed(() => pagination.value.totalRequests || pendingRequests.value.length);

  // Clear error
  const clearError = () => {
    error.value = null;
  };

  // Clear requests
  const clearRequests = () => {
    pendingRequests.value = [];
    pagination.value = {
      currentPage: 1,
      totalPages: 1,
      totalRequests: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  };

  // Clear cancel requests data map
  const clearCancelRequestsData = () => {
    cancelRequestsData.value.clear();
  };

  return {
    // State
    pendingRequests,
    cancelRequestsData,
    isLoading,
    error,
    pagination,

    // Computed
    hasPendingRequests,
    totalPendingCount,

    // Methods - General cancel requests
    fetchPendingRequests,
    respondToCancelRequest,
    getRequestDetails,
    clearError,
    clearRequests,

    // Methods - Order-specific cancel requests
    fetchCancelRequestsForOrders,
    hasOrderCancelRequest,
    getOrderCancelRequest,
    approveCancelRequest,
    rejectCancelRequest,
    clearCancelRequestsData,
  };
};

// Export alias untuk backward compatibility
export const useSellerCancelRequests = useCancelRequests;
