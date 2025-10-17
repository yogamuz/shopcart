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
        <!-- Mobile Account Section with Profile -->
        <div class="relative flex-1">
          <button
            @click="toggleMobileAccountMenu"
            class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
          >
            <!-- User Avatar/Initial -->
            <div v-if="isAuthenticated" class="relative">
              <!-- Loading skeleton -->
              <div v-if="isLoadingAvatar" class="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
              
              <!-- Avatar image -->
              <div
                v-else-if="profileAvatarUrl"
                class="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200"
              >
                <img
                  :src="profileAvatarUrl"
                  :alt="displayName"
                  class="w-full h-full object-cover"
                  @error="handleAvatarError"
                />
              </div>
              
              <!-- Fallback initials -->
              <div
                v-else
                class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-200"
              >
                {{ userInitial }}
              </div>
            </div>
            
            <!-- Guest Icon -->
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            
            <div class="flex flex-col items-start">
              <span class="font-medium text-sm leading-tight">{{ displayName }}</span>
              <span v-if="isAuthenticated" class="text-xs text-gray-500">View Profile</span>
              <span v-else class="text-xs text-gray-500">Sign In</span>
            </div>
          </button>

          <!-- Mobile Account Dropdown -->
          <div
            v-if="showMobileAccountMenu"
            class="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50"
          >
            <div v-if="!isAuthenticated">
              <button
                @click="handleMobileNavigation('/login')"
                class="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Sign In
              </button>
              <button
                @click="handleMobileNavigation('/register')"
                class="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Register
              </button>
            </div>
            <div v-else>
              <div class="px-4 py-3 border-b border-gray-100">
                <p class="text-sm font-medium text-gray-900">{{ displayName }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ currentUser?.email || 'User Account' }}</p>
              </div>
              <button
                v-if="!isAdmin"
                @click="handleMobileNavigation('/dashboard')"
                class="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Dashboard
              </button>
              
              <!-- Seller Dashboard - Only show for sellers -->
              <button
                v-if="isSeller"
                @click="handleMobileNavigation('/seller/dashboard')"
                class="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h5" />
                </svg>
                Seller Dashboard
              </button>
              
              <!-- Admin Dashboard - Only show for admins -->
              <button
                v-if="isAdmin"
                @click="handleMobileNavigation('/admin/dashboard')"
                class="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Admin Dashboard
              </button>
              
              <div class="border-t border-gray-100 my-1"></div>
              
              <button
                @click="handleMobileLogout"
                class="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
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
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useToast } from "@/composables/useToast";
import { useUserProfile } from "@/composables/useUserProfile";

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
const emit = defineEmits(["toggle-dropdown", "select-category"]);

// Composables
const router = useRouter();
const { isAuthenticated, logout, isLoading, isSeller, isAdmin } = useAuth();
const { success, error } = useToast();

// User Profile Composable
const {
  profileDisplayName,
  profileInitials,
  avatarUrl: profileAvatarUrl,
  initialize: initializeProfile,
} = useUserProfile();

// Mobile account menu state
const showMobileAccountMenu = ref(false);

// Computed untuk avatar loading state
const isLoadingAvatar = computed(() => {
  return isAuthenticated.value && !profileDisplayName.value;
});

// Display name dengan fallback
const displayName = computed(() => {
  if (profileDisplayName.value && profileDisplayName.value !== "User") {
    return profileDisplayName.value;
  }
  return "Guest";
});

// User initials dengan fallback
const userInitial = computed(() => {
  if (profileInitials.value && profileInitials.value !== "U") {
    return profileInitials.value;
  }
  return "U";
});

// Current user untuk email display
const currentUser = computed(() => {
  if (!isAuthenticated.value) return null;
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch (e) {
      return null;
    }
  }
  return null;
});

// Watch avatar URL changes
watch(profileAvatarUrl, newUrl => {
  if (newUrl) {
    const img = new Image();
    img.src = newUrl;
  }
});

// Watch for authentication changes
watch(
  isAuthenticated,
  async (newValue, oldValue) => {
    if (newValue && oldValue !== undefined) {
      await initializeProfile(true);
    }
  },
  { flush: "post" }
);

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
    toys: "/categories/toys.png",
    beauty: "/categories/beauty.png",
    gadgets: "/categories/gadgets.png",
    sneakers: "/categories/sneakers.png",
    fashion: "/categories/fashion.png",
    furniture: "/categories/furniture.png",
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

// Handle avatar error
const handleAvatarError = (event) => {
  event.target.style.display = 'none';
};

// Initialize profile on mount
onMounted(async () => {
  if (isAuthenticated.value) {
    await new Promise(resolve => setTimeout(resolve, 150));
    await initializeProfile(true);
  }
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