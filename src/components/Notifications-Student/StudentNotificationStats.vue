<template>
  <div class="student-notification-stats" v-if="!loading">
    <div class="stats-grid">
      <!-- Total Notifications -->
      <div class="stat-card total">
        <div class="stat-icon">
          <i class="fas fa-bell"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.total || 0) }}</h3>
          <p>Tổng thông báo</p>
          <span class="stat-detail">Tất cả thông báo nhận được</span>
        </div>
      </div>

      <!-- Unread Notifications -->
      <div class="stat-card unread" :class="{ urgent: stats.unread > 10 }">
        <div class="stat-icon">
          <i class="fas fa-envelope"></i>
          <span class="stat-badge" v-if="stats.unread > 0">{{ stats.unread }}</span>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.unread || 0) }}</h3>
          <p>Chưa đọc</p>
          <span class="stat-detail" :class="{ warning: stats.unread > 5 }">
            <i class="fas fa-exclamation-triangle" v-if="stats.unread > 5"></i>
            {{ getUnreadMessage() }}
          </span>
        </div>
      </div>

      <!-- Today's Notifications -->
      <div class="stat-card today" :class="{ highlighted: stats.today > 0 }">
        <div class="stat-icon">
          <i class="fas fa-calendar-day"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.today || 0) }}</h3>
          <p>Hôm nay</p>
          <span class="stat-detail">{{ getTodayMessage() }}</span>
        </div>
      </div>

      <!-- This Week's Notifications -->
      <div class="stat-card week">
        <div class="stat-icon">
          <i class="fas fa-calendar-week"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.thisWeek || 0) }}</h3>
          <p>Tuần này</p>
          <span class="stat-detail">{{ getWeekMessage() }}</span>
        </div>
      </div>

      <!-- Pinned Notifications -->
      <div class="stat-card pinned" v-if="stats.pinned > 0">
        <div class="stat-icon">
          <i class="fas fa-thumbtack"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.pinned || 0) }}</h3>
          <p>Đã ghim</p>
          <span class="stat-detail">Thông báo quan trọng</span>
        </div>
      </div>

      <!-- High Priority Notifications -->
      <div class="stat-card priority" v-if="stats.highPriority > 0">
        <div class="stat-icon">
          <i class="fas fa-exclamation-circle"></i>
        </div>
        <div class="stat-content">
          <h3>{{ formatNumber(stats.highPriority || 0) }}</h3>
          <p>Ưu tiên cao</p>
          <span class="stat-detail">Cần xem ngay</span>
        </div>
      </div>
    </div>

    <!-- Priority Breakdown -->
    <div class="priority-breakdown" v-if="hasPriorityData">
      <h4>Phân loại theo độ ưu tiên</h4>
      <div class="priority-items">
        <div class="priority-item high" v-if="stats.highPriority > 0">
          <div class="priority-indicator"></div>
          <span class="priority-label">Cao</span>
          <span class="priority-count">{{ stats.highPriority }}</span>
          <div class="priority-progress">
            <div 
              class="priority-fill" 
              :style="{ width: getPercentage(stats.highPriority) + '%' }"
            ></div>
          </div>
        </div>
        
        <div class="priority-item medium" v-if="stats.mediumPriority > 0">
          <div class="priority-indicator"></div>
          <span class="priority-label">Trung bình</span>
          <span class="priority-count">{{ stats.mediumPriority }}</span>
          <div class="priority-progress">
            <div 
              class="priority-fill" 
              :style="{ width: getPercentage(stats.mediumPriority) + '%' }"
            ></div>
          </div>
        </div>
        
        <div class="priority-item low" v-if="stats.lowPriority > 0">
          <div class="priority-indicator"></div>
          <span class="priority-label">Thấp</span>
          <span class="priority-count">{{ stats.lowPriority }}</span>
          <div class="priority-progress">
            <div 
              class="priority-fill" 
              :style="{ width: getPercentage(stats.lowPriority) + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Summary -->
    <div class="quick-summary">
      <div class="summary-item">
        <i class="fas fa-chart-pie"></i>
        <span>{{ getReadPercentage() }}% đã đọc</span>
      </div>
      <div class="summary-item" v-if="stats.today > 0">
        <i class="fas fa-clock"></i>
        <span>{{ stats.today }} thông báo mới hôm nay</span>
      </div>
      <div class="summary-item" v-if="stats.pinned > 0">
        <i class="fas fa-star"></i>
        <span>{{ stats.pinned }} thông báo quan trọng</span>
      </div>
    </div>
  </div>

  <!-- Loading State -->
  <div v-else class="stats-loading">
    <div class="loading-grid">
      <div v-for="i in 4" :key="i" class="loading-card">
        <div class="loading-icon"></div>
        <div class="loading-content">
          <div class="loading-number"></div>
          <div class="loading-text"></div>
        </div>
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
  loading: {
    type: Boolean,
    default: false
  }
})

