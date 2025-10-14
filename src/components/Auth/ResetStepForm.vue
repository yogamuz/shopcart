<template>
  <form @submit.prevent="$emit('handleResetPassword')" class="space-y-4">
    <p class="text-sm text-gray-600 mb-4">
      Enter the OTP code sent to {{ localForgotForm.email }} and your new password.
    </p>

    <!-- OTP Field -->
    <div class="form-field">
      <input
        v-model="localForgotForm.otpCode"
        type="text"
        placeholder="Enter 6-digit OTP"
        class="form-input"
        maxlength="6"
        required
        :disabled="formLoading"
      />
    </div>

    <!-- New Password Field -->
    <div class="form-field">
      <input
        v-model="localForgotForm.newPassword"
        type="password"
        placeholder="New Password"
        class="form-input"
        required
        :disabled="formLoading"
      />
    </div>

    <!-- Confirm Password Field -->
    <div class="form-field">
      <input
        v-model="localForgotForm.confirmPassword"
        type="password"
        placeholder="Confirm Password"
        class="form-input"
        required
        :disabled="formLoading"
      />
    </div>

    <!-- Password Match Indicator -->
    <div v-if="localForgotForm.newPassword && localForgotForm.confirmPassword" class="password-match">
      <div v-if="forgotPasswordsMatch" class="success-message text-sm">
        ✓ Passwords match
      </div>
      <div v-else class="error-message text-sm">
        ✗ Passwords don't match
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="formError" class="error-message">
      {{ formError }}
    </div>

    <!-- Success Message -->
    <div v-if="formSuccess" class="success-message">
      {{ formSuccess }}
    </div>

    <!-- Reset Password Button -->
    <button 
      type="submit"
      class="btn-login"
      :disabled="formLoading || !isForgotFormValid"
    >
      <svg v-if="formLoading" class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"></path>
      </svg>
      {{ formLoading ? 'Resetting Password...' : 'Reset Password' }}
    </button>

    <!-- Back Button -->
    <button 
      type="button"
      @click="$emit('backToEmailStep')"
      class="btn-back"
      :disabled="formLoading"
    >
      Back to Email
    </button>
  </form>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  forgotForm: {
    type: Object,
    required: true
  },
  formLoading: {
    type: Boolean,
    default: false
  },
  formError: {
    type: String,
    default: null
  },
  formSuccess: {
    type: String,
    default: null
  },
  isForgotFormValid: {
    type: Boolean,
    default: false
  },
  forgotPasswordsMatch: {
    type: Boolean,
    default: false
  }
})

defineEmits(['handleResetPassword', 'backToEmailStep'])

// Create reactive local copy for v-model
const localForgotForm = computed({
  get: () => props.forgotForm,
  set: () => {} // Handled by parent
})
</script>

<style scoped>
@import '../../assets/styles/modal-shared.css';


.password-match {
  text-align: center;
}

.btn-back {
  background: white;
  color: #6b7280;
  border: 2px solid #d1d5db;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  width: 100%;
  margin-top: 8px;
}

.btn-back:hover:not(:disabled) {
  background-color: #f3f4f6;
  border-color: #9ca3af;
}

.btn-back:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mb-4 {
  margin-bottom: 1rem;
}
</style>