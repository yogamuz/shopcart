<!-- todaybestdealsvue -->
<template>
  <section id="deals" class="py-12 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <!-- Dynamic Title based on filtering state -->
      <h2 class="text-3xl font-bold text-gray-900 mb-4 sm:mb-8">
        <span v-if="isFiltering && categoryFilter && searchQuery">
          "{{ searchQuery }}" in {{ categoryDisplayName }}
        </span>
        <span v-else-if="isFiltering && categoryFilter">
          {{ categoryDisplayName }} Products
        </span>
        <span v-else-if="isFiltering && searchQuery">
          Search Results for "{{ searchQuery }}"
        </span>
        <span v-else> Today's Best Deals For You! </span>
      </h2>

      <!-- Show category selector only when not filtering from navbar -->
      <CategorySelector
        v-if="!isFiltering"
        :options="options"
        :selected-category="selectedCategory"
        @select-category="selectCategory"
      />

      <!-- Filter summary when filtering -->
      <div
        v-if="isFiltering"
        class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-blue-800">Active filters:</span>
          <span
            v-if="searchQuery"
            class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
          >
            Search: "{{ searchQuery }}"
          </span>
          <span
            v-if="categoryFilter"
            class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
          >
            Category: {{ categoryDisplayName }}
          </span>
        </div>
      </div>
      <!-- Loading State - Updated to use combinedLoading -->
      <div
        v-if="combinedLoading"
        class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        <div
          v-for="i in 8"
          :key="i"
          class="bg-gray-200 animate-pulse rounded-lg h-64"
        ></div>
      </div>

      <!-- Error State - Keep existing but use combinedLoading -->
      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-600 mb-4">{{ error.message }}</p>
        <button
          @click="loadProducts"
          class="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
        >
          Try Again
        </button>
      </div>

      <!-- Products Grid - Updated condition -->
      <ProductGrid
        v-if="!combinedLoading && !error"
        :products="displayedProducts"
        @product-click="viewProduct"
      />

      <!-- No Results Found Message -->
      <div
        v-if="displayedProducts.length === 0 && !combinedLoading && !error"
        class="text-center py-8"
      >
        <div class="max-w-md mx-auto">
          <svg
            class="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.266-5.412-3.154"
            />
          </svg>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">
            No Products Found
          </h3>
          <p class="text-gray-500">
            <span v-if="isFiltering && searchQuery && categoryFilter">
              No products found for "{{ searchQuery }}" in
              {{ categoryDisplayName }}
            </span>
            <span v-else-if="isFiltering && searchQuery">
              No products found for "{{ searchQuery }}"
            </span>
            <span v-else-if="isFiltering && categoryFilter">
              No products found in {{ categoryDisplayName }}
            </span>
            <span v-else> No products available at the moment </span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

// Replace the script section in TodaysBestDeals.vue

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  useProductsApi,
  useProductsQuery,
} from "@/composables/useProduct.js";
import ProductGrid from "@/components/Product/ProductGrid.vue";
import CategorySelector from "@/components/Category/CategorySelector.vue";

