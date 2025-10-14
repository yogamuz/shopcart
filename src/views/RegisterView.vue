<!-- RegisterView.vue - Revised to use AuthModal components -->
<template>
  <div class="page-container rain-container rain-cyan">
    <div class="page-content">
      <ModalHeader 
        :currentMode="'register'" 
        @close="goToHome" 
      />

      <div class="page-body">
        <RegisterForm
          :registerForm="formData"
          :formLoading="isLoading"
          :formError="error"
          :formSuccess="success"
          :isRegisterFormValid="isFormValid"
          :passwordsMatch="passwordsMatch"
          :usernameAvailability="usernameAvailability"
          @handleRegister="handleSubmit"
          @switchToLogin="goToLogin"
          @handleUsernameInput="handleUsernameInput"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/composables/useAuth";
import ModalHeader from "@/components/Auth/ModalHeader.vue";
import RegisterForm from "@/components/Auth/RegisterForm.vue";

// Router
const router = useRouter();

// Auth composable
const { register, isLoading, error: authError, clearError, checkUsernameAvailability: checkUsernameAPI } = useAuth();

// Form data
const formData = ref({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
});

// Username availability state
const usernameAvailability = ref({
  checking: false,
  available: null,
  message: ''
});

// Local state
const error = ref("");
const success = ref("");

// Computed properties
const passwordsMatch = computed(() => {
  if (!formData.value.password || !formData.value.confirmPassword) return true;
  return formData.value.password === formData.value.confirmPassword;
});

const isFormValid = computed(() => {
  return (
    formData.value.username.trim() &&
    formData.value.email.trim() &&
    formData.value.password &&
    formData.value.confirmPassword &&
    passwordsMatch.value &&
    formData.value.agreeToTerms &&
    formData.value.username.length >= 3 &&
    formData.value.password.length >= 6 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email) &&
    formData.value.username.length <= 30
  );
});

// Methods
const goToHome = () => {
  router.push('/');
};

const goToLogin = () => {
  router.push('/login');
};

// Username availability checking
const checkUsernameAvailability = async (username) => {
  if (!username || username.length < 3) {
    usernameAvailability.value = { checking: false, available: null, message: '' }
    return
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    usernameAvailability.value = { 
      checking: false, 
      available: false, 
      message: 'Username must be alphanumeric and underscore only' 
    }
    return
  }

  try {
    usernameAvailability.value.checking = true
    const result = await checkUsernameAPI(username)
    
    usernameAvailability.value = {
      checking: false,
      available: result.available,
      message: result.message
    }
  } catch (error) {
    usernameAvailability.value = {
      checking: false,
      available: null,
      message: 'Unable to check availability'
    }
  }
}

// Debounced username check
let usernameCheckTimeout
const handleUsernameInput = (username) => {
  clearTimeout(usernameCheckTimeout)
  usernameCheckTimeout = setTimeout(() => {
    checkUsernameAvailability(username)
  }, 500)
}

const validateForm = () => {
  error.value = "";

  // Username validation - sesuai API requirements
  if (!formData.value.username.trim()) {
    error.value = "Username is required";
    return false;
  }

  if (
    formData.value.username.length < 3 ||
    formData.value.username.length > 30
  ) {
    error.value = "Username must be 3-30 characters";
    return false;
  }

  if (!/^[a-zA-Z0-9_]+$/.test(formData.value.username)) {
    error.value = "Username must be alphanumeric and underscore only";
    return false;
  }

  // Email validation
  if (!formData.value.email.trim()) {
    error.value = "Email is required";
    return false;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    error.value = "Valid email is required";
    return false;
  }

  // Password validation - sesuai API requirements
  if (!formData.value.password) {
    error.value = "Password is required";
    return false;
  }

  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(formData.value.password)) {
    error.value =
      "Password must contain at least one lowercase, uppercase, and number";
    return false;
  }

  // Confirm password validation
  if (!passwordsMatch.value) {
    error.value = "Passwords do not match";
    return false;
  }

  // Terms validation
  if (!formData.value.agreeToTerms) {
    error.value = "You must agree to the Terms & Conditions";
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  // Clear previous messages
  error.value = "";
  success.value = "";
  clearError();

  // Validate form
  if (!validateForm()) {
    return;
  }

  try {
    const userData = {
      username: formData.value.username.trim(),
      email: formData.value.email.trim(),
      password: formData.value.password,
    };

    console.log("Attempting to register user:", {
      ...userData,
      password: "[HIDDEN]",
    });

    const response = await register(userData);

    if (response && response.success) {
      success.value = "Account created successfully! You are now logged in.";

      // Reset form
      formData.value = {
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        agreeToTerms: false,
      };

      // Reset username availability state
      usernameAvailability.value = {
        checking: false,
        available: null,
        message: ''
      };

      setTimeout(() => {
        // Auto redirect berdasarkan role sudah dihandle oleh useAuth
        router.push('/');
      }, 2000);
    }
  } catch (err) {
    console.error("Registration error:", err);

    // Handle validation errors dari API response structure
    if (err.errors && Array.isArray(err.errors)) {
      const firstError = err.errors[0];
      error.value = firstError.msg || "Validation failed";
    } else if (err.message) {
      error.value = err.message;
    } else {
      error.value = "Registration failed. Please try again.";
    }

    // Handle formattedErrors dari authStore jika ada
    if (err.formattedErrors) {
      const fieldErrors = Object.values(err.formattedErrors);
      if (fieldErrors.length > 0) {
        error.value = fieldErrors[0];
      }
    }
  }
};

// Clear errors when component mounts
onMounted(() => {
  clearError();

  // Check if there's a message in URL params
  const urlParams = new URLSearchParams(window.location.search);
  const message = urlParams.get("message");
  if (message) {
    success.value = message;
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