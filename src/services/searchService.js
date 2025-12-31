// services/searchService.js - Pure API layer
import { useApiClient } from '@/composables/useApiClient';

const apiClient = useApiClient();

/**
 * Build query string from params object
 */
const buildQueryString = (params = {}) => {
  const queryParams = new URLSearchParams();
  
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value !== null && value !== undefined && value !== '') {
      queryParams.append(key, value);
    }
  });
  
  return queryParams.toString();
};

export const searchService = {
  async searchProducts(params) {
    const queryString = buildQueryString(params);
    return apiClient.get(`/api/search?${queryString}`);
  },

  async getSearchSuggestions(query, limit = 5) {
    const queryString = buildQueryString({ q: query, limit });
    return apiClient.get(`/api/search/suggestions?${queryString}`);
  }
};