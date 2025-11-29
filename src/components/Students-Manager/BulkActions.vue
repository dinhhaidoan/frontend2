<template>
  <div v-if="selectedCount > 0" class="bulk-actions">
    <div class="bulk-info">
      <i class="fas fa-check-square"></i>
      <span>Đã chọn <strong>{{ selectedCount }}</strong> sinh viên</span>
    </div>

    <div class="action-buttons">
      <button @click="handleChangeClass" class="btn-action change-class">
        <i class="fas fa-exchange-alt"></i>
        Chuyển lớp
      </button>
      <button @click="handleAssignAdvisor" class="btn-action assign-advisor">
        <i class="fas fa-user-tie"></i>
        Phân công CVHT
      </button>

      <button @click="handleExport" class="btn-action export">
        <i class="fas fa-file-export"></i>
        Xuất danh sách
      </button>

      <button @click="handleSendNotification" class="btn-action notify">
        <i class="fas fa-bell"></i>
        Gửi thông báo
      </button>

      <button @click="handleDelete" class="btn-action delete">
        <i class="fas fa-trash"></i>
        Xóa
      </button>
    </div>

    <button @click="$emit('clear-selection')" class="btn-clear">
      <i class="fas fa-times"></i>
    </button>
  </div>

  <!-- Change Class Modal -->
  <div v-if="showChangeClassModal" class="modal-overlay" @click.self="showChangeClassModal = false">
    <div class="modal-small">
      <h3><i class="fas fa-exchange-alt"></i> Chuyển lớp hàng loạt</h3>
      <p>Chuyển {{ selectedCount }} sinh viên sang lớp mới</p>
      
      <div class="form-group">
        <label>Lớp mới <span class="required">*</span></label>
        <select v-model="newClass" required>
          <option value="">Chọn lớp</option>
          <option v-for="cls in classList" :key="cls" :value="cls">{{ cls }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Lý do chuyển lớp</label>
        <textarea v-model="changeReason" rows="3" placeholder="VD: Trùng lịch học"></textarea>
      </div>

      <div class="modal-actions">
        <button @click="showChangeClassModal = false" class="btn-cancel">Hủy</button>
        <button @click="confirmChangeClass" class="btn-confirm">Xác nhận</button>
      </div>
    </div>
  </div>

  <!-- Assign Advisor Modal -->
  <div v-if="showAssignAdvisorModal" class="modal-overlay" @click.self="showAssignAdvisorModal = false">
    <div class="modal-small">
      <h3><i class="fas fa-user-tie"></i> Phân công cố vấn học tập</h3>
      <p>Phân công CVHT cho {{ selectedCount }} sinh viên</p>
      
      <div class="form-group">
        <label>Cố vấn học tập <span class="required">*</span></label>
        <select v-model="newAdvisor" required>
          <option value="">Chọn cố vấn</option>
          <option v-for="advisor in advisorList" :key="advisor.id" :value="advisor.id">
            {{ advisor.name }}
          </option>
        </select>
      </div>

      <div class="modal-actions">
        <button @click="showAssignAdvisorModal = false" class="btn-cancel">Hủy</button>
        <button @click="confirmAssignAdvisor" class="btn-confirm">Xác nhận</button>
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
  }
})

const emit = defineEmits([
  'clear-selection',
  'change-class',
  'change-status',
  'assign-advisor',
  'export',
  'send-notification',
  'delete'
])

const showChangeClassModal = ref(false)
const showChangeStatusModal = ref(false)
const showAssignAdvisorModal = ref(false)

const newClass = ref('')
const changeReason = ref('')

const newStatus = ref('')
const statusReason = ref('')
const reserveStartDate = ref('')
const reserveEndDate = ref('')

const newAdvisor = ref('')

const classList = ref([
  '22IT1', '22IT2', '22IT3', '22IT4',
  '23IT1', '23IT2', '23IT3',
  '24IT1', '24IT2'
])

const advisorList = ref([
  { id: 1, name: 'TS. Nguyễn Văn A' },
  { id: 2, name: 'ThS. Trần Thị B' },
  { id: 3, name: 'TS. Lê Văn C' },
  { id: 4, name: 'PGS.TS. Phạm Thị D' }
])

const handleChangeClass = () => {
  showChangeClassModal.value = true
}

const confirmChangeClass = () => {
  if (!newClass.value) {
    alert('Vui lòng chọn lớp mới')
    return
  }
  
  emit('change-class', {
    newClass: newClass.value,
    reason: changeReason.value
  })
  
  showChangeClassModal.value = false
  newClass.value = ''
  changeReason.value = ''
}

const handleChangeStatus = () => {
  showChangeStatusModal.value = true
}

const handleAssignAdvisor = () => {
  showAssignAdvisorModal.value = true
}

const confirmAssignAdvisor = () => {
  if (!newAdvisor.value) {
    alert('Vui lòng chọn cố vấn học tập')
    return
  }
  
  emit('assign-advisor', {
    advisorId: newAdvisor.value
  })
  
  showAssignAdvisorModal.value = false
  newAdvisor.value = ''
}

const handleExport = () => {
  emit('export')
}

const handleSendNotification = () => {
  emit('send-notification')
}

const handleDelete = () => {
  if (confirm(`Bạn có chắc chắn muốn xóa ${props.selectedCount} sinh viên đã chọn?`)) {
    emit('delete')
  }
}
</script>

<style scoped>
.bulk-actions {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bulk-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1rem;
}

.bulk-info i {
  font-size: 1.3rem;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  flex: 1;
}

.btn-action {
  padding: 8px 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 0.9rem;
  white-space: nowrap;
}

.btn-action:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.btn-action i {
  margin-right: 6px;
}

.btn-action.delete {
  background: rgba(231, 76, 60, 0.3);
  border-color: rgba(231, 76, 60, 0.5);
}

.btn-action.delete:hover {
  background: rgba(231, 76, 60, 0.5);
}

.btn-clear {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-clear:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

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
  z-index: 1001;
  padding: 20px;
}

.modal-small {
  background: white;
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-small h3 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 1.3rem;
}

.modal-small h3 i {
  color: #667eea;
  margin-right: 8px;
}

.modal-small p {
  margin: 0 0 20px;
  color: #7f8c8d;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #34495e;
  margin-bottom: 8px;
  font-size: 0.95rem;
}

.required {
  color: #e74c3c;
  margin-left: 4px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group textarea {
  resize: vertical;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 10px;
}

.date-range input {
  flex: 1;
}

.date-range span {
  color: #7f8c8d;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel,
.btn-confirm {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-cancel {
  background: #ecf0f1;
  color: #2c3e50;
}

.btn-cancel:hover {
  background: #bdc3c7;
}

.btn-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .bulk-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-action {
    width: 100%;
  }

  .btn-clear {
    align-self: center;
  }

  .date-range {
    flex-direction: column;
  }

  .date-range input {
    width: 100%;
  }
}
</style>
