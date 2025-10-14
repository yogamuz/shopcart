<!-- EmptyState.vue -->
<template>
  <div class="text-center py-12">
    <svg
      class="w-16 h-16 mx-auto text-gray-400 mb-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
      />
    </svg>
    <h3 class="text-lg font-semibold text-gray-900 mb-2">
      No products found
    </h3>
    <p class="text-gray-500 mb-4">
      {{
        searchQuery || selectedCategory
          ? "Try adjusting your filters"
          : "Get started by adding your first product"
      }}
    </p>
    <button
      v-if="!searchQuery && !selectedCategory"
      @click="$emit('show-create-form')"
      class="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
    >
      Add Your First Product
    </button>
  </div>
</template>

<script setup>
defineProps({
  searchQuery: String,
  selectedCategory: String,
});

defineEmits(['show-create-form']);
</script>