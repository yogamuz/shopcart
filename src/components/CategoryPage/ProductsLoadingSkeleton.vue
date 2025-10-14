// 11. ProductsLoadingSkeleton.vue
<template>
  <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 animate-pulse">
    <div v-for="i in 10" :key="i" class="border border-gray-200 bg-gray-50 rounded-lg overflow-hidden">
      <div class="aspect-square bg-gray-200"></div>
      <div class="p-3 space-y-2">
        <div class="h-4 bg-gray-200 rounded"></div>
        <div class="h-3 bg-gray-200 rounded w-3/4"></div>
        <div class="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
  </div>
</template>