import { ref, readonly } from 'vue'

// Global toast state
const toasts = ref([])
let toastId = 0

export const useToast = () => {
  
  // Create toast
  const createToast = (message, type = 'info', duration = 5000) => {
    const id = ++toastId
    const toast = {
      id,
      message,
      type,
      duration,
      show: true
    }
    
    toasts.value.push(toast)
    
    // Auto remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
    
    return id
  }
  
  // Remove toast
  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }
  
  // Toast type shortcuts
  const success = (message, duration = 5000) => {
    return createToast(message, 'success', duration)
  }
  
  const error = (message, duration = 7000) => {
    return createToast(message, 'error', duration)
  }
  
  const warning = (message, duration = 6000) => {
    return createToast(message, 'warning', duration)
  }
  
  const info = (message, duration = 5000) => {
    return createToast(message, 'info', duration)
  }
  
  // Clear all toasts
  const clearAll = () => {
    toasts.value = []
  }
  
  return {
    toasts: readonly(toasts),
    success,
    error,
    warning,
    info,
    removeToast,
    clearAll
  }
}