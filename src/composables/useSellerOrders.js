// composables/useSellerOrders.js
import { ref, computed, onMounted, getCurrentInstance } from "vue";
import { SellerOrderService } from "@/services/sellerOrderService";
import { get } from "lodash";

export const useSellerOrders = (options = { autoFetch: true }) => {
  const service = new SellerOrderService();

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

  const totalOrdersCount = ref(0);
  const instance = getCurrentInstance();
  
  // Filter states
  const filters = ref({
    status: "",
    sortBy: "createdAt",
    sortOrder: "desc",
    page: 1,
    limit: 10,
  });
  
  const dateRange = ref({
    start: "",
    end: "",
  });

  const searchFilters = ref({
    customer: "",
    productName: "",
  });

  // Computed
  const pendingOrders = computed(() =>
    orders.value.filter((order) => order.status === "pending")
  );

  const packedOrders = computed(() =>
    orders.value.filter((order) => order.status === "packed")
  );

  const shippedOrders = computed(() =>
    orders.value.filter((order) => order.status === "shipped")
  );

  const deliveredOrders = computed(() =>
    orders.value.filter((order) => order.status === "delivered")
  );

  const cancelledOrders = computed(() =>
    orders.value.filter((order) => order.status === "cancelled")
  );

  const cancellationRequestedOrders = computed(() =>
    orders.value.filter((order) => order.status === "cancellation_requested")
  );

  const totalRevenue = computed(() =>
    orders.value.reduce((sum, order) => sum + order.sellerInfo.earnings, 0)
  );

  const averageOrderValue = computed(() => {
    if (orders.value.length === 0) return 0;
    return totalRevenue.value / orders.value.length;
  });

  const fetchOrders = async (queryParams = {}) => {
    try {
      isLoading.value = true;
      error.value = null;

      // Merge filters with date range and search filters
      const params = {
        ...filters.value,
        ...queryParams,
        // Add date range parameters if they exist
        ...(dateRange.value.start && { startDate: dateRange.value.start }),
        ...(dateRange.value.end && { endDate: dateRange.value.end }),
        // Add search parameters if they exist
        ...(searchFilters.value.customer && {
          customer: searchFilters.value.customer,
        }),
        ...(searchFilters.value.productName && {
          productName: searchFilters.value.productName,
        }),
      };

      const response = await service.getSellerOrders(params);

      if (response && response.success) {
        orders.value = response.data?.orders || [];
        pagination.value = response.data?.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalOrders: 0,
          hasNextPage: false,
          hasPrevPage: false,
        };

        totalOrdersCount.value = pagination.value.totalOrders || 0;
        instance.emit(
          "orders-count-updated",
          pagination.value.totalOrders || 0
        );
        Object.assign(filters.value, params);
        return response;
      }

      throw new Error(response?.message || "Failed to fetch orders");
    } catch (err) {
      console.error("Fetch orders error:", err);

      // Handle 404 specifically
      if (err.status === 404) {
        error.value =
          "Seller orders endpoint not configured. Please check your seller role or contact support.";
        orders.value = [];
        pagination.value = {
          currentPage: 1,
          totalPages: 0,
          totalOrders: 0,
          hasNextPage: false,
          hasPrevPage: false,
        };
        return { success: false, message: error.value };
      } else if (err.status === 401) {
        error.value = "Authentication required. Please login again.";
      } else if (err.status === 403) {
        error.value = "You do not have seller permissions.";
      } else if (err.isNetworkError) {
        error.value =
          "Network connection error. Please check your internet connection.";
      } else {
        error.value = err.message || "Failed to fetch orders";
      }

      // Set empty state for all errors
      orders.value = [];
      pagination.value = {
        currentPage: 1,
        totalPages: 0,
        totalOrders: 0,
        hasNextPage: false,
        hasPrevPage: false,
      };

      // Don't throw on 404, just return error state
      if (err.status !== 404) {
        throw err;
      }
    } finally {
      isLoading.value = false;
    }
  };

  const shipOrder = async (orderId, shippingDetails) => {
    try {
      isLoading.value = true;
      error.value = null;

      const response = await service.shipOrder(orderId, shippingDetails);

      if (response.success) {
        const orderIndex = orders.value.findIndex(
          (order) => order.id === orderId
        );

        if (orderIndex !== -1) {
          const updatedOrder = orders.value[orderIndex];
          const responseData = response.data;

          // Update order dengan data dari backend response
          orders.value[orderIndex] = {
            ...updatedOrder,
            // Status bisa berubah ke "shipped" jika semua seller sudah ship
            status: responseData.status || updatedOrder.status,

            // Update shipping info
            shippingInfo: {
              ...updatedOrder.shippingInfo,
              trackingNumber: responseData.shippingInfo?.trackingNumber,
              courier: responseData.shippingInfo?.courier,
              shippedAt: responseData.shippingInfo?.shippedAt,
              estimatedDelivery: responseData.shippingInfo?.estimatedDelivery,
            },

            // Update timestamps
            timestamps: {
              ...updatedOrder.timestamps,
              shippedAt:
                responseData.shippingInfo?.shippedAt || new Date().toISOString(),
            },

            // Update sellerInfo to reflect shipped status
            sellerInfo: {
              ...updatedOrder.sellerInfo,
              canShip: false, // Seller can't ship again
            },
          };
        }

        return response;
      }

      throw new Error(response.message || "Failed to ship order");
    } catch (err) {
      error.value = err.message || "Failed to ship order";
      console.error("Ship order error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const setFilters = (newFilters) => {
    Object.assign(filters.value, newFilters);
  };

  const setDateRange = (newDateRange) => {
    dateRange.value = { ...dateRange.value, ...newDateRange };
  };

  const setSearchFilters = (newSearchFilters) => {
    searchFilters.value = { ...searchFilters.value, ...newSearchFilters };
  };

  const performSmartSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      // Clear both search filters if empty
      searchFilters.value = {
        customer: "",
        productName: "",
      };
      return;
    }

    const trimmedTerm = searchTerm.trim();

    // Improved heuristic: Check if it looks like a person's name
    const looksLikeName =
      /^[a-zA-Z]+$/.test(trimmedTerm) &&
      trimmedTerm.length >= 3 &&
      trimmedTerm.length <= 20 &&
      !/\d/.test(trimmedTerm) && // no numbers
      !/(mini|max|pro|plus|lite|premium|size|color)/i.test(trimmedTerm);

    if (looksLikeName) {
      // Search customer first, clear product search
      searchFilters.value = {
        customer: trimmedTerm,
        productName: "",
      };
    } else {
      // Search product first, clear customer search
      searchFilters.value = {
        customer: "",
        productName: trimmedTerm,
      };
    }
  };

  const resetFilters = () => {
    filters.value = {
      status: "",
      sortBy: "createdAt",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    };
    dateRange.value = {
      start: "",
      end: "",
    };
    searchFilters.value = {
      customer: "",
      productName: "",
    };
  };

  const clearError = () => {
    error.value = null;
  };

  const clearCurrentOrder = () => {
    currentOrder.value = null;
  };

  const clearOrders = () => {
    orders.value = [];
    pagination.value = {
      currentPage: 1,
      totalPages: 0,
      totalOrders: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };
  };

  // Helpers
  const getOrderById = (orderId) => {
    return orders.value.find((order) => order.id === orderId);
  };

  const canShipOrder = (order) => {
    return order.status === "packed" && order.sellerInfo.canShip;
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      pending: "orange",
      packed: "blue",
      shipped: "purple",
      delivered: "green",
      received: "emerald",
      cancelled: "red",
      cancellation_requested: "yellow",
    };
    return colors[status] || "gray";
  };

  const getOrderStatusText = (status) => {
    const texts = {
      pending: "Pending",
      packed: "Packed",
      shipped: "Shipped",
      delivered: "Delivered",
      received: "Received",
      cancelled: "Cancelled",
      cancellation_requested: "Cancel Requested",
    };
    return texts[status] || "Unknown";
  };

  const getPaymentStatusColor = (paymentStatus) => {
    const colors = {
      paid: "green",
      pending: "orange",
      failed: "red",
      not_paid: "gray",
    };
    return colors[paymentStatus] || "gray";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  // Auto-fetch on mount if enabled
  if (options.autoFetch) {
    onMounted(() => {
      fetchOrders();
    });
  }

  return {
    // State
    orders,
    currentOrder,
    isLoading,
    error,
    pagination,
    filters,
    dateRange,
    searchFilters,
    totalOrdersCount,

    // Computed
    pendingOrders,
    packedOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,
    cancellationRequestedOrders,
    totalRevenue,
    averageOrderValue,

    // Actions
    fetchOrders,
    shipOrder,
    setFilters,
    setDateRange,
    setSearchFilters,
    performSmartSearch,
    resetFilters,
    clearError,
    clearCurrentOrder,
    clearOrders,

    // Helpers
    getOrderById,
    canShipOrder,
    getOrderStatusColor,
    getOrderStatusText,
    getPaymentStatusColor,
    formatCurrency,
    formatDate,
  };
};