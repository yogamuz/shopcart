<!-- ProductCard.vue -->
<template>
  <div
    class="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col"
  >
    <div class="aspect-square bg-gray-100 relative overflow-hidden">
      <img
        v-if="product.image && !isUploading"
        :src="product.image"
        :alt="product.title"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div v-else class="w-full h-full flex items-center justify-center">
        <!-- Show upload overlay jika sedang upload -->
        <div
          v-if="isUploading || product.image === null"
          class="text-center text-gray-500"
        >
          <div
            v-if="isUploading"
            class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"
          ></div>
          <p class="text-sm font-medium">
            {{ isUploading ? "Uploading..." : product.title }}
          </p>
        </div>
        <!-- Default icon jika tidak ada gambar dan tidak upload -->
        <svg
          v-else
          class="w-12 h-12 lg:w-16 lg:h-16 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>

      <!-- Product Badges -->
 <ProductBadges
    :product="product"
    :is-selected="isSelected"
    @toggle-select="$emit('toggle-select', $event)"
  />


    </div>

    <!-- Product Info -->
    <ProductInfo
      :product="product"
      @edit="$emit('edit', product)"
      @toggle-status="$emit('toggle-status', product)"
      @delete="$emit('delete', product.id)"
    />
  </div>
</template>

<script setup>
import ProductBadges from "./ProductBadges.vue";
import ProductInfo from "./ProductInfo.vue";

defineProps({
  product: {
    type: Object,
    required: true,
  },
  categories: {
    type: Array,
    required: true,
  },
  isUploading: {
    type: Boolean,
    default: false,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["edit", "delete", "toggle-status", "toggle-select"]);
</script>
