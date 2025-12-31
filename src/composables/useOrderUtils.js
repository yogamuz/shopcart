// composables/useOrderUtils.js - Order Utility Functions
// Extracted from orderService.js - Pure utility functions

/**
 * Order utility functions composable
 * Contains business logic for order status, colors, expiry, etc.
 */
export const useOrderUtils = () => {
  
  /**
   * Check if order can be cancelled
   * @param {Object} order - Order object
   * @returns {Boolean}
   */
  const canCancelOrder = (order) => {
    return order?.statusInfo?.canCancel || false;
  };

  /**
   * Check if order can be paid
   * @param {Object} order - Order object
   * @returns {Boolean}
   */
  const canPayOrder = (order) => {
    return order?.statusInfo?.canPay || false;
  };

  /**
   * Check if delivery can be confirmed
   * @param {Object} order - Order object
   * @returns {Boolean}
   */
  const canConfirmDelivery = (order) => {
    return order?.statusInfo?.canConfirmDelivery || false;
  };

  /**
   * Check if feedback can be added
   * @param {Object} order - Order object
   * @returns {Boolean}
   */
  const canAddFeedback = (order) => {
    return order?.statusInfo?.isCompleted || false;
  };

  /**
   * Check if order has deliverable items
   * @param {Object} order - Order object
   * @returns {Boolean}
   */
  const hasDeliverableItems = (order) => {
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

  /**
   * Check if order is expired
   * @param {Object} order - Order object
   * @returns {Boolean}
   */
  const isOrderExpired = (order) => {
    if (!order?.expiresAt) return false;
    return new Date(order.expiresAt) < new Date();
  };

  /**
   * Get time until order expires
   * @param {Object} order - Order object
   * @returns {String|null} Formatted time string or "Expired"
   */
  const getTimeUntilExpiry = (order) => {
    if (!order?.expiresAt) return null;

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
  };

  /**
   * Format order status for display
   * @param {Object} statusInfo - Status info object
   * @returns {String}
   */
  const formatOrderStatus = (statusInfo) => {
    return statusInfo?.displayStatus || statusInfo?.status || "Unknown";
  };

  /**
   * Get status color for UI
   * @param {Object|String} statusInfo - Status info object or status string
   * @returns {String} Color name
   */
  const getOrderStatusColor = (statusInfo) => {
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

  return {
    canCancelOrder,
    canPayOrder,
    canConfirmDelivery,
    canAddFeedback,
    hasDeliverableItems,
    isOrderExpired,
    getTimeUntilExpiry,
    formatOrderStatus,
    getOrderStatusColor,
  };
};