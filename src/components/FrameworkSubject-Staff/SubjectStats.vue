<template>
  <div class="subject-stats">
    <div class="stats-grid">
      <!-- Tổng số môn học -->
      <div class="stat-card total">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-book"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalSubjects }}</h3>
            <p>Tổng môn học</p>
          </div>
        </div>
      </div>

      <!-- Môn bắt buộc -->
      <div class="stat-card required">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.requiredSubjects }}</h3>
            <p>Môn bắt buộc</p>
          </div>
        </div>
        <div class="stat-detail">
          {{ ((stats.requiredSubjects / stats.totalSubjects) * 100).toFixed(1) }}% chương trình
        </div>
      </div>

      <!-- Môn tự chọn -->
      <div class="stat-card elective">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-list-ul"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.electiveSubjects }}</h3>
            <p>Môn tự chọn</p>
          </div>
        </div>
      </div>

      <!-- Tổng tín chỉ -->
      <div class="stat-card credits">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-calculator"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalCredits }}</h3>
            <p>Tổng tín chỉ</p>
          </div>
        </div>
        <div class="stat-breakdown">
          <span>Bắt buộc: {{ stats.requiredCredits }}</span>
          <span>Tự chọn: {{ stats.electiveCredits }}</span>
        </div>
      </div>

      <!-- Chuyên ngành -->
      <div class="stat-card majors">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.majors }}</h3>
            <p>Chuyên ngành</p>
          </div>
        </div>
      </div>

      <!-- Học kỳ -->
      <div class="stat-card semesters">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-calendar-alt"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.semesters }}</h3>
            <p>Học kỳ</p>
          </div>
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
    default: () => ({
      totalSubjects: 156,
      requiredSubjects: 98,
      electiveSubjects: 58,
      electiveGroups: 12,
      totalCredits: 140,
      requiredCredits: 95,
      electiveCredits: 45,
      majors: 6,
      activeMajors: 5,
      semesters: 8
    })
  }
})
</script>

<style scoped>
.subject-stats {
  padding: 20px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--accent-color), var(--accent-light));
}

.stat-card.total::before {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.stat-card.required::before {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.stat-card.elective::before {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.stat-card.credits::before {
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
}

.stat-card.majors::before {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.stat-card.semesters::before {
  background: linear-gradient(90deg, #06b6d4, #22d3ee);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  flex-shrink: 0;
}

.stat-card.total .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.stat-card.required .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.stat-card.elective .stat-icon {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.stat-card.credits .stat-icon {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.stat-card.majors .stat-icon {
  background: linear-gradient(135deg, #ef4444, #f87171);
}

.stat-card.semesters .stat-icon {
  background: linear-gradient(135deg, #06b6d4, #22d3ee);
}

.stat-info h3 {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
  line-height: 1;
}

.stat-info p {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
  font-weight: 600;
}

.stat-trend.positive {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.stat-trend.negative {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.stat-detail {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.stat-breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
}

.stat-breakdown span {
  display: flex;
  justify-content: space-between;
  padding: 2px 0;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .stat-header {
    gap: 12px;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .stat-info h3 {
    font-size: 24px;
  }
}
</style>