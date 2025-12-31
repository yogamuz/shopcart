<!-- home.vue -->
<template>
  <Navbar @search="handleSearch" @category-selected="handleCategorySelected" @products-filter="handleProductsFilter" />
  <Hero />
  <TodayBestDeals
    :search-query="searchQuery"
    :category-filter="categoryFilter"
    :products-data="filteredProducts"
    :is-filtering="isFiltering"
  />
  <PromoCard />
  <Brand />
  <!-- <WeeklyPopular 
    :category-filter="categoryFilter"
    :products-data="filteredProducts"
    :is-filtering="isFiltering"
  /> -->
  <Cashback2 />
  <TrendProduct :category-filter="categoryFilter" :products-data="filteredProducts" :is-filtering="isFiltering" />
  <BestSelling :category-filter="categoryFilter" :products-data="filteredProducts" :is-filtering="isFiltering" />
  <Services />
  <Footer />
  <VoucherModal ref="voucherModalRef" />
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useProductsStore } from "@/stores/productsStore";
import { useSearch } from "@/composables/useSearch";
import Hero from "@/components/Homepage/Hero.vue";
import Navbar from "@/components/Layout/Navbar/Navbar.vue";
import Brand from "@/components/Homepage/Brand/Brand.vue";
import PromoCard from "@/components/Product/PromoCard.vue";
import WeeklyPopular from "@/components/Product/WeeklyPopular/WeeklyPopular.vue";
import TodayBestDeals from "@/components/Product/TodayBestDeals.vue";
import Cashback2 from "@/components/Homepage/Cashback2.vue";
import TrendProduct from "@/components/Product/TrendProduct.vue";
import BestSelling from "@/components/Product/BestSelling.vue";
import Services from "@/components/Services.vue";
import Footer from "@/components/Layout/Footer.vue";
import VoucherModal from "@/components/VoucherModal.vue";

const route = useRoute();
const router = useRouter();
const { searchResults, isSearching } = useSearch();
const voucherModalRef = ref(null);
// Products API composable

const productsStore = useProductsStore();
onMounted(() => {
  productsStore.fetchProducts({
    page: 1,
    limit: 20,
  });
});
// Local state
const searchQuery = ref("");
const categoryFilter = ref("");
const currentFilters = ref({
  search: "",
  category: "",
  minPrice: null,
  maxPrice: null,
  page: 1,
  limit: 20,
});

// Computed
const isFiltering = computed(() => {
  return !!(
    searchQuery.value ||
    categoryFilter.value ||
    currentFilters.value.minPrice ||
    currentFilters.value.maxPrice
  );
});

const filteredProducts = computed(() => {
  // Jika ada hasil search dari API, gunakan itu
  if (searchResults.value.length > 0) {
    return searchResults.value;
  }

  // Fallback ke filtered products biasa
  return isFiltering.value ? products.value : [];
});

// Methods
const handleSearch = query => {
  searchQuery.value = query;
  currentFilters.value.search = query;
  currentFilters.value.page = 1;

  // Update URL with search param
  updateURL();

  // Fetch products with search
  fetchProductsData();
};

// Fixed handleCategorySelected method for Home.vue
const handleCategorySelected = category => {
  const categoryName = category.name?.toLowerCase() || category.names?.toLowerCase() || "";

  // Don't interfere with navigation - just update local state
  categoryFilter.value = categoryName;
  selectedCategory.value = category;

  // Clear any existing filters when switching categories
  searchQuery.value = "";
  currentFilters.value = {
    search: "",
    category: categoryName,
    minPrice: null,
    maxPrice: null,
    page: 1,
    limit: 20,
  };

  // Note: Navigation will be handled by the dropdown component itself
  // No need to call emit("products-filter") here as it will be handled by route change
};

