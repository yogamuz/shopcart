<!-- NavMobileMenu.vue - FIXED VERSION -->
<template>
  <div v-if="isOpen" class="md:hidden bg-white border-t border-gray-200">
    <div class="px-4 py-2 space-y-2">
      <!-- Category Dropdown Button -->
      <button
        @click.stop="$emit('toggle-dropdown')"
        class="flex items-center justify-between w-full text-left text-gray-700 hover:text-blue-600 font-medium py-2"
      >
        <span>Category</span>
        <svg
          class="w-4 h-4 transform transition-transform duration-200"
          :class="{ 'rotate-180': isDropdownOpen }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Category Grid -->
      <div v-if="isDropdownOpen" class="grid grid-cols-2 gap-x-4 gap-y-3">
        <!-- Popular Categories Header -->
        <div class="col-span-2 mb-2">
          <h3 class="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">Popular Categories</h3>
        </div>

        <!-- Left Column -->
        <div class="grid gap-2">
          <div
            v-for="category in categories.slice(0, 3)"
            :key="category.id || category._id"
            class="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 border border-gray-100 hover:border-blue-200 h-full group"
            @click.stop="handleCategorySelect(category)"
          >
            <div
              class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 mt-0.5 flex items-center justify-center"
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
              <h4
                class="font-medium text-gray-800 text-xs leading-tight mb-1 truncate group-hover:text-blue-600 transition-colors"
              >
                {{ category.name || category.names }}
              </h4>
              <p class="text-[11px] text-gray-500 line-clamp-2 leading-tight">
                {{ category.description || `${category.stock || 0} items` }}
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column -->
        <div class="grid gap-2">
          <div
            v-for="category in categories.slice(3, 6)"
            :key="category.id || category._id"
            class="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 border border-gray-100 hover:border-blue-200 h-full group"
            @click.stop="handleCategorySelect(category)"
          >
            <div
              class="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 mt-0.5 flex items-center justify-center"
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
              <h4
                class="font-medium text-gray-800 text-xs leading-tight mb-1 truncate group-hover:text-blue-600 transition-colors"
              >
                {{ category.name || category.names }}
              </h4>
              <p class="text-[11px] text-gray-500 line-clamp-2 leading-tight">
                {{ category.description || `${category.stock || 0} items` }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation Links -->
      <a
        href="#deals"
        @click.prevent="scrollToDeals"
        class="block text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors duration-200 cursor-pointer"
      >
        Deals
      </a>
      <router-link to="#" class="block text-gray-700 hover:text-blue-600 font-medium py-2">What's New</router-link>
      <router-link to="#" class="block text-gray-700 hover:text-blue-600 font-medium py-2">Delivery</router-link>

      <!-- ✅ MOBILE ACCOUNT MENU COMPONENT - Handles login/cart -->
      <MobileAccountMenu />
    </div>
  </div>
</template>

<script setup>
import MobileAccountMenu from "@/components/Layout/Navbar/MobileAccountMenu.vue";

// ============================================================================
// PROPS
// ============================================================================

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  isDropdownOpen: {
    type: Boolean,
    required: true,
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

// ============================================================================
// EMITS
// ============================================================================

const emit = defineEmits(["toggle-dropdown", "select-category"]);

// ============================================================================
// METHODS
// ============================================================================

/**
 * Handle category selection
 */
const handleCategorySelect = (category) => {
  emit("select-category", category);
};

/**
 * Scroll to deals section
 */
const scrollToDeals = () => {
  const dealsSection = document.getElementById("deals");
  if (dealsSection) {
    dealsSection.scrollIntoView({ behavior: "smooth" });
  }
};

/**
 * Get category image with fallback
 */
const getCategoryImage = (category) => {
  if (category?.image?.url) return category.image.url;
  if (typeof category?.image === "string") return category.image;
  return "/placeholder-category.png";
};

/**
 * Get category color class
 */
const getCategoryColor = (category) => {
  const colors = [
    "bg-blue-50",
    "bg-green-50",
    "bg-purple-50",
    "bg-yellow-50",
    "bg-pink-50",
    "bg-indigo-50",
  ];
  const index = (category?.id || 0) % colors.length;
  return colors[index];
};

/**
 * Handle image load error
 */
const handleImageError = (event) => {
  event.target.src = "/placeholder-category.png";
};
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