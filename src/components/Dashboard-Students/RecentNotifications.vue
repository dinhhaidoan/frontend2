<template>
  <div class="recent-notifications">
    <div class="notifications-header">
      <h3>
        <i class="fas fa-bell"></i>
        Thông báo mới
      </h3>
      <button @click="viewAll" class="btn-view-all">
        Xem tất cả
        <i class="fas fa-arrow-right"></i>
      </button>
    </div>

    <div v-if="notifications.length === 0" class="no-notifications">
      <i class="far fa-bell-slash"></i>
      <p>Không có thông báo mới</p>
    </div>

    <div v-else class="notifications-list">
      <div 
        v-for="(notification, index) in notifications" 
        :key="index"
        class="notification-item"
        :class="{ unread: !notification.isRead }"
      >
        <div class="notification-icon" :class="notification.type">
          <i :class="notification.icon"></i>
        </div>
        <div class="notification-content">
          <div class="notification-title">{{ notification.title }}</div>
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-time">{{ notification.time }}</div>
        </div>
        <div v-if="!notification.isRead" class="unread-badge"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const notifications = ref([
  {
    icon: 'fas fa-chalkboard-teacher',
    type: 'class',
    title: 'Thông báo từ GV Nguyễn Văn A',
    message: 'Buổi học ngày mai sẽ chuyển sang online qua Google Meet',
    time: '10 phút trước',
    isRead: false
  },
  {
    icon: 'fas fa-file-alt',
    type: 'assignment',
    title: 'Bài tập mới - Mobile Android',
    message: 'GV đã giao bài tập "Fragments và Navigation". Hạn nộp: 30/10/2025',
    time: '2 giờ trước',
    isRead: false
  },
  {
    icon: 'fas fa-star',
    type: 'grade',
    title: 'Đã có điểm bài tập',
    message: 'Bài tập "Vue 3 Components" - Điểm: 9.0/10',
    time: '5 giờ trước',
    isRead: true
  },
  {
    icon: 'fas fa-bullhorn',
    type: 'announcement',
    title: 'Thông báo từ Phòng Đào tạo',
    message: 'Lịch thi cuối kỳ đã được công bố. Vui lòng kiểm tra',
    time: 'Hôm qua',
    isRead: true
  }
])

const viewAll = () => {
  router.push('/student-notifications')
}
</script>

<style scoped>
.recent-notifications {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

.notifications-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.notifications-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.notifications-header h3 i {
  color: #3b82f6;
}

.btn-view-all {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-view-all:hover {
  background: #f9fafb;
  border-color: #667eea;
  color: #667eea;
}

.no-notifications {
  text-align: center;
  padding: 40px 20px;
}

.no-notifications i {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.no-notifications p {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: #f9fafb;
  transition: all 0.3s;
  position: relative;
}

.notification-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.notification-item.unread {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(37, 99, 235, 0.05) 100%);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
}

.notification-icon.class {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.notification-icon.assignment {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.notification-icon.grade {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.notification-icon.announcement {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 6px;
}

.notification-message {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 8px;
}

.notification-time {
  font-size: 12px;
  color: #9ca3af;
}

.unread-badge {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .notification-item {
    flex-direction: column;
  }
}
</style>
