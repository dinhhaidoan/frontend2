<template>
  <div class="notification-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-info">
          <h1>{{ pageTitle }}</h1>
          <p>{{ pageSubtitle }}</p>
        </div>
        <div class="header-actions" v-if="canCreateNotification">
          <button class="btn btn-primary" @click="openCreateModal">
            <i class="fas fa-plus"></i>
            Tạo thông báo
          </button>
        </div>
      </div>
    </div>

    <!-- Notification Stats -->
    <NotificationStats 
      :stats="notificationStats" 
      :visible-stats="visibleStats" 
      :user-role="currentRole" 
    />

    <!-- Filters and Search -->
    <NotificationFilters
      v-model:search="filters.search"
      v-model:category="filters.category"
      v-model:status="filters.status"
      v-model:priority="filters.priority"
      v-model:date-range="filters.dateRange"
      :categories="availableCategories"
      :show-advanced="canUseAdvancedFilters"
      :user-role="currentRole"
      @filter-change="handleFilterChange"
    />

    <!-- Bulk Actions (Admin/Staff only) -->
    <NotificationBulkActions
      v-if="canUseBulkActions"
      :selected-notifications="selectedNotifications"
      :user-role="currentRole"
      @bulk-action="handleBulkAction"
      @clear-selection="clearSelection"
    />

    <!-- Notification Categories (Admin/Staff) -->
    <NotificationCategories
      v-if="canManageCategories"
      :categories="categories"
      :user-role="currentRole"
      @category-change="handleCategoryChange"
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
              >
                <i class="fas fa-list"></i>
              </button>
              <button 
                class="view-btn" 
                :class="{ active: viewMode === 'grid' }"
                @click="setViewMode('grid')"
              >
                <i class="fas fa-th-large"></i>
              </button>
            </div>
            <div class="sort-options">
              <select v-model="sortBy" @change="handleSort">
                <option value="createdAt">Mới nhất</option>
                <option value="priority">Độ ưu tiên</option>
                <option value="category">Danh mục</option>
                <option value="status" v-if="canSeeStatus">Trạng thái</option>
              </select>
            </div>
          </div>
        </div>

        <NotificationList
          :notifications="paginatedNotifications"
          :view-mode="viewMode"
          :user-role="currentRole"
          :can-select="canSelectNotifications"
          :can-edit="canEditNotifications"
          :can-delete="canDeleteNotifications"
          :show-recipients="canSeeRecipients"
          :show-analytics="canSeeAnalytics"
          v-model:selected="selectedNotifications"
          @notification-click="handleNotificationClick"
          @edit-notification="openEditModal"
          @delete-notification="handleDelete"
          @toggle-status="handleToggleStatus"
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
          <span class="page-info">
            Trang {{ currentPage }} / {{ totalPages }}
          </span>
          <button 
            class="page-btn" 
            :disabled="currentPage >= totalPages"
            @click="changePage(currentPage + 1)"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <!-- Sidebar (Admin/Staff) -->
      <div class="notification-sidebar" v-if="showSidebar">
        <!-- Quick Actions -->
        <div class="sidebar-section">
          <h3>Thao tác nhanh</h3>
          <div class="quick-actions">
            <button 
              class="quick-action-btn" 
              v-if="canCreateNotification"
              @click="openCreateModal"
            >
              <i class="fas fa-plus"></i>
              Tạo thông báo
            </button>
            <button 
              class="quick-action-btn" 
              v-if="canManageTemplates"
              @click="openTemplatesModal"
            >
              <i class="fas fa-file-alt"></i>
              Mẫu thông báo
            </button>
            <button 
              class="quick-action-btn" 
              v-if="canSchedule"
              @click="openScheduleModal"
            >
              <i class="fas fa-clock"></i>
              Lên lịch
            </button>
            <button 
              class="quick-action-btn" 
              v-if="canSeeAnalytics"
              @click="openAnalyticsModal"
            >
              <i class="fas fa-chart-bar"></i>
              Thống kê
            </button>
          </div>
        </div>

        <!-- Recent Activity (Admin/Staff) -->
        <div class="sidebar-section" v-if="canSeeActivity">
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
          </div>
        </div>

        <!-- System Notifications (Admin only) -->
        <div class="sidebar-section" v-if="isAdmin">
          <h3>Thông báo hệ thống</h3>
          <div class="system-notifications">
            <div 
              v-for="sysNotif in systemNotifications" 
              :key="sysNotif.id"
              class="system-notif-item"
              :class="sysNotif.priority"
            >
              <div class="system-notif-icon">
                <i :class="sysNotif.icon"></i>
              </div>
              <div class="system-notif-content">
                <span class="system-notif-text">{{ sysNotif.text }}</span>
                <span class="system-notif-time">{{ sysNotif.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <NotificationModal
      v-if="showModal"
      :notification="editingNotification"
      :mode="modalMode"
      :user-role="currentRole"
      :categories="categories"
      :templates="templates"
      @save="handleSave"
      @close="closeModal"
    />

    <NotificationTemplatesModal
      v-if="showTemplatesModal"
      :templates="templates"
      :user-role="currentRole"
      @save-template="handleSaveTemplate"
      @close="closeTemplatesModal"
    />

    <NotificationScheduleModal
      v-if="showScheduleModal"
      :scheduled-notifications="scheduledNotifications"
      :user-role="currentRole"
      @schedule="handleSchedule"
      @close="closeScheduleModal"
    />

    <NotificationAnalyticsModal
      v-if="showAnalyticsModal"
      :analytics-data="analyticsData"
      :user-role="currentRole"
      @close="closeAnalyticsModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserRole } from '@/composables/useUserRole'
import NotificationStats from '@/components/Notifications/NotificationStats.vue'
import NotificationFilters from '@/components/Notifications/NotificationFilters.vue'
import NotificationBulkActions from '@/components/Notifications/NotificationBulkActions.vue'
import NotificationCategories from '@/components/Notifications/NotificationCategories.vue'
import NotificationList from '@/components/Notifications/NotificationList.vue'
import NotificationModal from '@/components/Notifications/NotificationModal.vue'
import NotificationTemplatesModal from '@/components/Notifications/NotificationTemplatesModal.vue'
import NotificationScheduleModal from '@/components/Notifications/NotificationScheduleModal.vue'
import NotificationAnalyticsModal from '@/components/Notifications/NotificationAnalyticsModal.vue'

// User role management
const { getCurrentRole, isAdmin, isStaff, isTeacher, isStudent } = useUserRole()
const currentRole = computed(() => getCurrentRole())

// Page data
const notifications = ref([])
const selectedNotifications = ref([])
const filters = ref({
  search: '',
  category: '',
  status: '',
  priority: '',
  dateRange: null
})
const viewMode = ref('list')
const sortBy = ref('createdAt')
const currentPage = ref(1)
const itemsPerPage = ref(5)

// Modal states
const showModal = ref(false)
const showTemplatesModal = ref(false)
const showScheduleModal = ref(false)
const showAnalyticsModal = ref(false)
const editingNotification = ref(null)
const modalMode = ref('create') // 'create' | 'edit' | 'view'

// Data
const categories = ref([])
const templates = ref([])
const scheduledNotifications = ref([])
const recentActivities = ref([])
const systemNotifications = ref([])
const notificationStats = ref({})
const analyticsData = ref({})

// Computed properties for role-based permissions
const canCreateNotification = computed(() => {
  return isAdmin.value || isStaff.value || isTeacher.value
})

const canEditNotifications = computed(() => {
  return isAdmin.value || isStaff.value || (isTeacher.value && 'ownOnly')
})

const canDeleteNotifications = computed(() => {
  return isAdmin.value || isStaff.value
})

const canSelectNotifications = computed(() => {
  return isAdmin.value || isStaff.value
})

const canUseBulkActions = computed(() => {
  return isAdmin.value || isStaff.value
})

const canManageCategories = computed(() => {
  return isAdmin.value || isStaff.value
})

const canUseAdvancedFilters = computed(() => {
  return isAdmin.value || isStaff.value || isTeacher.value
})

const canSeeStatus = computed(() => {
  return isAdmin.value || isStaff.value || isTeacher.value
})

const canSeeRecipients = computed(() => {
  return isAdmin.value || isStaff.value
})

const canSeeAnalytics = computed(() => {
  return isAdmin.value || isStaff.value
})

const canManageTemplates = computed(() => {
  return isAdmin.value || isStaff.value || isTeacher.value
})

const canSchedule = computed(() => {
  return isAdmin.value || isStaff.value || isTeacher.value
})

const canSeeActivity = computed(() => {
  return isAdmin.value || isStaff.value
})

const showSidebar = computed(() => {
  return isAdmin.value || isStaff.value
})

// Page title and subtitle based on role
const pageTitle = computed(() => {
  switch (currentRole.value) {
    case 'admin':
      return 'Quản lý Thông báo Hệ thống'
    case 'staff':
      return 'Quản lý Thông báo Khoa'
    case 'teacher':
      return 'Thông báo Lớp học'
    case 'student':
      return 'Thông báo của tôi'
    default:
      return 'Thông báo'
  }
})

const pageSubtitle = computed(() => {
  switch (currentRole.value) {
    case 'admin':
      return 'Tạo và quản lý thông báo cho toàn hệ thống'
    case 'staff':
      return 'Quản lý thông báo khoa và các hoạt động giáo vụ'
    case 'teacher':
      return 'Gửi thông báo đến sinh viên và quản lý lớp học'
    case 'student':
      return 'Xem thông báo từ nhà trường, khoa và giảng viên'
    default:
      return 'Quản lý thông báo'
  }
})

const listTitle = computed(() => {
  switch (currentRole.value) {
    case 'admin':
      return 'Tất cả thông báo'
    case 'staff':
      return 'Thông báo khoa'
    case 'teacher':
      return 'Thông báo lớp học'
    case 'student':
      return 'Thông báo nhận được'
    default:
      return 'Danh sách thông báo'
  }
})

// Available categories based on role
const availableCategories = computed(() => {
  const baseCategories = [
    { id: 'general', name: 'Chung', icon: 'fas fa-info-circle' },
    { id: 'academic', name: 'Học tập', icon: 'fas fa-graduation-cap' },
    { id: 'event', name: 'Sự kiện', icon: 'fas fa-calendar' }
  ]

  if (isAdmin.value) {
    return [
      ...baseCategories,
      { id: 'system', name: 'Hệ thống', icon: 'fas fa-cog' },
      { id: 'security', name: 'Bảo mật', icon: 'fas fa-shield-alt' },
      { id: 'maintenance', name: 'Bảo trì', icon: 'fas fa-tools' }
    ]
  }

  if (isStaff.value) {
    return [
      ...baseCategories,
      { id: 'department', name: 'Khoa', icon: 'fas fa-building' },
      { id: 'curriculum', name: 'Chương trình', icon: 'fas fa-book' }
    ]
  }

  if (isTeacher.value) {
    return [
      ...baseCategories,
      { id: 'assignment', name: 'Bài tập', icon: 'fas fa-tasks' },
      { id: 'exam', name: 'Thi cử', icon: 'fas fa-file-alt' }
    ]
  }

  return baseCategories
})

// Visible stats based on role
const visibleStats = computed(() => {
  const baseStats = ['total', 'unread']
  
  if (isAdmin.value) {
    return [...baseStats, 'sent', 'scheduled', 'draft', 'system']
  }
  
  if (isStaff.value) {
    return [...baseStats, 'sent', 'scheduled', 'draft']
  }
  
  if (isTeacher.value) {
    return [...baseStats, 'sent', 'draft']
  }
  
  return baseStats
})

// Filtered notifications
const filteredNotifications = computed(() => {
  let filtered = [...notifications.value]

  // Apply filters
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(n => 
      n.title.toLowerCase().includes(search) ||
      n.content.toLowerCase().includes(search)
    )
  }

  if (filters.value.category) {
    filtered = filtered.filter(n => n.category === filters.value.category)
  }

  if (filters.value.status) {
    filtered = filtered.filter(n => n.status === filters.value.status)
  }

  if (filters.value.priority) {
    filtered = filtered.filter(n => n.priority === filters.value.priority)
  }

  // Apply sorting
  filtered.sort((a, b) => {
    switch (sortBy.value) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'category':
        return a.category.localeCompare(b.category)
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return new Date(b.createdAt) - new Date(a.createdAt)
    }
  })

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / itemsPerPage.value)
})

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredNotifications.value.slice(start, end)
})

