<template>
  <div class="notification-list" :class="[`view-${viewMode}`, { 'can-select': canSelect }]">
    <!-- List View -->
    <div v-if="viewMode === 'list'" class="list-view">
      <!-- Select All (Admin/Staff) -->
      <div class="list-header" v-if="canSelect">
        <label class="select-all">
          <input
            type="checkbox"
            :checked="isAllSelected"
            @change="toggleSelectAll"
          />
          <span>Chọn tất cả ({{ notifications.length }})</span>
        </label>
      </div>

      <!-- Notification Items -->
      <div class="notification-items">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{
            'unread': !notification.isRead && userRole === 'student',
            'high-priority': notification.priority === 'high',
            'selected': selected.includes(notification.id),
            'draft': notification.status === 'draft',
            'scheduled': notification.status === 'scheduled'
          }"
          @click="handleNotificationClick(notification)"
        >
          <!-- Selection Checkbox -->
          <div class="notification-select" v-if="canSelect" @click.stop>
            <input
              type="checkbox"
              :checked="selected.includes(notification.id)"
              @change="toggleSelect(notification.id)"
            />
          </div>

          <!-- Priority Indicator -->
          <div class="priority-indicator" :class="notification.priority">
            <div class="priority-dot"></div>
          </div>

          <!-- Notification Content -->
          <div class="notification-content" @click="$emit('notification-click', notification)">
            <!-- Header -->
            <div class="notification-header">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <div class="notification-meta">
                <span class="notification-category">
                  <i :class="getCategoryIcon(notification.category)"></i>
                  {{ getCategoryName(notification.category) }}
                </span>
                <span class="notification-date">{{ formatDate(notification.createdAt) }}</span>
                <span 
                  class="notification-status"
                  :class="notification.status"
                  v-if="canSeeStatus"
                >
                  {{ getStatusLabel(notification.status) }}
                </span>
              </div>
            </div>

            <!-- Content Preview -->
            <div class="notification-preview">
              <p>{{ notification.content }}</p>
            </div>

            <!-- Footer -->
            <div class="notification-footer">
              <div class="notification-info">
                <span class="notification-author" v-if="showAuthor">
                  <i class="fas fa-user"></i>
                  {{ notification.author }}
                </span>
                <span class="notification-recipients" v-if="showRecipients">
                  <i class="fas fa-users"></i>
                  {{ notification.totalRecipients }} người nhận
                </span>
                <span class="notification-read-count" v-if="showAnalytics">
                  <i class="fas fa-eye"></i>
                  {{ notification.readCount }} đã đọc
                </span>
              </div>

              <div class="notification-actions" @click.stop>
                <button
                  v-if="canEdit"
                  class="action-btn edit"
                  @click="$emit('edit-notification', notification)"
                  title="Chỉnh sửa"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  v-if="canToggleStatus"
                  class="action-btn toggle"
                  @click="$emit('toggle-status', notification)"
                  :title="notification.status === 'published' ? 'Chuyển về nháp' : 'Xuất bản'"
                >
                  <i :class="notification.status === 'published' ? 'fas fa-pause' : 'fas fa-play'"></i>
                </button>
                <button
                  v-if="canDelete"
                  class="action-btn delete"
                  @click="$emit('delete-notification', notification)"
                  title="Xóa"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="grid-view">
      <div class="notification-grid">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-card"
          :class="{
            'unread': !notification.isRead && userRole === 'student',
            'high-priority': notification.priority === 'high',
            'selected': selected.includes(notification.id),
            'draft': notification.status === 'draft',
            'scheduled': notification.status === 'scheduled'
          }"
          @click="handleNotificationClick(notification)"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="card-header-left">
              <!-- Selection Checkbox -->
              <div class="card-select" v-if="canSelect" @click.stop>
                <input
                  type="checkbox"
                  :checked="selected.includes(notification.id)"
                  @change="toggleSelect(notification.id)"
                />
              </div>
              
              <!-- Priority & Category -->
              <div class="card-indicators">
                <div class="priority-indicator" :class="notification.priority">
                  <div class="priority-dot"></div>
                </div>
                <span class="card-category">
                  <i :class="getCategoryIcon(notification.category)"></i>
                  {{ getCategoryName(notification.category) }}
                </span>
              </div>
            </div>

            <div class="card-header-right">
              <span 
                class="card-status"
                :class="notification.status"
                v-if="canSeeStatus"
              >
                {{ getStatusLabel(notification.status) }}
              </span>
            </div>
          </div>

          <!-- Card Content -->
          <div class="card-content" @click="$emit('notification-click', notification)">
            <h3 class="card-title">{{ notification.title }}</h3>
            <p class="card-preview">{{ notification.content }}</p>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <div class="card-info">
              <span class="card-date">{{ formatDate(notification.createdAt) }}</span>
              <span class="card-author" v-if="showAuthor">{{ notification.author }}</span>
            </div>

            <div class="card-stats" v-if="showAnalytics || showRecipients">
              <span class="card-recipients" v-if="showRecipients">
                <i class="fas fa-users"></i>
                {{ notification.totalRecipients }}
              </span>
              <span class="card-read-count" v-if="showAnalytics">
                <i class="fas fa-eye"></i>
                {{ notification.readCount }}
              </span>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions" v-if="canEdit || canDelete || canToggleStatus" @click.stop>
            <button
              v-if="canEdit"
              class="action-btn edit"
              @click="$emit('edit-notification', notification)"
              title="Chỉnh sửa"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button
              v-if="canToggleStatus"
              class="action-btn toggle"
              @click="$emit('toggle-status', notification)"
              :title="notification.status === 'published' ? 'Chuyển về nháp' : 'Xuất bản'"
            >
              <i :class="notification.status === 'published' ? 'fas fa-pause' : 'fas fa-play'"></i>
            </button>
            <button
              v-if="canDelete"
              class="action-btn delete"
              @click="$emit('delete-notification', notification)"
              title="Xóa"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="notifications.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-bell-slash"></i>
      </div>
      <h3>Không có thông báo</h3>
      <p>{{ getEmptyMessage() }}</p>
      <button
        v-if="canCreate"
        class="create-notification-btn"
        @click="$emit('create-notification')"
      >
        <i class="fas fa-plus"></i>
        Tạo thông báo đầu tiên
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  notifications: {
    type: Array,
    default: () => []
  },
  viewMode: {
    type: String,
    default: 'list' // 'list' | 'grid'
  },
  userRole: {
    type: String,
    required: true
  },
  canSelect: {
    type: Boolean,
    default: false
  },
  canEdit: {
    type: Boolean,
    default: false
  },
  canDelete: {
    type: Boolean,
    default: false
  },
  showRecipients: {
    type: Boolean,
    default: false
  },
  showAnalytics: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'notification-click',
  'edit-notification',
  'delete-notification',
  'toggle-status',
  'create-notification',
  'update:selected'
])

