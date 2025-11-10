<template>
  <div class="bulk-actions" v-if="selectedCount > 0">
    <div class="bulk-actions-container">
      <div class="selection-summary">
        <span class="count">{{ selectedCount }} ghi chú được chọn</span>
        <button @click="$emit('clear-selection')" class="clear-btn">
          <i class="fas fa-times"></i>
          Bỏ chọn
        </button>
      </div>
      
      <div class="actions-group">
        <!-- Status Actions -->
        <div class="action-group">
          <span class="group-label">Trạng thái:</span>
          <button 
            @click="handleBulkAction('status', 'active')" 
            class="bulk-btn status active"
            title="Đánh dấu hoạt động"
          >
            <i class="fas fa-circle"></i>
            Hoạt động
          </button>
          <button 
            @click="handleBulkAction('status', 'completed')" 
            class="bulk-btn status completed"
            title="Đánh dấu hoàn thành"
          >
            <i class="fas fa-check-circle"></i>
            Hoàn thành
          </button>
          <button 
            @click="handleBulkAction('status', 'draft')" 
            class="bulk-btn status draft"
            title="Đánh dấu nháp"
          >
            <i class="fas fa-edit"></i>
            Nháp
          </button>
        </div>
        
        <!-- Priority Actions -->
        <div class="action-group">
          <span class="group-label">Ưu tiên:</span>
          <button 
            @click="handleBulkAction('priority', 'high')" 
            class="bulk-btn priority high"
            title="Đặt ưu tiên cao"
          >
            <i class="fas fa-arrow-up"></i>
            Cao
          </button>
          <button 
            @click="handleBulkAction('priority', 'medium')" 
            class="bulk-btn priority medium"
            title="Đặt ưu tiên trung bình"
          >
            <i class="fas fa-minus"></i>
            TB
          </button>
          <button 
            @click="handleBulkAction('priority', 'low')" 
            class="bulk-btn priority low"
            title="Đặt ưu tiên thấp"
          >
            <i class="fas fa-arrow-down"></i>
            Thấp
          </button>
        </div>
        
        <!-- Category Actions -->
        <div class="action-group">
          <span class="group-label">Danh mục:</span>
          <select 
            @change="handleCategoryChange"
            class="category-select"
            v-model="selectedCategory"
          >
            <option value="">Chọn danh mục</option>
            <option value="study">📚 Học tập</option>
            <option value="project">📋 Dự án</option>
            <option value="meeting">👥 Cuộc họp</option>
            <option value="resource">📖 Tài liệu</option>
            <option value="personal">👤 Cá nhân</option>
            <option value="work">💼 Công việc</option>
          </select>
        </div>
        
        <!-- Other Actions -->
        <div class="action-group">
          <span class="group-label">Khác:</span>
          <button 
            @click="handleBulkAction('toggle-favorite')" 
            class="bulk-btn favorite"
            title="Thêm/Bỏ yêu thích"
          >
            <i class="fas fa-heart"></i>
            Yêu thích
          </button>
          <button 
            @click="handleBulkAction('toggle-archive')" 
            class="bulk-btn archive"
            title="Lưu trữ/Bỏ lưu trữ"
          >
            <i class="fas fa-archive"></i>
            Lưu trữ
          </button>
          <button 
            @click="handleBulkAction('export')" 
            class="bulk-btn export"
            title="Xuất file"
          >
            <i class="fas fa-download"></i>
            Xuất
          </button>
        </div>
        
        <!-- Dangerous Actions -->
        <div class="action-group danger">
          <button 
            @click="handleBulkAction('delete')" 
            class="bulk-btn delete"
            title="Xóa các ghi chú đã chọn"
          >
            <i class="fas fa-trash"></i>
            Xóa
          </button>
        </div>
      </div>
    </div>
    
    <!-- Confirmation Modal -->
    <div v-if="showConfirmModal" class="modal-overlay" @click="closeConfirmModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ confirmAction.title }}</h3>
          <button @click="closeConfirmModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="confirm-icon" :class="confirmAction.type">
            <i :class="confirmAction.icon"></i>
          </div>
          <p>{{ confirmAction.message }}</p>
          <div class="confirm-details">
            <strong>{{ selectedCount }} ghi chú</strong> sẽ bị ảnh hưởng bởi thao tác này.
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeConfirmModal" class="btn-cancel">
            Hủy
          </button>
          <button 
            @click="confirmBulkAction" 
            class="btn-confirm"
            :class="confirmAction.type"
          >
            {{ confirmAction.confirmText }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  selectedCount: {
    type: Number,
    default: 0
  },
  selectedNotes: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'bulk-action',
  'clear-selection'
])

const selectedCategory = ref('')
const showConfirmModal = ref(false)
const confirmAction = ref({})
const pendingAction = ref(null)

const handleBulkAction = (action, value = null) => {
  // Actions that need confirmation
  const confirmActions = ['delete', 'toggle-archive']
  
  if (confirmActions.includes(action)) {
    showConfirmation(action, value)
  } else {
    executeBulkAction(action, value)
  }
}

