<template>
  <div class="student-notification-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>
        <div class="header-actions">
          <button 
            class="btn btn-secondary"
            @click="markAllAsRead"
            :disabled="unreadCount === 0"
          >
            <i class="fas fa-check-double"></i>
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>
    </div>

    <!-- Notification Stats for Student -->
    <StudentNotificationStats 
      :stats="notificationStats" 
      :loading="loading"
    />

    <!-- Filters and Search -->
    <StudentNotificationFilters
      v-model:search="filters.search"
      v-model:category="filters.category"
      v-model:priority="filters.priority"
      v-model:dateRange="filters.dateRange"
      v-model:readStatus="filters.readStatus"
      :categories="availableCategories"
      @filter-change="handleFilterChange"
    />

    <!-- Main Content -->
    <div class="notification-content">
      <!-- Notification List -->
      <div class="notification-list-section">
        <div class="section-header">
          <h2>{{ listTitle }}</h2>
          <div class="list-controls">
            <div class="view-toggle">
              <button 
                class="view-btn" 
                :class="{ active: viewMode === 'list' }"
                @click="setViewMode('list')"
                title="Xem dạng danh sách"
              >
                <i class="fas fa-list"></i>
              </button>
              <button 
                class="view-btn" 
                :class="{ active: viewMode === 'grid' }"
                @click="setViewMode('grid')"
                title="Xem dạng lưới"
              >
                <i class="fas fa-th-large"></i>
              </button>
            </div>
            <div class="sort-options">
              <select v-model="sortBy" @change="handleSort">
                <option value="createdAt">Mới nhất</option>
                <option value="priority">Độ ưu tiên</option>
                <option value="category">Danh mục</option>
                <option value="readStatus">Trạng thái đọc</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="loading-spinner"></div>
          <p>Đang tải thông báo...</p>
        </div>

        <!-- Notification List -->
        <StudentNotificationList
          v-else
          :notifications="filteredNotifications"
          :view-mode="viewMode"
          :loading="actionLoading"
          @notification-click="handleNotificationClick"
          @mark-as-read="handleMarkAsRead"
          @mark-as-unread="handleMarkAsUnread"
          @archive="handleArchive"
          @pin="handlePin"
        />

        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1">
          <button 
            class="page-btn" 
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              class="page-number"
              :class="{ active: page === currentPage }"
              @click="changePage(page)"
              v-if="page !== '...'"
            >
              {{ page }}
            </button>
            <span v-else class="page-ellipsis">...</span>
          </div>
          
          <button 
            class="page-btn" 
            :disabled="currentPage >= totalPages"
            @click="changePage(currentPage + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="notification-sidebar">
        <!-- Quick Stats -->
        <div class="sidebar-section">
          <h3>Thống kê nhanh</h3>
          <div class="quick-stats">
            <div class="quick-stat-item">
              <div class="quick-stat-icon unread">
                <i class="fas fa-bell"></i>
              </div>
              <div class="quick-stat-content">
                <span class="quick-stat-number">{{ unreadCount }}</span>
                <span class="quick-stat-label">Chưa đọc</span>
              </div>
            </div>
            <div class="quick-stat-item">
              <div class="quick-stat-icon today">
                <i class="fas fa-calendar-day"></i>
              </div>
              <div class="quick-stat-content">
                <span class="quick-stat-number">{{ todayCount }}</span>
                <span class="quick-stat-label">Hôm nay</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Categories -->
        <div class="sidebar-section">
          <h3>Danh mục</h3>
          <div class="category-list">
            <button
              v-for="category in availableCategories"
              :key="category.id"
              class="category-item"
              :class="{ active: filters.category === category.id }"
              @click="selectCategory(category.id)"
            >
              <i :class="category.icon"></i>
              <span>{{ category.name }}</span>
              <span class="category-count">{{ getCategoryCount(category.id) }}</span>
            </button>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="sidebar-section">
          <h3>Hoạt động gần đây</h3>
          <div class="recent-activity">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon" :class="activity.type">
                <i :class="activity.icon"></i>
              </div>
              <div class="activity-content">
                <span class="activity-text">{{ activity.text }}</span>
                <span class="activity-time">{{ activity.time }}</span>
              </div>
            </div>
            <div v-if="recentActivities.length === 0" class="no-activity">
              <i class="fas fa-history"></i>
              <span>Chưa có hoạt động nào</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Notification Detail Modal -->
    <StudentNotificationModal
      v-if="showDetailModal"
      :notification="selectedNotification"
      @close="closeDetailModal"
      @mark-as-read="handleMarkAsRead"
      @mark-as-unread="handleMarkAsUnread"
      @archive="handleArchive"
      @pin="handlePin"
    />

    <!-- Toast Notifications -->
    <div class="toast-container" v-if="toasts.length > 0">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="toast.type"
      >
        <i :class="getToastIcon(toast.type)"></i>
        <span>{{ toast.message }}</span>
        <button class="toast-close" @click="removeToast(toast.id)">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import StudentNotificationStats from '@/components/Notifications-Student/StudentNotificationStats.vue'
