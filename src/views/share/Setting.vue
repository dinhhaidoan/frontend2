<template>
  <div class="settings-container">
    <!-- Header Section -->
    <div class="settings-header">
      <div class="header-content">
        <div class="header-info">
          <div class="page-icon">
            <i class="fas fa-cog"></i>
          </div>
          <div class="page-details">
            <h1>Cài đặt hệ thống</h1>
            <p>Quản lý thông tin cá nhân, giao diện, ngôn ngữ và bảo mật tài khoản của bạn</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="settings-main">
      <!-- Settings Menu Sidebar -->
      <aside class="settings-sidebar">
        <div class="menu-section">
          <h3>Danh mục cài đặt</h3>
          <nav class="settings-menu">
            <button
              v-for="item in menuItems"
              :key="item.id"
              :class="['menu-item', { 'active': activeMenu === item.id }]"
              @click="setActiveMenu(item.id)"
            >
              <div class="menu-icon">
                <i :class="item.icon"></i>
              </div>
              <div class="menu-content">
                <h4>{{ item.name }}</h4>
                <p>{{ item.description }}</p>
              </div>
            </button>
          </nav>
        </div>
      </aside>

      <!-- Settings Content Area -->
      <main class="settings-content">
        <div class="content-wrapper">
          <!-- Dynamic Content Based on Active Menu -->
          <div class="content-area">
            <!-- Profile Settings -->
            <ProfilePage v-if="activeMenu === 'profile'" />
            <!-- Language Settings -->
            <LanguagePage v-else-if="activeMenu === 'language'" />

            <!-- Security Settings -->
            <SecurityPage v-else-if="activeMenu === 'security'" />

            <!-- Default Welcome Message -->
            <div v-else class="welcome-section">
              <div class="welcome-card">
                <div class="welcome-icon">
                  <i class="fas fa-cogs"></i>
                </div>
                <h3>Chào mừng đến với Cài đặt</h3>
                <p>Chọn một danh mục từ menu bên trái để bắt đầu tùy chỉnh hệ thống của bạn</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Import setting page components
import ProfilePage from '@/pages/Settings/ProfilePage.vue'
import LanguagePage from '@/pages/Settings/LanguagePage.vue'
import SecurityPage from '@/pages/Settings/SecurityPage.vue'

// Reactive data
const activeMenu = ref('')

// Menu items configuration
const menuItems = ref([
  {
    id: 'profile',
    name: 'Hồ sơ cá nhân',
    description: 'Quản lý thông tin cá nhân và ảnh đại diện',
    icon: 'fas fa-user-circle'
  },
  {
    id: 'language',
    name: 'Ngôn ngữ',
    description: 'Thay đổi ngôn ngữ hiển thị',
    icon: 'fas fa-globe'
  },
  {
    id: 'security',
    name: 'Bảo mật',
    description: 'Quản lý mật khẩu và bảo mật tài khoản',
    icon: 'fas fa-shield-alt'
  }
])

// Methods
const setActiveMenu = (menuId) => {
  activeMenu.value = menuId
}

// Initialize
onMounted(() => {
  // Set default active menu
  activeMenu.value = 'profile'
})
</script>

<style scoped>
/* Container */
.settings-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

/* Header Section */
.settings-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(226, 232, 240, 0.5);
  padding: 2rem 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.page-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
}

.page-details h1 {
  margin: 0;
  color: #1e293b;
  font-size: 2rem;
  font-weight: 700;
}

.page-details p {
  margin: 0.5rem 0 0 0;
  color: #64748b;
  font-size: 1rem;
}

/* Main Content */
.settings-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2rem;
  align-items: start;
}

/* Sidebar */
.settings-sidebar {
  position: sticky;
  top: 120px;
}

.menu-section h3 {
  color: #374151;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-left: 0.5rem;
}

.settings-menu {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  width: 100%;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: rgba(99, 102, 241, 0.3);
}

.menu-item.active {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-color: #6366f1;
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.2);
}

.menu-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.menu-item.active .menu-icon {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
}

.menu-content {
  flex: 1;
}

.menu-content h4 {
  margin: 0;
  color: #1e293b;
  font-size: 0.95rem;
  font-weight: 600;
}

.menu-content p {
  margin: 0.25rem 0 0 0;
  color: #64748b;
  font-size: 0.8rem;
  line-height: 1.4;
}

.menu-item.active .menu-content h4 {
  color: #4f46e5;
}

/* Content Area */
.settings-content {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: 20px;
  min-height: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
}

.content-wrapper {
  padding: 2rem;
}

.content-area {
  min-height: 400px;
}

/* Welcome Section */
.welcome-section {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
}

.welcome-card {
  text-align: center;
  max-width: 400px;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.3);
}

.welcome-card h3 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.welcome-card p {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .settings-main {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  
  .settings-sidebar {
    position: static;
  }
  
  .header-content {
    padding: 0 1rem;
  }
  
  .header-info {
    gap: 1rem;
  }
  
  .page-icon {
    width: 50px;
    height: 50px;
    font-size: 1.2rem;
  }
  
  .page-details h1 {
    font-size: 1.5rem;
  }
  
  .menu-item {
    gap: 0.75rem;
    padding: 0.75rem;
  }
  
  .menu-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}
</style>
