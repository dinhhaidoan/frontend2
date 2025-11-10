<template>
  <div class="notification-stats" v-if="visibleStats.length > 0">
    <div class="stats-grid">
      <!-- Total Notifications -->
      <div 
        class="stat-card" 
        v-if="visibleStats.includes('total')"
        :class="{ highlighted: stats.total > 0 }"
      >
        <div class="stat-icon total">
          <i class="fas fa-bell"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.total || 0) }}</h3>
          <p>Tổng thông báo</p>
          <span class="stat-trend positive" v-if="stats.totalGrowth">
            <i class="fas fa-arrow-up"></i>
            +{{ stats.totalGrowth }}%
          </span>
        </div>
      </div>

      <!-- Unread Notifications -->
      <div 
        class="stat-card" 
        v-if="visibleStats.includes('unread')"
        :class="{ urgent: stats.unread > 10 }"
      >
        <div class="stat-icon unread">
          <i class="fas fa-bell-slash"></i>
          <span class="stat-badge" v-if="stats.unread > 0">{{ stats.unread }}</span>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.unread || 0) }}</h3>
          <p>Chưa đọc</p>
          <span class="stat-trend warning" v-if="stats.unread > 5">
            <i class="fas fa-exclamation-triangle"></i>
            Cần xử lý
          </span>
        </div>
      </div>

      <!-- Sent Notifications (Admin/Staff/Teacher) -->
      <div 
        class="stat-card" 
        v-if="visibleStats.includes('sent')"
      >
        <div class="stat-icon sent">
          <i class="fas fa-paper-plane"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.sent || 0) }}</h3>
          <p>Đã gửi</p>
          <span class="stat-detail">{{ getSentDetail() }}</span>
        </div>
      </div>

      <!-- Scheduled Notifications (Admin/Staff/Teacher) -->
      <div 
        class="stat-card" 
        v-if="visibleStats.includes('scheduled')"
        :class="{ highlighted: stats.scheduled > 0 }"
      >
        <div class="stat-icon scheduled">
          <i class="fas fa-clock"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.scheduled || 0) }}</h3>
          <p>Đã lên lịch</p>
          <span class="stat-detail">{{ getScheduledDetail() }}</span>
        </div>
      </div>

      <!-- Draft Notifications (Admin/Staff/Teacher) -->
      <div 
        class="stat-card" 
        v-if="visibleStats.includes('draft')"
      >
        <div class="stat-icon draft">
          <i class="fas fa-edit"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.draft || 0) }}</h3>
          <p>Bản nháp</p>
          <span class="stat-detail">{{ getDraftDetail() }}</span>
        </div>
      </div>

      <!-- System Notifications (Admin only) -->
      <div 
        class="stat-card" 
        v-if="visibleStats.includes('system')"
        :class="{ critical: stats.systemCritical > 0 }"
      >
        <div class="stat-icon system">
          <i class="fas fa-server"></i>
          <span class="stat-badge critical" v-if="stats.systemCritical > 0">
            {{ stats.systemCritical }}
          </span>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.system || 0) }}</h3>
          <p>Hệ thống</p>
          <span class="stat-detail">{{ getSystemDetail() }}</span>
        </div>
      </div>

      <!-- Read Rate (Admin/Staff) -->
      <div 
        class="stat-card" 
        v-if="visibleStats.includes('readRate') && canSeeReadRate"
      >
        <div class="stat-icon read-rate">
          <i class="fas fa-eye"></i>
        </div>
        <div class="stat-content">
          <h3>{{ getReadRate() }}%</h3>
          <p>Tỷ lệ đọc</p>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: getReadRate() + '%' }"
              :class="getReadRateClass()"
            ></div>
          </div>
        </div>
      </div>

      <!-- Response Rate (Admin/Staff) -->
      <div 
        class="stat-card" 
        v-if="visibleStats.includes('responseRate') && canSeeResponseRate"
      >
        <div class="stat-icon response-rate">
          <i class="fas fa-reply"></i>
        </div>
        <div class="stat-content">
          <h3>{{ getResponseRate() }}%</h3>
          <p>Tỷ lệ phản hồi</p>
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: getResponseRate() + '%' }"
              :class="getResponseRateClass()"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Summary (Admin/Staff) -->
    <div class="stats-summary" v-if="canSeeSummary">
      <div class="summary-item">
        <i class="fas fa-chart-line"></i>
        <span>{{ getTodayStats() }}</span>
      </div>
      <div class="summary-item">
        <i class="fas fa-users"></i>
        <span>{{ getRecipientStats() }}</span>
      </div>
      <div class="summary-item" v-if="userRole === 'admin'">
        <i class="fas fa-globe"></i>
        <span>{{ getGlobalStats() }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    default: () => ({})
  },
  visibleStats: {
    type: Array,
    default: () => ['total', 'unread']
  },
  userRole: {
    type: String,
    required: true
  }
})

