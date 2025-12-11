// 1. CategoryPage.vue (Main Component)
<template>
  <div class="bg-white min-h-screen">
    <Navbar @search="handleSearch" />

    <main class="w-full px-auto py-20 lg:py-25">
      <div class="container mx-auto px-4 py-8">
        <!-- Skeleton Loading - Only show on initial load -->
        <CategorySkeleton v-if="isInitialLoading" />

        <!-- Error State -->
        <CategoryError v-else-if="errorLoading" @retry="loadCategoryData" />

        <!-- Main Content with transition -->
        <transition
          name="fade"
          mode="out-in"
          :duration="{ enter: 300, leave: 150 }"
        >
          <div v-if="!isInitialLoading" key="content">
            <!-- Breadcrumb -->
            <CategoryBreadcrumb :current-category="currentCategory" />

            <!-- Category Header -->
            <CategoryHeader
              :current-category="currentCategory"
              :is-in-search-mode="isInSearchMode"
              :search-query="searchQuery"
              :pagination="pagination"
              :pagination-start="paginationStart"
              :pagination-end="paginationEnd"
            />

            <!-- Filters -->
            <CategoryFilters
              :price-range="priceRange"
              :max-possible-price="maxPossiblePrice"
              :is-filtering="isFiltering"
              :is-in-search-mode="isInSearchMode"
              :search-query="searchQuery"
              :has-active-filters="hasActiveFilters"
              @clear-search="clearSearch"
              @price-range-change="handlePriceRangeChange"
              @clear-price-filter="handleClearPriceFilter"
              ref="categoryFilters"
            />

            <!-- Product Grid with transition -->
            <ProductSection
              :displayed-products="displayedProducts"
              :normalized-products="normalizedProducts"
              :is-filtering="isFiltering"
              :is-in-search-mode="isInSearchMode"
              :search-query="searchQuery"
              :current-category="currentCategory"
              :price-range="priceRange"
              @product-click="viewProduct"
            />

            <!-- Pagination -->
            <CategoryPagination
              v-if="pagination && pagination.totalPages > 1"
              :pagination="pagination"
              :is-paginating="isPaginating"
              @change-page="changePage"
            />
          </div>
        </transition>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "@/components/Layout/Navbar/Navbar.vue";
import Footer from "@/components/Layout/Footer.vue";
import { useCategoryStore } from "@/stores/categoryStore";

// Import new components
import CategorySkeleton from "@/components/CategoryPage/CategorySkeleton.vue";
import CategoryError from "@/components/CategoryPage/CategoryError.vue";
import CategoryBreadcrumb from "@/components/CategoryPage/CategoryBreadcrumb.vue";
import CategoryHeader from "@/components/CategoryPage/CategoryHeader.vue";
import CategoryFilters from "@/components/CategoryPage/CategoryFilters.vue";
import ProductSection from "@/components/CategoryPage/ProductSection.vue";
import CategoryPagination from "@/components/CategoryPage/CategoryPagination.vue";

const route = useRoute();
const router = useRouter();

// Store
const categoryStore = useCategoryStore();

// Loading states - CRITICAL FIX
const isInitialLoading = ref(true); // Only true on first load
const isFiltering = ref(false); // For filter operations
const isPaginating = ref(false); // For pagination
const errorLoading = ref(false);
const searchQuery = ref("");

// Price range state
const maxPossiblePrice = 10000000;
const priceRange = ref({
  min: 0,
  max: maxPossiblePrice,
});

// Drag state
const dragState = ref({
  isDragging: false,
  dragType: null,
  startX: 0,
  startValue: 0,
  trackRect: null,
});

// Filter options
const filterOptions = ref({
  minPrice: null,
  maxPrice: null,
  search: "",
  page: 1,
  limit: 20,
});

// Hybrid state management
const localProductsCache = ref([]);
const searchDebounceTimer = ref(null);