// Methods
const loadNotifications = async () => {
  try {
    // Mock data - replace with API call
    notifications.value = generateMockNotifications()
    loadStats()
    loadCategories()
    loadTemplates()
    loadRecentActivity()
    if (isAdmin.value) {
      loadSystemNotifications()
    }
  } catch (error) {
    console.error('Error loading notifications:', error)
  }
}

const generateMockNotifications = () => {
  const mockData = []
  const titles = [
    'Thông báo nghỉ học',
    'Lịch thi cuối kỳ',
    'Cập nhật chương trình học',
    'Sự kiện hội thảo',
    'Bảo trì hệ thống',
    'Thông báo học phí',
    'Đăng ký học phần',
    'Kết quả học tập'
  ]
  
  for (let i = 1; i <= 50; i++) {
    mockData.push({
      id: i,
      title: titles[Math.floor(Math.random() * titles.length)] + ` #${i}`,
      content: `Nội dung thông báo chi tiết số ${i}...`,
      category: availableCategories.value[Math.floor(Math.random() * availableCategories.value.length)].id,
      priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
      status: ['published', 'draft', 'scheduled'][Math.floor(Math.random() * 3)],
      author: 'Admin',
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      readCount: Math.floor(Math.random() * 100),
      totalRecipients: Math.floor(Math.random() * 500) + 50,
      isRead: Math.random() > 0.3
    })
  }
  
  return mockData
}

