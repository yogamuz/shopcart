// services/searchService.js
import { useApiClient } from '@/composables/useApiClient';

class SearchService {
  constructor() {
    this.api = useApiClient();
  }

  /**
   * Search products with filters
   * @param {Object} params - Search parameters
   * @param {string} params.q - Search term (required, min 2 chars)
   * @param {string} params.category - Category filter
   * @param {string} params.sellerId - Seller ID filter
   * @param {number} params.minPrice - Minimum price
   * @param {number} params.maxPrice - Maximum price
   * @param {string} params.sortBy - Sort by (relevance, price_asc, price_desc, newest)
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   */
  async searchProducts(params = {}) {
    try {
      const { q, category, sellerId, minPrice, maxPrice, sortBy, page, limit } = params;

      // Validation
      if (!q || q.trim().length < 2) {
        return {
          success: false,
          message: 'Search term must be at least 2 characters long',
          data: null
        };
      }

      const queryParams = new URLSearchParams();
      queryParams.append('q', q.trim());

      if (category) queryParams.append('category', category);
      if (sellerId) queryParams.append('sellerId', sellerId);
      if (minPrice !== undefined) queryParams.append('minPrice', minPrice);
      if (maxPrice !== undefined) queryParams.append('maxPrice', maxPrice);
      if (sortBy) queryParams.append('sortBy', sortBy);
      if (page) queryParams.append('page', page);
      if (limit) queryParams.append('limit', limit);

      const response = await this.api.get(`/api/search?${queryParams.toString()}`);

      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Search products error:', error);
      return {
        success: false,
        message: error.message || 'Failed to search products',
        data: null,
        error
      };
    }
  }

  /**
   * Get search suggestions (autocomplete)
   * @param {string} query - Search query
   * @param {number} limit - Number of suggestions per type
   */
  async getSearchSuggestions(query, limit = 5) {
    try {
      if (!query || query.trim().length < 2) {
        return {
          success: true,
          data: {
            products: [],
            categories: [],
            sellers: []
          },
          message: 'Query too short for suggestions'
        };
      }

      const queryParams = new URLSearchParams();
      queryParams.append('q', query.trim());
      queryParams.append('limit', limit);

      const response = await this.api.get(`/api/search/suggestions?${queryParams.toString()}`);

      return {
        success: true,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      console.error('Get search suggestions error:', error);
      return {
        success: false,
        message: error.message || 'Failed to get search suggestions',
        data: {
          products: [],
          categories: [],
          sellers: []
        },
        error
      };
    }
  }
}

// Export singleton instance
export default new SearchService();