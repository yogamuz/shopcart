<!-- NavDropdown.vue - Updated for Products API -->
<template>
  <div class="relative">
    <button
      @click.stop="toggleDropdown"
      data-dropdown-trigger
      class="flex items-center space-x-1 text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
    >
      <span>Category</span>
      <svg
        class="w-4 h-4 transform transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <div
      v-if="isOpen"
      data-dropdown-menu
      class="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-50"
    >
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">
          Popular Categories
        </h3>
      </div>
      
      <!-- Loading state -->
      <div v-if="loading" class="grid grid-cols-2 gap-3">
        <div 
          v-for="i in 6" 
          :key="i"
          class="flex items-start space-x-3 p-3 rounded-lg border border-gray-100 animate-pulse"
        >
          <div class="w-10 h-10 bg-gray-200 rounded-lg flex-shrink-0"></div>
          <div class="flex-1 min-w-0">
            <div class="h-4 bg-gray-200 rounded mb-2"></div>
            <div class="h-3 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>

      <!-- Categories grid -->
      <div v-else-if="displayCategories.length > 0" class="grid grid-cols-2 gap-3">
        <div
          v-for="category in displayCategories"
          :key="category.id || category._id"
          :data-category="category.name"
          class="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 border border-gray-100 hover:border-blue-200 group"
          @click.stop="handleCategorySelect(category)"
        >
          <!-- Category image -->
          <div 
            class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 mt-1 flex items-center justify-center"
            :class="getCategoryColor(category)"
          >
            <img 
              :src="getCategoryImage(category)" 
              :alt="category.name || category.names"
              class="w-6 h-6 object-contain"
              @error="handleImageError"
            />
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-medium text-gray-800 text-sm leading-tight mb-1 truncate group-hover:text-blue-600 transition-colors">
              {{ category.name || category.names }}
            </h4>
            <p class="text-xs text-gray-500 line-clamp-2 leading-tight">
              {{ category.description || `Browse ${category.name} products` }}
            </p>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-8 text-gray-500">
        <p>No categories available</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useCategories } from "@/composables/useCategory";

const emit = defineEmits(["select-category"]);
const router = useRouter();

// Composable
const { 
  categories, 
  activeCategories, 
  loading, 
  error,
} = useCategories();

const isOpen = ref(false);

// Use active categories if available, otherwise all categories
const displayCategories = computed(() => {
  return activeCategories.value?.length > 0 ? activeCategories.value : categories.value;
});

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};
// Fixed NavDropdown handleCategorySelect method
const handleCategorySelect = async (category) => {
  try {
    isOpen.value = false;
    emit('select-category', category);
    
    
    const categoryName = category.name?.toLowerCase() || category.names?.toLowerCase() || '';
    
    // FIXED: Navigate directly to category page
    await router.push({
      path: `/category/${categoryName}`
    });
    
  } catch (error) {
    console.error('Navigation error:', error);
  }
};
// Get category image with local path (keep existing logic)
const getCategoryImage = (category) => {
  const categoryName = (category?.name || category?.names || '').toLowerCase();
  
  // Map of available categories to their image paths
  const categoryImages = {
    'toys': '/public/categories/toys.png',
    'beauty': '/public/categories/beauty.png',
    'gadgets': '/public/categories/gadgets.png',
    'sneakers': '/public/categories/sneakers.png',
    'fashion': '/public/categories/fashion.png',
    'furniture': '/public/categories/furniture.png'
  };
  
  // Return the local image path if category exists, otherwise use placeholder
  return categoryImages[categoryName] || `https://via.placeholder.com/40x40/f3f4f6/9ca3af?text=${encodeURIComponent(categoryName.charAt(0))}`;
};

// Get category color based on name (keep existing logic)
const getCategoryColor = (category) => {
  const categoryName = (category.name || category.names || '').toLowerCase();
  
  const colorMap = {
    'toys': 'bg-gradient-to-br from-pink-400 to-rose-400',
    'furniture': 'bg-gradient-to-br from-purple-400 to-indigo-400', 
    'sneakers': 'bg-gradient-to-br from-blue-400 to-cyan-400',
    'fashion': 'bg-gradient-to-br from-emerald-400 to-teal-400',
    'beauty': 'bg-gradient-to-br from-yellow-400 to-orange-400',
    'gadgets': 'bg-gradient-to-br from-red-400 to-pink-400'
  };
  
  return colorMap[categoryName] || 'bg-gradient-to-br from-gray-400 to-gray-500';
};

// Handle image load errors - fallback to placeholder
const handleImageError = (event) => {
  const img = event.target;
  const categoryName = img.closest('[data-category]')?.dataset.category || 'Category';
  img.src = `https://via.placeholder.com/40x40/f3f4f6/9ca3af?text=${encodeURIComponent(categoryName.charAt(0))}`;
};

onMounted(() => {
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>