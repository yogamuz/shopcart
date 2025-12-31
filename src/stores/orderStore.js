// stores/orderStore.js - Refactored Clean Version
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { orderService } from "@/services/orderService";
import { useOrderNormalizer } from "@/composables/useOrderNormalizer";
import { useOrderUtils } from "@/composables/useOrderUtils";

export const useOrderStore = defineStore("orders", () => {
  // ============================================================================
  // COMPOSABLES
  // ============================================================================
  
  const { normalizeOrderData } = useOrderNormalizer();
  const orderUtils = useOrderUtils();

  // ============================================================================
  // STATE
  // ============================================================================
  
  const orders = ref([]);
  const currentOrder = ref(null);
  const selectedParcelId = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const pagination = ref({
    currentPage: 1,
    totalPages: 0,
    totalOrders: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Loading states for specific actions
  const isCreatingOrder = ref(false);
  const isPayingOrder = ref(false);
  const isCancellingOrder = ref(false);
  const isConfirmingDelivery = ref(false);
  const isUpdatingFeedback = ref(false);

  // ============================================================================
  // COMPUTED - FILTERED ORDERS
  // ============================================================================

  /**
   * Filter orders by item status
   */
  const filterOrdersByItemStatus = (status) => {
    return orders.value.filter(order => {
      if (order.sellers?.some(s => s.items?.some(i => i.status === status))) return true;
      if (order.parcels?.some(p => p.items?.some(i => i.status === status))) return true;
      if (order.items?.some(i => i.status === status)) return true;
      return false;
    });
  };

  const pendingOrders = computed(() => {
    return orders.value.filter(order => {
      if (order.paymentStatus === "pending") return true;
      return filterOrdersByItemStatus("pending").includes(order);
    });
  });

  const packedOrders = computed(() => filterOrdersByItemStatus("packed"));
  const shippedOrders = computed(() => filterOrdersByItemStatus("shipped"));
  const deliveredOrders = computed(() => filterOrdersByItemStatus("delivered"));
  const receivedOrders = computed(() => filterOrdersByItemStatus("received"));
  const cancelledOrders = computed(() => filterOrdersByItemStatus("cancelled"));

  const cancellationRequestedOrders = computed(() => {
    return orders.value.filter(order => order.status === "cancellation_requested");
  });

  const paidOrders = computed(() => {
    return orders.value.filter(order => order.paymentStatus === "paid");
  });

  const unpaidOrders = computed(() => {
    return orders.value.filter(order => order.paymentStatus === "pending");
  });

  const refundedOrders = computed(() => {
    return orders.value.filter(order => order.paymentStatus === "refunded");
  });

  /**
   * Display order based on selected parcel
   */
  const displayOrder = computed(() => {
    if (!currentOrder.value || !selectedParcelId.value) {
      return currentOrder.value;
    }

    const targetParcel = currentOrder.value.parcels?.find(
      p => p.parcelId === selectedParcelId.value || p.seller?.storeName === selectedParcelId.value
    );

    if (!targetParcel) {
      return currentOrder.value;
    }

    return {
      ...currentOrder.value,
      parcels: [targetParcel],
      totalAmount: targetParcel.subtotal,
    };
  });

  // ============================================================================
  // COMPUTED - STATISTICS
  // ============================================================================

  const orderStats = computed(() => ({
    total: orders.value.length,
    pending: pendingOrders.value.length,
    packed: packedOrders.value.length,
    shipped: shippedOrders.value.length,
    delivered: deliveredOrders.value.length,
    received: receivedOrders.value.length,
    cancelled: cancelledOrders.value.length,
    cancellationRequested: cancellationRequestedOrders.value.length,
    paid: paidOrders.value.length,
    unpaid: unpaidOrders.value.length,
    refunded: refundedOrders.value.length,
  }));

  const actionableOrders = computed(() => ({
    canPay: orders.value.filter(order => order.statusInfo?.canPay),
    canCancel: orders.value.filter(order => order.statusInfo?.canCancel),
    canConfirm: orders.value.filter(order => order.statusInfo?.canConfirmDelivery),
    canReview: orders.value.filter(order => order.statusInfo?.isCompleted),
    expired: orders.value.filter(order => orderUtils.isOrderExpired(order)),
  }));

  const getTotalSpent = computed(() => {
    return orders.value
      .filter(order => order.paymentStatus === "paid")
      .reduce((total, order) => total + (order.totalAmount || 0), 0);
  });

  const getMonthlySpending = computed(() => {
    const monthlyData = {};

    orders.value
      .filter(order => order.paymentStatus === "paid")
      .forEach(order => {
        const date = new Date(order.createdAt);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            month: monthKey,
            total: 0,
            count: 0,
          };
        }

        monthlyData[monthKey].total += order.totalAmount || 0;
        monthlyData[monthKey].count += 1;
      });

    return Object.values(monthlyData).sort((a, b) => a.month.localeCompare(b.month));
  });

  const getRecentActivity = computed(() => {
    const recentOrders = [...orders.value]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return recentOrders.map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.statusInfo?.status || order.status,
      displayStatus: order.statusInfo?.displayStatus,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount,
      itemCount: order.items?.length || 0,
    }));
  });

  const orderCapabilities = computed(() => {
    if (!currentOrder.value) return {};

    return {
      canCancel: currentOrder.value.statusInfo?.canCancel || false,
      canPay: currentOrder.value.statusInfo?.canPay || false,
      canConfirm: currentOrder.value.statusInfo?.canConfirmDelivery || false,
      canReview: currentOrder.value.statusInfo?.isCompleted || false,
      isExpired: orderUtils.isOrderExpired(currentOrder.value),
      timeUntilExpiry: orderUtils.getTimeUntilExpiry(currentOrder.value),
    };
  });

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  const setLoading = (state) => {
    isLoading.value = state;
  };

  const setError = (errorData) => {
    error.value = errorData;
  };

  const clearError = () => {
    error.value = null;
  };

  /**
   * Handle API response uniformly
   */
  const handleApiResponse = (response, successCallback = null) => {
    if (response.success) {
      clearError();
      if (successCallback) successCallback(response.data);
      return response;
    } else {
      const errorData = {
        message: response.error || response.message,
        details: response.details,
        statusCode: response.statusCode,
        code: response.code,
      };
      setError(errorData);
      return response;
    }
  };

  /**
   * Update order in orders array
   */
  const updateOrderInList = (orderId, updateData) => {
    const orderIndex = orders.value.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      orders.value[orderIndex] = normalizeOrderData({
        ...orders.value[orderIndex],
        ...updateData,
      });
    }
  };

  /**
   * Update current order
   */
  const updateCurrentOrder = (orderId, updateData) => {
    if (currentOrder.value?.id === orderId) {
      currentOrder.value = normalizeOrderData({
        ...currentOrder.value,
        ...updateData,
      });
    }
  };

  // ============================================================================
  // ACTIONS - ORDER CREATION & PAYMENT
  // ============================================================================

  /**
   * Create order from cart
   */
  const createOrder = async (orderData) => {
    try {
      isCreatingOrder.value = true;
      clearError();

      const response = await orderService.createOrder(orderData);

      return handleApiResponse(response, data => {
        if (orders.value.length > 0) {
          let newOrder = {
            ...data,
            id: data.orderId,
            sellers: data.sellers || [],
          };

          newOrder = normalizeOrderData(newOrder);
          orders.value.unshift(newOrder);
        }
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to create order",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      isCreatingOrder.value = false;
    }
  };

  /**
   * Pay for order
   */
  const payOrder = async (orderId, pin) => {
    try {
      isPayingOrder.value = true;
      clearError();

      const response = await orderService.payOrder(orderId, pin);

      return handleApiResponse(response, data => {
        updateOrderInList(orderId, {
          ...data.order,
          paymentStatus: "paid",
        });

        updateCurrentOrder(orderId, {
          ...data.order,
          paymentStatus: "paid",
        });
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Payment failed",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      isPayingOrder.value = false;
    }
  };

  // ============================================================================
  // ACTIONS - FETCH ORDERS
  // ============================================================================

  /**
   * Fetch orders with filtering and pagination
   */
  const fetchOrders = async (params = {}) => {
    try {
      setLoading(true);
      clearError();

      const response = await orderService.getOrders(params);

      return handleApiResponse(response, data => {
        const normalizedOrders = (data.orders || []).map(normalizeOrderData);
        orders.value = normalizedOrders;
        pagination.value = data.pagination || {};
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to fetch orders",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch single order by ID
   */
  const fetchOrderById = async (orderId, keepSelectedParcel = false) => {
    try {
      setLoading(true);
      clearError();

      const savedParcelId = keepSelectedParcel ? selectedParcelId.value : null;

      const response = await orderService.getOrderById(orderId);
      
      return handleApiResponse(response, data => {
        let normalizedOrder = normalizeOrderData(data);

        // Force merge for pending orders with selected merged parcel
        if (normalizedOrder.paymentStatus === "pending" && savedParcelId === "merged-pending") {
          const allItems = normalizedOrder.parcels.flatMap(p => p.items);
          normalizedOrder = {
            ...normalizedOrder,
            parcels: [
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
                subtotal: normalizedOrder.totalAmount,
              },
            ],
          };
        }

        currentOrder.value = normalizedOrder;

        if (savedParcelId) {
          selectedParcelId.value = savedParcelId;
        }

        updateOrderInList(orderId, normalizedOrder);
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to fetch order",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch order with cache busting
   */
  const fetchOrderByIdFresh = async (orderId, bustCache = true) => {
    try {
      setLoading(true);
      clearError();

      const response = await orderService.getOrderByIdFresh(orderId, bustCache);

      return handleApiResponse(response, data => {
        const normalizedOrder = normalizeOrderData(data);
        currentOrder.value = normalizedOrder;
        updateOrderInList(orderId, normalizedOrder);
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to fetch fresh order",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // ACTIONS - ORDER UPDATES
  // ============================================================================

  /**
   * Cancel order
   */
  const cancelOrder = async (orderId, reason, itemsToCancel = []) => {
    try {
      isCancellingOrder.value = true;
      clearError();

      const response = await orderService.cancelOrder(orderId, reason, itemsToCancel);

      return handleApiResponse(response, data => {
        updateOrderInList(orderId, {
          status: data.status,
          statusInfo: data.statusInfo,
          cancelRequest: data.cancelRequest,
        });

        updateCurrentOrder(orderId, {
          status: data.status,
          statusInfo: data.statusInfo,
          cancelRequest: data.cancelRequest,
        });
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to cancel order",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      isCancellingOrder.value = false;
    }
  };

  /**
   * Confirm items delivery
   */
  const confirmItemsDelivery = async (orderId, confirmData = {}) => {
    try {
      isConfirmingDelivery.value = true;
      clearError();

      const response = await orderService.confirmItemsDelivery(orderId, confirmData);

      return handleApiResponse(response, async () => {
        await fetchOrderById(orderId, true);
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to confirm delivery",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      isConfirmingDelivery.value = false;
    }
  };

  /**
   * Update product review
   */
  const updateProductReview = async (orderId, productId, reviewData) => {
    try {
      isUpdatingFeedback.value = true;
      clearError();

      const response = await orderService.updateProductReview(orderId, productId, reviewData);

      return handleApiResponse(response, async () => {
        await fetchOrderById(orderId, true);
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to update review",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      isUpdatingFeedback.value = false;
    }
  };

  /**
   * Update order feedback
   */
  const updateOrderFeedback = async (orderId, feedbackData) => {
    try {
      isUpdatingFeedback.value = true;
      clearError();

      const response = await orderService.updateOrderFeedback(orderId, feedbackData);

      return handleApiResponse(response, data => {
        if (currentOrder.value?.id === orderId) {
          currentOrder.value.customerFeedback = data.feedback;
        }

        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          if (!orders.value[orderIndex].customerFeedback) {
            orders.value[orderIndex].customerFeedback = {};
          }
          orders.value[orderIndex].customerFeedback = {
            ...orders.value[orderIndex].customerFeedback,
            ...data.feedback,
          };
        }
      });
    } catch (error) {
      const errorData = {
        message: error.message || "Failed to update feedback",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      isUpdatingFeedback.value = false;
    }
  };

  // ============================================================================
  // ACTIONS - CONVENIENCE METHODS
  // ============================================================================

  const fetchOrdersByStatus = async (status, params = {}) => {
    return fetchOrders({ ...params, status });
  };

  const fetchPendingOrders = async (params = {}) => {
    return fetchOrdersByStatus("pending", params);
  };

  const fetchPaidOrders = async (params = {}) => {
    return fetchOrders({ ...params, paymentStatus: "paid" });
  };

  const fetchDeliveredOrders = async (params = {}) => {
    return fetchOrdersByStatus("delivered", params);
  };

  const fetchCancelledOrders = async (params = {}) => {
    return fetchOrdersByStatus("cancelled", params);
  };

  const refreshOrders = async () => {
    const currentParams = {
      page: pagination.value.currentPage,
      limit: 10,
    };
    return fetchOrders(currentParams);
  };

  const refreshCurrentOrder = async () => {
    if (currentOrder.value?.id) {
      return fetchOrderById(currentOrder.value.id);
    }
    return { success: false, error: "No current order to refresh" };
  };

  // ============================================================================
  // ACTIONS - PAGINATION
  // ============================================================================

  const loadNextPage = async () => {
    if (pagination.value.hasNextPage) {
      const nextPage = pagination.value.currentPage + 1;
      const response = await fetchOrders({ page: nextPage });

      if (response.success) {
        orders.value = [...orders.value, ...response.data.orders.map(normalizeOrderData)];
        pagination.value = response.data.pagination;
      }

      return response;
    }
    return { success: false, error: "No next page available" };
  };

  const loadPreviousPage = async () => {
    if (pagination.value.hasPrevPage) {
      const prevPage = pagination.value.currentPage - 1;
      return fetchOrders({ page: prevPage });
    }
    return { success: false, error: "No previous page available" };
  };

  const goToPage = async (page) => {
    if (page >= 1 && page <= pagination.value.totalPages) {
      return fetchOrders({ page });
    }
    return { success: false, error: "Invalid page number" };
  };

  // ============================================================================
  // ACTIONS - SEARCH & FILTERS
  // ============================================================================

  const searchOrders = async (searchTerm) => {
    const filteredOrders = orders.value.filter(
      order =>
        order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return {
      success: true,
      data: {
        orders: filteredOrders,
        pagination: {
          ...pagination.value,
          totalOrders: filteredOrders.length,
        },
      },
    };
  };

  // ============================================================================
  // ACTIONS - PARCEL SELECTION
  // ============================================================================

  const setSelectedParcel = (parcelId) => {
    selectedParcelId.value = parcelId;
  };

  const clearSelectedParcel = () => {
    selectedParcelId.value = null;
  };

  // ============================================================================
  // ACTIONS - RESET METHODS
  // ============================================================================

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

  const clearCurrentOrder = () => {
    currentOrder.value = null;
  };

  const resetStore = () => {
    clearOrders();
    clearCurrentOrder();
    clearError();
    isLoading.value = false;
    isCreatingOrder.value = false;
    isPayingOrder.value = false;
    isCancellingOrder.value = false;
    isConfirmingDelivery.value = false;
    isUpdatingFeedback.value = false;
  };

  // ============================================================================
  // GETTERS - FIND SPECIFIC ORDERS
  // ============================================================================

  const getOrderById = (orderId) => {
    return orders.value.find(order => order.id === orderId || order._id === orderId);
  };

  const getOrderByNumber = (orderNumber) => {
    return orders.value.find(order => order.orderNumber === orderNumber);
  };

  const getOrdersByProduct = (productId) => {
    return orders.value.filter(order =>
      order.items?.some(item => item.productId === productId || item.product === productId)
    );
  };

  const getOrdersByDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    return orders.value.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  };

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    // State
    orders,
    currentOrder,
    displayOrder,
    selectedParcelId,
    isLoading,
    error,
    pagination,
    isCreatingOrder,
    isPayingOrder,
    isCancellingOrder,
    isConfirmingDelivery,
    isUpdatingFeedback,

    // Computed - Filtered orders
    pendingOrders,
    packedOrders,
    shippedOrders,
    deliveredOrders,
    receivedOrders,
    cancelledOrders,
    cancellationRequestedOrders,
    paidOrders,
    unpaidOrders,
    refundedOrders,

    // Computed - Statistics
    orderStats,
    actionableOrders,
    getTotalSpent,
    getMonthlySpending,
    getRecentActivity,
    orderCapabilities,

    // Actions - Core
    createOrder,
    payOrder,
    fetchOrders,
    fetchOrderById,
    fetchOrderByIdFresh,
    cancelOrder,
    confirmItemsDelivery,
    updateProductReview,
    updateOrderFeedback,

    // Actions - Convenience
    fetchOrdersByStatus,
    fetchPendingOrders,
    fetchPaidOrders,
    fetchDeliveredOrders,
    fetchCancelledOrders,
    refreshOrders,
    refreshCurrentOrder,

    // Actions - Pagination
    loadNextPage,
    loadPreviousPage,
    goToPage,

    // Actions - Search
    searchOrders,

    // Actions - Parcel
    setSelectedParcel,
    clearSelectedParcel,

    // Actions - Reset
    clearOrders,
    clearCurrentOrder,
    clearError,
    resetStore,

    // Getters
    getOrderById,
    getOrderByNumber,
    getOrdersByProduct,
    getOrdersByDateRange,

    // Utility (delegated to composable)
    ...orderUtils,
  };
});