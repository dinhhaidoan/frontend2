<template>
  <div class="learning-analytics">
    <div class="analytics-header">
      <h3>
        <i class="fas fa-chart-bar"></i>
        Phân tích năng lực học tập
      </h3>
      <div class="time-range">
        <button 
          v-for="range in timeRanges" 
          :key="range.value"
          @click="selectedRange = range.value"
          :class="['range-btn', { active: selectedRange === range.value }]"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <div class="analytics-grid">
      <!-- Overall Stats -->
      <div class="stat-cards">
        <div 
          v-for="(stat, index) in overallStats" 
          :key="index"
          class="stat-card"
          :style="{ background: stat.gradient }"
        >
          <div class="stat-icon">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-change" :class="stat.changeType">
              <i :class="stat.changeIcon"></i>
              {{ stat.change }}
            </div>
          </div>
        </div>
      </div>

      <!-- Skill Radar Chart -->
      <div class="chart-card radar-chart-card">
        <div class="card-header">
          <h4>
            <i class="fas fa-spider"></i>
            Phân tích kỹ năng
          </h4>
          <span class="subtitle">Đánh giá 6 khía cạnh</span>
        </div>
        <div class="card-body">
          <div class="radar-container">
            <svg viewBox="0 0 400 400" class="radar-svg">
              <!-- Background levels -->
              <g v-for="level in 5" :key="`level-${level}`" class="radar-level">
                <polygon
                  :points="getRadarPolygonPoints(level * 20)"
                  fill="none"
                  :stroke="level === 5 ? '#e5e7eb' : '#f3f4f6'"
                  stroke-width="1"
                />
              </g>

              <!-- Axes -->
              <g v-for="(skill, index) in skills" :key="`axis-${index}`">
                <line
                  x1="200"
                  y1="200"
                  :x2="getPointX(index, 100)"
                  :y2="getPointY(index, 100)"
                  stroke="#e5e7eb"
                  stroke-width="1"
                />
                <text
                  :x="getPointX(index, 120)"
                  :y="getPointY(index, 120)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  fill="#374151"
                  font-size="14"
                  font-weight="600"
                >
                  {{ skill.name }}
                </text>
                <text
                  :x="getPointX(index, 135)"
                  :y="getPointY(index, 135)"
                  text-anchor="middle"
                  dominant-baseline="middle"
                  fill="#6b7280"
                  font-size="12"
                >
                  {{ skill.value }}%
                </text>
              </g>

              <!-- Data polygon -->
              <polygon
                :points="getDataPolygonPoints()"
                fill="url(#radarGradient)"
                fill-opacity="0.3"
                stroke="#667eea"
                stroke-width="2"
              />

              <!-- Data points -->
              <g v-for="(skill, index) in skills" :key="`point-${index}`">
                <circle
                  :cx="getPointX(index, skill.value)"
                  :cy="getPointY(index, skill.value)"
                  r="5"
                  fill="#667eea"
                  stroke="white"
                  stroke-width="2"
                />
              </g>

              <!-- Gradient definition -->
              <defs>
                <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div class="skill-legend">
            <div 
              v-for="(skill, index) in skills" 
              :key="index"
              class="legend-item"
            >
              <div class="legend-bar">
                <div 
                  class="legend-fill" 
                  :style="{ width: skill.value + '%' }"
                ></div>
              </div>
              <div class="legend-info">
                <span class="legend-name">{{ skill.name }}</span>
                <span class="legend-value">{{ skill.value }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Progress Trends -->
      <div class="chart-card progress-chart-card">
        <div class="card-header">
          <h4>
            <i class="fas fa-chart-line"></i>
            Xu hướng tiến bộ
          </h4>
          <span class="subtitle">6 tuần gần đây</span>
        </div>
        <div class="card-body">
          <div class="progress-chart">
            <svg viewBox="0 0 600 300" class="line-chart">
              <!-- Grid lines -->
              <g class="grid">
                <line v-for="i in 5" :key="`h-${i}`"
                  x1="50" :y1="50 + (i - 1) * 50"
                  x2="550" :y2="50 + (i - 1) * 50"
                  stroke="#f3f4f6" stroke-width="1"
                />
                <line v-for="i in 7" :key="`v-${i}`"
                  :x1="50 + (i - 1) * 83.33" y1="50"
                  :x2="50 + (i - 1) * 83.33" y2="250"
                  stroke="#f3f4f6" stroke-width="1"
                />
              </g>

              <!-- Y-axis labels -->
              <g class="y-labels">
                <text v-for="i in 5" :key="`y-${i}`"
                  x="40" :y="255 - (i - 1) * 50"
                  text-anchor="end" dominant-baseline="middle"
                  fill="#6b7280" font-size="12"
                >
                  {{ (i - 1) * 25 }}
                </text>
              </g>

              <!-- X-axis labels -->
              <g class="x-labels">
                <text v-for="(week, index) in weeklyProgress" :key="`x-${index}`"
                  :x="50 + index * 83.33" y="270"
                  text-anchor="middle"
                  fill="#6b7280" font-size="12"
                >
                  {{ week.label }}
                </text>
              </g>

              <!-- Lines -->
              <g v-for="(subject, sIndex) in progressSubjects" :key="`line-${sIndex}`">
                <path
                  :d="getLinePath(subject.data)"
                  fill="none"
                  :stroke="subject.color"
                  stroke-width="3"
                  stroke-linecap="round"
                />
                <!-- Points -->
                <g v-for="(point, pIndex) in subject.data" :key="`point-${sIndex}-${pIndex}`">
                  <circle
                    :cx="50 + pIndex * 83.33"
                    :cy="250 - point * 2"
                    r="4"
                    :fill="subject.color"
                    stroke="white"
                    stroke-width="2"
                  />
                </g>
              </g>
            </svg>
          </div>
          <div class="progress-legend">
            <div 
              v-for="(subject, index) in progressSubjects" 
              :key="index"
              class="progress-legend-item"
            >
              <div class="legend-dot" :style="{ background: subject.color }"></div>
              <span class="legend-name">{{ subject.name }}</span>
              <span class="legend-trend" :class="subject.trend">
                <i :class="subject.trendIcon"></i>
                {{ subject.trendValue }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- AI Insights & Recommendations -->
      <div class="insights-card">
        <div class="card-header">
          <h4>
            <i class="fas fa-robot"></i>
            Phân tích AI & Gợi ý
          </h4>
          <span class="subtitle">Dựa trên dữ liệu học tập</span>
        </div>
        <div class="card-body">
          <div 
            v-for="(insight, index) in detailedInsights" 
            :key="index"
            class="insight-box"
            :class="insight.type"
          >
            <div class="insight-header">
              <div class="insight-icon">
                <i :class="insight.icon"></i>
              </div>
              <div class="insight-title">{{ insight.title }}</div>
            </div>
            <div class="insight-content">
              <p>{{ insight.description }}</p>
              <div class="insight-actions">
                <button 
                  v-for="(action, aIndex) in insight.actions" 
                  :key="aIndex"
                  @click="handleInsightAction(action)"
                  class="insight-action-btn"
                >
                  <i :class="action.icon"></i>
                  {{ action.label }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Study Habits -->
      <div class="chart-card habits-card">
        <div class="card-header">
          <h4>
            <i class="fas fa-clock"></i>
            Thói quen học tập
          </h4>
          <span class="subtitle">Phân bố thời gian</span>
        </div>
        <div class="card-body">
          <div class="habits-grid">
            <div 
              v-for="(habit, index) in studyHabits" 
              :key="index"
              class="habit-item"
            >
              <div class="habit-icon" :style="{ background: habit.color }">
                <i :class="habit.icon"></i>
              </div>
              <div class="habit-info">
                <div class="habit-label">{{ habit.label }}</div>
                <div class="habit-value">{{ habit.value }}</div>
                <div class="habit-bar">
                  <div 
                    class="habit-fill" 
                    :style="{ width: habit.percentage + '%', background: habit.color }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Achievements -->
      <div class="achievements-card">
        <div class="card-header">
          <h4>
            <i class="fas fa-trophy"></i>
            Thành tựu
          </h4>
          <span class="subtitle">{{ achievements.length }} huy hiệu</span>
        </div>
        <div class="card-body">
          <div class="achievements-grid">
            <div 
              v-for="(achievement, index) in achievements" 
              :key="index"
              class="achievement-item"
              :class="{ locked: !achievement.unlocked }"
            >
              <div class="achievement-badge" :style="{ background: achievement.color }">
                <i :class="achievement.icon"></i>
              </div>
              <div class="achievement-name">{{ achievement.name }}</div>
              <div class="achievement-desc">{{ achievement.description }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const selectedRange = ref('month')

const timeRanges = [
  { value: 'week', label: 'Tuần' },
  { value: 'month', label: 'Tháng' },
  { value: 'semester', label: 'Học kỳ' }
]

const overallStats = ref([
  {
    icon: 'fas fa-graduation-cap',
    value: '8.5',
    label: 'Điểm trung bình',
    change: '+0.5',
    changeType: 'positive',
    changeIcon: 'fas fa-arrow-up',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: 'fas fa-check-circle',
    value: '92%',
    label: 'Bài tập hoàn thành',
    change: '+8%',
    changeType: 'positive',
    changeIcon: 'fas fa-arrow-up',
    gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  {
    icon: 'fas fa-calendar-check',
    value: '95%',
    label: 'Tỷ lệ điểm danh',
    change: '-2%',
    changeType: 'negative',
    changeIcon: 'fas fa-arrow-down',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  },
  {
    icon: 'fas fa-fire',
    value: '28',
    label: 'Chuỗi ngày học',
    change: '+5',
    changeType: 'positive',
    changeIcon: 'fas fa-arrow-up',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  }
])

const skills = ref([
  { name: 'Lý thuyết', value: 85 },
  { name: 'Thực hành', value: 78 },
  { name: 'Tư duy logic', value: 90 },
  { name: 'Làm việc nhóm', value: 75 },
  { name: 'Sáng tạo', value: 82 },
  { name: 'Quản lý thời gian', value: 70 }
])

const weeklyProgress = ref([
  { label: 'T1', week: 1 },
  { label: 'T2', week: 2 },
  { label: 'T3', week: 3 },
  { label: 'T4', week: 4 },
  { label: 'T5', week: 5 },
  { label: 'T6', week: 6 }
])

const progressSubjects = ref([
  {
    name: 'Lập trình Web',
    color: '#667eea',
    data: [75, 78, 82, 85, 88, 90],
    trend: 'up',
    trendIcon: 'fas fa-arrow-up',
    trendValue: '+15%'
  },
  {
    name: 'Mobile Android',
    color: '#3ddc84',
    data: [70, 72, 74, 76, 78, 78],
    trend: 'up',
    trendIcon: 'fas fa-arrow-up',
    trendValue: '+8%'
  },
  {
    name: 'Cơ sở dữ liệu',
    color: '#f59e0b',
    data: [80, 82, 81, 83, 84, 85],
    trend: 'up',
    trendIcon: 'fas fa-arrow-up',
    trendValue: '+5%'
  }
])

const detailedInsights = ref([
  {
    type: 'success',
    icon: 'fas fa-star',
    title: 'Xuất sắc về Lập trình Web',
    description: 'Bạn đang dẫn đầu lớp với điểm 9.0/10. Kỹ năng Vue.js của bạn đặc biệt ấn tượng. Tiếp tục phát huy và có thể chia sẻ kinh nghiệm với bạn bè!',
    actions: [
      { icon: 'fas fa-share', label: 'Chia sẻ kinh nghiệm', action: 'share' },
      { icon: 'fas fa-medal', label: 'Xem thành tựu', action: 'achievements' }
    ]
  },
  {
    type: 'warning',
    icon: 'fas fa-exclamation-triangle',
    title: 'Cần cải thiện Mobile Android',
    description: 'Điểm trung bình môn này (7.8) thấp hơn các môn khác. Phân tích cho thấy bạn gặp khó khăn với State Management và Navigation. Gợi ý: Dành 3-4 buổi tuần này để thực hành.',
    actions: [
      { icon: 'fas fa-book', label: 'Tài liệu tham khảo', action: 'materials' },
      { icon: 'fas fa-users', label: 'Tìm nhóm học', action: 'study-group' }
    ]
  },
  {
    type: 'info',
    icon: 'fas fa-lightbulb',
    title: 'Tối ưu thời gian học',
    description: 'Dữ liệu cho thấy bạn học tập hiệu quả nhất vào khung giờ 19:00-22:00. Tuy nhiên, bạn đang học quá nhiều vào cuối tuần (20h/tuần). Nên phân bổ đều hơn để tránh kiệt sức.',
    actions: [
      { icon: 'fas fa-calendar', label: 'Xem lịch học đề xuất', action: 'schedule' }
    ]
  }
])

const studyHabits = ref([
  {
    icon: 'fas fa-book-open',
    label: 'Thời gian học',
    value: '24h/tuần',
    percentage: 80,
    color: '#667eea'
  },
  {
    icon: 'fas fa-laptop-code',
    label: 'Thực hành code',
    value: '15h/tuần',
    percentage: 90,
    color: '#10b981'
  },
  {
    icon: 'fas fa-video',
    label: 'Xem video bài giảng',
    value: '6h/tuần',
    percentage: 60,
    color: '#f59e0b'
  },
  {
    icon: 'fas fa-users',
    label: 'Học nhóm',
    value: '3h/tuần',
    percentage: 40,
    color: '#3b82f6'
  }
])

const achievements = ref([
  {
    icon: 'fas fa-fire',
    name: 'Streak Master',
    description: '30 ngày học liên tục',
    unlocked: false,
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  },
  {
    icon: 'fas fa-star',
    name: 'Top Student',
    description: 'Điểm cao nhất lớp',
    unlocked: true,
    color: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
  },
  {
    icon: 'fas fa-code',
    name: 'Code Ninja',
    description: '100 bài tập hoàn thành',
    unlocked: true,
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    icon: 'fas fa-users',
    name: 'Team Player',
    description: 'Tham gia 5 nhóm học',
    unlocked: true,
    color: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
  },
  {
    icon: 'fas fa-book',
    name: 'Bookworm',
    description: 'Đọc 50 tài liệu',
    unlocked: false,
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  },
  {
    icon: 'fas fa-trophy',
    name: 'Perfect Score',
    description: 'Đạt điểm 10',
    unlocked: true,
    color: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
  }
])

// Radar chart calculations
const getPointX = (index, distance) => {
  const angle = (Math.PI * 2 * index) / skills.value.length - Math.PI / 2
  return 200 + Math.cos(angle) * distance
}

const getPointY = (index, distance) => {
  const angle = (Math.PI * 2 * index) / skills.value.length - Math.PI / 2
  return 200 + Math.sin(angle) * distance
}

const getRadarPolygonPoints = (distance) => {
  return skills.value
    .map((_, index) => `${getPointX(index, distance)},${getPointY(index, distance)}`)
    .join(' ')
}

const getDataPolygonPoints = () => {
  return skills.value
    .map((skill, index) => `${getPointX(index, skill.value)},${getPointY(index, skill.value)}`)
    .join(' ')
}

// Line chart calculations
const getLinePath = (data) => {
  return data
    .map((point, index) => {
      const x = 50 + index * 83.33
      const y = 250 - point * 2
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
    })
    .join(' ')
}

const handleInsightAction = (action) => {
  // TODO: Implement action handlers
}
</script>

<style scoped>
.learning-analytics {
  padding: 24px;
}

.analytics-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.analytics-header h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
}

.analytics-header h3 i {
  color: #667eea;
}

.time-range {
  display: flex;
  gap: 8px;
  background: #f9fafb;
  padding: 4px;
  border-radius: 8px;
}

.range-btn {
  padding: 8px 16px;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
}

.range-btn:hover {
  color: #667eea;
}

.range-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 24px;
}

.stat-cards {
  grid-column: span 12;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-card {
  padding: 20px;
  border-radius: 12px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 32px;
  margin-bottom: 12px;
  opacity: 0.9;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 13px;
  opacity: 0.9;
  margin-bottom: 8px;
}

.stat-change {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.stat-change.positive {
  background: rgba(16, 185, 129, 0.3);
}

.stat-change.negative {
  background: rgba(239, 68, 68, 0.3);
}

.chart-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.radar-chart-card {
  grid-column: span 6;
}

.progress-chart-card {
  grid-column: span 6;
}

.habits-card {
  grid-column: span 6;
}

.insights-card {
  grid-column: span 6;
}

.achievements-card {
  grid-column: span 12;
}

.card-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  border-bottom: 1px solid #e5e7eb;
}

.card-header h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
}

.subtitle {
  font-size: 12px;
  color: #6b7280;
}

.card-body {
  padding: 24px;
}

.radar-container {
  max-width: 400px;
  margin: 0 auto 24px;
}

.skill-legend {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.legend-bar {
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
}

.legend-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.3s;
}

.legend-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.legend-name {
  color: #374151;
  font-weight: 600;
}

.legend-value {
  color: #667eea;
  font-weight: 700;
}

.progress-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 16px;
}

.progress-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-trend {
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.legend-trend.up {
  color: #10b981;
}

.legend-trend.down {
  color: #ef4444;
}

.insight-box {
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  border-left: 4px solid;
}

.insight-box:last-child {
  margin-bottom: 0;
}

.insight-box.success {
  background: #ecfdf5;
  border-color: #10b981;
}

.insight-box.warning {
  background: #fef3c7;
  border-color: #f59e0b;
}

.insight-box.info {
  background: #dbeafe;
  border-color: #3b82f6;
}

.insight-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.insight-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.insight-box.success .insight-icon {
  background: #10b981;
  color: white;
}

.insight-box.warning .insight-icon {
  background: #f59e0b;
  color: white;
}

.insight-box.info .insight-icon {
  background: #3b82f6;
  color: white;
}

.insight-title {
  font-weight: 700;
  color: #1f2937;
  font-size: 15px;
}

.insight-content p {
  margin: 0 0 16px 0;
  color: #374151;
  line-height: 1.6;
  font-size: 14px;
}

.insight-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.insight-action-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
}

.insight-action-btn:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.habits-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.habit-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.habit-icon {
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

.habit-info {
  flex: 1;
}

.habit-label {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.habit-value {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.habit-bar {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.habit-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.achievements-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.achievement-item {
  text-align: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.3s;
}

.achievement-item:not(.locked):hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.achievement-item.locked {
  opacity: 0.5;
  filter: grayscale(100%);
}

.achievement-badge {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  color: white;
  margin: 0 auto 12px;
}

.achievement-name {
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
  font-size: 13px;
}

.achievement-desc {
  font-size: 11px;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .stat-cards,
  .radar-chart-card,
  .progress-chart-card,
  .habits-card,
  .insights-card {
    grid-column: span 12;
  }

  .achievements-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }

  .achievements-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
