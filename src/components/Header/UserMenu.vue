
<template>
  <div class="user-menu">
    <div class="dropdown-container" @click="toggleDropdown">
      <div class="user-info group">
        <div class="user-avatar-container">
          <img 
            :src="userAvatar" 
            alt="User Avatar" 
            class="user-avatar"
          />
          <div class="status-indicator"></div>
        </div>
        <div class="user-details">
          <div class="user-name-row">
            <span class="user-name">{{ userName }}</span>
            <i class="chevron-icon fas fa-chevron-down" :class="{ 'rotated': showDropdown }"></i>
          </div>
          <div class="user-role">{{ userRole }}</div>
        </div>
      </div>
      
      <!-- Advanced Dropdown Menu -->
      <Transition name="dropdown" appear>
        <div v-if="showDropdown" class="dropdown-menu">
          <!-- User Header with Glassmorphism -->
          <div class="user-header">
            <div class="user-header-content">
              <div class="user-avatar-large">
                <img :src="userAvatar" alt="User Avatar" />
                <div class="avatar-ring"></div>
              </div>
              <div class="user-info-detailed">
                <h3 class="user-name-large">{{ userName }}</h3>
                <p class="user-email">{{ userEmail }}</p>
                <div class="user-badges">
                  <span class="badge badge-primary">{{ userRole }}</span>
                  <span class="badge badge-secondary">{{ userClass }}</span>
                </div>
              </div>
            </div>
            <div class="header-gradient"></div>
          </div>
          
          <!-- Menu Items with Advanced Animations -->
          <div class="menu-items">
            <div class="menu-section">
              <a href="#" class="menu-item" data-item="profile">
                <div class="menu-icon">
                  <i class="fas fa-user"></i>
                </div>
                <span class="menu-text">Hồ sơ cá nhân</span>
                <i class="fas fa-chevron-right menu-arrow"></i>
              </a>
              
              <a href="#" class="menu-item" data-item="settings">
                <div class="menu-icon">
                  <i class="fas fa-cog"></i>
                </div>
                <span class="menu-text">Cài đặt</span>
                <i class="fas fa-chevron-right menu-arrow"></i>
              </a>
              
              <div class="menu-item" @click="toggleDarkMode" data-item="darkmode">
                <div class="menu-icon">
                  <i class="fas fa-moon" :class="{ 'fa-sun': isDarkMode }"></i>
                </div>
                <span class="menu-text">{{ isDarkMode ? 'Chế độ sáng' : 'Chế độ tối' }}</span>
                <div class="toggle-switch" :class="{ 'active': isDarkMode }">
                  <div class="toggle-slider"></div>
                </div>
              </div>
            </div>

            <div class="menu-section">
              <div class="menu-item language-item" @click="toggleLanguageMenu" data-item="language">
                <div class="menu-icon">
                  <i class="fas fa-globe"></i>
                </div>
                <span class="menu-text">Ngôn ngữ</span>
                <i class="fas fa-chevron-right menu-arrow" :class="{ 'rotated': showLanguageMenu }"></i>
              </div>
              
              <!-- Advanced Language Submenu -->
              <Transition name="submenu">
                <div v-if="showLanguageMenu" class="language-submenu">
                  <div 
                    class="language-option" 
                    :class="{ 'active': currentLanguage === 'vi' }"
                    @click="changeLanguage('vi')"
                  >
                    <span class="flag">🇻🇳</span>
                    <span class="language-name">Tiếng Việt</span>
                    <Transition name="check">
                      <i v-if="currentLanguage === 'vi'" class="fas fa-check check-icon"></i>
                    </Transition>
                  </div>
                  <div 
                    class="language-option"
                    :class="{ 'active': currentLanguage === 'en' }"
                    @click="changeLanguage('en')"
                  >
                    <span class="flag">🇺🇸</span>
                    <span class="language-name">English</span>
                    <Transition name="check">
                      <i v-if="currentLanguage === 'en'" class="fas fa-check check-icon"></i>
                    </Transition>
                  </div>
                </div>
              </Transition>
            </div>
            
            <div class="menu-section logout-section">
              <a href="#" class="menu-item logout-item" @click="handleMenuClick('logout')" data-item="logout">
                <div class="menu-icon logout-icon">
                  <i class="fas fa-sign-out-alt"></i>
                </div>
                <span class="menu-text">Đăng xuất</span>
                <i class="fas fa-chevron-right menu-arrow"></i>
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// User data from auth store
const user = computed(() => authStore.user)
const userName = computed(() => user.value?.name || 'Người dùng')
const userRole = computed(() => {
  const role = user.value?.role
  const roleNames = {
    'admin': '👨‍💻 Admin',
    'staff': '🧑‍💼 Giáo vụ khoa', 
    'teacher': '👨‍🏫 Giảng viên',
    'student': '🧑‍🎓 Sinh viên'
  }
  return roleNames[role] || '🔹 Người dùng'
})
const userEmail = computed(() => user.value?.email || '')
const userClass = computed(() => user.value?.user_code || '')
const userAvatar = computed(() => user.value?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName.value)}&background=667eea&color=fff`)

// State management
const showDropdown = ref(false)
const showLanguageMenu = ref(false)
const isDarkMode = ref(false)

// Language settings
const { locale } = useI18n()
const currentLanguage = ref(locale.value || 'vi')

// Enhanced interactions
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
  showLanguageMenu.value = false
  
  // Add body scroll lock when dropdown is open
  if (showDropdown.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}

const closeDropdown = () => {
  showDropdown.value = false
  showLanguageMenu.value = false
  document.body.style.overflow = ''
}

const toggleLanguageMenu = (event) => {
  event.stopPropagation()
  showLanguageMenu.value = !showLanguageMenu.value
}

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  // Here you would typically dispatch to a store or emit an event
  document.documentElement.classList.toggle('dark', isDarkMode.value)
}

const changeLanguage = (lang) => {
  currentLanguage.value = lang
  locale.value = lang
  showLanguageMenu.value = false
  
  // Add subtle feedback
  setTimeout(() => {
    showDropdown.value = false
    document.body.style.overflow = ''
  }, 300)
}

// Logout function
const handleLogout = () => {
  authStore.logout()
  closeDropdown()
  router.push('/login')
}

// Handle menu item clicks
const handleMenuClick = (action) => {
  closeDropdown()
  
  switch (action) {
    case 'profile':
      // Navigate to profile page
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      handleLogout()
      break
  }
}

// Keyboard navigation
const handleKeydown = (event) => {
  if (event.key === 'Escape' && showDropdown.value) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Base styles */
.user-menu {
  position: relative;
}

.dropdown-container {
  position: relative;
}

/* Enhanced User Info Trigger */
.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.15);
}

.user-avatar-container {
  position: relative;
  margin-right: 12px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
}

.user-info:hover .user-avatar {
  border-color: rgba(59, 130, 246, 0.6);
  transform: scale(1.05);
}

.status-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 10px;
  height: 10px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.user-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  color: #1f2937;
  white-space: nowrap;
}

.user-role {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.chevron-icon {
  font-size: 10px;
  color: #9ca3af;
  transition: transform 0.3s ease;
}

.chevron-icon.rotated {
  transform: rotate(180deg);
}

/* Advanced Dropdown Menu */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  z-index: 9999;
  overflow: hidden;
}

/* User Header with Glassmorphism */
.user-header {
  position: relative;
  padding: 24px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05));
  pointer-events: none;
}

.user-header-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
}

.user-avatar-large {
  position: relative;
  margin-right: 16px;
}

.user-avatar-large img {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.avatar-ring {
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 50%;
  background: conic-gradient(from 0deg, #3b82f6, #8b5cf6, #3b82f6);
  animation: rotate 3s linear infinite;
  z-index: -1;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.user-info-detailed {
  flex: 1;
}

.user-name-large {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.user-email {
  font-size: 13px;
  color: #6b7280;
  margin: 0 0 8px 0;
}

.user-badges {
  display: flex;
  gap: 8px;
}

.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-primary {
  background: rgba(59, 130, 246, 0.2);
  color: #1d4ed8;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.badge-secondary {
  background: rgba(147, 51, 234, 0.2);
  color: #7c3aed;
  border: 1px solid rgba(147, 51, 234, 0.3);
}

/* Menu Items */
.menu-items {
  padding: 12px 0;
}

.menu-section {
  margin-bottom: 8px;
}

.menu-section:last-child {
  margin-bottom: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: #374151;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s ease;
}

.menu-item:hover::before {
  left: 100%;
}

.menu-item:hover {
  background: rgba(59, 130, 246, 0.05);
  transform: translateX(4px);
}

.menu-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  border-radius: 6px;
  background: rgba(156, 163, 175, 0.1);
  transition: all 0.3s ease;
}

.menu-item:hover .menu-icon {
  background: rgba(59, 130, 246, 0.2);
  transform: scale(1.1);
}

.menu-icon i {
  font-size: 14px;
  color: #6b7280;
  transition: color 0.3s ease;
}

.menu-item:hover .menu-icon i {
  color: #3b82f6;
}

.menu-text {
  flex: 1;
}

.menu-arrow {
  font-size: 10px;
  color: #9ca3af;
  transition: all 0.3s ease;
}

.menu-item:hover .menu-arrow {
  color: #3b82f6;
  transform: translateX(2px);
}

.menu-arrow.rotated {
  transform: rotate(90deg);
}

/* Dark Mode Toggle */
.toggle-switch {
  width: 44px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-switch.active {
  background: #3b82f6;
}

.toggle-slider {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-switch.active .toggle-slider {
  transform: translateX(20px);
}

/* Language Submenu */
.language-submenu {
  background: rgba(249, 250, 251, 0.8);
  backdrop-filter: blur(10px);
  margin: 4px 16px;
  border-radius: 8px;
  border: 1px solid rgba(229, 231, 235, 0.5);
  overflow: hidden;
}

.language-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  position: relative;
}

.language-option:hover {
  background: rgba(59, 130, 246, 0.1);
}

.language-option.active {
  background: rgba(59, 130, 246, 0.15);
  color: #1d4ed8;
  font-weight: 600;
}

.flag {
  margin-right: 12px;
  font-size: 18px;
}

.language-name {
  flex: 1;
}

.check-icon {
  color: #10b981;
  font-size: 12px;
  animation: checkBounce 0.3s ease;
}

@keyframes checkBounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-4px); }
  60% { transform: translateY(-2px); }
}

/* Logout Section */
.logout-section {
  border-top: 1px solid rgba(229, 231, 235, 0.5);
  margin-top: 8px;
  padding-top: 8px;
}

.logout-item {
  color: #ef4444;
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.05);
}

.logout-icon {
  background: rgba(239, 68, 68, 0.1);
}

.logout-item:hover .logout-icon {
  background: rgba(239, 68, 68, 0.2);
}

.logout-icon i {
  color: #ef4444;
}

/* Animations */
.dropdown-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-leave-active {
  transition: all 0.2s ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.98);
}

.submenu-enter-active {
  transition: all 0.3s ease;
}

.submenu-leave-active {
  transition: all 0.2s ease;
}

.submenu-enter-from {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}

.submenu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
}

.check-enter-active {
  transition: all 0.3s ease;
}

.check-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

/* Responsive Design */
@media (max-width: 768px) {
  .user-details {
    display: none;
  }
  
  .dropdown-menu {
    width: 280px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .user-name,
  .user-name-large {
    color: #f9fafb;
  }
  
  .dropdown-menu {
    background: rgba(17, 24, 39, 0.95);
    border-color: rgba(55, 65, 81, 0.3);
  }
  
  .menu-item {
    color: #d1d5db;
  }
  
  .menu-item:hover {
    background: rgba(55, 65, 81, 0.3);
  }
}
</style>