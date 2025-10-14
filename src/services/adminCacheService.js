// services/AdminCacheService.js - Cache management service
import { useApiClient } from "@/composables/useApiClient";

const api = useApiClient();
const API_BASE = "/api/admin/cache";

export const AdminCacheService = {
  /**
   * Get cache statistics
   * @returns {Promise<Object>} Cache stats including totalEntries, totalSize, hitRate, etc.
   */
  async getStats() {
    try {
      const response = await api.get(`${API_BASE}/stats`);
      return response.data;
    } catch (error) {
      console.error("Failed to get cache stats:", error);
      throw error;
    }
  },

  /**
   * Clear all cache entries
   * @returns {Promise<Object>} Response with success message
   */
  async clearAll() {
    try {
      const response = await api.delete(`${API_BASE}/clear`);
      return response;
    } catch (error) {
      console.error("Failed to clear all cache:", error);
      throw error;
    }
  },

  /**
   * Clear cache by pattern
   * @param {string} pattern - Pattern to match cache keys (e.g., "product:*", "user:*")
   * @returns {Promise<Object>} Response with deletedCount
   */
  async clearByPattern(pattern) {
    try {
      if (!pattern || typeof pattern !== "string") {
        throw new Error("Pattern must be a non-empty string");
      }

      const response = await api.delete(`${API_BASE}/clear/${encodeURIComponent(pattern)}`);
      return response;
    } catch (error) {
      console.error(`Failed to clear cache by pattern "${pattern}":`, error);
      throw error;
    }
  },

  /**
   * Invalidate cache for specific type and ID
   * @param {string} type - Cache type (e.g., "product", "user", "seller")
   * @param {string} id - Entity ID
   * @returns {Promise<Object>} Response with deletedCount
   */
  async invalidate(type, id) {
    try {
      if (!type || !id) {
        throw new Error("Type and ID are required");
      }

      const response = await api.delete(`${API_BASE}/invalidate/${encodeURIComponent(type)}/${encodeURIComponent(id)}`);
      return response;
    } catch (error) {
      console.error(`Failed to invalidate cache for ${type}:${id}:`, error);
      throw error;
    }
  },

  /**
   * Perform manual cache warmup
   * @returns {Promise<Object>} Response with success message
   */
  async warmup() {
    try {
      const response = await api.post(`${API_BASE}/warmup`, {});
      return response;
    } catch (error) {
      console.error("Failed to warmup cache:", error);
      throw error;
    }
  },

  /**
   * Clear multiple patterns at once
   * @param {Array<string>} patterns - Array of patterns to clear
   * @returns {Promise<Object>} Combined response with total deletedCount
   */
  async clearMultiplePatterns(patterns) {
    try {
      if (!Array.isArray(patterns) || patterns.length === 0) {
        throw new Error("Patterns must be a non-empty array");
      }

      const results = await Promise.all(patterns.map(pattern => this.clearByPattern(pattern)));

      // Combine results
      const totalDeleted = results.reduce((sum, result) => sum + (result.deletedCount || 0), 0);

      return {
        success: true,
        message: `Cleared ${patterns.length} patterns`,
        deletedCount: totalDeleted,
        details: results,
      };
    } catch (error) {
      console.error("Failed to clear multiple patterns:", error);
      throw error;
    }
  },

  /**
   * Clear cache for specific entity types
   * @param {Array<string>} types - Array of types with IDs: [{type: "product", id: "123"}, ...]
   * @returns {Promise<Object>} Combined response with total deletedCount
   */
  async invalidateMultiple(types) {
    try {
      if (!Array.isArray(types) || types.length === 0) {
        throw new Error("Types must be a non-empty array");
      }

      const results = await Promise.all(types.map(item => this.invalidate(item.type, item.id)));

      // Combine results
      const totalDeleted = results.reduce((sum, result) => sum + (result.deletedCount || 0), 0);

      return {
        success: true,
        message: `Invalidated ${types.length} cache entries`,
        deletedCount: totalDeleted,
        details: results,
      };
    } catch (error) {
      console.error("Failed to invalidate multiple entries:", error);
      throw error;
    }
  },

  /**
   * Common cache clear patterns
   */
  patterns: {
    PRODUCTS: "products:*",
    PRODUCT_DETAIL: "product:*",
    CATEGORIES: "category:*",
    USERS: "user:*",
    SELLERS: "seller:*",
    SEARCH: "search:*",
    ALL: "*",
  },

  /**
   * Common cache types for invalidation
   */
  types: {
    PRODUCT: "product",
    USER: "user",
    SELLER: "seller",
    CATEGORY: "category",
  },
};