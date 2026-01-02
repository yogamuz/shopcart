<!-- navsearch -->
<template>
  <div class="flex-1 min-w-0 mx-2 sm:mx-4 relative">
    <form @submit.prevent="handleSearch" class="relative">
      <div class="relative">
        <svg
          class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search Product"
          class="w-full pl-4 pr-10 py-2 bg-white/90 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm text-gray-700 placeholder:text-gray-400"
          @input="handleInput"
          @keydown="handleKeyDown"
          @focus="showSuggestions = true"
          @blur="handleBlur"
        />
      </div>

      <!-- Suggestions Dropdown -->
      <div
        v-if="showSuggestions && searchQuery.length >= 2"
        class="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50"
      >
        <!-- Loading State -->
        <div v-if="isFetchingSuggestions" class="p-4 text-center text-gray-500">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-sm mt-2">Searching...</p>
        </div>

        <!-- Suggestions Content -->
        <div v-else>
          <!-- Has Suggestions -->
          <div v-if="hasSuggestions">
            <!-- Product Suggestions -->
            <div v-if="suggestions.products.length > 0" class="border-b border-gray-100">
              <div class="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">Products</div>
              <button
                v-for="product in suggestions.products"
                :key="product.slug"
                @mousedown.prevent="selectProduct(product)"
                class="w-full px-4 py-3 hover:bg-blue-50 text-left transition-colors"
              >
                <span class="text-sm text-gray-700">{{ product.title }}</span>
              </button>
            </div>

            <!-- Category Suggestions -->
            <div v-if="suggestions.categories.length > 0" class="border-b border-gray-100">
              <div class="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">Categories</div>
              <button
                v-for="category in suggestions.categories"
                :key="category.name"
                @mousedown.prevent="selectCategory(category)"
                class="w-full px-4 py-3 hover:bg-blue-50 text-left flex items-center gap-3 transition-colors"
              >
                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span class="text-sm text-gray-700 capitalize">{{ category.name }}</span>
              </button>
            </div>

            <!-- Seller Suggestions -->
            <div v-if="suggestions.sellers.length > 0">
              <div class="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">Stores</div>
              <button
                v-for="seller in suggestions.sellers"
                :key="seller.storeSlug"
                @mousedown.prevent="selectSeller(seller)"
                class="w-full px-4 py-3 hover:bg-blue-50 text-left flex items-center gap-3 transition-colors"
              >
                <img
                  v-if="seller.logo?.url || seller.logo"
                  :src="seller.logo?.url || seller.logo"
                  :alt="seller.storeName"
                  class="w-6 h-6 rounded-full object-cover"
                  @error="$event.target.style.display = 'none'"
                />
                <svg v-else class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                <span class="text-sm text-gray-700">{{ seller.storeName }}</span>
              </button>
            </div>
          </div>
          <!-- No Results Found -->
          <div v-else class="px-4 py-3">
            <div class="flex items-center gap-3 mb-1">
              <SearchX class="w-5 h-5 text-gray-400 stroke-[1.5] flex-shrink-0" />
              <p class="text-sm font-medium text-gray-600">Result not found</p>
              <p class="text-xs text-gray-400 ml-8">Try different keywords</p>
            </div>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { useSearch } from "@/composables/useSearch";
import { debounce } from "lodash";
import { useToast } from "@/composables/useToast";
import { SearchX } from "lucide-vue-next";

const { info: showToastInfo } = useToast();
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "search"]);
const router = useRouter();

// Use search composable
const { fetchSuggestions, suggestions, isFetchingSuggestions, hasSuggestions, clearSuggestions } = useSearch();

// Local state
const searchQuery = ref(props.modelValue);
const showSuggestions = ref(false);
const selectedSuggestionIndex = ref(-1);
const totalSuggestions = computed(() => {
  return suggestions.value.products.length + suggestions.value.categories.length + suggestions.value.sellers.length;
});

// Watch untuk sinkronisasi dengan parent component
watch(
  () => props.modelValue,
  newValue => {
    searchQuery.value = newValue;
  }
);

// Debounced fetch suggestions
const debouncedFetchSuggestions = debounce(async query => {
  if (query.trim().length >= 2) {
    await fetchSuggestions(query.trim());
  } else {
    clearSuggestions();
  }
}, 500);
// Watch suggestions untuk debug
watch(
  suggestions,
  newSuggestions => {
    if (newSuggestions.sellers && newSuggestions.sellers.length > 0) {
      newSuggestions.sellers.forEach((seller, index) => {
        console.log(`Seller ${index}:`, {
          name: seller.storeName,
          slug: seller.storeSlug,
          logo: seller.logo,
          logoUrl: seller.logo?.url,
        });
      });
    }
  },
  { deep: true }
);

const handleInput = () => {
  emit("update:modelValue", searchQuery.value);
  selectedSuggestionIndex.value = -1; // Reset selection on input

  // Fetch suggestions
  if (searchQuery.value.trim().length >= 2) {
    showSuggestions.value = true;
    debouncedFetchSuggestions(searchQuery.value);
  } else {
    showSuggestions.value = false;
    clearSuggestions();
  }
};

// Handle blur event
const handleBlur = () => {
  // Delay hiding to allow click on suggestions
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

const handleSearch = async () => {
  showSuggestions.value = false;

  if (searchQuery.value.trim().length >= 2) {
    // If there are suggestions and user pressed Enter, go to first product
    if (suggestions.value.products.length > 0) {
      const firstProduct = suggestions.value.products[0];
      router.push(`/products/${firstProduct.slug}`);
      searchQuery.value = "";
      emit("update:modelValue", "");
      return;
    }

    // Otherwise, perform normal search
    emit("search", searchQuery.value);
  }
};

// Handle keyboard navigation
const handleKeyDown = event => {
  if (!showSuggestions.value || totalSuggestions.value === 0) return;

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      selectedSuggestionIndex.value = Math.min(selectedSuggestionIndex.value + 1, totalSuggestions.value - 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      selectedSuggestionIndex.value = Math.max(selectedSuggestionIndex.value - 1, -1);
      break;
    case "Escape":
      showSuggestions.value = false;
      selectedSuggestionIndex.value = -1;
      break;
  }
};

// Select product from suggestions
const selectProduct = product => {
  showSuggestions.value = false;
  router.push(`/products/${product.slug}`);
  searchQuery.value = "";
  emit("update:modelValue", "");
};

// Select category from suggestions
const selectCategory = category => {
  showSuggestions.value = false;
  searchQuery.value = "";
  emit("update:modelValue", "");

  // Navigate with category filter
  router.push({
    path: "/",
    query: { category: category.name.toLowerCase() },
  });
};

// Select seller from suggestions
const selectSeller = seller => {
  showSuggestions.value = false;
  router.push(`/stores/${seller.storeSlug}`);
  searchQuery.value = "";
  emit("update:modelValue", "");
};
</script>
