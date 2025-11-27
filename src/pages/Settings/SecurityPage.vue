<template>
  <div class="security-page">
    <div class="page-header">
      <h2>Bảo mật</h2>
      <p>Quản lý mật khẩu và các cài đặt bảo mật cho tài khoản của bạn</p>
    </div>

    <div class="security-content">
      <!-- Password Settings -->
      <div class="security-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-key"></i>
            Đổi mật khẩu
          </h3>
        </div>
        <div class="section-content">
          <form @submit.prevent="changePassword" class="password-form">
            <div class="form-group">
              <label>Mật khẩu hiện tại</label>
              <div class="password-input">
                <input 
                  :type="showCurrentPassword ? 'text' : 'password'"
                  v-model="passwordData.currentPassword"
                  placeholder="Nhập mật khẩu hiện tại"
                  class="form-input"
                  required
                />
                <button 
                  type="button"
                  class="password-toggle"
                  @click="showCurrentPassword = !showCurrentPassword"
                >
                  <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Mật khẩu mới</label>
              <div class="password-input">
                <input 
                  :type="showNewPassword ? 'text' : 'password'"
                  v-model="passwordData.newPassword"
                  placeholder="Nhập mật khẩu mới"
                  class="form-input"
                  required
                  @input="checkPasswordStrength"
                />
                <button 
                  type="button"
                  class="password-toggle"
                  @click="showNewPassword = !showNewPassword"
                >
                  <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <!-- Password Strength Indicator -->
              <div class="password-strength" v-if="passwordData.newPassword">
                <div class="strength-bar">
                  <div 
                    class="strength-fill"
                    :class="passwordStrength.level"
                    :style="{ width: passwordStrength.percentage + '%' }"
                  ></div>
                </div>
                <div class="strength-text">
                  Độ mạnh: <span :class="passwordStrength.level">{{ passwordStrength.text }}</span>
                </div>
                <div class="strength-tips" v-if="passwordStrength.tips.length > 0">
                  <ul>
                    <li v-for="tip in passwordStrength.tips" :key="tip">{{ tip }}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Xác nhận mật khẩu mới</label>
              <div class="password-input">
                <input 
                  :type="showConfirmPassword ? 'text' : 'password'"
                  v-model="passwordData.confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
                  class="form-input"
                  required
                />
                <button 
                  type="button"
                  class="password-toggle"
                  @click="showConfirmPassword = !showConfirmPassword"
                >
                  <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <div class="password-match" v-if="passwordData.confirmPassword">
                <span v-if="passwordsMatch" class="match-success">
                  <i class="fas fa-check"></i>
                  Mật khẩu khớp
                </span>
                <span v-else class="match-error">
                  <i class="fas fa-times"></i>
                  Mật khẩu không khớp
                </span>
              </div>
            </div>

            <div class="form-actions">
              <button 
                type="submit"
                class="btn btn-primary"
                :disabled="!canChangePassword"
              >
                <i class="fas fa-save"></i>
                Đổi mật khẩu
              </button>
              <button 
                type="button"
                class="btn btn-secondary"
                @click="generateRandomPassword"
              >
                <i class="fas fa-random"></i>
                Tạo mật khẩu ngẫu nhiên
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Login History -->
      <div class="security-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-history"></i>
            Lịch sử đăng nhập
          </h3>
        </div>
        <div class="section-content">
          <div class="login-history">
            <div 
              v-for="login in loginHistory" 
              :key="login.id"
              class="login-item"
            >
              <div class="login-icon">
                <i :class="login.deviceIcon"></i>
              </div>
              <div class="login-info">
                <div class="login-details">
                  <h4>{{ login.device }}</h4>
                  <p>{{ login.location }} • {{ login.ip }}</p>
                </div>
                <div class="login-time">
                  <span>{{ formatLoginTime(login.timestamp) }}</span>
                  <span v-if="login.isCurrent" class="current-session">
                    <i class="fas fa-circle"></i>
                    Phiên hiện tại
                  </span>
                </div>
              </div>
              <div class="login-status">
                <span :class="['status-badge', login.status]">
                  {{ login.status === 'success' ? 'Thành công' : 'Thất bại' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Account Management -->
      <div class="security-section danger-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-exclamation-triangle"></i>
            Quản lý tài khoản
          </h3>
        </div>
        <div class="section-content">
          <div class="danger-actions">
            <div class="action-item">
              <div class="action-info">
                <h4>Tạm khóa tài khoản</h4>
                <p>Tạm thời vô hiệu hóa tài khoản. Bạn có thể kích hoạt lại sau này.</p>
              </div>
              <button class="btn btn-warning" @click="suspendAccount">
                <i class="fas fa-pause"></i>
                Tạm khóa
              </button>
            </div>

            <div class="action-item">
              <div class="action-info">
                <h4>Xóa tài khoản vĩnh viễn</h4>
                <p>Xóa hoàn toàn tài khoản và tất cả dữ liệu. <strong>Không thể hoàn tác!</strong></p>
              </div>
              <button class="btn btn-danger" @click="showDeleteConfirmation">
                <i class="fas fa-trash"></i>
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="hideDeleteConfirmation">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-exclamation-triangle"></i>
            Xác nhận xóa tài khoản
          </h3>
        </div>
        <div class="modal-body">
          <p>Bạn có chắc chắn muốn xóa tài khoản vĩnh viễn không?</p>
          <p><strong>Hành động này không thể hoàn tác và sẽ xóa tất cả:</strong></p>
          <ul>
            <li>Thông tin cá nhân</li>
            <li>Dữ liệu và file đã lưu</li>
            <li>Lịch sử hoạt động</li>
            <li>Cài đặt và tùy chỉnh</li>
          </ul>
          <div class="confirmation-input">
            <label>Nhập "XÓA TÀI KHOẢN" để xác nhận:</label>
            <input 
              type="text"
              v-model="deleteConfirmationText"
              placeholder="XÓA TÀI KHOẢN"
              class="form-input"
            />
          </div>
        </div>
        <div class="modal-actions">
          <button 
            class="btn btn-danger"
            @click="deleteAccount"
            :disabled="deleteConfirmationText !== 'XÓA TÀI KHOẢN'"
          >
            <i class="fas fa-trash"></i>
            Xóa vĩnh viễn
          </button>
          <button class="btn btn-secondary" @click="hideDeleteConfirmation">
            <i class="fas fa-times"></i>
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Password visibility toggles
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Password data
const passwordData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Password strength
const passwordStrength = ref({
  level: 'weak',
  percentage: 0,
  text: 'Yếu',
  tips: []
})

// Delete modal
const showDeleteModal = ref(false)
const deleteConfirmationText = ref('')

// Login history
const loginHistory = ref([
  {
    id: 1,
    device: 'Chrome trên Windows',
    deviceIcon: 'fab fa-chrome',
    location: 'Hà Nội, Việt Nam',
    ip: '123.456.789.123',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: 'success',
    isCurrent: true
  },
  {
    id: 2,
    device: 'Safari trên iPhone',
    deviceIcon: 'fab fa-safari',
    location: 'Hà Nội, Việt Nam',
    ip: '123.456.789.124',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'success',
    isCurrent: false
  },
  {
    id: 3,
    device: 'Firefox trên Ubuntu',
    deviceIcon: 'fab fa-firefox',
    location: 'TP.HCM, Việt Nam',
    ip: '123.456.789.125',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: 'success',
    isCurrent: false
  },
  {
    id: 4,
    device: 'Chrome trên Android',
    deviceIcon: 'fab fa-android',
    location: 'Đà Nẵng, Việt Nam',
    ip: '123.456.789.126',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    status: 'failed',
    isCurrent: false
  }
])

// Computed
const passwordsMatch = computed(() => {
  return passwordData.value.newPassword === passwordData.value.confirmPassword
})

const canChangePassword = computed(() => {
  return passwordData.value.currentPassword &&
         passwordData.value.newPassword &&
         passwordData.value.confirmPassword &&
         passwordsMatch.value &&
         passwordStrength.value.level !== 'weak'
})

// Methods
const checkPasswordStrength = () => {
  const password = passwordData.value.newPassword
  let score = 0
  let tips = []

  if (password.length < 8) {
    tips.push('Tối thiểu 8 ký tự')
  } else {
    score += 1
  }

  if (!/[a-z]/.test(password)) {
    tips.push('Cần có chữ thường')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    tips.push('Cần có chữ hoa')
  } else {
    score += 1
  }

  if (!/[0-9]/.test(password)) {
    tips.push('Cần có số')
  } else {
    score += 1
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    tips.push('Cần có ký tự đặc biệt')
  } else {
    score += 1
  }

  // Calculate strength
  let level, text, percentage
  if (score <= 2) {
    level = 'weak'
    text = 'Yếu'
    percentage = 20
  } else if (score <= 3) {
    level = 'medium'
    text = 'Trung bình'
    percentage = 50
  } else if (score <= 4) {
    level = 'strong'
    text = 'Mạnh'
    percentage = 80
  } else {
    level = 'very-strong'
    text = 'Rất mạnh'
    percentage = 100
  }

  passwordStrength.value = { level, text, percentage, tips }
}

const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let password = ''
  
  // Ensure at least one of each type
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
  password += '0123456789'[Math.floor(Math.random() * 10)]
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]
  
  // Fill the rest randomly
  for (let i = 4; i < 16; i++) {
    password += chars[Math.floor(Math.random() * chars.length)]
  }
  
  // Shuffle the password
  password = password.split('').sort(() => Math.random() - 0.5).join('')
  
  passwordData.value.newPassword = password
  passwordData.value.confirmPassword = password
  checkPasswordStrength()
}

