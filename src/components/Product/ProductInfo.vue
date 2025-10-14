<!-- productinfo -->
<template>
  <div>
    <h1 class="text-3xl font-bold text-gray-900 mb-2">
      {{ product.title || product.name }}
    </h1>

    <!-- Rating and Reviews -->
    <div class="flex items-center mb-4">
      <div class="flex items-center mr-2">
        <span v-for="i in 5" :key="i" class="text-amber-400">
          <svg
            v-if="i <= (product.rating || product.averageRating || 0)"
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
          <svg
            v-else
            class="w-5 h-5 text-gray-300"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
            />
          </svg>
        </span>
      </div>
      <span class="text-sm text-gray-500"
        >{{ product.reviews || product.reviewCount || 0 }} reviews</span
      >
    </div>

    <!-- Price -->
    <div class="mb-6">
      <p class="text-3xl font-bold text-amber-600">
        Rp{{ formatPrice(product.price) }}
      </p>
    </div>

    <!-- Description -->
    <div class="mb-6">
      <h2 class="text-lg font-semibold mb-2">Description</h2>
      <p class="text-gray-600">{{ product.description }}</p>
    </div>

    <!-- Add to Cart Section -->
    <div class="border-t border-gray-200 pt-6">
      <div class="flex items-center space-x-4 mb-6">
        <div
          class="flex items-center border border-gray-300 rounded-md"
        >
          <button
            @click="$emit('decrease-quantity')"
            :disabled="quantity <= 1"
            class="px-3 py-1 text-lg hover:bg-gray-100 disabled:hover:bg-white disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            -
          </button>
          <span class="px-4 py-1 min-w-[3rem] text-center">{{ quantity }}</span>
          <button
            @click="$emit('increase-quantity')"
            :disabled="quantity >= maxQuantity"
            class="px-3 py-1 text-lg hover:bg-gray-100 disabled:hover:bg-white disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            +
          </button>
        </div>
        <button
          @click="$emit('add-to-cart')"
          :disabled="isCartLoading"
          class="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white py-2 px-4 rounded-md font-medium transition-colors"
        >
          {{ isCartLoading ? "Adding..." : "Add to Cart" }}
        </button>
      </div>

      <!-- Stock info -->
      <div v-if="product.stock || product.quantity" class="text-sm text-gray-500">
        Stock available: {{ product.stock || product.quantity }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  isCartLoading: {
    type: Boolean,
    default: false
  },
  maxQuantity: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(['increase-quantity', 'decrease-quantity', 'add-to-cart']);

// Format price with proper locale
const formatPrice = (price) => {
  if (!price || isNaN(price)) return '0';
  return parseInt(price).toLocaleString('id-ID');
};
</script>