// Computed
const slug = computed(() =>
  (route.params.slug || route.params.categorySlug || "").toString()
);
const currentCategory = computed(() => categoryStore.currentCategory);
const products = computed(() => categoryStore.categoryProducts);
const filters = computed(() => categoryStore.filters);

// Track what filters are active
const activeFilters = computed(() => ({
  hasPrice: priceRange.value.min > 0 || priceRange.value.max < maxPossiblePrice,
  hasSearch: !!searchQuery.value,
  priceOnly:
    (priceRange.value.min > 0 || priceRange.value.max < maxPossiblePrice) &&
    !searchQuery.value,
}));

// Decide filtering strategy based on data size and filters
const shouldUseLocalFiltering = computed(() => {
  const hasLocalData = localProductsCache.value.length > 0;
  const isSmallDataset = localProductsCache.value.length <= 500;
  const isPriceOnlyFilter = activeFilters.value.priceOnly;

  return hasLocalData && (isSmallDataset || isPriceOnlyFilter);
});

// Local filtering for price range only
const localFilteredProducts = computed(() => {
  if (!shouldUseLocalFiltering.value) return [];

  let filtered = [...localProductsCache.value];

  // Price range filter (always local when possible)
  if (activeFilters.value.hasPrice) {
    filtered = filtered.filter((product) => {
      const price = product.price || 0;
      return price >= priceRange.value.min && price <= priceRange.value.max;
    });
  }

  return filtered;
});

// Choose data source based on filtering strategy
const displayedProducts = computed(() => {
  return shouldUseLocalFiltering.value
    ? localFilteredProducts.value
    : products.value || [];
});

// Use server pagination or local pagination based on strategy
const pagination = computed(() => {
  if (shouldUseLocalFiltering.value) {
    const total = localFilteredProducts.value.length;
    const totalPages = Math.ceil(total / filterOptions.value.limit);
    const start = (filterOptions.value.page - 1) * filterOptions.value.limit;

    return {
      page: filterOptions.value.page,
      limit: filterOptions.value.limit,
      total: total,
      totalPages: totalPages,
      hasPrev: filterOptions.value.page > 1,
      hasNext: filterOptions.value.page < totalPages,
    };
  }
  return categoryStore.pagination || {};
});

// Fixed pagination calculations
const paginationStart = computed(() => {
  if (!pagination.value || !pagination.value.total) return 0;
  return (pagination.value.page - 1) * pagination.value.limit + 1;
});

const paginationEnd = computed(() => {
  if (!pagination.value || !pagination.value.total) return 0;
  return Math.min(
    pagination.value.page * pagination.value.limit,
    pagination.value.total
  );
});

// Search functionality
const isInSearchMode = computed(() => !!searchQuery.value);

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return (
    priceRange.value.min > 0 ||
    priceRange.value.max < maxPossiblePrice ||
    searchQuery.value
  );
});

// Normalize products to ensure consistent data structure
const normalizedProducts = computed(() => {
  return displayedProducts.value.map((product) => ({
    ...product,
    id: product.id || product._id,
    title: product.title,
    name: product.name,
    price: product.price,
    description: product.description,
    rating: product.rating,
    reviews: product.reviews,
    stock: product.stock,
    storeName: product.seller?.name,
    isLiked: product.isLiked || false,
    image: product.image || product.imageUrl || product.thumbnail,
  }));
});

// Methods
const initializeFromURL = () => {
  filterOptions.value = {
    minPrice: null,
    maxPrice: null,
    search: "",
    page: 1,
    limit: 20,
  };
  searchQuery.value = "";
  priceRange.value = {
    min: 0,
    max: maxPossiblePrice,
  };
};

const buildQueryParams = () => {
  const params = {};
  if (filterOptions.value.page) params.page = filterOptions.value.page;
  if (filterOptions.value.limit) params.limit = filterOptions.value.limit;
  if (priceRange.value.min > 0) params.minPrice = priceRange.value.min;
  if (priceRange.value.max < maxPossiblePrice)
    params.maxPrice = priceRange.value.max;
  if (filterOptions.value.search) params.search = filterOptions.value.search;
  return params;
};

