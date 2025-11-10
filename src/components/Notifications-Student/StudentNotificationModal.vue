<template>
  <teleport to="body">
    <div class="modal-overlay" @click="handleOverlayClick">
      <div class="student-notification-modal" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="modal-title-section">
            <div class="title-indicators">
              <div class="priority-indicator" :class="notification.priority">
                <div class="priority-dot"></div>
              </div>
              <div v-if="notification.isPinned" class="pin-indicator">
                <i class="fas fa-thumbtack"></i>
              </div>
            </div>
            <div class="title-content">
              <h2 class="modal-title">{{ notification.title }}</h2>
              <div class="modal-meta">
                <span class="notification-category">
                  <i :class="getCategoryIcon(notification.category)"></i>
                  {{ getCategoryName(notification.category) }}
                </span>
                <span class="notification-author">
                  <i class="fas fa-user"></i>
                  {{ notification.author }}
                </span>
                <span class="notification-date">
                  <i class="fas fa-clock"></i>
                  {{ formatDate(notification.createdAt) }}
                </span>
              </div>
            </div>
          </div>
          
          <div class="modal-actions">
            <button
              class="action-btn"
              :class="{ active: !notification.isRead }"
              @click="toggleReadStatus"
              :title="notification.isRead ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc'"
            >
              <i :class="notification.isRead ? 'fas fa-envelope-open' : 'fas fa-envelope'"></i>
            </button>
            
            <button
              class="action-btn"
              :class="{ active: notification.isPinned }"
              @click="$emit('pin', notification)"
              :title="notification.isPinned ? 'Bỏ ghim' : 'Ghim thông báo'"
            >
              <i class="fas fa-thumbtack"></i>
            </button>
            
            <button
              class="action-btn archive"
              @click="handleArchive"
              title="Lưu trữ"
            >
              <i class="fas fa-archive"></i>
            </button>
            
            <button class="close-btn" @click="$emit('close')" title="Đóng">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Modal Content -->
        <div class="modal-content">
          <!-- Priority Alert -->
          <div v-if="notification.priority === 'high'" class="priority-alert">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Thông báo quan trọng - Vui lòng đọc kỹ</span>
          </div>

          <!-- Expiry Warning -->
          <div v-if="notification.expiryDate && !isExpired(notification)" class="expiry-warning">
            <i class="fas fa-clock"></i>
            <span>Thông báo này sẽ hết hạn vào {{ formatDate(notification.expiryDate) }}</span>
          </div>

          <div v-if="isExpired(notification)" class="expired-warning">
            <i class="fas fa-times-circle"></i>
            <span>Thông báo này đã hết hạn</span>
          </div>

          <!-- Content -->
          <div class="notification-content">
            <div class="content-text" v-html="formatContent(notification.content)"></div>
          </div>

          <!-- Attachments -->
          <div v-if="notification.attachments?.length > 0" class="attachments-section">
            <h3 class="section-title">
              <i class="fas fa-paperclip"></i>
              Tệp đính kèm ({{ notification.attachments.length }})
            </h3>
            <div class="attachments-list">
              <div
                v-for="attachment in notification.attachments"
                :key="attachment.id"
                class="attachment-item"
                @click="downloadAttachment(attachment)"
              >
                <div class="attachment-icon">
                  <i :class="getFileIcon(attachment.type)"></i>
                </div>
                <div class="attachment-info">
                  <span class="attachment-name">{{ attachment.name }}</span>
                  <span class="attachment-size">{{ attachment.size }}</span>
                </div>
                <button class="download-btn" title="Tải xuống">
                  <i class="fas fa-download"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="additional-info">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Ngày tạo:</span>
                <span class="info-value">{{ formatFullDate(notification.createdAt) }}</span>
              </div>
              <div class="info-item" v-if="notification.expiryDate">
                <span class="info-label">Hết hạn:</span>
                <span class="info-value" :class="{ expired: isExpired(notification) }">
                  {{ formatFullDate(notification.expiryDate) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Độ ưu tiên:</span>
                <span class="info-value priority" :class="notification.priority">
                  {{ getPriorityName(notification.priority) }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">Trạng thái:</span>
                <span class="info-value" :class="{ unread: !notification.isRead }">
                  {{ notification.isRead ? 'Đã đọc' : 'Chưa đọc' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <div class="footer-info">
            <span class="read-status">
              <i :class="notification.isRead ? 'fas fa-check-circle' : 'fas fa-circle'"></i>
              {{ notification.isRead ? 'Đã đọc' : 'Chưa đọc' }}
            </span>
          </div>
          
          <div class="footer-actions">
            <button class="btn btn-secondary" @click="$emit('close')">
              Đóng
            </button>
            <button 
              v-if="!notification.isRead"
              class="btn btn-primary" 
              @click="markAsReadAndClose"
            >
              Đánh dấu đã đọc & Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  }
})

const emit = defineEmits([
  'close',
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

// File type icons
const fileIcons = {
  pdf: 'fas fa-file-pdf',
  doc: 'fas fa-file-word',
  docx: 'fas fa-file-word',
  xls: 'fas fa-file-excel',
  xlsx: 'fas fa-file-excel',
  ppt: 'fas fa-file-powerpoint',
  pptx: 'fas fa-file-powerpoint',
  zip: 'fas fa-file-archive',
  rar: 'fas fa-file-archive',
  jpg: 'fas fa-file-image',
  jpeg: 'fas fa-file-image',
  png: 'fas fa-file-image',
  gif: 'fas fa-file-image',
  mp4: 'fas fa-file-video',
  avi: 'fas fa-file-video',
  mp3: 'fas fa-file-audio',
  wav: 'fas fa-file-audio',
  txt: 'fas fa-file-alt',
  default: 'fas fa-file'
}

// Methods
const getCategoryName = (category) => {
  return categoryMap[category]?.name || category
}

const getCategoryIcon = (category) => {
  return categoryMap[category]?.icon || 'fas fa-info-circle'
}

const getPriorityName = (priority) => {
  const names = {
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp'
  }
  return names[priority] || priority
}

const getFileIcon = (type) => {
  return fileIcons[type?.toLowerCase()] || fileIcons.default
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
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
}

const formatFullDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatContent = (content) => {
  // Convert line breaks to HTML
  return content.replace(/\n/g, '<br>')
}

const isExpired = (notification) => {
  if (!notification.expiryDate) return false
  return new Date(notification.expiryDate) < new Date()
}

const handleOverlayClick = () => {
  emit('close')
}

const toggleReadStatus = () => {
  if (props.notification.isRead) {
    emit('mark-as-unread', props.notification)
  } else {
    emit('mark-as-read', props.notification)
  }
}

const handleArchive = () => {
  if (confirm('Bạn có chắc chắn muốn lưu trữ thông báo này? Thông báo sẽ được chuyển vào thư mục lưu trữ.')) {
    emit('archive', props.notification)
    emit('close')
  }
}

const markAsReadAndClose = () => {
  emit('mark-as-read', props.notification)
  emit('close')
}

const downloadAttachment = (attachment) => {
  // Mock download - replace with real download logic
  console.log('Downloading:', attachment.name)
  
  // Create a temporary link to trigger download
  const link = document.createElement('a')
  link.href = attachment.url || '#'
  link.download = attachment.name
  link.click()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.student-notification-modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 64px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  padding: 24px 32px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-title-section {
  display: flex;
  gap: 16px;
  flex: 1;
  min-width: 0;
}

.title-indicators {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
}

.priority-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.priority-dot {
  width: 12px;
  height: 12px;
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
  font-size: 14px;
}

.title-content {
  flex: 1;
  min-width: 0;
}

.modal-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.3;
}

.modal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
}

.modal-meta span {
  display: flex;
  align-items: center;
  gap: 6px;
}

.modal-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.action-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.action-btn:hover {
  transform: scale(1.1);
}

.action-btn.active {
  background: #dbeafe;
  color: #2563eb;
}

.action-btn.archive:hover {
  background: #fee2e2;
  color: #dc2626;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 10px;
  background: #fee2e2;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.close-btn:hover {
  background: #fecaca;
  transform: scale(1.1);
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 32px;
}

.priority-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-weight: 500;
  margin-bottom: 24px;
}

.expiry-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 8px;
  color: #d97706;
  font-weight: 500;
  margin-bottom: 24px;
}

.expired-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 24px;
}

