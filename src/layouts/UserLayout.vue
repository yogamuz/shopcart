<!-- layouts/UserLayout.vue - Main User Dashboard Layout -->
<template>
  <div class="min-h-screen bg-[#FAFBFD] font-inter">
    <!-- Left Sidebar -->
    <Sidebar
      :collapsed="sidebarCollapsed"
      :is-mobile="isMobile"
      :active-nav="currentRouteName"
      @toggle-sidebar="toggleSidebar"
    />

    <!-- Main Content with Responsive Layout -->
    <div
      :class="[
        'transition-all duration-300',
        'ml-0',
        sidebarCollapsed ? 'lg:ml-24' : 'lg:ml-64',
      ]"
    >
      <!-- Header with Dynamic Title -->
      <Header :title="getPageTitle()" @toggle-sidebar="toggleSidebar" />

      <!-- Dashboard Content -->
      <main class="p-3 sm:p-4 lg:p-6">
        <!-- ✅ RouterView untuk render child routes -->
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<script setup>
  
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/authStore";
import Sidebar from "@/components/User/Sidebar.vue";
import Header from "@/components/User/UserDashboardHeader.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Reactive state
const sidebarCollapsed = ref(false);
const isMobile = ref(false);
const isLoading = ref(true);

// ✅ Computed current route name for sidebar highlighting
const currentRouteName = computed(() => {
  const routeNameMap = {
    UserDashboard: "Dashboard",
    UserProfile: "Profile",
    UserAddresses: "Addresses",
    UserWallet: "Wallet",
    UserSettings: "Settings",
  };
  return routeNameMap[route.name] || "Dashboard";
});

// ✅ Route protection - check authentication
onMounted(async () => {
  try {
    if (!authStore.isAuthenticated) {
      console.warn("⚠️ User not authenticated, redirecting to login");
      await router.push("/login");
      return;
    }

    console.log("✅ Dashboard access granted");
    isLoading.value = false;

    // Responsive setup
    window.addEventListener("resize", handleResize);
    checkScreenSize();
  } catch (err) {
    console.error("Dashboard init error:", err);
    await router.push("/login");
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

// ✅ Watch for logout
watch(
  () => authStore.isAuthenticated,
  newValue => {
    if (!newValue) {
      console.warn("⚠️ Auth lost, redirecting to login");
      router.push("/login");
    }
  }
);

// Responsive detection
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 1024;
  if (isMobile.value) {
    sidebarCollapsed.value = true;
  }
};

const handleResize = () => {
  checkScreenSize();
};

// ✅ Helper function untuk page title
const getPageTitle = () => {
  const titles = {
    UserDashboard: "Dashboard Overview",
    UserProfile: "Profile Management",
    UserAddresses: "Address Management",
    UserWallet: "Wallet Management",
    UserSettings: "Settings Management",
  };
  return titles[route.name] || "Dashboard Overview";
};

// Methods
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value;
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");

.font-inter {
  font-family: "Inter", sans-serif;
}

.min-h-screen {
  overflow-x: hidden;
  margin: 0;
  padding: 0;
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

/* ✅ Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
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

@media (max-width: 640px) {
  button:hover:not(:disabled) {
    transform: none;
  }
}
</style>