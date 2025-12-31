import { defineStore } from "pinia";
import { productService } from "@/services/productService";

// Frontend validation constants
const API_LIMITS = {
  MIN_LIMIT: 1,
  MAX_LIMIT: 50, // Sesuaikan dengan backend limit
  DEFAULT_LIMIT: 20,
  MIN_PAGE: 1,
  DEFAULT_PAGE: 1,
};

/**
 * Sanitize and validate query parameters
 * @param {Object} params - Query parameters
 * @returns {Object} Sanitized parameters
 */
const sanitizeQueryParams = (params = {}) => {
  const {
    limit = API_LIMITS.DEFAULT_LIMIT,
    page = API_LIMITS.DEFAULT_PAGE,
    ...otherParams
  } = params;

  // FIXED: Enforce frontend limits before sending to API
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
};
export const useCategoryStore = defineStore("category", {
  state: () => ({
    // Static categories data - no need for API fetch
    categories: [
      {
        id: "66d1a2b3c4e5f6789abcdef1",
        name: "Fashion",
        slug: "fashion",
        description:
          "Fashion items including clothing, accessories, and style essentials",
        isActive: true,
      },
      {
        id: "66d1a2b3c4e5f6789abcdef2",
        name: "Sneakers",
        slug: "sneakers",
        description: "Sneakers and athletic footwear for all occasions",
        isActive: true,
      },
      {
        id: "66d1a2b3c4e5f6789abcdef3",
        name: "Toys",
        slug: "toys",
        description: "Toys and games for children and adults",
        isActive: true,
      },
      {
        id: "66d1a2b3c4e5f6789abcdef4",
        name: "Furniture",
        slug: "furniture",
        description: "Home and office furniture for comfortable living",
        isActive: true,
      },
      {
        id: "66d1a2b3c4e5f6789abcdef5",
        name: "Gadgets",
        slug: "gadgets",
        description: "Electronic gadgets and tech accessories",
        isActive: true,
      },
      {
        id: "66d1a2b3c4e5f6789abcdef0",
        name: "Beauty",
        slug: "beauty",
        description:
          "Beauty products including cosmetics, skincare, and personal care items",
        isActive: true,
      },
    ],
    currentCategory: null,
    categoryProducts: [],
    pagination: null,
    filters: null,
    loading: false,
    error: null,

    // FIXED: Enhanced request caching and deduplication
    requestCache: new Map(),
    pendingRequests: new Map(),
    lastRequestTime: new Map(),

    // FIXED: More aggressive cache settings
    // GANTI cacheConfig di state() dengan menambah defaultParams:
    cacheConfig: {
      maxAge: 10 * 60 * 1000, // 10 minutes cache (increased)
      maxSize: 100, // Maximum cached requests (increased)
      debounceTime: 200, // Minimum time between identical requests (increased)
      staleWhileRevalidate: true, // Serve stale data while fetching new
      // ADDED: Default sanitized params to prevent large requests
      defaultParams: {
        limit: API_LIMITS.DEFAULT_LIMIT,
        page: API_LIMITS.DEFAULT_PAGE,
      },
    },
  }),

  getters: {
    getCategoryById: (state) => (id) => {
      return state.categories.find(
        (category) => category.id === id || category._id === id
      );
    },

    getCategoryByName: (state) => (name) => {
      return state.categories.find(
        (category) => category.name.toLowerCase() === name.toLowerCase()
      );
    },

    getCategoryBySlug: (state) => (slug) => {
      return state.categories.find(
        (category) =>
          category.slug?.toLowerCase() === slug.toLowerCase() ||
          category.name.toLowerCase() === slug.toLowerCase()
      );
    },

    getActiveCategories: (state) => {
      return state.categories.filter((category) => category.isActive);
    },

    isLoading: (state) => state.loading,

    hasError: (state) => !!state.error,

    getErrorMessage: (state) => state.error?.message || state.error,

    generateSlug: () => (name) => {
      return name
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim("-");
    },
  },

  actions: {
    // FIXED: More precise cache key generation
    generateCacheKey(categorySlug, params = {}) {
      // Normalize category slug
      const normalizedSlug = categorySlug.toLowerCase();

      // Filter out undefined/null/empty values and sort
      const cleanParams = {};
      Object.keys(params).forEach((key) => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== "") {
          cleanParams[key] = value;
        }
      });

      // Sort keys for consistent ordering
      const sortedKeys = Object.keys(cleanParams).sort();
      const paramString = sortedKeys
        .map((key) => `${key}=${cleanParams[key]}`)
        .join("&");

      return `${normalizedSlug}${paramString ? `?${paramString}` : ""}`;
    },

    // FIXED: Enhanced cache checking with stale-while-revalidate
    shouldUseCache(cacheKey) {
      const cached = this.requestCache.get(cacheKey);
      if (!cached) return { use: false, stale: false };

      const now = Date.now();
      const age = now - cached.timestamp;
      const isExpired = age > this.cacheConfig.maxAge;

      if (isExpired) {
        if (this.cacheConfig.staleWhileRevalidate) {
          // Use stale data but mark for revalidation
          return { use: true, stale: true, data: cached };
        } else {
          this.requestCache.delete(cacheKey);
          return { use: false, stale: false };
        }
      }

      return { use: true, stale: false, data: cached };
    },

    // FIXED: Enhanced pending request check
    hasPendingRequest(cacheKey) {
      const pending = this.pendingRequests.get(cacheKey);
      if (!pending) return false;

      // Check if promise is still pending
      if (pending.settled) {
        this.pendingRequests.delete(cacheKey);
        return false;
      }

      return true;
    },

    // FIXED: Better pending request management
    setPendingRequest(cacheKey, promise) {
      const wrappedPromise = promise
        .then((result) => {
          wrappedPromise.settled = true;
          return result;
        })
        .catch((error) => {
          wrappedPromise.settled = true;
          throw error;
        })
        .finally(() => {
          this.pendingRequests.delete(cacheKey);
        });

      wrappedPromise.settled = false;
      this.pendingRequests.set(cacheKey, wrappedPromise);
      return wrappedPromise;
    },

    // FIXED: More aggressive cleanup
    cleanupCache() {
      const now = Date.now();

      // Remove expired entries
      for (const [key, value] of this.requestCache.entries()) {
        if (now - value.timestamp > this.cacheConfig.maxAge) {
          this.requestCache.delete(key);
          this.lastRequestTime.delete(key);
        }
      }

      // Remove oldest entries if cache is too large
      if (this.requestCache.size > this.cacheConfig.maxSize) {
        const entries = Array.from(this.requestCache.entries()).sort(
          (a, b) => a[1].timestamp - b[1].timestamp
        );

        const toDelete = entries.slice(
          0,
          entries.length - this.cacheConfig.maxSize
        );
        toDelete.forEach(([key]) => {
          this.requestCache.delete(key);
          this.lastRequestTime.delete(key);
        });
      }
    },

    setCategoryByName(categoryName) {
      const category =
        this.getCategoryByName(categoryName) ||
        this.getCategoryBySlug(categoryName);

      if (category) {
        this.currentCategory = category;
        return category;
      }

      throw new Error(`Category "${categoryName}" not found`);
    },

    /**
     * FIXED: Enhanced fetchProductsByCategory with better deduplication
     */
    async fetchProductsByCategory(categoryIdentifier, params = {}) {
      try {
        // Find the category first
        const category =
          this.getCategoryBySlug(categoryIdentifier) ||
          this.getCategoryByName(categoryIdentifier);

        if (!category) {
          throw new Error(`Category "${categoryIdentifier}" not found`);
        }

        // FIXED: Sanitize params to prevent large limit requests
        const sanitizedParams = sanitizeQueryParams(params);

        // Normalize params to prevent duplicate requests
        const normalizedParams = { ...sanitizedParams };
        if (normalizedParams.category) {
          normalizedParams.category = normalizedParams.category.toLowerCase();
        }

        // Generate cache key
        const cacheKey = this.generateCacheKey(
          categoryIdentifier,
          normalizedParams
        );


        // FIXED: Check for cached result with stale-while-revalidate
        const cacheResult = this.shouldUseCache(cacheKey);
        if (cacheResult.use) {
 

          // Restore cached data immediately
          const cachedData = cacheResult.data.data;
          this.categoryProducts = cachedData.categoryProducts;
          this.pagination = cachedData.pagination;
          this.filters = cachedData.filters;
          this.currentCategory = category;

          // If data is stale, fetch in background
          if (cacheResult.stale) {

            this._executeProductRequest(
              category,
              normalizedParams,
              cacheKey
            ).catch((error) =>
              console.warn("Background revalidation failed:", error)
            );
          }

          return cachedData.response;
        }

        // FIXED: Check for pending identical request
        if (this.hasPendingRequest(cacheKey)) {
          return await this.pendingRequests.get(cacheKey);
        }

        // FIXED: Enhanced debounce check
        const now = Date.now();
        const lastRequest = this.lastRequestTime.get(cacheKey);
        if (lastRequest && now - lastRequest < this.cacheConfig.debounceTime) {


          // Return cached data if available during debounce
          const existingCache = this.requestCache.get(cacheKey);
          if (existingCache) {
            const cachedData = existingCache.data;
            this.categoryProducts = cachedData.categoryProducts;
            this.pagination = cachedData.pagination;
            this.filters = cachedData.filters;
            this.currentCategory = category;
            return cachedData.response;
          }

          // Otherwise wait for debounce period
          await new Promise((resolve) =>
            setTimeout(
              resolve,
              this.cacheConfig.debounceTime - (now - lastRequest)
            )
          );
        }

        this.loading = true;
        this.error = null;
        this.lastRequestTime.set(cacheKey, now);

        // FIXED: Create and track the request promise
        const requestPromise = this._executeProductRequest(
          category,
          normalizedParams,
          cacheKey
        );
        this.setPendingRequest(cacheKey, requestPromise);

        const response = await requestPromise;

        return response;
      } catch (error) {
        console.error("Error fetching category products:", error);
        this.error = error;
        this.categoryProducts = [];
        this.pagination = null;
        this.filters = null;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * FIXED: Enhanced _executeProductRequest with better caching
     */
    // GANTI bagian awal method _executeProductRequest dengan ini:
    async _executeProductRequest(category, params, cacheKey) {
      // FIXED: Apply sanitization again to ensure no large limits slip through
      const sanitizedParams = sanitizeQueryParams(params);

      const productParams = {
        ...sanitizedParams,
        category: category.name.toLowerCase(),
      };


      const response = await productService.getProducts(productParams);

      // Rest of method remains the same...

      if (response.success) {
        const list =
          response.data?.products || response.data?.data?.products || [];

        const normalizedProducts = list.map((p) => ({
          id: p.id || p._id,
          _id: p._id || p.id,
          title: p.title || p.name,
          name: p.name || p.title,
          slug: p.slug,
          description: p.description || "",
          price: p.price || 0,
          image: p.image?.url
            ? p.image
            : p.image || p.imageUrl || p.thumbnail || null,
          category:
            typeof p.category === "string"
              ? p.category
              : p.category?.name || p.category,
          seller: p.seller,
          stock: typeof p.stock === "number" ? p.stock : p.inStock ? 1 : 0,
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          isAvailable:
            p.isAvailable !== undefined ? p.isAvailable : p.stock > 0,
          storeName: p.storeName || p.seller?.name,
          isLiked: p.isLiked || false,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        }));

        const paginationData =
          response.data?.pagination || response.data?.data?.pagination || null;
        const filtersData =
          response.data?.filters || response.data?.data?.filters || null;

        // Update state
        this.categoryProducts = normalizedProducts;
        this.pagination = paginationData;
        this.filters = filtersData;
        this.currentCategory = category;

        // FIXED: Cache the successful result
        this.requestCache.set(cacheKey, {
          timestamp: Date.now(),
          data: {
            categoryProducts: [...normalizedProducts],
            pagination: paginationData ? { ...paginationData } : null,
            filters: filtersData ? { ...filtersData } : null,
            response: { ...response },
          },
        });


        // Cleanup old cache entries
        this.cleanupCache();
      } else {
        throw new Error(
          response.message || "Failed to fetch category products"
        );
      }

      return response;
    },

    /**
     * FIXED: More precise cache clearing
     */
    clearCache(categoryIdentifier = null) {
      if (categoryIdentifier) {
        const normalizedSlug = categoryIdentifier.toLowerCase();
        const keysToDelete = [];

        for (const key of this.requestCache.keys()) {
          if (key.startsWith(normalizedSlug)) {
            keysToDelete.push(key);
          }
        }

        keysToDelete.forEach((key) => {
          this.requestCache.delete(key);
          this.lastRequestTime.delete(key);
          this.pendingRequests.delete(key);
        });

      } else {
        this.requestCache.clear();
        this.pendingRequests.clear();
        this.lastRequestTime.clear();
      }
    },

    updateFilters(newParams) {
      if (typeof window !== "undefined") {
        const url = new URL(window.location);

        Object.keys(newParams).forEach((key) => {
          if (
            newParams[key] !== null &&
            newParams[key] !== undefined &&
            newParams[key] !== ""
          ) {
            url.searchParams.set(key, newParams[key]);
          } else {
            url.searchParams.delete(key);
          }
        });

        window.history.replaceState({}, "", url.toString());
      }
    },

    clearError() {
      this.error = null;
    },

    clearCurrentCategory() {
      this.currentCategory = null;
    },

    clearCategoryProducts() {
      this.categoryProducts = [];
      this.pagination = null;
      this.filters = null;
    },
  },
});
