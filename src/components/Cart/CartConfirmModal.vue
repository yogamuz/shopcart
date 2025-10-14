<!-- CartConfirmModal.vue - Revised -->
<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="handleCancel"
    >
      <div 
        class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl transform transition-all"
        :class="show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'"
      >
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
          <button
            @click="handleCancel"
            class="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Message -->
        <p class="text-gray-600 mb-6 leading-relaxed">{{ message }}</p>

        <!-- Actions -->
        <div class="flex flex-col-reverse sm:flex-row sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0">
          <button
            @click="handleCancel"
            class="flex-1 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 py-2.5 px-4 rounded-lg transition-all font-medium"
            :disabled="isProcessing"
          >
            Cancel
          </button>
          <button
            @click="handleConfirm"
            class="flex-1 py-2.5 px-4 rounded-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            :class="getConfirmButtonClasses"
            :disabled="isProcessing"
          >
            <span v-if="isProcessing" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
            <span v-else>{{ confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    required: true
  },
  onConfirm: {
    type: Function,
    required: true
  },
  onCancel: {
    type: Function,
    required: true
  },
  type: {
    type: String,
    default: 'danger', // 'danger', 'warning', 'info'
    validator: (value) => ['danger', 'warning', 'info'].includes(value)
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
});

// Computed for dynamic button styling
const getConfirmButtonClasses = computed(() => {
  const baseClasses = 'focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  switch (props.type) {
    case 'danger':
      return `${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white`;
    case 'warning':
      return `${baseClasses} bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white`;
    case 'info':
      return `${baseClasses} bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white`;
    default:
      return `${baseClasses} bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white`;
  }
});

// Handle actions with async support
const handleConfirm = async () => {
  try {
    if (typeof props.onConfirm === 'function') {
      await props.onConfirm();
    }
  } catch (error) {
    console.error('Confirm action error:', error);
    // Don't close modal if there's an error, let parent handle it
  }
};

const handleCancel = () => {
  if (typeof props.onCancel === 'function') {
    props.onCancel();
  }
};

// Handle escape key
const handleEscape = (event) => {
  if (event.key === 'Escape' && props.show && !props.isProcessing) {
    handleCancel();
  }
};

// Watch for show prop to add/remove event listeners
watch(() => props.show, (newShow) => {
  if (newShow) {
    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  } else {
    document.removeEventListener('keydown', handleEscape);
    document.body.style.overflow = '';
  }
});

// Cleanup on unmount
import { onUnmounted } from 'vue';
onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* Transition classes for enter/leave animations */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .bg-white,
.modal-leave-active .bg-white {
  transition: transform 0.3s ease;
}

.modal-enter-from .bg-white,
.modal-leave-to .bg-white {
  transform: scale(0.95);
}
</style>