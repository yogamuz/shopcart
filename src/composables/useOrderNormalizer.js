// composables/useOrderNormalizer.js - Order Data Normalization Logic

/**
 * Order normalization composable
 * Transforms raw API order data into consistent structure for UI
 */
export const useOrderNormalizer = () => {

  /**
   * Generate unique parcel ID
   * @param {String} orderNumber - Order number
   * @param {String} sellerName - Seller name
   * @param {Number} index - Parcel index
   * @returns {String}
   */
  const generateParcelId = (orderNumber, sellerName, index) => {
    return `${orderNumber}-P${index + 1}`;
  };

  /**
   * Determine seller status based on items
   * @param {Array} items - Array of order items
   * @returns {String} Status string
   */
  const determineSellerStatus = (items) => {
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

  /**
   * Normalize pending payment orders (merge sellers)
   * @param {Object} orderData - Raw order data
   * @param {Object} preservedFields - Fields to preserve
   * @returns {Object} Normalized order
   */
  const normalizePendingOrder = (orderData, preservedFields) => {
    if (!orderData.sellers || !Array.isArray(orderData.sellers)) {
      return orderData;
    }

    // Check unique sellers by storeName + storeSlug
    const uniqueSellerKeys = new Set(
      orderData.sellers.map(s => `${s.storeName}-${s.storeSlug || "no-slug"}`)
    );

    const allItems = orderData.sellers.flatMap(s => s.items);

    // Single seller - use their info
    if (uniqueSellerKeys.size === 1) {
      const seller = orderData.sellers[0];
      
      return {
        ...orderData,
        ...preservedFields,
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

    // Multiple sellers - generic info
    return {
      ...orderData,
      ...preservedFields,
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
  };

  /**
   * Normalize paid orders (split into parcels per seller)
   * @param {Object} orderData - Raw order data
   * @returns {Object} Normalized order
   */
  const normalizePaidOrder = (orderData) => {
    if (!orderData.sellers || !Array.isArray(orderData.sellers) || orderData.parcels) {
      return orderData;
    }

    orderData.parcels = orderData.sellers.map((seller, index) => ({
      parcelId: seller.parcelId || generateParcelId(orderData.orderNumber, seller.storeName, index),
      seller: {
        storeName: seller.storeName,
        storeSlug: seller.storeSlug,
        storeLogo: seller.storeLogo,
      },
      status: determineSellerStatus(seller.items),
      subtotal: seller.items.reduce(
        (sum, item) => sum + (item.price || item.subtotal || 0) * item.quantity, 
        0
      ),
      items: seller.items,
      canTrack: orderData.actions?.canTrack || false,
      canCancel: orderData.actions?.canCancel || false,
      canConfirmDelivery: seller.items.some(item => item.status === "delivered"),
      timestamps: seller.timestamps || {},
    }));

    return orderData;
  };

  /**
   * Normalize parcel subtotals and flatten items
   * @param {Object} orderData - Order data with parcels
   * @returns {Object} Normalized order
   */
  const normalizeParcels = (orderData) => {
    if (!orderData.parcels || !Array.isArray(orderData.parcels)) {
      return orderData;
    }

    orderData.parcels = orderData.parcels.map(parcel => ({
      ...parcel,
      subtotal: parcel.subtotal || parcel.items.reduce(
        (sum, item) => sum + (item.subtotal || 0), 
        0
      ),
    }));

    // Flatten all items with parcel info
    orderData.items = orderData.parcels.flatMap(parcel =>
      parcel.items.map(item => ({
        ...item,
        seller: parcel.seller,
        parcelId: parcel.parcelId,
        parcelStatus: parcel.status,
      }))
    );

    return orderData;
  };

  /**
   * Main normalization function
   * Transforms raw order data into consistent structure
   * @param {Object} orderData - Raw order data from API
   * @returns {Object} Normalized order data
   */
  const normalizeOrderData = (orderData) => {
    if (!orderData) return orderData;

    // Preserve critical fields that might be lost during transformation
    const preservedFields = {
      expiresAt: orderData.expiresAt,
      createdAt: orderData.createdAt,
      paymentStatus: orderData.paymentStatus,
      orderNumber: orderData.orderNumber,
      status: orderData.status,
      statusInfo: orderData.statusInfo,
      actions: orderData.actions,
    };

    let normalized = { ...orderData };

    // Handle pending payment orders
    if (orderData.paymentStatus === "pending") {
      normalized = normalizePendingOrder(orderData, preservedFields);
    }
    // Handle paid orders
    else {
      normalized = normalizePaidOrder(normalized);
      normalized = normalizeParcels(normalized);
    }

    // Always restore preserved fields at the end
    return {
      ...normalized,
      ...preservedFields,
    };
  };

  return {
    normalizeOrderData,
    generateParcelId,
    determineSellerStatus,
  };
};