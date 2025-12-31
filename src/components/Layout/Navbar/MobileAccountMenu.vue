<!-- components/Layout/Navbar/MobileAccountMenu.vue -->
<template>
  <div class="flex space-x-4 pt-2 border-t border-gray-100">
    <!-- Mobile Account Section - Reuse NavAccountCart logic -->
    <div class="relative flex-1">
      <!-- Trigger Button - Mobile Style -->
      <button
        @click="toggleAccountMenu"
        class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 w-full"
      >
        <!-- Avatar/Icon -->
        <div v-if="isAuthenticated" class="relative">
          <div v-if="isLoadingAvatar" class="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>

          <div
            v-else-if="profileAvatarUrl"
            class="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200"
          >
            <img
              :src="profileAvatarUrl"
              :alt="getUserDisplayName()"
              class="w-full h-full object-cover"
              @error="handleAvatarError"
            />
          </div>

          <div
            v-else
            class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-gray-200"
          >
            {{ getUserInitials() }}
          </div>
        </div>

        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>

        <div class="flex flex-col items-start flex-1">
          <span class="font-medium text-sm leading-tight">{{ getUserDisplayName() }}</span>
          <span v-if="isAuthenticated" class="text-xs text-gray-500">View Profile</span>
          <span v-else class="text-xs text-gray-500">Sign In</span>
        </div>
      </button>

      <!-- Dropdown Menu - Mobile Position (bottom-full) -->
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
          class="absolute bottom-full left-0 mb-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-gray-200 z-50"
          @click.stop
        >
          <!-- Not Authenticated -->
          <div v-if="!isAuthenticated">
            <button
              @click="handleNavigation('/login')"
              class="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Sign In
            </button>
            <button
              @click="handleNavigation('/register')"
              class="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Register
            </button>
          </div>

          <!-- Authenticated -->
          <div v-else>
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900">{{ getUserDisplayName() }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ user?.email }}</p>
            </div>

            <button
              v-if="!isAdmin"
              @click="handleNavigation('/dashboard')"
              class="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Dashboard
            </button>

            <button
              v-if="isSeller"
              @click="handleNavigation('/seller/dashboard')"
              class="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h5"
                />
              </svg>
              Seller Dashboard
            </button>

            <button
              v-if="isAdmin"
              @click="handleNavigation('/admin/dashboard')"
              class="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              Admin Dashboard
            </button>

            <div class="border-t border-gray-100 my-1"></div>

            <button
              @click="handleLogout"
              :disabled="isLoading"
              class="flex items-center w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
            >
              <svg class="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span>{{ isLoading ? "Signing out..." : "Sign Out" }}</span>
            </button>
          </div>
        </div>
      </transition>
    </div>

    <!-- Cart Button with Badge -->
    <router-link
      to="/cart"
      class="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 relative"
    >
      <div class="relative">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>

        <div
          v-if="isAuthenticated && cartCount > 0"
          class="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm"
          :class="{ 'animate-pulse': cartCount > 99 }"
        >
          {{ cartCount > 99 ? "99+" : cartCount }}
        </div>
      </div>
      <span class="font-medium text-sm">Cart</span>
    </router-link>
  </div>

  <!-- Auth Modal -->
  <AuthModal
    :isOpen="showAuthModal"
    :initialMode="authModalMode"
    @close="closeAuthModal"
    @login-success="handleLoginSuccess"
    @register-success="handleRegisterSuccess"
    @success="handleLoginSuccess"
  />
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from "vue";
import { useRouter } from "vue-router";
import { toRefs } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { useCartStore } from "@/stores/cartStore";
import AuthModal from "@/components/Auth/AuthModal.vue";

// Composables
const { cartCount } = useCartStore();
const router = useRouter();
const authStore = useAuthStore();
const profileStore = useUserProfileStore();

// ✅ SAMA SEPERTI NavAccountCart - use toRefs
const { user, isAuthenticated, isSeller, isAdmin, isLoading } = toRefs(authStore);

// Local state
const showAccountMenu = ref(false);
const showAuthModal = ref(false);
const authModalMode = ref("login");

// ✅ SAMA SEPERTI NavAccountCart - Computed properties
const userDisplayName = computed(() => {
  if (profileStore.profile && profileStore.fullName && profileStore.fullName !== "User") {
    return profileStore.fullName;
  }

  if (user.value?.username && user.value.username !== "User") {
    return user.value.username;
  }

  if (user.value?.name && user.value.name !== "User") {
    return user.value.name;
  }

  if (user.value?.email) {
    return user.value.email.split("@")[0];
  }

  return "User";
});

