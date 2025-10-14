// CategoryFilters.vue - Fix width agar tidak memanjang
<template>
  <div class="mb-10 space-y-6 ">
    <!-- Price Range Filter with Volume Bar - Remove flex, make it block -->
    <div class="w-full max-w-lg">
      <PriceRangeFilter
        :price-range="priceRange"
        :max-possible-price="maxPossiblePrice"
        :is-filtering="isFiltering"
        @price-range-change="$emit('price-range-change', $event)"
        @clear-price-filter="$emit('clear-price-filter')"
        ref="priceRangeFilter"
      />
    </div>

    <!-- Search Filter Display Only -->
    <div v-if="searchQuery" class="mt-6 pt-4 border-t border-gray-200">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm text-gray-600">Active search:</span>
        <span class="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search: "{{ searchQuery }}"
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import PriceRangeFilter from './PriceRangeFilter.vue';

defineProps({
  priceRange: Object,
  maxPossiblePrice: Number,
  isFiltering: Boolean,
  isInSearchMode: Boolean,
  searchQuery: String,
  hasActiveFilters: Boolean
});

const emit = defineEmits([
  'clear-search', 
  'price-range-change',
  'clear-price-filter'
]);

const priceRangeFilter = ref(null);
</script>