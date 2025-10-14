// services/sellerProductService.js
import { useApiClient } from "@/composables/useApiClient";

// Initialize API client
const apiClient = useApiClient();

export const sellerProductService = {
  /**
   * Get seller products with pagination and filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number (default: 1)
   * @param {number} params.limit - Items per page (default: 12)
   * @param {string} params.search - Search term
   * @param {string} params.category - Category filter
   * @param {string} params.sortBy - Sort field (title, price, createdAt, etc.)
   * @param {string} params.sortOrder - Sort order (asc, desc)
   * @param {boolean} params.isActive - Filter by active status
   * @param {number} params.minPrice - Minimum price filter
   * @param {number} params.maxPrice - Maximum price filter
   * @returns {Promise<Object>} Products data with pagination
   */
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams();

    // Clean dan format params sesuai backend expectation
    const cleanParams = {};

    // Handle search parameter
    if (params.search && params.search.trim()) {
      cleanParams.search = params.search.trim();
    }

    // Handle other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && key !== "search") {
        cleanParams[key] = value;
      }
    });

    // Add clean parameters to query string
    Object.entries(cleanParams).forEach(([key, value]) => {
      queryParams.append(key, value);
    });

    const queryString = queryParams.toString();
    const url = `/api/seller/products${queryString ? `?${queryString}` : ""}`;

    return await apiClient.get(url);
  },



  /**
   * Create new product
   * @param {Object} productData - Product data
   * @returns {Promise<Object>} Created product data
   */
  async createProduct(productData) {
    const payload = {
      title: productData.title,
      description: productData.description,
      price: Number(productData.price),
      stock: Number(productData.stock),
      category: productData.category,
    };

    // Validasi required fields
    if (!payload.title || !payload.description || !payload.price || !payload.stock || !payload.category) {
      throw new Error("All fields are required");
    }

    if (isNaN(payload.price) || payload.price <= 0) {
      throw new Error("Price must be a valid number greater than 0");
    }

    if (isNaN(payload.stock) || payload.stock < 0) {
      throw new Error("Stock must be a valid number and cannot be negative");
    }

    try {
      const result = await apiClient.post("/api/seller/products", payload);
      if (!result.success) {
        throw new Error(result.message || "API returned success: false");
      }

      if (!result.data || (!result.data.product && !result.data.id)) {
        throw new Error("Invalid response structure from API");
      }
      return result;
    } catch (error) {
      console.error("API Error Details:", error);

      // Error sudah di-transform oleh useApiClient, jadi akses langsung
      console.error("Error Data:", error.data);
      console.error("Error Message:", error.message);
      console.error("Error Status:", error.status);

      // Log raw error untuk debugging
      console.error("Raw error object:", JSON.stringify(error, null, 2));

      throw error;
    }
  },

  /**
   * Update existing product
   * @param {string} productId - Product ID
   * @param {Object} productData - Updated product data
   * @returns {Promise<Object>} Updated product data
   */
  async updateProduct(productId, productData) {
    return await apiClient.patch(`/api/seller/products/${productId}`, productData);
  },

  /**
   * Delete product
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Response data
   */
  async deleteProduct(productId) {
    return await apiClient.delete(`/api/seller/products/${productId}`);
  },

  /**
   * Toggle product active status
   * @param {string} productId - Product ID
   * @param {boolean} isActive - Active status
   * @returns {Promise<Object>} Updated product data
   */
  async toggleProductStatus(productId, isActive) {
    return await apiClient.patch(`/api/seller/products/${productId}/status`, {
      isActive,
    });
  },

  /**
   * Upload product image
   * @param {string} productId - Product ID
   * @param {File} imageFile - Image file
   * @param {Function} onUploadProgress - Upload progress callback
   * @returns {Promise<Object>} Upload result
   */
  async uploadProductImage(productId, imageFile, onUploadProgress = null) {
    return await apiClient.uploadFile(`/api/seller/products/${productId}/images`, imageFile, {
      onUploadProgress,
      fieldName: "image", // Specify the correct field name
    });
  },

  /**
   * Get product statistics
   * @returns {Promise<Object>} Product statistics
   */
  async getProductStats() {
    return await apiClient.get("/api/seller/products/stats");
  },

  /**
   * Bulk toggle product status
   * @param {Array} productIds - Array of product IDs
   * @param {boolean} isActive - Active status to set
   * @returns {Promise<Object>} Bulk update result
   */
  async bulkToggleStatus(productIds, isActive) {
    return await apiClient.patch("/api/seller/products/bulk/status", {
      productIds,
      isActive,
    });
  },

  /**
   * Bulk delete products
   * @param {Array} productIds - Array of product IDs
   * @returns {Promise<Object>} Bulk delete result
   */
  async bulkDeleteProducts(productIds) {
    // Validasi input
    if (!Array.isArray(productIds) || productIds.length === 0) {
      throw new Error("Product IDs array is required and cannot be empty");
    }

    console.log("Sending bulk delete request:", { productIds }); // Debug log

    // Coba format yang paling kompatibel untuk DELETE dengan body
    return await apiClient.delete("/api/seller/products/bulk", {
      data: { productIds },
    });
  },

  /**
   * Get store information for seller
   * @returns {Promise<Object>} Store information
   */
  async getStoreInfo() {
    return await apiClient.get("/api/seller/profile");
  },

  /**
   * Get dashboard statistics with period
   * @param {string} period - Time period (7d, 30d, 90d)
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardStats(period = "30d") {
    const queryParams = new URLSearchParams();
    if (period) {
      queryParams.append("period", period);
    }

    const queryString = queryParams.toString();
    const url = `/api/seller/analytics/dashboard${queryString ? `?${queryString}` : ""}`;

    return await apiClient.get(url);
  },

  /**
   * Get product analytics with period filter
   * @param {string} period - Time period (7d, 30d, 90d, 1y)
   * @returns {Promise<Object>} Product analytics data
   */
  async getProductAnalytics(period = "30d") {
    const queryParams = new URLSearchParams();
    if (period) {
      queryParams.append("period", period);
    }

    const queryString = queryParams.toString();
    const url = `/api/seller/analytics/products${queryString ? `?${queryString}` : ""}`;

    return await apiClient.get(url);
  },
};
