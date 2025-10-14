<template>
  <div class="mb-6">
    <h1 class="text-3xl font-bold mb-2">
      {{ isInSearchMode ? `Search Results in ${currentCategory?.name}` : currentCategory?.name }}
    </h1>
    <p v-if="!isInSearchMode && currentCategory?.description" class="text-gray-600 mb-4">
      {{ currentCategory.description }}
    </p>
    <div v-if="pagination" class="text-sm text-gray-500">
      Showing {{ paginationStart }}-{{ paginationEnd }} 
      of {{ pagination.total || 0 }} products
      <span v-if="isInSearchMode"> for "{{ searchQuery }}"</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentCategory: Object,
  isInSearchMode: Boolean,
  searchQuery: String,
  pagination: Object,
  paginationStart: Number,
  paginationEnd: Number
});
</script>