import StudentNotificationFilters from '@/components/Notifications-Student/StudentNotificationFilters.vue'
import StudentNotificationList from '@/components/Notifications-Student/StudentNotificationList.vue'
import StudentNotificationModal from '@/components/Notifications-Student/StudentNotificationModal.vue'

// Reactive data
const notifications = ref([])
const loading = ref(true)
const actionLoading = ref(false)
const filters = ref({
  search: '',
  category: '',
  priority: '',
  dateRange: null,
  readStatus: '' // 'read', 'unread', ''
})
const viewMode = ref('list')
const sortBy = ref('createdAt')
const currentPage = ref(1)
const itemsPerPage = ref(20)

// Modal states
const showDetailModal = ref(false)
const selectedNotification = ref(null)

// Toast notifications
const toasts = ref([])

// Recent activities
const recentActivities = ref([])

// Page configuration
const pageTitle = 'Thông báo của tôi'
const pageSubtitle = 'Xem thông báo từ nhà trường, khoa và giảng viên'
const listTitle = 'Danh sách thông báo'

// Available categories for students
const availableCategories = [
  { id: '', name: 'Tất cả', icon: 'fas fa-list' },
  { id: 'general', name: 'Chung', icon: 'fas fa-info-circle' },
  { id: 'academic', name: 'Học tập', icon: 'fas fa-graduation-cap' },
  { id: 'event', name: 'Sự kiện', icon: 'fas fa-calendar' },
  { id: 'assignment', name: 'Bài tập', icon: 'fas fa-tasks' },
  { id: 'exam', name: 'Thi cử', icon: 'fas fa-file-alt' },
  { id: 'department', name: 'Khoa', icon: 'fas fa-building' },
  { id: 'system', name: 'Hệ thống', icon: 'fas fa-cog' }
]

// Computed properties
const notificationStats = computed(() => {
  const total = notifications.value.length
  const unread = notifications.value.filter(n => !n.isRead).length
  const today = notifications.value.filter(n => isToday(n.createdAt)).length
  const thisWeek = notifications.value.filter(n => isThisWeek(n.createdAt)).length
  const pinned = notifications.value.filter(n => n.isPinned).length
  const archived = notifications.value.filter(n => n.isArchived).length

  return {
    total,
    unread,
    read: total - unread,
    today,
    thisWeek,
    pinned,
    archived,
    highPriority: notifications.value.filter(n => n.priority === 'high').length,
    mediumPriority: notifications.value.filter(n => n.priority === 'medium').length,
    lowPriority: notifications.value.filter(n => n.priority === 'low').length
  }
})

const unreadCount = computed(() => notificationStats.value.unread)
const todayCount = computed(() => notificationStats.value.today)

