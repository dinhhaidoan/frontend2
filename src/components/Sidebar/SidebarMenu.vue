<template>
  <nav class="sidebar-menu">
    <!-- Loading state when auth is not loaded -->
    <div v-if="!authStore.isAuthenticated() && authStore.isLoading" class="menu-loading">
      <div class="loading-item" v-for="n in 6" :key="n">
        <div class="loading-icon"></div>
        <div class="loading-text"></div>
      </div>
    </div>
    
    <!-- Menu items -->
    <div v-else class="menu-list">
      <div
        v-for="item in menuItems"
        :key="item.id"
        class="menu-item"
        :class="{ 'active': item.id === activeItemId, 'highlighted': item.highlighted }"
        @click="selectMenuItem(item)"
      >
        <div class="menu-item-content">
          <div class="menu-icon">
            <i :class="item.icon"></i>
          </div>
          <div class="menu-text-wrapper">
            <span class="menu-text">{{ item.label }}</span>
            <span v-if="item.description" class="menu-description">{{ item.description }}</span>
          </div>
          <!-- Badge for unread count -->
          <span v-if="item.badge && item.badge > 0" class="menu-badge">
            {{ item.badge > 99 ? '99+' : item.badge }}
          </span>
        </div>
        <div class="menu-indicator"></div>
        <div class="menu-glow"></div>
      </div>
    </div>
    
    <!-- Debug info (remove in production) -->
    <div v-if="false" class="debug-info">
      <small>
        Role: {{ currentRole }} | Auth: {{ authStore.isAuthenticated() }} | 
        User: {{ authStore.user?.role || 'none' }}
      </small>
    </div>
  </nav>
</template>

<script setup>
import { ref, inject, watch, computed, onMounted } from 'vue'
import { useUserRole } from '../../composables/useUserRole.js'
import { useAuthStore } from '@/stores/auth'

const activeItemId = ref('dashboard')

// Inject the menu selection handler from parent
const selectMenuItemHandler = inject('selectMenuItem', null)
const providedActiveMenuId = inject('activeMenuId', ref('dashboard'))

// Use role management and auth store
const { currentRole, isStudent, isTeacher, isStaff, isAdmin, ROLES } = useUserRole()
const authStore = useAuthStore()

// Watch for changes in provided active menu ID
watch(providedActiveMenuId, (newValue) => {
  console.log('Sidebar received activeMenuId change:', newValue)
  activeItemId.value = newValue
}, { immediate: true })

