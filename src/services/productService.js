import { useApiClient } from "@/composables/useApiClient";

const apiClient = useApiClient();

/**
 * Build query string from params
 */
function buildQueryString(params = {}) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value);
    }
  });

  return queryParams.toString();
}

/**
 * Product API Service
 * Responsibility: API calls only
 */
export const productService = {
  async getProducts(params = {}) {
    const query = buildQueryString(params);
    return apiClient.get(
      query ? `/api/products?${query}` : "/api/products"
    );
  },

  async getProduct(productId) {
    return apiClient.get(`/api/products/${productId}`);
  },

  async getProductBySlug(slug) {
    return apiClient.get(`/api/products/${slug}`);
  },

  async getProductReviews(productId, params = {}) {
    const query = buildQueryString(params);
    return apiClient.get(
      query
        ? `/api/products/${productId}/reviews?${query}`
        : `/api/products/${productId}/reviews`
    );
  },

  async getStoreProducts(storeSlug, params = {}) {
    const query = buildQueryString(params);
    return apiClient.get(
      query
        ? `/api/stores/${storeSlug}/products?${query}`
        : `/api/stores/${storeSlug}/products`
    );
  },

  async getAllStores(params = {}) {
    const query = buildQueryString(params);
    return apiClient.get(
      query ? `/api/stores?${query}` : "/api/stores"
    );
  },

  async getStoreProfile(storeSlug) {
    return apiClient.get(`/api/stores/${storeSlug}`);
  },

  async getStoreReviewStats(storeSlug) {
    return apiClient.get(`/api/stores/${storeSlug}/reviews/stats`);
  },
};
