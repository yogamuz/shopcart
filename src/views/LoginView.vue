<!-- LoginView.vue - Revised to use AuthModal components -->
<template>
  <div class="page-container rain-container rain-black">
    <div class="page-content">
      <ModalHeader 
        :currentMode="'login'" 
        @close="goToHome" 
      />

      <div class="page-body">
        <LoginForm
          :loginForm="loginForm"
          :formLoading="isLoading"
          :formError="authError"
          :formSuccess="successMessage"
          :isLoginFormValid="isFormValid"
          @handleLogin="handleSubmit"
          @switchToRegister="goToRegister"
          @switchToForgotPassword="handleForgotPassword"
          @close="goToHome"
        />
      </div>
    </div>

    <!-- Forgot Password Modal -->
    <div v-if="showForgotModal" class="modal-overlay" @click.self="closeForgotModal">
      <div class="modal-content">
        <ModalHeader 
          :currentMode="'forgot'" 
          @close="closeForgotModal" 
        />

        <div class="modal-body">
          <ForgotPasswordForm
            :forgotForm="forgotForm"
            :forgotStep="resetStep"
            :formLoading="forgotLoading"
            :formError="forgotError"
            :formSuccess="forgotSuccess"
            :isForgotFormValid="isForgotFormValid"
            :forgotPasswordsMatch="forgotPasswordsMatch"
            @handleSendOtp="handleSendOtp"
            @handleResetPassword="handleResetPassword"
            @backToEmailStep="handleBackToEmail"
            @switchToLogin="closeForgotModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import { useToast } from "@/composables/useToast";
import ModalHeader from "@/components/Auth/ModalHeader.vue";
import LoginForm from "@/components/Auth/LoginForm.vue";
import ForgotPasswordForm from "@/components/Auth/ForgotPasswordForm.vue";

// Composables
const router = useRouter();
const {
  user,
  isAuthenticated,
  isLoading,
  error: authError,
  login,
  requestPasswordReset,
  resetPassword,
  clearError,
} = useAuth();

const { success, error: showError } = useToast();

// Form data
const loginForm = ref({
  email: "",
  password: "",
});

// Success message
const successMessage = ref(null);

// Reset password state
const showForgotModal = ref(false);
const resetStep = ref("email"); // 'email' | 'reset'
const forgotForm = ref({
  email: "",
  otpCode: "",
  newPassword: "",
  confirmPassword: ""
});
const forgotError = ref(null);
const forgotSuccess = ref(null);
const forgotLoading = ref(false);

// Computed
const isFormValid = computed(() => {
  const identifier = loginForm.value.email.trim();
  const password = loginForm.value.password.trim();
  
  // Basic validation
  if (!identifier || !password || password.length < 6) {
    return false;
  }
  
  // Validate identifier (email atau username)
  if (identifier.includes('@')) {
    // Jika ada @, validate sebagai email
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
  } else {
    // Jika tidak ada @, validate sebagai username
    return identifier.length >= 3 && 
           identifier.length <= 30 && 
           /^[a-zA-Z0-9_]+$/.test(identifier);
  }
});

const isForgotFormValid = computed(() => {
  return forgotForm.value.otpCode.trim() !== '' &&
         forgotForm.value.newPassword !== '' &&
         forgotForm.value.confirmPassword !== '' &&
         forgotPasswordsMatch.value &&
         forgotForm.value.otpCode.length === 6 &&
         forgotForm.value.newPassword.length >= 6
});

const forgotPasswordsMatch = computed(() => {
  if (!forgotForm.value.newPassword || !forgotForm.value.confirmPassword) return true
  return forgotForm.value.newPassword === forgotForm.value.confirmPassword
});

// Methods
const goToHome = () => {
  router.push('/');
};

const goToRegister = () => {
  router.push('/register');
};

const handleSubmit = async () => {
  if (!isFormValid.value) {
    showError("Please fill in all fields correctly");
    return;
  }

  try {
    clearError();
    successMessage.value = null;

    await login({
      email: loginForm.value.email.trim(),
      password: loginForm.value.password,
    });

    successMessage.value = "Login successful! Welcome back.";

    setTimeout(() => {
      // Auto redirect berdasarkan role sudah dihandle oleh useAuth
      success("Login successful! Welcome back.");
    }, 1500);

  } catch (err) {
    console.error("Login error:", err);
    showError(
      authError.value || err.message || "Login failed. Please try again."
    );
  }
};

