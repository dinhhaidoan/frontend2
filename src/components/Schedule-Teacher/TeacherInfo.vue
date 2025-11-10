<template>
  <div class="teacher-info-card">
    <div class="teacher-profile">
      <div class="avatar-section">
        <img src="https://i.pravatar.cc/150?img=33" alt="Teacher Avatar" class="avatar">
        <div class="status-badge">
          <i class="fas fa-circle"></i>
          Đang dạy
        </div>
      </div>
      
      <div class="profile-details">
        <h2 class="teacher-name">{{ teacherName }}</h2>
        <p class="teacher-code">{{ teacherCode }}</p>
        <div class="teacher-meta">
          <span class="meta-item">
            <i class="fas fa-graduation-cap"></i>
            {{ department }}
          </span>
          <span class="meta-item">
            <i class="fas fa-briefcase"></i>
            {{ position }}
          </span>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <button class="action-btn" @click="viewProfile">
        <i class="fas fa-user"></i>
        Hồ sơ
      </button>
      <button class="action-btn" @click="viewMessages">
        <i class="fas fa-envelope"></i>
        Tin nhắn
        <span v-if="unreadMessages > 0" class="badge">{{ unreadMessages }}</span>
      </button>
      <button class="action-btn" @click="viewNotifications">
        <i class="fas fa-bell"></i>
        Thông báo
        <span v-if="unreadNotifications > 0" class="badge">{{ unreadNotifications }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const teacherName = ref('TS. Nguyễn Văn A')
const teacherCode = ref('GV001234')
const department = ref('Khoa CNTT')
const position = ref('Giảng viên chính')
const unreadMessages = ref(5)
const unreadNotifications = ref(3)

const viewProfile = () => {
  router.push('/settings')
}

const viewMessages = () => {
  router.push('/message')
}

const viewNotifications = () => {
  router.push('/notifications')
}
</script>

<style scoped>
.teacher-info-card {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  box-shadow: 0 4px 12px rgba(30, 60, 114, 0.15);
}

.teacher-profile {
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
}

.avatar-section {
  position: relative;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.2);
  object-fit: cover;
}

.status-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  background: #10b981;
  color: white;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.status-badge i {
  font-size: 6px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.profile-details {
  flex: 1;
}

.teacher-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.teacher-code {
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 12px 0;
  font-size: 14px;
}

.teacher-meta {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

.meta-item i {
  opacity: 0.8;
}

.quick-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 12px 16px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.badge {
  background: #ef4444;
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
}

@media (max-width: 768px) {
  .teacher-profile {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>
