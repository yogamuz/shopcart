<!-- PaymentPinModal.vue -->
<template>
  <!-- Modal Backdrop -->
  <div
    class="fixed inset-0 bg-black/30 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50 modal-backdrop"
    @click="$emit('cancel')"
  >
    <!-- Modal Content -->
    <div class="bg-white rounded-2xl shadow-xl max-w-md w-full" @click.stop>
      <!-- Modal Header -->
      <div class="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <!-- Wallet Icon -->
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            <div>
              <h2 class="text-xl font-bold">Shop Pay</h2>
              <p class="text-green-100 text-sm">Secure Payment</p>
            </div>
          </div>
          <button @click="$emit('cancel')" class="text-white hover:text-gray-200 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Modal Body -->
      <div class="p-6">
        <!-- Order Info -->
        <div v-if="order" class="bg-gray-50 rounded-lg p-4 mb-6">
          <div class="flex justify-between items-center mb-2">
            <span class="text-sm text-gray-600">Order:</span>
            <span class="font-medium">#{{ order.orderNumber || order.id }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-600">Total Amount:</span>
            <span class="text-xl font-bold text-green-600">{{ formatCurrency(order.totalAmount || order.total) }}</span>
          </div>
        </div>

        <!-- Balance Check Error -->
        <div v-if="balanceError" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div class="flex">
            <svg class="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 class="text-sm font-medium text-red-800">Insufficient Balance</h3>
              <p class="mt-1 text-sm text-red-700">{{ balanceError }}</p>
            </div>
          </div>
        </div>

        <!-- PIN Input Form -->
        <form @submit.prevent="handleSubmit">
          <div class="mb-6">
            <label for="pin" class="block text-sm font-semibold text-gray-700 mb-2"> Enter Your Shop Pay PIN </label>
            <input
              id="pin"
              ref="pinInput"
              v-model="pin"
              type="password"
              maxlength="6"
              placeholder="••••••"
              class="w-full p-4 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
              :class="{ 'border-red-500 focus:border-red-500 focus:ring-red-200': error }"
              :disabled="isProcessing || isValidating"
              @input="handlePinInput"
              @keydown="handleKeydown"
            />
            <div class="text-center mt-2">
              <div class="flex justify-center space-x-2">
                <div
                  v-for="i in 6"
                  :key="i"
                  class="w-3 h-3 rounded-full transition-colors"
                  :class="i <= pin.length ? 'bg-green-500' : 'bg-gray-300'"
                ></div>
              </div>
            </div>
            <div v-if="error" class="text-red-600 text-sm mt-2 text-center">
              {{ error }}
            </div>
            <p class="text-gray-500 text-sm mt-2 text-center">
              Enter your 6-digit Shop Pay PIN to complete the payment
            </p>
          </div>

          <!-- Action Buttons -->
          <div class="flex space-x-3">
            <button
              type="button"
              @click="$emit('cancel')"
              :disabled="isProcessing || isValidating"
              class="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="!canSubmit"
              class="flex-1 px-4 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div v-if="isProcessing || isValidating" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ isValidating ? "Validating..." : "Processing..." }}
              </div>
              <div v-else class="flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Pay {{ formatCurrency(order?.totalAmount || order?.total || 0) }}
              </div>
            </button>
          </div>
        </form>

        <!-- Security Notice -->
        <div class="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div class="flex items-start space-x-2">
            <svg
              class="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <div>
              <p class="text-blue-800 text-sm font-medium">Secure Payment</p>
              <p class="text-blue-700 text-xs mt-1">
                Your PIN is encrypted and secure. We never store your payment information.
              </p>
            </div>
          </div>
        </div>

        <!-- Forgot PIN Link -->
        <div class="mt-4 text-center">
          <button
            type="button"
            class="text-green-600 hover:text-green-700 text-sm font-medium"
            @click="handleForgotPin"
          >
            Forgot your PIN?
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { useWallet } from "@/composables/useWallet";

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["confirm", "cancel", "success", "error"]);

// Use wallet composable
const {
  validateOrderPayment,
  payOrder,
  checkSufficientBalance,
  isProcessingPayment,
  formatCurrency,
  hasError,
  error: walletError,
} = useWallet();

// Reactive data
const pin = ref("");
const error = ref("");
const balanceError = ref("");
const pinInput = ref(null);
const isValidating = ref(false);

// Computed
const canSubmit = computed(() => {
  return pin.value.length === 6 && !isProcessing.value && !isValidating.value && !balanceError.value;
});

const isProcessing = computed(() => {
  return isProcessingPayment.value;
});

// Methods
const handlePinInput = event => {
  // Only allow numbers
  const value = event.target.value.replace(/[^0-9]/g, "");
  pin.value = value.slice(0, 6);

  // Clear errors when user starts typing
  if (error.value) {
    error.value = "";
  }
  if (balanceError.value) {
    balanceError.value = "";
  }
};

