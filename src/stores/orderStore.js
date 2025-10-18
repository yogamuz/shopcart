// stores/orderStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import orderService from "@/services/orderService";
import { update } from "lodash";

export const useOrderStore = defineStore("orders", () => {
  // State
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


  const normalizeOrderData = orderData => {
  if (!orderData) return orderData;

  // ✅ PRESERVE critical fields yang sering hilang
  const preservedFields = {
    expiresAt: orderData.expiresAt,
    createdAt: orderData.createdAt,
    paymentStatus: orderData.paymentStatus,
    orderNumber: orderData.orderNumber,
    status: orderData.status,
    statusInfo: orderData.statusInfo,
    actions: orderData.actions,
  };

  const generateParcelId = (orderNumber, sellerName, index) => {
    return `${orderNumber}-P${index + 1}`;
  };

  // ✅ FIX: Jika pending payment, cek jumlah UNIQUE seller ID (bukan nama)
  if (orderData.paymentStatus === "pending" && orderData.sellers && Array.isArray(orderData.sellers)) {
    const uniqueSellerKeys = new Set(orderData.sellers.map(s => `${s.storeName}-${s.storeSlug || "no-slug"}`));

    if (uniqueSellerKeys.size === 1) {
      const seller = orderData.sellers[0];
      const allItems = orderData.sellers.flatMap(s => s.items);

      return {
        ...orderData,
        ...preservedFields, // ✅ RESTORE preserved fields
        parcels: [
          {
            parcelId: "merged-pending",
            seller: {
              storeName: seller.storeName,
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
        ],
        items: allItems,
      };
    }

    const allItems = orderData.sellers.flatMap(seller => seller.items);

    return {
      ...orderData,
      ...preservedFields, // ✅ RESTORE preserved fields
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
          subtotal: orderData.totalAmount || orderData.subtotal,
        },
      ],
      items: allItems,
    };
  }

  // ✅ Jika PAID, split ke parcels per seller (logic tidak berubah)
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
  }

  if (orderData.parcels && Array.isArray(orderData.parcels)) {
    orderData.parcels = orderData.parcels.map(parcel => ({
      ...parcel,
      subtotal: parcel.subtotal || parcel.items.reduce((sum, item) => sum + (item.subtotal || 0), 0),
    }));

    orderData.items = orderData.parcels.flatMap(parcel =>
      parcel.items.map(item => ({
        ...item,
        seller: parcel.seller,
        parcelId: parcel.parcelId,
        parcelStatus: parcel.status,
      }))
    );
  }

  return {
    ...orderData,
    ...preservedFields, // ✅ ALWAYS restore preserved fields at the end
  };
};

  // Helper function - tambahkan di dalam defineStore
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
    if (items.some(item => item.status === "cancelled")) return "cancelled";
    return items[0].status || "pending";
  };
  // ✅ Filter berdasarkan ITEM.status (bukan order.statusInfo.status)

  const pendingOrders = computed(() => {
    return orders.value.filter(order => {
      // Pending payment orders
      if (order.paymentStatus === "pending") return true;

      // Pending items
      if (order.sellers?.some(s => s.items?.some(i => i.status === "pending"))) return true;
      if (order.parcels?.some(p => p.items?.some(i => i.status === "pending"))) return true;
      if (order.items?.some(i => i.status === "pending")) return true;

      return false;
    });
  });

  const packedOrders = computed(() => {
    return orders.value.filter(order => {
      if (order.sellers?.some(s => s.items?.some(i => i.status === "packed"))) return true;
      if (order.parcels?.some(p => p.items?.some(i => i.status === "packed"))) return true;
      if (order.items?.some(i => i.status === "packed")) return true;
      return false;
    });
  });

  const shippedOrders = computed(() => {
    return orders.value.filter(order => {
      if (order.sellers?.some(s => s.items?.some(i => i.status === "shipped"))) return true;
      if (order.parcels?.some(p => p.items?.some(i => i.status === "shipped"))) return true;
      if (order.items?.some(i => i.status === "shipped")) return true;
      return false;
    });
  });

  const deliveredOrders = computed(() => {
    return orders.value.filter(order => {
      if (order.sellers?.some(s => s.items?.some(i => i.status === "delivered"))) return true;
      if (order.parcels?.some(p => p.items?.some(i => i.status === "delivered"))) return true;
      if (order.items?.some(i => i.status === "delivered")) return true;
      return false;
    });
  });

  const receivedOrders = computed(() => {
    return orders.value.filter(order => {
      // ✅ CRITICAL: Cek di sellers.items (struktur backend)
      if (order.sellers?.some(s => s.items?.some(i => i.status === "received"))) return true;

      // Cek di parcels.items (setelah normalization)
      if (order.parcels?.some(p => p.items?.some(i => i.status === "received"))) return true;

      // Cek di items langsung
      if (order.items?.some(i => i.status === "received")) return true;

      return false;
    });
  });

  const cancelledOrders = computed(() => {
    return orders.value.filter(order => {
      if (order.sellers?.some(s => s.items?.some(i => i.status === "cancelled"))) return true;
      if (order.parcels?.some(p => p.items?.some(i => i.status === "cancelled"))) return true;
      if (order.items?.some(i => i.status === "cancelled")) return true;
      return false;
    });
  });

  const cancellationRequestedOrders = computed(() => {
    return orders.value.filter(order => order.status === "cancellation_requested");
  });

  const paidOrders = computed(() => orders.value.filter(order => order.paymentStatus === "paid"));

  const unpaidOrders = computed(() => orders.value.filter(order => order.paymentStatus === "pending"));

  const refundedOrders = computed(() => orders.value.filter(order => order.paymentStatus === "refunded"));
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

  const setSelectedParcel = parcelId => {
    selectedParcelId.value = parcelId;
  };

  const clearSelectedParcel = () => {
    selectedParcelId.value = null;
  };

  // Computed - Statistics
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

  // Computed - Actionable orders using backend statusInfo
  const actionableOrders = computed(() => ({
    canPay: orders.value.filter(order => order.statusInfo?.canPay),
    canCancel: orders.value.filter(order => order.statusInfo?.canCancel),
    canConfirm: orders.value.filter(order => order.statusInfo?.canConfirmDelivery),
    canReview: orders.value.filter(order => order.statusInfo?.isCompleted),
    expired: orders.value.filter(order => orderService.isOrderExpired(order)),
  }));

  // Helper functions
  const setLoading = state => {
    isLoading.value = state;
  };

  const setError = errorData => {
    error.value = errorData;
  };

  const clearError = () => {
    error.value = null;
  };

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

  // Actions - Order Creation
  const createOrder = async orderData => {
    try {
      isCreatingOrder.value = true;
      clearError();

      const response = await orderService.createOrder(orderData);

      return handleApiResponse(response, data => {
        if (orders.value.length > 0) {
          // ✅ FIX: Backend sudah kirim sellers array yang benar, jangan rebuild
          let newOrder = {
            ...data,
            id: data.orderId,
            // Keep sellers as is from backend response
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

  // Actions - Payment
  const payOrder = async (orderId, pin) => {
    try {
      isPayingOrder.value = true;
      clearError();

      const response = await orderService.payOrder(orderId, pin);

      return handleApiResponse(response, data => {
        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex] = normalizeOrderData({
            ...orders.value[orderIndex],
            ...data.order,
            paymentStatus: "paid",
          });
        }

        if (currentOrder.value?.id === orderId) {
          currentOrder.value = normalizeOrderData({
            ...currentOrder.value,
            ...data.order,
            paymentStatus: "paid",
          });
        }
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

  const validatePayment = async orderId => {
    try {
      setLoading(true);
      clearError();

      const response = await orderService.validatePayment(orderId);
      return handleApiResponse(response);
    } catch (error) {
      const errorData = {
        message: error.message || "Payment validation failed",
        details: error,
      };
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      setLoading(false);
    }
  };

  // Actions - Fetch Orders
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
  const fetchOrderById = async (orderId, keepSelectedParcel = false) => {
    try {
      setLoading(true);
      clearError();

      const savedParcelId = keepSelectedParcel ? selectedParcelId.value : null;

      const response = await orderService.getOrderById(orderId);
      return handleApiResponse(response, data => {
        let normalizedOrder = normalizeOrderData(data);

        // ✅ FIX: Jika pending DAN ada selectedParcelId = 'merged-pending'
        // Force merge setelah normalize
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

        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex] = normalizedOrder;
        }
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

  const fetchOrderByIdFresh = async (orderId, bustCache = true) => {
    try {
      setLoading(true);
      clearError();

      const response = await orderService.getOrderByIdFresh(orderId, bustCache);

      return handleApiResponse(response, data => {
        const normalizedOrder = normalizeOrderData(data);
        currentOrder.value = normalizedOrder;

        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex] = normalizedOrder;
        }
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

  // Actions - Cancel Order
  const cancelOrder = async (orderId, reason, itemsToCancel = []) => {
    try {
      isCancellingOrder.value = true;
      clearError();

      const response = await orderService.cancelOrder(orderId, reason, itemsToCancel);

      return handleApiResponse(response, data => {
        const orderIndex = orders.value.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
          orders.value[orderIndex] = normalizeOrderData({
            ...orders.value[orderIndex],
            status: data.status,
            statusInfo: data.statusInfo,
            cancelRequest: data.cancelRequest,
          });
        }

        if (currentOrder.value?.id === orderId) {
          currentOrder.value = normalizeOrderData({
            ...currentOrder.value,
            status: data.status,
            statusInfo: data.statusInfo,
            cancelRequest: data.cancelRequest,
          });
        }
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
   * Confirm items delivery - dynamic (product/parcel/all)
   */
  const confirmItemsDelivery = async (orderId, confirmData = {}) => {
    try {
      isConfirmingDelivery.value = true;
      clearError();

      const response = await orderService.confirmItemsDelivery(orderId, confirmData);

      return handleApiResponse(response, async () => {
        // Refresh with keepSelectedParcel = true
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

  // Actions - Update Feedback
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

  // Actions - Convenience methods
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

  // Actions - Utility methods
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

  const goToPage = async page => {
    if (page >= 1 && page <= pagination.value.totalPages) {
      return fetchOrders({ page });
    }
    return { success: false, error: "Invalid page number" };
  };

  // Actions - Search (local filtering)
  const searchOrders = async searchTerm => {
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

  // Actions - Reset methods
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

  // Getters - Find specific orders
  const getOrderById = orderId => {
    return orders.value.find(order => order.id === orderId || order._id === orderId);
  };

  const getOrderByNumber = orderNumber => {
    return orders.value.find(order => order.orderNumber === orderNumber);
  };

  const getOrdersByProduct = productId => {
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

  // Getters - Analysis
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
    const recentOrders = [...orders.value].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

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

  // Computed - Order capabilities using backend statusInfo
  const orderCapabilities = computed(() => {
    if (!currentOrder.value) return {};

    return {
      canCancel: currentOrder.value.statusInfo?.canCancel || false,
      canPay: currentOrder.value.statusInfo?.canPay || false,
      canConfirm: currentOrder.value.statusInfo?.canConfirmDelivery || false,
      canReview: currentOrder.value.statusInfo?.isCompleted || false,
      isExpired: orderService.isOrderExpired(currentOrder.value),
      timeUntilExpiry: orderService.getTimeUntilExpiry(currentOrder.value),
    };
  });
  // Di orderStore.js - tambahkan action baru
  const updateProductReview = async (orderId, productId, reviewData) => {
    try {
      isUpdatingFeedback.value = true;
      clearError();

      const response = await orderService.updateProductReview(orderId, productId, reviewData);

      return handleApiResponse(response, async () => {
        // Refresh order dengan keepSelectedParcel = true
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

  // Utility methods using orderService
  const canCancelOrder = order => orderService.canCancelOrder(order);
  const canPayOrder = order => orderService.canPayOrder(order);
  const canConfirmDelivery = order => orderService.canConfirmDelivery(order);
  const hasDeliverableItems = order => {
    if (!order) return false;

    // Check in parcels
    if (order.parcels?.some(p => p.items?.some(i => i.status === "delivered"))) {
      return true;
    }

    // Check in items
    if (order.items?.some(i => i.status === "delivered")) {
      return true;
    }

    return false;
  };
  const canAddFeedback = order => orderService.canAddFeedback(order);
  const isOrderExpired = order => orderService.isOrderExpired(order);
  const getTimeUntilExpiry = order => orderService.getTimeUntilExpiry(order);
  const formatOrderStatus = statusInfo => orderService.formatOrderStatus(statusInfo);
  const getOrderStatusColor = statusInfo => orderService.getOrderStatusColor(statusInfo);

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
    validatePayment,
    fetchOrders,
    fetchOrderById,
    fetchOrderByIdFresh,
    cancelOrder,
    confirmItemsDelivery,
    hasDeliverableItems,
    updateOrderFeedback,
    setSelectedParcel,
    clearSelectedParcel,
    updateProductReview,

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

    // Utility
    canCancelOrder,
    canPayOrder,
    canConfirmDelivery,
    canAddFeedback,
    isOrderExpired,
    getTimeUntilExpiry,
    formatOrderStatus,
    getOrderStatusColor,
  };
});
