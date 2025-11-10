<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <Sidebar 
      ref="sidebarRef" 
      v-show="!isSidebarCollapsed || isMobileOpen" />
    
    <!-- Main Content Area -->
    <div class="main-wrapper" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <!-- Header -->
      <Header />
      
      <!-- Page Content -->
      <main class="main-content">
        <div class="content-container">
          <div class="page-header">
            <div class="page-title">
              <h1>{{ currentHeader.title }}</h1>
              <p v-if="currentHeader.subtitle">{{ currentHeader.subtitle }}</p>
            </div>
            <div class="page-actions">
              <!-- Render configured actions for the current page; fallback to sidebar toggle -->
              <template v-if="currentHeader.actions && currentHeader.actions.length">
                <button
                  v-for="action in currentHeader.actions"
                  :key="action.id"
                  @click="handleHeaderAction(action)"
                  class="sidebar-toggle"
                  :title="action.title || ''">
                  <i :class="action.icon"></i>
                  <span v-if="action.label" style="margin-left:8px">{{ action.label }}</span>
                </button>
              </template>
              <button v-else @click="toggleSidebar" class="sidebar-toggle">
                <i class="fas fa-bars"></i>
              </button>
            </div>
          </div>
          
          <div class="content-area">
            <!-- Dynamic Content Based on Active Route -->
            <router-view :key="route.fullPath + '-' + activeMenuId" />
          </div>
        </div>
      </main>
    </div>
    
    <!-- Floating Sidebar Toggle -->
    <button 
      @click="toggleSidebar" 
      class="floating-sidebar-toggle"
      :class="{ 'collapsed': isSidebarCollapsed }"
      :title="isSidebarCollapsed ? 'Mở sidebar' : 'Đóng sidebar'"
    >
      <div class="toggle-icon">
        <i class="fas fa-chevron-left" :class="{ 'rotated': isSidebarCollapsed }"></i>
      </div>
      <div class="toggle-glow"></div>
    </button>
    
    <!-- Mobile Sidebar Overlay -->
    <div 
      v-if="isMobileOpen" 
      class="sidebar-overlay" 
      @click="closeMobileSidebar"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, provide, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Header from './Header.vue'
import Sidebar from './Sidebar.vue'
import Setting from './share/Setting.vue'

// Default dashboard home component
const DashboardHome = {
  template: `
    <div class="welcome-section">
      <div class="welcome-card">
        <div class="card-icon">
          <i class="fas fa-graduation-cap"></i>
        </div>
        <div class="card-content">
          <h3>Bắt đầu học tập</h3>
          <p>Khám phá các khóa học mới và tiếp tục hành trình học tập của bạn.</p>
          <button class="cta-button">
            <span>Khám phá ngay</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `
}

// Components
const components = {
  dashboard: () => import('../components/Dashboard-AD/Overview.vue').catch(() => DashboardHome),
  'course-registration': DashboardHome,
  'curriculum': DashboardHome,
  'my-classes': DashboardHome,
  'today-lessons': DashboardHome,
  'assignments': DashboardHome,
  'schedule': DashboardHome,
  'materials': DashboardHome,
  'notes': DashboardHome,
  'coding-env': DashboardHome,
  'messages': DashboardHome,
  'forum': DashboardHome,
  'ai-tutor': DashboardHome,
  'notifications': DashboardHome,
  'profile': DashboardHome,
  'lesson-management': DashboardHome,
  'assignment-management': DashboardHome,
  'grading': DashboardHome,
  'materials-management': DashboardHome,
  'teaching-notes': DashboardHome,
  'coding-demo': DashboardHome,
  'ai-assistant': DashboardHome,
  'class-notifications': DashboardHome,
  'student-management': DashboardHome,
  'teacher-management': DashboardHome,
  'course-management': DashboardHome,
  'schedule-management': DashboardHome,
  'curriculum-management': DashboardHome,
  'reports': DashboardHome,
  'work-notes': DashboardHome,
  'internal-messages': DashboardHome,
  'department-forum': DashboardHome,
  'ai-management': DashboardHome,
  'department-notifications': DashboardHome,
  'system-dashboard': DashboardHome,
  'account-management': DashboardHome,
  'permissions': DashboardHome,
  'data-management': DashboardHome,
  'system-config': DashboardHome,
  'security-logs': DashboardHome,
  'system-analytics': DashboardHome,
  'admin-notes': DashboardHome,
  'admin-messages': DashboardHome,
  'admin-forum': DashboardHome,
  'ai-admin': DashboardHome,
  'settings': Setting
}