const handleKeydown = event => {
  // Allow backspace, delete, tab, escape, enter
  if (
    [8, 9, 27, 13, 46].indexOf(event.keyCode) !== -1 ||
    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    (event.keyCode === 65 && event.ctrlKey === true) ||
    (event.keyCode === 67 && event.ctrlKey === true) ||
    (event.keyCode === 86 && event.ctrlKey === true) ||
    (event.keyCode === 88 && event.ctrlKey === true)
  ) {
    return;
  }

  // Ensure that it is a number and stop the keypress
  if ((event.shiftKey || event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
    event.preventDefault();
  }
};

const validatePayment = async () => {
  // Tambahkan flag untuk mencegah multiple calls
  if (isValidating.value) return false;

  try {
    isValidating.value = true;
    balanceError.value = "";
    error.value = "";

    ;

    // Check sufficient balance first
    const balanceCheck = await checkSufficientBalance(props.order.totalAmount || props.order.total);

    ;

    if (!balanceCheck.success) {
      ;
      balanceError.value = balanceCheck.error || "Insufficient balance for this transaction";
      return false;
    }

    // Log before order validation
    ;

    // Validate order payment
    const validation = await validateOrderPayment(props.order.id || props.order.orderNumber);

    ;

    if (!validation.success) {
      ;
      error.value = validation.error || "Order validation failed";
      return false;
    }

    ;
    return true;
  } catch (err) {
    console.error("❌ Payment validation error:", err);
    error.value = "Payment validation failed. Please try again.";
    return false;
  } finally {
    isValidating.value = false;
  }
};

const handleSubmit = async () => {
  if (!canSubmit.value) return;

  // Basic PIN validation
  if (pin.value.length !== 6) {
    error.value = "PIN must be 6 digits";
    return;
  }

  if (!/^\d{6}$/.test(pin.value)) {
    error.value = "PIN must contain only numbers";
    return;
  }

  try {
    // First validate the payment
    const isValid = await validatePayment();
    if (!isValid) return;

    // Process payment with API
    const orderId = props.order.id || props.order.orderNumber;
    const result = await payOrder(orderId, pin.value);

    if (result.success) {
      // Emit success event with payment result
      emit("success", {
        orderId: orderId,
        transactionId: result.data?.transaction?.id,
        amount: props.order.totalAmount || props.order.total,
        data: result.data,
      });

      // Emit confirm with the PIN directly - FIX: pass PIN as string, not object
      emit("confirm", pin.value);
    } else {
      // Handle payment errors - CHECK if order is already processed
      const errorMessage = getPaymentErrorMessage(result.error, result.code);

      // If order is already processed, treat as success
      if (result.error?.includes("already processed") || result.code === "PAYMENT_ALREADY_PROCESSED") {
        emit("success", {
          orderId: orderId,
          transactionId: result.data?.transaction?.id || "existing",
          amount: props.order.totalAmount || props.order.total,
          data: result.data,
        });

        emit("confirm", pin.value);
        return; // Exit early as success
      }

      error.value = errorMessage;

      emit("error", {
        error: result.error,
        code: result.code,
        message: errorMessage,
      });
    }
  } catch (err) {
    console.error("Payment error:", err);
    const errorMessage = "Payment failed. Please try again.";
    error.value = errorMessage;

    emit("error", {
      error: err.message,
      message: errorMessage,
    });
  }
};

const getPaymentErrorMessage = (error, code) => {
  // Map API error codes to user-friendly messages
  const errorMessages = {
    INSUFFICIENT_BALANCE: "Insufficient wallet balance",
    INVALID_PIN: "Invalid PIN. Please try again.",
    PIN_LOCKED: "PIN is temporarily locked. Please try again later.",
    ORDER_NOT_FOUND: "Order not found or already processed",
    ORDER_EXPIRED: "Order has expired",
    ORDER_CANCELLED: "Order has been cancelled",
    PAYMENT_ALREADY_PROCESSED: "Payment has already been processed",
    WALLET_INACTIVE: "Wallet is not active",
    NETWORK_ERROR: "Network error. Please check your connection.",
    SERVER_ERROR: "Server error. Please try again later.",
  };

  return errorMessages[code] || error || "Payment failed. Please try again.";
};

const handleForgotPin = () => {
  // In a real app, this would navigate to forgot PIN flow
  emit("forgot-pin");
  // For now, show alert
  alert("Please contact customer support to reset your Shop Pay PIN");
};

// Lifecycle
onMounted(async () => {
  // Focus the PIN input when modal opens
  await nextTick();
  if (pinInput.value) {
    pinInput.value.focus();
  }

  // Pre-validate order when modal opens
  await validatePayment();
});
</script>

<style scoped>
/* Modal backdrop animation */
.modal-backdrop {
  backdrop-filter: blur(4px);
  background-color: rgba(0, 0, 0, 0.6);
}

.fixed {
  animation: fadeIn 0.3s ease-out;
}

.bg-white {
  animation: slideIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* PIN input styling */
input[type="password"]::-ms-reveal {
  display: none;
}

/* Number input styling */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
