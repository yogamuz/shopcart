<!-- ProductImageSection.vue - Fixed with ref exposure -->
<template>
  <div class="space-y-4">
    <div
      ref="imageContainer"
      class="rounded-xl overflow-hidden bg-white border border-gray-200 hover:border-gray-300 transition-all duration-300 relative aspect-square shadow-sm hover:shadow-lg"
    >
      <!-- Stock Badge -->
      <div
        v-if="product?.stock && product.stock <= 10"
        class="absolute top-4 left-4 px-3 py-1.5 bg-orange-500 text-white text-sm rounded-full font-medium z-10 shadow-md"
      >
        {{ product.stock }} left
      </div>

      <!-- Love Button -->
      <button
        @click="$emit('toggleLike')"
        class="absolute top-4 right-4 w-10 h-10 bg-white/95 rounded-full flex items-center justify-center shadow-md transition-all duration-300 hover:bg-red-50 hover:shadow-lg z-10"
        :class="
          isLiked
            ? 'text-red-500'
            : 'text-gray-400 hover:text-red-400'
        "
      >
        <svg
          class="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          />
        </svg>
      </button>

<img
  ref="productImageRef"
  data-product-image
  :src="getProductImage(product)"
  :alt="getProductTitle(product)"
  class="absolute inset-0 w-full h-full object-cover hover:scale-105 transition-transform duration-300"
  @error="$emit('imageError', $event)"
  @load="$emit('imageLoad')"
/>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const imageContainer = ref(null);
const productImageRef = ref(null);

defineProps({
  product: {
    type: Object,
    default: null
  },
  isLiked: {
    type: Boolean,
    default: false
  },
  getProductImage: {
    type: Function,
    required: true
  },
  getProductTitle: {
    type: Function,
    required: true
  }
});

defineEmits(['toggleLike', 'imageError', 'imageLoad']);

// Expose the getBoundingClientRect method for parent component
defineExpose({
  getBoundingClientRect: () => {
    return imageContainer.value?.getBoundingClientRect() || 
           productImageRef.value?.getBoundingClientRect() || 
           null;
  }
});
</script>