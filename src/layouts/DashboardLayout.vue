<!-- layouts/DashboardLayout.vue -->
<template>
  <div class="dashboard-layout">
    <!-- Top navbar -->
    <header class="dashboard-header">
      <div class="container mx-auto px-4 flex items-center justify-between h-16">
        <h1 class="text-xl font-bold">My Dashboard</h1>
        <div class="flex items-center gap-4">
          <button @click="$router.push('/')" class="btn-secondary">
            Back to Store
          </button>
          <button @click="handleLogout" class="btn-danger">
            Logout
          </button>
        </div>
      </div>
    </header>

    <!-- Sidebar + Content -->
    <div class="dashboard-content">
      <DashboardSidebar class="dashboard-sidebar" />
      <main class="dashboard-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import DashboardSidebar from '@/components/';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.dashboard-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.dashboard-content {
  display: flex;
  flex: 1;
}

.dashboard-sidebar {
  width: 250px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.dashboard-main {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .dashboard-sidebar {
    display: none;
  }
}
</style>