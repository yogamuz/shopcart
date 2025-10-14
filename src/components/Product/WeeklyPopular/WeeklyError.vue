<template>
  <div class="text-center py-8">
    <p class="text-red-500">Failed to load products. Please try again later.</p>
    <button
      @click="$emit('retry')"
      class="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
    >
      Retry
    </button>
  </div>
</template>

<script setup>
defineEmits(["retry"]);
</script>