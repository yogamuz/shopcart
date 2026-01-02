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
      collapsed ? 'w-24' : 'w-64',
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

    <!-- Navigation -->
    <nav class="mt-8 flex-1 overflow-y-auto">
      <div v-for="item in navItems" :key="item.name" class="px-3 mb-1">
        <!-- ✅ Gunakan RouterLink untuk SPA navigation -->
        <RouterLink
          :to="item.route"
          :class="[
            'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
            isActive(item.name) ? 'bg-[#6C5CE7] text-white' : 'text-gray-700 hover:bg-gray-100',
          ]"
          @click="handleNavClick"
        >
          <div class="flex items-center">
            <component :is="item.icon" class="w-5 h-5 mr-3" />
            <span v-if="!collapsed">{{ item.name }}</span>
          </div>
        </RouterLink>
      </div>
    </nav>

    <!-- Bottom Section - Home & Logout -->
    <div class="border-t border-gray-100">
      <!-- Home Button -->
      <div class="p-3">
        <RouterLink
          to="/"
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full"
        >
          <component :is="Home" class="w-5 h-5 flex-shrink-0" :class="collapsed ? '' : 'mr-3'" />
          <span v-if="!collapsed">Home</span>
        </RouterLink>
      </div>

      <!-- Logout Button -->
      <div class="p-3 pt-0">
        <button
          @click="handleLogout"
          :disabled="isLoggingOut"
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <!-- ✅ PERBAIKAN: Icon statis, tidak berputar -->
          <component :is="LogOut" class="w-5 h-5 flex-shrink-0" :class="collapsed ? '' : 'mr-3'" />
          <span v-if="!collapsed">{{ isLoggingOut ? "Logging out..." : "Logout" }}</span>
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { LayoutDashboard, User, MapPin, Wallet, Settings, Home, LogOut } from "lucide-vue-next";
import { useAuthStore } from "@/stores/authStore";

const props = defineProps({
  collapsed: {
    type: Boolean,
    required: true,
  },
  isMobile: {
    type: Boolean,
    default: false,
  },
  activeNav: {
    type: String,
    default: "Dashboard",
  },
});

const emit = defineEmits(["toggle-sidebar"]);

const router = useRouter();
const route = useRoute();
const { logout } = useAuthStore();
const isLoggingOut = ref(false);

// ✅ Navigation items dengan routes
const navItems = ref([
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    route: "/dashboard",
  },
  {
    name: "Profile",
    icon: User,
    route: "/dashboard/profile",
  },
  {
    name: "Addresses",
    icon: MapPin,
    route: "/dashboard/addresses",
  },
  {
    name: "Wallet",
    icon: Wallet,
    route: "/dashboard/wallet",
  },
  {
    name: "Settings",
    icon: Settings,
    route: "/dashboard/settings",
  },
]);

// ✅ Check if route is active
const isActive = navName => {
  return props.activeNav === navName;
};

// ✅ Handle nav click - close sidebar on mobile
const handleNavClick = () => {
  if (props.isMobile) {
    emit("toggle-sidebar");
  }
};

// ✅ PERBAIKAN: Logout sama seperti seller sidebar
const handleLogout = async () => {
  if (isLoggingOut.value) return;

  try {
    isLoggingOut.value = true;

    // Clear user profile/data before logout
    try {
      const { useUserProfileStore } = await import("@/stores/userProfileStore");
      const userProfileStore = useUserProfileStore();
      userProfileStore.$reset();
    } catch (err) {
      console.warn("Failed to clear user data:", err);
    }

    // ✅ Logout tanpa explicit router.push
    await logout();

    // ✅ TAMBAHKAN: Explicit redirect ke homepage (sama seperti seller)
    await router.push("/");
  } catch (error) {
    console.error("❌ Logout error:", error);
  } finally {
    isLoggingOut.value = false;
  }
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

/* ✅ RouterLink active state */
a.router-link-active {
  /* Handled by isActive computed */
}
</style>