const sidebarRef = ref(null)
const isSidebarCollapsed = ref(false)
const isMobileOpen = ref(false)
const activeMenuId = ref('dashboard')
const route = useRoute()
const router = useRouter()

// Initialize from route
activeMenuId.value = route.name || route.path.replace('/', '') || 'dashboard'

// Keep activeMenuId in sync when route changes
watch(() => [route.name, route.path], ([name, path]) => {
  const menuId = name || path.replace('/', '') || 'dashboard'
  activeMenuId.value = menuId
  console.log('Route changed:', { name, path, menuId })
}, { immediate: true })

// Computed component based on active menu
const currentPageComponent = computed(() => {
  return components[activeMenuId.value] || DashboardHome
})

// Provide active menu to child components
provide('activeMenuId', activeMenuId)

// Handle menu selection from sidebar
const handleMenuSelect = async (menuId) => {
  console.log('handleMenuSelect called with:', menuId)
  
  // Navigate to the route first
  const targetRoute = menuId === 'dashboard' ? '/dashboard' : `/${menuId}`
  console.log('Navigating to:', targetRoute)
  
  try {
    await router.push(targetRoute)
    console.log('Navigation successful to:', targetRoute)
    
    // Update activeMenuId after navigation
    await nextTick()
    activeMenuId.value = menuId
    console.log('ActiveMenuId updated to:', menuId)
  } catch (error) {
    console.warn('Navigation failed from Default.vue:', error)
  }
}

// Provide menu selection handler to sidebar
provide('selectMenuItem', handleMenuSelect)

// Header configurations per page (title, subtitle, actions)
// Prefer route.meta.title/meta.subtitle when available. headerConfigs remain as a fallback for specific menu IDs.
const headerConfigs = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Chào mừng bạn trở lại StudyHub!',
    actions: []
  },
  'course-registration': {
    title: 'Đăng ký học phần',
    subtitle: 'Chọn học phần cho học kỳ',
    actions: [
      { id: 'register', icon: 'fas fa-user-plus', label: 'Đăng ký' }
    ]
  },
  'today-lessons': {
    title: 'Bài học hôm nay',
    subtitle: 'Tham gia lớp trực tuyến khi đến giờ',
    actions: [
      { id: 'join-all', icon: 'fas fa-video', label: 'Vào tất cả' }
    ]
  },
  settings: {
    title: 'Cài đặt',
    subtitle: 'Tùy chỉnh giao diện, ngôn ngữ và bảo mật',
    actions: []
  }
}

// Helper: humanize a route or menu id into a readable title
const humanize = (str) => {
  if (!str) return ''
  return String(str)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
}

// Computed header for current page: prefer route.meta, then headerConfigs, then humanized activeMenuId, finally dashboard
const currentHeader = computed(() => {
  const meta = route.meta || {}
  if (meta.title) {
    return {
      title: meta.title,
      subtitle: meta.subtitle || '',
      actions: meta.actions || []
    }
  }

  if (headerConfigs[activeMenuId.value]) {
    return headerConfigs[activeMenuId.value]
  }

  // If the active route is the default 'notes' or an actual component, try to derive a friendly title from activeMenuId
  const title = humanize(activeMenuId.value)
  return {
    title: title || 'Dashboard',
    subtitle: '',
    actions: []
  }
})

