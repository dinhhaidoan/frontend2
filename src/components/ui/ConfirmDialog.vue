<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-overlay" @click.self="handleCancel">
        <Transition name="modal-scale">
          <div v-if="show" class="confirm-dialog" :class="typeClass">
            <div class="confirm-header">
              <div class="confirm-icon" :class="type">
                <i :class="iconClass"></i>
              </div>
              <h3 class="confirm-title">{{ title }}</h3>
            </div>
            
            <div class="confirm-body">
              <p class="confirm-message">{{ message }}</p>
              <div v-if="details" class="confirm-details">
                <slot name="details">
                  <p>{{ details }}</p>
                </slot>
              </div>
            </div>
            
            <div class="confirm-actions">
              <button 
                @click="handleCancel" 
                class="btn-confirm-cancel"
                :disabled="loading"
              >
                <i class="fas fa-times"></i>
                {{ cancelText }}
              </button>
              <button 
                @click="handleConfirm" 
                class="btn-confirm-action"
                :class="type"
                :disabled="loading"
              >
                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                <i v-else :class="confirmIconClass"></i>
                {{ confirmText }}
              </button>
            </div>
          </div>
        </Transition>
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
    default: 'warning',
    validator: (value) => ['warning', 'danger', 'info', 'success'].includes(value)
  },
  title: {
    type: String,
    default: 'Xác nhận'
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: 'Xác nhận'
  },
  cancelText: {
    type: String,
    default: 'Hủy'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel', 'update:show'])

const iconClass = computed(() => {
  const icons = {
    warning: 'fas fa-exclamation-triangle',
    danger: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
    success: 'fas fa-check-circle'
  }
  return icons[props.type]
})

const confirmIconClass = computed(() => {
  const icons = {
    warning: 'fas fa-check',
    danger: 'fas fa-trash-alt',
    info: 'fas fa-check',
    success: 'fas fa-check'
  }
  return icons[props.type]
})

const typeClass = computed(() => {
  return `type-${props.type}`
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  if (!props.loading) {
    emit('cancel')
    emit('update:show', false)
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  /* Place the confirm dialog above most modals. App modals use z-index: 100000,
     so use slightly higher value to ensure the confirm dialog is visible on top. */
  z-index: 100001;
  padding: 20px;
}

.confirm-dialog {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 64px rgba(0, 0, 0, 0.2);
  max-width: 480px;
  width: 100%;
  overflow: hidden;
}

.confirm-header {
  padding: 28px 28px 20px;
  text-align: center;
  border-bottom: 1px solid #f3f4f6;
}

.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 28px;
}

.confirm-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.confirm-icon.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.confirm-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.confirm-icon.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.confirm-title {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.confirm-body {
  padding: 24px 28px;
}

.confirm-message {
  font-size: 15px;
  color: #6b7280;
  line-height: 1.6;
  text-align: center;
  margin: 0;
}

.confirm-details {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  border-left: 3px solid #e5e7eb;
}

.type-warning .confirm-details {
  background: #fffbeb;
  border-left-color: #f59e0b;
}

.type-danger .confirm-details {
  background: #fef2f2;
  border-left-color: #ef4444;
}

.type-info .confirm-details {
  background: #eff6ff;
  border-left-color: #3b82f6;
}

.type-success .confirm-details {
  background: #f0fdf4;
  border-left-color: #10b981;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  padding: 20px 28px 28px;
  justify-content: flex-end;
}

.btn-confirm-cancel,
.btn-confirm-action {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.btn-confirm-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-confirm-cancel:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-confirm-action {
  background: #3b82f6;
  color: white;
}

.btn-confirm-action.warning {
  background: #f59e0b;
}

.btn-confirm-action.danger {
  background: #ef4444;
}

.btn-confirm-action.info {
  background: #3b82f6;
}

.btn-confirm-action.success {
  background: #10b981;
}

.btn-confirm-action:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-confirm-action.warning:hover:not(:disabled) {
  background: #d97706;
}

.btn-confirm-action.danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-confirm-action.info:hover:not(:disabled) {
  background: #2563eb;
}

.btn-confirm-action.success:hover:not(:disabled) {
  background: #059669;
}

.btn-confirm-cancel:disabled,
.btn-confirm-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-scale-enter-active,
.modal-scale-leave-active {
  transition: all 0.3s ease;
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .confirm-dialog {
    border-radius: 12px;
  }
  
  .confirm-header {
    padding: 24px 20px 16px;
  }
  
  .confirm-icon {
    width: 56px;
    height: 56px;
    font-size: 24px;
  }
  
  .confirm-title {
    font-size: 18px;
  }
  
  .confirm-body {
    padding: 20px;
  }
  
  .confirm-actions {
    flex-direction: column-reverse;
    padding: 16px 20px 24px;
  }
  
  .btn-confirm-cancel,
  .btn-confirm-action {
    width: 100%;
    justify-content: center;
  }
}
</style>
