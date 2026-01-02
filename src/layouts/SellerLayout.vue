<!-- layouts/SellerLayout.vue - Shared layout for all seller pages -->
<template>
  <div class="min-h-screen bg-[#FAFBFD] font-inter">
    <!-- Sidebar -->
    <Sidebar
      :collapsed="sidebarCollapsed"
      :order-notification-count="orderNotificationCount"
      :is-mobile="isMobile"
      @toggle-sidebar="toggleSidebar"
    />

    <!-- Main Content -->
    <div
      :class="[
        'transition-all duration-300 ml-0',
        sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-64',
      ]"
    >
      <!-- Header -->
      <Header
        :title="pageTitle"
        :search-placeholder="searchPlaceholder"
        :notification-count="3"
        :show-search="showSearch"
        :user-name="sellerDisplayName"
        :user-logo="sellerLogo"
        @toggle-sidebar="toggleSidebar"
        @search="handleGlobalSearch"
        @search-clear="handleGlobalSearchClear"
      />

      <!-- Router View - Dynamic page content -->
      <main class="p-3 sm:p-4 lg:p-6">
        <router-view
          v-slot="{ Component }"
          @orders-count-updated="handleOrdersCountUpdated"
        >
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import Sidebar from "@/components/Seller/Sidebar.vue";
import Header from "@/components/Seller/Header.vue";
import { useSellerProfile } from "@/composables/useSellerProfile";

const route = useRoute();

// State
const sidebarCollapsed = ref(false);
const isMobile = ref(false);
const totalOrdersCount = ref(0);

// Seller profile
const { profile, fetchProfile } = useSellerProfile();

// Computed
const sellerDisplayName = computed(() => profile.value?.storeName || "Seller");
const sellerLogo = computed(() => profile.value?.logo || null);
const orderNotificationCount = computed(() => totalOrdersCount.value);

// Page-specific computed based on route
const pageTitle = computed(() => route.meta?.title || "Seller Dashboard");

const searchPlaceholder = computed(() => {
  const placeholders = {
    "/seller/dashboard": "Search...",
    "/seller/products": "Search products...",
    "/seller/orders": "Search cust or product",
    "/seller/analytics": "Search reports...",
    "/seller/wallet": "Search transactions...",
    "/seller/profile": "Search...",
    "/seller/settings": "Search settings...",
  };
  return placeholders[route.path] || "Search...";
});

const showSearch = computed(() => route.path !== "/seller/dashboard");

// Methods
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 1024;
  if (isMobile.value) {
    sidebarCollapsed.value = true;
  }
};

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const handleGlobalSearch = (query) => {
  ;
};

const handleGlobalSearchClear = () => {
  ;
};

const handleOrdersCountUpdated = (count) => {
  totalOrdersCount.value = count;
};

// Auto-collapse sidebar on mobile
watch(() => route.path, () => {
  if (isMobile.value) {
    sidebarCollapsed.value = true;
  }
});

// Lifecycle
onMounted(() => {
  window.addEventListener("resize", checkScreenSize);
  checkScreenSize();

  fetchProfile().catch(err => {
    console.error("Failed to fetch seller profile:", err);
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.font-inter {
  font-family: "Inter", sans-serif;
}

main {
  margin-top: 0 !important;
  padding-top: 0.75rem !important;
}

@media (min-width: 640px) {
  main {
    padding-top: 1rem !important;
  }
}

@media (min-width: 1024px) {
  main {
    padding-top: 1.5rem !important;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>