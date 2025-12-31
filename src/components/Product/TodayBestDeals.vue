<!-- todaybestdealsvue - FIXED: Removed @product-click -->
<template>
  <section id="deals" data-section="today-best-deals" class="py-12 px-4 sm:px-6 lg:px-8 bg-white">
    <div class="max-w-7xl mx-auto">
      <!-- Dynamic Title based on filtering state -->
      <h2 class="text-3xl font-bold text-gray-900 mb-4 sm:mb-8">
        <span v-if="isFiltering && categoryFilter && searchQuery">
          "{{ searchQuery }}" in {{ categoryDisplayName }}
        </span>
        <span v-else-if="isFiltering && categoryFilter"> {{ categoryDisplayName }} Products </span>
        <span v-else-if="isFiltering && searchQuery"> Search Results for "{{ searchQuery }}" </span>
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
      <div v-if="isFiltering" class="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-medium text-blue-800">Active filters:</span>
          <span v-if="searchQuery" class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            Search: "{{ searchQuery }}"
          </span>
          <span v-if="categoryFilter" class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
            Category: {{ categoryDisplayName }}
          </span>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="combinedLoading" class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <div v-for="i in 8" :key="i" class="bg-gray-200 animate-pulse rounded-lg h-64"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-600 mb-4">{{ error.message }}</p>
        <button @click="loadProducts" class="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">
          Try Again
        </button>
      </div>

      <!-- ✅ FIX: Remove @product-click listener -->
      <ProductGrid 
        v-if="!combinedLoading && !error" 
        :products="displayedProducts" 
      />

      <!-- No Results Found Message -->
      <div v-if="displayedProducts.length === 0 && !combinedLoading && !error" class="text-center py-8">
        <div class="max-w-md mx-auto">
          <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.266-5.412-3.154"
            />
          </svg>
          <h3 class="text-lg font-semibold text-gray-800 mb-2">No Products Found</h3>
          <p class="text-gray-500">
            <span v-if="isFiltering && searchQuery && categoryFilter">
              No products found for "{{ searchQuery }}" in {{ categoryDisplayName }}
            </span>
            <span v-else-if="isFiltering && searchQuery"> No products found for "{{ searchQuery }}" </span>
            <span v-else-if="isFiltering && categoryFilter"> No products found in {{ categoryDisplayName }} </span>
            <span v-else> No products available at the moment </span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useProductsStore } from "@/stores/productsStore";
import { storeToRefs } from "pinia";
import ProductGrid from "@/components/Product/ProductGrid.vue";
import CategorySelector from "@/components/Category/CategorySelector.vue";

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

// Initialize products store
const productsStore = useProductsStore();
const { products: apiProducts, loading: isLoading, error } = storeToRefs(productsStore);

// Local state
const selectedCategory = ref("All");
const categoryProducts = ref([]);
const categoryLoading = ref(false);

const options = ["All", "gadgets", "fashion", "toys", "beauty", "furniture", "sneakers"];

const categoryMap = ref({
  gadgets: [],
  fashion: [],
  toys: [],
  beauty: [],
  furniture: [],
  sneakers: [],
});

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

const categorize = list => {
  categoryMap.value = {
    gadgets: [],
    fashion: [],
    toys: [],
    beauty: [],
    furniture: [],
    sneakers: [],
  };

  list.forEach(product => {
    const category = (product.category || "").toString().toLowerCase();

    if (category && categoryMap.value[category]) {
      categoryMap.value[category].push(product);
    } else {
      if (category.includes("gadget") || category.includes("electronic")) {
        categoryMap.value.gadgets.push(product);
      } else if (category.includes("fashion") || category.includes("clothing")) {
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
        categoryMap.value.gadgets.push(product);
      }
    }
  });
};

const fetchCategoryProducts = async category => {
  if (category === "All" || props.isFiltering) {
    categoryProducts.value = [];
    return;
  }

  try {
    categoryLoading.value = true;
    await productsStore.fetchProducts({
      category: category.toLowerCase(),
      limit: 20,
    });
    categoryProducts.value = productsStore.products;
  } catch (err) {
    console.error("Failed to fetch category products:", err);
    categoryProducts.value = [];
  } finally {
    categoryLoading.value = false;
  }
};

const displayedProducts = computed(() => {
  if (props.isFiltering && props.productsData.length > 0) {
    return props.productsData;
  }

  if (props.isFiltering && props.productsData.length === 0) {
    return [];
  }

  if (selectedCategory.value !== "All" && categoryProducts.value.length > 0) {
    return categoryProducts.value.slice(0, 20);
  }

  if (selectedCategory.value === "All") {
    return apiProducts.value.slice(0, 20);
  }

  return [];
});

const combinedLoading = computed(() => {
  if (selectedCategory.value !== "All" && !props.isFiltering) {
    return categoryLoading.value;
  }
  return isLoading.value;
});

const selectCategory = async option => {
  if (props.isFiltering) return;
  if (selectedCategory.value === option) return;

  selectedCategory.value = option;

  if (option !== "All") {
    await fetchCategoryProducts(option);
  }
};

const loadProducts = async () => {
  try {
    await productsStore.fetchProducts({ limit: 20 });
    if (apiProducts.value && apiProducts.value.length > 0) {
      categorize(apiProducts.value);
    }
  } catch (err) {
    console.error("Failed to load products:", err);
  }
};

// ✅ REMOVED: viewProduct function - no longer needed

watch(
  () => props.isFiltering,
  newValue => {
    if (!newValue) {
      selectedCategory.value = "All";
    }
  }
);

watch(
  apiProducts,
  newProducts => {
    if (newProducts && newProducts.length > 0 && !props.isFiltering) {
      categorize(newProducts);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (!props.isFiltering && apiProducts.value.length === 0) {
    await loadProducts();
  }
});
</script>

<style scoped>
.bg-dark-green {
  background-color: #1a3e3e;
}
</style>