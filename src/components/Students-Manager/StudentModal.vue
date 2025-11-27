<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2>
          <i class="fas fa-user-graduate"></i>
          {{ isEdit ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên mới' }}
        </h2>
        <button @click="close" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Thông tin cơ bản -->
          <div class="form-section">
            <h3><i class="fas fa-id-card"></i> Thông tin cơ bản</h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label>Mã sinh viên <span class="required">*</span></label>
                <input
                  v-model="formData.studentCode"
                  type="text"
                  placeholder="VD: 2251052001"
                  required
                  :disabled="isEdit"
                />
              </div>

              <div class="form-group">
                <label>Họ và tên <span class="required">*</span></label>
                <input
                  v-model="formData.fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>

              <div class="form-group">
                <label>Ngày sinh <span class="required">*</span></label>
                <input v-model="formData.dateOfBirth" type="date" required />
              </div>

              <div class="form-group">
                <label>Giới tính <span class="required">*</span></label>
                <select v-model="formData.gender" required>
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Email <span class="required">*</span></label>
                <input
                  v-model="formData.email"
                  type="email"
                  placeholder="student@example.com"
                  required
                />
              </div>

              <div class="form-group">
                <label>Số điện thoại</label>
                <input
                  v-model="formData.phoneNumber"
                  type="tel"
                  placeholder="0123456789"
                />
              </div>

              <div class="form-group">
                <label>CCCD/CMND</label>
                <input
                  v-model="formData.identityCard"
                  type="text"
                  placeholder="001234567890"
                />
              </div>

              <div class="form-group full-width">
                <label>Địa chỉ thường trú</label>
                <textarea
                  v-model="formData.address"
                  rows="2"
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Thông tin học vụ -->
          <div class="form-section">
            <h3><i class="fas fa-graduation-cap"></i> Thông tin học vụ</h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label>Ngành học <span class="required">*</span></label>
                <select v-model="formData.major" required>
                  <option value="">Chọn ngành</option>
                  <option value="IT">Công nghệ thông tin</option>
                  <option value="CS">Khoa học máy tính</option>
                  <option value="IS">Hệ thống thông tin</option>
                  <option value="DS">Khoa học dữ liệu</option>
                  <option value="AI">Trí tuệ nhân tạo</option>
                  <option value="SE">Kỹ thuật phần mềm</option>
                </select>
              </div>

              <div class="form-group">
                <label>Khóa <span class="required">*</span></label>
                <select v-model="formData.course" required>
                  <option value="">Chọn khóa</option>
                  <option value="2020">K2020</option>
                  <option value="2021">K2021</option>
                  <option value="2022">K2022</option>
                  <option value="2023">K2023</option>
                  <option value="2024">K2024</option>
                </select>
              </div>

              <div class="form-group">
                <label>Lớp hành chính <span class="required">*</span></label>
                <select v-model="formData.officialClass" required>
                  <option value="">Chọn lớp</option>
                  <option v-for="cls in classList" :key="cls" :value="cls">{{ cls }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Trạng thái <span class="required">*</span></label>
                <select v-model="formData.status" required>
                  <option value="studying">Đang học</option>
                  <option value="reserved">Bảo lưu</option>
                  <option value="suspended">Nghỉ học</option>
                  <option value="graduated">Tốt nghiệp</option>
                  <option value="expelled">Thôi học</option>
                </select>
              </div>

              <div class="form-group">
                <label>Cố vấn học tập</label>
                <select v-model="formData.advisorId">
                  <option value="">Chưa phân công</option>
                  <option v-for="advisor in advisorList" :key="advisor.id" :value="advisor.id">
                    {{ advisor.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Ngày nhập học <span class="required">*</span></label>
                <input v-model="formData.enrollmentDate" type="date" required />
              </div>
            </div>
          </div>

          <!-- Thông tin phụ huynh -->
          <div class="form-section">
            <h3><i class="fas fa-users"></i> Thông tin phụ huynh</h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label>Họ tên phụ huynh</label>
                <input
                  v-model="formData.parentName"
                  type="text"
                  placeholder="Họ tên bố/mẹ"
                />
              </div>

              <div class="form-group">
                <label>SĐT phụ huynh</label>
                <input
                  v-model="formData.parentPhone"
                  type="tel"
                  placeholder="0123456789"
                />
              </div>

              <div class="form-group full-width">
                <label>Ghi chú</label>
                <textarea
                  v-model="formData.notes"
                  rows="3"
                  placeholder="Ghi chú về sinh viên (nếu có)"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button type="button" @click="close" class="btn-cancel">
              <i class="fas fa-times"></i> Hủy
            </button>
            <button type="submit" class="btn-submit">
              <i class="fas fa-save"></i>
              {{ isEdit ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  student: Object
})

const emit = defineEmits(['close', 'submit'])

const isEdit = ref(false)

const formData = reactive({
  studentCode: '',
  fullName: '',
  dateOfBirth: '',
  gender: '',
  email: '',
  phoneNumber: '',
  identityCard: '',
  address: '',
  major: '',
  course: '',
  officialClass: '',
  status: 'studying',
  advisorId: '',
  enrollmentDate: '',
  parentName: '',
  parentPhone: '',
  notes: ''
})

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

const resetForm = () => {
  Object.keys(formData).forEach((key) => {
    if (key === 'status') {
      formData[key] = 'studying'
    } else {
      formData[key] = ''
    }
  })
}

watch(
  () => props.student,
  (newStudent) => {
    if (newStudent) {
      isEdit.value = true
      Object.assign(formData, newStudent)
    } else {
      isEdit.value = false
      resetForm()
    }
  },
  { immediate: true }
)

const handleSubmit = () => {
  emit('submit', { ...formData })
}

const close = () => {
  emit('close')
}
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
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
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
  font-size: 1.5rem;
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

.form-section {
  margin-bottom: 30px;
}

.form-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #ecf0f1;
  font-size: 1.1rem;
}

.form-section h3 i {
  color: #667eea;
  margin-right: 8px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
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
  padding: 12px;
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

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.form-group textarea {
  resize: vertical;
  min-height: 60px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 2px solid #f0f0f0;
  margin-top: 20px;
}

.btn-cancel,
.btn-submit {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 1rem;
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

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    max-height: 100vh;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}
</style>
