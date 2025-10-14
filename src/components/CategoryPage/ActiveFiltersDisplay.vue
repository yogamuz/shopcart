// 9. ActiveFiltersDisplay.vue
<template>
  <div class="mt-6 pt-4 border-t border-gray-200">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm text-gray-600">Active filters:</span>
      <span v-if="priceRange.min > 0" class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
        Min: Rp {{ formatPrice(priceRange.min) }}
      </span>
      <span v-if="priceRange.max < maxPossiblePrice" class="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center gap-1">
        Max: Rp {{ formatPrice(priceRange.max) }}
      </span>
      <span v-if="searchQuery" class="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        Search: "{{ searchQuery }}"
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  priceRange: Object,
  maxPossiblePrice: Number,
  searchQuery: String
});

const formatPrice = (price) => {
  return new Intl.NumberFormat('id-ID').format(price);
};
</script>