// Props from Home.vue - keep existing props
const props = defineProps({
  searchQuery: {
    type: String,
    default: "",
  },
  categoryFilter: {
    type: String,
    default: "",
  },
  productsData: {
    type: Array,
    default: () => [],
  },
  isFiltering: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();

// Main products query (cached)
const productsApi = useProductsApi();
const { products: apiProducts, isLoading, error } = productsApi;

// Dynamic category query for filtering
const selectedCategory = ref("All");
const categoryQueryParams = computed(() => {
  if (selectedCategory.value === "All" || props.isFiltering) return null;
  return { category: selectedCategory.value.toLowerCase(), limit: 20 };
});

const {
  products: categoryProducts,
  isLoading: categoryLoading,
  refetch: refetchCategory,
} = useProductsQuery(categoryQueryParams);

const options = [
  "All",
  "gadgets",
  "fashion",
  "toys",
  "beauty",
  "furniture",
  "sneakers",
];

// Store products by category for easier management (when not filtering)
const categoryMap = ref({
  gadgets: [],
  fashion: [],
  toys: [],
  beauty: [],
  furniture: [],
  sneakers: [],
});

// Computed for category display name - keep existing logic
const categoryDisplayName = computed(() => {
  if (!props.categoryFilter) return "";

  const categoryNameMap = {
    gadgets: "Gadgets",
    fashion: "Fashion",
    toys: "Toys",
    beauty: "Beauty",
    furniture: "Furniture",
    sneakers: "Sneakers",
  };

  return (
    categoryNameMap[props.categoryFilter] ||
    props.categoryFilter.charAt(0).toUpperCase() + props.categoryFilter.slice(1)
  );
});

const categorize = (list) => {
  // Reset category map
  categoryMap.value = {
    gadgets: [],
    fashion: [],
    toys: [],
    beauty: [],
    furniture: [],
    sneakers: [],
  };

  list.forEach((product) => {
    const category = (product.category || "").toString().toLowerCase();

    if (category && categoryMap.value[category]) {
      categoryMap.value[category].push(product);
    } else {
      // Fallback categorization based on category name matching
      if (category.includes("gadget") || category.includes("electronic")) {
        categoryMap.value.gadgets.push(product);
      } else if (
        category.includes("fashion") ||
        category.includes("clothing")
      ) {
        categoryMap.value.fashion.push(product);
      } else if (category.includes("toy")) {
        categoryMap.value.toys.push(product);
      } else if (category.includes("beauty")) {
        categoryMap.value.beauty.push(product);
      } else if (category.includes("furniture")) {
        categoryMap.value.furniture.push(product);
      } else if (category.includes("sneaker") || category.includes("shoe")) {
        categoryMap.value.sneakers.push(product);
      } else {
        // Default to gadgets if category doesn't match
        categoryMap.value.gadgets.push(product);
      }
    }
  });
};

const displayedProducts = computed(() => {
  // Jika filtering dari navbar, gunakan passed products data
  if (props.isFiltering && props.productsData.length > 0) {
    return props.productsData;
  }

  if (props.isFiltering && props.productsData.length === 0) {
    return [];
  }

  // Gunakan category-specific products
  if (selectedCategory.value !== "All" && categoryProducts.value.length > 0) {
    return categoryProducts.value.slice(0, 20);  // ← UBAH dari 8 ke 20
  }

  // FIX: Tampilkan semua products langsung, bukan dipilah per kategori
  if (selectedCategory.value === "All") {
    return apiProducts.value.slice(0, 20);  // ← Langsung return dari apiProducts, top 20
  }

  return [];
});

// Combined loading state
const combinedLoading = computed(() => {
  if (selectedCategory.value !== "All" && !props.isFiltering) {
    return categoryLoading.value;
  }
  return isLoading.value;
});

// Replace function selectCategory yang ada dengan ini:

const selectCategory = async (option) => {
  // Only allow category selection when not filtering from navbar
  if (props.isFiltering) return;
  
  // Prevent same category re-selection
  if (selectedCategory.value === option) return;

  selectedCategory.value = option;
  
  // TanStack Query akan auto-fetch ketika categoryQueryParams berubah
  // Tidak perlu manual API calls atau refetch
};

const loadProducts = async () => {
  // TanStack Query handles this automatically, but keep for error retry
  if (apiProducts.value && apiProducts.value.length > 0) {
    categorize(apiProducts.value);
  }
};

const viewProduct = (productId) => {
  router.push(`/products/${productId}`);
};

// Watch for changes in filtering state - keep existing logic
watch(
  () => props.isFiltering,
  (newValue) => {
    if (!newValue) {
      selectedCategory.value = "All";
    }
  }
);

// Watch for products changes and categorize them
watch(
  apiProducts,
  (newProducts) => {
    if (newProducts && newProducts.length > 0 && !props.isFiltering) {
      categorize(newProducts);
    }
  },
  { immediate: true }
);

// No need for onMounted - TanStack Query handles initial fetch automatically
</script>

<style scoped>
.bg-dark-green {
  background-color: #1a3e3e;
}
</style>
