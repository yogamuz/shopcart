<template>
    <Teleport to="body">
  <Transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <!-- Close Button -->
        <button @click="closeModal" class="close-button">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <!-- Icon -->
        <div class="icon-wrapper">
          <svg class="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>

        <!-- Content -->
        <div class="modal-content">
          <h3 class="modal-title">Start Selling Today!</h3>
          <p class="modal-description">
            Join thousands of successful sellers on our platform. Start your own online business and reach millions of
            customers.
          </p>

          <!-- Benefits List -->
          <div class="benefits-list">
            <div v-for="benefit in benefits" :key="benefit.id" class="benefit-item">
              <svg class="benefit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span class="benefit-text">{{ benefit.text }}</span>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ error }}</span>
          </div>
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button @click="closeModal" :disabled="isLoading" class="btn-cancel">
            Maybe Later
          </button>

          <button @click="handleUpgrade" :disabled="isLoading" class="btn-upgrade">
            <span v-if="!isLoading">Become a Seller</span>
            <span v-else class="loading-text">
              <svg class="loading-spinner" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Upgrading...
            </span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed } from "vue";
import { useUserProfileStore } from "@/stores/userProfileStore";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "vue-router";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close", "success"]);

const router = useRouter();
const authStore = useAuthStore();
const { upgradeToSeller } = useUserProfileStore();

const isLoading = ref(false);
const error = ref(null);

const benefits = [
  { id: 1, text: "Create your own online store" },
  { id: 2, text: "Reach millions of customers" },
  { id: 3, text: "Easy product management" },
  { id: 4, text: "Secure payment processing" },
  { id: 5, text: "24/7 seller support" },
];

const closeModal = () => {
  if (!isLoading.value) {
    error.value = null;
    emit("close");
  }
};

const handleUpgrade = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const result = await upgradeToSeller();

    if (result.success) {
      emit("success", result.data);
      closeModal();

      // Show success notification
      setTimeout(() => {
        router.push("/seller/dashboard");
      }, 1500);
    }
  } catch (err) {
    console.error("Upgrade error:", err);
    error.value = err.message || "Failed to upgrade to seller. Please try again.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 1rem;
  max-width: 500px;
  width: 100%;
  padding: 2rem;
  position: relative;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: slideUp 0.3s ease-out;
}

.close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #6b7280;
  transition: color 0.2s;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.close-button:hover {
  color: #1f2937;
  background-color: #f3f4f6;
}

.icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.modal-content {
  text-align: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.modal-description {
  color: #6b7280;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.benefits-list {
  text-align: left;
  margin-bottom: 1.5rem;
  background: #f9fafb;
  padding: 1.25rem;
  border-radius: 0.75rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.benefit-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #10b981;
  flex-shrink: 0;
}

.benefit-text {
  color: #374151;
  font-size: 0.875rem;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.btn-cancel,
.btn-upgrade {
  flex: 1;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-cancel:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-upgrade {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
}

.btn-upgrade:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
}

.btn-upgrade:disabled,
.btn-cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.loading-spinner {
  width: 1.25rem;
  height: 1.25rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.95);
}

@media (max-width: 640px) {
  .modal-container {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>