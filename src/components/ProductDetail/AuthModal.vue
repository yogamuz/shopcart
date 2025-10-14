<!-- AuthModal.vue - Main Component -->
<template>
  <div v-if="show" class="modal-overlay" @click.self="handleOverlayClick">
    <div class="modal-content">
      <ModalHeader :currentMode="currentMode" @close="$emit('close')" />

      <div class="modal-body">
        <!-- Login Mode -->
        <LoginForm
          v-if="currentMode === 'login'"
          :loginForm="loginForm"
          :formLoading="formLoading"
          :formError="formError"
          :formSuccess="formSuccess"
          :isLoginFormValid="isLoginFormValid"
          @handleLogin="handleLogin"
          @switchToRegister="switchToRegister"
          @switchToForgotPassword="switchToForgotPassword"
          @close="$emit('close')"
        />

        <!-- Register Mode -->
        <RegisterForm
          v-else-if="currentMode === 'register'"
          :registerForm="registerForm"
          :formLoading="formLoading"
          :formError="formError"
          :formSuccess="formSuccess"
          :isRegisterFormValid="isRegisterFormValid"
          :passwordsMatch="passwordsMatch"
          :usernameAvailability="usernameAvailability"
          @handleRegister="handleRegister"
          @switchToLogin="switchToLogin"
          @handleUsernameInput="handleUsernameInput"
        />

        <!-- Forgot Password Mode -->
        <ForgotPasswordForm
          v-else-if="currentMode === 'forgot'"
          :forgotForm="forgotForm"
          :forgotStep="forgotStep"
          :formLoading="formLoading"
          :formError="formError"
          :formSuccess="formSuccess"
          :isForgotFormValid="isForgotFormValid"
          :forgotPasswordsMatch="forgotPasswordsMatch"
          @handleSendOtp="handleSendOtp"
          @handleResetPassword="handleResetPassword"
          @backToEmailStep="backToEmailStep"
          @switchToLogin="switchToLogin"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useAuth } from "@/composables/useAuth";

// Import child components
import ModalHeader from "../Auth/ModalHeader.vue";
import LoginForm from "../Auth/LoginForm.vue";
import RegisterForm from "../Auth/RegisterForm.vue";
import ForgotPasswordForm from "../Auth/ForgotPasswordForm.vue";

// Props
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["close", "login", "register", "success"]);

// Composables
const {
  login,
  register,
  requestPasswordReset,
  resetPassword,
  checkUsernameAvailability: checkUsernameAPI,
} = useAuth();

// Local state
const currentMode = ref("login"); // 'login' | 'register' | 'forgot'
const forgotStep = ref("email"); // 'email' | 'reset'
const formLoading = ref(false);
const formError = ref(null);
const formSuccess = ref(null);

// Form data
const loginForm = ref({
  email: "",
  password: "",
});

const registerForm = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
});

const forgotForm = ref({
  email: "",
  otpCode: "",
  newPassword: "",
  confirmPassword: "",
});
// Username availability state
const usernameAvailability = ref({
  checking: false,
  available: null,
  message: "",
});

// Updated isLoginFormValid computed - Support username OR email
const isLoginFormValid = computed(() => {
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

const isRegisterFormValid = computed(() => {
  return (
    registerForm.value.username.trim() !== "" &&
    registerForm.value.email.trim() !== "" &&
    registerForm.value.password !== "" &&
    registerForm.value.confirmPassword !== "" &&
    passwordsMatch.value &&
    registerForm.value.agreeToTerms &&
    registerForm.value.username.length >= 3 &&
    registerForm.value.password.length >= 6 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.value.email) &&
    registerForm.value.username.length <= 30
  );
});

const passwordsMatch = computed(() => {
  if (!registerForm.value.password || !registerForm.value.confirmPassword)
    return true;
  return registerForm.value.password === registerForm.value.confirmPassword;
});

const forgotPasswordsMatch = computed(() => {
  if (!forgotForm.value.newPassword || !forgotForm.value.confirmPassword)
    return true;
  return forgotForm.value.newPassword === forgotForm.value.confirmPassword;
});

const isForgotFormValid = computed(() => {
  return (
    forgotForm.value.otpCode.trim() !== "" &&
    forgotForm.value.newPassword !== "" &&
    forgotForm.value.confirmPassword !== "" &&
    forgotPasswordsMatch.value &&
    forgotForm.value.otpCode.length === 6 &&
    forgotForm.value.newPassword.length >= 6
  );
});

// Methods
const clearMessages = () => {
  formError.value = null;
  formSuccess.value = null;
};

const switchToRegister = () => {
  currentMode.value = "register";
  clearMessages();
};

const switchToLogin = () => {
  currentMode.value = "login";
  forgotStep.value = "email";
  clearMessages();
};

const switchToForgotPassword = () => {
  currentMode.value = "forgot";
  forgotStep.value = "email";
  forgotForm.value.email = loginForm.value.email || "";
  clearMessages();
};

const backToEmailStep = () => {
  forgotStep.value = "email";
  forgotForm.value.otpCode = "";
  forgotForm.value.newPassword = "";
  forgotForm.value.confirmPassword = "";
  clearMessages();
};

const handleOverlayClick = () => {
  if (!formLoading.value) {
    emit("close");
  }
};

const handleSendOtp = async () => {
  if (!forgotForm.value.email || !forgotForm.value.email.includes("@")) {
    formError.value = "Please enter a valid email address";
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotForm.value.email)) {
    formError.value = "Please enter a valid email address";
    return;
  }

  try {
    formLoading.value = true;
    clearMessages();

    await requestPasswordReset(forgotForm.value.email);

    formSuccess.value = "OTP sent successfully! Check your email.";

    setTimeout(() => {
      forgotStep.value = "reset";
      formSuccess.value = null;
    }, 2000);
  } catch (error) {
    console.error("Send OTP error:", error);
    formError.value = error.message || "Failed to send OTP. Please try again.";
  } finally {
    formLoading.value = false;
  }
};