// Computed properties
const canSeeStatus = computed(() => {
  return ['admin', 'staff', 'teacher'].includes(props.userRole)
})

const canToggleStatus = computed(() => {
  return ['admin', 'staff'].includes(props.userRole)
})

const canCreate = computed(() => {
  return ['admin', 'staff', 'teacher'].includes(props.userRole)
})

const showAuthor = computed(() => {
  return ['admin', 'staff'].includes(props.userRole)
})

const isAllSelected = computed(() => {
  return props.notifications.length > 0 && 
         props.notifications.every(n => props.selected.includes(n.id))
})

// Category mapping
const categoryMap = {
  general: { name: 'Chung', icon: 'fas fa-info-circle' },
  academic: { name: 'Học tập', icon: 'fas fa-graduation-cap' },
  event: { name: 'Sự kiện', icon: 'fas fa-calendar' },
  system: { name: 'Hệ thống', icon: 'fas fa-cog' },
  security: { name: 'Bảo mật', icon: 'fas fa-shield-alt' },
  maintenance: { name: 'Bảo trì', icon: 'fas fa-tools' },
  department: { name: 'Khoa', icon: 'fas fa-building' },
  curriculum: { name: 'Chương trình', icon: 'fas fa-book' },
  assignment: { name: 'Bài tập', icon: 'fas fa-tasks' },
  exam: { name: 'Thi cử', icon: 'fas fa-file-alt' }
}

const statusLabels = {
  published: 'Đã xuất bản',
  draft: 'Bản nháp',
  scheduled: 'Đã lên lịch',
  archived: 'Lưu trữ'
}

// Methods
const getCategoryName = (category) => {
  return categoryMap[category]?.name || category
}

const getCategoryIcon = (category) => {
  return categoryMap[category]?.icon || 'fas fa-info-circle'
}