// Menu items for different roles
const menuItemsByRole = {
  [ROLES.STUDENT]: [
    {
      id: 'student-dashboard',
      label: 'Dashboard',
      icon: 'fas fa-home',
      highlighted: true
    },
    {
      id: 'register-subject',
      label: 'Đăng ký học phần',
      icon: 'fas fa-calendar-plus'
    },
    {
      id: 'student-frameworksubject',
      label: 'Chương trình khung',
      icon: 'fas fa-sitemap'
    },
    {
      id: 'student-classes',
      label: 'Lớp học của tôi',
      icon: 'fas fa-chalkboard-teacher'
    },
    {
      id: 'student-lessons',
      label: 'Bài học',
      icon: 'fas fa-video',
    },
    {
      id: 'student-assignments',
      label: 'Bài tập & Kiểm tra',
      icon: 'fas fa-file-alt'
    },
    {
      id: 'schedule-students',
      label: 'Lịch học / lịch thi',
      icon: 'fas fa-calendar-alt'
    },
    {
      id: 'notes',
      label: 'Ghi chú cá nhân',
      icon: 'fas fa-sticky-note',
    },
    {
      id: 'code-environment',
      label: 'Môi trường code',
      icon: 'fas fa-code',
    },
    {
      id: 'ai-students',
      label: ' AI Trợ lý học tập',
      icon: 'fas fa-robot'
    },
    {
      id: 'student-notifications',
      label: ' Thông báo',
      icon: 'fas fa-bell',
      badge: 3
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: 'fas fa-user'
    }
  ],
  
  [ROLES.TEACHER]: [
    {
      id: 'teacher-dashboard',
      label: 'Dashboard',
      icon: 'fas fa-home',
    },
    {
      id: 'my-classes',
      label: 'Lớp học phụ trách',
      icon: 'fas fa-chalkboard-teacher',
    },
    {
      id: 'lesson',
      label: 'Quản lý bài học',
      icon: 'fas fa-file-powerpoint',
    },
    {
      id: 'lesson-details',
      label: 'Quản lý bài tập / đề thi',
      icon: 'fas fa-tasks'
    },
    {
      id: 'teacher-schedule',
      label: 'Lịch giảng dạy',
      icon: 'fas fa-calendar-alt'
    },
    {
      id: 'notes',
      label: 'Ghi chú',
      icon: 'fas fa-sticky-note',
    },
    {
      id: 'code-environment',
      label: 'Môi trường code',
      icon: 'fas fa-code',
    },
    {
      id: 'teacher-notifications',
      label: 'Thông báo',
      icon: 'fas fa-bullhorn'
    },
    {
      id: 'settings',
      label: 'Cài đặt',
      icon: 'fas fa-user'
    }
  ],
  
  [ROLES.STAFF]: [
    {
      id: 'staff-dashboard',
      label: 'Dashboard',
      icon: 'fas fa-home',
      highlighted: true
    },
    {
      id: 'staff-accounts',
      label: 'Quản lý tài khoản',
      icon: 'fas fa-users-cog',
    },
    {
      id: 'staff-students',
      label: 'Quản lý sinh viên',
      icon: 'fas fa-user-graduate'
    },
    {
      id: 'staff-official-class',
      label: 'Lớp hành chính',
      icon: 'fas fa-users'
    },
    {
      id: 'staff-teachers',
      label: 'Quản lý giảng viên',
      icon: 'fas fa-chalkboard-teacher'
    },
    {
      id: 'staff-academic-years',
      label: 'Khóa học & Học kỳ',
      icon: 'fas fa-calendar-alt'
    },
    {
      id: 'staff-notes',
      label: 'Ghi chú',
      icon: 'fas fa-sticky-note',
    },
    {
      id: 'staff-subjects',
      label: 'Quản lý môn học',
      icon: 'fas fa-book',
    },
    {
      id: 'staff-schedule',
      label: 'Xếp lịch học / thi',
      icon: 'fas fa-calendar-week'
    },
    {
      id: 'staff-frameworksubject',
      label: 'Chương trình đào tạo',
      icon: 'fas fa-sitemap'
    },
    {
      id: 'staff-reports',
      label: 'Thống kê báo cáo',
      icon: 'fas fa-chart-bar'
    },
    {
      id: 'staff-notifications',
      label: 'Thông báo',
      icon: 'fas fa-bullhorn'
    },
    {
      id: 'settings',
      label: 'Cài đặt hệ thống',
      icon: 'fas fa-cogs'
    }
  ],
  
  [ROLES.ADMIN]: [
    {
      id: 'admin-dashboard',
      label: 'Dashboard hệ thống',
      icon: 'fas fa-tachometer-alt',
      highlighted: true
    },
    {
      id: 'account-management',
      label: 'Quản lý tài khoản',
      icon: 'fas fa-users'
    },
    { id: 'staff-management',
      label: 'Quản lý giáo vụ khoa',
      icon: 'fas fa-user-tie'
    },
    {
      id: 'admin-notes',
      label: 'Ghi chú',
      icon: 'fas fa-sticky-note',
    },
    {
      id: 'admin-notifications',
      label: 'Quản lý thông báo',
      icon: 'fas fa-bell'
    },
    {
      id: 'settings',
      label: 'Cài đặt hệ thống',
      icon: 'fas fa-cogs'
    }
  ]
}

// Computed menu items based on current role with loading state
const menuItems = computed(() => {
  // If not authenticated, show loading or empty menu
  if (!authStore.isAuthenticated()) {
    return []
  }
  
  const role = currentRole.value
  console.log('Computing menu items for role:', role)
  
  const items = menuItemsByRole[role] || menuItemsByRole[ROLES.ADMIN]
  console.log('Menu items:', items)
  return items
})

// Watch for role changes
watch(currentRole, (newRole, oldRole) => {
  console.log('Role changed from', oldRole, 'to', newRole)
}, { immediate: true })

// Ensure auth is loaded on mount
onMounted(() => {
  if (!authStore.isAuthenticated()) {
    authStore.loadUserFromStorage()
  }
})

import { useRouter } from 'vue-router'
const router = useRouter()

const selectMenuItem = (item) => {
  activeItemId.value = item.id

  // Use parent handler for navigation (Default.vue will handle the actual routing)
  if (selectMenuItemHandler) {
    selectMenuItemHandler(item.id)
  }

  console.log('Selected menu item:', item.id)
}
</script>

<style scoped>
.sidebar-menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 16px;
}

.menu-item {
  position: relative;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background: transparent;
}

.menu-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.05), transparent);
  transition: left 0.6s ease;
}

.menu-item:hover::before {
  left: 100%;
}

.menu-item:hover {
  background: rgba(59, 130, 246, 0.05);
  transform: translateX(4px);
}

/* Highlighted style removed - để tránh nhầm lẫn với active state */

.menu-item.active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08));
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  transform: translateX(8px);
}

.menu-item.active .menu-indicator {
  opacity: 1;
  transform: scaleY(1);
}

.menu-item.active .menu-icon {
  background: rgba(59, 130, 246, 0.15);
  transform: scale(1.1);
}

