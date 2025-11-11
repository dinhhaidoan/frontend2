import { ref } from 'vue'

const toasts = ref([])
let toastIdCounter = 0

export function useToast() {
  const showToast = (options) => {
    const toast = {
      id: ++toastIdCounter,
      type: options.type || 'info',
      title: options.title || '',
      message: options.message || '',
      duration: options.duration !== undefined ? options.duration : 4000,
      show: true
    }

    toasts.value.push(toast)

    // Auto remove after duration
    if (toast.duration > 0) {
      setTimeout(() => {
        removeToast(toast.id)
      }, toast.duration)
    }

    return toast.id
  }

  const removeToast = (id) => {
    const index = toasts.value.findIndex(toast => toast.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  const clearAllToasts = () => {
    toasts.value = []
  }

  // Convenience methods
  const success = (message, title, options = {}) => {
    return showToast({
      type: 'success',
      message,
      title,
      ...options
    })
  }

  const error = (message, title, options = {}) => {
    return showToast({
      type: 'error',
      message,
      title,
      duration: 6000, // Error messages stay longer
      ...options
    })
  }

  const warning = (message, title, options = {}) => {
    return showToast({
      type: 'warning',
      message,
      title,
      ...options
    })
  }

  const info = (message, title, options = {}) => {
    return showToast({
      type: 'info',
      message,
      title,
      ...options
    })
  }

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info
  }
}