// Computed properties for role-based visibility
const canSeeReadRate = computed(() => {
  return ['admin', 'staff'].includes(props.userRole)
})

const canSeeResponseRate = computed(() => {
  return ['admin', 'staff'].includes(props.userRole)
})

const canSeeSummary = computed(() => {
  return ['admin', 'staff', 'teacher'].includes(props.userRole)
})

// Utility methods
const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const getSentDetail = () => {
  const today = props.stats.sentToday || 0
  return today > 0 ? `${today} hôm nay` : 'Chưa có'
}

const getScheduledDetail = () => {
  const upcoming = props.stats.upcomingScheduled || 0
  return upcoming > 0 ? `${upcoming} sắp tới` : 'Không có'
}

const getDraftDetail = () => {
  const recent = props.stats.recentDrafts || 0
  return recent > 0 ? `${recent} mới` : 'Không có'
}

const getSystemDetail = () => {
  const critical = props.stats.systemCritical || 0
  if (critical > 0) {
    return `${critical} khẩn cấp`
  }
  return 'Bình thường'
}

const getReadRate = () => {
  const total = props.stats.total || 0
  const read = props.stats.totalRead || 0
  return total > 0 ? Math.round((read / total) * 100) : 0
}

const getReadRateClass = () => {
  const rate = getReadRate()
  if (rate >= 80) return 'excellent'
  if (rate >= 60) return 'good'
  if (rate >= 40) return 'average'
  return 'poor'
}

const getResponseRate = () => {
  const total = props.stats.totalWithResponse || 0
  const responded = props.stats.totalResponses || 0
  return total > 0 ? Math.round((responded / total) * 100) : 0
}

const getResponseRateClass = () => {
  const rate = getResponseRate()
  if (rate >= 70) return 'excellent'
  if (rate >= 50) return 'good'
  if (rate >= 30) return 'average'
  return 'poor'
}

const getTodayStats = () => {
  const sent = props.stats.sentToday || 0
  const received = props.stats.receivedToday || 0
  
  if (props.userRole === 'student') {
    return `${received} thông báo mới hôm nay`
  }
  return `${sent} thông báo đã gửi hôm nay`
}

const getRecipientStats = () => {
  const totalRecipients = props.stats.totalRecipients || 0
  const activeRecipients = props.stats.activeRecipients || 0
  
  if (props.userRole === 'student') {
    return `Thành viên trong ${props.stats.totalGroups || 0} nhóm`
  }
  return `${formatNumber(activeRecipients)} / ${formatNumber(totalRecipients)} người nhận hoạt động`
}

const getGlobalStats = () => {
  const systemUptime = props.stats.systemUptime || 0
  return `Hệ thống hoạt động ${systemUptime}% thời gian`
}
</script>

<style scoped>
.notification-stats {
  margin-bottom: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.stat-card.highlighted {
  border-left: 4px solid #667eea;
}

.stat-card.urgent {
  border-left: 4px solid #ef4444;
  background: linear-gradient(135deg, #fff 0%, #fef2f2 100%);
}

.stat-card.critical {
  border-left: 4px solid #dc2626;
  background: linear-gradient(135deg, #fff 0%, #fef2f2 100%);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  position: relative;
  flex-shrink: 0;
}

.stat-icon.total {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.stat-icon.unread {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.stat-icon.sent {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.stat-icon.scheduled {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
  color: white;
}

.stat-icon.draft {
  background: linear-gradient(135deg, #fa709a, #fee140);
  color: white;
}

.stat-icon.system {
  background: linear-gradient(135deg, #a8edea, #fed6e3);
  color: #374151;
}

.stat-icon.read-rate {
  background: linear-gradient(135deg, #d299c2, #fef9d7);
  color: #374151;
}

.stat-icon.response-rate {
  background: linear-gradient(135deg, #89f7fe, #66a6ff);
  color: white;
}

.stat-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 20px;
  height: 20px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 6px;
}

.stat-badge.critical {
  background: #dc2626;
  animation: pulse 2s infinite;
}

.stat-content {
  flex: 1;
  min-width: 0;
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
  font-size: 14px;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 8px;
}

.stat-trend.positive {
  background: #d1fae5;
  color: #065f46;
}

.stat-trend.warning {
  background: #fef3c7;
  color: #92400e;
}

.stat-detail {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
  margin-top: 8px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 3px;
}

.progress-fill.excellent {
  background: linear-gradient(90deg, #10b981, #059669);
}

.progress-fill.good {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8);
}

.progress-fill.average {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.progress-fill.poor {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.stats-summary {
  display: flex;
  justify-content: center;
  gap: 32px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.summary-item i {
  color: #667eea;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-summary {
    flex-direction: column;
    gap: 16px;
  }
  
  .summary-item {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  
  .stat-content h3 {
    font-size: 24px;
  }
}
</style>