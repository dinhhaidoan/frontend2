<template>
  <div class="profile-page">
    <div class="page-header">
      <h2>Hồ sơ cá nhân</h2>
      <p>Quản lý thông tin cá nhân và ảnh đại diện của bạn</p>
    </div>

    <div class="profile-content">
      <!-- Avatar Section -->
      <div class="profile-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-camera"></i>
            Ảnh đại diện
          </h3>
        </div>
        <div class="section-content">
          <div class="avatar-container">
            <div class="current-avatar">
              <img :src="avatarSrc(profileData.avatar) || defaultAvatar" alt="Avatar" @error="onAvatarError($event, profileData.avatar)" />
              <div class="avatar-overlay">
                <i class="fas fa-camera"></i>
              </div>
            </div>
            <div class="avatar-actions">
              <button class="btn btn-primary" @click="triggerAvatarUpload">
                <i class="fas fa-upload"></i>
                Thay đổi ảnh
              </button>
              <button class="btn btn-secondary" @click="removeAvatar" v-if="profileData.avatar">
                <i class="fas fa-trash"></i>
                Xóa ảnh
              </button>
            </div>
            <input 
              ref="avatarInput" 
              type="file" 
              accept="image/*" 
              @change="handleAvatarUpload"
              style="display: none"
            />
          </div>
        </div>
      </div>

      <!-- Personal Information -->
      <div class="profile-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-user"></i>
            Thông tin cá nhân
          </h3>
        </div>
        <div class="section-content">
          <div class="form-grid">
            <div class="form-group">
              <label>Họ và tên</label>
              <input 
                type="text" 
                v-model="profileData.fullName" 
                placeholder="Nhập họ và tên"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Email</label>
              <input 
                type="email" 
                v-model="profileData.email" 
                placeholder="Nhập email"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Số điện thoại</label>
              <input 
                type="tel" 
                v-model="profileData.phone" 
                placeholder="Nhập số điện thoại"
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Ngày sinh</label>
              <input 
                type="date" 
                v-model="profileData.birthDate" 
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Giới tính</label>
              <select v-model="profileData.gender" class="form-select">
                <option value="">Chọn giới tính</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Địa chỉ</label>
              <input 
                type="text" 
                v-model="profileData.address" 
                placeholder="Nhập địa chỉ"
                class="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Bio Section -->
      <div class="profile-section">
        <div class="section-header">
          <h3>
            <i class="fas fa-edit"></i>
            Giới thiệu bản thân
          </h3>
        </div>
        <div class="section-content">
          <div class="form-group">
            <textarea 
              v-model="profileData.bio" 
              placeholder="Viết vài dòng giới thiệu về bản thân..."
              class="form-textarea"
              rows="4"
            ></textarea>
            <div class="char-count">
              {{ profileData.bio?.length || 0 }}/500 ký tự
            </div>
          </div>
        </div>
      </div>

      <!-- Save Actions -->
      <div class="profile-actions">
        <button class="btn btn-primary" @click="saveProfile" :disabled="!hasChanges">
          <i class="fas fa-save"></i>
          Lưu thay đổi
        </button>
        <button class="btn btn-secondary" @click="resetProfile">
          <i class="fas fa-undo"></i>
          Khôi phục
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'

// Avatar input reference
const avatarInput = ref(null)

// Profile data
const profileData = ref({
  avatar: '',
  fullName: '',
  email: '',
  phone: '',
  birthDate: '',
  gender: '',
  address: '',
  bio: ''
})

// Original data for comparison
const originalData = ref({})

// Default avatar
const defaultAvatar = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23e2e8f0"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'

// Computed
const hasChanges = computed(() => {
  return JSON.stringify(profileData.value) !== JSON.stringify(originalData.value)
})

// Methods
const triggerAvatarUpload = () => {
  avatarInput.value?.click()
}

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      profileData.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const removeAvatar = () => {
  profileData.value.avatar = ''
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

const saveProfile = () => {
  // Simulate API call
  console.log('Saving profile:', profileData.value)
  
  // Update original data
  originalData.value = { ...profileData.value }
  
  // Show success message
  alert('Đã lưu thông tin hồ sơ thành công!')
}

const resetProfile = () => {
  profileData.value = { ...originalData.value }
  if (avatarInput.value) {
    avatarInput.value.value = ''
  }
}

const loadProfile = () => {
  // Simulate loading profile data
  const mockData = {
    avatar: '',
    fullName: 'Nguyễn Văn A',
    email: 'nguyen.van.a@example.com',
    phone: '0123456789',
    birthDate: '1990-01-01',
    gender: 'male',
    address: 'Hà Nội, Việt Nam',
    bio: 'Tôi là một lập trình viên đam mê công nghệ và học hỏi những điều mới mẻ.'
  }
  
  profileData.value = { ...mockData }
  originalData.value = { ...mockData }
}

// Watch for bio length limit
watch(() => profileData.value.bio, (newBio) => {
  if (newBio && newBio.length > 500) {
    profileData.value.bio = newBio.substring(0, 500)
  }
})

// Initialize
onMounted(() => {
  loadProfile()
})

// avatar fallback helpers -- for protected avatar URLs (403 fallback)
const blobMap = ref({})

const avatarSrc = (url) => {
  if (!url) return null
  // if it's a data URL (preview), keep it
  if (typeof url === 'string' && url.startsWith('data:')) return url
  return blobMap.value[url] || url
}

const onAvatarError = async (event, url) => {
  try {
    if (!url || blobMap.value[url]) return
    const b = await fetchImageAsBlobUrl(url)
    blobMap.value[url] = b
    event.target.src = b
  } catch (err) {
    console.debug('avatar fetch fallback failed', err)
  }
}

onBeforeUnmount(() => {
  Object.values(blobMap.value).forEach(v => revokeBlobUrl(v))
})
</script>

<style scoped>
.profile-page {
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

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.profile-section {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 16px;
  overflow: hidden;
}

.section-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  padding: 1.5rem;
  border-bottom: 1px solid rgba(226, 232, 240, 0.3);
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

.section-content {
  padding: 1.5rem;
}

/* Avatar Section */
.avatar-container {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.current-avatar {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 20px;
  overflow: hidden;
  background: #f1f5f9;
  border: 3px solid rgba(99, 102, 241, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.current-avatar:hover {
  border-color: #6366f1;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.2);
}

.current-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.current-avatar:hover .avatar-overlay {
  opacity: 1;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Form Elements */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  font-size: 0.875rem;
  color: #374151;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.char-count {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
  margin-top: 0.25rem;
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

.profile-actions {
  display: flex;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .avatar-container {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .avatar-actions {
    flex-direction: row;
    justify-content: center;
  }
  
  .profile-actions {
    flex-direction: column;
  }
}
</style>