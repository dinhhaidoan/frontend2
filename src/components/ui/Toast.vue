<template>
  <Teleport to="body">
    <Transition name="toast" appear>
      <div v-if="show" :class="['toast', `toast-${type}`]">
        <div class="toast-icon">
          <i :class="iconClass"></i>
        </div>
        <div class="toast-content">
          <h4 v-if="title" class="toast-title">{{ title }}</h4>
          <p class="toast-message">{{ message }}</p>
        </div>
        <button v-if="closable" @click="$emit('close')" class="toast-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 4000
  },
  closable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const iconClass = computed(() => {
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle'
  }
  return icons[props.type]
})

// Auto close after duration
if (props.duration > 0) {
  setTimeout(() => {
    emit('close')
  }, props.duration)
}
</script>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  right: 20px;
  min-width: 300px;
  max-width: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  z-index: 999999;
  border-left: 4px solid;
}

.toast-success {
  border-left-color: #10b981;
}

.toast-error {
  border-left-color: #ef4444;
}

.toast-warning {
  border-left-color: #f59e0b;
}

.toast-info {
  border-left-color: #3b82f6;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-top: 2px;
}

.toast-success .toast-icon {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.toast-error .toast-icon {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.toast-warning .toast-icon {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.1);
}

.toast-info .toast-icon {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.toast-message {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: none;
  background: none;
  color: #9ca3af;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.toast-close:hover {
  color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .toast {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
    max-width: none;
  }
}
</style>