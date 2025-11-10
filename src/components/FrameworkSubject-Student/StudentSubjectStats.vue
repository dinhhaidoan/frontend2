<template>
  <div class="student-subject-stats">
    <div class="stats-grid">
      <!-- Tiến độ học tập -->
      <div class="stat-card progress-card">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.progressPercentage }}%</h3>
            <p>Tiến độ học tập</p>
          </div>
        </div>
        <div class="progress-ring">
          <div class="progress-circle">
            <div 
              class="progress-fill" 
              :style="{ strokeDasharray: `${stats.progressPercentage * 2.51}, 251` }"
            ></div>
            <div class="progress-center">
              <span class="progress-text">{{ stats.completedSubjects }}/{{ stats.totalSubjects }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Điểm trung bình -->
      <div class="stat-card gpa-card">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-star"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.gpa }}</h3>
            <p>Điểm trung bình</p>
          </div>
        </div>
        <div class="gpa-indicator">
          <div class="gpa-bar">
            <div 
              class="gpa-fill" 
              :style="{ width: `${(stats.gpa / 10) * 100}%` }"
              :class="getGpaClass(stats.gpa)"
            ></div>
          </div>
          <div class="gpa-label">
            {{ getGpaLabel(stats.gpa) }}
          </div>
        </div>
      </div>

      <!-- Tổng tín chỉ -->
      <div class="stat-card credits-card">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-calculator"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.completedCredits }}/{{ stats.totalCredits }}</h3>
            <p>Tín chỉ tích lũy</p>
          </div>
        </div>
        <div class="credits-breakdown">
          <div class="breakdown-item">
            <span class="label">Đã hoàn thành:</span>
            <span class="value completed">{{ stats.completedCredits }} TC</span>
          </div>
          <div class="breakdown-item">
            <span class="label">Đang học:</span>
            <span class="value current">{{ stats.currentCredits }} TC</span>
          </div>
          <div class="breakdown-item">
            <span class="label">Còn lại:</span>
            <span class="value remaining">{{ stats.remainingCredits }} TC</span>
          </div>
        </div>
      </div>

      <!-- Môn học theo loại -->
      <div class="stat-card subjects-card">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-book"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.totalSubjects }}</h3>
            <p>Tổng môn học</p>
          </div>
        </div>
        <div class="subjects-breakdown">
          <div class="breakdown-item">
            <div class="item-icon required">
              <i class="fas fa-star"></i>
            </div>
            <span class="label">Bắt buộc:</span>
            <span class="value">{{ stats.requiredSubjects }}</span>
          </div>
          <div class="breakdown-item">
            <div class="item-icon elective">
              <i class="fas fa-list-ul"></i>
            </div>
            <span class="label">Tự chọn:</span>
            <span class="value">{{ stats.electiveSubjects }}</span>
          </div>
        </div>
      </div>

      <!-- Trạng thái môn học -->
      <div class="stat-card status-card">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="stat-info">
            <h3>{{ stats.completedSubjects }}</h3>
            <p>Đã hoàn thành</p>
          </div>
        </div>
        <div class="status-breakdown">
          <div class="status-item completed">
            <div class="status-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="status-info">
              <span class="count">{{ stats.completedSubjects }}</span>
              <span class="label">Hoàn thành</span>
            </div>
          </div>
          <div class="status-item current">
            <div class="status-icon">
              <i class="fas fa-play-circle"></i>
            </div>
            <div class="status-info">
              <span class="count">{{ stats.currentSubjects }}</span>
              <span class="label">Đang học</span>
            </div>
          </div>
          <div class="status-item remaining">
            <div class="status-icon">
              <i class="fas fa-circle"></i>
            </div>
            <div class="status-info">
              <span class="count">{{ stats.remainingSubjects }}</span>
              <span class="label">Chưa học</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Thành tích -->
      <div class="stat-card achievement-card">
        <div class="stat-header">
          <div class="stat-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <div class="stat-info">
            <h3>{{ getAchievementCount() }}</h3>
            <p>Thành tích</p>
          </div>
        </div>
        <div class="achievements">
          <div v-if="stats.gpa >= 8.5" class="achievement excellent">
            <i class="fas fa-medal"></i>
            <span>Học sinh xuất sắc</span>
          </div>
          <div v-else-if="stats.gpa >= 7.0" class="achievement good">
            <i class="fas fa-award"></i>
            <span>Học sinh khá</span>
          </div>
          <div v-if="stats.progressPercentage >= 75" class="achievement progress">
            <i class="fas fa-clock"></i>
            <span>Tiến độ tốt</span>
          </div>
          <div v-if="!hasAnyAchievement()" class="no-achievement">
            <i class="fas fa-target"></i>
            <span>Cố gắng lên!</span>
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
      totalSubjects: 45,
      completedSubjects: 15,
      currentSubjects: 5,
      remainingSubjects: 25,
      requiredSubjects: 30,
      electiveSubjects: 15,
      totalCredits: 140,
      completedCredits: 45,
      currentCredits: 15,
      remainingCredits: 80,
      gpa: 7.8,
      progressPercentage: 33
    })
  }
})

