<!-- sellerdashboard.vue main parent - Refactored with SellerWallet -->
<template>
  <!-- Main Dashboard Container -->
  <div class="min-h-screen bg-[#FAFBFD] font-inter">
    <!-- Left Sidebar -->
    <Sidebar
      :collapsed="sidebarCollapsed"
      :order-notification-count="orderNotificationCount"
      :is-mobile="isMobile"
      @nav-clicked="handleNavClick"
      @toggle-sidebar="toggleSidebar"
    />

    <!-- Main Content with Fixed Responsive Layout -->
    <div
      :class="[
        'transition-all duration-300',
        // Mobile & Tablet: no margin (overlay sidebar)
        'ml-0',
        // Desktop only: margin sesuai lebar sidebar
        sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-64',
      ]"
    >
      <Header
        :title="getPageTitle()"
        :search-placeholder="getSearchPlaceholder()"
        :notification-count="3"
        :show-search="activeNav !== 'Dashboard'"
        :user-name="sellerDisplayName"
        :user-logo="sellerLogo"
        @toggle-sidebar="toggleSidebar"
        @search="handleGlobalSearch"
        @search-clear="handleGlobalSearchClear"
      />

      <!-- Dashboard Content - Dynamic Component Rendering with Responsive Padding -->
      <main class="p-3 sm:p-4 lg:p-6">
        <!-- Orders Dashboard Content (Default) -->
        <div v-if="activeNav === 'Orders'" class="orders-content">
          <SellerOrder ref="sellerOrderRef" @orders-count-updated="handleOrdersCountUpdated" />
        </div>

        <!-- Products Management Content -->
        <div v-else-if="activeNav === 'Products'" class="products-content">
          <div class="max-w-full">
            <SellerProduct />
          </div>
        </div>

        <!-- Dashboard Content -->
        <div v-else-if="activeNav === 'Dashboard'" class="dashboard-content">
          <SellerDashboardOverview @navigate-to-products="handleNavigateToProducts" />
        </div>

        <!-- Analytics Content -->
        <div v-else-if="activeNav === 'Analytics'" class="analytics-content">
          <SellerAnalytics />
        </div>

        <!-- Seller Wallet Content -->
        <div v-else-if="activeNav === 'Wallet'" class="wallet-content">
          <SellerWallet ref="sellerWalletRef" @search="handleWalletSearch" />
        </div>
        <!-- Profile Content -->
        <div v-else-if="activeNav === 'Profile'" class="profile-content">
          <SellerProfile />
        </div>

        <!-- Settings Content -->
        <div v-else-if="activeNav === 'Settings'" class="settings-content">
          <div class="bg-white rounded-lg lg:rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
            <p class="text-gray-600">Settings panel coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import Sidebar from "@/components/Seller/Sidebar.vue";
import Header from "@/components/Seller/Order/Header.vue";
import SellerOrder from "@/components/Seller/Order/SellerOrder.vue";
import SellerProduct from "@/components/Seller/Product/SellerProduct.vue";
import SellerWallet from "@/components/Seller/SellerWallet.vue";
import SellerProfile from "@/components/Seller/Profile/SellerProfile.vue";
import SellerDashboardOverview from "@/components/Seller/Dashboard/SellerDashboardOverview.vue";
import SellerAnalytics from "@/components/Seller/SellerAnalytics.vue"
import { useSellerProfile } from "@/composables/useSellerProfile";

// Reactive state - with responsive breakpoint detection
const sidebarCollapsed = ref(false);
const isMobile = ref(false);
const sellerOrderRef = ref(null);
const sellerWalletRef = ref(null);

const activeNav = ref("Dashboard");
const totalOrdersCount = ref(0);

// Responsive detection
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 1024; // LG breakpoint

  // Auto-collapse sidebar on mobile/tablet
  if (isMobile.value) {
    sidebarCollapsed.value = true;
  }
};

// Helper functions
const getPageTitle = () => {
  const titles = {
    Dashboard: "Dashboard Overview",
    Products: "Product Management",
    Orders: "Orders Dashboard",
    Customers: "Customer Management",
    Analytics: "Analytics & Reports",
    Wallet: "Seller Wallet",
    Profile: "Seller Profile",
    Settings: "Settings",
  };
  return titles[activeNav.value] || "Orders Dashboard";
};

