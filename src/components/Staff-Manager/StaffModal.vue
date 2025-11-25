<template>
  <div class="modal-overlay" @click="handleOverlayClick" v-if="isOpen">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-user-tie"></i>
          {{ isEdit ? 'Chỉnh sửa giáo vụ' : 'Thêm giáo vụ mới' }}
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="modal-content">
            <div class="modal-side">
              <div class="avatar-card">
                <div class="avatar-preview-lg" v-if="formData.avatarUrl">
                  <img :src="formData.avatarUrl" :alt="formData.name || 'avatar'" />
                </div>
                <div class="avatar-placeholder-lg" v-else>
                  <i class="fas fa-user-tie fa-2x"></i>
                </div>

                <div class="uploader-actions">
                  <label class="btn-upload">
                    <input type="file" accept="image/png,image/jpeg,image/webp" @change="handleFileChange" />
                    <i class="fas fa-upload"></i>
                    Chọn ảnh
                  </label>
                  <small class="muted">Hỗ trợ: .jpg .png .webp — tối đa 5MB</small>
                  <div v-if="uploading" class="upload-progress">
                    <div class="progress-line" role="progressbar" :aria-valuenow="uploadProgress" aria-valuemin="0" aria-valuemax="100">
                      <div class="progress-bar" :style="{ width: (uploadProgress || 0) + '%' }"></div>
                    </div>
                    <div class="progress-label">Đang upload: {{ uploadProgress || 0 }}%</div>
                  </div>
                </div>
                <div class="avatar-note">Ảnh sẽ hiển thị sau khi lưu hoặc khi preview đã có.</div>
              </div>
            </div>

            <div class="modal-form">
              <div class="form-grid">
            <!-- Mã giáo vụ -->
            <div class="form-group">
              <label class="required">Mã giáo vụ</label>
              <input
                type="text"
                v-model="formData.code"
                required
                placeholder="VD: GV001"
                :readonly="isEdit"
                :class="{ 'readonly-highlight': isEdit }"
              />
              <small v-if="isEdit">Mã giáo vụ không thể thay đổi (mã cũng là user_code)</small>
              <small v-else>Ghi chú: Mã giáo vụ sẽ được dùng làm user_code (một trường duy nhất cho cả user và staff)</small>
            </div>
            
            <!-- Họ và tên -->
            <div class="form-group">
              <label class="required">Họ và tên</label>
              <input
                type="text"
                v-model="formData.name"
                required
                placeholder="Nhập họ tên đầy đủ"
              />
            </div>
            
            <!-- Email -->
            <div class="form-group">
              <label class="required">Email</label>
              <input
                type="email"
                v-model="formData.email"
                required
                placeholder="email@example.com"
              />
            </div>
            
            <!-- Ngày sinh -->
            <div class="form-group">
              <label class="required">Ngày sinh</label>
              <input
                type="date"
                v-model="formData.birthDate"
                required
              />
            </div>
            
            <!-- Giới tính -->
            <div class="form-group">
              <label class="required">Giới tính</label>
              <select v-model="formData.gender" required>
                <option value="">-- Chọn giới tính --</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            
            <!-- Số điện thoại (optional) -->
            <div class="form-group">
              <label>Số điện thoại</label>
              <input
                type="tel"
                v-model="formData.phone"
                placeholder="0123456789"
              />
            </div>
            <!-- Avatar (hidden inside side column on wide screens) -->
            <!-- Mật khẩu (chỉ khi tạo mới) -->
            <div class="form-group" v-if="!isEdit">
              <label>Mật khẩu</label>
              <input
                type="password"
                v-model="formData.password"
                placeholder="Để trống sẽ dùng mật khẩu mặc định 123456789"
              />
              <small>Để trống → mật khẩu mặc định <strong>123456789</strong></small>
            </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">
          <i class="fas fa-times"></i>
          Hủy
        </button>
        <button @click="handleSubmit" class="btn-save" :disabled="uploading">
          <i class="fas fa-save"></i>
          {{ uploading ? 'Đang upload...' : (isEdit ? 'Cập nhật' : 'Thêm mới') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'

export default {
  name: 'StaffModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    staff: {
      type: Object,
      default: null
    },
    isEdit: {
      type: Boolean,
      default: false
    },
    uploading: {
      type: Boolean,
      default: false
    },
    uploadProgress: {
      type: Number,
      default: 0
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const formData = ref({
      code: '',
      name: '',
      email: '',
      // avatar preview | file
      avatarUrl: '',
      avatarFile: null,
      // optional password field for creating a user (leave empty to use default)
      password: '',
      birthDate: '',
      gender: '',
      phone: ''
    })
    
    const formatForDateInput = (v) => {
      if (!v) return ''
      // If v is already YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
      // If v contains T (ISO) or space (DB datetime), extract date part
      const m = v.toString().match(/^(\d{4}-\d{2}-\d{2})/)
      if (m) return m[1]
      // Fallback: try to create Date and format
      const d = new Date(v)
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
      }
      return ''
    }

    watch(() => props.staff, (newStaff) => {
      if (newStaff) {
          formData.value = {
          code: newStaff.code || '',
          name: newStaff.name || '',
          email: newStaff.email || '',
            avatarUrl: newStaff.avatar || newStaff.user_avatar || '',
          password: '',
          birthDate: formatForDateInput(newStaff.birthDate) || '',
          gender: newStaff.gender || '',
          phone: newStaff.phone || ''
        }
      } else {
        formData.value = {
          code: '',
          name: '',
          email: '',
          avatarUrl: '',
          avatarFile: null,
          password: '',
          birthDate: '',
          gender: '',
          phone: ''
        }
      }
    }, { immediate: true })
    
    const handleOverlayClick = () => {
      // Prevent closing while an upload is in progress
      if (props.uploading) return
      emit('close')
    }
    
    const handleSubmit = () => {
      emit('save', { ...formData.value })
    }
    
    const handleFileChange = (e) => {
      const f = e.target.files && e.target.files[0]
      if (!f) return
      const allowed = ['image/jpeg', 'image/png', 'image/webp']
      if (!allowed.includes(f.type)) {
        alert('Chỉ chấp nhận định dạng: jpg, png, webp')
        return
      }
      const maxBytes = 5 * 1024 * 1024
      if (f.size > maxBytes) {
        alert('File quá lớn (tối đa 5MB)')
        return
      }
      // revoke previous blob url if we created one
      if (formData.value.avatarFile && formData.value.avatarUrl && formData.value.avatarUrl.startsWith('blob:')) {
        try { URL.revokeObjectURL(formData.value.avatarUrl) } catch (e) {}
      }
      formData.value.avatarFile = f
      try { formData.value.avatarUrl = URL.createObjectURL(f) } catch (err) { console.error('Preview error', err) }
    }
    
    return {
      formData,
      handleOverlayClick,
      handleFileChange,
      handleSubmit
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
  z-index: 100000;
  padding: 20px;
}

.modal-container {
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
  border-radius: 12px;
  width: 100%;
  max-width: 900px;
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
}

.modal-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 28px;
}

.modal-side {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.avatar-card {
  width: 100%;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  padding: 18px;
  border-radius: 10px;
  border: 1px solid rgba(99,102,241,0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-preview-lg img {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid #e6eef8;
  box-shadow: 0 6px 14px rgba(20, 60, 120, 0.08);
}

.avatar-placeholder-lg {
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9aa4b2;
  background: linear-gradient(180deg, #f3f6fb, #f9fbff);
  border-radius: 12px;
  border: 1px dashed #e6eef8;
}

.uploader-actions { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #eef2ff;
  color: #3730a3;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  border: 1px solid rgba(99,102,241,0.12);
}
.btn-upload input { display: none; }
.muted { color: #6b7280; font-size: 12px }
.avatar-note { color: #9ca3af; font-size: 12px; text-align: center; margin-top: 4px }

.upload-progress { width: 100%; margin-top: 8px; display:flex; flex-direction:column; align-items:center; gap:6px }
.progress-line { width: 160px; height: 8px; background: #eef2ff; border-radius: 99px; overflow:hidden }
.progress-bar { height: 100%; background: linear-gradient(90deg,#4f46e5,#3b82f6); width: 0; transition: width 150ms ease }
.progress-label { font-size: 12px; color: #374151 }

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
}

.form-group label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-group input,
.form-group select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
}

.readonly-highlight {
  background: #f3f4f6; /* lighter background to indicate read-only */
  border-color: #d1d5db;
  color: #4b5563;
}

.form-group input:focus,
.form-group select:focus {
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

.avatar-uploader {
  display: flex;
  gap: 12px;
  align-items: center;
}
.avatar-preview img {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.avatar-placeholder {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: #9ca3af;
  background: #f3f4f6;
  border-radius: 8px;
  border: 1px dashed #e5e7eb;
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

.btn-save:hover {
  background: #2563eb;
  border-color: #2563eb;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  .modal-content { grid-template-columns: 1fr; }
  .modal-side { order: -1; }
  .modal-container { margin: 10px; max-height: 95vh; }
}
</style>