const changePassword = () => {
  if (!canChangePassword.value) return

  // Simulate API call
  console.log('Changing password...')
  
  // Reset form
  passwordData.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  
  passwordStrength.value = {
    level: 'weak',
    percentage: 0,
    text: 'Yếu',
    tips: []
  }
  
  alert('Đã đổi mật khẩu thành công!')
}

const formatLoginTime = (timestamp) => {
  const now = new Date()
  const loginTime = new Date(timestamp)
  const diffMs = now - loginTime
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 60) {
    return `${diffMins} phút trước`
  } else if (diffHours < 24) {
    return `${diffHours} giờ trước`
  } else {
    return `${diffDays} ngày trước`
  }
}

const suspendAccount = () => {
  if (confirm('Bạn có chắc chắn muốn tạm khóa tài khoản không?')) {
    console.log('Suspending account...')
    alert('Tài khoản đã được tạm khóa!')
  }
}

const showDeleteConfirmation = () => {
  showDeleteModal.value = true
  deleteConfirmationText.value = ''
}

const hideDeleteConfirmation = () => {
  showDeleteModal.value = false
  deleteConfirmationText.value = ''
}

const deleteAccount = () => {
  if (deleteConfirmationText.value === 'XÓA TÀI KHOẢN') {
    console.log('Deleting account...')
    alert('Tài khoản đã được xóa vĩnh viễn!')
    hideDeleteConfirmation()
  }
}

