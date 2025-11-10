<template>
  <div class="course-registration-chart">
    <!-- Chart Header -->
    <div class="chart-header">
      <div class="header-content">
        <h3 class="chart-title">
          <span class="title-icon">📚</span>
          Tỷ lệ đăng ký môn học
        </h3>
        <div class="chart-controls">
          <select v-model="sortBy" class="sort-select">
            <option value="rate">Tỷ lệ ĐK</option>
            <option value="registered">Số SV</option>
            <option value="subject">Tên môn</option>
          </select>
          <button class="control-btn" @click="refreshChart">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
      <div class="chart-summary">
        <div class="summary-item">
          <span class="summary-label">Trung bình:</span>
          <span class="summary-value">{{ averageRate.toFixed(1) }}%</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Tổng SV:</span>
          <span class="summary-value">{{ totalRegistered.toLocaleString() }}</span>
        </div>
      </div>
    </div>

    <!-- Chart Content -->
    <div class="chart-content">
      <!-- Course Registration Bars -->
      <div class="registration-bars">
        <div v-for="(course, index) in sortedData" 
             :key="course.subject" 
             class="course-item"
             :class="{ 'over-capacity': course.rate > 100, 'warning': course.rate > 95 }"
             @mouseenter="highlightCourse(index)"
             @mouseleave="unhighlightCourse">
          
          <!-- Course Info -->
          <div class="course-info">
            <div class="course-header">
              <h4 class="course-name">{{ course.subject }}</h4>
              <div class="course-status" :class="getStatusClass(course.rate)">
                <i :class="getStatusIcon(course.rate)" class="status-icon"></i>
                <span class="status-text">{{ getStatusText(course.rate) }}</span>
              </div>
            </div>
            
            <div class="course-stats">
              <div class="stat-group">
                <span class="stat-label">Đã ĐK:</span>
                <span class="stat-value">{{ course.registered.toLocaleString() }}</span>
              </div>
              <div class="stat-group">
                <span class="stat-label">Sức chứa:</span>
                <span class="stat-value">{{ course.capacity.toLocaleString() }}</span>
              </div>
              <div class="stat-group">
                <span class="stat-label">Tỷ lệ:</span>
                <span class="stat-value" :class="getRateClass(course.rate)">
                  {{ course.rate.toFixed(1) }}%
                </span>
              </div>
            </div>
          </div>
          
          <!-- Progress Visualization -->
          <div class="progress-visualization">
            <!-- Background track -->
            <div class="progress-track">
              <div class="capacity-line"></div>
              
              <!-- Animated progress bar -->
              <div class="progress-bar" 
                   :style="{ 
                     width: Math.min(course.rate, 100) + '%',
                     background: getProgressGradient(course.rate),
                     animationDelay: `${index * 0.1}s`
                   }">
                <div class="progress-glow"></div>
                <div class="progress-pattern"></div>
              </div>
              
              <!-- Over-capacity indicator -->
              <div v-if="course.rate > 100" 
                   class="over-capacity-bar"
                   :style="{ 
                     width: Math.min(course.rate - 100, 20) + '%',
                     animationDelay: `${index * 0.1 + 0.5}s`
                   }">
              </div>
            </div>
            
            <!-- Progress labels -->
            <div class="progress-labels">
              <div class="label-group">
                <span class="progress-percentage">{{ course.rate.toFixed(1) }}%</span>
              </div>
              <div class="remaining-slots" v-if="course.rate < 100">
                <span class="remaining-text">
                  Còn {{ course.capacity - course.registered }} slots
                </span>
              </div>
              <div class="overflow-slots" v-else>
                <span class="overflow-text">
                  Vượt {{ course.registered - course.capacity }} SV
                </span>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="course-actions">
            <button v-if="course.rate > 100" class="action-btn critical" @click="handleCriticalAction(course)">
              <i class="fas fa-exclamation-triangle"></i>
              Cần mở lớp
            </button>
            <button v-else-if="course.rate > 95" class="action-btn warning" @click="handleWarningAction(course)">
              <i class="fas fa-eye"></i>
              Theo dõi
            </button>
            <button v-else class="action-btn normal" @click="handleNormalAction(course)">
              <i class="fas fa-chart-line"></i>
              Chi tiết
            </button>
          </div>
          
          <!-- Hover Details -->
          <div class="hover-details">
            <div class="detail-item">
              <i class="fas fa-users"></i>
              <span>{{ course.registered }} / {{ course.capacity }} sinh viên</span>
            </div>
            <div class="detail-item">
              <i class="fas fa-percentage"></i>
              <span>Tỷ lệ đăng ký: {{ course.rate.toFixed(1) }}%</span>
            </div>
            <div class="detail-item" v-if="course.rate < 100">
              <i class="fas fa-clock"></i>
              <span>Còn {{ course.capacity - course.registered }} chỗ trống</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Footer -->
    <div class="chart-footer">
      <div class="footer-legend">
        <div class="legend-item">
          <div class="legend-color normal"></div>
          <span>Bình thường (&lt;95%)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color warning"></div>
          <span>Cảnh báo (95-100%)</span>
        </div>
        <div class="legend-item">
          <div class="legend-color critical"></div>
          <span>Vượt sức chứa (&gt;100%)</span>
        </div>
      </div>
      
      <div class="footer-actions">
        <button class="footer-btn" @click="exportData">
          <i class="fas fa-download"></i>
          Xuất dữ liệu
        </button>
        <button class="footer-btn" @click="openDetailView">
          <i class="fas fa-expand"></i>
          Xem chi tiết
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'CourseRegistrationChart',
  props: {
    data: {
      type: Array,
      default: () => [
        { subject: 'Lập trình Web', registered: 156, capacity: 160, rate: 97.5 },
        { subject: 'Cơ sở dữ liệu', registered: 145, capacity: 150, rate: 96.7 },
        { subject: 'Mạng máy tính', registered: 134, capacity: 140, rate: 95.7 },
        { subject: 'AI cơ bản', registered: 189, capacity: 180, rate: 105.0 },
        { subject: 'Mobile Development', registered: 98, capacity: 120, rate: 81.7 },
        { subject: 'DevOps', registered: 67, capacity: 80, rate: 83.8 }
      ]
    }
  },
  setup(props) {
    const sortBy = ref('rate')
    const hoveredCourse = ref(null)
    
    const chartData = computed(() => props.data)
    
    const sortedData = computed(() => {
      const sorted = [...chartData.value]
      switch (sortBy.value) {
        case 'rate':
          return sorted.sort((a, b) => b.rate - a.rate)
        case 'registered':
          return sorted.sort((a, b) => b.registered - a.registered)
        case 'subject':
          return sorted.sort((a, b) => a.subject.localeCompare(b.subject))
        default:
          return sorted
      }
    })
    
    const averageRate = computed(() => {
      const sum = chartData.value.reduce((acc, course) => acc + course.rate, 0)
      return sum / chartData.value.length
    })
    
    const totalRegistered = computed(() => {
      return chartData.value.reduce((acc, course) => acc + course.registered, 0)
    })
    
    // Status helpers
    const getStatusClass = (rate) => {
      if (rate > 100) return 'critical'
      if (rate > 95) return 'warning'
      return 'normal'
    }
    
    const getStatusIcon = (rate) => {
      if (rate > 100) return 'fas fa-exclamation-triangle'
      if (rate > 95) return 'fas fa-exclamation-circle'
      return 'fas fa-check-circle'
    }
    
    const getStatusText = (rate) => {
      if (rate > 100) return 'Vượt sức chứa'
      if (rate > 95) return 'Sắp đầy'
      return 'Bình thường'
    }
    
    const getRateClass = (rate) => {
      if (rate > 100) return 'critical'
      if (rate > 95) return 'warning'
      return 'normal'
    }
    
    const getProgressGradient = (rate) => {
      if (rate > 100) {
        return 'linear-gradient(90deg, #ef4444, #dc2626)'
      }
      if (rate > 95) {
        return 'linear-gradient(90deg, #f59e0b, #d97706)'
      }
      return 'linear-gradient(90deg, #10b981, #059669)'
    }
    
    // Event handlers
    const highlightCourse = (index) => {
      hoveredCourse.value = index
    }
    
    const unhighlightCourse = () => {
      hoveredCourse.value = null
    }
    
    const refreshChart = () => {
      console.log('Refreshing registration chart...')
    }
    
    const handleCriticalAction = (course) => {
      console.log('Opening new class for:', course.subject)
    }
    
    const handleWarningAction = (course) => {
      console.log('Monitoring course:', course.subject)
    }
    
    const handleNormalAction = (course) => {
      console.log('View details for:', course.subject)
    }
    
    const exportData = () => {
      console.log('Exporting registration data...')
    }
    
    const openDetailView = () => {
      console.log('Opening detailed view...')
    }
    
    return {
      sortBy,
      hoveredCourse,
      chartData,
      sortedData,
      averageRate,
      totalRegistered,
      getStatusClass,
      getStatusIcon,
      getStatusText,
      getRateClass,
      getProgressGradient,
      highlightCourse,
      unhighlightCourse,
      refreshChart,
      handleCriticalAction,
      handleWarningAction,
      handleNormalAction,
      exportData,
      openDetailView
    }
  }
}
</script>

