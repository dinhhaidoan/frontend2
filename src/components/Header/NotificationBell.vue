<template>
  <div class="notification-bell">
    <div class="notification-wrapper" ref="bellRef" @click="toggleNotifications">
      <button class="notification-button" :class="{ 'has-notifications': notificationCount > 0 }">
        <i class="fas fa-bell notification-icon" :class="{ 'ringing': hasNewNotifications }"></i>
        <Transition name="badge">
          <div v-if="notificationCount > 0" class="notification-badge">
            {{ notificationCount > 99 ? '99+' : notificationCount }}
          </div>
        </Transition>
        <div class="button-glow"></div>
      </button>
    </div>
    
    <!-- Advanced Notification Dropdown -->
    <Transition name="dropdown">
      <div v-if="showNotifications" ref="dropdownRef" class="notifications-dropdown">
        <div class="notifications-header">
          <div class="header-title">
            <i class="fas fa-bell text-blue-500"></i>
            <h3>Thông báo</h3>
            <span class="notification-count">({{ filteredNotifications.length }})</span>
          </div>
          <div class="header-actions">
            <div class="actions-left">
              <select v-model="selectedFilter" class="filter-select">
                <option value="all">Tất cả</option>
                <option value="unread">Chưa đọc</option>
                <option value="high">Quan trọng</option>
              </select>
            </div>
            <button @click="toggleNotifications" class="close-button">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <div class="notifications-content">
          <div v-if="filteredNotifications.length === 0" class="empty-state">
            <div class="empty-icon">
              <i class="fas fa-bell-slash"></i>
            </div>
            <h4>{{ getEmptyMessage() }}</h4>
            <p>{{ getEmptyDescription() }}</p>
          </div>
          
          <div v-else class="notifications-list">
            <div
              v-for="notification in filteredNotifications"
              :key="notification.id"
              class="notification-item"
              :class="{ 'unread': !notification.read, 'priority': notification.priority === 'high' }"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-avatar">
                <div class="avatar-wrapper" :class="`avatar-${notification.type}`">
                  <i :class="notification.icon"></i>
                </div>
                <div v-if="!notification.read" class="unread-indicator"></div>
              </div>
              
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-message">{{ notification.message }}</div>
                <div class="notification-meta">
                  <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
                  <span class="notification-category">{{ notification.category }}</span>
                  <span v-if="notification.author" class="notification-author">
                    <i class="fas fa-user"></i>
                    {{ notification.author }}
                  </span>
                </div>
              </div>
              
              <div class="notification-actions">
                <button @click.stop="markAsRead(notification)" v-if="!notification.read" class="mark-read-btn">
                  <i class="fas fa-check"></i>
                </button>
                <button @click.stop="removeNotification(notification.id)" class="remove-btn">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div v-if="notifications.length > 0" class="notifications-footer">
          <button @click="viewAllNotifications" class="view-all-btn">
            <i class="fas fa-external-link-alt"></i>
            Xem tất cả thông báo
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserRole } from '../../composables/useUserRole'

const showNotifications = ref(false)
const hasNewNotifications = ref(false)
const selectedFilter = ref('all')
const dropdownRef = ref(null)
const bellRef = ref(null)

const router = useRouter()
const { isAdmin } = useUserRole()

// Mock notifications data - Enhanced for different user roles
const notifications = ref([
  {
    id: 1,
    title: 'Thông báo nghỉ học',
    message: 'Do ảnh hưởng của bão số 3, nhà trường quyết định cho sinh viên nghỉ học ngày mai',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    read: false,
    type: 'academic',
    category: 'Học tập',
    priority: 'high',
    icon: 'fas fa-graduation-cap',
    author: 'Phòng Đào tạo'
  },
  {
    id: 2,
    title: 'Lịch thi cuối kỳ',
    message: 'Lịch thi cuối kỳ môn Lập trình Web đã được cập nhật, vui lòng kiểm tra',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    type: 'exam',
    category: 'Thi cử',
    priority: 'high',
    icon: 'fas fa-file-alt',
    author: 'Khoa CNTT'
  },
  {
    id: 3,
    title: 'Bài tập mới',
    message: 'Giảng viên vừa giao bài tập mới cho môn JavaScript, hạn nộp 3 ngày',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    read: true,
    type: 'assignment',
    category: 'Bài tập',
    priority: 'medium',
    icon: 'fas fa-tasks',
    author: 'TS. Nguyễn Văn A'
  },
  {
    id: 4,
    title: 'Sự kiện hội thảo',
    message: 'Hội thảo "Xu hướng công nghệ 2024" sẽ diễn ra vào tuần tới',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    read: true,
    type: 'event',
    category: 'Sự kiện',
    priority: 'low',
    icon: 'fas fa-calendar',
    author: 'Ban Học vụ'
  },
  {
    id: 5,
    title: 'Tin nhắn mới',
    message: 'Bạn có tin nhắn mới từ nhóm học tập Lập trình Web',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    read: false,
    type: 'message',
    category: 'Tin nhắn',
    priority: 'low',
    icon: 'fas fa-envelope',
    author: 'Nhóm học tập'
  }
])

