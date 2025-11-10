<template>
  <div class="login-container">
    <!-- Background Elements -->
    <div class="background-overlay">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
      <div class="gradient-orbs">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
    </div>

    <!-- Main Login Content -->
    <div class="login-wrapper">
      <!-- University Header -->
      <div class="university-header">
        <div class="university-logo">
          <div class="logo-container">
            <i class="fas fa-university"></i>
          </div>
          <div class="university-info">
            <h1>KHOA CÔNG NGHỆ THÔNG TIN</h1>
            <p>TRƯỜNG ĐẠI HỌC NGUYỄN TẤT THÀNH</p>
          </div>
        </div>
      </div>

      <!-- Login Card -->
      <div class="login-card">
        <div class="card-header">
          <div class="studyhub-logo">
            <i class="fas fa-graduation-cap"></i>
            <span>StudyHub</span>
          </div>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <!-- User ID Input -->
          <div class="form-group">
            <label class="form-label">Tên tài khoản</label>
            <div class="input-container">
              <div class="input-icon">
                <i class="fas fa-id-card"></i>
              </div>
              <input
                v-model="credentials.userId"
                type="text"
                class="form-input"
                placeholder="Ví dụ: 21520001"
                required
              />
            </div>
          </div>

          <!-- Password Input -->
          <div class="form-group">
            <label class="form-label">Mật khẩu</label>
            <div class="input-container">
              <div class="input-icon">
                <i class="fas fa-lock"></i>
              </div>
              <input
                v-model="credentials.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Nhập mật khẩu"
                required
              />
              <button
                type="button"
                class="password-toggle"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>
          <!-- Submit Button -->
          <button type="submit" class="login-btn" :disabled="isLoading">
            <div v-if="isLoading" class="loading-spinner">
              <i class="fas fa-spinner fa-spin"></i>
            </div>
            <span>{{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập' }}</span>
          </button>

          <!-- Error Message -->
          <div v-if="errorMessage" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            <span>{{ errorMessage }}</span>
          </div>
        </form>

        <!-- Additional Links -->
        <div class="card-footer">
          <div class="help-links">
            <a href="#" class="help-link">
              <i class="fas fa-phone"></i>
              Hỗ trợ kỹ thuật
            </a>
          </div>
          <div class="system-info">
            <p>Hệ thống StudyHub v1.0.1</p>
            <p>© 2025 Trường Đại học Nguyễn Tất Thành</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <div class="toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        :class="['toast', toast.type]"
        @click="removeToast(toast.id)"
      >
        <div class="toast-icon">
          <i :class="toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
        </div>
        <div class="toast-content">
          <h4>{{ toast.title }}</h4>
          <p>{{ toast.message }}</p>
        </div>
        <button class="toast-close" @click.stop="removeToast(toast.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Reactive data
const credentials = ref({
  userId: '',
  password: ''
})
const rememberMe = ref(false)
const showPassword = ref(false)
const toasts = ref([])

// Use loading and error from auth store
const isLoading = authStore.isLoading
const errorMessage = authStore.error

// Toast functions
const showToast = (type, title, message) => {
  const id = Date.now()
  toasts.value.push({
    id,
    type,
    title,
    message
  })
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    removeToast(id)
  }, 5000)
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Login handler
const handleLogin = async () => {
  if (!credentials.value.userId || !credentials.value.password) {
    showToast('error', 'Lỗi đăng nhập', 'Vui lòng nhập đầy đủ thông tin')
    return
  }

  try {
    // Use auth store with correct field names (user_code, user_password)
    const result = await authStore.login(credentials.value.userId, credentials.value.password)
    
    // Success - show success toast
    if (rememberMe.value) {
      localStorage.setItem('rememberedUser', JSON.stringify({
        userId: credentials.value.userId
      }))
    }
    
    // Show success toast
    showToast('success', 'Đăng nhập thành công!', `Chào mừng ${result.user.name} đến với StudyHub`)
    
    console.log('User logged in:', result.user)
    
    // Redirect based on role after a short delay
    setTimeout(() => {
      const dashboardRoute = authStore.getDashboardRoute()
      router.push(dashboardRoute)
    }, 1000)
    
  } catch (error) {
    console.error('Login error:', error)
    showToast('error', 'Đăng nhập thất bại', error.message || 'Thông tin tài khoản hoặc mật khẩu không chính xác')
  }
}
</script>

<style scoped>
/* Container */
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* Background Elements */
.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 20%;
  right: 10%;
  animation-delay: 1s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation-delay: 2s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  bottom: 10%;
  right: 20%;
  animation-delay: 3s;
}

