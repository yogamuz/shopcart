<!-- Sidebar.vue - Fixed Desktop + Mobile Responsive -->
<template>
  <!-- Mobile Overlay -->
  <div
    v-if="!collapsed && isMobile"
    class="fixed inset-0 bg-black/50 z-20 md:hidden"
    @click="$emit('toggle-sidebar')"
  ></div>

  <aside
    :class="[
      'fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 flex flex-col',
      // Desktop: normal behavior - diperlebar dari w-20 ke w-24
      collapsed ? 'w-24' : 'w-64',
      // Mobile: slide in/out
      'md:translate-x-0',
      isMobile && collapsed ? '-translate-x-full' : 'translate-x-0',
    ]"
  >
    <!-- Logo with Hamburger Menu -->
    <div class="p-6 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <!-- Logo Section -->
        <div v-if="!collapsed" class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-[#6C5CE7] rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">S</span>
          </div>
          <span class="text-xl font-semibold text-gray-900">Dashboard</span>
        </div>
        <div v-else class="flex justify-center flex-1">
          <div class="w-8 h-8 bg-[#6C5CE7] rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">S</span>
          </div>
        </div>

        <!-- Hamburger Menu Button -->
        <button
          @click="$emit('toggle-sidebar')"
          class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          :class="collapsed ? 'ml-0' : 'ml-2'"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>
    </div>

    <!-- Navigation - Desktop Design Preserved -->
    <nav class="mt-8 flex-1 overflow-y-auto">
      <div v-for="item in navItems" :key="item.name" class="px-3 mb-1">
        <a
          href="#"
          :class="[
            'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
            item.active ? 'bg-[#6C5CE7] text-white' : 'text-gray-700 hover:bg-gray-100',
          ]"
          @click="handleNavClick(item.name)"
        >
          <div class="flex items-center">
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            <span v-if="!collapsed">{{ item.name }}</span>
          </div>

          <!-- Notification Badge for Orders - Desktop Design -->
          <span
            v-if="item.name === 'Orders' && !collapsed"
            :class="[
              'text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2 flex-shrink-0',
              orderNotificationCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600',
            ]"
          >
            {{ orderNotificationCount > 99 ? "99+" : orderNotificationCount }}
          </span>

          <!-- Badge for collapsed sidebar -->
          <span
            v-if="item.name === 'Orders' && collapsed"
            :class="[
              'absolute -top-1 -right-1 text-xs rounded-full h-5 w-5 flex items-center justify-center',
              orderNotificationCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600',
            ]"
          >
            {{ orderNotificationCount > 99 ? "99+" : orderNotificationCount }}
          </span>
        </a>
      </div>
    </nav>

    <!-- Bottom Home Button - Desktop Design -->
    <div class="border-t border-gray-100">
      <!-- Home Button -->
      <div class="p-3">
        <a
          href="#"
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full"
          @click="handleHomeClick"
        >
          <component :is="Home" class="w-5 h-5 flex-shrink-0" :class="collapsed ? '' : 'mr-3'" />
          <span v-if="!collapsed">Home</span>
        </a>
      </div>

      <!-- Logout Button -->
      <div class="p-3 pt-0">
        <button
          @click="handleLogout"
          :disabled="isLoggingOut"
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <component
            :is="LogOut"
            class="w-5 h-5 flex-shrink-0"
            :class="[collapsed ? '' : 'mr-3', isLoggingOut ? 'animate-spin' : '']"
          />
          <span v-if="!collapsed">{{ isLoggingOut ? "Logging out..." : "Logout" }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Wallet,
  Settings,
  Home,
  UserCircle,
  LogOut, // ✨ TAMBAHKAN INI
} from "lucide-vue-next";

// ✨ TAMBAHKAN IMPORT INI setelah import icons
import { ref } from "vue";
import { useAuth } from "@/composables/useAuth";
import { useRouter } from "vue-router";

defineProps({
  collapsed: {
    type: Boolean,
    required: true,
  },
  orderNotificationCount: {
    type: Number,
    default: 0,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["nav-clicked", "home-clicked"]);

// ✨ TAMBAHKAN KODE INI
const router = useRouter();
const { logout } = useAuth();
const isLoggingOut = ref(false);

const handleLogout = async () => {
  if (isLoggingOut.value) return;

  try {
    isLoggingOut.value = true;

    // Clear seller profile before logout
    try {
      const { useSellerProfileStore } = await import("@/stores/sellerProfileStore");
      const sellerProfileStore = useSellerProfileStore();
      sellerProfileStore.clearProfile();
      console.log("✅ Seller profile cleared on logout");
    } catch (err) {
      console.warn("Failed to clear seller profile:", err);
    }

    await logout();

    // Navigate to login
    await router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    isLoggingOut.value = false;
  }
};

// Navigation items data with Lucide icons
const navItems = ref([
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {
    name: "Products",
    icon: Package,
    active: false,
  },
  {
    name: "Orders",
    icon: ShoppingCart,
    active: false,
  },

  {
    name: "Analytics",
    icon: BarChart3,
    active: false,
  },
  {
    name: "Wallet",
    icon: Wallet,
    active: false,
  },
  {
    name: "Profile",
    icon: UserCircle,
    active: false,
  },
  {
    name: "Settings",
    icon: Settings,
    active: false,
  },
]);

const handleHomeClick = () => {
  // Navigate to home route
  if (window.$router) {
    window.$router.push("/");
  } else {
    // Fallback if router not available
    window.location.href = "/";
  }
};

const handleNavClick = navName => {
  navItems.value.forEach(item => {
    item.active = item.name === navName;
  });
  emit("nav-clicked", navName);
};
</script>

<style scoped>
/* Smooth transitions */
aside {
  transition: transform 0.3s ease-in-out, width 0.3s ease-in-out;
}

/* Hide scrollbar but keep functionality */
nav::-webkit-scrollbar {
  width: 2px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: #e5e5e5;
  border-radius: 1px;
}
/* Logout button hover effect */
button:hover:not(:disabled) {
  transform: translateX(2px);
}

button:active:not(:disabled) {
  transform: translateX(0);
}

/* Spin animation for logout icon */
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
</style>
