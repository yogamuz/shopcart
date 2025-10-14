<template>
  <div class="animate-pulse">
    <!-- Breadcrumb skeleton -->
    <div class="mb-6">
      <div class="h-4 bg-gray-200 rounded w-48 mb-2"></div>
    </div>
    
    <!-- Header skeleton -->
    <div class="mb-6">
      <div class="h-8 bg-gray-200 rounded w-64 mb-4"></div>
      <div class="h-4 bg-gray-200 rounded w-96"></div>
    </div>
    
    <!-- Filters skeleton -->
    <div class="bg-gray-50 p-6 rounded-lg mb-6">
      <div class="h-6 bg-gray-200 rounded w-32 mb-4"></div>
      <div class="h-4 bg-gray-200 rounded w-full"></div>
    </div>
    
    <!-- Products skeleton -->
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      <div v-for="i in 10" :key="i" class="border border-gray-200 bg-gray-50 rounded-lg overflow-hidden">
        <div class="aspect-square bg-gray-200"></div>
        <div class="p-3 space-y-2">
          <div class="h-4 bg-gray-200 rounded"></div>
          <div class="h-3 bg-gray-200 rounded w-3/4"></div>
          <div class="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  </div>
</template>