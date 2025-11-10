<template>
  <div class="notification-bulk-actions" v-if="selectedNotifications.length > 0">
    <div class="bulk-actions-bar">
      <div class="selected-info">
        <i class="fas fa-check-circle"></i>
        <span>{{ selectedNotifications.length }} thông báo được chọn</span>
      </div>
      
      <div class="bulk-actions">
        <!-- Publish/Unpublish -->
        <button
          v-if="canPublish"
          class="bulk-action-btn publish"
          @click="handleBulkAction('publish')"
          title="Xuất bản các thông báo đã chọn"
        >
          <i class="fas fa-paper-plane"></i>
          Xuất bản
        </button>
        
        <button
          v-if="canPublish"
          class="bulk-action-btn unpublish"
          @click="handleBulkAction('unpublish')"
          title="Chuyển về nháp"
        >
          <i class="fas fa-pause"></i>
          Về nháp
        </button>

        <!-- Archive (Admin only) -->
        <button
          v-if="canArchive"
          class="bulk-action-btn archive"
          @click="handleBulkAction('archive')"
          title="Lưu trữ các thông báo đã chọn"
        >
          <i class="fas fa-archive"></i>
          Lưu trữ
        </button>

        <!-- Change Category -->
        <div class="bulk-action-dropdown" v-if="canChangeCategory">
          <button class="bulk-action-btn category" @click="toggleCategoryDropdown">
            <i class="fas fa-tags"></i>
            Đổi danh mục
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="dropdown-menu" v-show="showCategoryDropdown">
            <button
              v-for="category in availableCategories"
              :key="category.id"
              class="dropdown-item"
              @click="handleBulkAction('category', category.id)"
            >
              <i :class="category.icon"></i>
              {{ category.name }}
            </button>
          </div>
        </div>

        <!-- Change Priority -->
        <div class="bulk-action-dropdown" v-if="canChangePriority">
          <button class="bulk-action-btn priority" @click="togglePriorityDropdown">
            <i class="fas fa-exclamation-circle"></i>
            Đổi mức độ
            <i class="fas fa-chevron-down"></i>
          </button>
          <div class="dropdown-menu" v-show="showPriorityDropdown">
            <button
              class="dropdown-item"
              @click="handleBulkAction('priority', 'high')"
            >
              <span class="priority-indicator high"></span>
              Cao
            </button>
            <button
              class="dropdown-item"
              @click="handleBulkAction('priority', 'medium')"
            >
              <span class="priority-indicator medium"></span>
              Trung bình
            </button>
            <button
              class="dropdown-item"
              @click="handleBulkAction('priority', 'low')"
            >
              <span class="priority-indicator low"></span>
              Thấp
            </button>
          </div>
        </div>

        <!-- Schedule -->
        <button
          v-if="canSchedule"
          class="bulk-action-btn schedule"
          @click="handleBulkAction('schedule')"
          title="Lên lịch gửi"
        >
          <i class="fas fa-clock"></i>
          Lên lịch
        </button>

        <!-- Export -->
        <button
          v-if="canExport"
          class="bulk-action-btn export"
          @click="handleBulkAction('export')"
          title="Xuất dữ liệu"
        >
          <i class="fas fa-download"></i>
          Xuất
        </button>

        <!-- Delete -->
        <button
          v-if="canDelete"
          class="bulk-action-btn delete"
          @click="handleBulkAction('delete')"
          title="Xóa các thông báo đã chọn"
        >
          <i class="fas fa-trash"></i>
          Xóa
        </button>
      </div>

      <div class="bulk-actions-controls">
        <button class="clear-selection-btn" @click="$emit('clear-selection')">
          <i class="fas fa-times"></i>
          Bỏ chọn
        </button>
      </div>
    </div>

    <!-- Confirmation Modals -->
    <div class="confirmation-modal" v-if="showConfirmModal" @click.self="closeConfirmModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ confirmAction.title }}</h3>
          <button class="close-btn" @click="closeConfirmModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ confirmAction.message }}</p>
          <div class="selected-count">
            <strong>{{ selectedNotifications.length }}</strong> thông báo sẽ bị ảnh hưởng
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeConfirmModal">
            Hủy
          </button>
          <button 
            class="btn"
            :class="confirmAction.buttonClass"
            @click="executeAction"
          >
            {{ confirmAction.buttonText }}
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <div class="schedule-modal" v-if="showScheduleModal" @click.self="closeScheduleModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Lên lịch gửi thông báo</h3>
          <button class="close-btn" @click="closeScheduleModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Ngày gửi</label>
            <input
              type="date"
              v-model="scheduleData.date"
              :min="today"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Thời gian</label>
            <input
              type="time"
              v-model="scheduleData.time"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Ghi chú (tùy chọn)</label>
            <textarea
              v-model="scheduleData.note"
              placeholder="Ghi chú về lịch gửi thông báo..."
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeScheduleModal">
            Hủy
          </button>
          <button 
            class="btn btn-primary"
            @click="executeSchedule"
            :disabled="!scheduleData.date || !scheduleData.time"
          >
            Lên lịch
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  selectedNotifications: {
    type: Array,
    default: () => []
  },
  userRole: {
    type: String,
    required: true
  },
  availableCategories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['bulk-action', 'clear-selection'])

// Local state
const showCategoryDropdown = ref(false)
const showPriorityDropdown = ref(false)
const showConfirmModal = ref(false)
const showScheduleModal = ref(false)
const confirmAction = ref({})
const scheduleData = ref({
  date: '',
  time: '',
  note: ''
})

