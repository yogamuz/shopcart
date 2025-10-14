<template>
  <nav class="mb-6 text-sm">
    <ol class="flex items-center space-x-2 text-gray-500">
      <li>
        <router-link to="/" class="hover:text-blue-600 transition-colors">Home</router-link>
      </li>
      <li class="flex items-center">
        <svg class="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
        <span class="text-gray-800 font-medium">{{ currentCategory?.name }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  currentCategory: Object
});
</script>