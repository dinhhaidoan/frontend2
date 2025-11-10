<template>
  <div class="student-notification-list" :class="[`view-${viewMode}`]">
    <!-- List View -->
    <div v-if="viewMode === 'list'" class="list-view">
      <div class="notification-items">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{
            'unread': !notification.isRead,
            'high-priority': notification.priority === 'high',
            'pinned': notification.isPinned,
            'expired': isExpired(notification)
          }"
          @click="handleNotificationClick(notification)"
        >
          <!-- Priority & Pin Indicators -->
          <div class="notification-indicators">
            <div class="priority-indicator" :class="notification.priority">
              <div class="priority-dot"></div>
            </div>
            <div v-if="notification.isPinned" class="pin-indicator">
              <i class="fas fa-thumbtack"></i>
            </div>
          </div>

          <!-- Notification Content -->
          <div class="notification-content">
            <!-- Header -->
            <div class="notification-header">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <div class="notification-meta">
                <span class="notification-category">
                  <i :class="getCategoryIcon(notification.category)"></i>
                  {{ getCategoryName(notification.category) }}
                </span>
                <span class="notification-date">{{ formatDate(notification.createdAt) }}</span>
                <span class="notification-author">
                  <i class="fas fa-user"></i>
                  {{ notification.author }}
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
                <span v-if="notification.attachments?.length > 0" class="notification-attachments">
                  <i class="fas fa-paperclip"></i>
                  {{ notification.attachments.length }} tệp đính kèm
                </span>
                <span v-if="notification.expiryDate" class="notification-expiry">
                  <i class="fas fa-clock"></i>
                  Hết hạn: {{ formatDate(notification.expiryDate) }}
                </span>
              </div>

              <div class="notification-actions" @click.stop>
                <button
                  class="action-btn"
                  :class="{ active: !notification.isRead }"
                  @click="toggleReadStatus(notification)"
                  :title="notification.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'"
                  :disabled="loading"
                >
                  <i :class="notification.isRead ? 'fas fa-envelope-open' : 'fas fa-envelope'"></i>
                </button>
                
                <button
                  class="action-btn"
                  :class="{ active: notification.isPinned }"
                  @click="$emit('pin', notification)"
                  :title="notification.isPinned ? 'Bỏ ghim' : 'Ghim thông báo'"
                  :disabled="loading"
                >
                  <i class="fas fa-thumbtack"></i>
                </button>
                
                <button
                  class="action-btn archive"
                  @click="handleArchive(notification)"
                  title="Lưu trữ"
                  :disabled="loading"
                >
                  <i class="fas fa-archive"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Read Status Indicator -->
          <div class="read-status-indicator" v-if="!notification.isRead">
            <div class="unread-dot"></div>
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
            'unread': !notification.isRead,
            'high-priority': notification.priority === 'high',
            'pinned': notification.isPinned,
            'expired': isExpired(notification)
          }"
          @click="handleNotificationClick(notification)"
        >
          <!-- Card Header -->
          <div class="card-header">
            <div class="card-indicators">
              <div class="priority-indicator" :class="notification.priority">
                <div class="priority-dot"></div>
              </div>
              <span class="card-category">
                <i :class="getCategoryIcon(notification.category)"></i>
                {{ getCategoryName(notification.category) }}
              </span>
              <div v-if="notification.isPinned" class="pin-indicator">
                <i class="fas fa-thumbtack"></i>
              </div>
            </div>
            <div class="card-date">{{ formatDate(notification.createdAt) }}</div>
          </div>

          <!-- Card Content -->
          <div class="card-content">
            <h3 class="card-title">{{ notification.title }}</h3>
            <p class="card-preview">{{ notification.content }}</p>
          </div>

          <!-- Card Footer -->
          <div class="card-footer">
            <div class="card-info">
              <span class="card-author">{{ notification.author }}</span>
              <div class="card-meta">
                <span v-if="notification.attachments?.length > 0" class="card-attachments">
                  <i class="fas fa-paperclip"></i>
                  {{ notification.attachments.length }}
                </span>
                <span v-if="notification.expiryDate" class="card-expiry">
                  <i class="fas fa-clock"></i>
                </span>
              </div>
            </div>
          </div>

          <!-- Card Actions -->
          <div class="card-actions" @click.stop>
            <button
              class="action-btn"
              :class="{ active: !notification.isRead }"
              @click="toggleReadStatus(notification)"
              :title="notification.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'"
              :disabled="loading"
            >
              <i :class="notification.isRead ? 'fas fa-envelope-open' : 'fas fa-envelope'"></i>
            </button>
            
            <button
              class="action-btn"
              :class="{ active: notification.isPinned }"
              @click="$emit('pin', notification)"
              :title="notification.isPinned ? 'Bỏ ghim' : 'Ghim thông báo'"
              :disabled="loading"
            >
              <i class="fas fa-thumbtack"></i>
            </button>
            
            <button
              class="action-btn archive"
              @click="handleArchive(notification)"
              title="Lưu trữ"
              :disabled="loading"
            >
              <i class="fas fa-archive"></i>
            </button>
          </div>

          <!-- Read Status Indicator -->
          <div class="read-status-indicator" v-if="!notification.isRead">
            <div class="unread-dot"></div>
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
      <p>Bạn chưa có thông báo nào phù hợp với bộ lọc hiện tại.</p>
    </div>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
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
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'notification-click',
  'mark-as-read',
  'mark-as-unread',
  'archive',
  'pin'
])

