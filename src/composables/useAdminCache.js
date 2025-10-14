// composables/useAdminCache.js - Function based composable
import { ref, computed } from "vue";
import { useApiClient } from "./useApiClient";

export const useAdminCache = () => {
  const api = useApiClient();

  // State
  const cacheStats = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const successMessage = ref(null);

  // Computed
  const totalCacheEntries = computed(() => cacheStats.value?.totalKeys || 0);
  
  const totalCacheSize = computed(() => {
    if (!cacheStats.value?.memoryUsage) return 0;
    return cacheStats.value.memoryUsage.bytes || 0;
  });

  const hitRate = computed(() => {
    if (!cacheStats.value?.hitRates) return 0;
    
    // Calculate total hits and misses across all types
    let totalHits = 0;
    let totalMisses = 0;
    
    Object.values(cacheStats.value.hitRates).forEach(typeStats => {
      totalHits += typeStats.hits || 0;
      totalMisses += typeStats.misses || 0;
    });
    
    const total = totalHits + totalMisses;
    return total > 0 ? ((totalHits / total) * 100).toFixed(2) : 0;
  });

  // Additional computed for hits and misses display
  const totalHits = computed(() => {
    if (!cacheStats.value?.hitRates) return 0;
    return Object.values(cacheStats.value.hitRates).reduce((sum, type) => sum + (type.hits || 0), 0);
  });

  const totalMisses = computed(() => {
    if (!cacheStats.value?.hitRates) return 0;
    return Object.values(cacheStats.value.hitRates).reduce((sum, type) => sum + (type.misses || 0), 0);
  });

  // Get cache statistics
  const getCacheStats = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      const response = await api.get("/api/admin/cache/stats");
      cacheStats.value = response.data;
      return response.data;
    } catch (err) {
      error.value = err.message || "Failed to get cache statistics";
      console.error("getCacheStats error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Clear all cache
  const clearAllCache = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      successMessage.value = null;

      const response = await api.delete("/api/admin/cache/clear");
      successMessage.value = response.message || "All cache cleared successfully";

      // Refresh stats after clearing
      await getCacheStats();

      return response;
    } catch (err) {
      error.value = err.message || "Failed to clear cache";
      console.error("clearAllCache error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Clear cache by pattern
  const clearCacheByPattern = async (pattern) => {
    try {
      isLoading.value = true;
      error.value = null;
      successMessage.value = null;

      if (!pattern || pattern.trim().length === 0) {
        throw new Error("Pattern cannot be empty");
      }

      const response = await api.delete(`/api/admin/cache/clear/${pattern}`);
      successMessage.value = `${response.message || "Cache cleared"} - ${response.deletedCount} entries removed`;

      // Refresh stats after clearing
      await getCacheStats();

      return response;
    } catch (err) {
      error.value = err.message || `Failed to clear cache by pattern: ${pattern}`;
      console.error("clearCacheByPattern error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Invalidate specific cache type
  const invalidateCacheType = async (type, id) => {
    try {
      isLoading.value = true;
      error.value = null;
      successMessage.value = null;

      if (!type || !id) {
        throw new Error("Type and ID are required");
      }

      const response = await api.delete(`/api/admin/cache/invalidate/${type}/${id}`);
      successMessage.value = `${response.message || "Cache invalidated"} - ${response.deletedCount} entries removed`;

      // Refresh stats after invalidating
      await getCacheStats();

      return response;
    } catch (err) {
      error.value = err.message || `Failed to invalidate cache for ${type}:${id}`;
      console.error("invalidateCacheType error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Manual cache warmup
  const warmupCache = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      successMessage.value = null;

      const response = await api.post("/api/admin/cache/warmup", {});
      successMessage.value = response.message || "Cache warmup completed successfully";

      // Refresh stats after warmup
      await getCacheStats();

      return response;
    } catch (err) {
      error.value = err.message || "Failed to warmup cache";
      console.error("warmupCache error:", err);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  // Clear error message
  const clearError = () => {
    error.value = null;
  };

  // Clear success message
  const clearSuccess = () => {
    successMessage.value = null;
  };

  return {
    // State
    cacheStats,
    isLoading,
    error,
    successMessage,

    // Computed
    totalCacheEntries,
    totalCacheSize,
    hitRate,
    totalHits,
    totalMisses,

    // Methods
    getCacheStats,
    clearAllCache,
    clearCacheByPattern,
    invalidateCacheType,
    warmupCache,
    clearError,
    clearSuccess,
  };
};