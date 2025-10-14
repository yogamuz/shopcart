// composables/useOrders.js
import { ref, computed } from "vue";
import { useApiClient } from "./useApiClient";
import { useAuthStore } from "@/stores/authStore";

export const useOrders = () => {
  const authStore = useAuthStore();
  const apiClient = useApiClient(authStore.user?.accessToken);

  // State
  const orders = ref([]);
  const currentOrder = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const pagination = ref({
    currentPage: 1,
    totalPages: 0,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Computed - filtered by status
  const pendingOrders = computed(() => orders.value.filter(order => order.statusInfo?.status === "pending"));

  const paidOrders = computed(() => orders.value.filter(order => order.paymentStatus === "paid"));

  const deliveredOrders = computed(() => orders.value.filter(order => order.statusInfo?.status === "delivered"));

  const cancelledOrders = computed(() => orders.value.filter(order => order.statusInfo?.status === "cancelled"));

  // Helper functions
  const clearError = () => {
    error.value = null;
  };

  const formatOrderDate = dateString => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = statusInfo => {
    return statusInfo?.displayStatus || statusInfo?.status || "Unknown";
  };

  const handleApiError = err => {
    error.value = {
      message: err.message || "An error occurred",
      status: err.status || 0,
      details: err.data || null,
    };
    console.error("Order API Error:", err);
  };

  const normalizeOrderData = orderData => {
    if (!orderData) return orderData;

    const generateParcelId = (orderNumber, sellerName, index) => {
      return `${orderNumber}-P${index + 1}`;
    };

    if (orderData.paymentStatus === "pending" && orderData.sellers && Array.isArray(orderData.sellers)) {
      const uniqueSellers = new Set(orderData.sellers.map(s => s.storeName));

      // ✅ Jika HANYA 1 seller - jangan merge, pakai nama toko asli
      if (uniqueSellers.size === 1) {
        const seller = orderData.sellers[0];
        const allItems = orderData.sellers.flatMap(s => s.items);

        orderData.parcels = [
          {
            parcelId: "merged-pending",
            seller: {
              storeName: seller.storeName, // ← Gunakan nama asli
              storeLogo: seller.storeLogo,
              storeSlug: seller.storeSlug,
            },
            status: "pending",
            items: allItems,
            canTrack: false,
            canCancel: true,
            canConfirmDelivery: false,
            subtotal: orderData.totalAmount || orderData.subtotal,
          },
        ];

        orderData.items = allItems;
        return orderData;
      }

      // ✅ Jika LEBIH DARI 1 seller - baru merge dengan "Multiple Sellers"
      const allItems = orderData.sellers.flatMap(seller => seller.items);

      orderData.parcels = [
        {
          parcelId: "merged-pending",
          seller: {
            storeName: "Multiple Sellers",
            storeLogo: null,
            storeSlug: null,
          },
          status: "pending",
          items: allItems,
          canTrack: false,
          canCancel: true,
          canConfirmDelivery: false,
          subtotal: orderData.totalAmount || orderData.subtotal,
        },
      ];

      orderData.items = allItems;
      return orderData;
    }

    // ✅ Jika PAID, split per seller (logic tidak berubah)
    if (orderData.sellers && Array.isArray(orderData.sellers) && !orderData.parcels) {
      orderData.parcels = orderData.sellers.map((seller, index) => ({
        parcelId: seller.parcelId || generateParcelId(orderData.orderNumber, seller.storeName, index),
        seller: {
          storeName: seller.storeName,
          storeSlug: seller.storeSlug,
          storeLogo: seller.storeLogo,
        },
        status: determineSellerStatus(seller.items),
        subtotal: seller.items.reduce((sum, item) => sum + (item.price || item.subtotal || 0) * item.quantity, 0),
        items: seller.items,
        canTrack: orderData.actions?.canTrack || false,
        canCancel: orderData.actions?.canCancel || false,
        canConfirmDelivery: seller.items.some(item => item.status === "delivered"),
        timestamps: seller.timestamps || {},
      }));

      orderData.items = orderData.parcels.flatMap(parcel =>
        parcel.items.map(item => ({
          ...item,
          seller: parcel.seller,
          parcelId: parcel.parcelId,
          parcelStatus: parcel.status,
        }))
      );
    } else if (orderData.parcels && Array.isArray(orderData.parcels)) {
      if (!orderData.items) {
        orderData.items = orderData.parcels.flatMap(parcel =>
          parcel.items.map(item => ({
            ...item,
            seller: parcel.seller,
            parcelId: parcel.parcelId,
            parcelStatus: parcel.status,
          }))
        );
      }
    }

    return orderData;
  };

  const determineSellerStatus = items => {
    if (!items || items.length === 0) return "pending";
    const statuses = [...new Set(items.map(item => item.status))];
    if (statuses.length === 1) return statuses[0];

    // Mixed status priority
    if (items.every(item => item.status === "received")) return "received";
    if (items.some(item => item.status === "received")) return "received";
    if (items.some(item => item.status === "delivered")) return "delivered";
    if (items.some(item => item.status === "shipped")) return "shipped";
    if (items.some(item => item.status === "packed")) return "packed";
    return items[0].status || "pending";
  };
  // Order Creation
  const createOrder = async orderData => {
    try {
      isLoading.value = true;
      clearError();

      const response = await apiClient.post("/orders", orderData);

      if (response.success) {
        if (orders.value.length > 0) {
          orders.value.unshift(normalizeOrderData(response.data));
        }

        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      throw new Error(response.message || "Failed to create order");
    } catch (err) {
      handleApiError(err);
      return {
        success: false,
        error: err.message || "Failed to create order",
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Payment Processing
  const payOrder = async (orderId, pin) => {
    try {
      isLoading.value = true;
      clearError();

      const response = await apiClient.post(`/orders/${orderId}/payment`, { pin });

      if (response.success) {
        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex] = normalizeOrderData({
            ...orders.value[orderIndex],
            ...response.data.order,
            paymentStatus: "paid",
          });
        }

        if (currentOrder.value?.id === orderId) {
          currentOrder.value = normalizeOrderData({
            ...currentOrder.value,
            ...response.data.order,
            paymentStatus: "paid",
          });
        }

        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      throw new Error(response.message || "Payment failed");
    } catch (err) {
      handleApiError(err);
      return {
        success: false,
        error: err.message || "Payment failed",
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Payment Validation
  const validatePayment = async orderId => {
    try {
      isLoading.value = true;
      clearError();

      const response = await apiClient.get(`/orders/${orderId}/payment/validate`);

      if (response.success) {
        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      throw new Error(response.message || "Payment validation failed");
    } catch (err) {
      handleApiError(err);
      return {
        success: false,
        error: err.message || "Payment validation failed",
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Fetch Orders with filtering
  const fetchOrders = async (params = {}) => {
    try {
      isLoading.value = true;
      clearError();

      const queryParams = new URLSearchParams();
      queryParams.append("page", params.page || 1);
      queryParams.append("limit", params.limit || 10);
      queryParams.append("sortBy", params.sortBy || "createdAt");
      queryParams.append("sortOrder", params.sortOrder || "desc");

      // Item-level status filtering
      if (params.status && params.status !== "all") {
        queryParams.append("status", params.status);
      }

      const response = await apiClient.get(`/api/orders?${queryParams}`);

      if (response.success) {
        // Normalize orders with parcel data
        orders.value = response.data.orders.map(normalizeOrderData);
        pagination.value = response.data.pagination;

        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      throw new Error(response.message || "Failed to fetch orders");
    } catch (err) {
      handleApiError(err);
      return {
        success: false,
        error: err.message || "Failed to fetch orders",
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Get Order by ID
  const fetchOrderById = async orderId => {
    try {
      isLoading.value = true;
      clearError();

      const response = await apiClient.get(`/orders/${orderId}`);

      if (response.success) {
        currentOrder.value = normalizeOrderData(response.data);

        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      throw new Error(response.message || "Order not found");
    } catch (err) {
      handleApiError(err);
      return {
        success: false,
        error: err.message || "Failed to fetch order",
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Cancel Order
  const cancelOrder = async (orderId, reason, itemsToCancel = []) => {
    try {
      isLoading.value = true;
      clearError();

      if (!reason || reason.trim() === "") {
        throw new Error("Cancellation reason is required");
      }

      const response = await apiClient.patch(`/orders/${orderId}/cancel`, {
        reason: reason.trim(),
        itemsToCancel, // Support partial cancellation
      });

      if (response.success) {
        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex] = normalizeOrderData({
            ...orders.value[orderIndex],
            status: response.data.status,
            cancelRequest: response.data.cancelRequest,
          });
        }

        if (currentOrder.value?.id === orderId) {
          currentOrder.value = normalizeOrderData({
            ...currentOrder.value,
            status: response.data.status,
            cancelRequest: response.data.cancelRequest,
          });
        }

        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      throw new Error(response.message || "Failed to cancel order");
    } catch (err) {
      handleApiError(err);
      return {
        success: false,
        error: err.message || "Failed to cancel order",
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Confirm items delivery - dynamic (product/parcel/all)
   */
  const confirmItemsDelivery = async (orderId, confirmData = {}) => {
    try {
      isLoading.value = true;
      clearError();

      const response = await apiClient.patch(`/orders/${orderId}/items/received`, confirmData);

      if (response.success) {
        // Refresh current order
        if (currentOrder.value?.id === orderId) {
          await fetchOrderById(orderId);
        }

        // Update in list
        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          await fetchOrderById(orderId);
        }

        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      throw new Error(response.message || "Failed to confirm delivery");
    } catch (err) {
      handleApiError(err);
      return {
        success: false,
        error: err.message || "Failed to confirm delivery",
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Update Order Feedback
  const updateOrderFeedback = async (orderId, feedbackData) => {
    try {
      isLoading.value = true;
      clearError();

      const response = await apiClient.patch(`/orders/${orderId}/feedback`, feedbackData);

      if (response.success) {
        if (currentOrder.value?.id === orderId) {
          currentOrder.value.customerFeedback = response.data.feedback;
        }

        return {
          success: true,
          data: response.data,
          message: response.message,
        };
      }

      throw new Error(response.message || "Failed to update feedback");
    } catch (err) {
      handleApiError(err);
      return {
        success: false,
        error: err.message || "Failed to update feedback",
      };
    } finally {
      isLoading.value = false;
    }
  };

  // Utility functions
  const refreshOrders = async () => {
    return await fetchOrders();
  };

  const refreshCurrentOrder = async () => {
    if (currentOrder.value?.id) {
      return await fetchOrderById(currentOrder.value.id);
    }
    return { success: false, error: "No current order to refresh" };
  };

  const getOrderStatusColor = statusInfo => {
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
  };

  const canCancelOrder = order => {
    return order.statusInfo?.canCancel || false;
  };

  const canPayOrder = order => {
    return order.statusInfo?.canPay || false;
  };

  const canConfirmDelivery = order => {
    return order.statusInfo?.canConfirmDelivery || false;
  };

  const isOrderExpired = order => {
    if (!order.expiresAt) return false;
    return new Date(order.expiresAt) < new Date();
  };

  // Reset functions
  const clearOrders = () => {
    orders.value = [];
    currentOrder.value = null;
    pagination.value = {
      currentPage: 1,
      totalPages: 0,
      totalOrders: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  };

  const clearCurrentOrder = () => {
    currentOrder.value = null;
  };

  return {
    // State
    orders,
    currentOrder,
    isLoading,
    error,
    pagination,

    // Computed
    pendingOrders,
    paidOrders,
    deliveredOrders,
    cancelledOrders,

    // Core Functions
    createOrder,
    payOrder,
    validatePayment,
    fetchOrders,
    fetchOrderById,
    cancelOrder,
    confirmItemsDelivery,
    updateOrderFeedback,

    // Utility Functions
    refreshOrders,
    refreshCurrentOrder,
    getOrderStatusColor,
    canCancelOrder,
    canPayOrder,
    canConfirmDelivery,
    isOrderExpired,

    // Reset Functions
    clearOrders,
    clearCurrentOrder,
    clearError,
    formatOrderDate,
    getStatusText,
  };
};