const getStatusLabel = (status) => {
  return statusLabels[status] || status
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now - date) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))
    return `${diffInMinutes} phút trước`
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} giờ trước`
  } else if (diffInHours < 48) {
    return 'Hôm qua'
  } else {
    return date.toLocaleDateString('vi-VN')
  }
}

const handleNotificationClick = (notification) => {
  if (!props.canSelect) {
    emit('notification-click', notification)
  }
}

const toggleSelect = (notificationId) => {
  const newSelected = [...props.selected]
  const index = newSelected.indexOf(notificationId)
  
  if (index > -1) {
    newSelected.splice(index, 1)
  } else {
    newSelected.push(notificationId)
  }
  
  emit('update:selected', newSelected)
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    emit('update:selected', [])
  } else {
    emit('update:selected', props.notifications.map(n => n.id))
  }
}

const getEmptyMessage = () => {
  switch (props.userRole) {
    case 'admin':
      return 'Chưa có thông báo nào trong hệ thống. Tạo thông báo đầu tiên để bắt đầu.'
    case 'staff':
      return 'Chưa có thông báo nào cho khoa. Tạo thông báo để gửi đến sinh viên và giảng viên.'
    case 'teacher':
      return 'Chưa có thông báo nào cho lớp học. Tạo thông báo để thông tin đến sinh viên.'
    case 'student':
      return 'Bạn chưa có thông báo nào. Thông báo mới sẽ hiển thị ở đây.'
    default:
      return 'Không có thông báo.'
  }
}
</script>

<style scoped>
.notification-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

/* List View Styles */
.list-view {
  padding: 0;
}

.list-header {
  padding: 16px 24px;
  border-bottom: 1px solid #f3f4f6;
  background: #f9fafb;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
}

.notification-items {
  padding: 0;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: #f9fafb;
}

.notification-item.selected {
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.notification-item.unread {
  background: linear-gradient(90deg, #eff6ff 0%, #ffffff 100%);
  border-left: 4px solid #667eea;
}

.notification-item.high-priority {
  border-left: 4px solid #ef4444;
}

.notification-item.draft {
  opacity: 0.7;
}

.notification-item.scheduled {
  background: linear-gradient(90deg, #f0fdf4 0%, #ffffff 100%);
  border-left: 4px solid #10b981;
}

.notification-select {
  margin-top: 4px;
}

.priority-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  margin-top: 6px;
}

.priority-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.priority-indicator.high .priority-dot {
  background: #ef4444;
}

.priority-indicator.medium .priority-dot {
  background: #f59e0b;
}

.priority-indicator.low .priority-dot {
  background: #10b981;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
}

.notification-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.notification-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
  align-items: center;
}

.notification-category {
  display: flex;
  align-items: center;
  gap: 4px;
}

.notification-status {
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 10px;
}

.notification-status.published {
  background: #d1fae5;
  color: #065f46;
}

.notification-status.draft {
  background: #f3f4f6;
  color: #6b7280;
}

.notification-status.scheduled {
  background: #dbeafe;
  color: #1e40af;
}

.notification-preview {
  margin-bottom: 12px;
}

.notification-preview p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.notification-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: #9ca3af;
}

.notification-info span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.notification-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
}

.notification-item:hover .action-btn {
  opacity: 1;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.edit:hover {
  background: #dbeafe;
  color: #2563eb;
}

.action-btn.toggle:hover {
  background: #d1fae5;
  color: #059669;
}

.action-btn.delete:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Grid View Styles */
.grid-view {
  padding: 24px;
}

.notification-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.notification-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.notification-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.notification-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.notification-card.unread {
  border-left: 4px solid #667eea;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.notification-card.high-priority {
  border-left: 4px solid #ef4444;
}

.notification-card.draft {
  opacity: 0.7;
}

.notification-card.scheduled {
  border-left: 4px solid #10b981;
  background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-indicators {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-category {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.card-status {
  padding: 2px 8px;
  border-radius: 6px;
  font-weight: 500;
  text-transform: uppercase;
  font-size: 10px;
}

.card-content {
  margin-bottom: 16px;
}

.card-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.card-preview {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #9ca3af;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-stats {
  display: flex;
  gap: 12px;
}

.card-stats span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.notification-card:hover .card-actions {
  opacity: 1;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 80px 40px;
  color: #6b7280;
}

.empty-icon {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #374151;
}

.empty-state p {
  margin: 0 0 24px;
  font-size: 16px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.create-notification-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.create-notification-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .notification-item {
    flex-direction: column;
    gap: 12px;
    padding: 16px;
  }
  
  .notification-header {
    flex-direction: column;
    gap: 8px;
  }
  
  .notification-meta {
    justify-content: flex-start;
  }
  
  .notification-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .notification-grid {
    grid-template-columns: 1fr;
  }
  
  .grid-view {
    padding: 16px;
  }
}
</style>