const notificationCount = computed(() => notifications.value.filter(n => !n.read).length)
const unreadCount = computed(() => notifications.value.filter(n => !n.read).length)

const filteredNotifications = computed(() => {
  let filtered = notifications.value
  
  switch (selectedFilter.value) {
    case 'unread':
      filtered = filtered.filter(n => !n.read)
      break
    case 'high':
      filtered = filtered.filter(n => n.priority === 'high')
      break
    default:
      // Show all notifications
      break
  }
  
  // Sort by priority and timestamp
  return filtered.sort((a, b) => {
    // High priority first
    if (a.priority === 'high' && b.priority !== 'high') return -1
    if (a.priority !== 'high' && b.priority === 'high') return 1
    
    // Unread first
    if (!a.read && b.read) return -1
    if (a.read && !b.read) return 1
    
    // Then by timestamp (newest first)
    return new Date(b.timestamp) - new Date(a.timestamp)
  })
})

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) {
    hasNewNotifications.value = false
    // Mark recent notifications as seen (not read, just seen)
    notifications.value.forEach(notification => {
      if (!notification.seen) {
        notification.seen = true
      }
    })
  }
}

const handleClickOutside = (event) => {
  const isClickInsideBell = bellRef.value && bellRef.value.contains(event.target)
  const isClickInsideDropdown = dropdownRef.value && dropdownRef.value.contains(event.target)
  
  if (!isClickInsideBell && !isClickInsideDropdown && showNotifications.value) {
    showNotifications.value = false
  }
}

const markAsRead = (notification) => {
  notification.read = true
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.read = true)
}

const removeNotification = (id) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

const handleNotificationClick = (notification) => {
  if (!notification.read) {
    markAsRead(notification)
  }
  
  // Navigate to relevant page based on notification type
  try {
    switch (notification.type) {
      case 'assignment':
      case 'exam':
        // Navigate to specific assignment or exam page
        console.log('Navigate to assignment/exam:', notification)
        break
      case 'academic':
        // Navigate to academic announcements
        viewAllNotifications()
        break
      case 'event':
        // Navigate to events page
        console.log('Navigate to events:', notification)
        break
      case 'message':
        // Navigate to messages
        router.push({ name: 'messages' })
        showNotifications.value = false
        break
      default:
        // Default to notifications page
        viewAllNotifications()
    }
  } catch (e) {
    console.warn('Navigation failed:', e)
  }
}

const viewAllNotifications = () => {
  // Navigate to the appropriate notifications page based on role
  try {
    const { getCurrentRole, isAdmin, isStaff, isTeacher, isStudent } = useUserRole()
    const currentRole = getCurrentRole()
    
    // Navigate based on user role
    switch (currentRole) {
      case 'admin':
        router.push({ name: 'admin-notifications' })
        break
      case 'staff':
        router.push({ name: 'staff-notifications' })
        break
      case 'teacher':
        router.push({ name: 'teacher-notifications' })
        break
      case 'student':
        router.push({ name: 'student-notifications' })
        break
      default:
        router.push({ name: 'notifications' })
    }
  } catch (e) {
    // ignore navigation errors (e.g., redundant navigation)
    console.warn('Navigation failed', e)
  } finally {
    showNotifications.value = false
  }
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  return `${days} ngày trước`
}

const getEmptyMessage = () => {
  switch (selectedFilter.value) {
    case 'unread':
      return 'Không có thông báo chưa đọc'
    case 'high':
      return 'Không có thông báo quan trọng'
    default:
      return 'Không có thông báo'
  }
}

const getEmptyDescription = () => {
  switch (selectedFilter.value) {
    case 'unread':
      return 'Tất cả thông báo đã được đọc. Tuyệt vời!'
    case 'high':
      return 'Hiện tại không có thông báo nào cần xử lý gấp.'
    default:
      return 'Bạn sẽ nhận được thông báo về học tập và hoạt động tại đây.'
  }
}

// Simulate new notifications
const simulateNewNotification = () => {
  hasNewNotifications.value = true
  setTimeout(() => {
    hasNewNotifications.value = false
  }, 3000)
}

// Auto simulate new notifications for demo
onMounted(() => {
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
  
  const interval = setInterval(() => {
    if (!showNotifications.value && Math.random() > 0.7) {
      simulateNewNotification()
    }
  }, 10000) // Every 10 seconds

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
    clearInterval(interval)
  })
})
</script>

<style scoped>
.notification-bell {
  position: relative;
}

.notification-wrapper {
  position: relative;
}

/* Enhanced Notification Button */
.notification-button {
  position: relative;
  width: 44px;
  height: 44px;
  border: none;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.6));
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.notification-button:hover {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05));
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.15);
}

/* .notification-button.has-notifications {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
  border-color: rgba(59, 130, 246, 0.3);
} */

.button-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.notification-button:hover .button-glow {
  opacity: 1;
}

/* Notification Icon */
.notification-icon {
  font-size: 18px;
  color: #6b7280;
  transition: all 0.3s ease;
}

.notification-button:hover .notification-icon {
  color: #3b82f6;
  transform: scale(1.1);
}

