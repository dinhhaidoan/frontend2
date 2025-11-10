<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2><i class="fas fa-exchange-alt"></i> Chuyển sinh viên sang lớp khác</h2>
        <button @click="close" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <div class="student-info">
          <h3>Thông tin sinh viên</h3>
          <div class="info-card">
            <div class="info-row">
              <span class="label">Mã sinh viên:</span>
              <span class="value">{{ student.studentCode }}</span>
            </div>
            <div class="info-row">
              <span class="label">Họ và tên:</span>
              <span class="value">{{ student.fullName }}</span>
            </div>
            <div class="info-row">
              <span class="label">Lớp hiện tại:</span>
              <span class="value current-class">{{ student.officialClass }}</span>
            </div>
          </div>
        </div>

        <div class="transfer-form">
          <h3>Thông tin chuyển lớp</h3>
          
          <div class="form-group">
            <label>Lớp mới <span class="required">*</span></label>
            <select v-model="formData.newClass" required>
              <option value="">Chọn lớp mới</option>
              <option
                v-for="cls in availableClasses"
                :key="cls"
                :value="cls"
                :disabled="cls === student.officialClass"
              >
                {{ cls }}
                <template v-if="cls === student.officialClass"> (Lớp hiện tại)</template>
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>Lý do chuyển lớp <span class="required">*</span></label>
            <select v-model="formData.reason" required @change="handleReasonChange">
              <option value="">Chọn lý do</option>
              <option value="schedule_conflict">Trùng lịch học</option>
              <option value="academic_level">Phù hợp với trình độ học tập</option>
              <option value="student_request">Yêu cầu của sinh viên</option>
              <option value="class_balance">Cân bằng số lượng lớp</option>
              <option value="other">Lý do khác</option>
            </select>
          </div>

          <div v-if="formData.reason === 'other'" class="form-group">
            <label>Ghi chú cụ thể</label>
            <textarea
              v-model="formData.notes"
              rows="3"
              placeholder="Nhập lý do cụ thể..."
            ></textarea>
          </div>

          <div class="form-group">
            <label>Ngày có hiệu lực</label>
            <input v-model="formData.effectiveDate" type="date" />
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.notifyStudent" />
              <span>Gửi thông báo cho sinh viên</span>
            </label>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="formData.notifyAdvisor" />
              <span>Thông báo cho cố vấn học tập cũ và mới</span>
            </label>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="formData.newClass" class="preview">
          <h3><i class="fas fa-eye"></i> Xem trước thay đổi</h3>
          <div class="preview-content">
            <div class="preview-item from">
              <div class="preview-label">Từ lớp</div>
              <div class="preview-value">{{ student.officialClass }}</div>
            </div>
            <div class="preview-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
            <div class="preview-item to">
              <div class="preview-label">Sang lớp</div>
              <div class="preview-value">{{ formData.newClass }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="close" class="btn-cancel">
          <i class="fas fa-times"></i> Hủy
        </button>
        <button
          @click="handleSubmit"
          :disabled="!canSubmit"
          class="btn-submit"
        >
          <i class="fas fa-check"></i> Xác nhận chuyển lớp
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  student: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'submit'])

const formData = ref({
  newClass: '',
  reason: '',
  notes: '',
  effectiveDate: new Date().toISOString().split('T')[0],
  notifyStudent: true,
  notifyAdvisor: true
})

const availableClasses = ref([
  '22IT1', '22IT2', '22IT3', '22IT4',
  '23IT1', '23IT2', '23IT3',
  '24IT1', '24IT2'
])

const canSubmit = computed(() => {
  return (
    formData.value.newClass &&
    formData.value.newClass !== props.student.officialClass &&
    formData.value.reason &&
    (formData.value.reason !== 'other' || formData.value.notes)
  )
})

const handleReasonChange = () => {
  if (formData.value.reason !== 'other') {
    formData.value.notes = ''
  }
}

const handleSubmit = () => {
  if (!canSubmit.value) return

  emit('submit', {
    studentId: props.student.id,
    oldClass: props.student.officialClass,
    ...formData.value
  })

  resetForm()
}

const resetForm = () => {
  formData.value = {
    newClass: '',
    reason: '',
    notes: '',
    effectiveDate: new Date().toISOString().split('T')[0],
    notifyStudent: true,
    notifyAdvisor: true
  }
}

const close = () => {
  resetForm()
  emit('close')
}

watch(
  () => props.isOpen,
  (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
  }
)
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
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
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

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.3rem;
}

.modal-header h2 i {
  margin-right: 10px;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  color: white;
  font-size: 1.2rem;
  transition: all 0.3s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.student-info h3,
.transfer-form h3,
.preview h3 {
  margin: 0 0 16px;
  color: #2c3e50;
  font-size: 1.1rem;
  padding-bottom: 8px;
  border-bottom: 2px solid #ecf0f1;
}

.preview h3 i {
  color: #667eea;
  margin-right: 8px;
}

.info-card {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e0e0e0;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row .label {
  font-weight: 600;
  color: #7f8c8d;
}

.info-row .value {
  color: #2c3e50;
  font-weight: 500;
}

.current-class {
  background: #e3f2fd;
  color: #1976d2;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 600;
}

.transfer-form {
  margin-bottom: 24px;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s;
}

.checkbox-label:hover {
  background: #f8f9fa;
}

.checkbox-label input[type='checkbox'] {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.preview {
  background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
  padding: 20px;
  border-radius: 12px;
  margin-top: 24px;
}

.preview-content {
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-top: 16px;
}

.preview-item {
  text-align: center;
  padding: 16px 24px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.preview-label {
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 8px;
  font-weight: 600;
}

.preview-value {
  font-size: 1.3rem;
  font-weight: 700;
}

.preview-item.from .preview-value {
  color: #e74c3c;
}

.preview-item.to .preview-value {
  color: #27ae60;
}

.preview-arrow {
  font-size: 2rem;
  color: #667eea;
  animation: slide 1s infinite;
}

@keyframes slide {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(10px);
  }
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 2px solid #ecf0f1;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
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

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .preview-content {
    flex-direction: column;
    gap: 16px;
  }

  .preview-arrow {
    transform: rotate(90deg);
  }
}
</style>