// Helper methods
const getGpaClass = (gpa) => {
  if (gpa >= 8.5) return 'excellent'
  if (gpa >= 7.0) return 'good'
  if (gpa >= 5.5) return 'average'
  if (gpa >= 4.0) return 'poor'
  return 'fail'
}

const getGpaLabel = (gpa) => {
  if (gpa >= 8.5) return 'Xuất sắc'
  if (gpa >= 7.0) return 'Khá'
  if (gpa >= 5.5) return 'Trung bình'
  if (gpa >= 4.0) return 'Yếu'
  return 'Kém'
}

const hasAnyAchievement = () => {
  return props.stats.gpa >= 7.0 || props.stats.progressPercentage >= 75
}

const getAchievementCount = () => {
  let count = 0
  if (props.stats.gpa >= 7.0) count++
  if (props.stats.progressPercentage >= 75) count++
  return count
}
</script>

<style scoped>
.student-subject-stats {
  padding: 20px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

.stat-card.progress-card::before {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.stat-card.gpa-card::before {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.stat-card.credits-card::before {
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
}

.stat-card.subjects-card::before {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.stat-card.status-card::before {
  background: linear-gradient(90deg, #06b6d4, #22d3ee);
}

.stat-card.achievement-card::before {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
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
  flex-shrink: 0;
}

.progress-card .stat-icon {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.gpa-card .stat-icon {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.credits-card .stat-icon {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.subjects-card .stat-icon {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.status-card .stat-icon {
  background: linear-gradient(135deg, #06b6d4, #22d3ee);
}

.achievement-card .stat-icon {
  background: linear-gradient(135deg, #ef4444, #f87171);
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

/* Progress Card Specific */
.progress-ring {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.progress-circle {
  position: relative;
  width: 120px;
  height: 120px;
}

.progress-circle svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-fill {
  fill: none;
  stroke: #3b82f6;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dasharray 1s ease;
}

.progress-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.progress-text {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

/* GPA Card Specific */
.gpa-indicator {
  margin-top: 16px;
}

.gpa-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.gpa-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 1s ease;
}

.gpa-fill.excellent {
  background: linear-gradient(90deg, #10b981, #34d399);
}

.gpa-fill.good {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.gpa-fill.average {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.gpa-fill.poor {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.gpa-fill.fail {
  background: linear-gradient(90deg, #6b7280, #9ca3af);
}

.gpa-label {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

/* Credits Breakdown */
.credits-breakdown,
.subjects-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8fafc;
  border-radius: 8px;
  font-size: 13px;
}

.breakdown-item .label {
  color: #6b7280;
  font-weight: 500;
}

.breakdown-item .value {
  font-weight: 600;
  color: #1f2937;
}

.breakdown-item .value.completed {
  color: #059669;
}

.breakdown-item .value.current {
  color: #3b82f6;
}

.breakdown-item .value.remaining {
  color: #d97706;
}

/* Subjects Breakdown */
.subjects-breakdown .breakdown-item {
  align-items: center;
  gap: 8px;
}

.item-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
  flex-shrink: 0;
}

.item-icon.required {
  background: #f59e0b;
}

.item-icon.elective {
  background: #10b981;
}

/* Status Breakdown */
.status-breakdown {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  padding: 12px 8px;
  background: #f8fafc;
  border-radius: 8px;
  text-align: center;
}

.status-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
}

.status-item.completed .status-icon {
  background: #10b981;
}

.status-item.current .status-icon {
  background: #3b82f6;
}

.status-item.remaining .status-icon {
  background: #6b7280;
}

.status-info .count {
  display: block;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 2px;
}

.status-info .label {
  font-size: 11px;
  color: #6b7280;
  font-weight: 500;
}

/* Achievements */
.achievements {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.achievement,
.no-achievement {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
}

.achievement.excellent {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.achievement.good {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.achievement.progress {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.no-achievement {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  font-style: italic;
}

/* Add CSS for SVG progress circle */
.progress-circle::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    #3b82f6 0deg, 
    #3b82f6 calc(var(--progress, 0) * 3.6deg), 
    #e5e7eb calc(var(--progress, 0) * 3.6deg), 
    #e5e7eb 360deg
  );
  -webkit-mask: radial-gradient(circle at center, transparent 36px, black 38px);
  mask: radial-gradient(circle at center, transparent 36px, black 38px);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }
  
  .stat-card {
    padding: 20px;
  }
  
  .status-breakdown {
    flex-direction: column;
    gap: 8px;
  }
  
  .status-item {
    flex-direction: row;
    justify-content: flex-start;
    text-align: left;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .stat-card {
    padding: 16px;
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
  
  .progress-circle {
    width: 100px;
    height: 100px;
  }
  
  .progress-text {
    font-size: 14px;
  }
}
</style>