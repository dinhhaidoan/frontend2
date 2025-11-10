<template>
  <div class="stats-container">
    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
        <i class="fas fa-book-open"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ stats.totalClasses }}</div>
        <div class="stat-label">Lớp đang học</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        <i class="fas fa-user-check"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ stats.attendanceRate }}%</div>
        <div class="stat-label">Điểm danh</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        <i class="fas fa-tasks"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ stats.completedAssignments }}/{{ stats.totalAssignments }}</div>
        <div class="stat-label">Bài tập hoàn thành</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
        <i class="fas fa-chart-line"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ stats.averageGrade.toFixed(1) }}</div>
        <div class="stat-label">Điểm trung bình</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      totalClasses: 0,
      attendanceRate: 0,
      completedAssignments: 0,
      totalAssignments: 0,
      averageGrade: 0
    })
  }
})
</script>

<style scoped>
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-label {
    font-size: 12px;
  }
}
</style>
