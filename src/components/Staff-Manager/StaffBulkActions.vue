<template>
  <div class="bulk-actions" v-if="selectedTeachers.length > 0">
    <div class="actions-header">
      <div class="selection-info">
        <i class="fas fa-check-square"></i>
        Đã chọn {{ selectedTeachers.length }} giáo vụ
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
          <p>Thay đổi trạng thái cho {{ selectedTeachers.length }} giáo vụ đã chọn:</p>
          <div class="status-options">
            <label>
              <input type="radio" v-model="newStatus" value="active" />
              <span class="status active">
                <i class="fas fa-check-circle"></i>
                Đang công tác
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
          <p>Chuyển {{ selectedTeachers.length }} giáo vụ sang khoa/bộ môn mới:</p>
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
          <p>Gửi thông báo đến {{ selectedTeachers.length }} giáo vụ:</p>
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
  name: 'StaffBulkActions',
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
      emit('delete-selected', props.selectedTeachers)
    }
    
    const closeStatusModal = () => { showStatusModal.value = false }
    const closeDepartmentModal = () => { showDepartmentModal.value = false }
    const closeNotificationModal = () => { showNotificationModal.value = false }
    
    const applyStatusChange = () => {
      emit('change-status', newStatus.value, props.selectedTeachers)
      closeStatusModal()
    }
    
    const applyDepartmentChange = () => {
      emit('change-department', newDepartment.value, props.selectedTeachers)
      closeDepartmentModal()
    }
    
    const sendNotificationToTeachers = () => {
      emit('send-notification', { title: notificationTitle.value, content: notificationContent.value, sendEmail: sendEmail.value }, props.selectedTeachers)
      closeNotificationModal()
    }
    
    return { showStatusModal, showDepartmentModal, showNotificationModal, newStatus, newDepartment, notificationTitle, notificationContent, sendEmail, exportSelected, sendNotification, changeDepartment, changeStatus, deleteSelected, closeStatusModal, closeDepartmentModal, closeNotificationModal, applyStatusChange, applyDepartmentChange, sendNotificationToTeachers }
  }
}
</script>

<style scoped>
/* reuse teacher bulk actions styles */
</style>
