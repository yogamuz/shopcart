<!-- BESTDEALSCARD.VUE -->
<template>
  <div
    class="product-card flex-shrink-0 bg-white rounded-2xl border border-gray-200 hover:border-gray-400 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
    style="min-width: 280px; max-width: 350px; height: 480px"
  >
    <!-- Image Section (Fixed height) -->
    <div class="relative bg-gray-100 w-full h-48 overflow-hidden flex-shrink-0">
      <button
        @click="$emit('toggle-like', product.id)"
        class="interactive-element absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center z-10 transition-all duration-300"
        :class="product.isLiked ? 'text-pink-500' : 'text-gray-400 hover:text-pink-500'"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" clip-rule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
        </svg>
      </button>
      <img
        :src="product.image"
        :alt="product.title"
        class="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
      />
    </div>

    <!-- Content (Fixed height container) -->
    <div class="p-4 flex flex-col" style="height: calc(100% - 12rem)">
      <!-- Name and Price (Fixed height) -->
      <div class="flex justify-between items-start mb-3" style="min-height: 3.5rem">
        <h3 class="font-semibold text-gray-800 text-base flex-1 pr-3 line-clamp-2">
          {{ product.title }}
        </h3>
        <span class="font-bold text-gray-900 text-base whitespace-nowrap ml-3">
          Rp {{ product.price.toLocaleString('id-ID') }}
        </span>
      </div>

      <!-- Description (Fixed height) -->
      <p class="text-gray-600 text-sm mb-4 line-clamp-2" style="height: 2.75rem">
        {{ product.description }}
      </p>

      <!-- Rating + Reviews (Fixed position) -->
      <div class="flex items-center justify-between mb-4 mt-auto">
        <div class="flex items-center space-x-2">
          <div class="flex">
            <span v-for="i in 5" :key="i" class="text-yellow-400">
              <svg
                v-if="i <= product.rating"
                class="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <svg
                v-else
                class="w-4 h-4 text-gray-300"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
            </span>
          </div>
          <div class="flex items-center space-x-1">
            <svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" clip-rule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            <span class="text-gray-500 text-sm">{{ product.reviews }}</span>
          </div>
        </div>
      </div>

      <!-- Add to Cart Button (Enhanced with Cart State Management) -->
      <button
        @click="handleAddToCart"
        :disabled="isCartLoading || isProductInCart"
        :class="[
          'interactive-element px-3 py-2 text-sm font-medium rounded-full border transition-all duration-300 w-full',
          isProductInCart
            ? 'cursor-default'
            : isCartLoading
            ? 'border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'border-black text-black hover:bg-main hover:text-white hover:border-main',
        ]"
        :style="isProductInCart ? { 
          backgroundColor: '#1a3e3e', 
          borderColor: '#1a3e3e', 
          color: 'white' 
        } : {}"
      >
        <span v-if="isCartLoading" class="flex items-center justify-center">
          <svg
            class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Adding...
        </span>
        <span v-else-if="isProductInCart" class="flex items-center justify-center">
          <svg
            class="w-4 h-4 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
          In Cart
        </span>
        <span v-else>Add to Cart</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({ 
  product: {
    type: Object,
    required: true
  },
  isCartLoading: {
    type: Boolean,
    default: false
  },
  cartItems: {
    type: Array,
    default: () => []
  }
});

// Emits
const emit = defineEmits(['add-to-cart', 'toggle-like']);

// Local state for cart loading (if needed)
const localCartLoading = ref(false);

// Computed property to check if product is in cart
const isProductInCart = computed(() => {
  return props.cartItems.some(item => item.id === props.product.id);
});

// Enhanced add to cart handler
const handleAddToCart = async () => {
  if (!props.product || !props.product.id) {
    console.error('Invalid product data');
    return;
  }

  if (isProductInCart.value) {
    console.log(`${props.product.title} is already in cart`);
    return;
  }

  // Set local loading state
  localCartLoading.value = true;
  
  try {
    // Emit the add-to-cart event to parent component
    emit('add-to-cart', props.product);
    
    // Optional: Add a small delay for UX feedback
    await new Promise(resolve => setTimeout(resolve, 300));
    
  } catch (error) {
    console.error('Error adding to cart:', error);
  } finally {
    localCartLoading.value = false;
  }
};
</script>

<style scoped>
/* Main color classes */
.bg-main {
  background-color: #1a3e3e;
}

.border-main {
  border-color: #1a3e3e;
}

.hover\:bg-main:hover {
  background-color: #1a3e3e;
}

.hover\:border-main:hover {
  border-color: #1a3e3e;
}

/* Line clamp utility */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Loading animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Interactive elements */
.interactive-element {
  transition: all 0.3s ease;
}

.interactive-element:hover:not(:disabled) {
  transform: translateY(-1px);
}

.interactive-element:active:not(:disabled) {
  transform: translateY(0);
}

/* Disabled state */
.interactive-element:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

/* In Cart State - Override hover effects */
.in-cart-state {
  background-color: #1a3e3e !important;
  border-color: #1a3e3e !important;
  color: white !important;
}

.in-cart-state:hover {
  background-color: #1a3e3e !important;
  border-color: #1a3e3e !important;
  color: white !important;
  opacity: 0.9;
}

.in-cart-state:hover:not(:disabled) {
  transform: none !important;
}
</style>