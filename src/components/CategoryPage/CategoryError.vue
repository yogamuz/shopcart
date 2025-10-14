<template>
  <div class="text-center py-12">
    <p class="text-red-500">Failed to load category content</p>
    <button
      @click="$emit('retry')"
      class="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
    >
      Retry
    </button>
  </div>
</template>

<script setup>
defineEmits(['retry']);
</script>