const filteredNotifications = computed(() => {
  let filtered = [...notifications.value]

  // Filter by search
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(search) ||
      n.content.toLowerCase().includes(search) ||
      n.author.toLowerCase().includes(search)
    )
  }

  // Filter by category
  if (filters.value.category) {
    filtered = filtered.filter(n => n.category === filters.value.category)
  }

  // Filter by priority
  if (filters.value.priority) {
    filtered = filtered.filter(n => n.priority === filters.value.priority)
  }

  // Filter by read status
  if (filters.value.readStatus === 'read') {
    filtered = filtered.filter(n => n.isRead)
  } else if (filters.value.readStatus === 'unread') {
    filtered = filtered.filter(n => !n.isRead)
  }

  // Filter by date range
  if (filters.value.dateRange) {
    const { start, end } = filters.value.dateRange
    filtered = filtered.filter(n => {
      const date = new Date(n.createdAt)
      return date >= start && date <= end
    })
  }

  // Apply sorting
  filtered.sort((a, b) => {
    // Pinned notifications always on top
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1

    switch (sortBy.value) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'category':
        return a.category.localeCompare(b.category)
      case 'readStatus':
        if (a.isRead && !b.isRead) return 1
        if (!a.isRead && b.isRead) return -1
        return new Date(b.createdAt) - new Date(a.createdAt)
      default:
        return new Date(b.createdAt) - new Date(a.createdAt)
    }
  })

  return filtered
})

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredNotifications.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / itemsPerPage.value)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// Methods
const loadNotifications = async () => {
  try {
    loading.value = true
    
    // Mock API call - replace with real API
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    notifications.value = generateMockNotifications()
    loadRecentActivity()
  } catch (error) {
    showToast('Lỗi tải thông báo: ' + error.message, 'error')
  } finally {
    loading.value = false
  }
}

const generateMockNotifications = () => {
  const mockData = []
  const titles = [
    'Thông báo nghỉ học do mưa bão',
    'Lịch thi cuối kỳ môn Lập trình Web',
    'Cập nhật chương trình học kỳ mới',
    'Hội thảo công nghệ thông tin',
    'Thông báo nộp học phí',
    'Đăng ký học phần học kỳ 2',
    'Kết quả học tập học kỳ 1',
    'Thông báo thực tập doanh nghiệp',
    'Sự kiện giao lưu sinh viên',
    'Bảo trì hệ thống học tập'
  ]
  
  const authors = [
    'Phòng Đào tạo',
    'Khoa CNTT',
    'TS. Nguyễn Văn A',
    'Thầy Trần Văn B',
    'Cô Mai Thị C',
    'Ban Giám hiệu'
  ]
  
  for (let i = 1; i <= 50; i++) {
    const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
    mockData.push({
      id: i,
      title: titles[Math.floor(Math.random() * titles.length)] + (i > 10 ? ` #${i}` : ''),
      content: generateNotificationContent(i),
      category: availableCategories[Math.floor(Math.random() * (availableCategories.length - 1)) + 1].id,
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
      author: authors[Math.floor(Math.random() * authors.length)],
      createdAt: createdAt.toISOString(),
      isRead: Math.random() > 0.4,
      isPinned: Math.random() > 0.9,
      isArchived: false,
      attachments: Math.random() > 0.7 ? generateAttachments() : [],
      expiryDate: Math.random() > 0.8 ? new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : null
    })
  }
  
  return mockData
}

const generateNotificationContent = (id) => {
  const contents = [
    `Kính gửi các sinh viên, do ảnh hưởng của bão số ${id % 5 + 1}, nhà trường quyết định cho sinh viên nghỉ học trong ngày hôm nay. Các em vui lòng theo dõi thông báo tiếp theo để biết lịch học bù.`,
    `Lịch thi cuối kỳ môn Lập trình Web đã được cập nhật. Thời gian thi: 7h30 ngày ${(id % 30) + 1}/12/2024. Hình thức thi: Thực hành trên máy tính. Sinh viên cần mang theo thẻ sinh viên.`,
    `Chương trình học kỳ mới đã được điều chỉnh với một số môn học bổ sung. Sinh viên vui lòng kiểm tra lại thời khóa biểu và đăng ký các môn còn thiếu trước ngày ${(id % 30) + 1}/11/2024.`,
    `Khoa CNTT tổ chức hội thảo về "Xu hướng công nghệ mới trong năm 2024" vào lúc 14h00 ngày ${(id % 30) + 1}/11/2024 tại hội trường A1. Mời tất cả sinh viên tham dự.`,
    `Thời hạn nộp học phí học kỳ 2 là ngày ${(id % 30) + 1}/12/2024. Sinh viên vui lòng nộp đúng hạn để tránh bị khóa tài khoản học tập.`
  ]
  
  return contents[id % contents.length]
}