const loadStats = () => {
  notificationStats.value = {
    total: notifications.value.length,
    unread: notifications.value.filter(n => !n.isRead).length,
    sent: notifications.value.filter(n => n.status === 'published').length,
    scheduled: notifications.value.filter(n => n.status === 'scheduled').length,
    draft: notifications.value.filter(n => n.status === 'draft').length,
    system: isAdmin.value ? notifications.value.filter(n => n.category === 'system').length : 0
  }
}

const loadCategories = () => {
  categories.value = availableCategories.value
}

const loadTemplates = () => {
  if (canManageTemplates.value) {
    templates.value = [
      { id: 1, name: 'Thông báo chung', content: 'Mẫu thông báo chung...' },
      { id: 2, name: 'Nghỉ học', content: 'Mẫu thông báo nghỉ học...' },
      { id: 3, name: 'Thi cử', content: 'Mẫu thông báo thi cử...' }
    ]
  }
}

const loadRecentActivity = () => {
  if (canSeeActivity.value) {
    recentActivities.value = [
      {
        id: 1,
        type: 'created',
        icon: 'fas fa-plus',
        text: 'Tạo thông báo "Lịch thi cuối kỳ"',
        time: '5 phút trước'
      },
      {
        id: 2,
        type: 'published',
        icon: 'fas fa-paper-plane',
        text: 'Gửi thông báo "Nghỉ học"',
        time: '1 giờ trước'
      }
    ]
  }
}