const getSearchPlaceholder = () => {
  const placeholders = {
    Dashboard: "Search...",
    Products: "Search products...",
    Orders: "Search cust or product",
    Customers: "Search customers...",
    Analytics: "Search reports...",
    Wallet: "Search transactions...",
    Profile: "Search...",
    Settings: "Search settings...",
  };
  return placeholders[activeNav.value] || "Search orders...";
};

const orderNotificationCount = computed(() => {
  // Selalu return total orders count, bahkan jika 0
  return totalOrdersCount.value;
});
// Seller profile integration
const { profile, fetchProfile } = useSellerProfile();

// Computed properties untuk seller info
const sellerDisplayName = computed(() => {
  return profile.value?.storeName || "Seller";
});

const sellerLogo = computed(() => {
  return profile.value?.logo || null;
});
// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};

const handleNavClick = navName => {
  try {
    console.log("Navigating to:", navName);

    // Prevent self-assignment if already on the same page
    if (activeNav.value === navName) {
      return;
    }

    // Update active navigation
    activeNav.value = navName;

    // Auto-collapse sidebar on mobile after navigation
    if (isMobile.value) {
      sidebarCollapsed.value = true;
    }
  } catch (error) {
    console.error("Error in handleNavClick:", error);
  }
};

const handleGlobalSearch = query => {
  console.log("Global search:", query, "for section:", activeNav.value);

  // Delegate to appropriate child component
  if (activeNav.value === "Orders" && sellerOrderRef.value) {
    sellerOrderRef.value.handleSearch(query);
  } else if (activeNav.value === "Wallet" && sellerWalletRef.value) {
    // SellerWallet component will handle search internally via emit
    console.log("Wallet search delegated to component");
  }
  // Add similar logic for other components later
};

const handleGlobalSearchClear = () => {
  console.log("Global search cleared for section:", activeNav.value);

  if (activeNav.value === "Orders" && sellerOrderRef.value) {
    sellerOrderRef.value.handleSearchClear();
  } else if (activeNav.value === "Wallet" && sellerWalletRef.value) {
    // Clear search in wallet component
    console.log("Wallet search cleared");
  }
};

const handleWalletSearch = query => {
  console.log("Wallet search received:", query);
  // Additional handling for wallet search if needed
};

// Computed untuk menghitung total orders
const handleOrdersCountUpdated = count => {
  totalOrdersCount.value = count;
};

// Handle navigation from dashboard to products
const handleNavigateToProducts = () => {
  activeNav.value = "Products";

  // Auto-collapse sidebar on mobile after navigation
  if (isMobile.value) {
    sidebarCollapsed.value = true;
  }
};

// Resize handler
const handleResize = () => {
  checkScreenSize();
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("resize", handleResize);
  checkScreenSize(); // Initial check

  // Fetch seller profile untuk mendapatkan logo dan nama toko
  fetchProfile().catch(err => {
    console.error("Failed to fetch seller profile:", err);
  });
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.font-inter {
  font-family: "Inter", sans-serif;
}

/* Remove extra spacing */
.min-h-screen {
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

/* Fix main content spacing */
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

/* Content sections responsive */
.orders-content,
.products-content,
.dashboard-content,
.customers-content,
.analytics-content,
.wallet-content,
.settings-content {
  animation: fadeIn 0.3s ease-in-out;
  max-width: 100%;
  overflow-x: hidden;
  margin-top: 0;
  padding-top: 0;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive layout fixes */
@media (max-width: 1024px) {
  .sidebar-collapsed {
    transform: translateX(-100%);
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .orders-content,
  .products-content,
  .dashboard-content,
  .customers-content,
  .analytics-content,
  .wallet-content,
  .settings-content {
    padding: 0;
  }
}

/* Custom scrollbar */
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

/* Focus states */
input:focus,
select:focus,
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.1);
}

/* Button hover effects */
button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:active:not(:disabled) {
  transform: translateY(0);
}

/* Mobile button adjustments */
@media (max-width: 640px) {
  button:hover:not(:disabled) {
    transform: none;
  }
}
.profile-content {
  animation: fadeIn 0.3s ease-in-out;
  max-width: 100%;
  overflow-x: hidden;
  margin-top: 0;
  padding-top: 0;
}
</style>