// Generic handler for header actions
const handleHeaderAction = (action) => {
  // Provide a few common action handlers; otherwise log
  switch (action.id) {
    case 'register':
      console.log('Open registration modal')
      break
    case 'join-all':
      console.log('Joining all active meetings...')
      break
    default:
      console.log('Header action clicked', action)
  }
}

const toggleSidebar = () => {
  if (window.innerWidth <= 768) {
    // Mobile: toggle overlay
    isMobileOpen.value = !isMobileOpen.value
    sidebarRef.value?.toggleMobile()
  } else {
    // Desktop: toggle visibility (hide/show completely)
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }
}

const closeMobileSidebar = () => {
  isMobileOpen.value = false
  sidebarRef.value?.toggleMobile()
}

const handleWindowResize = () => {
  if (window.innerWidth > 768) {
    isMobileOpen.value = false
    // Keep desktop sidebar state as is
  } else {
    // On mobile, ensure sidebar is ready for overlay mode
    isSidebarCollapsed.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<style scoped>
/* App Layout */
.app-layout {
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  position: relative;
  z-index: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

/* Global rule to prevent horizontal overflow */
.app-layout * {
  box-sizing: border-box;
}

/* Main Wrapper */
.main-wrapper {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
  z-index: auto;
  overflow-x: hidden;
  width: calc(100% - 280px);
  box-sizing: border-box;
}

.main-wrapper.sidebar-collapsed {
  margin-left: 0;
  width: 100%;
}

/* Main Content */
.main-content {
  flex: 1;
  padding-top: 80px; /* Header height */
  background: transparent;
  position: relative;
  z-index: auto;
}

.content-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.page-title h1 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  background: linear-gradient(135deg, #1f2937, #3b82f6);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.page-title p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-toggle {
  width: 44px;
  height: 44px;
  border: none;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  color: #3b82f6;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.sidebar-toggle:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(147, 51, 234, 0.15));
  border-color: rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.2);
}

.sidebar-toggle:active {
  transform: translateY(0);
}

/* Content Area */
.content-area {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

/* Dynamic Page Container */
.content-area > * {
  flex: 1;
  animation: pageSlideIn 0.3s ease-out;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

@keyframes pageSlideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Welcome Section */
.welcome-section {
  margin-bottom: 32px;
}

.welcome-card {
  display: flex;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.08),
    0 4px 16px rgba(0, 0, 0, 0.04);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.welcome-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent);
  transition: left 0.8s ease;
}

.welcome-card:hover::before {
  left: 100%;
}

.welcome-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.12),
    0 8px 24px rgba(0, 0, 0, 0.08);
}

.card-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24px;
  position: relative;
  flex-shrink: 0;
}

.card-icon::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: conic-gradient(from 0deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6);
  border-radius: 22px;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.welcome-card:hover .card-icon::before {
  opacity: 1;
  animation: rotate 2s linear infinite;
}

.card-icon i {
  font-size: 32px;
  color: white;
  transition: all 0.3s ease;
}

.welcome-card:hover .card-icon i {
  transform: scale(1.1);
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.card-content {
  flex: 1;
  position: relative;
  z-index: 2;
}

.card-content h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.card-content p {
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.6;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #2563eb, #7c3aed);
}

.cta-button:active {
  transform: translateY(0);
}

.cta-button i {
  transition: transform 0.3s ease;
}

.cta-button:hover i {
  transform: translateX(2px);
}

/* Floating Sidebar Toggle */
.floating-sidebar-toggle {
  position: fixed;
  left: 240px;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(147, 51, 234, 0.95));
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 60;
  box-shadow: 
    0 4px 16px rgba(59, 130, 246, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: none;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
  overflow: hidden;
}

.floating-sidebar-toggle.collapsed {
  left: 20px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(59, 130, 246, 0.95));
  box-shadow: 
    0 4px 16px rgba(16, 185, 129, 0.3),
    0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  border-top-left-radius: 50%;
  border-bottom-left-radius: 50%;
}