// Enhanced loadCategoryData with caching strategy
const loadCategoryData = async (isNavigation = false) => {
  try {
    if (!isNavigation) {
      isInitialLoading.value = true;
    }
    errorLoading.value = false;

    initializeFromURL();

    // Check if navigating to same category
    if (
      isNavigation &&
      currentCategory.value &&
      slug.value === currentCategory.value.name?.toLowerCase()
    ) {
      return;
    }

    const params = buildQueryParams();

    // For small categories, load all data for local filtering
    // For large categories, use server-side pagination
    const shouldLoadAll = !filterOptions.value.search; // Load all only if no search

    if (shouldLoadAll) {
      // Try to load all data for local filtering capability
      params.limit = 1000; // Reasonable limit for caching
    }

    await categoryStore.fetchProductsByCategory(slug.value, params);

    // Cache products for local filtering if dataset is manageable
    if (shouldLoadAll && products.value && products.value.length <= 500) {
      localProductsCache.value = [...products.value];
    } else {
      localProductsCache.value = []; // Clear cache for large datasets
    }

    if (!currentCategory.value) {
      throw new Error(`Category ${slug.value} not found`);
    }
  } catch (error) {
    console.error("Error loading category data:", error);
    errorLoading.value = true;
  } finally {
    isInitialLoading.value = false;
    isFiltering.value = false;
    isPaginating.value = false;
  }
};

// Hybrid applyFilters - price local, others server
const applyFilters = async () => {
  filterOptions.value.page = 1;

  // Price-only filter: use local filtering
  if (activeFilters.value.priceOnly) {
    // No server request needed - reactive computed handles it
    return;
  }

  // Has search or complex filters: use server
  isFiltering.value = true;
  try {
    const params = buildQueryParams();
    await categoryStore.fetchProductsByCategory(slug.value, params);
  } catch (error) {
    console.error("Error applying filters:", error);
  } finally {
    isFiltering.value = false;
  }
};

// Hybrid handleSearch - always server-side with debounce
const handleSearch = async (query) => {
  searchQuery.value = query;
  filterOptions.value.search = query;
  filterOptions.value.page = 1;

  // Clear previous timer
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }

  // Debounce search requests
  searchDebounceTimer.value = setTimeout(async () => {
    isFiltering.value = true;
    try {
      const params = buildQueryParams();
      await categoryStore.fetchProductsByCategory(slug.value, params);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      isFiltering.value = false;
    }
  }, 300); // 300ms debounce
};

// Hybrid clearSearch
const clearSearch = async () => {
  searchQuery.value = "";
  filterOptions.value.search = "";
  filterOptions.value.page = 1;

  // Clear debounce timer
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }

  // If we have price filters, stay local. Otherwise, refresh from server
  if (!activeFilters.value.hasPrice) {
    isFiltering.value = true;
    try {
      const params = buildQueryParams();
      await categoryStore.fetchProductsByCategory(slug.value, params);
    } catch (error) {
      console.error("Error clearing search:", error);
    } finally {
      isFiltering.value = false;
    }
  }
};

// Hybrid clearAllFilters
const clearAllFilters = async () => {
  filterOptions.value = {
    minPrice: null,
    maxPrice: null,
    search: "",
    page: 1,
    limit: 20,
  };
  searchQuery.value = "";
  priceRange.value = {
    min: 0,
    max: maxPossiblePrice,
  };

  // Clear debounce timer
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }

  // Always refresh from server when clearing all
  isFiltering.value = true;
  try {
    const params = buildQueryParams();
    await categoryStore.fetchProductsByCategory(slug.value, params);
  } catch (error) {
    console.error("Error clearing filters:", error);
  } finally {
    isFiltering.value = false;
  }
};