// Initialize
onMounted(() => {
  // Any initialization code
})
</script>

<style scoped>
.security-page {
  max-width: 800px;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h2 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.page-header p {
  color: #64748b;
  margin: 0;
}

.security-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.security-section {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 16px;
  overflow: hidden;
}

.danger-section {
  border-color: rgba(239, 68, 68, 0.3);
}

.section-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  padding: 1.5rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
}

.danger-section .section-header {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(220, 38, 38, 0.05));
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #374151;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
}

.section-header h3 i {
  color: #6366f1;
  width: 20px;
}

.danger-section .section-header h3 i {
  color: #ef4444;
}

.section-content {
  padding: 1.5rem;
}

/* Password Form */
.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #374151;
  font-weight: 500;
  font-size: 0.875rem;
}

.password-input {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 0.75rem;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  font-size: 0.875rem;
  color: #374151;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

/* Password Strength */
.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background: rgba(226, 232, 240, 0.5);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-fill.weak { background: #ef4444; }
.strength-fill.medium { background: #f59e0b; }
.strength-fill.strong { background: #10b981; }
.strength-fill.very-strong { background: #059669; }

.strength-text {
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.strength-text .weak { color: #ef4444; }
.strength-text .medium { color: #f59e0b; }
.strength-text .strong { color: #10b981; }
.strength-text .very-strong { color: #059669; }

.strength-tips {
  font-size: 0.75rem;
  color: #6b7280;
}

.strength-tips ul {
  margin: 0;
  padding-left: 1rem;
}

.strength-tips li {
  margin-bottom: 0.25rem;
}

/* Password Match */
.password-match {
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

.match-success {
  color: #10b981;
}

.match-error {
  color: #ef4444;
}

/* Login History */
.login-history {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.login-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.login-item:hover {
  background: rgba(255, 255, 255, 0.8);
  border-color: rgba(99, 102, 241, 0.3);
}

.login-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.login-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.login-details h4 {
  color: #1e293b;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.login-details p {
  color: #6b7280;
  font-size: 0.8rem;
  margin: 0;
}

.login-time {
  text-align: right;
  font-size: 0.8rem;
  color: #6b7280;
}

.current-session {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #10b981;
  margin-top: 0.25rem;
}

.current-session i {
  font-size: 0.5rem;
}

.login-status {
  flex-shrink: 0;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.failed {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Danger Actions */
.danger-actions {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.action-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 12px;
}

.action-info h4 {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.action-info p {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.2);
}

.btn-secondary:hover {
  background: rgba(100, 116, 139, 0.15);
  transform: translateY(-1px);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.form-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100001;
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #ef4444;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  color: #374151;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.modal-body ul {
  color: #6b7280;
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.modal-body li {
  margin-bottom: 0.5rem;
}

.confirmation-input {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.confirmation-input label {
  display: block;
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.modal-actions {
  padding: 1.5rem;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 768px) {
  .form-actions,
  .modal-actions {
    flex-direction: column;
  }
  
  .login-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .action-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
}
</style>