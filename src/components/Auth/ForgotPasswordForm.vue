<template>
  <div>
    <div class="login-icon">
      <!-- FIXED: Icon key yang benar dan lengkap -->
      <svg class="w-16 h-16 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
      </svg>
    </div>
    
    <p class="message">
      Enter your email address and we'll send you an OTP code to reset your password.
    </p>

    <!-- Email Step Form -->
    <EmailStepForm 
      v-if="forgotStep === 'email'"
      :forgotForm="forgotForm"
      :formLoading="formLoading"
      :formError="formError"
      :formSuccess="formSuccess"
      @handleSendOtp="$emit('handleSendOtp')"
    />

    <!-- Reset Password Step Form -->
    <ResetStepForm
      v-else-if="forgotStep === 'reset'"
      :forgotForm="forgotForm"
      :formLoading="formLoading"
      :formError="formError"
      :formSuccess="formSuccess"
      :isForgotFormValid="isForgotFormValid"
      :forgotPasswordsMatch="forgotPasswordsMatch"
      @handleResetPassword="$emit('handleResetPassword')"
      @backToEmailStep="$emit('backToEmailStep')"
    />

    <!-- Switch back to Login -->
    <div class="switch-mode">
      <p>Remember your password? 
        <button @click="$emit('switchToLogin')" class="switch-link">Login Here</button>
      </p>
    </div>
  </div>
</template>

<script setup>
import EmailStepForm from './EmailStepForm.vue'
import ResetStepForm from './ResetStepForm.vue'

defineProps({
  forgotForm: {
    type: Object,
    required: true
  },
  forgotStep: {
    type: String,
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

defineEmits(['handleSendOtp', 'handleResetPassword', 'backToEmailStep', 'switchToLogin'])
</script>

<style scoped>
@import '../../assets/styles/modal-shared.css';

</style>