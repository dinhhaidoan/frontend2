<template>
  <div class="quick-stats">
    <div 
      v-for="(stat, index) in stats" 
      :key="index"
      class="stat-card"
      :style="{ background: stat.gradient }"
    >
      <div class="stat-icon">
        <i :class="stat.icon"></i>
      </div>
      <div class="stat-content">
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-trend" :class="stat.trendType">
          <i :class="stat.trendIcon"></i>
          {{ stat.trend }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const stats = ref([
  {
    icon: 'fas fa-star',
    label: 'Điểm trung bình',
    value: '8.5',
    trend: '+0.3 so với kỳ trước',
    trendType: 'positive',
    trendIcon: 'fas fa-arrow-up',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: 'fas fa-tasks',
    label: 'Bài tập hoàn thành',
    value: '12/15',
    trend: '3 bài còn lại',
    trendType: 'warning',
    trendIcon: 'fas fa-clock',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    icon: 'fas fa-calendar-check',
    label: 'Điểm danh',
    value: '95%',
    trend: '19/20 buổi',
    trendType: 'positive',
    trendIcon: 'fas fa-check',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  },
  {
    icon: 'fas fa-book-open',
    label: 'Môn học kỳ này',
    value: '6',
    trend: '24 tín chỉ',
    trendType: 'neutral',
    trendIcon: 'fas fa-info-circle',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  }
])
</script>

<style scoped>
.quick-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 24px;
  border-radius: 16px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
  line-height: 1;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.95;
}

.stat-trend i {
  font-size: 11px;
}

.stat-trend.positive {
  color: rgba(255, 255, 255, 0.95);
}

.stat-trend.warning {
  color: rgba(255, 255, 255, 0.9);
}

.stat-trend.neutral {
  color: rgba(255, 255, 255, 0.85);
}

@media (max-width: 1200px) {
  .quick-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .quick-stats {
    grid-template-columns: 1fr;
  }
}
</style>
