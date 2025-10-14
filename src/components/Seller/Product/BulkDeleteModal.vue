<!-- BulkDeleteModal.vue -->
<template>
  <div
    class="fixed inset-0 flex items-center justify-center p-4 z-50"
  >
    <div
      class="bg-white rounded-xl lg:rounded-2xl shadow-xl border border-gray-200 w-full max-w-lg"
    >
      <div class="px-8 py-6">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            Bulk Delete Confirmation
          </h3>

          <p class="text-gray-700 mb-6">
            Are you sure you want to delete 
            <span class="font-semibold text-gray-900">{{ productCount }} products</span>
            permanently? This action cannot be undone.
          </p>

          <div class="flex justify-center space-x-6">
            <button
              @click="$emit('cancel')"
              class="px-8 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              @click="$emit('confirm')"
              class="px-8 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete {{ productCount }} Products
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  productCount: {
    type: Number,
    required: true,
  },
});

defineEmits(['confirm', 'cancel']);
</script>