const userInitials = computed(() => {
  if (profileStore.profile && profileStore.initials && profileStore.initials !== "U") {
    return profileStore.initials;
  }

  if (user.value?.username) {
    return user.value.username.slice(0, 2).toUpperCase();
  }

  const displayName = userDisplayName.value;
  if (displayName !== "User") {
    const words = displayName.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }

  if (user.value?.email) {
    const emailName = user.value.email.split("@")[0];
    return emailName.slice(0, 2).toUpperCase();
  }

  return "U";
});

const profileAvatarUrl = computed(() => {
  if (profileStore.profile && profileStore.avatarUrl) {
    return profileStore.avatarUrl;
  }

  if (user.value?.avatar) {
    if (typeof user.value.avatar === "string") {
      return user.value.avatar;
    }
    if (user.value.avatar.url) {
      return user.value.avatar.url;
    }
  }

  return null;
});

const isLoadingAvatar = computed(() => {
  return isAuthenticated.value && profileStore.loading;
});

// ✅ SAMA SEPERTI NavAccountCart - Watch
watch(
  () => profileStore.avatarUrl,
  newUrl => {
    if (newUrl) {
      const img = new Image();
      img.src = newUrl;
    }
  },
  { immediate: true }
);

watch(
  isAuthenticated,
  async (newVal, oldVal) => {
    console.log("🔍 Mobile: Auth state changed:", { newVal, oldVal });

    if (newVal && !oldVal) {
      console.log("✅ Mobile: User logged in - fetching profile");

      await nextTick();

      try {
        await profileStore.fetchProfile(true);
        console.log("✅ Mobile: Profile fetched:", {
          fullName: profileStore.fullName,
          username: user.value?.username,
          avatarUrl: profileStore.avatarUrl,
        });
      } catch (err) {
        console.warn("⚠️ Mobile: Failed to fetch profile:", err);
      }
    } else if (!newVal && oldVal) {
      console.log("🚪 Mobile: User logged out - clearing profile");
      profileStore.clearProfile();
    }
  }
  // NO immediate: true - same as NavAccountCart
);

watch(
  () => profileStore.profile,
  newProfile => {
    if (newProfile) {
      console.log("📦 Mobile: Profile updated:", {
        firstName: newProfile.firstName,
        lastName: newProfile.lastName,
        fullName: profileStore.fullName,
        avatarUrl: profileStore.avatarUrl,
      });
    }
  },
  { deep: true }
);

// Methods
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

    if (path === "/login") {
      authModalMode.value = "login";
      showAuthModal.value = true;
      return;
    }

    if (path === "/register") {
      authModalMode.value = "register";
      showAuthModal.value = true;
      return;
    }

    if (router.currentRoute.value.path === path) return;
    await router.push(path);
  } catch (err) {
    console.error("Navigation error:", err);
    window.location.href = path;
  }
};

const handleLogout = async () => {
  try {
    console.log("🚪 Mobile: Starting logout...");
    closeAccountMenu();

    profileStore.clearProfile();

    await authStore.logout();

    console.log("✅ Mobile: Logout successful");

    if (router.currentRoute.value.path !== "/") {
      await router.push("/");
    }
  } catch (err) {
    console.error("❌ Mobile: Logout error:", err);
  }
};

const handleAvatarError = event => {
  console.warn("⚠️ Mobile: Avatar load error");
  event.target.style.display = "none";
};

const closeAuthModal = () => {
  showAuthModal.value = false;
};

const handleLoginSuccess = async () => {
  console.log("✅ Mobile: Login success handler called");
  showAuthModal.value = false;

  await nextTick();

  try {
    console.log("🔄 Mobile: Fetching profile after login...");
    await profileStore.fetchProfile(true);
    console.log("✅ Mobile: Profile fetched successfully after login");
  } catch (err) {
    console.warn("⚠️ Mobile: Failed to fetch profile after login:", err);
  }
};

const handleRegisterSuccess = async () => {
  console.log("✅ Mobile: Register success handler called");
  showAuthModal.value = false;

  await nextTick();

  try {
    console.log("🔄 Mobile: Fetching profile after register...");
    await profileStore.fetchProfile(true);
    console.log("✅ Mobile: Profile fetched successfully after register");
  } catch (err) {
    console.warn("⚠️ Mobile: Failed to fetch profile after register:", err);
  }
};

// Lifecycle
onMounted(() => {
  document.addEventListener("click", () => {
    if (showAccountMenu.value) {
      closeAccountMenu();
    }
  });
});

onUnmounted(() => {
  closeAccountMenu();
});
</script>