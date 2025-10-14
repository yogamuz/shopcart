<!-- src/components/MiniCart.vue -->
<template>
  <div v-if="cartCount > 0" class="fixed bottom-4 right-4 z-50">
    <!-- Cart Summary (Clickable) -->
    <div
      @click="toggleCartVisibility"
      class="bg-dark-green text-white px-4 py-2 rounded-full shadow-lg cursor-pointer hover:bg-opacity-90 transition-all duration-300 flex items-center gap-2"
    >
      <span class="text-sm font-semibold">
        Cart: {{ cartCount }} items ({{ formatCurrency(cartTotal) }})
      </span>
      <!-- Arrow Icon -->
      <svg
        :class="[
          'w-4 h-4 transition-transform duration-300',
          isCartOpen ? 'rotate-180' : '',
        ]"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </div>

    <!-- Cart Items List (Collapsible) -->
    <transition name="slide-up">
      <div
        v-if="isCartOpen"
        class="mt-2 bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-y-auto"
      >
        <!-- Cart Header -->
        <div class="p-4 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-800">Shopping Cart</h3>
        </div>

        <!-- Cart Items -->
        <div class="p-4 space-y-3">
          <div
            v-for="item in cartItems"
            :key="item.id"
            class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
          >
            <!-- Product Image -->
            <img
              :src="item.image"
              :alt="item.title"
              class="w-12 h-12 object-cover rounded-md flex-shrink-0"
            />

            <!-- Product Info -->
            <div class="flex-1 min-w-0">
              <h4 class="text-sm font-medium text-gray-800 truncate">
                {{ item.title }}
              </h4>
              <p class="text-xs text-gray-500">
                Rp{{ item.price.toLocaleString("id-ID") }}
              </p>
            </div>

            <!-- Quantity Controls -->
            <div class="flex items-center gap-2 flex-shrink-0">
              <!-- Decrease Button -->
              <button
                @click="$emit('decrease-quantity', item.id)"
                :disabled="item.quantity <= 1"
                class="w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-600 rounded-full hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <svg
                  class="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <!-- Quantity Display -->
              <span
                class="text-sm font-medium text-gray-800 w-6 text-center"
              >
                {{ item.quantity }}
              </span>

              <!-- Increase Button -->
              <button
                @click="$emit('increase-quantity', item.id)"
                class="w-6 h-6 flex items-center justify-center bg-dark-green text-white rounded-full hover:bg-opacity-80 transition-colors duration-200"
              >
                <svg
                  class="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <!-- Remove Button -->
              <button
                @click="$emit('remove-from-cart', item.id)"
                class="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200 ml-2"
              >
                <svg
                  class="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Cart Footer -->
        <div class="p-4 border-t border-gray-200 bg-gray-50">
          <div class="flex justify-between items-center mb-3">
            <span class="text-sm font-medium text-gray-600">Total:</span>
            <span class="text-lg font-bold text-gray-800">
              {{ formatCurrency(cartTotal) }}
            </span>
          </div>

          <div class="flex gap-2">
            <button
              @click="$emit('clear-cart')"
              class="flex-1 px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium cursor-pointer"
            >
              Clear Cart
            </button>

            <button 
              @click="$emit('go-to-cart')"
              class="flex-1 px-3 py-2 bg-dark-green text-white rounded-lg hover:bg-opacity-90 transition-colors duration-200 text-sm font-medium cursor-pointer"
            >
              Go to Cart
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  cartItems: {
    type: Array,
    required: true,
    default: () => []
  },
  cartCount: {
    type: Number,
    default: 0
  },
  cartTotal: {
    type: Number,
    default: 0
  },
  formatCurrency: {
    type: Function,
    required: true
  }
});

const emit = defineEmits([
  'increase-quantity',
  'decrease-quantity',
  'remove-from-cart',
  'clear-cart',
  'go-to-cart'
]);

const isCartOpen = ref(false);

const toggleCartVisibility = () => {
  isCartOpen.value = !isCartOpen.value;
};
</script>

<style scoped>
.bg-dark-green {
  background-color: #1a3e3e;
}

.slide-up-enter-active {
  transition: all 0.3s ease-out;
}

.slide-up-leave-active {
  transition: all 0.3s ease-in;
}

.slide-up-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>