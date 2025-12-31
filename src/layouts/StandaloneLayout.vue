<!-- layouts/StandaloneLayout.vue -->
<template>
  <div class="standalone-layout">
    <!-- Optional: Simple header with back button -->
    <header v-if="showHeader" class="standalone-header">
      <div class="container mx-auto px-4 flex items-center justify-between h-16">
        <button @click="$router.push('/')" class="flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Store
        </button>
      </div>
    </header>

    <!-- Full width content -->
    <main class="standalone-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

// Show minimal header for some standalone pages
const showHeader = computed(() => {
  return route.path.startsWith('/stores/');
});
</script>

<style scoped>
.standalone-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.standalone-header {
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.standalone-main {
  flex: 1;
}
</style>