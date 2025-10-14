<template>
  <form @submit.prevent="$emit('handleSendOtp')" class="space-y-4">
    <!-- Email Field -->
    <div class="form-field">
      <input
        v-model="localForgotForm.email"
        type="email"
        placeholder="Email address"
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

    <!-- Send OTP Button -->
    <button 
      type="submit"
      class="btn-login"
      :disabled="formLoading || !localForgotForm.email"
    >
      <svg v-if="formLoading" class="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
      </svg>
      {{ formLoading ? 'Sending OTP...' : 'Send OTP' }}
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
  }
})

defineEmits(['handleSendOtp'])

// Create reactive local copy for v-model
const localForgotForm = computed({
  get: () => props.forgotForm,
  set: () => {} // Handled by parent
})
</script>

<style scoped>
@import '../../assets/styles/modal-shared.css';
</style>