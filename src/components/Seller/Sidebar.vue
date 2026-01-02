<!-- components/Seller/Sidebar.vue -->
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
        <router-link :to="item.route" v-slot="{ isActive }" custom>
          <div
            @click="() => $router.push(item.route)"
            :class="[
              'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors relative cursor-pointer',
              isActive ? 'bg-[#6C5CE7] text-white' : 'text-gray-700 hover:bg-gray-100',
            ]"
          >
            <div class="flex items-center">
              <component :is="item.icon" class="w-5 h-5 mr-3" />
              <span v-if="!collapsed">{{ item.name }}</span>
            </div>

            <!-- Order Badge -->
            <span
              v-if="item.name === 'Orders' && !collapsed"
              :class="[
                'text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2 flex-shrink-0',
                orderNotificationCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600',
              ]"
            >
              {{ orderNotificationCount > 99 ? "99+" : orderNotificationCount }}
            </span>

            <span
              v-if="item.name === 'Orders' && collapsed"
              :class="[
                'absolute -top-1 -right-1 text-xs rounded-full h-5 w-5 flex items-center justify-center',
                orderNotificationCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-300 text-gray-600',
              ]"
            >
              {{ orderNotificationCount > 99 ? "99+" : orderNotificationCount }}
            </span>
          </div>
        </router-link>
      </div>
    </nav>

    <!-- Bottom Buttons -->
    <div class="border-t border-gray-100">
      <div class="p-3">
        <router-link
          to="/"
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors w-full"
        >
          <component :is="Home" class="w-5 h-5 flex-shrink-0" :class="collapsed ? '' : 'mr-3'" />
          <span v-if="!collapsed">Home</span>
        </router-link>
      </div>

      <!-- Logout Button -->
      <div class="p-3 pt-0">
        <button
          @click="handleLogout"
          :disabled="isLoggingOut"
          class="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full disabled:opacity-50"
        >
          <!-- ✅ PERBAIKAN: Hapus animate-spin -->
          <component :is="LogOut" class="w-5 h-5 flex-shrink-0" :class="collapsed ? '' : 'mr-3'" />
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
  BarChart3,
  Wallet,
  UserCircle,
  Settings,
  Home,
  LogOut,
} from "lucide-vue-next";
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

defineProps({
  collapsed: Boolean,
  orderNotificationCount: { type: Number, default: 0 },
  isMobile: { type: Boolean, default: false },
});

defineEmits(["toggle-sidebar"]);

const router = useRouter();
const { logout } = useAuthStore();
const isLoggingOut = ref(false);

const navItems = ref([
  { name: "Dashboard", icon: LayoutDashboard, route: "/seller/dashboard" },
  { name: "Products", icon: Package, route: "/seller/dashboard/products" },
  { name: "Orders", icon: ShoppingCart, route: "/seller/dashboard/orders" },
  { name: "Analytics", icon: BarChart3, route: "/seller/dashboard/analytics" },
  { name: "Wallet", icon: Wallet, route: "/seller/dashboard/wallet" },
  { name: "Profile", icon: UserCircle, route: "/seller/dashboard/profile" },
  { name: "Settings", icon: Settings, route: "/seller/dashboard/settings" },
]);

const handleLogout = async () => {
  if (isLoggingOut.value) return;
  try {
    isLoggingOut.value = true;
    try {
      const { useSellerProfileStore } = await import("@/stores/sellerProfileStore");
      useSellerProfileStore().clearProfile();
    } catch (err) {
      console.warn("Failed to clear seller profile:", err);
    }
    await logout();
    await router.push("/");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    isLoggingOut.value = false;
  }
};
</script>