const loadSystemNotifications = () => {
  systemNotifications.value = [
    {
      id: 1,
      icon: 'fas fa-server',
      text: 'Server hoạt động bình thường',
      time: '2 phút trước',
      priority: 'normal'
    },
    {
      id: 2,
      icon: 'fas fa-exclamation-triangle',
      text: 'Dung lượng disk đạt 85%',
      time: '1 giờ trước',
      priority: 'warning'
    }
  ]
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
  currentPage.value = page
}

const handleNotificationClick = (notification) => {
  if (canEditNotifications.value || currentRole.value === 'student') {
    openEditModal(notification, 'view')
  }
}

const openCreateModal = () => {
  editingNotification.value = null
  modalMode.value = 'create'
  showModal.value = true
}

const openEditModal = (notification, mode = 'edit') => {
  editingNotification.value = notification
  modalMode.value = mode
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingNotification.value = null
}

const handleSave = (notificationData) => {
  if (modalMode.value === 'create') {
    // Add new notification
    const newNotification = {
      ...notificationData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      author: currentRole.value,
      readCount: 0,
      isRead: false
    }
    notifications.value.unshift(newNotification)
  } else {
    // Update existing notification
    const index = notifications.value.findIndex(n => n.id === editingNotification.value.id)
    if (index !== -1) {
      notifications.value[index] = { ...notifications.value[index], ...notificationData }
    }
  }
  loadStats()
  closeModal()
}

