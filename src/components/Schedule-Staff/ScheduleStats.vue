<template>
  <div class="schedule-stats">
    <div class="stats-grid">
      <!-- Total Schedules -->
      <div class="stat-card primary">
        <div class="stat-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.totalSchedules }}</div>
          <div class="stat-label">Tổng lịch</div>
        </div>
      </div>

      <!-- Class Schedules -->
      <div class="stat-card" :class="{ active: activeTab === 'class' }">
        <div class="stat-icon">
          <i class="fas fa-chalkboard-teacher"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.classSchedules }}</div>
          <div class="stat-label">Lịch học</div>
        </div>
      </div>

      <!-- Exam Schedules -->
      <div class="stat-card" :class="{ active: activeTab === 'exam' }">
        <div class="stat-icon">
          <i class="fas fa-file-alt"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.examSchedules }}</div>
          <div class="stat-label">Lịch thi</div>
        </div>
      </div>

      <!-- Conflicts -->
      <div class="stat-card" :class="{ 'warning': stats.conflicts > 0 }">
        <div class="stat-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.conflicts }}</div>
          <div class="stat-label">Xung đột</div>
        </div>
      </div>

      <!-- Rooms Used -->
      <div class="stat-card success">
        <div class="stat-icon">
          <i class="fas fa-door-open"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.roomsUsed }}</div>
          <div class="stat-label">Phòng sử dụng</div>
        </div>
      </div>

      <!-- Teachers Assigned -->
      <div class="stat-card info">
        <div class="stat-icon">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <div class="stat-number">{{ stats.teachersAssigned }}</div>
          <div class="stat-label">GV được phân công</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScheduleStats',
  props: {
    stats: {
      type: Object,
      required: true
    },
    activeTab: {
      type: String,
      default: 'class'
    }
  }
}
</script>

<style scoped>
.schedule-stats {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-card.primary {
  border-left-color: #3b82f6;
}

.stat-card.primary .stat-icon {
  background: #dbeafe;
  color: #3b82f6;
}

.stat-card.success {
  border-left-color: #10b981;
}

.stat-card.success .stat-icon {
  background: #d1fae5;
  color: #10b981;
}

.stat-card.warning {
  border-left-color: #f59e0b;
}

.stat-card.warning .stat-icon {
  background: #fef3c7;
  color: #f59e0b;
}

.stat-card.info {
  border-left-color: #8b5cf6;
}

.stat-card.info .stat-icon {
  background: #ede9fe;
  color: #8b5cf6;
}

.stat-card.active {
  border-left-color: #3b82f6;
  background: #f8faff;
}

.stat-card.active .stat-icon {
  background: #dbeafe;
  color: #3b82f6;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 20px;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  .stat-card {
    padding: 16px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .stat-number {
    font-size: 24px;
  }
}
</style>