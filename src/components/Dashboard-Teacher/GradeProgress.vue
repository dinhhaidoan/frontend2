<template>
  <div class="card grade-card">
    <h2>Tiến độ chấm điểm</h2>
    <div class="progress-section">
      <div class="progress-bar-wrap">
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" :style="{ width: gradePercent + '%' }"></div>
        </div>
        <div class="progress-text">
          <span class="progress-value">{{ gradePercent }}%</span>
          <span class="progress-label">Hoàn thành</span>
        </div>
      </div>
      <div class="grade-stats">
        <div class="grade-stat">
          <span class="badge graded">{{ graded }}</span>
          <span class="label">Đã chấm</span>
        </div>
        <div class="grade-stat">
          <span class="badge pending">{{ pending }}</span>
          <span class="label">Cần chấm</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  graded: { type: Number, required: true },
  pending: { type: Number, required: true }
})

const gradePercent = computed(() => {
  const total = props.graded + props.pending
  return Math.round((props.graded / Math.max(1, total)) * 100)
})
</script>

<style scoped>
.card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 200ms ease;
}

.card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.card h2 {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #0f172a;
}

.progress-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-bar-wrap {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-bar-bg {
  flex: 1;
  height: 12px;
  background: #e5e7eb;
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #06b6d4);
  transition: width 600ms cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 999px;
}

.progress-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 80px;
}

.progress-value {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.progress-label {
  font-size: 12px;
  color: #9ca3af;
}

.grade-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.grade-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 20px;
  color: white;
}

.badge.graded {
  background: linear-gradient(135deg, #10b981, #047857);
}

.badge.pending {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.label {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}
</style>
