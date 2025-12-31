<!-- src/components/CategorySelector.vue -->
<template>
  <div>
    <!-- Loading State -->
    <div v-if="loading" class="mb-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
      <p class="text-gray-600 text-sm text-center mt-2">Loading categories...</p>
    </div>

    <!-- Content when not loading -->
    <div v-else>
      <!-- Filter Header -->
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Filter by Categorys</h3>
        <p class="text-sm text-gray-600">Choose a category to filter products</p>
      </div>

      <!-- Mobile Dropdown for small screens -->
      <div class="block sm:hidden mb-4">
        <select
          v-model="selectedCategory"
          @change="handleCategorySelect"
          class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
        >
          <option
            v-for="option in categoryOptions"
            :key="option.value"
            :value="option.value"
            class="text-gray-700"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Desktop/Tablet Options with Pills -->
      <div class="hidden sm:block relative">
        <div class="flex items-center gap-2 mb-6 flex-wrap">
          <button
            v-for="option in categoryOptions"
            :key="option.value"
            @click="handleCategorySelect(option.value)"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 flex-shrink-0',
              selectedCategory === option.value
                ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 shadow-sm',
            ]"
          >
            {{ option.label }}
            <span v-if="option.count !== undefined" class="ml-2 text-xs opacity-75">
              ({{ option.count }})
            </span>
          </button>
        </div>
      </div>

      <!-- Error State (optional, minimal) -->
      <div v-if="errors.categories && categoryOptions.length === 0" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600 text-sm text-center mb-2">Failed to load categories</p>
        <button
          @click="retryLoadCategories"
          class="text-blue-500 text-sm underline block mx-auto hover:text-blue-700 transition-colors"
        >
          Retry Loading Categories
        </button>
      </div>

      <!-- Current Filter Display -->
      <div v-if="selectedCategory !== 'All'" class="mb-4 flex items-center gap-2">
        <span class="text-sm text-gray-600">Active filter:</span>
        <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {{ getCategoryLabel(selectedCategory) }}
        </span>
        <button
          @click="handleCategorySelect('All')"
          class="text-xs text-gray-500 hover:text-gray-700 underline ml-2"
        >
          Clear filter
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useToast } from '@/composables/useToast';

// Props
const props = defineProps({
  selectedCategory: {
    type: String,
    default: 'All'
  },
  showAll: {
    type: Boolean,
    default: true
  },
  maxCategories: {
    type: Number,
    default: null
  },
  showProductCount: {
    type: Boolean,
    default: false
  }
});

// Emits
const emit = defineEmits(['select-category', 'category-changed']);

// FIXED: Use categories composable with proper null checking
const categoriesComposable = useCategories();
const {
  categories,
  activeCategories,
  loadingStates,
  errors,
  getCategories,
  clearErrors,
  getCategoryFilterOptions,
  filterProductsByCategory
} = categoriesComposable || {};

// Use toast for notifications with null check
const toastComposable = useToast();
const { error: showError, success: showSuccess } = toastComposable || {};

// Local state
const selectedCategory = ref(props.selectedCategory);
const optionsContainer = ref(null);
const isLoading = ref(false);

// FIXED: Computed with proper null checking
const loading = computed(() => 
  isLoading.value || loadingStates?.value?.categories || loadingStates?.categories || false
);

const categoryOptions = computed(() => {
  const options = [];
  
  // Add "All" option if showAll is true
  if (props.showAll) {
    options.push({
      value: 'All',
      label: 'All Categories',
      slug: 'all',
      count: props.showProductCount ? getTotalProductCount() : undefined
    });
  }
  
  // FIXED: Add categories from API with proper null checking
  const categoriesData = activeCategories?.value || activeCategories || categories?.value || categories || [];
  const categoryOpts = (Array.isArray(categoriesData) ? categoriesData : []).map(category => ({
    value: category?.slug || category?.name || '',
    label: category?.name || '',
    slug: category?.slug || category?.name?.toLowerCase() || '',
    id: category?.id || category?._id,
    count: props.showProductCount ? (category?.productCount || 0) : undefined,
    ...category
  })).filter(cat => cat.value && cat.label); // Filter out invalid categories
  
  // Limit categories if maxCategories is specified
  const limitedCategories = props.maxCategories 
    ? categoryOpts.slice(0, props.maxCategories)
    : categoryOpts;
  
  options.push(...limitedCategories);
  
  return options;
});

