<template>
  <div v-if="show" class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEdit ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới' }}</h3>
        <button @click="$emit('close')" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="account-form">
        <div class="form-grid">
          <div class="form-group">
            <label>Họ tên *</label>
            <input v-model="formData.name" type="text" required />
          </div>
          
          <div class="form-group">
            <label>Email *</label>
            <input v-model="formData.email" type="email" required />
          </div>
          
          <div class="form-group">
            <label>Mã số</label>
            <input v-model="formData.userId" type="text" />
          </div>
          
          <div class="form-group">
            <label>Vai trò *</label>
            <select v-model="formData.role" required>
              <option value="">Chọn vai trò</option>
              <option value="student">Sinh viên</option>
              <option value="teacher">Giảng viên</option>
              <option value="staff">Giáo vụ</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Khoa/Phòng ban</label>
            <select v-model="formData.department">
              <option value="">Chọn khoa/phòng ban</option>
              <option value="cntt">Công nghệ thông tin</option>
              <option value="dtvt">Điện tử viễn thông</option>
              <option value="co-khi">Cơ khí</option>
              <option value="kinh-te">Kinh tế</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>Số điện thoại</label>
            <input v-model="formData.phone" type="tel" />
          </div>
        </div>
        
        <div v-if="!isEdit" class="form-group">
          <label>Mật khẩu tạm thời *</label>
          <div class="password-input">
            <input 
              v-model="formData.password" 
              :type="showPassword ? 'text' : 'password'" 
              required 
            />
            <button type="button" @click="showPassword = !showPassword" class="password-toggle">
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
            <button type="button" @click="generatePassword" class="generate-password">
              <i class="fas fa-key"></i>
              Tạo tự động
            </button>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" @click="$emit('close')" class="btn-secondary">Hủy</button>
          <button type="submit" class="btn-primary">
            {{ isEdit ? 'Cập nhật' : 'Tạo tài khoản' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, toRef } from 'vue'
import { useModalBodyScroll } from '@/composables/useModalBodyScroll'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  account: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save'])

// Sử dụng composable để quản lý body scroll
useModalBodyScroll(toRef(props, 'show'))

const showPassword = ref(false)

const formData = reactive({
  id: null,
  name: '',
  email: '',
  userId: '',
  role: '',
  department: '',
  phone: '',
  password: ''
})

const isEdit = ref(false)

// Define resetForm function first
const resetForm = () => {
  Object.keys(formData).forEach(key => {
    formData[key] = key === 'id' ? null : ''
  })
  showPassword.value = false
}

// Watch for account changes to populate form
watch(() => props.account, (newAccount) => {
  if (newAccount) {
    isEdit.value = true
    Object.assign(formData, newAccount)
  } else {
    isEdit.value = false
    resetForm()
  }
}, { immediate: true })

// Watch for show changes to reset form when modal closes
watch(() => props.show, (show) => {
  if (!show && !props.account) {
    resetForm()
  }
})

const generatePassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  formData.password = password
}

const handleSubmit = () => {
  const accountData = {
    ...formData,
    status: formData.status || 'active',
    lastLogin: formData.lastLogin || new Date(),
    avatar: formData.avatar || null
  }
  
  emit('save', accountData)
  emit('close')
}
</script>

<style scoped>
/* Modal */
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
  z-index: 2000;
  animation: fadeIn 0.3s ease;
  overflow: hidden !important;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalSlideIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from { transform: scale(0.8) translateY(-20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(107, 114, 128, 0.2);
}

/* Form */
.account-form {
  padding: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.password-input {
  position: relative;
  display: flex;
  gap: 8px;
}

.password-input input {
  flex: 1;
}

.password-toggle,
.generate-password {
  padding: 12px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.password-toggle {
  width: 44px;
  justify-content: center;
}

.password-toggle:hover,
.generate-password:hover {
  background: rgba(249, 250, 251, 1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Buttons */
.btn-primary, .btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

.btn-secondary:hover {
  background: rgba(107, 114, 128, 0.15);
  transform: translateY(-1px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-content {
    margin: 16px;
    max-height: calc(100vh - 32px);
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>