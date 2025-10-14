<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <!-- Main Content -->
    <div class="text-center max-w-2xl mx-auto">
      <!-- Error Icon -->
      <div class="mb-8">
        <svg class="w-24 h-24 md:w-32 md:h-32 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      </div>

      <!-- 404 Number -->
      <h1 class="text-8xl md:text-9xl font-bold text-red-500 mb-6">
        404
      </h1>

      <!-- Error Message -->
      <div class="space-y-4 mb-8">
        <h2 class="text-3xl md:text-4xl font-bold text-gray-800">
          Page Not Found
        </h2>
        <p class="text-lg text-gray-600 max-w-md mx-auto">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <router-link
          to="/"
          class="inline-flex items-center gap-2 px-8 py-3 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
          </svg>
          Go to Homepage
        </router-link>

        <button
          @click="goBack"
          class="inline-flex items-center gap-2 px-8 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-300 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Go Back
        </button>
      </div>

      <!-- Error Code -->
      <div class="mt-12">
        <p class="text-sm text-gray-500">
          Error Code: <span class="font-mono font-semibold">404</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/');
  }
};
</script>

<style scoped>
/* Simple hover transitions only */
button,
a {
  transition: background-color 0.2s ease, transform 0.1s ease;
}

button:active,
a:active {
  transform: scale(0.98);
}
</style>