.floating-sidebar-toggle:hover {
  transform: translateY(-50%) scale(1.1);
  box-shadow: 
    0 8px 24px rgba(59, 130, 246, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.15);
}

.floating-sidebar-toggle.collapsed:hover {
  box-shadow: 
    0 8px 24px rgba(16, 185, 129, 0.4),
    0 4px 12px rgba(0, 0, 0, 0.15);
}

.toggle-icon {
  position: relative;
  z-index: 2;
  color: white;
  font-size: 14px;
  transition: all 0.3s ease;
}

.toggle-icon i {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toggle-icon i.rotated {
  transform: rotate(180deg);
}

.floating-sidebar-toggle:hover .toggle-icon {
  transform: scale(1.2);
}

.toggle-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3), transparent 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%) scale(0);
  transition: transform 0.3s ease;
  pointer-events: none;
}

.floating-sidebar-toggle:hover .toggle-glow {
  transform: translate(-50%, -50%) scale(1.5);
}

/* Floating button animation */
.floating-sidebar-toggle {
  animation: float-gentle 3s ease-in-out infinite;
}

@keyframes float-gentle {
  0%, 100% { 
    transform: translateY(-50%) translateX(0px);
  }
  50% { 
    transform: translateY(-50%) translateX(2px);
  }
}

.floating-sidebar-toggle:hover {
  animation: none;
}

/* Pulse effect for attention */
.floating-sidebar-toggle::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: inherit;
  border-radius: 50%;
  opacity: 0;
  animation: pulse-ring 2s ease-out infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.3;
  }
  50% {
    opacity: 0.1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

/* Mobile Sidebar Overlay */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 45;
  opacity: 0;
  animation: fadeIn 0.3s ease forwards;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

/* Mobile Styles */
@media (max-width: 768px) {
  .floating-sidebar-toggle {
    display: none;
  }
  
  .main-wrapper {
    margin-left: 0;
  }
  
  .main-wrapper.sidebar-collapsed {
    margin-left: 0;
  }
  
  .main-content {
    padding-top: 70px; /* Adjusted header height for mobile */
  }
  
  .content-container {
    padding: 16px;
  }
  
  .page-header {
    padding: 16px 20px;
    margin-bottom: 24px;
  }
  
  .page-title h1 {
    font-size: 24px;
  }
  
  .welcome-card {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }
  
  .card-icon {
    margin-right: 0;
    margin-bottom: 16px;
  }
  
  .card-content h3 {
    font-size: 20px;
  }
  
  .card-content p {
    font-size: 14px;
  }
}

/* Tablet Styles */
@media (max-width: 1024px) and (min-width: 769px) {
  .main-wrapper {
    margin-left: 260px;
  }
  
  .main-wrapper.sidebar-collapsed {
    margin-left: 80px;
  }
  
  .content-container {
    padding: 20px;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .app-layout {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  }
  
  .page-header {
    background: rgba(17, 24, 39, 0.8);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .page-title h1 {
    color: #f9fafb;
    background: linear-gradient(135deg, #f9fafb, #60a5fa);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .page-title p {
    color: #9ca3af;
  }
  
  .welcome-card {
    background: linear-gradient(135deg, rgba(17, 24, 39, 0.9), rgba(17, 24, 39, 0.7));
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .card-content h3 {
    color: #f9fafb;
  }
  
  .card-content p {
    color: #9ca3af;
  }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  .main-wrapper,
  .welcome-card,
  .sidebar-toggle,
  .cta-button,
  .card-icon,
  .sidebar-overlay {
    transition: none;
    animation: none;
  }
}

/* Print Styles */
@media print {
  .app-layout {
    background: white;
  }
  
  .sidebar-toggle {
    display: none;
  }
  
  .main-wrapper {
    margin-left: 0;
  }
  
  .main-content {
    padding-top: 0;
  }
}
</style>