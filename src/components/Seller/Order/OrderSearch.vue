<!-- OrderSearch.vue - Dedicated Search Component for Orders -->
<template>
  <div class="order-search-container">
    <div class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          class="h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="2" 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="searchPlaceholder"
        class="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
        @input="handleSearchInput"
        @keydown.enter="handleSearchSubmit"
      />
      <div v-if="searchQuery" class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <button
          @click="clearSearch"
          class="text-gray-400 hover:text-gray-600 focus:outline-none"
          type="button"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits, defineProps, onMounted, onUnmounted } from 'vue';

// Props
const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search orders by customer or product name'
  },
  modelValue: {
    type: String,
    default: ''
  }
});

// Emits
const emit = defineEmits(['update:modelValue', 'search', 'clear']);

// Reactive state
const searchQuery = ref(props.modelValue || '');
const searchPlaceholder = ref(props.placeholder);
let debounceTimeout = null; // TAMBAHKAN INI

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  searchQuery.value = newValue || '';
});

// Watch for placeholder changes
watch(() => props.placeholder, (newValue) => {
  searchPlaceholder.value = newValue;
});

// Methods
const handleSearchInput = () => {
  emit('update:modelValue', searchQuery.value);
  
  // Clear existing timeout - TAMBAHKAN INI
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  
  // Set new timeout for 800ms delay - TAMBAHKAN INI
  debounceTimeout = setTimeout(() => {
    emit('search', searchQuery.value);
  }, 800);
};

const handleSearchSubmit = () => {
  // Clear timeout untuk immediate search - TAMBAHKAN INI
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  emit('search', searchQuery.value);
};

const clearSearch = () => {
  // Clear timeout - TAMBAHKAN INI
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  
  searchQuery.value = '';
  emit('update:modelValue', '');
  emit('clear');
  emit('search', '');
};

// Cleanup timeout on unmount - TAMBAHKAN INI
onUnmounted(() => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
});
</script>

<style scoped>
.order-search-container {
  width: 100%;
  max-width: 400px;
}

@media (max-width: 640px) {
  .order-search-container {
    max-width: none;
  }
}

/* Focus states */
input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Smooth transitions */
input {
  transition: all 0.2s ease-in-out;
}

button {
  transition: color 0.2s ease-in-out;
}
</style>