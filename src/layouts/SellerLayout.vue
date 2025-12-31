<!-- layouts/SellerLayout.vue -->
<template>
  <div class="seller-layout">
    <header class="seller-header">
      <div class="container mx-auto px-4 flex items-center justify-between h-16">
        <h1 class="text-xl font-bold">Seller Dashboard</h1>
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

    <div class="seller-content">
      <SellerSidebar class="seller-sidebar" />
      <main class="seller-main">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import SellerSidebar from '@/components/Layout/Sidebar/SellerSidebar.vue';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>

<style scoped>
/* Same structure as DashboardLayout */
.seller-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.seller-header {
  background: #1e293b;
  color: white;
  border-bottom: 1px solid #334155;
  position: sticky;
  top: 0;
  z-index: 10;
}

.seller-content {
  display: flex;
  flex: 1;
}

.seller-sidebar {
  width: 250px;
  background: #0f172a;
  color: white;
  position: sticky;
  top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.seller-main {
  flex: 1;
  padding: 2rem;
  background: #f8fafc;
  overflow-y: auto;
}
</style>