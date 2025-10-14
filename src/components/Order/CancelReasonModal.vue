<!-- CancelReasonModal.vue -->
<template>
  <div v-if="show && order" class="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50">
    <div class="bg-white rounded-xl max-w-md w-full mx-4 p-6" @click.stop>
      <div class="mb-4">
        <h3 class="text-lg font-semibold text-gray-900">Cancel Order</h3>
        <p class="text-sm text-gray-600 mt-1">Order #{{ order.orderNumber }}</p>
        <!-- Add cancellation status notification -->
        <div
          v-if="order.status === 'cancellation_requested'"
          class="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg"
        >
          <div class="flex items-center">
            <svg class="w-4 h-4 text-orange-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span class="text-xs text-orange-700 font-medium">Waiting for seller approval</span>
          </div>
        </div>
      </div>

      <div class="mb-6">
        <p class="text-sm text-gray-700 mb-4">Please select a reason for cancelling this order:</p>

        <div class="space-y-3">
          <label
            v-for="reason in cancelReasons"
            :key="reason.id"
            class="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            :class="selectedReason === reason.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'"
          >
            <div class="flex items-center">
              <div class="relative">
                <input type="radio" :value="reason.value" v-model="selectedReason" class="sr-only" />
                <div
                  class="w-4 h-4 border-2 rounded-full flex items-center justify-center transition-colors"
                  :class="selectedReason === reason.value ? 'border-blue-500 bg-blue-500' : 'border-gray-300'"
                >
                  <div v-if="selectedReason === reason.value" class="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <span class="ml-3 text-sm text-gray-700">{{ reason.label }}</span>
            </div>
          </label>
        </div>
      </div>

      <div class="flex space-x-3">
        <button
          @click="handleCancel"
          class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          @click="handleConfirm"
          :disabled="!selectedReason || isProcessing"
          class="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span v-if="isProcessing">Processing...</span>
          <span v-else>Confirm Cancel</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Object,
    default: null,
  },
  isProcessing: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "confirm"]);

const selectedReason = ref("");

const cancelReasons = [
  { id: 1, label: "Berubah pikiran", value: "changed_mind" },
  { id: 2, label: "Ingin mengubah alamat pengiriman", value: "change_address" },
  { id: 3, label: "Penjual tidak membalas chat", value: "no_seller_response" },
];

// Reset selected reason when modal opens
watch(
  () => props.show,
  newVal => {
    if (newVal) {
      selectedReason.value = "";
    }
  }
);

const handleCancel = () => {
  selectedReason.value = "";
  emit("close");
};

const handleConfirm = () => {
  if (!selectedReason.value) return;

  const reasonLabel = cancelReasons.find(r => r.value === selectedReason.value)?.label;
  
  // ✅ FIX: Emit dengan benar - reason sebagai string, bukan reasonValue
  emit("confirm", {
    orderId: props.order.id,
    reason: reasonLabel,  // ← GANTI dari reasonValue ke reason
  });
};
</script>