const generateAttachments = () => {
  return [
    {
      id: 1,
      name: 'Thong_bao_chi_tiet.pdf',
      size: '2.5 MB',
      type: 'pdf',
      url: '#'
    },
    {
      id: 2,
      name: 'Lich_thi_cuoi_ky.xlsx',
      size: '1.2 MB',
      type: 'excel',
      url: '#'
    }
  ]
}

const loadRecentActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'read',
      icon: 'fas fa-eye',
      text: 'Đã đọc "Thông báo nghỉ học"',
      time: formatRelativeTime(new Date(Date.now() - 30 * 60 * 1000))
    },
    {
      id: 2,
      type: 'received',
      icon: 'fas fa-bell',
      text: 'Nhận thông báo từ Khoa CNTT',
      time: formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000))
    },
    {
      id: 3,
      type: 'pinned',
      icon: 'fas fa-thumbtack',
      text: 'Ghim "Lịch thi cuối kỳ"',
      time: formatRelativeTime(new Date(Date.now() - 4 * 60 * 60 * 1000))
    }
  ]
  
  recentActivities.value = activities
}

// Event handlers
const handleFilterChange = () => {
  currentPage.value = 1
}

const handleSort = () => {
  currentPage.value = 1
}

const setViewMode = (mode) => {
  viewMode.value = mode
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    // Scroll to top
    nextTick(() => {
      document.querySelector('.notification-list-section')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    })
  }
}

const selectCategory = (categoryId) => {
  filters.value.category = filters.value.category === categoryId ? '' : categoryId
  handleFilterChange()
}

const getCategoryCount = (categoryId) => {
  if (!categoryId) return notifications.value.length
  return notifications.value.filter(n => n.category === categoryId).length
}

const handleNotificationClick = (notification) => {
  selectedNotification.value = notification
  showDetailModal.value = true
  
  // Mark as read if not read
  if (!notification.isRead) {
    handleMarkAsRead(notification)
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedNotification.value = null
}

const handleMarkAsRead = async (notification) => {
  try {
    actionLoading.value = true
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index !== -1) {
      notifications.value[index].isRead = true
      showToast('Đã đánh dấu là đã đọc', 'success')
      
      // Add to recent activity
      recentActivities.value.unshift({
        id: Date.now(),
        type: 'read',
        icon: 'fas fa-eye',
        text: `Đã đọc "${notification.title}"`,
        time: 'Vừa xong'
      })
      
      // Keep only latest 10 activities
      if (recentActivities.value.length > 10) {
        recentActivities.value = recentActivities.value.slice(0, 10)
      }
    }
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error')
  } finally {
    actionLoading.value = false
  }
}

const handleMarkAsUnread = async (notification) => {
  try {
    actionLoading.value = true
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index !== -1) {
      notifications.value[index].isRead = false
      showToast('Đã đánh dấu là chưa đọc', 'success')
    }
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error')
  } finally {
    actionLoading.value = false
  }
}

const handleArchive = async (notification) => {
  try {
    actionLoading.value = true
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index !== -1) {
      notifications.value[index].isArchived = true
      showToast('Đã lưu trữ thông báo', 'success')
      
      // Remove from current list if filtered
      notifications.value = notifications.value.filter(n => n.id !== notification.id)
    }
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error')
  } finally {
    actionLoading.value = false
  }
}

const handlePin = async (notification) => {
  try {
    actionLoading.value = true
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index !== -1) {
      const isPinned = !notifications.value[index].isPinned
      notifications.value[index].isPinned = isPinned
      
      showToast(
        isPinned ? 'Đã ghim thông báo' : 'Đã bỏ ghim thông báo', 
        'success'
      )
      
      // Add to recent activity
      if (isPinned) {
        recentActivities.value.unshift({
          id: Date.now(),
          type: 'pinned',
          icon: 'fas fa-thumbtack',
          text: `Ghim "${notification.title}"`,
          time: 'Vừa xong'
        })
        
        // Keep only latest 10 activities
        if (recentActivities.value.length > 10) {
          recentActivities.value = recentActivities.value.slice(0, 10)
        }
      }
    }
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error')
  } finally {
    actionLoading.value = false
  }
}

