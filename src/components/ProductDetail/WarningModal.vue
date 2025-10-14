<!-- WarningModal.vue -->
<template>
  <transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 transform translate-y-2"
    enter-to-class="opacity-100 transform translate-y-0"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 transform translate-y-0"
    leave-to-class="opacity-0 transform translate-y-2"
  >
    <div
      v-if="show"
      class="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4"
    >
      <div
        class="bg-amber-50 border border-amber-200 rounded-lg shadow-lg overflow-hidden"
      >
        <div class="flex items-center p-4">
          <!-- Warning Icon -->
          <div class="flex-shrink-0 mr-3">
            <div class="w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
              <svg class="w-4 h-4 text-white font-bold" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 012 0v3a1 1 0 11-2 0V9zm1-4a1 1 0 100 2 1 1 0 000-2z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
          
          <!-- Content -->
          <div class="flex-grow">
            <h4 class="text-amber-800 font-medium text-sm">Warning</h4>
            <p class="text-amber-700 text-sm mt-1">
              {{ message }}
            </p>
          </div>
          
          <!-- Close Button -->
          <button
            @click="closeModal"
            class="flex-shrink-0 ml-3 text-amber-500 hover:text-amber-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { watch, onUnmounted } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  message: {
    type: String,
    default: 'This is a warning message'
  },
  autoClose: {
    type: Boolean,
    default: true
  },
  duration: {
    type: Number,
    default: 3000 // 3 detik
  }
});

const emit = defineEmits(['close']);

let timeoutId = null;

const closeModal = () => {
  emit('close');
  clearTimeout(timeoutId);
};

// Watch untuk show prop
watch(() => props.show, (newValue) => {
  if (newValue && props.autoClose) {
    // Clear timeout sebelumnya jika ada
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    // Set timeout baru
    timeoutId = setTimeout(() => {
      closeModal();
    }, props.duration);
  } else if (!newValue && timeoutId) {
    // Clear timeout jika modal ditutup manual
    clearTimeout(timeoutId);
  }
});

// Cleanup timeout saat component di-unmount
onUnmounted(() => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }
});
</script>