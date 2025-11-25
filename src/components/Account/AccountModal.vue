<template>
  <div v-if="show" class="modal-overlay" @click="(props.uploading || props.saving) ? null : $emit('close')">
    <div class="modal-content" @click.stop>
        <div class="modal-header">
        <h3>{{ isEdit ? 'Chỉnh sửa tài khoản' : 'Tạo tài khoản mới' }}</h3>
        <button @click="(props.uploading || props.saving) ? null : $emit('close')" class="modal-close" :disabled="props.uploading || props.saving">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="account-form">
        <div class="avatar-row" style="display:flex;gap:16px;align-items:center;margin-bottom:12px;">
          <div style="width:96px;height:96px;border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(0,0,0,0.08);background:#f3f4f6;display:flex;align-items:center;justify-content:center;">
            <img v-if="avatarPreview" :src="avatarPreview" style="width:100%;height:100%;object-fit:cover;display:block;" />
            <div v-else style="font-weight:700;color:#fff;background:linear-gradient(135deg,#3b82f6,#8b5cf6);width:100%;height:100%;display:flex;align-items:center;justify-content:center;">{{ (formData.name||'').split(' ').map(n=>n[0]).join('').toUpperCase() }}</div>
          </div>
          <div style="flex:1;display:flex;flex-direction:column;gap:8px;">
            <div>
              <label class="btn-secondary" style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;">
                <input type="file" accept="image/*" @change="handleFileSelected" style="display:none" />
                <i class="fas fa-upload"></i> Chọn ảnh đại diện
              </label>
              <small style="display:block;color:#6b7280;margin-top:6px">Kích thước tối đa 5MB. Định dạng: jpg/png.</small>
            </div>
            <div v-if="props.uploading" style="height:10px;background:#e6eefb;border-radius:8px;overflow:hidden;margin-top:6px">
              <div :style="{ width: props.uploadProgress + '%', background: 'linear-gradient(90deg,#3b82f6,#8b5cf6)', height: '100%' }"></div>
            </div>
          </div>
        </div>
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
            <input v-model="formData.userId" type="text" :disabled="isEdit" />
            <small v-if="isEdit" class="muted">Mã số không thể thay đổi sau khi tạo</small>
            <span v-if="isEdit" class="locked-badge"><i class="fas fa-lock"></i> Đã khóa</span>
          </div>
          
          <div class="form-group">
            <label>Vai trò *</label>
            <select v-model="formData.role" required :disabled="isEdit">
              <option value="">Chọn vai trò</option>
              <option value="student">Sinh viên</option>
              <option value="teacher">Giảng viên</option>
              <option value="staff">Giáo vụ</option>
              <option value="admin">Quản trị viên</option>
            </select>
            <small v-if="isEdit" class="muted">Vai trò bị khóa — liên hệ quản trị nếu cần thay đổi</small>
            <span v-if="isEdit" class="locked-badge"><i class="fas fa-lock"></i> Đã khóa</span>
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
          <button type="button" @click="$emit('close')" class="btn-secondary" :disabled="props.saving || props.uploading">Hủy</button>
          <button type="submit" class="btn-primary" :disabled="props.saving || props.uploading">
            <i v-if="props.saving || props.uploading" class="fas fa-spinner fa-spin" style="margin-right:8px"></i>
            {{ (props.saving || props.uploading) ? (isEdit ? 'Đang cập nhật...' : 'Đang tạo...') : (isEdit ? 'Cập nhật' : 'Tạo tài khoản') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, reactive, toRef } from 'vue'
import { useModalBodyScroll } from '@/composables/useModalBodyScroll'
import { createEmptyAccount } from '@/types/account'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  account: {
    type: Object,
    default: null
  },
  saving: {
    type: Boolean,
    default: false
  }
  ,uploading: {
    type: Boolean,
    default: false
  },
  uploadProgress: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['close', 'save'])

// Sử dụng composable để quản lý body scroll
useModalBodyScroll(toRef(props, 'show'))

const showPassword = ref(false)
// local avatar preview + file
const avatarPreview = ref(null)
const avatarFile = ref(null)

const formData = reactive(createEmptyAccount())

const isEdit = ref(false)

// Define resetForm function first
const resetForm = () => {
  const empty = createEmptyAccount()
  Object.keys(empty).forEach(key => {
    formData[key] = empty[key]
  })
  showPassword.value = false
  avatarPreview.value = null
  avatarFile.value = null
}

// Watch for account changes to populate form
watch(() => props.account, (newAccount) => {
  if (newAccount) {
    isEdit.value = true
    Object.assign(formData, newAccount)
    // set preview if avatar URL present
    avatarPreview.value = newAccount.avatar || newAccount.user_avatar || null
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
    avatar: formData.avatar || null,
    // include file object if user selected a new avatar
    avatarFile: avatarFile.value || null
  }
  
  emit('save', accountData)
  emit('close')
}

const handleFileSelected = (e) => {
  const f = e.target.files && e.target.files[0]
  if (!f) return
  // basic client-side validation: image and < 5MB
  if (!f.type.startsWith('image/')) {
    alert('Vui lòng chọn file ảnh hợp lệ')
    return
  }
  if (f.size > 5 * 1024 * 1024) {
    alert('Kích thước ảnh quá lớn (tối đa 5MB)')
    return
  }
  avatarFile.value = f
  const reader = new FileReader()
  reader.onload = (ev) => {
    avatarPreview.value = ev.target.result
  }
  reader.readAsDataURL(f)
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
  /* must be above header (z-index:99999) so modal overlays are always on top */
  z-index: 100000 !important;
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

/* Highlight disabled / locked fields so users notice they cannot edit them */
.form-group input[disabled],
.form-group select[disabled] {
  background: linear-gradient(90deg, #fffbeb, #fff7ed);
  border-color: #f59e0b;
  color: #92400e;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.6), 0 0 0 4px rgba(245,158,11,0.06);
}

.locked-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  margin-top: 8px;
  background: #fff7ed;
  border: 1px solid #fde68a;
  color: #92400e;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.locked-badge i {
  font-size: 12px;
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