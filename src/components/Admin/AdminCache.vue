<!-- AdminCache.vue - Cache Management Dashboard -->
<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900">Cache Management</h1>
        <p class="text-sm text-gray-600 mt-1">Monitor and manage application cache</p>
      </div>
      <button
        @click="refreshStats"
        :disabled="isLoading"
        class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        <svg
          :class="['w-4 h-4', isLoading && 'animate-spin']"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <span>{{ isLoading ? "Refreshing..." : "Refresh" }}</span>
      </button>
    </div>

    <!-- Alert Messages -->
    <div v-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
      <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
      </svg>
      <div class="flex-1">
        <p class="text-sm font-medium text-red-800">{{ error }}</p>
        <button @click="clearError" class="text-xs text-red-600 hover:text-red-700 mt-1">Dismiss</button>
      </div>
    </div>

    <div v-if="successMessage" class="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-3">
      <svg class="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
      </svg>
      <div class="flex-1">
        <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
        <button @click="clearSuccess" class="text-xs text-green-600 hover:text-green-700 mt-1">Dismiss</button>
      </div>
    </div>

    <!-- Stats Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Entries Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Total Entries</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{{ totalCacheEntries }}</p>
          </div>
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Total Size Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Total Size</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{{ formatSize(totalCacheSize) }}</p>
          </div>
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7m0 0V5c0-2.21-3.582-4-8-4S4 2.79 4 5v2m0 0c0 2.21 3.582 4 8 4s8-1.79 8-4" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Hit Rate Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600 font-medium">Hit Rate</p>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{{ hitRate }}%</p>
          </div>
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Hits/Misses Card -->
      <div class="bg-white rounded-lg shadow p-6">
        <div>
          <p class="text-sm text-gray-600 font-medium">Hits / Misses</p>
          <div class="mt-2 space-y-1">
            <p class="text-lg font-semibold text-gray-900">
              {{ totalHits }} / {{ totalMisses }}
            </p>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="bg-blue-600 h-2 rounded-full"
                :style="{ width: hitRate + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Cache Actions</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Clear All Button -->
        <button
          @click="handleClearAll"
          :disabled="isLoading"
          class="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>Clear All Cache</span>
        </button>

        <!-- Warmup Cache Button -->
        <button
          @click="handleWarmup"
          :disabled="isLoading"
          class="flex items-center justify-center space-x-2 px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors font-medium"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Warmup Cache</span>
        </button>

        <!-- Refresh Stats Button -->
        <button
          @click="refreshStats"
          :disabled="isLoading"
          class="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          <svg :class="['w-5 h-5', isLoading && 'animate-spin']" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Stats</span>
        </button>
      </div>
    </div>

    <!-- Clear by Pattern Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Clear by Pattern</h2>

      <div class="space-y-4">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <button
            v-for="(pattern, key) in patternsList"
            :key="key"
            @click="handleClearPattern(pattern)"
            :disabled="isLoading"
            class="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg disabled:opacity-50 transition-colors font-medium"
          >
            {{ key }}
          </button>
        </div>

        <!-- Custom Pattern Input -->
        <div class="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-gray-200">
          <input
            v-model="customPattern"
            type="text"
            placeholder="Enter custom pattern (e.g., product:*, user:*)"
            class="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            @click="handleClearPattern(customPattern)"
            :disabled="isLoading || !customPattern.trim()"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
          >
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Invalidate by Type Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Invalidate by Type</h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <select
            v-model="invalidateType"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Type</option>
            <option value="product">Product</option>
            <option value="user">User</option>
            <option value="seller">Seller</option>
            <option value="category">Category</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">ID</label>
          <input
            v-model="invalidateId"
            type="text"
            placeholder="Enter entity ID"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        @click="handleInvalidate"
        :disabled="isLoading || !invalidateType || !invalidateId"
        class="w-full mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors font-medium"
      >
        Invalidate Cache
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAdminCache } from "@/composables/useAdminCache";

// Composable
const {
  getCacheStats,
  clearAllCache,
  clearCacheByPattern,
  invalidateCacheType,
  warmupCache,
  cacheStats,
  isLoading,
  error,
  successMessage,
  totalCacheEntries,
  totalCacheSize,
  hitRate,
  totalHits,
  totalMisses,
  clearError,
  clearSuccess,
} = useAdminCache();

// Local state
const customPattern = ref("");
const invalidateType = ref("");
const invalidateId = ref("");

// Pattern list
const patternsList = computed(() => ({
  "Products": "products:*",
  "Product Detail": "product:*",
  "Categories": "category:*",
  "Users": "user:*",
  "Sellers": "seller:*",
  "Search": "search:*",
}));

// Format size
const formatSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// Methods
const refreshStats = async () => {
  try {
    await getCacheStats();
  } catch (err) {
    console.error("Failed to refresh stats:", err);
  }
};

const handleClearAll = async () => {
  if (!confirm("Are you sure you want to clear all cache? This cannot be undone.")) return;

  try {
    await clearAllCache();
  } catch (err) {
    console.error("Clear all cache failed:", err);
  }
};

const handleClearPattern = async (pattern) => {
  if (!pattern.trim()) {
    alert("Please enter a pattern");
    return;
  }

  try {
    await clearCacheByPattern(pattern);
    customPattern.value = "";
  } catch (err) {
    console.error("Clear by pattern failed:", err);
  }
};

const handleInvalidate = async () => {
  if (!invalidateType.value || !invalidateId.value) {
    alert("Please select type and enter ID");
    return;
  }

  try {
    await invalidateCacheType(invalidateType.value, invalidateId.value);
    invalidateType.value = "";
    invalidateId.value = "";
  } catch (err) {
    console.error("Invalidate cache failed:", err);
  }
};

const handleWarmup = async () => {
  try {
    await warmupCache();
  } catch (err) {
    console.error("Cache warmup failed:", err);
  }
};

// Lifecycle
onMounted(async () => {
  await refreshStats();
});
</script>

<style scoped>
/* Animations */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  button:active:not(:disabled) {
    transform: scale(0.98);
  }
}
</style>