// Computed properties
const hasPriorityData = computed(() => {
  return (props.stats.highPriority || 0) + 
         (props.stats.mediumPriority || 0) + 
         (props.stats.lowPriority || 0) > 0
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

const getUnreadMessage = () => {
  const unread = props.stats.unread || 0
  if (unread === 0) return 'Tuyệt vời!'
  if (unread <= 5) return 'Ít thông báo chưa đọc'
  if (unread <= 10) return 'Cần xem thêm'
  return 'Rất nhiều chưa đọc'
}

const getTodayMessage = () => {
  const today = props.stats.today || 0
  if (today === 0) return 'Không có thông báo mới'
  if (today === 1) return '1 thông báo mới'
  return `${today} thông báo mới`
}

const getWeekMessage = () => {
  const week = props.stats.thisWeek || 0
  if (week === 0) return 'Tuần yên tĩnh'
  if (week <= 5) return 'Tuần bình thường'
  if (week <= 10) return 'Tuần khá bận'
  return 'Tuần rất bận'
}

const getReadPercentage = () => {
  const total = props.stats.total || 0
  const read = props.stats.read || 0
  return total > 0 ? Math.round((read / total) * 100) : 0
}

const getPercentage = (value) => {
  const total = props.stats.total || 0
  return total > 0 ? Math.round((value / total) * 100) : 0
}
</script>

<style scoped>
.student-notification-stats {
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

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.stat-card.unread .stat-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
  color: white;
}

.stat-card.today .stat-icon {
  background: linear-gradient(135deg, #43e97b, #38f9d7);
  color: white;
}

.stat-card.week .stat-icon {
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
}

.stat-card.pinned .stat-icon {
  background: linear-gradient(135deg, #fa709a, #fee140);
  color: white;
}

.stat-card.priority .stat-icon {
  background: linear-gradient(135deg, #ff9a9e, #fecfef);
  color: #374151;
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

.stat-detail {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-detail.warning {
  color: #d97706;
}

.stat-detail i {
  font-size: 10px;
}

.priority-breakdown {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.priority-breakdown h4 {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.priority-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.priority-item {
  display: grid;
  grid-template-columns: 12px 1fr auto 60px;
  gap: 12px;
  align-items: center;
  padding: 8px 0;
}

.priority-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.priority-item.high .priority-indicator {
  background: #ef4444;
}

.priority-item.medium .priority-indicator {
  background: #f59e0b;
}

.priority-item.low .priority-indicator {
  background: #10b981;
}

.priority-label {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.priority-count {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
}

.priority-progress {
  width: 60px;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.priority-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.priority-item.high .priority-fill {
  background: #ef4444;
}

.priority-item.medium .priority-fill {
  background: #f59e0b;
}

.priority-item.low .priority-fill {
  background: #10b981;
}

.quick-summary {
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

/* Loading States */
.stats-loading {
  margin-bottom: 32px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.loading-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.loading-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

.loading-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.loading-number {
  width: 60px;
  height: 24px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: loading 1.5s infinite;
}

.loading-text {
  width: 80px;
  height: 16px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  border-radius: 4px;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
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
  .stats-grid,
  .loading-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-summary {
    flex-direction: column;
    gap: 16px;
  }
  
  .summary-item {
    justify-content: center;
  }
  
  .priority-item {
    grid-template-columns: 12px 1fr auto;
    gap: 8px;
  }
  
  .priority-progress {
    display: none;
  }
}

@media (max-width: 480px) {
  .stat-card,
  .loading-card {
    padding: 16px;
  }
  
  .stat-icon,
  .loading-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }
  
  .stat-content h3 {
    font-size: 24px;
  }
  
  .priority-breakdown {
    padding: 16px;
  }
}
</style>