const handleCategoryChange = () => {
  if (selectedCategory.value) {
    executeBulkAction('category', selectedCategory.value)
    selectedCategory.value = ''
  }
}

const showConfirmation = (action, value) => {
  const confirmMessages = {
    delete: {
      title: 'Xác nhận xóa',
      message: 'Bạn có chắc chắn muốn xóa các ghi chú đã chọn?',
      confirmText: 'Xóa',
      type: 'danger',
      icon: 'fas fa-trash'
    },
    'toggle-archive': {
      title: 'Xác nhận lưu trữ',
      message: 'Bạn có muốn lưu trữ/bỏ lưu trữ các ghi chú đã chọn?',
      confirmText: 'Lưu trữ',
      type: 'warning',
      icon: 'fas fa-archive'
    }
  }
  
  confirmAction.value = confirmMessages[action]
  pendingAction.value = { action, value }
  showConfirmModal.value = true
}

const confirmBulkAction = () => {
  if (pendingAction.value) {
    executeBulkAction(pendingAction.value.action, pendingAction.value.value)
  }
  closeConfirmModal()
}

const closeConfirmModal = () => {
  showConfirmModal.value = false
  confirmAction.value = {}
  pendingAction.value = null
}

const executeBulkAction = (action, value) => {
  emit('bulk-action', {
    action,
    value,
    selectedNotes: props.selectedNotes
  })
  
  // Show success message based on action
  showSuccessMessage(action, value)
}

const showSuccessMessage = (action, value) => {
  const messages = {
    status: `Đã cập nhật trạng thái cho ${props.selectedCount} ghi chú`,
    priority: `Đã cập nhật độ ưu tiên cho ${props.selectedCount} ghi chú`,
    category: `Đã cập nhật danh mục cho ${props.selectedCount} ghi chú`,
    'toggle-favorite': `Đã cập nhật yêu thích cho ${props.selectedCount} ghi chú`,
    'toggle-archive': `Đã cập nhật lưu trữ cho ${props.selectedCount} ghi chú`,
    export: `Đã xuất ${props.selectedCount} ghi chú`,
    delete: `Đã xóa ${props.selectedCount} ghi chú`
  }
  
  // You can implement a toast notification system here
  console.log(messages[action] || 'Thao tác hoàn thành')
}
</script>

<style scoped>
.bulk-actions {
  position: sticky;
  top: 80px;
  z-index: 100;
  margin-bottom: 24px;
}

.bulk-actions-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  color: white;
}

.selection-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.count {
  font-size: 16px;
  font-weight: 600;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.actions-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: center;
}

.action-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.action-group.danger {
  margin-left: auto;
}

.group-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
}

.bulk-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.bulk-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

/* Status Buttons */
.bulk-btn.status.active:hover { background: rgba(16, 185, 129, 0.3); }
.bulk-btn.status.completed:hover { background: rgba(59, 130, 246, 0.3); }
.bulk-btn.status.draft:hover { background: rgba(245, 158, 11, 0.3); }

/* Priority Buttons */
.bulk-btn.priority.high:hover { background: rgba(239, 68, 68, 0.3); }
.bulk-btn.priority.medium:hover { background: rgba(245, 158, 11, 0.3); }
.bulk-btn.priority.low:hover { background: rgba(16, 185, 129, 0.3); }

/* Other Buttons */
.bulk-btn.favorite:hover { background: rgba(239, 68, 68, 0.3); }
.bulk-btn.archive:hover { background: rgba(107, 114, 128, 0.3); }
.bulk-btn.export:hover { background: rgba(59, 130, 246, 0.3); }
.bulk-btn.delete:hover { background: rgba(239, 68, 68, 0.3); }

.category-select {
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 12px;
  cursor: pointer;
  min-width: 140px;
}

.category-select option {
  background: #374151;
  color: white;
}

/* Modal Styles */
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
  z-index: 9999;
}

.modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 64px rgba(0, 0, 0, 0.15);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 24px;
  text-align: center;
}

.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 24px;
}

.confirm-icon.danger {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.confirm-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.modal-body p {
  font-size: 16px;
  color: #374151;
  margin: 0 0 16px 0;
  line-height: 1.5;
}

.confirm-details {
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  justify-content: flex-end;
}

.btn-cancel, .btn-confirm {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: #3b82f6;
  border: 1px solid #3b82f6;
  color: white;
}

.btn-confirm:hover {
  background: #2563eb;
}

.btn-confirm.danger {
  background: #ef4444;
  border-color: #ef4444;
}

.btn-confirm.danger:hover {
  background: #dc2626;
}

.btn-confirm.warning {
  background: #f59e0b;
  border-color: #f59e0b;
}

.btn-confirm.warning:hover {
  background: #d97706;
}

/* Responsive */
@media (max-width: 1024px) {
  .actions-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .action-group {
    width: 100%;
    justify-content: flex-start;
  }
  
  .action-group.danger {
    margin-left: 0;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .bulk-actions-container {
    padding: 16px;
  }
  
  .selection-summary {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .action-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .bulk-btn {
    width: 100%;
    justify-content: center;
  }
  
  .category-select {
    width: 100%;
  }
}
</style>