.shape-5 {
  width: 40px;
  height: 40px;
  top: 50%;
  left: 5%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33% { transform: translateY(-20px) rotate(120deg); }
  66% { transform: translateY(20px) rotate(240deg); }
}

.gradient-orbs {
  position: absolute;
  width: 100%;
  height: 100%;
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  animation: pulse 4s ease-in-out infinite;
}

.orb-1 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.3), transparent);
  top: 10%;
  left: 15%;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(147, 51, 234, 0.3), transparent);
  bottom: 10%;
  right: 15%;
  animation-delay: 2s;
}

.orb-3 {
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent);
  top: 50%;
  right: 10%;
  animation-delay: 1s;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.5; }
}

/* Main Wrapper */
.login-wrapper {
  width: 100%;
  max-width: 480px;
  position: relative;
  z-index: 10;
}

/* University Header */
.university-header {
  text-align: center;
  margin-bottom: 32px;
}

.university-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.logo-container {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.logo-container i {
  font-size: 32px;
  color: #667eea;
}

.university-info h1 {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.university-info p {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

/* Login Card */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 40px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.15),
    0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea, #764ba2);
}

/* Card Header */
.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.studyhub-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.studyhub-logo i {
  font-size: 28px;
  color: #667eea;
}

.studyhub-logo span {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}

.card-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 8px 0;
}

.card-header p {
  font-size: 16px;
  color: #64748b;
  margin: 0;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* Input Container */
.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  z-index: 2;
  color: #9ca3af;
  font-size: 16px;
}

.form-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  background: #ffffff;
  transition: all 0.3s ease;
  outline: none;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.password-toggle {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 16px;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #667eea;
}

/* Remember Checkbox */
.remember-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

/* Login Button */
.login-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 14px;
}

/* Card Footer */
.card-footer {
  margin-top: 32px;
  text-align: center;
}

.help-links {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}

.help-link {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.help-link:hover {
  color: #4f46e5;
}

.system-info {
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.5;
}

.system-info p {
  margin: 0;
}

/* Toast Notifications */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border-left: 4px solid;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transform: translateX(100%);
  animation: slideIn 0.3s ease forwards;
  position: relative;
  overflow: hidden;
}

.toast::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.1) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.toast:hover::before {
  transform: translateX(100%);
}

.toast.success {
  border-left-color: #10b981;
}

.toast.error {
  border-left-color: #ef4444;
}

.toast-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 12px;
}

.toast.success .toast-icon {
  background: #d1fae5;
  color: #10b981;
}

.toast.error .toast-icon {
  background: #fee2e2;
  color: #ef4444;
}

.toast-content {
  flex: 1;
  min-width: 0;
}

.toast-content h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.toast-content p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
}

.toast-close {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 50%;
  color: #9ca3af;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.toast-close:hover {
  background: #f3f4f6;
  color: #374151;
}

@keyframes slideIn {
  to {
    transform: translateX(0);
  }
}

/* Toast exit animation */
.toast.removing {
  animation: slideOut 0.3s ease forwards;
}

@keyframes slideOut {
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .login-container {
    padding: 16px;
  }
  
  .university-info h1 {
    font-size: 20px;
  }
  
  .login-card {
    padding: 24px;
  }
  
  .card-header h2 {
    font-size: 24px;
  }
  
  .help-links {
    flex-direction: column;
    gap: 12px;
  }
  
  .toast-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
  
  .toast {
    padding: 12px 16px;
  }
  
  .toast-content h4 {
    font-size: 13px;
  }
  
  .toast-content p {
    font-size: 12px;
  }
}
</style>
