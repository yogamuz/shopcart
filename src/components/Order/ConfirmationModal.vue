<!-- ConfirmationModal.vue -->
<template>
  <!-- Modal Backdrop -->
  <div
    class="fixed inset-0 bg-black/30 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50 modal-backdrop"
    @click="$emit('cancel')"
  >
    <!-- Modal Content -->
    <div
      class="bg-white rounded-2xl shadow-xl max-w-md w-full"
      @click.stop
    >
      <!-- Modal Header -->
      <div class="p-6 pb-4">
        <div class="flex items-center space-x-4">
          <!-- Icon based on type -->
          <div
            :class="[
              'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
              iconClasses
            ]"
          >
            <component :is="iconComponent" class="w-6 h-6" />
          </div>
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ title }}
            </h3>
          </div>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="px-6 pb-6">
        <p class="text-gray-700 mb-6">
          {{ message }}
        </p>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <button
            @click="$emit('cancel')"
            :disabled="isProcessing"
            class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            @click="$emit('confirm')"
            :disabled="isProcessing"
            :class="[
              'flex-1 px-4 py-3 font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
              buttonClasses
            ]"
          >
            <div v-if="isProcessing" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
            <span v-else>{{ confirmText }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
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
    default: 'Confirm'
  },
  type: {
    type: String,
    default: 'info',
    validator: value => ['info', 'success', 'warning', 'error', 'danger'].includes(value)
  },
  isProcessing: {
    type: Boolean,
    default: false
  }
})

defineEmits(['confirm', 'cancel'])

// Computed properties for styling based on type
const iconComponent = computed(() => {
  const icons = {
    info: 'InfoIcon',
    success: 'CheckIcon',
    warning: 'ExclamationIcon',
    error: 'XCircleIcon',
    danger: 'ExclamationTriangleIcon'
  }
  return icons[props.type] || 'InfoIcon'
})

const iconClasses = computed(() => {
  const classes = {
    info: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-amber-100 text-amber-600',
    error: 'bg-red-100 text-red-600',
    danger: 'bg-red-100 text-red-600'
  }
  return classes[props.type] || classes.info
})

const buttonClasses = computed(() => {
  const classes = {
    info: 'bg-blue-600 text-white hover:bg-blue-700',
    success: 'bg-green-600 text-white hover:bg-green-700',
    warning: 'bg-amber-600 text-white hover:bg-amber-700',
    error: 'bg-red-600 text-white hover:bg-red-700',
    danger: 'bg-red-600 text-white hover:bg-red-700'
  }
  return classes[props.type] || classes.info
})

// Icon components
const InfoIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}

const CheckIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
  `
}

const ExclamationIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-7 2l1.5-1.5m0 0L12 19l6.5-6.5m-13 0L12 5l6.5 6.5" />
    </svg>
  `
}

const XCircleIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  `
}

const ExclamationTriangleIcon = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-7 2l1.5-1.5m0 0L12 19l6.5-6.5m-13 0L12 5l6.5 6.5" />
    </svg>
  `
}
</script>


<style scoped>
.modal-backdrop {
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.6);
}
/* Modal backdrop animation */
.fixed {
  animation: fadeIn 0.3s ease-out;
}

.bg-white {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>