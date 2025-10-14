<!-- LoadingSpinner.vue - Optimized for smooth transitions -->
<template>
  <!-- Overlay version -->
  <div v-if="overlay" class="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50 transition-all duration-300">
    <div class="custom-loader"></div>
    <p v-if="message" class="mt-4 text-gray-600 text-sm animate-pulse">{{ message }}</p>
  </div>

  <!-- Inline version -->
  <div v-else class="flex items-center justify-center py-8">
    <div class="custom-loader-small"></div>
    <p v-if="message" class="ml-3 text-gray-600 text-sm">{{ message }}</p>
  </div>
</template>

<script setup>
defineProps({
  overlay: {
    type: Boolean,
    default: true
  },
  message: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
/* Main loader for overlay */
.custom-loader {
  width: 120px;
  height: 22px;
  border-radius: 20px;
  color: #22c55e;
  border: 2px solid;
  position: relative;
}

.custom-loader::before {
  content: "";
  position: absolute;
  margin: 2px;
  inset: 0 100% 0 0;
  border-radius: inherit;
  background: #22c55e;
  animation: loading-progress 2s infinite;
}

/* Smaller loader for inline use */
.custom-loader-small {
  width: 60px;
  height: 12px;
  border-radius: 10px;
  color: #22c55e;
  border: 2px solid;
  position: relative;
}

.custom-loader-small::before {
  content: "";
  position: absolute;
  margin: 1px;
  inset: 0 100% 0 0;
  border-radius: inherit;
  background: #22c55e;
  animation: loading-progress 1.5s infinite;
}

@keyframes loading-progress {
  0% {
    inset: 0 100% 0 0;
  }
  50% {
    inset: 0 0 0 0;
  }
  100% {
    inset: 0 100% 0 0;
  }
}

/* Smooth fade animations */
.transition-all {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Backdrop blur for better visual separation */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Prevent body scroll when overlay is shown */
.fixed {
  position: fixed;
}
</style>