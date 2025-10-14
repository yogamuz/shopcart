<!-- ShipOrderModal.vue -->
<template>
  <div v-if="order" class="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center z-50 modal-backdrop">
    <div class="bg-white rounded-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900">Ship Order #{{ order.orderNumber }}</h2>
          <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="p-6">
        <!-- Order Summary -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 class="font-medium text-gray-900 mb-2">Order Summary</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Customer:</span>
              <span class="font-medium">{{ order.customer.username }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Items:</span>
              <span class="font-medium">{{ order.totalItems }} item{{ order.totalItems > 1 ? 's' : '' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Total:</span>
              <span class="font-medium">{{ formatCurrency(order.totalAmount) }}</span>
            </div>
          </div>
        </div>

        <!-- Shipping Form -->
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Courier Selection -->
          <div>
            <label for="courier" class="block text-sm font-medium text-gray-700 mb-2">
              Courier Service
            </label>
            <select
              id="courier"
              v-model="formData.courier"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
              required
            >
              <option value="">Select courier</option>
              <option value="JNE">JNE</option>
              <option value="J&T">J&T Express</option>
              <option value="SiCepat">SiCepat</option>
              <option value="Anteraja">AnterAja</option>
              <option value="Pos Indonesia">Pos Indonesia</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <!-- Custom Courier Input (if Other is selected) -->
          <div v-if="formData.courier === 'Other'">
            <label for="customCourier" class="block text-sm font-medium text-gray-700 mb-2">
              Courier Name
            </label>
            <input
              id="customCourier"
              v-model="formData.customCourier"
              type="text"
              placeholder="Enter courier name"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
              required
            />
          </div>

          <!-- Estimated Delivery Date -->
          <div>
            <label for="estimatedDelivery" class="block text-sm font-medium text-gray-700 mb-2">
              Estimated Delivery Date (Optional)
            </label>
            <input
              id="estimatedDelivery"
              v-model="formData.estimatedDelivery"
              type="date"
              :min="minDeliveryDate"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
            />
          </div>

          <!-- Tracking Number (Optional - will be auto-generated if empty) -->
          <div>
            <label for="trackingNumber" class="block text-sm font-medium text-gray-700 mb-2">
              Tracking Number (Optional)
            </label>
            <input
              id="trackingNumber"
              v-model="formData.trackingNumber"
              type="text"
              placeholder="Leave empty to auto-generate"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:border-transparent"
            />
            <p class="mt-1 text-xs text-gray-500">
              If left empty, a tracking number will be automatically generated
            </p>
          </div>

          <!-- Auto-delivery Notice -->
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="flex items-start">
              <svg class="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              <div class="text-sm">
                <p class="font-medium text-blue-800 mb-1">Auto-delivery Notice</p>
                <p class="text-blue-700">
                  This order will be automatically marked as delivered after 30 seconds for demo purposes. 
                  Customer payments will be released after delivery confirmation.
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-[#6C5CE7] text-white rounded-lg hover:bg-[#5A4FCF] focus:outline-none focus:ring-2 focus:ring-[#6C5CE7] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span v-if="isSubmitting">Shipping...</span>
              <span v-else>Ship Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'confirm'])

// Form data
const formData = ref({
  courier: '',
  customCourier: '',
  estimatedDelivery: '',
  trackingNumber: ''
})

const isSubmitting = ref(false)

// Computed
const minDeliveryDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

// Methods
const handleSubmit = async () => {
  try {
    isSubmitting.value = true

    // Prepare shipping details
    const shippingDetails = {
      courier: formData.value.courier === 'Other' ? formData.value.customCourier : formData.value.courier,
      estimatedDelivery: formData.value.estimatedDelivery || null
    }

    // Add tracking number if provided
    if (formData.value.trackingNumber.trim()) {
      shippingDetails.trackingNumber = formData.value.trackingNumber.trim()
    }

    // Emit confirm event with shipping details
    emit('confirm', shippingDetails)
  } catch (error) {
    console.error('Error submitting shipping form:', error)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-backdrop {
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.6);
}
</style>