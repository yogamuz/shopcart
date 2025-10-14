<template>
  <div class="modal-header">
    <h3>{{ getTitle }}</h3>
    <button @click="$emit('close')" class="close-button">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentMode: {
    type: String,
    required: true
  }
})

defineEmits(['close'])

const getTitle = computed(() => {
  switch (props.currentMode) {
    case 'login': return 'Login Required'
    case 'register': return 'Create Account'
    case 'forgot': return 'Reset Password'
    default: return 'Login Required'
  }
})
</script>

<style scoped>
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  transition: all 0.2s;
}

.close-button:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.w-6 {
  width: 1.5rem;
}

.h-6 {
  height: 1.5rem;
}

@media (max-width: 640px) {
  .modal-header {
    padding: 20px;
  }
}
</style>