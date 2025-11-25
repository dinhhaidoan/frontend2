 
<template>
  <div class="admin-dashboard">
    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-card">
        <div class="card-icon admin-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div class="card-content">
          <h2>Bảng điều khiển Admin</h2>
          <p>Quản lý hệ thống StudyHub - Tài khoản, Ghi chú & Tin nhắn</p>
          <div class="admin-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M9 12l2 2 4-4"/>
              <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
              <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
              <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
              <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
            </svg>
            Quản trị viên hệ thống
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="quick-stats">
      <div class="stat-card">
        <div class="stat-icon accounts">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <path d="M20 8v6M23 11h-6"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalUsers }}</h3>
          <p>Tổng tài khoản</p>
          <span class="stat-change positive">+{{ stats.newUsersToday }} hôm nay</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon notes">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.totalNotes }}</h3>
          <p>Ghi chú của tôi</p>
          <span class="stat-change neutral">{{ stats.notesToday }} hôm nay</span>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon messages">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <path d="M8 9h8M8 13h6"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ stats.unreadMessages }}</h3>
          <p>Tin nhắn chưa đọc</p>
          <span class="stat-change warning">Cần xử lý</span>
        </div>
      </div>
    </div>

    <!-- Main Actions -->
    <div class="main-actions">
      <!-- Account Management -->
      <div class="action-card primary">
        <div class="action-header">
          <div class="action-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div class="action-info">
            <h3>Quản lý Tài khoản</h3>
            <p>Tạo, chỉnh sửa và quản lý tài khoản người dùng</p>
          </div>
          <div class="action-badge">
            {{ stats.pendingApprovals }} chờ duyệt
          </div>
        </div>
        <div class="action-content">
          <div class="quick-actions">
            <button class="quick-btn" @click="goToAccountManagement">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="8.5" cy="7" r="4"/>
                <path d="M20 8v6M23 11h-6"/>
              </svg>
              Tạo tài khoản
            </button>
            <button class="quick-btn" @click="goToAccountList">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
              </svg>
              Danh sách
            </button>
            <button class="quick-btn" @click="goToUserRoles">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 12l2 2 4-4"/>
                <circle cx="12" cy="12" r="10"/>
              </svg>
              Phân quyền
            </button>
          </div>
          <div class="recent-activity">
            <h4>Hoạt động gần đây</h4>
            <div class="activity-list">
              <div v-for="activity in recentAccountActivities" :key="activity.id" class="activity-item">
                <div class="activity-icon" :class="activity.type">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path v-if="activity.type === 'created'" d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM20 8v6M23 11h-6"/>
                    <path v-else-if="activity.type === 'updated'" d="M11 4H4a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path v-else d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  </svg>
                </div>
                <div class="activity-content">
                  <span class="activity-text">{{ activity.text }}</span>
                  <span class="activity-time">{{ activity.time }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notes Management -->
      <div class="action-card secondary">
        <div class="action-header">
          <div class="action-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div class="action-info">
            <h3>Ghi chú Quản trị</h3>
            <p>Ghi chú công việc, nhắc nhở và tài liệu hệ thống</p>
          </div>
        </div>
        <div class="action-content">
          <div class="quick-actions">
            <button class="quick-btn" @click="createNewNote">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              Tạo mới
            </button>
            <button class="quick-btn" @click="goToNotes">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              Xem tất cả
            </button>
          </div>
          <div class="recent-notes">
            <h4>Ghi chú gần đây</h4>
            <div class="notes-list">
              <div v-for="note in recentNotes" :key="note.id" class="note-item" @click="openNote(note.id)">
                <div class="note-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <div class="note-content">
                  <span class="note-title">{{ note.title }}</span>
                  <span class="note-time">{{ note.updatedAt }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="action-card tertiary">
        <div class="action-header">
          <div class="action-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              <path d="M8 9h8M8 13h6"/>
            </svg>
          </div>
          <div class="action-info">
            <h3>Tin nhắn Nội bộ</h3>
            <p>Liên lạc với đội ngũ và nhận thông báo hệ thống</p>
          </div>
          <div class="message-badge" v-if="stats.unreadMessages > 0">
            {{ stats.unreadMessages }}
          </div>
        </div>
        <div class="action-content">
          <div class="quick-actions">
            <button class="quick-btn" @click="goToMessages">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="M8 9h8M8 13h6"/>
              </svg>
              Mở tin nhắn
            </button>
            <button class="quick-btn" @click="composeMessage">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 3h18v18h-18zM3 9l9 6 9-6"/>
              </svg>
              Soạn tin
            </button>
          </div>
          <div class="recent-messages">
            <h4>Tin nhắn mới</h4>
            <div class="messages-list">
              <div v-for="message in recentMessages" :key="message.id" class="message-item" @click="openMessage(message.id)">
                <div class="message-avatar">
                  <img :src="avatarSrc(message.sender.avatar) || getDefaultAvatar(message.sender.name)" :alt="message.sender.name" @error="onAvatarError($event, message.sender.avatar)" />
                </div>
                <div class="message-content">
                  <div class="message-header">
                    <span class="sender-name">{{ message.sender.name }}</span>
                    <span class="message-time">{{ message.time }}</span>
                  </div>
                  <span class="message-preview">{{ message.preview }}</span>
                </div>
                <div v-if="!message.read" class="message-unread"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- System Status -->
    <div class="system-status">
      <div class="status-header">
        <h3>Trạng thái Hệ thống</h3>
        <div class="status-indicator" :class="systemStatus.status">
          <div class="status-dot"></div>
          <span>{{ systemStatus.text }}</span>
        </div>
      </div>
      <div class="status-grid">
        <div class="status-item">
          <div class="status-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M2 3h20v18H2zM8 21l4-4 4 4"/>
            </svg>
          </div>
          <div class="status-info">
            <span class="status-label">Server</span>
            <span class="status-value">{{ systemStatus.server }}</span>
          </div>
        </div>
        <div class="status-item">
          <div class="status-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </div>
          <div class="status-info">
            <span class="status-label">Database</span>
            <span class="status-value">{{ systemStatus.database }}</span>
          </div>
        </div>
        <div class="status-item">
          <div class="status-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div class="status-info">
            <span class="status-label">Security</span>
            <span class="status-value">{{ systemStatus.security }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'
import { useRouter } from 'vue-router'

const router = useRouter()

// Mock data - Replace with API calls
const stats = ref({
  totalUsers: 1247,
  newUsersToday: 12,
  totalNotes: 45,
  notesToday: 3,
  unreadMessages: 8,
  pendingApprovals: 5
})

const systemStatus = ref({
  status: 'healthy', // healthy, warning, error
  text: 'Hoạt động bình thường',
  server: 'Online',
  database: 'Connected',
  security: 'Secure'
})

const recentAccountActivities = ref([
  {
    id: 1,
    type: 'created',
    text: 'Tạo tài khoản mới cho Nguyễn Văn A',
    time: '5 phút trước'
  },
  {
    id: 2,
    type: 'updated',
    text: 'Cập nhật quyền cho Trần B',
    time: '15 phút trước'
  },
  {
    id: 3,
    type: 'approved',
    text: 'Duyệt tài khoản giảng viên Lê C',
    time: '1 giờ trước'
  }
])

const recentNotes = ref([
  {
    id: 1,
    title: 'Kế hoạch bảo trì hệ thống',
    updatedAt: '2 giờ trước'
  },
  {
    id: 2,
    title: 'Hướng dẫn backup dữ liệu',
    updatedAt: '1 ngày trước'
  },
  {
    id: 3,
    title: 'Danh sách cần kiểm tra',
    updatedAt: '2 ngày trước'
  }
])

const recentMessages = ref([
  {
    id: 1,
    sender: {
      name: 'Phòng IT',
      avatar: null
    },
    preview: 'Cần hỗ trợ reset password cho 3 tài khoản...',
    time: '10 phút trước',
    read: false
  },
  {
    id: 2,
    sender: {
      name: 'Ban Giám hiệu',
      avatar: null
    },
    preview: 'Thông báo họp định kỳ vào thứ 2 tuần sau...',
    time: '1 giờ trước',
    read: true
  },
  {
    id: 3,
    sender: {
      name: 'Phòng Đào tạo',
      avatar: null
    },
    preview: 'Yêu cầu tạo tài khoản cho giảng viên mới...',
    time: '3 giờ trước',
    read: false
  }
])

// Methods
const goToAccountManagement = () => {
  router.push('/account-management')
}

const goToAccountList = () => {
  router.push('/account-management?tab=list')
}

const goToUserRoles = () => {
  router.push('/account-management?tab=roles')
}

const createNewNote = () => {
  router.push('/admin-notes/create')
}

const goToNotes = () => {
  router.push('/admin-notes')
}

const openNote = (noteId) => {
  router.push(`/admin-notes/${noteId}`)
}

const goToMessages = () => {
  router.push('/messages')
}

const composeMessage = () => {
  router.push('/messages?action=compose')
}

const openMessage = (messageId) => {
  router.push(`/messages/${messageId}`)
}

const getDefaultAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
}

// avatar fallback helpers
const blobMap = ref({})

const avatarSrc = (url) => {
  if (!url) return null
  return blobMap.value[url] || url
}

const onAvatarError = async (event, url) => {
  try {
    if (!url || blobMap.value[url]) return
    const b = await fetchImageAsBlobUrl(url)
    blobMap.value[url] = b
    event.target.src = b
  } catch (err) {
    console.debug('avatar fetch fallback failed', err)
  }
}

onBeforeUnmount(() => {
  Object.values(blobMap.value).forEach(v => revokeBlobUrl(v))
})
</script>

<style scoped>
.admin-dashboard {
  padding: 0;
  min-height: 100vh;
}

.welcome-section {
  margin-bottom: 32px;
}

.welcome-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
}

.admin-icon {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-content h2 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 700;
}

.card-content p {
  margin: 0 0 16px;
  opacity: 0.9;
  font-size: 16px;
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.stat-card {
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.accounts {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.stat-icon.notes {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.stat-icon.messages {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.stat-content h3 {
  margin: 0 0 4px;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
}

.stat-content p {
  margin: 0 0 8px;
  color: #6b7280;
  font-weight: 500;
}

.stat-change {
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
}

.stat-change.positive {
  background: #d1fae5;
  color: #065f46;
}

.stat-change.neutral {
  background: #e5e7eb;
  color: #374151;
}

.stat-change.warning {
  background: #fef3c7;
  color: #92400e;
}

.main-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
}

.action-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  transition: all 0.3s ease;
}

.action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.action-card.primary {
  border-top: 4px solid #667eea;
}

.action-card.secondary {
  border-top: 4px solid #f093fb;
}

.action-card.tertiary {
  border-top: 4px solid #4facfe;
}

.action-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border-bottom: 1px solid #f3f4f6;
  position: relative;
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-card.primary .action-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.action-card.secondary .action-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.action-card.tertiary .action-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.action-info h3 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.action-info p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.action-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #ef4444;
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.message-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  background: #ef4444;
  color: white;
  padding: 6px 10px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: 700;
  min-width: 24px;
  text-align: center;
}

.action-content {
  padding: 24px;
}

.quick-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.recent-activity h4,
.recent-notes h4,
.recent-messages h4 {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-list,
.notes-list,
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item,
.note-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.activity-item:hover,
.note-item:hover {
  background: #f3f4f6;
}

.activity-icon,
.note-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.created {
  background: #d1fae5;
  color: #065f46;
}

.activity-icon.updated {
  background: #dbeafe;
  color: #1e40af;
}

.activity-icon.approved {
  background: #fef3c7;
  color: #92400e;
}

.note-icon {
  background: #e0e7ff;
  color: #5b21b6;
}

.activity-content,
.note-content {
  flex: 1;
  min-width: 0;
}

.activity-text,
.note-title {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 2px;
}

.activity-time,
.note-time {
  font-size: 12px;
  color: #9ca3af;
}

.message-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.message-item:hover {
  background: #f3f4f6;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.sender-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.message-time {
  font-size: 12px;
  color: #9ca3af;
}

.message-preview {
  font-size: 13px;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.message-unread {
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
  flex-shrink: 0;
}

.system-status {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.status-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-indicator.healthy {
  background: #d1fae5;
  color: #065f46;
}

.status-indicator.warning {
  background: #fef3c7;
  color: #92400e;
}

.status-indicator.error {
  background: #fee2e2;
  color: #991b1b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.status-icon {
  width: 40px;
  height: 40px;
  background: #e5e7eb;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.status-label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.status-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

@media (max-width: 768px) {
  .welcome-card {
    flex-direction: column;
    text-align: center;
    padding: 24px;
  }

  .main-actions {
    grid-template-columns: 1fr;
  }

  .quick-stats {
    grid-template-columns: 1fr;
  }

  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>