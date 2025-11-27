<template>
  <div class="bulk-actions" v-if="selectedTeachers.length > 0">
    <div class="actions-header">
      <div class="selection-info">
        <i class="fas fa-check-square"></i>
        Đã chọn {{ selectedTeachers.length }} giảng viên
      </div>
      <button @click="$emit('clear-selection')" class="btn-clear">
        <i class="fas fa-times"></i>
        Bỏ chọn
      </button>
    </div>
    
    <div class="actions-buttons">
      <button @click="exportSelected" class="btn-action export">
        <i class="fas fa-download"></i>
        Xuất danh sách
      </button>
      
      <button @click="sendNotification" class="btn-action notify">
        <i class="fas fa-envelope"></i>
        Gửi thông báo
      </button>
      
      <button @click="changeDepartment" class="btn-action department">
        <i class="fas fa-exchange-alt"></i>
        Chuyển khoa
      </button>
      
      <button @click="changeStatus" class="btn-action status">
        <i class="fas fa-user-edit"></i>
        Đổi trạng thái
      </button>
      
      <button @click="deleteSelected" class="btn-action delete">
        <i class="fas fa-trash"></i>
        Xóa
      </button>
    </div>
    
    <!-- Change Status Modal -->
    <div v-if="showStatusModal" class="modal-overlay" @click="closeStatusModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Thay đổi trạng thái</h3>
          <button @click="closeStatusModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Thay đổi trạng thái cho {{ selectedTeachers.length }} giảng viên đã chọn:</p>
          <div class="status-options">
            <label>
              <input type="radio" v-model="newStatus" value="active" />
              <span class="status active">
                <i class="fas fa-check-circle"></i>
                Đang giảng dạy
              </span>
            </label>
            <label>
              <input type="radio" v-model="newStatus" value="on-break" />
              <span class="status on-break">
                <i class="fas fa-pause-circle"></i>
                Tạm nghỉ
              </span>
            </label>
            <label>
              <input type="radio" v-model="newStatus" value="resigned" />
              <span class="status resigned">
                <i class="fas fa-times-circle"></i>
                Nghỉ việc
              </span>
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeStatusModal" class="btn-cancel">Hủy</button>
          <button @click="applyStatusChange" class="btn-save" :disabled="!newStatus">
            Áp dụng
          </button>
        </div>
      </div>
    </div>
    
    <!-- Change Department Modal -->
    <div v-if="showDepartmentModal" class="modal-overlay" @click="closeDepartmentModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Chuyển khoa/bộ môn</h3>
          <button @click="closeDepartmentModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Chuyển {{ selectedTeachers.length }} giảng viên sang khoa/bộ môn mới:</p>
          <div class="form-group">
            <label>Chọn khoa/bộ môn</label>
            <select v-model="newDepartment">
              <option value="">-- Chọn khoa --</option>
              <option value="cntt">Công nghệ thông tin</option>
              <option value="dtvt">Điện tử viễn thông</option>
              <option value="kt">Kinh tế</option>
              <option value="nn">Ngoại ngữ</option>
              <option value="co-khi">Cơ khí</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeDepartmentModal" class="btn-cancel">Hủy</button>
          <button @click="applyDepartmentChange" class="btn-save" :disabled="!newDepartment">
            Chuyển khoa
          </button>
        </div>
      </div>
    </div>
    
    <!-- Send Notification Modal -->
    <div v-if="showNotificationModal" class="modal-overlay" @click="closeNotificationModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Gửi thông báo</h3>
          <button @click="closeNotificationModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Gửi thông báo đến {{ selectedTeachers.length }} giảng viên:</p>
          <div class="form-group">
            <label>Tiêu đề thông báo</label>
            <input 
              type="text" 
              v-model="notificationTitle"
              placeholder="Nhập tiêu đề thông báo..."
            />
          </div>
          <div class="form-group">
            <label>Nội dung thông báo</label>
            <textarea 
              v-model="notificationContent"
              rows="5"
              placeholder="Nhập nội dung thông báo..."
            ></textarea>
          </div>
          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="sendEmail" />
              Gửi qua email
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="closeNotificationModal" class="btn-cancel">Hủy</button>
          <button @click="sendNotificationToTeachers" class="btn-save" :disabled="!notificationTitle || !notificationContent">
            Gửi thông báo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'TeacherBulkActions',
  props: {
    selectedTeachers: {
      type: Array,
      default: () => []
    }
  },
  emits: [
    'clear-selection', 
    'export-selected', 
    'change-status', 
    'change-department', 
    'send-notification',
    'delete-selected'
  ],
  setup(props, { emit }) {
    const showStatusModal = ref(false)
    const showDepartmentModal = ref(false)
    const showNotificationModal = ref(false)
    const newStatus = ref('')
    const newDepartment = ref('')
    const notificationTitle = ref('')
    const notificationContent = ref('')
    const sendEmail = ref(true)
    
    const exportSelected = () => {
      emit('export-selected', props.selectedTeachers)
    }
    
    const sendNotification = () => {
      showNotificationModal.value = true
    }
    
    const changeDepartment = () => {
      showDepartmentModal.value = true
    }
    
    const changeStatus = () => {
      showStatusModal.value = true
    }
    
    const deleteSelected = () => {
      if (confirm(`Bạn có chắc chắn muốn xóa ${props.selectedTeachers.length} giảng viên đã chọn?`)) {
        emit('delete-selected', props.selectedTeachers)
      }
    }
    
    const closeStatusModal = () => {
      showStatusModal.value = false
      newStatus.value = ''
    }
    
    const closeDepartmentModal = () => {
      showDepartmentModal.value = false
      newDepartment.value = ''
    }
    
    const closeNotificationModal = () => {
      showNotificationModal.value = false
      notificationTitle.value = ''
      notificationContent.value = ''
      sendEmail.value = true
    }
    
    const applyStatusChange = () => {
      emit('change-status', {
        teacherIds: props.selectedTeachers,
        newStatus: newStatus.value
      })
      closeStatusModal()
    }
    
    const applyDepartmentChange = () => {
      emit('change-department', {
        teacherIds: props.selectedTeachers,
        newDepartment: newDepartment.value
      })
      closeDepartmentModal()
    }
    
    const sendNotificationToTeachers = () => {
      emit('send-notification', {
        teacherIds: props.selectedTeachers,
        title: notificationTitle.value,
        content: notificationContent.value,
        sendEmail: sendEmail.value
      })
      closeNotificationModal()
    }
    
    return {
      showStatusModal,
      showDepartmentModal,
      showNotificationModal,
      newStatus,
      newDepartment,
      notificationTitle,
      notificationContent,
      sendEmail,
      exportSelected,
      sendNotification,
      changeDepartment,
      changeStatus,
      deleteSelected,
      closeStatusModal,
      closeDepartmentModal,
      closeNotificationModal,
      applyStatusChange,
      applyDepartmentChange,
      sendNotificationToTeachers
    }
  }
}
</script>

