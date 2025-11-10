<template>
  <div class="lesson-stats">
    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
        <i class="fas fa-book-open"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ stats.totalLessons }}</div>
        <div class="stat-label">Tổng bài học</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
        <i class="fas fa-check-circle"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ stats.completedLessons }}</div>
        <div class="stat-label">Đã hoàn thành</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
        <i class="fas fa-video"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ stats.watchedVideos }}</div>
        <div class="stat-label">Video đã xem</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);">
        <i class="fas fa-download"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ stats.downloadedMaterials }}</div>
        <div class="stat-label">Tài liệu đã tải</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
        <i class="fas fa-clock"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ stats.totalHours }}h</div>
        <div class="stat-label">Giờ học tích lũy</div>
      </div>
    </div>

    <div class="stat-card">
      <div class="stat-icon" style="background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);">
        <i class="fas fa-percentage"></i>
      </div>
      <div class="stat-content">
        <div class="stat-value">{{ stats.completionRate }}%</div>
        <div class="stat-label">Tiến độ học tập</div>
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
      totalLessons: 0,
      completedLessons: 0,
      watchedVideos: 0,
      downloadedMaterials: 0,
      totalHours: 0,
      completionRate: 0
    })
  }
})
</script>

<style scoped>
.lesson-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .lesson-stats {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .lesson-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .stat-card {
    padding: 16px;
    gap: 12px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 20px;
  }

  .stat-value {
    font-size: 24px;
  }
}
</style>
