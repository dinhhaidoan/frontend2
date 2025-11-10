<template>
  <div class="card grade-comparison-card">
    <h2>Điểm trung bình các lớp</h2>
    <div class="grade-chart">
      <div v-for="cls in classGrades" :key="cls.id" class="grade-bar-item">
        <div class="grade-label">{{ cls.name }}</div>
        <div class="grade-bar-wrap">
          <div class="grade-bar-bg">
            <div class="grade-bar-fill" :style="{ width: (cls.avg / 10) * 100 + '%', background: getGradeColor(cls.avg) }"></div>
          </div>
          <div class="grade-value">{{ cls.avg.toFixed(1) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  classGrades: { type: Array, required: true }
})

const getGradeColor = (grade) => {
  if (grade >= 8.5) return 'linear-gradient(90deg, #10b981, #059669)'
  if (grade >= 7.5) return 'linear-gradient(90deg, #3b82f6, #2563eb)'
  if (grade >= 6.5) return 'linear-gradient(90deg, #f59e0b, #d97706)'
  return 'linear-gradient(90deg, #ef4444, #dc2626)'
}
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

.grade-chart {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.grade-bar-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.grade-label {
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
}

.grade-bar-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.grade-bar-bg {
  flex: 1;
  height: 18px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.grade-bar-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 500ms cubic-bezier(0.4, 0, 0.2, 1);
}

.grade-value {
  min-width: 40px;
  text-align: right;
  font-weight: 700;
  font-size: 14px;
  color: #0f172a;
}
</style>
