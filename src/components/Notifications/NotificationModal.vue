<template>
  <div class="notification-modal-overlay" @click.self="$emit('close')">
    <div class="notification-modal">
      <div class="modal-header">
        <h2>{{ modalTitle }}</h2>
        <button class="close-btn" @click="$emit('close')">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSave">
          <!-- Basic Information -->
          <div class="form-section">
            <h3>Thông tin cơ bản</h3>
            
            <div class="form-group">
              <label>Tiêu đề <span class="required">*</span></label>
              <input
                type="text"
                v-model="form.title"
                placeholder="Nhập tiêu đề thông báo..."
                class="form-input"
                required
                :disabled="mode === 'view'"
              />
            </div>

            <div class="form-group">
              <label>Nội dung <span class="required">*</span></label>
              <textarea
                v-model="form.content"
                placeholder="Nhập nội dung thông báo..."
                class="form-textarea"
                rows="6"
                required
                :disabled="mode === 'view'"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Danh mục</label>
                <select v-model="form.category" class="form-select" :disabled="mode === 'view'">
                  <option value="">Chọn danh mục</option>
                  <option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Mức độ ưu tiên</label>
                <select v-model="form.priority" class="form-select" :disabled="mode === 'view'">
                  <option value="low">Thấp</option>
                  <option value="medium">Trung bình</option>
                  <option value="high">Cao</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Publishing Options (Admin/Staff/Teacher) -->
          <div class="form-section" v-if="canManagePublishing">
            <h3>Tùy chọn xuất bản</h3>
            
            <div class="form-group">
              <label>Trạng thái</label>
              <div class="radio-group">
                <label class="radio-option">
                  <input
                    type="radio"
                    value="draft"
                    v-model="form.status"
                    :disabled="mode === 'view'"
                  />
                  <span>Bản nháp</span>
                </label>
                <label class="radio-option">
                  <input
                    type="radio"
                    value="published"
                    v-model="form.status"
                    :disabled="mode === 'view'"
                  />
                  <span>Xuất bản ngay</span>
                </label>
                <label class="radio-option" v-if="userRole !== 'teacher'">
                  <input
                    type="radio"
                    value="scheduled"
                    v-model="form.status"
                    :disabled="mode === 'view'"
                  />
                  <span>Lên lịch</span>
                </label>
              </div>
            </div>

            <!-- Schedule Options -->
            <div class="form-row" v-if="form.status === 'scheduled'">
              <div class="form-group">
                <label>Ngày gửi</label>
                <input
                  type="date"
                  v-model="form.scheduledDate"
                  :min="today"
                  class="form-input"
                  :disabled="mode === 'view'"
                />
              </div>
              <div class="form-group">
                <label>Thời gian</label>
                <input
                  type="time"
                  v-model="form.scheduledTime"
                  class="form-input"
                  :disabled="mode === 'view'"
                />
              </div>
            </div>
          </div>

          <!-- Recipients (Admin/Staff) -->
          <div class="form-section" v-if="canSelectRecipients">
            <h3>Người nhận</h3>
            
            <div class="form-group">
              <label>Nhóm đối tượng</label>
              <div class="checkbox-group">
                <label class="checkbox-option">
                  <input
                    type="checkbox"
                    value="students"
                    v-model="form.recipients"
                    :disabled="mode === 'view'"
                  />
                  <span>Sinh viên</span>
                </label>
                <label class="checkbox-option">
                  <input
                    type="checkbox"
                    value="teachers"
                    v-model="form.recipients"
                    :disabled="mode === 'view'"
                  />
                  <span>Giảng viên</span>
                </label>
                <label class="checkbox-option" v-if="userRole === 'admin'">
                  <input
                    type="checkbox"
                    value="staff"
                    v-model="form.recipients"
                    :disabled="mode === 'view'"
                  />
                  <span>Giáo vụ</span>
                </label>
                <label class="checkbox-option" v-if="userRole === 'admin'">
                  <input
                    type="checkbox"
                    value="all"
                    v-model="form.recipients"
                    :disabled="mode === 'view'"
                  />
                  <span>Tất cả</span>
                </label>
              </div>
            </div>
          </div>

          <!-- Advanced Options -->
          <div class="form-section" v-if="canUseAdvancedOptions">
            <h3>Tùy chọn nâng cao</h3>
            
            <div class="form-group">
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  v-model="form.requireConfirmation"
                  :disabled="mode === 'view'"
                />
                <span>Yêu cầu xác nhận đã đọc</span>
              </label>
            </div>

            <div class="form-group">
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  v-model="form.allowComments"
                  :disabled="mode === 'view'"
                />
                <span>Cho phép bình luận</span>
              </label>
            </div>

            <div class="form-group" v-if="userRole === 'admin'">
              <label class="checkbox-option">
                <input
                  type="checkbox"
                  v-model="form.isSystemNotification"
                  :disabled="mode === 'view'"
                />
                <span>Thông báo hệ thống</span>
              </label>
            </div>
          </div>
        </form>
      </div>

      <div class="modal-footer" v-if="mode !== 'view'">
        <button type="button" class="btn btn-secondary" @click="$emit('close')">
          Hủy
        </button>
        <button type="button" class="btn btn-primary" @click="handleSave">
          {{ mode === 'create' ? 'Tạo thông báo' : 'Cập nhật' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useModalBodyScroll } from '@/composables/useModalBodyScroll'

const props = defineProps({
  notification: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'create' // 'create' | 'edit' | 'view'
  },
  userRole: {
    type: String,
    required: true
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'close'])

// Sử dụng composable để quản lý body scroll
useModalBodyScroll()

// Form data
const form = ref({
  title: '',
  content: '',
  category: '',
  priority: 'medium',
  status: 'draft',
  scheduledDate: '',
  scheduledTime: '',
  recipients: [],
  requireConfirmation: false,
  allowComments: false,
  isSystemNotification: false
})

// Computed properties
const modalTitle = computed(() => {
  switch (props.mode) {
    case 'create':
      return 'Tạo thông báo mới'
    case 'edit':
      return 'Chỉnh sửa thông báo'
    case 'view':
      return 'Xem thông báo'
    default:
      return 'Thông báo'
  }
})

const canManagePublishing = computed(() => {
  return ['admin', 'staff', 'teacher'].includes(props.userRole)
})

const canSelectRecipients = computed(() => {
  return ['admin', 'staff'].includes(props.userRole)
})

const canUseAdvancedOptions = computed(() => {
  return ['admin', 'staff', 'teacher'].includes(props.userRole)
})

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Methods
const initializeForm = () => {
  if (props.notification && props.mode !== 'create') {
    form.value = {
      title: props.notification.title || '',
      content: props.notification.content || '',
      category: props.notification.category || '',
      priority: props.notification.priority || 'medium',
      status: props.notification.status || 'draft',
      scheduledDate: props.notification.scheduledDate || '',
      scheduledTime: props.notification.scheduledTime || '',
      recipients: props.notification.recipients || [],
      requireConfirmation: props.notification.requireConfirmation || false,
      allowComments: props.notification.allowComments || false,
      isSystemNotification: props.notification.isSystemNotification || false
    }
  } else {
    // Reset form for create mode
    form.value = {
      title: '',
      content: '',
      category: '',
      priority: 'medium',
      status: 'draft',
      scheduledDate: '',
      scheduledTime: '',
      recipients: [],
      requireConfirmation: false,
      allowComments: false,
      isSystemNotification: false
    }
  }
}

const handleSave = () => {
  // Validate required fields
  if (!form.value.title.trim() || !form.value.content.trim()) {
    alert('Vui lòng điền đầy đủ tiêu đề và nội dung')
    return
  }

  // Validate schedule if needed
  if (form.value.status === 'scheduled') {
    if (!form.value.scheduledDate || !form.value.scheduledTime) {
      alert('Vui lòng chọn ngày và giờ gửi thông báo')
      return
    }
  }

  // Emit save event
  emit('save', { ...form.value })
}

// Watchers
watch(() => props.notification, initializeForm, { immediate: true })

// Lifecycle
onMounted(() => {
  initializeForm()
})
</script>

<style scoped>
.notification-modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2147483647 !important;
  padding: 20px;
  backdrop-filter: blur(4px);
  isolation: isolate;
  pointer-events: auto;
  overflow: hidden !important;
}

.notification-modal {
  background: white !important;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative !important;
  z-index: 2147483647 !important;
  transform: translateZ(0);
  will-change: transform;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 24px;
}

.modal-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 0 24px;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.form-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.form-group {
  margin-bottom: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.form-input,
.form-textarea,
.form-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input:disabled,
.form-textarea:disabled,
.form-select:disabled {
  background: #f9fafb;
  color: #6b7280;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.radio-group,
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.radio-option,
.checkbox-option {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  margin-bottom: 0 !important;
}

.radio-option input,
.checkbox-option input {
  margin: 0;
}

.radio-option input:disabled,
.checkbox-option input:disabled {
  cursor: not-allowed;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #f3f4f6;
}

.btn {
  padding: 12px 24px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .notification-modal {
    margin: 20px;
    max-width: none;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .radio-group,
  .checkbox-group {
    flex-direction: column;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>