<!-- CartSummary.vue - Updated for API integration -->
<template>
  <div class="p-6 bg-gray-50 border-t border-gray-200">
    <div class="flex flex-col md:flex-row justify-between gap-8">
      <!-- Coupon Code Section -->
      <div class="flex-1 animate-fade-in-left">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">
          Have a coupon?
        </h3>
        <div class="flex">
          <input
            :value="couponCode"
            @input="$emit('update:couponCode', $event.target.value)"
            type="text"
            placeholder="Enter coupon code"
            class="flex-grow px-4 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            @keyup.enter="appliedCoupon ? handleRemoveCoupon() : handleApplyCoupon()"
            :disabled="isCartLoading || isApplyingCoupon"
          />
          <button
            @click="appliedCoupon ? handleRemoveCoupon() : handleApplyCoupon()"
            :class="[
              'px-6 py-2 text-white font-medium rounded-r-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed',
              appliedCoupon 
                ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700'
            ]"
            :disabled="(!appliedCoupon && !couponCode.trim()) || isCartLoading || isApplyingCoupon"
          >
            <span v-if="isApplyingCoupon">...</span>
            <span v-else>{{ appliedCoupon ? 'Remove' : 'Apply' }}</span>
          </button>
        </div>

        <!-- Coupon Success Message -->
        <div v-if="couponSuccessMessage" class="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
          <p class="text-sm text-green-600">{{ couponSuccessMessage }}</p>
        </div>

        <!-- Applied Coupon Display -->
        <div v-if="appliedCoupon" class="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
          <div class="text-sm text-green-600">
            ✅ Coupon "{{ appliedCoupon.code }}" applied!
            {{ appliedCoupon.discount }}% off
            <span v-if="appliedCoupon.category">
              (for {{ appliedCoupon.category }} category)
            </span>
            <span v-if="appliedCoupon.maxDiscount" class="block text-xs text-orange-600">
              Maximum discount: {{ formatCurrency(appliedCoupon.maxDiscount) }}
            </span>
          </div>
        </div>

        <!-- Coupon Error Display -->
        <div v-if="couponError" class="mt-2 p-2 bg-red-50 rounded-lg border border-red-200">
          <p class="text-sm text-red-600">{{ couponError }}</p>
        </div>
      </div>

      <!-- Order Summary Section -->
      <div class="flex-1 animate-fade-in-right">
        <h3 class="text-lg font-semibold text-gray-800 mb-3">
          Order Summary
        </h3>
        <div class="space-y-3">
          <div class="flex justify-between">
            <span class="text-gray-600">Subtotal ({{ cartCount }} items)</span>
            <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
          </div>
          
          <div v-if="appliedCoupon && discountAmount > 0" class="flex justify-between text-green-600">
            <span>
              Discount ({{ appliedCoupon.discount }}%
              <span v-if="appliedCoupon.category">- {{ appliedCoupon.category }}</span>)
            </span>
            <span>-{{ formatCurrency(discountAmount) }}</span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-gray-600">Shipping</span>
            <span class="font-medium">
              {{ shippingCost > 0 ? formatCurrency(shippingCost) : "Free" }}
            </span>
          </div>
          
          <div class="border-t border-gray-200 pt-3 flex justify-between text-lg font-bold text-gray-800">
            <span>Total</span>
            <span>{{ formatCurrency(calculatedTotal) }}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="space-y-3 mt-6">
          <button
            @click="handleProceedToCheckout"
            class="w-full bg-gradient-to-r from-blue-600 to-cyan-700 hover:from-blue-700 hover:to-cyan-800 text-white py-3 px-6 rounded-lg font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            :disabled="isCartLoading || cartCount === 0"
          >
            <span v-if="isCartLoading">Processing...</span>
            <span v-else>Proceed to Checkout</span>
          </button>

          <button
            @click="$emit('confirmClearCart')"
            class="w-full border border-gray-300 hover:border-red-300 text-gray-700 hover:text-red-600 py-2 px-6 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isCartLoading || cartCount === 0"
          >
            Clear Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  couponCode: {
    type: String,
    required: true
  },
  appliedCoupon: {
    type: Object,
    default: null
  },
  cartCount: {
    type: Number,
    required: true
  },
  subtotal: {
    type: Number,
    required: true
  },
  discountAmount: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    required: true
  },
  tax: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  isCartLoading: {
    type: Boolean,
    default: false
  },
  formatCurrency: {
    type: Function,
    required: true
  }
});

const emit = defineEmits([
  'update:couponCode',
  'applyCoupon',
  'removeCoupon',
  'proceedToCheckout',
  'confirmClearCart'
]);

// Local state for coupon operations
const isApplyingCoupon = ref(false);
const couponError = ref('');
const couponSuccessMessage = ref('');

// Computed for accurate total calculation
const calculatedTotal = computed(() => {
  const baseSubtotal = props.subtotal || 0;
  const discount = props.discountAmount || 0;
  const shipping = props.shippingCost || 0;
  const taxAmount = 0; // tax calculation removed as per original
  
  // Total = Subtotal - Discount + Shipping
  const total = baseSubtotal - discount + shipping + taxAmount;
  return Math.max(0, total);
});

// Handle coupon application - using API
const handleApplyCoupon = async () => {
  if (!props.couponCode.trim()) {
    couponError.value = 'Please enter a coupon code';
    couponSuccessMessage.value = '';
    return;
  }

  isApplyingCoupon.value = true;
  couponError.value = '';
  couponSuccessMessage.value = '';

  try {
    // Emit to parent component which handles API coupon logic
    await emit('applyCoupon');
    
    // Show success message after successful application
    setTimeout(() => {
      if (props.appliedCoupon) {
        couponSuccessMessage.value = 'Coupon applied successfully!';
        // Hide success message after 3 seconds
        setTimeout(() => {
          couponSuccessMessage.value = '';
        }, 3000);
      }
    }, 100);
  } catch (error) {
    console.error('Failed to apply coupon:', error);
    couponError.value = error.message || 'Failed to apply coupon';
    couponSuccessMessage.value = '';
  } finally {
    isApplyingCoupon.value = false;
  }
};

// Handle coupon removal - using API
const handleRemoveCoupon = async () => {
  couponError.value = '';
  couponSuccessMessage.value = '';
  
  try {
    // Emit to parent component which handles API coupon removal
    await emit('removeCoupon');
  } catch (error) {
    console.error('Failed to remove coupon:', error);
    couponError.value = 'Failed to remove coupon';
  }
};

// Handle checkout - using API data
const handleProceedToCheckout = async () => {
  if (props.cartCount === 0) {
    return;
  }

  if (props.isCartLoading) {
    return;
  }

  try {
    console.log('🛒 Proceeding to checkout with API data...');
    
    // Directly emit to show checkout modal
    emit('proceedToCheckout');
  } catch (error) {
    console.error('❌ Failed to proceed to checkout:', error);
    
    // Show error to user
    couponError.value = 'Failed to proceed to checkout. Please try again.';
    setTimeout(() => {
      couponError.value = '';
    }, 5000);
  }
};
</script>

<style scoped>
.animate-fade-in-left {
  animation: fadeInLeft 0.6s ease-out forwards;
}

.animate-fade-in-right {
  animation: fadeInRight 0.6s ease-out forwards;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>