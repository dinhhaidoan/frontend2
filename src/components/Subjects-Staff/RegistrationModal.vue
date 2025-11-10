<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-user-plus"></i>
          Cấu hình đăng ký môn học
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <form @submit.prevent="handleSave">
          <!-- Registration Status -->
          <div class="form-section">
            <h4>
              <i class="fas fa-toggle-on"></i>
              Trạng thái đăng ký
            </h4>
            
            <div class="registration-toggle">
              <label class="toggle-switch">
                <input 
                  type="checkbox" 
                  v-model="formData.isOpen"
                  @change="handleToggleChange"
                />
                <span class="slider"></span>
              </label>
              <div class="toggle-info">
                <span class="toggle-label">
                  {{ formData.isOpen ? 'Mở đăng ký' : 'Đóng đăng ký' }}
                </span>
                <span class="toggle-description">
                  {{ formData.isOpen 
                    ? 'Sinh viên có thể đăng ký các môn học đã được mở' 
                    : 'Tất cả đăng ký môn học đang bị tạm ngừng'
                  }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Registration Period -->
          <div class="form-section" v-if="formData.isOpen">
            <h4>
              <i class="fas fa-calendar-alt"></i>
              Thời gian đăng ký
            </h4>
            
            <div class="date-range">
              <div class="form-group">
                <label class="required">Ngày bắt đầu</label>
                <input
                  type="datetime-local"
                  v-model="formData.startDate"
                  required
                />
              </div>
              
              <div class="form-group">
                <label class="required">Ngày kết thúc</label>
                <input
                  type="datetime-local"
                  v-model="formData.endDate"
                  required
                />
              </div>
            </div>
            
            <div class="period-info" v-if="formData.startDate && formData.endDate">
              <div class="info-item">
                <i class="fas fa-clock"></i>
                <span>Thời gian đăng ký: {{ formatDateRange() }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-hourglass-half"></i>
                <span>Tổng thời gian: {{ calculateDuration() }}</span>
              </div>
            </div>
          </div>
          
          <!-- Registration Limits -->
          <div class="form-section" v-if="formData.isOpen">
            <h4>
              <i class="fas fa-list-ol"></i>
              Giới hạn đăng ký
            </h4>
            
            <div class="limits-grid">
              <div class="form-group">
                <label class="required">Số môn tối đa mỗi sinh viên</label>
                <input
                  type="number"
                  v-model.number="formData.maxSubjectsPerStudent"
                  min="1"
                  max="20"
                  required
                />
                <small>Sinh viên không thể đăng ký quá số môn này</small>
              </div>
              
              <div class="form-group">
                <label>Tổng tín chỉ tối đa</label>
                <input
                  type="number"
                  v-model.number="formData.maxCreditsPerStudent"
                  min="0"
                  max="50"
                />
                <small>Để trống nếu không giới hạn tín chỉ</small>
              </div>
            </div>
          </div>
          
          <!-- Registration Rules -->
          <div class="form-section" v-if="formData.isOpen">
            <h4>
              <i class="fas fa-shield-alt"></i>
              Quy tắc đăng ký
            </h4>
            
            <div class="rules-list">
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  v-model="formData.allowDuplicate"
                />
                <span class="checkmark"></span>
                <div class="option-info">
                  <span class="option-label">Cho phép đăng ký trùng môn</span>
                  <span class="option-description">Sinh viên có thể đăng ký cùng một môn học nhiều lần</span>
                </div>
              </label>
              
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  v-model="formData.requirePrerequisites"
                />
                <span class="checkmark"></span>
                <div class="option-info">
                  <span class="option-label">Kiểm tra môn tiên quyết</span>
                  <span class="option-description">Sinh viên phải hoàn thành môn tiên quyết trước khi đăng ký</span>
                </div>
              </label>
              
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  v-model="formData.autoApprove"
                />
                <span class="checkmark"></span>
                <div class="option-info">
                  <span class="option-label">Tự động duyệt đăng ký</span>
                  <span class="option-description">Đăng ký sẽ được duyệt tự động nếu đủ điều kiện</span>
                </div>
              </label>
              
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  v-model="formData.allowWaitlist"
                />
                <span class="checkmark"></span>
                <div class="option-info">
                  <span class="option-label">Cho phép đăng ký chờ</span>
                  <span class="option-description">Sinh viên có thể đăng ký vào danh sách chờ khi lớp đã đầy</span>
                </div>
              </label>
            </div>
          </div>
          
          <!-- Notification Settings -->
          <div class="form-section" v-if="formData.isOpen">
            <h4>
              <i class="fas fa-bell"></i>
              Cài đặt thông báo
            </h4>
            
            <div class="notification-options">
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  v-model="formData.notifyStart"
                />
                <span class="checkmark"></span>
                <div class="option-info">
                  <span class="option-label">Thông báo mở đăng ký</span>
                  <span class="option-description">Gửi thông báo khi bắt đầu đợt đăng ký</span>
                </div>
              </label>
              
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  v-model="formData.notifyReminder"
                />
                <span class="checkmark"></span>
                <div class="option-info">
                  <span class="option-label">Nhắc nhở trước khi đóng</span>
                  <span class="option-description">Gửi thông báo nhắc nhở trước 24h đóng đăng ký</span>
                </div>
              </label>
              
              <label class="checkbox-option">
                <input 
                  type="checkbox" 
                  v-model="formData.notifyEnd"
                />
                <span class="checkmark"></span>
                <div class="option-info">
                  <span class="option-label">Thông báo đóng đăng ký</span>
                  <span class="option-description">Gửi thông báo khi kết thúc đợt đăng ký</span>
                </div>
              </label>
            </div>
          </div>
        </form>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">
          <i class="fas fa-times"></i>
          Hủy bỏ
        </button>
        <button @click="handleSave" class="btn-save" :disabled="!isFormValid">
          <i class="fas fa-save"></i>
          Lưu cấu hình
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'

export default {
  name: 'RegistrationModal',
  props: {
    registrationConfig: {
      type: Object,
      required: true
    }
  },
  emits: ['close', 'save'],
  setup(props, { emit }) {
    const formData = ref({
      isOpen: false,
      startDate: '',
      endDate: '',
      maxSubjectsPerStudent: 8,
      maxCreditsPerStudent: 0,
      allowDuplicate: false,
      requirePrerequisites: true,
      autoApprove: true,
      allowWaitlist: true,
      notifyStart: true,
      notifyReminder: true,
      notifyEnd: true
    })
    
    const isFormValid = computed(() => {
      if (!formData.value.isOpen) return true
      
      return formData.value.startDate &&
             formData.value.endDate &&
             formData.value.maxSubjectsPerStudent > 0 &&
             new Date(formData.value.startDate) < new Date(formData.value.endDate)
    })
    
    const initializeForm = () => {
      if (props.registrationConfig) {
        formData.value = {
          ...formData.value,
          ...props.registrationConfig
        }
        
        // Convert dates to datetime-local format
        if (formData.value.startDate && !formData.value.startDate.includes('T')) {
          formData.value.startDate = new Date(formData.value.startDate).toISOString().slice(0, 16)
        }
        if (formData.value.endDate && !formData.value.endDate.includes('T')) {
          formData.value.endDate = new Date(formData.value.endDate).toISOString().slice(0, 16)
        }
      }
    }
    
    const handleToggleChange = () => {
      if (!formData.value.isOpen) {
        // Reset dates when closing registration
        formData.value.startDate = ''
        formData.value.endDate = ''
      } else {
        // Set default dates when opening registration
        const now = new Date()
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000)
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        
        formData.value.startDate = tomorrow.toISOString().slice(0, 16)
        formData.value.endDate = nextWeek.toISOString().slice(0, 16)
      }
    }
    
    const formatDateRange = () => {
      if (!formData.value.startDate || !formData.value.endDate) return ''
      
      const start = new Date(formData.value.startDate)
      const end = new Date(formData.value.endDate)
      
      const startStr = start.toLocaleDateString('vi-VN') + ' ' + start.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      const endStr = end.toLocaleDateString('vi-VN') + ' ' + end.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      
      return `${startStr} - ${endStr}`
    }
    
    const calculateDuration = () => {
      if (!formData.value.startDate || !formData.value.endDate) return ''
      
      const start = new Date(formData.value.startDate)
      const end = new Date(formData.value.endDate)
      const diffMs = end.getTime() - start.getTime()
      
      if (diffMs <= 0) return 'Thời gian không hợp lệ'
      
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      
      if (days > 0) {
        return `${days} ngày ${hours > 0 ? hours + ' giờ' : ''}`
      } else {
        return `${hours} giờ`
      }
    }
    
    const handleSave = () => {
      if (!isFormValid.value) return
      
      const config = { ...formData.value }
      
      // Convert datetime-local back to ISO format
      if (config.startDate) {
        config.startDate = new Date(config.startDate).toISOString()
      }
      if (config.endDate) {
        config.endDate = new Date(config.endDate).toISOString()
      }
      
      emit('save', config)
    }
    
    const handleOverlayClick = () => {
      emit('close')
    }
    
    // Watch for config changes
    watch(() => props.registrationConfig, () => {
      initializeForm()
    }, { deep: true })
    
    onMounted(() => {
      initializeForm()
    })
    
    return {
      formData,
      isFormValid,
      handleToggleChange,
      formatDateRange,
      calculateDuration,
      handleSave,
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
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.modal-header h3 i {
  color: #10b981;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 32px;
}

.form-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  padding-bottom: 8px;
  border-bottom: 2px solid #f3f4f6;
}

.form-section h4 i {
  color: #10b981;
  font-size: 14px;
}

.registration-toggle {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #10b981;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.toggle-info {
  flex: 1;
}

.toggle-label {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
}

.toggle-description {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.4;
}

.date-range {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-group label.required::after {
  content: ' *';
  color: #ef4444;
}

.form-group input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-group small {
  font-size: 12px;
  color: #6b7280;
}

.period-info {
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #059669;
  margin-bottom: 4px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item i {
  width: 16px;
  font-size: 12px;
}

.limits-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.rules-list,
.notification-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.checkbox-option {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.checkbox-option:hover {
  background: #f9fafb;
  border-color: #10b981;
}

.checkbox-option input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin: 2px 0 0 0;
  cursor: pointer;
}

.option-info {
  flex: 1;
}

.option-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  margin-bottom: 2px;
}

.option-description {
  font-size: 12px;
  color: #6b7280;
  line-height: 1.4;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-cancel {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #10b981;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-save:hover:not(:disabled) {
  background: #059669;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 10px;
    max-width: none;
  }
  
  .date-range,
  .limits-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .registration-toggle {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
}
</style>