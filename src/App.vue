<!-- App.vue - FIXED -->
<template>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useUserProfile } from '@/composables/useUserProfile';
import { onMounted } from 'vue';

const authStore = useAuthStore();
const { initialize: initializeProfile, isInitialized } = useUserProfile();

onMounted(async () => {
  try {
    // 1. Initialize auth (restore token, user data)
    await authStore.initialize();

    // 2. Jika user sudah authenticated, initialize profile SEKALI aja
    if (authStore.isAuthenticated && !isInitialized.value) {
      await initializeProfile();
    }
  } catch (err) {
    console.warn('Init error:', err);
  }
});
</script>