const markAllAsRead = async () => {
  if (unreadCount.value === 0) return
  
  try {
    actionLoading.value = true
    
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    notifications.value.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true
      }
    })
    
    showToast(`Đã đánh dấu ${unreadCount.value} thông báo là đã đọc`, 'success')
  } catch (error) {
    showToast('Lỗi: ' + error.message, 'error')
  } finally {
    actionLoading.value = false
  }
}

// Toast methods
const showToast = (message, type = 'info') => {
  const toast = {
    id: Date.now(),
    message,
    type
  }
  
  toasts.value.push(toast)
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    removeToast(toast.id)
  }, 3000)
}

const removeToast = (toastId) => {
  const index = toasts.value.findIndex(t => t.id === toastId)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

const getToastIcon = (type) => {
  switch (type) {
    case 'success': return 'fas fa-check-circle'
    case 'error': return 'fas fa-exclamation-circle'
    case 'warning': return 'fas fa-exclamation-triangle'
    default: return 'fas fa-info-circle'
  }
}

// Utility functions
const isToday = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

const isThisWeek = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))
  return date >= startOfWeek && date <= endOfWeek
}

const formatRelativeTime = (date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now - date) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Vừa xong'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} phút trước`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} giờ trước`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} ngày trước`
  }
}

// Lifecycle
onMounted(() => {
  loadNotifications()
})

// Watch for filter changes
watch(filters, () => {
  handleFilterChange()
}, { deep: true })
</script>

<style scoped>
.student-notification-page {
  padding: 0;
  min-height: 100vh;
  background: #f8fafc;
}

.page-header {
  margin-bottom: 32px;
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.header-info h1 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.header-info p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
  transform: translateY(-2px);
}

.notification-content {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 32px;
  align-items: start;
}

.notification-list-section {
  min-width: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.list-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-toggle {
  display: flex;
  background: #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
}

.view-btn {
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sort-options select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 32px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.page-btn {
  width: 40px;
  height: 40px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-number {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.page-number.active {
  background: #667eea;
  color: white;
}

.page-number:hover:not(.active) {
  background: #f3f4f6;
}

.page-ellipsis {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.notification-sidebar {
  flex-shrink: 0;
}

.sidebar-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.sidebar-section h3 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.quick-stats {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 12px;
}

.quick-stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.quick-stat-icon.unread {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.quick-stat-icon.today {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
  color: white;
}

.quick-stat-content {
  display: flex;
  flex-direction: column;
}

.quick-stat-number {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.quick-stat-label {
  font-size: 12px;
  color: #6b7280;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  text-align: left;
}

.category-item:hover {
  background: #f3f4f6;
}

.category-item.active {
  background: #eff6ff;
  color: #2563eb;
}

.category-count {
  margin-left: auto;
  background: #e5e7eb;
  color: #6b7280;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 500;
}

.category-item.active .category-count {
  background: #dbeafe;
  color: #1d4ed8;
}

.recent-activity {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.activity-icon.read {
  background: #dbeafe;
  color: #2563eb;
}

.activity-icon.received {
  background: #dcfce7;
  color: #16a34a;
}

.activity-icon.pinned {
  background: #fef3c7;
  color: #d97706;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  display: block;
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

.activity-time {
  display: block;
  font-size: 12px;
  color: #9ca3af;
}

.no-activity {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: #9ca3af;
  font-size: 14px;
}

.no-activity i {
  font-size: 24px;
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  min-width: 300px;
  animation: slideIn 0.3s ease;
}

.toast.success {
  border-color: #10b981;
  color: #065f46;
}

.toast.error {
  border-color: #ef4444;
  color: #7f1d1d;
}

.toast.warning {
  border-color: #f59e0b;
  color: #92400e;
}

.toast.info {
  border-color: #3b82f6;
  color: #1e3a8a;
}

.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.toast-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 1024px) {
  .notification-content {
    grid-template-columns: 1fr;
  }
  
  .notification-sidebar {
    width: auto;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .list-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .pagination {
    padding: 16px;
  }
  
  .page-numbers {
    flex-wrap: wrap;
  }
  
  .toast-container {
    left: 20px;
    right: 20px;
  }
  
  .toast {
    min-width: auto;
  }
}
</style>