.notification-content {
  margin-bottom: 32px;
}

.content-text {
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
}

.content-text :deep(br) {
  margin-bottom: 8px;
}

.attachments-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.attachments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.attachment-item:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.attachment-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 18px;
}

.attachment-info {
  flex: 1;
  min-width: 0;
}

.attachment-name {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 2px;
  word-break: break-word;
}

.attachment-size {
  display: block;
  font-size: 12px;
  color: #9ca3af;
}

.download-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  cursor: pointer;
  transition: background 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.download-btn:hover {
  background: #2563eb;
}

.additional-info {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.info-value.expired {
  color: #dc2626;
}

.info-value.unread {
  color: #2563eb;
}

.info-value.priority.high {
  color: #dc2626;
}

.info-value.priority.medium {
  color: #d97706;
}

.info-value.priority.low {
  color: #059669;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  padding: 24px 32px;
  border-top: 1px solid #f3f4f6;
  background: #fafbfc;
  border-radius: 0 0 16px 16px;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.read-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #6b7280;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
  }
  
  .student-notification-modal {
    max-width: none;
    border-radius: 16px 16px 0 0;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
  }
  
  .modal-title-section {
    order: 2;
  }
  
  .modal-actions {
    order: 1;
    align-self: flex-end;
  }
  
  .modal-content {
    padding: 0 20px;
  }
  
  .modal-footer {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
  }
  
  .footer-actions {
    width: 100%;
    justify-content: stretch;
  }
  
  .btn {
    flex: 1;
  }
  
  .modal-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .modal-title {
    font-size: 20px;
  }
  
  .action-btn,
  .close-btn {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
  
  .attachment-item {
    padding: 8px 12px;
  }
  
  .attachment-icon {
    width: 32px;
    height: 32px;
    font-size: 16px;
  }
}
</style>