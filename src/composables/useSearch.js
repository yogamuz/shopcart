// composables/useSearch.js
import { ref, computed } from "vue";
import { searchService } from "@/services/searchService";
import { useToast } from "@/composables/useToast";

export const useSearch = () => {
  const { error: showToastError, success: showToastSuccess } = useToast();

  // State
  const searchResults = ref([]);
  const suggestions = ref({
    products: [],
    categories: [],
    sellers: [],
  });
  const pagination = ref({
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 10,
    hasNext: false,
    hasPrev: false,
  });
  const isSearching = ref(false);
  const isFetchingSuggestions = ref(false);
  const searchError = ref(null);
  const lastSearchTerm = ref("");
  const appliedFilters = ref({
    category: null,
    sellerId: null,
    minPrice: null,
    maxPrice: null,
    sortBy: "relevance",
  });

  // Computed
  const hasResults = computed(() => searchResults.value.length > 0);
  const hasSearched = computed(() => lastSearchTerm.value.length > 0);
  const hasSuggestions = computed(() => {
    return (
      suggestions.value.products.length > 0 ||
      suggestions.value.categories.length > 0 ||
      suggestions.value.sellers.length > 0
    );
  });

  /**
   * Search products
   */
  /**
   * Search products
   */
  const searchProducts = async (searchTerm, options = {}) => {
    // Validasi di composable
    if (!searchTerm || searchTerm.trim().length < 2) {
      searchError.value = "Search term must be at least 2 characters long";
      return { success: false, data: null };
    }

    try {
      isSearching.value = true;
      searchError.value = null;
      lastSearchTerm.value = searchTerm;

      const params = {
        q: searchTerm.trim(),
        category: options.category || appliedFilters.value.category,
        sellerId: options.sellerId || appliedFilters.value.sellerId,
        minPrice: options.minPrice || appliedFilters.value.minPrice,
        maxPrice: options.maxPrice || appliedFilters.value.maxPrice,
        sortBy: options.sortBy || appliedFilters.value.sortBy,
        page: options.page || 1,
        limit: options.limit || 10,
      };

      // Pure API call
      const response = await searchService.searchProducts(params);

      // Handle response di composable
      if (response.success) {
        searchResults.value = response.data.products || [];
        pagination.value = response.data.pagination || pagination.value;

        appliedFilters.value = {
          category: params.category,
          sellerId: params.sellerId,
          minPrice: params.minPrice,
          maxPrice: params.maxPrice,
          sortBy: params.sortBy,
        };

        console.log("✅ Search successful:", {
          term: searchTerm,
          results: searchResults.value.length,
          total: pagination.value.totalItems,
        });

        return { success: true, data: response.data };
      } else {
        searchError.value = response.message;
        searchResults.value = [];
        showToastError(response.message);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error("❌ Search error:", error);
      searchError.value = error.message || "Failed to search products";
      searchResults.value = [];
      showToastError(searchError.value);
      return { success: false, data: null };
    } finally {
      isSearching.value = false;
    }
  };

  /**
   * Get search suggestions (autocomplete)
   */
  const fetchSuggestions = async (query, limit = 5) => {
    if (!query || query.trim().length < 2) {
      suggestions.value = {
        products: [],
        categories: [],
        sellers: [],
      };
      return { success: true, data: suggestions.value };
    }

    try {
      isFetchingSuggestions.value = true;

      const result = await searchService.getSearchSuggestions(query, limit);

      if (result.success) {
        suggestions.value = result.data;
        return { success: true, data: result.data };
      } else {
        console.warn("⚠️ Failed to fetch suggestions:", result.message);
        return { success: false, data: null };
      }
    } catch (error) {
      console.error("❌ Fetch suggestions error:", error);
      return { success: false, data: null };
    } finally {
      isFetchingSuggestions.value = false;
    }
  };

  /**
   * Clear search results
   */
  const clearSearch = () => {
    searchResults.value = [];
    lastSearchTerm.value = "";
    searchError.value = null;
    pagination.value = {
      currentPage: 1,
      totalPages: 0,
      totalItems: 0,
      itemsPerPage: 10,
      hasNext: false,
      hasPrev: false,
    };
  };

  /**
   * Clear suggestions
   */
  const clearSuggestions = () => {
    suggestions.value = {
      products: [],
      categories: [],
      sellers: [],
    };
  };

  /**
   * Reset filters
   */
  const resetFilters = () => {
    appliedFilters.value = {
      category: null,
      sellerId: null,
      minPrice: null,
      maxPrice: null,
      sortBy: "relevance",
    };
  };

  /**
   * Update specific filter
   */
  const updateFilter = (filterName, value) => {
    appliedFilters.value[filterName] = value;
  };

  /**
   * Go to next page
   */
  const nextPage = async () => {
    if (pagination.value.hasNext && lastSearchTerm.value) {
      await searchProducts(lastSearchTerm.value, {
        page: pagination.value.currentPage + 1,
      });
    }
  };

  /**
   * Go to previous page
   */
  const previousPage = async () => {
    if (pagination.value.hasPrev && lastSearchTerm.value) {
      await searchProducts(lastSearchTerm.value, {
        page: pagination.value.currentPage - 1,
      });
    }
  };

  /**
   * Go to specific page
   */
  const goToPage = async page => {
    if (page >= 1 && page <= pagination.value.totalPages && lastSearchTerm.value) {
      await searchProducts(lastSearchTerm.value, { page });
    }
  };

  return {
    // State
    searchResults,
    suggestions,
    pagination,
    isSearching,
    isFetchingSuggestions,
    searchError,
    lastSearchTerm,
    appliedFilters,

    // Computed
    hasResults,
    hasSearched,
    hasSuggestions,

    // Actions
    searchProducts,
    fetchSuggestions,
    clearSearch,
    clearSuggestions,
    resetFilters,
    updateFilter,
    nextPage,
    previousPage,
    goToPage,
  };
};
