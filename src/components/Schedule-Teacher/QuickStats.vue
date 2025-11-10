<template>
  <div class="quick-stats-grid">
    <div 
      v-for="stat in statsData"
      :key="stat.id"
      :class="['stat-card', stat.color]"
      @click="handleStatClick(stat.id)"
    >
      <div class="stat-icon">
        <i :class="stat.icon"></i>
      </div>
      <div class="stat-info">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
        <div v-if="stat.subtext" class="stat-subtext">{{ stat.subtext }}</div>
      </div>
      <div class="stat-trend" v-if="stat.trend">
        <i :class="stat.trend > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
        {{ Math.abs(stat.trend) }}%
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['stat-click'])

const statsData = computed(() => [
  {
    id: 'classes-today',
    label: 'Buổi dạy hôm nay',
    value: props.stats.todayClasses || 0,
    icon: 'fas fa-chalkboard-teacher',
    color: 'blue',
    trend: 0,
    subtext: 'Đang diễn ra'
  },
  {
    id: 'classes-week',
    label: 'Tổng buổi tuần này',
    value: props.stats.weekClasses || 0,
    icon: 'fas fa-calendar-week',
    color: 'green',
    trend: 5
  },
  {
    id: 'exams',
    label: 'Lịch coi thi',
    value: props.stats.upcomingExams || 0,
    icon: 'fas fa-file-alt',
    color: 'orange',
    subtext: 'Sắp tới'
  },
])

const handleStatClick = (statId) => {
  emit('stat-click', statId)
}
</script>

<style scoped>
.quick-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background: var(--card-color);
  opacity: 0;
  transition: opacity 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-card.blue { --card-color: #3b82f6; }
.stat-card.green { --card-color: #10b981; }
.stat-card.purple { --card-color: #8b5cf6; }
.stat-card.orange { --card-color: #f59e0b; }
.stat-card.red { --card-color: #ef4444; }
.stat-card.teal { --card-color: #14b8a6; }

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.stat-card.blue .stat-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.stat-card.green .stat-icon {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-card.purple .stat-icon {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.stat-card.orange .stat-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-card.red .stat-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.stat-card.teal .stat-icon {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.stat-subtext {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
}

.stat-trend {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-trend .fa-arrow-up {
  color: #10b981;
}

.stat-trend .fa-arrow-down {
  color: #ef4444;
}

@media (max-width: 1024px) {
  .quick-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .quick-stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