const handleForgotPassword = () => {
  showForgotModal.value = true;
  resetStep.value = "email";
  forgotForm.value.email = loginForm.value.email || "";
  clearResetState();
};

const closeForgotModal = () => {
  showForgotModal.value = false;
  resetStep.value = "email";
  clearResetState();
};

const clearResetState = () => {
  forgotForm.value.email = "";
  forgotForm.value.otpCode = "";
  forgotForm.value.newPassword = "";
  forgotForm.value.confirmPassword = "";
  forgotError.value = null;
  forgotSuccess.value = null;
};

const handleSendOtp = async () => {
  const identifier = forgotForm.value.email.trim();
  
  if (!identifier) {
    forgotError.value = "Please enter your username or email";
    return;
  }

  // Validate identifier
  if (identifier.includes('@')) {
    // Validate sebagai email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      forgotError.value = "Please enter a valid email address";
      return;
    }
  } else {
    // Validate sebagai username
    if (identifier.length < 3 || identifier.length > 30 || !/^[a-zA-Z0-9_]+$/.test(identifier)) {
      forgotError.value = "Please enter a valid username (3-30 characters, alphanumeric and underscore only)";
      return;
    }
  }

  try {
    forgotLoading.value = true;
    forgotError.value = null;
    forgotSuccess.value = null;

    await requestPasswordReset(identifier);

    forgotSuccess.value = "OTP sent successfully! Check your email.";

    setTimeout(() => {
      resetStep.value = "reset";
      forgotSuccess.value = null;
    }, 2000);
  } catch (err) {
    console.error("Send OTP error:", err);
    forgotError.value = err.message || "Failed to send OTP";
  } finally {
    forgotLoading.value = false;
  }
};

const handleResetPassword = async () => {
  if (!isForgotFormValid.value) return;

  // Validation
  if (!forgotForm.value.otpCode || forgotForm.value.otpCode.length !== 6) {
    forgotError.value = "Please enter a valid 6-digit OTP";
    return;
  }

  if (!forgotForm.value.newPassword || forgotForm.value.newPassword.length < 6) {
    forgotError.value = "Password must be at least 6 characters";
    return;
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(forgotForm.value.newPassword)) {
    forgotError.value =
      "Password must contain at least one lowercase, uppercase, and number";
    return;
  }

  if (forgotForm.value.newPassword !== forgotForm.value.confirmPassword) {
    forgotError.value = "Passwords do not match";
    return;
  }

  try {
    forgotLoading.value = true;
    forgotError.value = null;
    forgotSuccess.value = null;

    await resetPassword(forgotForm.value.email, forgotForm.value.otpCode, forgotForm.value.newPassword);

    forgotSuccess.value = "Password reset successful! Logging you in...";

    setTimeout(async () => {
      try {
        await login({
          email: forgotForm.value.email,
          password: forgotForm.value.newPassword,
        });

        closeForgotModal();
        success("Password reset successful! Welcome back.");
        
      } catch (loginErr) {
        console.error("Auto-login error:", loginErr);
        closeForgotModal();
        success("Password reset successful! Please login with your new password.");
      }
    }, 1500);

  } catch (err) {
    console.error("Reset password error:", err);
    forgotError.value = err.message || "Password reset failed";
  } finally {
    forgotLoading.value = false;
  }
};

const handleBackToEmail = () => {
  resetStep.value = "email";
  forgotForm.value.otpCode = "";
  forgotForm.value.newPassword = "";
  forgotForm.value.confirmPassword = "";
  forgotError.value = null;
  forgotSuccess.value = null;
};

onMounted(() => {
  clearError();

  // Handle URL params
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get("message");
  if (message) {
    success(message);
  }
});
</script>

<style scoped>
@import '../assets/styles/rain-background.css';

.page-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.page-content {
  position: relative;
  z-index: 2;
  background: white;
  border-radius: 20px;
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: pageSlideIn 0.3s ease-out;
}

@keyframes pageSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.page-body {
  padding: 24px;
  text-align: center;
}

/* Modal styles - same as AuthModal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-body {
  padding: 24px;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 640px) {
  .page-content,
  .modal-content {
    width: 95%;
    margin: 16px;
    max-width: none;
  }
  
  .page-body,
  .modal-body {
    padding: 20px;
  }
}
</style>