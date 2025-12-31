<template>
  <RouterView />
</template>

<script setup>
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { useCartStore } from "@/stores/cartStore";

const authStore = useAuthStore();
const profileStore = useUserProfileStore();
const cartStore = useCartStore();

// Initialize auth ONCE
onMounted(async () => {
  try {
    await authStore.initialize();

    if (authStore.isAuthenticated) {
      // Fetch profile
      await profileStore.fetchProfile(true);

      // ✅ CRITICAL FIX: Initialize cart after auth
      await cartStore.initializeCart();
    }
  } catch (err) {
    console.warn("⚠️ Init error:", err);
  }
});
</script>

<style></style>