const handleResetPassword = async () => {
  if (!isForgotFormValid.value) return;

  // Validation
  if (!forgotForm.value.otpCode || forgotForm.value.otpCode.length !== 6) {
    formError.value = "Please enter a valid 6-digit OTP";
    return;
  }

  if (
    !forgotForm.value.newPassword ||
    forgotForm.value.newPassword.length < 6
  ) {
    formError.value = "Password must be at least 6 characters";
    return;
  }

  if (
    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(forgotForm.value.newPassword)
  ) {
    formError.value =
      "Password must contain at least one lowercase, uppercase, and number";
    return;
  }

  if (forgotForm.value.newPassword !== forgotForm.value.confirmPassword) {
    formError.value = "Passwords do not match";
    return;
  }

  try {
    formLoading.value = true;
    clearMessages();

    await resetPassword(
      forgotForm.value.email,
      forgotForm.value.otpCode,
      forgotForm.value.newPassword
    );

    formSuccess.value = "Password reset successful! Logging you in...";

    setTimeout(async () => {
      try {
        await login({
          email: forgotForm.value.email,
          password: forgotForm.value.newPassword,
        });

        emit("success", "passwordReset");
        emit("close");
        resetForms();
      } catch (loginErr) {
        console.error("Auto-login error:", loginErr);
        currentMode.value = "login";
        loginForm.value.email = forgotForm.value.email;
        forgotStep.value = "email";
        resetForms();
        clearMessages();
        formSuccess.value =
          "Password reset successful! Please login with your new password.";
      }
    }, 1500);
  } catch (error) {
    console.error("Reset password error:", error);
    formError.value =
      error.message || "Password reset failed. Please try again.";
  } finally {
    formLoading.value = false;
  }
};

const resetForms = () => {
  loginForm.value = {
    email: "",
    password: "",
  };
  registerForm.value = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  };
  forgotForm.value = {
    email: "",
    otpCode: "",
    newPassword: "",
    confirmPassword: "",
  };

  // Reset username availability state
  usernameAvailability.value = {
    checking: false,
    available: null,
    message: "",
  };

  clearMessages();
};

const handleLogin = async () => {
  if (!isLoginFormValid.value) return;

  try {
    formLoading.value = true;
    clearMessages();

    await login({
      email: loginForm.value.email.trim(),
      password: loginForm.value.password,
    });

    formSuccess.value = "Login successful! Welcome back.";

    setTimeout(() => {
      emit("success", "login");
      emit("close");
      resetForms();
    }, 1500);
  } catch (error) {
    console.error("Login error:", error);
    formError.value = error.message || "Login failed. Please try again.";
  } finally {
    formLoading.value = false;
  }
};

const handleRegister = async () => {
  if (!isRegisterFormValid.value) return;

  // Validation
  if (!/^[a-zA-Z0-9_]+$/.test(registerForm.value.username)) {
    formError.value = "Username must be alphanumeric and underscore only";
    return;
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(registerForm.value.password)) {
    formError.value =
      "Password must contain at least one lowercase, uppercase, and number";
    return;
  }

  try {
    formLoading.value = true;
    clearMessages();

    const userData = {
      username: registerForm.value.username.trim(),
      email: registerForm.value.email.trim(),
      password: registerForm.value.password,
    };

    await register(userData);

    formSuccess.value = "Account created successfully! You are now logged in.";

    setTimeout(() => {
      emit("success", "register");
      emit("close");
      resetForms();
    }, 1500);
  } catch (error) {
    console.error("Registration error:", error);

    if (error.errors && Array.isArray(error.errors)) {
      const firstError = error.errors[0];
      formError.value = firstError.msg || "Validation failed";
    } else if (error.formattedErrors) {
      const fieldErrors = Object.values(error.formattedErrors);
      if (fieldErrors.length > 0) {
        formError.value = fieldErrors[0];
      }
    } else {
      formError.value =
        error.message || "Registration failed. Please try again.";
    }
  } finally {
    formLoading.value = false;
  }
};

const checkUsernameAvailability = async (username) => {
  if (!username || username.length < 3) {
    usernameAvailability.value = {
      checking: false,
      available: null,
      message: "",
    };
    return;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    usernameAvailability.value = {
      checking: false,
      available: false,
      message: "Username must be alphanumeric and underscore only",
    };
    return;
  }

  try {
    usernameAvailability.value.checking = true;
    const result = await checkUsernameAPI(username); // ← Gunakan alias

    usernameAvailability.value = {
      checking: false,
      available: result.available,
      message: result.message,
    };
  } catch (error) {
    usernameAvailability.value = {
      checking: false,
      available: null,
      message: "Unable to check availability",
    };
  }
};

// Debounced username check
let usernameCheckTimeout;
const handleUsernameInput = (username) => {
  clearTimeout(usernameCheckTimeout);
  usernameCheckTimeout = setTimeout(() => {
    checkUsernameAvailability(username);
  }, 500);
};
watch(
  () => props.show,
  (newVal) => {
    if (!newVal) {
      // Clear timeout when modal closes
      clearTimeout(usernameCheckTimeout);

      setTimeout(() => {
        currentMode.value = "login";
        forgotStep.value = "email";
        resetForms();
      }, 300);
    }
  },
  { immediate: false }
);
</script>

<style scoped>
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
  .modal-content {
    width: 95%;
    margin: 16px;
    max-width: none;
  }

  .modal-body {
    padding: 20px;
  }
}
</style>
