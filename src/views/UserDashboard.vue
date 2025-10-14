<!-- UserDashboard.vue - Main Component with Separated Components -->
<template>
  <!-- Main Dashboard Container -->
  <div class="min-h-screen bg-[#FAFBFD] font-inter">
    <!-- Left Sidebar -->
    <Sidebar
      :collapsed="sidebarCollapsed"
      :is-mobile="isMobile"
      :active-nav="activeNav"
      @nav-clicked="handleNavClick"
      @toggle-sidebar="toggleSidebar"
    />

    <!-- Main Content with Responsive Layout -->
    <div
      :class="[
        'transition-all duration-300',
        // Mobile & Tablet: no margin (overlay sidebar)
        'ml-0',
        // Desktop only: margin sesuai lebar sidebar
        sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-64',
      ]"
    >
      <!-- Header with Dynamic Title -->
      <Header
        :title="getPageTitle()"
        @toggle-sidebar="toggleSidebar"
      />

      <!-- Dashboard Content -->
      <main class="p-3 sm:p-4 lg:p-6">
        <!-- Dashboard Overview -->
        <UserDashboardOverview v-if="activeNav === 'Dashboard'" @navigate-to="handleNavClick" />

        <!-- Profile Management -->
        <UserProfile v-else-if="activeNav === 'Profile'" @navigate-to="handleNavClick" />

        <!-- Addresses Management -->
        <UserAddresses v-else-if="activeNav === 'Addresses'" />

        <!-- Wallet Management -->
        <UserWallet v-else-if="activeNav === 'Wallet'" />

        <!-- Settings Management -->
        <UserSettings v-else-if="activeNav === 'Settings'" />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import Sidebar from "@/components/user/Sidebar.vue";
import Header from "@/components/user/UserDashboardHeader.vue";
import UserDashboardOverview from "@/components/user/UserDashboardOverview.vue";
import UserProfile from "@/components/user/UserProfile.vue";
import UserAddresses from "@/components/user/UserAddresses.vue";
import UserWallet from "@/components/user/UserWallet.vue";
import UserSettings from "@/components/user/UserSettings.vue";

// Reactive state with responsive detection
const sidebarCollapsed = ref(false);
const isMobile = ref(false);
const activeNav = ref("Dashboard");

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
    Profile: "Profile Management",
    Addresses: "Address Management",
    Wallet: "Wallet Management",
    Settings: "Settings Management",
  };
  return titles[activeNav.value] || "Dashboard Overview";
};

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

// Resize handler
const handleResize = () => {
  checkScreenSize();
};

// Lifecycle hooks
onMounted(() => {
  window.addEventListener("resize", handleResize);
  checkScreenSize(); // Initial check
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
.dashboard-content,
.profile-content,
.address-content,
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
  .dashboard-content,
  .profile-content,
  .address-content,
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
</style>