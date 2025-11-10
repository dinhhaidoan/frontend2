<template>
  <div class="staff-dashboard">
    <!-- Welcome Header -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="greeting">
          <h1>Xin chào, {{ staffName }} 👋</h1>
          <p class="subtitle">{{ currentDate }} • {{ currentTime }}</p>
        </div>
        <div class="quick-stats">
          <div class="quick-stat-item">
            <i class="fas fa-tasks"></i>
            <div>
              <div class="stat-value">{{ todayTasks }}</div>
              <div class="stat-label">Công việc hôm nay</div>
            </div>
          </div>
          <div class="quick-stat-item">
            <i class="fas fa-bell"></i>
            <div>
              <div class="stat-value">{{ unreadNotifications }}</div>
              <div class="stat-label">Thông báo mới</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions-section">
      <h2 class="section-title">
        <i class="fas fa-bolt"></i>
        Thao tác nhanh
      </h2>
      <div class="quick-actions-grid">
        <button class="quick-action-btn" @click="navigateTo('/subjects')">
          <i class="fas fa-book"></i>
          <span>Quản lý học phần</span>
        </button>
        <button class="quick-action-btn" @click="navigateTo('/account')">
          <i class="fas fa-user-graduate"></i>
          <span>Quản lý tài khoản</span>
        </button>
        <button class="quick-action-btn" @click="navigateTo('/notifications')">
          <i class="fas fa-bullhorn"></i>
          <span>Gửi thông báo</span>
        </button>
        <button class="quick-action-btn" @click="navigateTo('/reports')">
          <i class="fas fa-chart-bar"></i>
          <span>Xem báo cáo</span>
        </button>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Left Column -->
      <div class="left-column">
        <!-- Subject Statistics -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>
              <i class="fas fa-graduation-cap"></i>
              Học phần đang mở
            </h3>
            <router-link to="/subjects" class="view-all-link">
              Xem tất cả →
            </router-link>
          </div>
          <div class="card-body">
            <div class="stats-overview">
              <div class="stat-box">
                <div class="stat-number">{{ subjectStats.total }}</div>
                <div class="stat-text">Tổng học phần</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">{{ subjectStats.active }}</div>
                <div class="stat-text">Đang hoạt động</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">{{ subjectStats.full }}</div>
                <div class="stat-text">Đã đầy</div>
              </div>
            </div>
            
            <div class="recent-subjects">
              <h4>Học phần mới nhất</h4>
              <div class="subject-list">
                <div v-for="subject in recentSubjects" :key="subject.id" class="subject-item">
                  <div class="subject-info">
                    <div class="subject-code">{{ subject.code }}</div>
                    <div class="subject-name">{{ subject.name }}</div>
                    <div class="subject-teacher">{{ subject.teacher }}</div>
                  </div>
                  <div class="subject-meta">
                    <span class="subject-students">{{ subject.registered }}/{{ subject.capacity }}</span>
                    <span class="status-badge" :class="subject.status">
                      {{ getStatusLabel(subject.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Notes -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>
              <i class="fas fa-sticky-note"></i>
              Ghi chú gần đây
            </h3>
            <router-link to="/note" class="view-all-link">
              Xem tất cả →
            </router-link>
          </div>
          <div class="card-body">
            <div class="notes-list">
              <div v-for="note in recentNotes" :key="note.id" class="note-item">
                <div class="note-header">
                  <span class="note-title">{{ note.title }}</span>
                  <span class="note-time">{{ note.time }}</span>
                </div>
                <div class="note-content">{{ note.content }}</div>
                <div class="note-footer">
                  <span class="note-category" :style="{ background: note.categoryColor }">
                    {{ note.category }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column -->
      <div class="right-column">
        <!-- Account Statistics -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>
              <i class="fas fa-users"></i>
              Tài khoản sinh viên
            </h3>
            <router-link to="/account" class="view-all-link">
              Xem tất cả →
            </router-link>
          </div>
          <div class="card-body">
            <div class="stats-overview">
              <div class="stat-box">
                <div class="stat-number">{{ accountStats.total }}</div>
                <div class="stat-text">Tổng tài khoản</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">{{ accountStats.active }}</div>
                <div class="stat-text">Hoạt động</div>
              </div>
              <div class="stat-box">
                <div class="stat-number">{{ accountStats.pending }}</div>
                <div class="stat-text">Chờ duyệt</div>
              </div>
            </div>

            <div class="account-distribution">
              <div class="distribution-item">
                <div class="distribution-bar">
                  <div class="bar-fill active" :style="{ width: (accountStats.active / accountStats.total * 100) + '%' }">
                    <span class="bar-label">{{ (accountStats.active / accountStats.total * 100).toFixed(1) }}%</span>
                  </div>
                </div>
                <div class="distribution-legend">
                  <span class="legend-color active"></span>
                  <span class="legend-text">Hoạt động ({{ accountStats.active }} SV)</span>
                </div>
              </div>
              
              <div class="distribution-item">
                <div class="distribution-bar">
                  <div class="bar-fill pending" :style="{ width: (accountStats.pending / accountStats.total * 100) + '%' }">
                    <span class="bar-label">{{ (accountStats.pending / accountStats.total * 100).toFixed(1) }}%</span>
                  </div>
                </div>
                <div class="distribution-legend">
                  <span class="legend-color pending"></span>
                  <span class="legend-text">Chờ duyệt ({{ accountStats.pending }} SV)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Notifications -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>
              <i class="fas fa-bell"></i>
              Thông báo gần đây
            </h3>
            <router-link to="/notifications" class="view-all-link">
              Xem tất cả →
            </router-link>
          </div>
          <div class="card-body">
            <div class="notifications-list">
              <div v-for="notification in recentNotifications" :key="notification.id" class="notification-item">
                <div class="notification-icon" :class="notification.type">
                  <i :class="getNotificationIcon(notification.type)"></i>
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-desc">{{ notification.description }}</div>
                  <div class="notification-time">{{ notification.time }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Reports Summary -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>
              <i class="fas fa-chart-line"></i>
              Báo cáo tổng quan
            </h3>
            <router-link to="/reports" class="view-all-link">
              Xem chi tiết →
            </router-link>
          </div>
          <div class="card-body">
            <div class="report-stats">
              <div class="report-item">
                <div class="report-icon">
                  <i class="fas fa-book"></i>
                </div>
                <div class="report-info">
                  <div class="report-label">Tổng môn học</div>
                  <div class="report-value">{{ reportStats.totalSubjects }}</div>
                </div>
              </div>
              <div class="report-item">
                <div class="report-icon">
                  <i class="fas fa-chalkboard-teacher"></i>
                </div>
                <div class="report-info">
                  <div class="report-label">Giảng viên</div>
                  <div class="report-value">{{ reportStats.totalTeachers }}</div>
                </div>
              </div>
              <div class="report-item">
                <div class="report-icon">
                  <i class="fas fa-percentage"></i>
                </div>
                <div class="report-info">
                  <div class="report-label">Tỷ lệ hoàn thành</div>
                  <div class="report-value">{{ reportStats.completionRate }}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// User Info
const staffName = ref('Nguyễn Văn A')
const currentDate = ref('')
const currentTime = ref('')

// Quick Stats
const todayTasks = ref(8)
const unreadNotifications = ref(5)

// Subject Statistics
const subjectStats = ref({
  total: 62,
  active: 55,
  full: 12
})

const recentSubjects = ref([
  { id: 1, code: 'IT001-01', name: 'Nhập môn lập trình', teacher: 'TS. Nguyễn Văn A', registered: 58, capacity: 60, status: 'open' },
  { id: 2, code: 'IT002-01', name: 'Lập trình hướng đối tượng', teacher: 'PGS.TS. Trần Thị B', registered: 50, capacity: 50, status: 'full' },
  { id: 3, code: 'IT003-01', name: 'Cấu trúc dữ liệu và giải thuật', teacher: 'TS. Lê Văn C', registered: 52, capacity: 55, status: 'open' },
  { id: 4, code: 'IT004-01', name: 'Cơ sở dữ liệu', teacher: 'ThS. Phạm Thị D', registered: 45, capacity: 60, status: 'open' },
  { id: 5, code: 'IT005-01', name: 'Mạng máy tính', teacher: 'TS. Hoàng Văn E', registered: 48, capacity: 50, status: 'open' }
])

// Account Statistics
const accountStats = ref({
  total: 1012,
  active: 985,
  pending: 27
})

// Recent Notes
const recentNotes = ref([
  { id: 1, title: 'Họp khoa', content: 'Họp khoa vào 9h sáng thứ 2 tại phòng A101', time: '2 giờ trước', category: 'Công việc', categoryColor: '#667eea' },
  { id: 2, title: 'Kiểm tra học phần IT001', content: 'Cần chuẩn bị đề thi giữa kỳ cho môn Nhập môn lập trình', time: '5 giờ trước', category: 'Học tập', categoryColor: '#f093fb' },
  { id: 3, title: 'Deadline báo cáo', content: 'Nộp báo cáo đánh giá sinh viên trước ngày 20/10', time: '1 ngày trước', category: 'Quan trọng', categoryColor: '#f5576c' }
])

// Recent Notifications
const recentNotifications = ref([
  { id: 1, type: 'success', title: 'Học phần đã mở thành công', description: 'IT001-01 đã được mở và sẵn sàng cho đăng ký', time: '10 phút trước' },
  { id: 2, type: 'warning', title: 'Học phần sắp đầy', description: 'IT002-01 còn 2 chỗ trống', time: '1 giờ trước' },
  { id: 3, type: 'info', title: 'Thông báo mới', description: 'Lịch thi giữa kỳ đã được cập nhật', time: '3 giờ trước' },
  { id: 4, type: 'error', title: 'Yêu cầu hỗ trợ', description: 'Sinh viên báo lỗi hệ thống đăng ký', time: '5 giờ trước' }
])

// Report Statistics
const reportStats = ref({
  totalSubjects: 38,
  totalTeachers: 45,
  completionRate: 82.5
})

// Methods
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentDate.value = now.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

const navigateTo = (path) => {
  router.push(path)
}

const getStatusLabel = (status) => {
  const labels = {
    open: 'Đang mở',
    full: 'Đã đầy',
    closed: 'Đã đóng'
  }
  return labels[status] || status
}

const getNotificationIcon = (type) => {
  const icons = {
    success: 'fas fa-check-circle',
    warning: 'fas fa-exclamation-triangle',
    info: 'fas fa-info-circle',
    error: 'fas fa-times-circle'
  }
  return icons[type] || 'fas fa-bell'
}

// Lifecycle
let timeInterval = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.staff-dashboard {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

/* Welcome Section */
.welcome-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.greeting h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.subtitle {
  color: #718096;
  font-size: 1rem;
  margin: 0;
}

.quick-stats {
  display: flex;
  gap: 2rem;
}

.quick-stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-radius: 12px;
  color: white;
}

.quick-stat-item i {
  font-size: 2rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

/* Quick Actions */
.quick-actions-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.quick-action-btn {
  background: white;
  border: none;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.quick-action-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.quick-action-btn i {
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.quick-action-btn span {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
}

/* Dashboard Grid */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
}

/* Dashboard Cards */
.dashboard-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
}

.card-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-all-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.view-all-link:hover {
  color: #764ba2;
  transform: translateX(4px);
}

.card-body {
  padding: 1.5rem 2rem;
}

/* Stats Overview */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-box {
  text-align: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
  border-radius: 12px;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.25rem;
}

.stat-text {
  font-size: 0.875rem;
  color: #718096;
}

/* Recent Subjects */
.recent-subjects h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.subject-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.subject-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.subject-item:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.subject-info {
  flex: 1;
}

.subject-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #667eea;
  font-size: 0.875rem;
}

.subject-name {
  font-weight: 500;
  color: #2d3748;
  margin: 0.25rem 0;
}

.subject-teacher {
  font-size: 0.875rem;
  color: #718096;
}

.subject-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.subject-students {
  font-weight: 600;
  color: #4a5568;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.open {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.status-badge.full {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

/* Notes List */
.notes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.note-item {
  padding: 1rem;
  background: #f7fafc;
  border-left: 4px solid #667eea;
  border-radius: 8px;
}

.note-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.note-title {
  font-weight: 600;
  color: #2d3748;
}

.note-time {
  font-size: 0.75rem;
  color: #a0aec0;
}

.note-content {
  color: #4a5568;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.note-footer {
  display: flex;
  justify-content: flex-start;
}

.note-category {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

/* Account Distribution */
.account-distribution {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.distribution-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.distribution-bar {
  width: 100%;
  height: 40px;
  background: #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 1rem;
  transition: width 1s ease;
  position: relative;
}

.bar-fill.active {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.bar-fill.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.bar-label {
  color: white;
  font-weight: 700;
  font-size: 0.875rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.distribution-legend {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.legend-color.active {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.legend-color.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.legend-text {
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
}

/* Notifications List */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.notification-item:hover {
  background: #edf2f7;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-icon.success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.notification-icon.warning {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.notification-icon.info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.notification-icon.error {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.notification-desc {
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 0.25rem;
}

.notification-time {
  font-size: 0.75rem;
  color: #a0aec0;
}

/* Report Stats */
.report-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.report-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.report-item:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.report-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.report-info {
  flex: 1;
}

.report-label {
  font-size: 0.875rem;
  color: #718096;
  margin-bottom: 0.25rem;
}

.report-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

/* Responsive */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .staff-dashboard {
    padding: 1rem;
  }
  
  .welcome-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;
  }
  
  .quick-stats {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
}
</style>
