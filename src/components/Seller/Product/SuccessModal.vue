<!-- successmodalvue -->
<template>
  <div class="fixed inset-0 flex items-center justify-center p-4 z-50 ">
    <div
      class="bg-white rounded-xl lg:rounded-2xl shadow-lg w-full max-w-md transform transition-all duration-300 ease-out scale-100 opacity-100"
    >
      <div class="p-8 text-center">
        <!-- Success Icon -->
        <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
          <svg
            class="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        
        <!-- Success Message -->
        <h3 class="text-lg font-semibold text-gray-900 mb-2">
          {{ title }}
        </h3>
        <p class="text-sm text-gray-600 mb-6">
          {{ description }}
        </p>
        
        <!-- Close Button -->
        <button
          @click="$emit('close')"
          class="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

defineEmits(['close']);
</script>