<style scoped>
.bulk-actions {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
  border: 1px solid #e5e7eb;
  z-index: 100;
  min-width: 600px;
  max-width: 90vw;
}

.actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 12px 12px 0 0;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-weight: 500;
  font-size: 14px;
}

.selection-info i {
  color: #3b82f6;
}

.btn-clear {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.btn-clear:hover {
  background: #e5e7eb;
  color: #374151;
}

.actions-buttons {
  display: flex;
  gap: 8px;
  padding: 16px 20px;
}

.btn-action {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-action.export {
  background: #dcfce7;
  color: #166534;
}

.btn-action.export:hover {
  background: #bbf7d0;
}

.btn-action.notify {
  background: #dbeafe;
  color: #1d4ed8;
}

.btn-action.notify:hover {
  background: #bfdbfe;
}

.btn-action.department {
  background: #fef3c7;
  color: #92400e;
}

.btn-action.department:hover {
  background: #fed7aa;
}

.btn-action.status {
  background: #e0e7ff;
  color: #3730a3;
}

.btn-action.status:hover {
  background: #c7d2fe;
}

.btn-action.delete {
  background: #fecaca;
  color: #991b1b;
}

.btn-action.delete:hover {
  background: #fca5a5;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
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
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 20px;
}

.modal-body p {
  margin: 0 0 20px 0;
  color: #374151;
}

.status-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-options label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.status-options label:hover {
  background: #f9fafb;
}

.status-options input[type="radio"] {
  margin: 0;
}

.status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.status.active {
  background: #dcfce7;
  color: #166534;
}

.status.on-break {
  background: #fef3c7;
  color: #92400e;
}

.status.resigned {
  background: #fecaca;
  color: #991b1b;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  margin-bottom: 0 !important;
}

.checkbox-label input {
  width: auto !important;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-save {
  background: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.btn-save:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-save:disabled {
  background: #94a3b8;
  border-color: #94a3b8;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .bulk-actions {
    min-width: auto;
    width: calc(100% - 40px);
    left: 20px;
    transform: none;
  }
  
  .actions-buttons {
    flex-wrap: wrap;
  }
  
  .btn-action {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }
}
</style>