// Hybrid changePage
const changePage = async (page) => {
  filterOptions.value.page = page;

  // Local pagination for small datasets or price-only filters
  if (shouldUseLocalFiltering.value) {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  // Server pagination for large datasets or complex filters
  isPaginating.value = true;
  try {
    const params = buildQueryParams();
    await categoryStore.fetchProductsByCategory(slug.value, params);
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    console.error("Error changing page:", error);
  } finally {
    isPaginating.value = false;
  }
};
const startDrag = (type, event) => {
  event.preventDefault();
  event.stopPropagation();

  // PERBAIKAN: Akses priceTrack dari child component dengan cara yang benar
  const priceTrackElement =
    categoryFilters.value?.priceRangeFilter?.$refs?.priceTrack ||
    categoryFilters.value?.$refs?.priceRangeFilter?.$refs?.priceTrack;

  if (!priceTrackElement) {
    console.warn("PriceTrack element not found");
    return;
  }

  const rect = priceTrackElement.getBoundingClientRect();
  const clientX = event.touches ? event.touches[0].clientX : event.clientX;

  dragState.value = {
    isDragging: true,
    dragType: type,
    startX: clientX,
    startValue: priceRange.value[type],
    trackRect: rect,
  };

  if (event.touches) {
    document.addEventListener("touchmove", onDrag, { passive: false });
    document.addEventListener("touchend", endDrag);
  } else {
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", endDrag);
  }

  document.body.style.userSelect = "none";
  document.body.style.cursor = "grabbing";
};

const onDrag = (event) => {
  if (!dragState.value.isDragging || !dragState.value.trackRect) return;

  event.preventDefault();

  const clientX = event.touches ? event.touches[0].clientX : event.clientX;
  const rect = dragState.value.trackRect;

  let percentage = ((clientX - rect.left) / rect.width) * 100;
  percentage = Math.max(0, Math.min(100, percentage));

  const newValue = Math.round((percentage / 100) * maxPossiblePrice);

  if (dragState.value.dragType === "min") {
    const maxAllowed = priceRange.value.max - 100000;
    priceRange.value.min = Math.max(0, Math.min(newValue, maxAllowed));
  } else if (dragState.value.dragType === "max") {
    const minAllowed = priceRange.value.min + 100000;
    priceRange.value.max = Math.max(
      minAllowed,
      Math.min(newValue, maxPossiblePrice)
    );
  }
};

const endDrag = () => {
  if (dragState.value.isDragging) {
    dragState.value.isDragging = false;
    dragState.value.dragType = null;
    dragState.value.trackRect = null;

    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", endDrag);
    document.removeEventListener("touchmove", onDrag);
    document.removeEventListener("touchend", endDrag);

    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }
};

const handlePriceRangeChange = (newRange) => {
  priceRange.value = newRange;
  // Auto-apply price filter when changed (no manual apply needed)
  applyFilters();
};
const handleClearPriceFilter = () => {
  priceRange.value = {
    min: 0,
    max: maxPossiblePrice,
  };
  applyFilters();
};
const viewProduct = (productId) => {
  router.push(`/products/${productId}`);
};

// Cleanup function for debounce timer
const cleanupTimers = () => {
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
    searchDebounceTimer.value = null;
  }
};

// Refs
const categoryFilters = ref(null);

// CRITICAL WATCHER - Optimized for seamless navigation
watch(
  slug,
  async (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) {
      // This is a category navigation - use optimized loading
      await loadCategoryData(true); // Pass true for navigation
    }
  },
  { immediate: false }
);

// Cleanup
onUnmounted(() => {
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", endDrag);
  document.removeEventListener("touchmove", onDrag);
  document.removeEventListener("touchend", endDrag);
  document.body.style.userSelect = "";
  document.body.style.cursor = "";
  cleanupTimers();
});

// Initialize - only show skeleton on first mount
onMounted(() => {
  loadCategoryData(false); // Pass false for initial load
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>
