<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="handleOverlayClick">
        <div class="modal-container" @click.stop>
          <div class="modal-header" :class="`type-${type}`">
            <div class="header-icon">
              <i :class="iconClass"></i>
            </div>
            <h3>{{ title }}</h3>
            <button class="close-btn" @click="close">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <p class="message">{{ message }}</p>
            
            <div v-if="details" class="details-section">
              <div v-for="(value, key) in details" :key="key" class="detail-item">
                <span class="detail-label">{{ key }}:</span>
                <span class="detail-value">{{ value }}</span>
              </div>
            </div>

            <div v-if="type === 'danger'" class="warning-box">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Hành động này không thể hoàn tác!</span>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-cancel" @click="close">
              <i class="fas fa-times"></i>
              {{ cancelText }}
            </button>
            <button
              class="btn btn-confirm"
              :class="`type-${type}`"
              @click="confirm"
              :disabled="isLoading"
            >
              <i v-if="!isLoading" :class="confirmIconClass"></i>
              <i v-else class="fas fa-spinner fa-spin"></i>
              {{ isLoading ? 'Đang xử lý...' : confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // 'info', 'success', 'warning', 'danger'
    validator: (value) => ['info', 'success', 'warning', 'danger'].includes(value)
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  details: {
    type: Object,
    default: null
  },
  confirmText: {
    type: String,
    default: 'Xác nhận'
  },
  cancelText: {
    type: String,
    default: 'Hủy'
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel', 'close']);

const iconClass = computed(() => {
  const icons = {
    info: 'fas fa-info-circle',
    success: 'fas fa-check-circle',
    warning: 'fas fa-exclamation-triangle',
    danger: 'fas fa-exclamation-circle'
  };
  return icons[props.type];
});

const confirmIconClass = computed(() => {
  const icons = {
    info: 'fas fa-check',
    success: 'fas fa-check',
    warning: 'fas fa-exclamation',
    danger: 'fas fa-trash-alt'
  };
  return icons[props.type];
});

const handleOverlayClick = () => {
  if (!props.isLoading) {
    close();
  }
};

const close = () => {
  if (!props.isLoading) {
    emit('close');
    emit('cancel');
  }
};

const confirm = () => {
  if (!props.isLoading) {
    emit('confirm');
  }
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100001;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.modal-header {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  border-bottom: 2px solid #e5e7eb;
}

.modal-header.type-info {
  background: #eff6ff;
  border-bottom-color: #3b82f6;
}

.modal-header.type-success {
  background: #f0fdf4;
  border-bottom-color: #10b981;
}

.modal-header.type-warning {
  background: #fffbeb;
  border-bottom-color: #f59e0b;
}

.modal-header.type-danger {
  background: #fef2f2;
  border-bottom-color: #ef4444;
}

.header-icon {
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.type-info .header-icon {
  color: #3b82f6;
}

.type-success .header-icon {
  color: #10b981;
}

.type-warning .header-icon {
  color: #f59e0b;
}

.type-danger .header-icon {
  color: #ef4444;
}

.modal-header h3 {
  flex: 1;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #1a1a1a;
}

.modal-body {
  padding: 24px;
}

.message {
  font-size: 16px;
  color: #374151;
  line-height: 1.6;
  margin-bottom: 20px;
}

.details-section {
  background: #f9fafb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 14px;
}

.detail-value {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 14px;
  text-align: right;
}

.warning-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 6px;
  color: #92400e;
  font-size: 14px;
  font-weight: 500;
}

.warning-box i {
  font-size: 18px;
  color: #f59e0b;
}

.modal-footer {
  padding: 20px 24px;
  background: #f9fafb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-confirm {
  color: white;
  border: none;
}

.btn-confirm.type-info {
  background: #3b82f6;
}

.btn-confirm.type-info:hover {
  background: #2563eb;
}

.btn-confirm.type-success {
  background: #10b981;
}

.btn-confirm.type-success:hover {
  background: #059669;
}

.btn-confirm.type-warning {
  background: #f59e0b;
}

.btn-confirm.type-warning:hover {
  background: #d97706;
}

.btn-confirm.type-danger {
  background: #ef4444;
}

.btn-confirm.type-danger:hover {
  background: #dc2626;
}

.btn-confirm:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-confirm:disabled:hover {
  background: inherit;
}

/* Transitions */
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
  transform: scale(0.9);
}
</style>