const handleProductsFilter = filterParams => {
  // Handle filter params from navbar
  if (filterParams.search !== undefined) {
    searchQuery.value = filterParams.search;
    currentFilters.value.search = filterParams.search;
  }

  if (filterParams.category !== undefined) {
    categoryFilter.value = filterParams.category;
    currentFilters.value.category = filterParams.category;
  }

  if (filterParams.minPrice !== undefined) {
    currentFilters.value.minPrice = filterParams.minPrice;
  }

  if (filterParams.maxPrice !== undefined) {
    currentFilters.value.maxPrice = filterParams.maxPrice;
  }

  if (filterParams.page !== undefined) {
    currentFilters.value.page = filterParams.page;
  }

  // Update URL
  updateURL();

  // Fetch products with all filters
  fetchProductsData();
};

const updateURL = () => {
  const query = {};

  if (currentFilters.value.search) {
    query.search = currentFilters.value.search;
  }

  if (currentFilters.value.category) {
    query.category = currentFilters.value.category;
  }

  if (currentFilters.value.minPrice) {
    query.minPrice = currentFilters.value.minPrice;
  }

  if (currentFilters.value.maxPrice) {
    query.maxPrice = currentFilters.value.maxPrice;
  }

  if (currentFilters.value.page > 1) {
    query.page = currentFilters.value.page;
  }

  // Only update URL if it's different from current
  if (JSON.stringify(route.query) !== JSON.stringify(query)) {
    router.push({
      path: "/",
      query: Object.keys(query).length > 0 ? query : undefined,
    });
  }
};

const fetchProductsData = async () => {
  try {
    // Only fetch if we have filters applied
    if (!isFiltering.value) {
      return;
    }

    const params = {};

    if (currentFilters.value.search) {
      params.search = currentFilters.value.search;
    }

    if (currentFilters.value.category) {
      params.category = currentFilters.value.category;
    }

    if (currentFilters.value.minPrice) {
      params.minPrice = currentFilters.value.minPrice;
    }

    if (currentFilters.value.maxPrice) {
      params.maxPrice = currentFilters.value.maxPrice;
    }

    if (currentFilters.value.page) {
      params.page = currentFilters.value.page;
    }

    if (currentFilters.value.limit) {
      params.limit = currentFilters.value.limit;
    }

    await fetchProducts(params);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
};

const initializeFromURL = () => {
  // Initialize state from URL query parameters
  if (route.query.search) {
    searchQuery.value = route.query.search;
    currentFilters.value.search = route.query.search;
  }

  if (route.query.category) {
    categoryFilter.value = route.query.category;
    currentFilters.value.category = route.query.category;
  }

  if (route.query.minPrice) {
    currentFilters.value.minPrice = parseInt(route.query.minPrice);
  }

  if (route.query.maxPrice) {
    currentFilters.value.maxPrice = parseInt(route.query.maxPrice);
  }

  if (route.query.page) {
    currentFilters.value.page = parseInt(route.query.page);
  }

  // Fetch products if we have filters from URL
  if (isFiltering.value) {
    fetchProductsData();
  }
};
const showVoucherModal = () => {
  // Cek apakah voucher modal sudah pernah ditampilkan dalam session ini
  const hasShownVoucher = sessionStorage.getItem("voucherModalShown");

  if (!hasShownVoucher && voucherModalRef.value) {
    // Delay sedikit untuk smooth transition
    setTimeout(() => {
      voucherModalRef.value.openModal();
      sessionStorage.setItem("voucherModalShown", "true");
    }, 500);
  }
};

// Initialize on mount
onMounted(() => {
  initializeFromURL();
  showVoucherModal(); // Panggil setelah 500ms delay untuk animasi smooth
});

// Watch for route changes
watch(
  () => route.query,
  newQuery => {
    // Update local state when URL changes
    searchQuery.value = newQuery.search || "";
    categoryFilter.value = newQuery.category || "";

    currentFilters.value = {
      search: newQuery.search || "",
      category: newQuery.category || "",
      minPrice: newQuery.minPrice ? parseInt(newQuery.minPrice) : null,
      maxPrice: newQuery.maxPrice ? parseInt(newQuery.maxPrice) : null,
      page: newQuery.page ? parseInt(newQuery.page) : 1,
      limit: 20,
    };

    // Fetch products with new filters
    if (isFiltering.value) {
      fetchProductsData();
    }
  },
  { immediate: false }
);

// Initialize on mount
onMounted(() => {
  initializeFromURL();
  showVoucherModal();
});
</script>
