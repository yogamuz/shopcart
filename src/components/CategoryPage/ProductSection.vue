// 10. ProductSection.vue
<template>
  <transition name="fade-products" mode="out-in">
    <ProductGrid
      v-if="displayedProducts.length > 0 && !isFiltering"
      :key="`products-${currentCategory?.name}-${searchQuery}-${JSON.stringify(priceRange)}`"
      :products="normalizedProducts"
      @product-click="$emit('product-click', $event)"
    />
    
    <!-- Products Loading State -->
    <ProductsLoadingSkeleton v-else-if="isFiltering" />

    <!-- No Products Found -->
    <NoProductsFound 
      v-else
      :is-in-search-mode="isInSearchMode"
      :search-query="searchQuery"
      :current-category="currentCategory"
    />
  </transition>
</template>

<script setup>
import ProductGrid from "@/components/Product/ProductGrid.vue";
import ProductsLoadingSkeleton from './ProductsLoadingSkeleton.vue';
import NoProductsFound from './NoProductsFound.vue';

defineProps({
  displayedProducts: Array,
  normalizedProducts: Array,
  isFiltering: Boolean,
  isInSearchMode: Boolean,
  searchQuery: String,
  currentCategory: Object,
  priceRange: Object
});

defineEmits(['product-click']);
</script>

<style scoped>
.fade-products-enter-active, 
.fade-products-leave-active {
  transition: opacity 0.3s ease;
}

.fade-products-enter-from,
.fade-products-leave-to {
  opacity: 0;
}
</style>