// Category mapping
const categoryMap = {
  general: { name: 'Chung', icon: 'fas fa-info-circle' },
  academic: { name: 'Học tập', icon: 'fas fa-graduation-cap' },
  event: { name: 'Sự kiện', icon: 'fas fa-calendar' },
  assignment: { name: 'Bài tập', icon: 'fas fa-tasks' },
  exam: { name: 'Thi cử', icon: 'fas fa-file-alt' },
  department: { name: 'Khoa', icon: 'fas fa-building' },
  system: { name: 'Hệ thống', icon: 'fas fa-cog' }
}

// Methods
const getCategoryName = (category) => {
  return categoryMap[category]?.name || category
}

const getCategoryIcon = (category) => {
  return categoryMap[category]?.icon || 'fas fa-info-circle'
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
  } else if (diffInHours < 168) { // 7 days
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} ngày trước`
  } else {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
}

const isExpired = (notification) => {
  if (!notification.expiryDate) return false
  return new Date(notification.expiryDate) < new Date()
}

const handleNotificationClick = (notification) => {
  emit('notification-click', notification)
}

const toggleReadStatus = (notification) => {
  if (notification.isRead) {
    emit('mark-as-unread', notification)
  } else {
    emit('mark-as-read', notification)
  }
}

const handleArchive = (notification) => {
  if (confirm('Bạn có chắc chắn muốn lưu trữ thông báo này? Thông báo sẽ được chuyển vào thư mục lưu trữ.')) {
    emit('archive', notification)
  }
}
</script>

<style scoped>
.student-notification-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  position: relative;
}

/* List View Styles */
.list-view {
  padding: 0;
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

.notification-item.unread {
  background: linear-gradient(90deg, #eff6ff 0%, #ffffff 100%);
  border-left: 4px solid #667eea;
}

.notification-item.high-priority {
  border-left: 4px solid #ef4444;
}

.notification-item.pinned {
  background: linear-gradient(90deg, #fef3c7 0%, #ffffff 100%);
  border-left: 4px solid #f59e0b;
}

.notification-item.expired {
  opacity: 0.6;
}

.notification-indicators {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.priority-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
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

.pin-indicator {
  color: #f59e0b;
  font-size: 12px;
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

.notification-category,
.notification-author {
  display: flex;
  align-items: center;
  gap: 4px;
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
  opacity: 0;
  transition: opacity 0.3s ease;
}

.notification-item:hover .notification-actions {
  opacity: 1;
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
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.action-btn.active {
  background: #dbeafe;
  color: #2563eb;
}

.action-btn.archive:hover {
  background: #fee2e2;
  color: #dc2626;
}

.read-status-indicator {
  position: absolute;
  top: 20px;
  right: 20px;
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: pulse 2s infinite;
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

.notification-card.unread {
  border-left: 4px solid #667eea;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.notification-card.high-priority {
  border-left: 4px solid #ef4444;
}

.notification-card.pinned {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(135deg, #fef3c7 0%, #ffffff 100%);
}

.notification-card.expired {
  opacity: 0.6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-indicators {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.card-category {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.card-date {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
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
  flex: 1;
}

.card-author {
  font-weight: 500;
  color: #6b7280;
}

.card-meta {
  display: flex;
  gap: 12px;
}

.card-meta span {
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
  margin: 0;
  font-size: 16px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
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
  
  .notification-actions {
    opacity: 1;
  }
  
  .notification-grid {
    grid-template-columns: 1fr;
  }
  
  .grid-view {
    padding: 16px;
  }
  
  .card-actions {
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .notification-item {
    padding: 12px;
  }
  
  .notification-card {
    padding: 16px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>