// Computed properties for permissions
const canPublish = computed(() => {
  return ['admin', 'staff', 'teacher'].includes(props.userRole)
})

const canArchive = computed(() => {
  return props.userRole === 'admin'
})

const canChangeCategory = computed(() => {
  return ['admin', 'staff'].includes(props.userRole)
})

const canChangePriority = computed(() => {
  return ['admin', 'staff', 'teacher'].includes(props.userRole)
})

const canSchedule = computed(() => {
  return ['admin', 'staff', 'teacher'].includes(props.userRole)
})

const canExport = computed(() => {
  return ['admin', 'staff'].includes(props.userRole)
})

const canDelete = computed(() => {
  return ['admin', 'staff'].includes(props.userRole)
})

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Methods
const toggleCategoryDropdown = () => {
  showCategoryDropdown.value = !showCategoryDropdown.value
  showPriorityDropdown.value = false
}

const togglePriorityDropdown = () => {
  showPriorityDropdown.value = !showPriorityDropdown.value
  showCategoryDropdown.value = false
}

const handleBulkAction = (action, value = null) => {
  // Close dropdowns
  showCategoryDropdown.value = false
  showPriorityDropdown.value = false

  // Handle different actions
  switch (action) {
    case 'delete':
      confirmAction.value = {
        type: 'delete',
        title: 'Xác nhận xóa',
        message: 'Bạn có chắc chắn muốn xóa các thông báo đã chọn? Hành động này không thể hoàn tác.',
        buttonText: 'Xóa',
        buttonClass: 'btn-danger'
      }
      showConfirmModal.value = true
      break
      
    case 'archive':
      confirmAction.value = {
        type: 'archive',
        title: 'Xác nhận lưu trữ',
        message: 'Các thông báo sẽ được chuyển vào khu vực lưu trữ và không hiển thị với người dùng.',
        buttonText: 'Lưu trữ',
        buttonClass: 'btn-warning'
      }
      showConfirmModal.value = true
      break
      
    case 'publish':
      emit('bulk-action', { action: 'publish', notifications: props.selectedNotifications })
      break
      
    case 'unpublish':
      emit('bulk-action', { action: 'unpublish', notifications: props.selectedNotifications })
      break
      
    case 'category':
      emit('bulk-action', { 
        action: 'category', 
        notifications: props.selectedNotifications,
        value: value
      })
      break
      
    case 'priority':
      emit('bulk-action', { 
        action: 'priority', 
        notifications: props.selectedNotifications,
        value: value
      })
      break
      
    case 'schedule':
      showScheduleModal.value = true
      break
      
    case 'export':
      emit('bulk-action', { action: 'export', notifications: props.selectedNotifications })
      break
  }
}

const executeAction = () => {
  emit('bulk-action', { 
    action: confirmAction.value.type, 
    notifications: props.selectedNotifications 
  })
  closeConfirmModal()
}

const executeSchedule = () => {
  if (scheduleData.value.date && scheduleData.value.time) {
    emit('bulk-action', { 
      action: 'schedule', 
      notifications: props.selectedNotifications,
      value: {
        date: scheduleData.value.date,
        time: scheduleData.value.time,
        note: scheduleData.value.note
      }
    })
    closeScheduleModal()
  }
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  confirmAction.value = {}
}

const closeScheduleModal = () => {
  showScheduleModal.value = false
  scheduleData.value = { date: '', time: '', note: '' }
}

// Close dropdowns when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.bulk-action-dropdown')) {
    showCategoryDropdown.value = false
    showPriorityDropdown.value = false
  }
})
</script>

<style scoped>
.notification-bulk-actions {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
  overflow: hidden;
}

.bulk-actions-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.selected-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
  font-weight: 600;
  font-size: 14px;
}

.selected-info i {
  color: #a7f3d0;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.bulk-action-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  backdrop-filter: blur(10px);
}

.bulk-action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.bulk-action-btn.delete:hover {
  background: #ef4444;
  border-color: #ef4444;
}

.bulk-action-btn.publish:hover {
  background: #10b981;
  border-color: #10b981;
}

.bulk-action-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  z-index: 100;
  margin-top: 4px;
  overflow: hidden;
}

.dropdown-item {
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.dropdown-item:hover {
  background: #f9fafb;
}

.priority-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.priority-indicator.high {
  background: #ef4444;
}

.priority-indicator.medium {
  background: #f59e0b;
}

.priority-indicator.low {
  background: #10b981;
}

.bulk-actions-controls {
  display: flex;
  align-items: center;
}

.clear-selection-btn {
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-selection-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Modal Styles */
.confirmation-modal,
.schedule-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  z-index: 100000;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 16px;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
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
  padding: 0 24px 16px;
}

.modal-body p {
  margin: 0 0 16px;
  color: #6b7280;
  line-height: 1.6;
}

.selected-count {
  padding: 12px 16px;
  background: #f0f9ff;
  border-radius: 8px;
  color: #1e40af;
  font-size: 14px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;
  border-top: 1px solid #f3f4f6;
}

.btn {
  padding: 10px 20px;
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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

.btn-warning {
  background: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background: #d97706;
}

@media (max-width: 768px) {
  .bulk-actions-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .bulk-actions {
    justify-content: center;
  }
  
  .modal-content {
    margin: 20px;
    max-width: none;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
}
</style>