// FIXED: Methods with proper error handling
const handleCategorySelect = async (categoryValue) => {
  if (typeof categoryValue === 'object' && categoryValue?.target) {
    // Handle select element change event
    categoryValue = categoryValue.target.value;
  }
  
  if (!categoryValue) {
    console.warn('No category value provided to handleCategorySelect');
    return;
  }
  
  const previousCategory = selectedCategory.value;
  selectedCategory.value = categoryValue;
  
  console.log('Category filter selected:', categoryValue);
  
  try {
    // Emit the selection immediately for UI feedback
    emit('select-category', categoryValue);
    
    // Show loading state if needed
    if (categoryValue !== 'All' && categoryValue !== previousCategory && showSuccess) {
      showSuccess(`Filtering products by ${getCategoryLabel(categoryValue)}...`);
    }
    
    // Emit category changed event with additional data
    emit('category-changed', {
      value: categoryValue,
      category: categoryOptions.value.find(opt => opt.value === categoryValue),
      previous: previousCategory
    });
    
  } catch (error) {
    console.error('Error handling category selection:', error);
    // Revert selection on error
    selectedCategory.value = previousCategory;
    if (showError) {
      showError('Failed to filter products by category');
    }
  }
};

const getCategoryLabel = (categoryValue) => {
  if (!categoryValue) return '';
  const option = categoryOptions.value.find(opt => opt.value === categoryValue);
  return option ? option.label : categoryValue;
};

const getTotalProductCount = () => {
  // FIXED: Proper null checking for product count
  const categoriesData = activeCategories?.value || activeCategories || [];
  if (!Array.isArray(categoriesData)) return 0;
  
  return categoriesData.reduce((total, category) => 
    total + (category?.productCount || 0), 0
  );
};

const loadCategories = async () => {
  try {
    isLoading.value = true;
    
    // Clear errors if function exists
    if (clearErrors) {
      clearErrors();
    }
    
    // Only call getCategories if it exists
    if (getCategories) {
      await getCategories({ 
        isActive: true,
        limit: props.maxCategories || 50,
        includeProductCount: props.showProductCount
      });
      
      const categoryCount = categories?.value?.length || activeCategories?.value?.length || 0;
      console.log(`✅ Loaded ${categoryCount} categories for filter selector`);
    } else {
      console.warn('getCategories function not available');
    }
    
  } catch (error) {
    console.error('Error loading categories for filter selector:', error);
    if (showError) {
      showError('Failed to load category filters');
    }
  } finally {
    isLoading.value = false;
  }
};

const retryLoadCategories = async () => {
  await loadCategories();
};

// FIXED: Watch for prop changes with null checks
watch(() => props.selectedCategory, (newValue) => {
  if (newValue && newValue !== selectedCategory.value) {
    selectedCategory.value = newValue;
  }
});

// FIXED: Watch for category selection changes to update parent
watch(selectedCategory, (newValue, oldValue) => {
  if (newValue !== oldValue && newValue !== props.selectedCategory) {
    emit('select-category', newValue);
  }
});

// FIXED: Initialize on mount with proper error handling
onMounted(async () => {
  try {
    await loadCategories();
  } catch (error) {
    console.error('Error initializing CategorySelector:', error);
    // Don't throw error, just log it
  }
});
</script>

<style scoped>
.bg-dark-green {
  background-color: #1a3e3e;
}
.border-dark-green {
  border-color: #1a3e3e;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 1em;
}

/* Enhanced button animations */
button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover {
  transform: translateY(-1px);
}

button:active {
  transform: translateY(0);
}

/* Loading animation */
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

/* Filter pills responsive design */
@media (max-width: 640px) {
  .flex-wrap > button {
    min-width: calc(50% - 0.25rem);
    justify-content: center;
  }
}
</style>