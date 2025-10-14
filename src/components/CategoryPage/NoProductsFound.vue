// 12. NoProductsFound.vue
<template>
  <div class="text-center py-12">
    <div class="max-w-md mx-auto">
      <svg class="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.266-5.412-3.154"/>
      </svg>
      <h3 class="text-lg font-semibold text-gray-800 mb-2">No Products Found</h3>
      <p class="text-gray-500 mb-4">
        {{ isInSearchMode ? `No products found for "${searchQuery}" in ${currentCategory?.name}` : `No products found in ${currentCategory?.name}` }}
      </p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  isInSearchMode: Boolean,
  searchQuery: String,
  currentCategory: Object
});
</script>