.menu-item.active .menu-icon i {
  color: #1d4ed8;
  transform: scale(1.1);
}

.menu-item.active .menu-text {
  color: #1d4ed8;
  font-weight: 600;
}

.menu-item-content {
  display: flex;
  align-items: flex-start;
  padding: 14px 16px;
  gap: 12px;
  position: relative;
  z-index: 2;
}

.menu-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(107, 114, 128, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.menu-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  opacity: 0;
  transition: opacity 0.3s ease;
}

.menu-item:hover .menu-icon::before {
  opacity: 1;
}

.menu-icon i {
  font-size: 16px;
  color: #6b7280;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.menu-item:hover .menu-icon {
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.05);
}

.menu-item:hover .menu-icon i {
  color: #3b82f6;
  transform: scale(1.05);
}

.menu-text-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.menu-text {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  transition: all 0.3s ease;
  line-height: 1.4;
  word-wrap: break-word;
}

.menu-description {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.3;
  opacity: 0.8;
  transition: all 0.3s ease;
  word-wrap: break-word;
}

.menu-badge {
  position: absolute;
  top: 10px;
  right: 12px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 7px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
  animation: badge-pulse 2s ease-in-out infinite;
  z-index: 3;
}

@keyframes badge-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 3px 8px rgba(239, 68, 68, 0.6);
  }
}

.menu-item:hover .menu-badge {
  animation: badge-bounce 0.5s ease;
}

@keyframes badge-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

.menu-item:hover .menu-text {
  color: #1f2937;
  transform: translateX(2px);
}

.menu-item:hover .menu-description {
  color: #64748b;
  opacity: 1;
}

/* Active indicator */
.menu-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 0 4px 4px 0;
  transform: translateY(-50%) scaleY(0);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Glow effect */
.menu-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1), transparent 70%);
  border-radius: 12px;
  transform: translate(-50%, -50%) scale(0);
  opacity: 0;
  transition: all 0.4s ease;
  pointer-events: none;
}

.menu-item.active .menu-glow {
  transform: translate(-50%, -50%) scale(1.2);
  opacity: 1;
}

/* Pulse animation removed - không còn dùng highlighted */

@keyframes gentle-pulse {
  0%, 100% { 
    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
  }
  50% { 
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
  }
}

/* Loading State */
.menu-loading {
  padding: 16px;
}

.loading-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  margin-bottom: 8px;
  border-radius: 12px;
  background: rgba(243, 244, 246, 0.5);
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(209, 213, 219, 0.6);
}

.loading-text {
  flex: 1;
  height: 16px;
  border-radius: 8px;
  background: rgba(209, 213, 219, 0.6);
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}

/* Debug info */
.debug-info {
  position: fixed;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px;
  border-radius: 4px;
  font-size: 10px;
  z-index: 9999;
}

/* Custom scrollbar */
.sidebar-menu::-webkit-scrollbar {
  width: 4px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: rgba(229, 231, 235, 0.2);
  border-radius: 2px;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.4);
  border-radius: 2px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.6);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .menu-text {
    color: #d1d5db;
  }
  
  .menu-item:hover .menu-text {
    color: #f9fafb;
  }
  
  .menu-icon i {
    color: #9ca3af;
  }
  
  .menu-item:hover .menu-icon i {
    color: #60a5fa;
  }
  
  .menu-item.active .menu-text {
    color: #60a5fa;
  }
  
  .menu-item.active .menu-icon i {
    color: #60a5fa;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .menu-list {
    padding: 0 12px;
  }
  
  .menu-item-content {
    padding: 12px 14px;
  }
  
  .menu-icon {
    width: 32px;
    height: 32px;
  }
  
  .menu-icon i {
    font-size: 14px;
  }
  
  .menu-text {
    font-size: 13px;
  }
}

/* Animation delays for staggered entrance */
.menu-item:nth-child(1) { animation-delay: 0.1s; }
.menu-item:nth-child(2) { animation-delay: 0.2s; }
.menu-item:nth-child(3) { animation-delay: 0.3s; }
.menu-item:nth-child(4) { animation-delay: 0.4s; }
.menu-item:nth-child(5) { animation-delay: 0.5s; }
.menu-item:nth-child(6) { animation-delay: 0.6s; }
.menu-item:nth-child(7) { animation-delay: 0.7s; }
.menu-item:nth-child(8) { animation-delay: 0.8s; }
.menu-item:nth-child(9) { animation-delay: 0.9s; }

/* Loading state */
.menu-item.loading {
  pointer-events: none;
}

.menu-item.loading .menu-text {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 4px;
  color: transparent;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Focus states for accessibility */
.menu-item:focus {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .menu-item,
  .menu-icon,
  .menu-text,
  .menu-indicator,
  .menu-glow {
    transition: none;
    animation: none;
  }
}
</style>