const handleDelete = (notification) => {
  if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
    const index = notifications.value.findIndex(n => n.id === notification.id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
      loadStats()
    }
  }
}

const handleToggleStatus = (notification) => {
  const index = notifications.value.findIndex(n => n.id === notification.id)
  if (index !== -1) {
    notifications.value[index].status = 
      notifications.value[index].status === 'published' ? 'draft' : 'published'
    loadStats()
  }
}

const handleBulkAction = (action) => {
  switch (action) {
    case 'delete':
      if (confirm(`Bạn có chắc chắn muốn xóa ${selectedNotifications.value.length} thông báo?`)) {
        notifications.value = notifications.value.filter(
          n => !selectedNotifications.value.includes(n.id)
        )
        selectedNotifications.value = []
        loadStats()
      }
      break
    case 'publish':
      selectedNotifications.value.forEach(id => {
        const index = notifications.value.findIndex(n => n.id === id)
        if (index !== -1) {
          notifications.value[index].status = 'published'
        }
      })
      selectedNotifications.value = []
      loadStats()
      break
  }
}

const clearSelection = () => {
  selectedNotifications.value = []
}

const handleCategoryChange = (category) => {
  filters.value.category = category.id
}

const openTemplatesModal = () => {
  showTemplatesModal.value = true
}

const closeTemplatesModal = () => {
  showTemplatesModal.value = false
}

const handleSaveTemplate = (template) => {
  // Save template logic
  console.log('Save template:', template)
  closeTemplatesModal()
}

const openScheduleModal = () => {
  showScheduleModal.value = true
}

const closeScheduleModal = () => {
  showScheduleModal.value = false
}

const handleSchedule = (scheduleData) => {
  // Schedule notification logic
  console.log('Schedule notification:', scheduleData)
  closeScheduleModal()
}

const openAnalyticsModal = () => {
  showAnalyticsModal.value = true
}

const closeAnalyticsModal = () => {
  showAnalyticsModal.value = false
}

// Lifecycle
onMounted(() => {
  loadNotifications()
})

// Watch for role changes
watch(currentRole, () => {
  loadNotifications()
})
</script>

<style scoped>
.notification-page {
  padding: 0;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 32px;
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

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.notification-content {
  display: grid;
  grid-template-columns: 1fr auto;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
}

.page-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #667eea;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #6b7280;
  font-size: 14px;
}

.notification-sidebar {
  width: 300px;
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

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quick-action-btn {
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: #f9fafb;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
}

.quick-action-btn:hover {
  background: #f3f4f6;
  color: #667eea;
}

.recent-activity,
.system-notifications {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item,
.system-notif-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;
}

.activity-item:last-child,
.system-notif-item:last-child {
  border-bottom: none;
}

.activity-icon,
.system-notif-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.activity-icon.created {
  background: #dcfce7;
  color: #16a34a;
}

.activity-icon.published {
  background: #dbeafe;
  color: #2563eb;
}

.system-notif-icon {
  background: #f3f4f6;
  color: #6b7280;
}

.system-notif-item.warning .system-notif-icon {
  background: #fef3c7;
  color: #d97706;
}

.activity-content,
.system-notif-content {
  flex: 1;
  min-width: 0;
}

.activity-text,
.system-notif-text {
  display: block;
  font-size: 14px;
  color: #374151;
  margin-bottom: 4px;
}

.activity-time,
.system-notif-time {
  display: block;
  font-size: 12px;
  color: #9ca3af;
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
}
</style>