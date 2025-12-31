// utils/toast.js - Simple toast notification utility

/**
 * Toast notification types
 */
const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

/**
 * Create and show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type (success, error, warning, info)
 * @param {number} duration - Duration in milliseconds
 */
const showToast = (message, type = 'info', duration = 3000) => {
  // Remove existing toasts
  const existingToasts = document.querySelectorAll('.custom-toast');
  existingToasts.forEach(toast => toast.remove());

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `custom-toast custom-toast-${type}`;
  
  // Toast icon based on type
  let icon = '';
  switch (type) {
    case 'success':
      icon = `
        <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      `;
      break;
    case 'error':
      icon = `
        <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      `;
      break;
    case 'warning':
      icon = `
        <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      `;
      break;
    default:
      icon = `
        <svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      `;
  }

  toast.innerHTML = `
    <div class="toast-content">
      ${icon}
      <span class="toast-message">${message}</span>
    </div>
  `;

  // Add to DOM
  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, duration);
};

/**
 * Success toast
 * @param {string} message
 * @param {number} duration
 */
export const success = (message, duration = 3000) => {
  showToast(message, TOAST_TYPES.SUCCESS, duration);
};

/**
 * Error toast
 * @param {string} message
 * @param {number} duration
 */
export const error = (message, duration = 3000) => {
  showToast(message, TOAST_TYPES.ERROR, duration);
};

/**
 * Warning toast
 * @param {string} message
 * @param {number} duration
 */
export const warning = (message, duration = 3000) => {
  showToast(message, TOAST_TYPES.WARNING, duration);
};

/**
 * Info toast
 * @param {string} message
 * @param {number} duration
 */
export const info = (message, duration = 3000) => {
  showToast(message, TOAST_TYPES.INFO, duration);
};

// Inject styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .custom-toast {
      position: fixed;
      top: 20px;
      right: 20px;
      min-width: 300px;
      max-width: 500px;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      z-index: 99999;
      opacity: 0;
      transform: translateX(400px);
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .custom-toast.show {
      opacity: 1;
      transform: translateX(0);
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .toast-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .toast-message {
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
    }

    .custom-toast-success {
      background: #10b981;
      color: white;
    }

    .custom-toast-error {
      background: #ef4444;
      color: white;
    }

    .custom-toast-warning {
      background: #f59e0b;
      color: white;
    }

    .custom-toast-info {
      background: #3b82f6;
      color: white;
    }

    @media (max-width: 640px) {
      .custom-toast {
        top: 10px;
        right: 10px;
        left: 10px;
        min-width: auto;
        max-width: none;
      }
    }
  `;
  document.head.appendChild(style);
}

export default {
  success,
  error,
  warning,
  info,
};