<style scoped>
.course-registration-chart {
  background: white;
  border-radius: 16px;
  padding: 24px;
  height: 400px;
  display: flex;
  flex-direction: column;
}

/* Chart Header */
.chart-header {
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
}

.title-icon {
  font-size: 20px;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sort-select {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  font-size: 12px;
  color: #374151;
}

.control-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #f8fafc;
  color: #374151;
}

.chart-summary {
  display: flex;
  gap: 24px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.summary-label {
  font-size: 12px;
  color: #64748b;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

/* Chart Content */
.chart-content {
  flex: 1;
  overflow-y: auto;
}

.registration-bars {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Course Item */
.course-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.course-item:hover {
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border-color: #c7d2fe;
}

.course-item.warning {
  background: linear-gradient(135deg, #fffbeb, #fef3c7);
  border-color: #f59e0b;
}

.course-item.over-capacity {
  background: linear-gradient(135deg, #fef2f2, #fecaca);
  border-color: #ef4444;
}

/* Course Info */
.course-info {
  min-width: 200px;
}

.course-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.course-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
}

.course-status {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.course-status.normal {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
  color: #166534;
}

.course-status.warning {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
}

.course-status.critical {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  color: #991b1b;
}

.status-icon {
  font-size: 10px;
}

.course-stats {
  display: flex;
  gap: 16px;
}

.stat-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.stat-value.normal { color: #059669; }
.stat-value.warning { color: #d97706; }
.stat-value.critical { color: #dc2626; }

/* Progress Visualization */
.progress-visualization {
  flex: 1;
  margin: 0 16px;
}

.progress-track {
  position: relative;
  height: 12px;
  background: #f1f5f9;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.capacity-line {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #64748b;
  opacity: 0.5;
}

.progress-bar {
  position: relative;
  height: 100%;
  border-radius: 6px;
  animation: progressGrow 1s ease-out forwards;
  overflow: hidden;
}

@keyframes progressGrow {
  from { width: 0% !important; }
}

.progress-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: inherit;
  border-radius: inherit;
  opacity: 0.3;
  filter: blur(4px);
  z-index: -1;
}

.progress-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 25%,
    rgba(255, 255, 255, 0.1) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 50%,
    transparent 75%,
    rgba(255, 255, 255, 0.1) 75%
  );
  background-size: 8px 8px;
  animation: movePattern 1s linear infinite;
}

@keyframes movePattern {
  0% { background-position: 0 0; }
  100% { background-position: 8px 8px; }
}

.over-capacity-bar {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  background: linear-gradient(90deg, #ef4444, #dc2626);
  border-radius: 0 6px 6px 0;
  animation: overCapacityGrow 1s ease-out forwards;
}

@keyframes overCapacityGrow {
  from { width: 0% !important; }
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.progress-percentage {
  font-size: 12px;
  font-weight: 700;
  color: #2d3748;
}

.remaining-text,
.overflow-text {
  font-size: 11px;
  font-weight: 500;
}

.remaining-text {
  color: #059669;
}

.overflow-text {
  color: #dc2626;
}

/* Course Actions */
.course-actions {
  min-width: 100px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.action-btn.normal {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
  color: #3730a3;
}

.action-btn.warning {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: #92400e;
}

.action-btn.critical {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
  color: #991b1b;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Hover Details */
.hover-details {
  position: absolute;
  top: 100%;
  left: 16px;
  right: 16px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 8px;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 10;
}

.course-item:hover .hover-details {
  opacity: 1;
  transform: translateY(0);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  margin-bottom: 4px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-item i {
  width: 12px;
  opacity: 0.8;
}

/* Chart Footer */
.chart-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #64748b;
}

.legend-color {
  width: 12px;
  height: 8px;
  border-radius: 2px;
}

.legend-color.normal {
  background: linear-gradient(90deg, #10b981, #059669);
}

.legend-color.warning {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.legend-color.critical {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.footer-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 6px;
  font-size: 11px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.footer-btn:hover {
  background: #f8fafc;
  color: #374151;
}

/* Responsive */
@media (max-width: 768px) {
  .course-item {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .course-info {
    min-width: auto;
  }
  
  .progress-visualization {
    margin: 0;
  }
  
  .footer-legend {
    flex-direction: column;
    gap: 8px;
  }
}
</style>