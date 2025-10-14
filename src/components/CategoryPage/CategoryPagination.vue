// 13. CategoryPagination.vue
<template>
  <div class="mt-8">
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-600">
        Page {{ pagination.page }} of {{ pagination.totalPages }}
      </div>
      <div class="flex items-center space-x-2">
        <button
          :disabled="!pagination.hasPrev || isPaginating"
          @click="$emit('change-page', pagination.page - 1)"
          :class="[
            'px-3 py-2 text-sm border rounded-lg transition-colors',
            pagination.hasPrev && !isPaginating
              ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
          ]"
        >
          Previous
        </button>
        
        <!-- Page Numbers -->
        <div class="flex items-center space-x-1">
          <button
            v-for="page in getVisiblePages()"
            :key="page"
            @click="$emit('change-page', page)"
            :disabled="isPaginating"
            :class="[
              'px-3 py-2 text-sm border rounded-lg transition-colors',
              page === pagination.page
                ? 'border-blue-500 bg-blue-500 text-white'
                : isPaginating
                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            ]"
          >
            {{ page }}
          </button>
        </div>

        <button
          :disabled="!pagination.hasNext || isPaginating"
          @click="$emit('change-page', pagination.page + 1)"
          :class="[
            'px-3 py-2 text-sm border rounded-lg transition-colors',
            pagination.hasNext && !isPaginating
              ? 'border-gray-300 text-gray-700 hover:bg-gray-50' 
              : 'border-gray-200 text-gray-400 cursor-not-allowed'
          ]"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  pagination: Object,
  isPaginating: Boolean
});

defineEmits(['change-page']);

const getVisiblePages = () => {
  if (!props.pagination) return [];
  
  const current = props.pagination.page;
  const total = props.pagination.totalPages;
  const delta = 2;
  
  let start = Math.max(1, current - delta);
  let end = Math.min(total, current + delta);
  
  if (current <= delta) {
    end = Math.min(total, 2 * delta + 1);
  }
  if (current + delta >= total) {
    start = Math.max(1, total - 2 * delta);
  }
  
  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  
  return pages;
};
</script>