<!-- ProductActions.vue -->
<template>
  <div
    class="flex items-center space-x-1 xl:opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity flex-shrink-0"
  >
    <button
      @click="$emit('edit')"
      class="p-1.5 lg:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      title="Edit Product"
    >
      <svg
        class="w-3 h-3 lg:w-4 lg:h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
      </svg>
    </button>

    <button
      @click="$emit('toggle-status')"
      :class="[
        'p-1.5 lg:p-2 rounded-lg transition-colors',
        product.isActive
          ? 'text-gray-600 hover:bg-gray-50'
          : 'text-green-600 hover:bg-green-50',
      ]"
      :title="product.isActive ? 'Deactivate' : 'Activate'"
    >
      <svg
        v-if="product.isActive"
        class="w-3 h-3 lg:w-4 lg:h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
        />
      </svg>
      <svg
        v-else
        class="w-3 h-3 lg:w-4 lg:h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
        />
      </svg>
    </button>

    <button
      @click="$emit('delete')"
      class="p-1.5 lg:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete Product"
    >
      <svg
        class="w-3 h-3 lg:w-4 lg:h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  product: {
    type: Object,
    required: true,
  },
});

defineEmits(['edit', 'toggle-status', 'delete']);
</script>