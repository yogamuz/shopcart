<!-- navbarmobilemmenu -->
<template>
  <div v-if="isOpen" class="md:hidden bg-white border-t border-gray-200">
    <div class="px-4 py-2 space-y-2">
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

      <div v-if="isDropdownOpen" class="grid grid-cols-2 gap-x-4 gap-y-3">
        <!-- Popular Categories Header -->
        <div class="col-span-2 mb-2">
          <h3 class="text-sm font-semibold text-gray-800 border-b border-gray-200 pb-1">Popular Categories</h3>
        </div>

        <div class="grid gap-2">
          <div
            v-for="category in categories.slice(0, 3)"
            :key="category.id || category._id"
            class="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 border border-gray-100 hover:border-blue-200 h-full group"
            @click.stop="handleCategorySelect(category)"
          >
            <!-- Category image -->
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

        <div class="grid gap-2">
          <div
            v-for="category in categories.slice(3, 6)"
            :key="category.id || category._id"
            class="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200 border border-gray-100 hover:border-blue-200 h-full group"
            @click.stop="handleCategorySelect(category)"
          >
            <!-- Category image -->
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

      <a
        href="#deals"
        @click.prevent="scrollToDeals"
        class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 cursor-pointer"
      >
        Deals
      </a>
      <router-link to="#" class="block text-gray-700 hover:text-blue-600 font-medium py-2">What's New</router-link>
      <router-link to="#" class="block text-gray-700 hover:text-blue-600 font-medium py-2">Delivery</router-link>

      <div class="flex space-x-4 pt-2 border-t border-gray-100">
        <!-- Mobile Account Section -->
        <div class="relative flex-1">
          <button
            @click="toggleMobileAccountMenu"
            class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span class="font-medium">Account</span>
          </button>

          <!-- Mobile Account Dropdown -->
          <div
            v-if="showMobileAccountMenu"
            class="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50"
          >
            <div v-if="!isAuthenticated">
              <button
                @click="handleMobileNavigation('/login')"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Sign In
              </button>
              <button
                @click="handleMobileNavigation('/register')"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                Register
              </button>
            </div>
            <div v-else>
              <button
                @click="handleMobileNavigation('/profile')"
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
              >
                My Profile
              </button>
              <button
                @click="handleMobileLogout"
                class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <!-- Mobile Cart -->
        <button
          @click="handleMobileNavigation('/cart')"
          class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 relative"
        >
          <div class="relative">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m6-5V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2"
              />
            </svg>
            <span
              v-if="cartCount > 0"
              class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
              {{ cartCount }}
            </span>
          </div>
          <span class="font-medium">Cart</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useToast } from "@/composables/useToast";

// Props
defineProps({
  isOpen: Boolean,
  isDropdownOpen: Boolean,
  categories: {
    type: Array,
    required: true,
  },
  cartCount: {
    type: Number,
    default: 0,
  },
});

// Emits
defineEmits(["toggle-dropdown", "select-category"]);

// Composables
const router = useRouter();
const { isAuthenticated, logout, isLoading } = useAuth();
const { success, error } = useToast();

// Mobile account menu state
const showMobileAccountMenu = ref(false);

// Methods
const toggleMobileAccountMenu = () => {
  showMobileAccountMenu.value = !showMobileAccountMenu.value;
};

// Fixed handleCategorySelect method for NavMobileMenu
const handleCategorySelect = async category => {
  try {
    const categoryName = category.name?.toLowerCase() || category.names?.toLowerCase() || "";

    // FIXED: Navigate directly to category page instead of home
    await router.push({
      path: `/category/${categoryName}`,
    });

    // Emit after navigation
    emit("select-category", category);
  } catch (error) {
    console.error("Navigation error:", error);
    // Fallback to home with category query
    router.push({
      path: "/",
      query: { category: categoryName },
    });
  }
};

const handleMobileNavigation = async path => {
  try {
    showMobileAccountMenu.value = false;

    if (router.currentRoute.value.path === path) {
      return;
    }

    router.push(path).catch(err => {
      if (err.name !== "NavigationDuplicated") {
        window.location.href = path;
      }
    });
  } catch (err) {
    console.error("Mobile navigation error:", err);
    window.location.href = path;
  }
};

const handleMobileLogout = async () => {
  try {
    showMobileAccountMenu.value = false;
    await logout();
    success("Successfully signed out");

    if (router.currentRoute.value.path !== "/") {
      router.push("/").catch(() => {
        window.location.href = "/";
      });
    }
  } catch (err) {
    error("Failed to sign out");
    console.error("Mobile logout error:", err);
  }
};

// Get category image with fallback
const getCategoryImage = category => {
  const categoryName = (category?.name || category?.names || "").toLowerCase();

  // Map of available categories to their image paths
  const categoryImages = {
    toys: "/public/categories/toys.png",
    beauty: "/public/categories/beauty.png",
    gadgets: "/public/categories/gadgets.png",
    sneakers: "/public/categories/sneakers.png",
    fashion: "/public/categories/fashion.png",
    furniture: "/public/categories/furniture.png",
  };

  return (
    categoryImages[categoryName] ||
    `https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=${encodeURIComponent(categoryName)}`
  );
};

// Handle image load errors
const handleImageError = event => {
  const img = event.target;
  const category = img.alt || "default";
  img.src = `https://via.placeholder.com/300x300/f3f4f6/9ca3af?text=${encodeURIComponent(category)}`;
};

// Get category color based on name
const getCategoryColor = category => {
  const categoryName = (category.name || category.names || "").toLowerCase();

  switch (categoryName) {
    case "toys":
      return "bg-gradient-to-br from-pink-400 to-rose-400";
    case "furniture":
      return "bg-gradient-to-br from-purple-400 to-indigo-400";
    case "sneakers":
      return "bg-gradient-to-br from-blue-400 to-cyan-400";
    case "fashion":
      return "bg-gradient-to-br from-emerald-400 to-teal-400";
    case "beauty":
      return "bg-gradient-to-br from-yellow-400 to-orange-400";
    case "gadgets":
      return "bg-gradient-to-br from-red-400 to-pink-400";
    default:
      return "bg-gradient-to-br from-gray-400 to-gray-500";
  }
};
const scrollToDeals = () => {
  const dealsSection = document.getElementById('deals');
  if (dealsSection) {
    dealsSection.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'start' 
    });
  }
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
