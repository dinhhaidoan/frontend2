<template>
  <div class="modal-overlay" @click="handleOverlayClick" v-if="isOpen">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-user-plus"></i>
          {{ isEdit ? 'Chỉnh sửa giảng viên' : 'Thêm giảng viên mới' }}
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <!-- Basic Information -->
            <div class="form-section full-width">
              <h4>Thông tin cơ bản</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="required">Mã giảng viên</label>
                  <input
                    type="text"
                    v-model="formData.code"
                    required
                    placeholder="VD: GV001"
                    :readonly="isEdit"
                  />
                  <small v-if="isEdit">Mã giảng viên không thể thay đổi</small>
                </div>
                
                <div class="form-group">
                  <label class="required">Họ và tên</label>
                  <input
                    type="text"
                    v-model="formData.name"
                    required
                    placeholder="Nhập họ tên đầy đủ"
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="required">Email</label>
                  <input
                    type="email"
                    v-model="formData.email"
                    required
                    placeholder="email@example.com"
                  />
                </div>
                
                <div class="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    v-model="formData.phone"
                    placeholder="0123456789"
                  />
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    v-model="formData.dateOfBirth"
                  />
                </div>
                
                <div class="form-group">
                  <label>Giới tính</label>
                  <select v-model="formData.gender">
                    <option value="">-- Chọn giới tính --</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Academic Information -->
            <div class="form-section full-width">
              <h4>Thông tin học thuật</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="required">Khoa/Bộ môn</label>
                  <select v-model="formData.department" required>
                    <option value="">-- Chọn khoa --</option>
                    <option value="cntt">Công nghệ thông tin</option>
                    <option value="dtvt">Điện tử viễn thông</option>
                    <option value="kt">Kinh tế</option>
                    <option value="nn">Ngoại ngữ</option>
                    <option value="co-khi">Cơ khí</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label class="required">Học hàm học vị</label>
                  <select v-model="formData.academicRank" required>
                    <option value="">-- Chọn học vị --</option>
                    <option value="gs">Giáo sư</option>
                    <option value="pgs">Phó giáo sư</option>
                    <option value="ts">Tiến sĩ</option>
                    <option value="ths">Thạc sĩ</option>
                    <option value="ksh">Kỹ sư</option>
                    <option value="cn">Cử nhân</option>
                  </select>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Chức vụ</label>
                  <input
                    type="text"
                    v-model="formData.position"
                    placeholder="VD: Trưởng bộ môn, Phó khoa..."
                  />
                </div>
                
                <div class="form-group">
                  <label class="required">Trạng thái</label>
                  <select v-model="formData.status" required>
                    <option value="active">Đang giảng dạy</option>
                    <option value="on-break">Tạm nghỉ</option>
                    <option value="resigned">Nghỉ việc</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Account Information -->
            <div class="form-section full-width" v-if="!isEdit">
              <h4>Thông tin tài khoản</h4>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Tên đăng nhập</label>
                  <input
                    type="text"
                    v-model="formData.username"
                    placeholder="Để trống để tự động tạo từ email"
                  />
                  <small>Nếu để trống, hệ thống sẽ sử dụng phần trước @ của email</small>
                </div>
                
                <div class="form-group">
                  <label>Mật khẩu tạm thời</label>
                  <div class="password-input">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      v-model="formData.temporaryPassword"
                      placeholder="Để trống để tự động tạo"
                    />
                    <button 
                      type="button"
                      @click="showPassword = !showPassword"
                      class="btn-toggle-password"
                    >
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                    <button 
                      type="button"
                      @click="generatePassword"
                      class="btn-generate"
                    >
                      <i class="fas fa-random"></i>
                    </button>
                  </div>
                  <small>Mật khẩu sẽ được gửi qua email cho giảng viên</small>
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group full-width">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      v-model="formData.sendWelcomeEmail"
                    />
                    Gửi email chào mừng và thông tin đăng nhập
                  </label>
                </div>
              </div>
            </div>
            
            <!-- Notes -->
            <div class="form-section full-width">
              <h4>Ghi chú</h4>
              <div class="form-group">
                <label>Ghi chú nội bộ</label>
                <textarea
                  v-model="formData.notes"
                  rows="3"
                  placeholder="Ghi chú về giảng viên (chỉ admin xem được)..."
                ></textarea>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">
          <i class="fas fa-times"></i>
          Hủy bỏ
        </button>
        <button @click="handleSubmit" class="btn-save" :disabled="!isFormValid">
          <i class="fas fa-save"></i>
          {{ isEdit ? 'Cập nhật' : 'Thêm giảng viên' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'TeacherModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    teacher: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const formData = ref({
      code: '',
      name: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      gender: '',
      department: '',
      academicRank: '',
      position: '',
      status: 'active',
      username: '',
      temporaryPassword: '',
      sendWelcomeEmail: true,
      notes: ''
    })
    
    const showPassword = ref(false)
    
    const isFormValid = computed(() => {
      return formData.value.code && 
             formData.value.name && 
             formData.value.email && 
             formData.value.department && 
             formData.value.academicRank && 
             formData.value.status
    })
    
    const initializeForm = () => {
      if (props.teacher && props.isEdit) {
        formData.value = {
          ...props.teacher,
          temporaryPassword: '',
          sendWelcomeEmail: false
        }
      } else {
        formData.value = {
          code: '',
          name: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          gender: '',
          department: '',
          academicRank: '',
          position: '',
          status: 'active',
          username: '',
          temporaryPassword: '',
          sendWelcomeEmail: true,
          notes: ''
        }
      }
    }
    
    const generatePassword = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let password = ''
      for (let i = 0; i < 8; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      formData.value.temporaryPassword = password
    }
    
    const handleSubmit = () => {
      if (!isFormValid.value) return
      
      // Auto-generate username from email if not provided
      if (!formData.value.username && formData.value.email) {
        formData.value.username = formData.value.email.split('@')[0]
      }
      
      // Auto-generate password if not provided for new teachers
      if (!props.isEdit && !formData.value.temporaryPassword) {
        generatePassword()
      }
      
      emit('save', formData.value)
    }
    
    const handleOverlayClick = () => {
      emit('close')
    }
    
    // Watch for teacher changes
    watch(() => props.teacher, () => {
      initializeForm()
    }, { immediate: true })
    
    onMounted(() => {
      initializeForm()
    })
    
    return {
      formData,
      showPassword,
      isFormValid,
      generatePassword,
      handleSubmit,
      handleOverlayClick
    }
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
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
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-section {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  background: #f9fafb;
}

.form-section h4 {
  margin: 0 0 16px 0;
  color: #374151;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-section h4:before {
  content: '';
  width: 4px;
  height: 16px;
  background: #3b82f6;
  border-radius: 2px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group label.required:after {
  content: ' *';
  color: #ef4444;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:readonly {
  background: #f3f4f6;
  color: #6b7280;
}

.form-group small {
  color: #6b7280;
  font-size: 12px;
}

.password-input {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input input {
  flex: 1;
  padding-right: 80px;
}

.btn-toggle-password,
.btn-generate {
  position: absolute;
  right: 2px;
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
  border-radius: 4px;
}

.btn-toggle-password {
  right: 42px;
}

.btn-generate {
  right: 2px;
}

.btn-toggle-password:hover,
.btn-generate:hover {
  background: #f3f4f6;
  color: #374151;
}

.checkbox-label {
  display: flex !important;
  flex-direction: row !important;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
  margin: 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
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
  display: flex;
  align-items: center;
  gap: 8px;
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
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-container {
    margin: 10px;
    max-height: 95vh;
  }
}
</style>