.notification-icon.ringing {
  animation: ring 1s ease-in-out infinite;
}

@keyframes ring {
  0%, 20%, 50%, 80%, 100% { transform: rotate(0deg); }
  10% { transform: rotate(10deg) scale(1.1); }
  30% { transform: rotate(-10deg) scale(1.1); }
  60% { transform: rotate(5deg) scale(1.1); }
  90% { transform: rotate(-5deg) scale(1.1); }
}

/* Notification Badge */
.notification-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 20px;
  height: 20px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 11px;
  font-weight: 700;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
  border: 2px solid white;
  animation: pulse-badge 2s ease-in-out infinite;
}

@keyframes pulse-badge {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Notifications Dropdown */
.notifications-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 380px;
  max-height: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(229, 231, 235, 0.3);
  border-radius: 16px;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  z-index: 9999;
  overflow: hidden;
}

/* Header */
.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(147, 51, 234, 0.05));
  border-bottom: 1px solid rgba(229, 231, 235, 0.3);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-title h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.notification-count {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  flex-shrink: 0;
  min-width: 0;
}

.actions-left {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.filter-select {
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 6px;
  color: #374151;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:focus {
  outline: none;
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.close-button {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-button:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

/* Content */
.notifications-content {
  max-height: 360px;
  overflow-y: auto;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.empty-icon i {
  font-size: 24px;
  color: #9ca3af;
}

.empty-state h4 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-state p {
  font-size: 14px;
  line-height: 1.5;
  margin: 0;
}

/* Notification Items */
.notification-item {
  display: flex;
  align-items: flex-start;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid rgba(229, 231, 235, 0.2);
  position: relative;
}

.notification-item:hover {
  background: rgba(59, 130, 246, 0.03);
}

.notification-item.unread {
  background: rgba(59, 130, 246, 0.02);
  border-left: 3px solid #3b82f6;
}

.notification-item.priority {
  border-left-color: #ef4444;
}

.notification-avatar {
  position: relative;
  margin-right: 12px;
}

.avatar-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.avatar-course,
.avatar-academic {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.avatar-assignment {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.avatar-exam {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.avatar-event {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.avatar-reminder {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.avatar-message {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.unread-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
  line-height: 1.3;
}

.notification-message {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  margin-bottom: 8px;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  flex-wrap: wrap;
}

.notification-time {
  color: #9ca3af;
}

.notification-category {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.notification-author {
  color: #6b7280;
  background: rgba(107, 114, 128, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.notification-author i {
  font-size: 9px;
}

.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
}

.mark-read-btn,
.remove-btn {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.2s ease;
}

.mark-read-btn {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.mark-read-btn:hover {
  background: rgba(16, 185, 129, 0.2);
}

.remove-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

/* Footer */
.notifications-footer {
  padding: 12px 20px;
  background: rgba(249, 250, 251, 0.8);
  border-top: 1px solid rgba(229, 231, 235, 0.3);
}

.view-all-btn {
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.view-all-btn:hover {
  background: rgba(59, 130, 246, 0.05);
  border-color: rgba(59, 130, 246, 0.3);
}

/* Animations */
.badge-enter-active, .badge-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.badge-enter-from, .badge-leave-to {
  opacity: 0;
  transform: scale(0);
}

.dropdown-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-leave-active {
  transition: all 0.2s ease-in;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}

/* Responsive Design */
@media (max-width: 768px) {
  .notifications-dropdown {
    width: 320px;
    right: -20px;
  }
  
  .actions-left {
    gap: 6px;
  }
  
  .filter-select {
    font-size: 10px;
    padding: 3px 6px;
  }
  
  .mark-all-read {
    font-size: 10px;
    padding: 4px 8px;
  }
  
  .mark-all-text {
    display: none;
  }
}

@media (max-width: 640px) {
  .notifications-dropdown {
    width: 280px;
    right: -40px;
  }
  
  .notification-item {
    padding: 12px 16px;
  }
  
  .notifications-header {
    padding: 12px 16px;
  }
  
  .header-title h3 {
    font-size: 14px;
  }
  
  .notification-count {
    font-size: 11px;
  }
  
  .actions-left {
    gap: 4px;
  }
  
  .filter-select {
    font-size: 9px;
    padding: 2px 4px;
    min-width: 60px;
  }
  
  .mark-all-read {
    padding: 4px 6px;
    font-size: 9px;
  }
  
  .mark-all-text {
    display: none;
  }
  
  .close-button {
    width: 24px;
    height: 24px;
    font-size: 11px;
  }
}

/* Custom scrollbar */
.notifications-content::-webkit-scrollbar {
  width: 4px;
}

.notifications-content::-webkit-scrollbar-track {
  background: rgba(229, 231, 235, 0.3);
  border-radius: 2px;
}

.notifications-content::-webkit-scrollbar-thumb {
  background: rgba(156, 163, 175, 0.5);
  border-radius: 2px;
}

.notifications-content::-webkit-scrollbar-thumb:hover {
  background: rgba(156, 163, 175, 0.7);
}
</style>