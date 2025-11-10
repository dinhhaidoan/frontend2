<template>
  <div class="student-stats">
    <div class="stat-card total">
      <div class="stat-icon">
        <i class="fas fa-users"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.total }}</h3>
        <p>Tổng sinh viên</p>
      </div>
    </div>

    <div class="stat-card studying">
      <div class="stat-icon">
        <i class="fas fa-user-graduate"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.studying }}</h3>
        <p>Đang học</p>
        <span class="percentage">{{ calculatePercentage(stats.studying) }}%</span>
      </div>
    </div>

    <div class="stat-card reserved">
      <div class="stat-icon">
        <i class="fas fa-pause-circle"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.reserved }}</h3>
        <p>Bảo lưu</p>
        <span class="percentage">{{ calculatePercentage(stats.reserved) }}%</span>
      </div>
    </div>

    <div class="stat-card graduated">
      <div class="stat-icon">
        <i class="fas fa-medal"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.graduated }}</h3>
        <p>Tốt nghiệp</p>
        <span class="percentage">{{ calculatePercentage(stats.graduated) }}%</span>
      </div>
    </div>

    <div class="stat-card warning">
      <div class="stat-icon">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.warning }}</h3>
        <p>Cảnh báo học tập</p>
        <span class="percentage">{{ calculatePercentage(stats.warning) }}%</span>
      </div>
    </div>

    <div class="stat-card avg-gpa">
      <div class="stat-icon">
        <i class="fas fa-chart-line"></i>
      </div>
      <div class="stat-content">
        <h3>{{ stats.avgGPA.toFixed(2) }}</h3>
        <p>GPA trung bình</p>
        <span class="grade">{{ getGradeLabel(stats.avgGPA) }}</span>
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
      total: 0,
      studying: 0,
      reserved: 0,
      graduated: 0,
      suspended: 0,
      warning: 0,
      avgGPA: 0
    })
  }
})

const calculatePercentage = (value) => {
  if (props.stats.total === 0) return 0
  return ((value / props.stats.total) * 100).toFixed(1)
}

const getGradeLabel = (gpa) => {
  if (gpa >= 3.6) return 'Xuất sắc'
  if (gpa >= 3.2) return 'Giỏi'
  if (gpa >= 2.5) return 'Khá'
  if (gpa >= 2.0) return 'Trung bình'
  return 'Yếu'
}
</script>

<style scoped>
.student-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
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
  background: currentColor;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-content p {
  margin: 5px 0 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.percentage,
.grade {
  display: inline-block;
  margin-top: 5px;
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

/* Total */
.stat-card.total {
  color: #3498db;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.total .stat-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.stat-card.total .stat-content h3,
.stat-card.total .stat-content p {
  color: white;
}

/* Studying */
.stat-card.studying {
  color: #27ae60;
}

.stat-card.studying .stat-icon {
  background: rgba(39, 174, 96, 0.1);
  color: #27ae60;
}

.stat-card.studying .percentage {
  color: #27ae60;
  background: rgba(39, 174, 96, 0.1);
}

/* Reserved */
.stat-card.reserved {
  color: #f39c12;
}

.stat-card.reserved .stat-icon {
  background: rgba(243, 156, 18, 0.1);
  color: #f39c12;
}

.stat-card.reserved .percentage {
  color: #f39c12;
  background: rgba(243, 156, 18, 0.1);
}

/* Graduated */
.stat-card.graduated {
  color: #9b59b6;
}

.stat-card.graduated .stat-icon {
  background: rgba(155, 89, 182, 0.1);
  color: #9b59b6;
}

.stat-card.graduated .percentage {
  color: #9b59b6;
  background: rgba(155, 89, 182, 0.1);
}

/* Warning */
.stat-card.warning {
  color: #e74c3c;
}

.stat-card.warning .stat-icon {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
}

.stat-card.warning .percentage {
  color: #e74c3c;
  background: rgba(231, 76, 60, 0.1);
}

/* Average GPA */
.stat-card.avg-gpa {
  color: #16a085;
}

.stat-card.avg-gpa .stat-icon {
  background: rgba(22, 160, 133, 0.1);
  color: #16a085;
}

.stat-card.avg-gpa .grade {
  color: #16a085;
  background: rgba(22, 160, 133, 0.1);
}

@media (max-width: 768px) {
  .student-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .student-stats {
    grid-template-columns: 1fr;
  }
}
</style>
