// stores/productsStore.js
import { defineStore } from "pinia";
import { productService } from "@/services/productService";

import { useProductNormalizer } from "@/composables/useProductNormalizer";

// ============================================================================
// CONSTANTS
// ============================================================================

const API_LIMITS = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 50,
  DEFAULT_LIMIT: 20,
  MIN_PAGE: 1,
  DEFAULT_PAGE: 1,
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Sanitizes and validates API query parameters
 * Ensures limit and page values are within acceptable ranges
 */
function sanitizeQueryParams(params = {}) {
  const {
    limit = API_LIMITS.DEFAULT_LIMIT,
    page = API_LIMITS.DEFAULT_PAGE,
    ...otherParams
  } = params;

  const sanitizedLimit = Math.min(
    API_LIMITS.MAX_LIMIT,
    Math.max(API_LIMITS.MIN_LIMIT, parseInt(limit) || API_LIMITS.DEFAULT_LIMIT)
  );

  const sanitizedPage = Math.max(
    API_LIMITS.MIN_PAGE,
    parseInt(page) || API_LIMITS.DEFAULT_PAGE
  );

  return {
    ...otherParams,
    limit: sanitizedLimit,
    page: sanitizedPage,
  };
}

// ============================================================================
// STORE DEFINITION
// ============================================================================

export const useProductsStore = defineStore("products", {
  // ==========================================================================
  // STATE
  // ==========================================================================
  
  state: () => ({
    products: [],
    pagination: null,
    filters: null,
    loading: false,
    error: null,
  }),

  // ==========================================================================
  // GETTERS
  // ==========================================================================
  
  getters: {
    /**
     * Returns true if products are currently being fetched
     */
    isLoading: (state) => state.loading,
    
    /**
     * Returns true if an error exists
     */
    hasError: (state) => !!state.error,
    
    /**
     * Returns formatted error message
     */
    getErrorMessage: (state) => state.error?.message || state.error,
    
    /**
     * Returns total number of products in current result set
     */
    productCount: (state) => state.products.length,
    
    /**
     * Returns true if there are products available
     */
    hasProducts: (state) => state.products.length > 0,
  },

  // ==========================================================================
  // ACTIONS
  // ==========================================================================
  
  actions: {
    /**
     * Fetches products from API with filters and pagination
     * Normalizes product data and updates store state
     */
    async fetchProducts(params = {}) {
      const { extractProductData } = useProductNormalizer();

      try {
        this.loading = true;
        this.error = null;

        const sanitizedParams = sanitizeQueryParams(params);
        const response = await productService.getProducts(sanitizedParams);

        if (response.success) {
          const { products, pagination, filters } = extractProductData(response);
          
          this.products = products;
          this.pagination = pagination;
          this.filters = filters;
        } else {
          throw new Error(response.message || "Failed to fetch products");
        }

        return response;
      } catch (error) {
        console.error("Failed to fetch products:", error);
        this.error = error;
        this.products = [];
        this.pagination = null;
        this.filters = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Clears error state
     */
    clearError() {
      this.error = null;
    },

    /**
     * Resets products, pagination, and filters to initial state
     */
    clearProducts() {
      this.products = [];
      this.pagination = null;
      this.filters = null;
    },
    
    /**
     * Resets entire store to initial state
     */
    resetStore() {
      this.products = [];
      this.pagination = null;
      this.filters = null;
      this.loading = false;
      this.error = null;
    },
  },
});