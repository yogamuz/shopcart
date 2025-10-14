<template>
  <div>
    <div class="login-icon">
      <svg
        class="w-16 h-16 text-blue-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        ></path>
      </svg>
    </div>

    <p class="message">
      Login to add items to your cart and continue shopping.
    </p>

    <!-- Login Form -->
    <form @submit.prevent="$emit('handleLogin')" class="space-y-4">
      <!-- Email Field -->
      <div class="form-field">
        <input
          v-model="localLoginForm.email"
          type="text"
          placeholder="Username atau Email"
          class="form-input"
          required
          :disabled="formLoading"
          maxlength="50"
        />
      </div>

      <!-- Password Field -->
      <div class="form-field">
        <input
          v-model="localLoginForm.password"
          type="password"
          placeholder="Password"
          class="form-input"
          required
          :disabled="formLoading"
        />
      </div>

      <!-- Error Message -->
      <div v-if="formError" class="error-message">
        {{ formError }}
      </div>

      <!-- Success Message -->
      <div v-if="formSuccess" class="success-message">
        {{ formSuccess }}
      </div>

      <!-- Login Button -->
      <button
        type="submit"
        class="btn-login"
        :disabled="formLoading || !isLoginFormValid"
      >
        <svg
          v-if="formLoading"
          class="animate-spin w-5 h-5 mr-2"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <svg
          v-else
          class="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          ></path>
        </svg>
        {{ formLoading ? "Logging in..." : "Login Now" }}
      </button>
    </form>

    <!-- Forgot Password Link -->
    <div class="forgot-password">
      <button @click="$emit('switchToForgotPassword')" class="forgot-link">
        Forgot your password?
      </button>
    </div>

    <!-- Switch to Register -->
    <div class="switch-mode">
      <p>
        Don't have an account?
        <button @click="$emit('switchToRegister')" class="switch-link">
          Create Account
        </button>
      </p>
    </div>

    <!-- Continue Shopping -->
    <div class="continue-shopping">
      <button @click="$emit('close')" class="btn-continue">
        Continue Shopping
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from "vue";

const props = defineProps({
  loginForm: {
    type: Object,
    required: true,
  },
  formLoading: {
    type: Boolean,
    default: false,
  },
  formError: {
    type: String,
    default: null,
  },
  formSuccess: {
    type: String,
    default: null,
  },
  isLoginFormValid: {
    type: Boolean,
    default: false,
  },
});

defineEmits([
  "handleLogin",
  "switchToRegister",
  "switchToForgotPassword",
  "close",
]);

// Create reactive local copy for v-model
const localLoginForm = computed({
  get: () => props.loginForm,
  set: () => {}, // Handled by parent
});
</script>

<style scoped>
@import "../../assets/styles/modal-shared.css";
</style>
