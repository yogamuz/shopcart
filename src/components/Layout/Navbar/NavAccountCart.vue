<!-- navaccountcart -->
<template>
  <div class="flex items-center space-x-4 sm:space-x-6">
    <!-- Account Button/Dropdown -->
    <div class="relative" ref="accountContainer">
      <!-- When Authenticated - Avatar + Username + Dropdown -->
      <button
        v-if="isAuthenticated"
        @click="toggleAccountMenu"
        class="hidden sm:flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors duration-200"
      >
        <!-- Avatar Circle - Prioritize avatarUrl from profile -->
        <div class="w-8 h-8 rounded-full flex items-center justify-center shadow-md overflow-hidden">
          <!-- Loading skeleton -->
          <div v-if="isLoadingAvatar" class="w-full h-full bg-gray-200 animate-pulse"></div>

          <!-- Avatar image -->
          <img
            v-else-if="profileAvatarUrl"
            :src="profileAvatarUrl"
            :alt="getUserDisplayName()"
            class="w-full h-full object-cover"
            @error="handleAvatarError"
          />

          <!-- Fallback initials -->
          <div
            v-else
            class="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm"
          >
            {{ getUserInitials() }}
          </div>
        </div>
        <span class="font-medium">
          {{ getUserDisplayName() }}
        </span>
        <svg
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-180': showAccountMenu }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- When Not Authenticated - Account Menu -->
      <button
        v-else
        @click="toggleAccountMenu"
        class="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span class="font-medium">Account</span>
        <svg
          class="w-4 h-4 transition-transform duration-200"
          :class="{ 'rotate-180': showAccountMenu }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Account Dropdown Menu -->
      <transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div
          v-if="showAccountMenu"
          ref="dropdownMenu"
          class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50"
          @click.stop
        >
          <!-- If not authenticated -->
          <div v-if="!isAuthenticated">
            <button
              @click="handleNavigation('/login')"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                <span>Sign In</span>
              </div>
            </button>
            <button
              @click="handleNavigation('/register')"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                  />
                </svg>
                <span>Register</span>
              </div>
            </button>
          </div>

          <!-- If authenticated -->
          <div v-else>
            <div class="px-4 py-2 text-sm text-gray-500 border-b border-gray-200">
              <div class="font-medium">{{ getUserDisplayName() }}</div>
              <div class="text-xs">{{ user?.email }}</div>
            </div>
            <button
              v-if="!isAdmin"
              @click="handleNavigation('/dashboard')"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>Dashboard</span>
              </div>
            </button>

            <!-- Role-based navigation -->
            <button
              v-if="isSeller"
              @click="handleNavigation('/seller/dashboard')"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h5"
                  />
                </svg>
                <span>Seller Dashboard</span>
              </div>
            </button>

            <button
              v-if="isAdmin"
              @click="handleNavigation('/admin/dashboard')"
              class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span>Admin Dashboard</span>
              </div>
            </button>

            <div class="border-t border-gray-200 my-1"></div>

            <button
              @click="handleLogout"
              :disabled="isLoading"
              class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
            >
              <div class="flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>{{ isLoading ? "Signing out..." : "Sign Out" }}</span>
              </div>
            </button>
          </div>
        </div>
      </transition>
    </div>
    <!-- Cart Link with Quantity Badge -->
    <div class="relative">
      <button
        @click="handleNavigation('/cart')"
        class="hidden sm:flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 relative"
      >
        <div class="relative">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v5a2 2 0 01-2 2H9a2 2 0 01-2-2v-5m6-5V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2"
            />
          </svg>

          <!-- Quantity Badge -->
          <div
            v-if="isUserAuthenticated() && cartCount > 0"
            class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm"
            :class="{ 'animate-pulse': cartCount > 99 }"
          >
            {{ cartCount > 99 ? "99+" : cartCount }}
          </div>
        </div>
        <span class="font-medium">Cart</span>
      </button>
    </div>
    <!-- Mobile Menu Button -->
    <button
      @click.stop="$emit('toggle-mobile-menu')"
      class="md:hidden flex items-center text-gray-700 hover:text-blue-600 ml-2"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>
</template>

// navAccountCart.vue - FIXED

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useCart } from "@/composables/useCart";
import { useUserProfile } from "@/composables/useUserProfile";

// Composables
const { cartCount, isUserAuthenticated } = useCart();
const {
  profileDisplayName,
  profileInitials,
  avatarUrl: profileAvatarUrl,
  // ❌ HAPUS: initialize - tidak perlu di navbar
} = useUserProfile();

const router = useRouter();
const { user, isAuthenticated, isSeller, isAdmin, logout, isLoading } = useAuth();

// Local state
const showAccountMenu = ref(false);
const accountContainer = ref(null);

// Computed properties - sama seperti sebelumnya
const userDisplayName = computed(() => {
  if (profileDisplayName.value && profileDisplayName.value !== "User") {
    return profileDisplayName.value;
  }
  if (!user.value) return "User";
  if (user.value.name && user.value.name !== "User") {
    return user.value.name;
  }
  if (user.value.username && user.value.username !== "User") {
    return user.value.username;
  }
  if (user.value.email) {
    return user.value.email.split("@")[0];
  }
  return "User";
});

const userInitials = computed(() => {
  if (profileInitials.value && profileInitials.value !== "U") {
    return profileInitials.value;
  }
  if (!user.value) return "U";
  const displayName = userDisplayName.value;
  if (displayName === "User") {
    if (user.value.email) {
      const emailName = user.value.email.split("@")[0];
      return emailName.slice(0, 2).toUpperCase();
    }
    return "U";
  }
  const words = displayName.split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return displayName.slice(0, 2).toUpperCase();
});

const isLoadingAvatar = computed(() => {
  return isAuthenticated.value && !profileDisplayName.value;
});

// Watch avatar URL changes and preload - KEEP THIS
watch(profileAvatarUrl, newUrl => {
  if (newUrl) {
    const img = new Image();
    img.src = newUrl;
  }
});

// ❌ HAPUS KEDUA WATCH INI - Redundant!
// watch(isAuthenticated, ...) 
// watch(() => user.value?.accessToken, ...)
// Profile initialize sudah di-handle di composable useUserProfile

// Methods - sama seperti sebelumnya
const getUserDisplayName = () => userDisplayName.value;
const getUserInitials = () => userInitials.value;

const toggleAccountMenu = event => {
  event.preventDefault();
  event.stopPropagation();
  showAccountMenu.value = !showAccountMenu.value;
};

const closeAccountMenu = () => {
  showAccountMenu.value = false;
};

const handleNavigation = async path => {
  try {
    closeAccountMenu();
    if (router.currentRoute.value.path === path) return;
    await router.push(path);
  } catch (err) {
    console.error("Navigation error:", err);
    window.location.href = path;
  }
};

const handleLogout = async () => {
  try {
    closeAccountMenu();
    await logout();
    if (router.currentRoute.value.path !== "/") {
      await router.push("/");
    }
  } catch (err) {
    console.error("Logout error:", err);
  }
};

const handleAvatarError = event => {
  event.target.style.display = "none";
};

const handleClickOutside = event => {
  if (accountContainer.value && !accountContainer.value.contains(event.target)) {
    closeAccountMenu();
  }
};

// ❌ HAPUS onMounted yang initialize profile
// onMounted sudah di-handle di useUserProfile composable

onUnmounted(() => {
  closeAccountMenu();
  document.removeEventListener("click", handleClickOutside);
});

onMounted(() => {
  document.addEventListener("click", handleClickOutside, { passive: true });
  // ✅ Hanya setup event listener, jangan initialize profile
});
</script>