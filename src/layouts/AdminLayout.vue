<!-- layouts/AdminLayout.vue -->
<template>
  <div class="admin-layout">
    <header class="admin-header">
      <div class="container mx-auto px-4 flex items-center justify-between h-16">
        <h1 class="text-xl font-bold">Admin Dashboard</h1>
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

    <div class="admin-content">
      <AdminSidebar class="admin-sidebar" />
      <main class="admin-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import AdminSidebar from '@/components/Layout/Sidebar/AdminSidebar.vue';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>

<style scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-header {
  background: #7c3aed;
  color: white;
  position: sticky;
  top: 0;
  z-index: 10;
}

.admin-content {
  display: flex;
  flex: 1;
}

.admin-sidebar {
  width: 250px;
  background: #6d28d9;
  color: white;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.admin-main {
  flex: 1;
  padding: 2rem;
  background: #faf5ff;
  overflow-y: auto;
}
</style>