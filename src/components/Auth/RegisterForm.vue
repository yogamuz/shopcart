<!-- registerformvue -->
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
          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
        ></path>
      </svg>
    </div>

    <p class="message">Create your account to start shopping.</p>

    <!-- Register Form -->
    <form @submit.prevent="$emit('handleRegister')" class="space-y-4">
      <!-- Username Field -->
      <div class="form-field">
        <input
          v-model="localRegisterForm.username"
          @input="$emit('handleUsernameInput', localRegisterForm.username)"
          type="text"
          placeholder="Username"
          class="form-input"
          required
          :disabled="formLoading"
        />

        <!-- Username availability indicator -->
        <div
          v-if="usernameAvailability.checking"
          class="availability-indicator checking"
        >
          <svg
            class="animate-spin w-4 h-4 mr-2"
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
          Checking availability...
        </div>
        <div
          v-else-if="usernameAvailability.available === true"
          class="availability-indicator available"
        >
          ✓ {{ usernameAvailability.message }}
        </div>
        <div
          v-else-if="usernameAvailability.available === false"
          class="availability-indicator unavailable"
        >
          ✗ {{ usernameAvailability.message }}
        </div>
      </div>

      <!-- Email Field -->
      <div class="form-field">
        <input
          v-model="localRegisterForm.email"
          type="email"
          placeholder="Email address"
          class="form-input"
          required
          :disabled="formLoading"
        />
      </div>

      <!-- Password Field -->
      <div class="form-field">
        <input
          v-model="localRegisterForm.password"
          type="password"
          placeholder="Password"
          class="form-input"
          required
          :disabled="formLoading"
        />
      </div>

      <!-- Confirm Password Field -->
      <div class="form-field">
        <input
          v-model="localRegisterForm.confirmPassword"
          type="password"
          placeholder="Confirm Password"
          class="form-input"
          required
          :disabled="formLoading"
        />
      </div>

      <!-- Password Match Indicator -->
      <div
        v-if="localRegisterForm.password && localRegisterForm.confirmPassword"
        class="password-match"
      >
        <div v-if="passwordsMatch" class="success-message text-sm">
          ✓ Passwords match
        </div>
        <div v-else class="error-message text-sm">✗ Passwords don't match</div>
      </div>

      <!-- Terms Checkbox -->
      <div class="terms-checkbox">
        <label class="flex items-center space-x-2">
          <input
            v-model="localRegisterForm.agreeToTerms"
            type="checkbox"
            class="form-checkbox"
            :disabled="formLoading"
          />
          <span class="text-sm text-gray-600"
            >I agree to the Terms & Conditions</span
          >
        </label>
      </div>

      <!-- Error Message -->
      <div v-if="formError" class="error-message">
        {{ formError }}
      </div>

      <!-- Success Message -->
      <div v-if="formSuccess" class="success-message">
        {{ formSuccess }}
      </div>

      <!-- Register Button -->
      <button
        type="submit"
        class="btn-login"
        :disabled="formLoading || !isRegisterFormValid"
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
            d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
          ></path>
        </svg>
        {{ formLoading ? "Creating Account..." : "Create Account" }}
      </button>
    </form>

    <!-- Switch to Login -->
    <div class="switch-mode">
      <p>
        Already have an account?
        <button @click="$emit('switchToLogin')" class="switch-link">
          Login Here
        </button>
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  registerForm: {
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
  isRegisterFormValid: {
    type: Boolean,
    default: false,
  },
  passwordsMatch: {
    type: Boolean,
    default: false,
  },
  usernameAvailability: {
    type: Object,
    default: () => ({
      checking: false,
      available: null,
      message: "",
    }),
  },
});

defineEmits(["handleRegister", "switchToLogin", "handleUsernameInput"]);

// Create reactive local copy for v-model
const localRegisterForm = computed({
  get: () => props.registerForm,
  set: () => {}, // Handled by parent
});
</script>

<style scoped>
@import "../../assets/styles/modal-shared.css";

.password-match {
  text-align: center;
}

.terms-checkbox {
  text-align: left;
}

.form-checkbox {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border: 2px solid #e5e7eb;
}

/* Utility classes for layout */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.space-x-2 > * + * {
  margin-left: 0.5rem;
}
.availability-indicator {
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
}

.availability-indicator.checking {
  color: #6b7280;
}

.availability-indicator.available {
  color: #10b981;
}

.availability-indicator.unavailable {
  color: #ef4444;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
