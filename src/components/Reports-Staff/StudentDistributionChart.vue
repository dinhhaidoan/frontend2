<template>
  <div class="student-distribution-chart">
    <!-- Chart Header -->
    <div class="chart-header">
      <div class="header-content">
        <h3 class="chart-title">
          <span class="title-icon">👥</span>
          Phân bố sinh viên theo khóa/ngành
        </h3>
        <div class="chart-controls">
          <button class="control-btn" @click="toggleView">
            <i :class="viewMode === 'pie' ? 'fas fa-chart-bar' : 'fas fa-chart-pie'"></i>
          </button>
          <button class="control-btn" @click="refreshChart">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>
      <p class="chart-subtitle">Tổng: {{ totalStudents.toLocaleString() }} sinh viên</p>
    </div>

    <!-- Chart Content -->
    <div class="chart-content">
      <!-- Pie Chart View -->
      <div v-if="viewMode === 'pie'" class="pie-chart-container">
        <div class="pie-chart-main">
          <svg class="pie-svg" viewBox="0 0 200 200">
            <defs>
              <!-- Gradients for each segment -->
              <radialGradient v-for="(item, index) in chartData" :key="`grad-${index}`" 
                              :id="`gradient-${index}`" cx="50%" cy="30%">
                <stop offset="0%" :stop-color="lightenColor(item.color, 20)"/>
                <stop offset="100%" :stop-color="item.color"/>
              </radialGradient>
              
              <!-- Glow filter -->
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            
            <!-- Pie segments -->
            <g class="pie-segments">
              <path v-for="(segment, index) in pieSegments" 
                    :key="index"
                    :d="segment.path"
                    :fill="`url(#gradient-${index})`"
                    :class="`pie-segment segment-${index}`"
                    :style="{ animationDelay: `${index * 0.2}s` }"
                    filter="url(#glow)"
                    @mouseenter="highlightSegment(index)"
                    @mouseleave="unhighlightSegment"
                    @click="selectSegment(index)"/>
            </g>
            
            <!-- Center circle -->
            <circle cx="100" cy="100" r="35" 
                    fill="url(#centerGradient)" 
                    class="center-circle"/>
            
            <!-- Center gradient -->
            <defs>
              <radialGradient id="centerGradient" cx="50%" cy="30%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="100%" stop-color="#f8fafc"/>
              </radialGradient>
            </defs>
            
            <!-- Center text -->
            <text x="100" y="95" text-anchor="middle" class="center-text-main">{{ totalStudents.toLocaleString() }}</text>
            <text x="100" y="110" text-anchor="middle" class="center-text-sub">Sinh viên</text>
          </svg>
          
          <!-- Hover tooltip -->
          <div v-if="hoveredSegment !== null" class="segment-tooltip" :style="tooltipStyle">
            <div class="tooltip-content">
              <div class="tooltip-header">
                <div class="tooltip-color" :style="{ backgroundColor: chartData[hoveredSegment].color }"></div>
                <span class="tooltip-title">{{ chartData[hoveredSegment].name }}</span>
              </div>
              <div class="tooltip-stats">
                <div class="tooltip-value">{{ chartData[hoveredSegment].value.toLocaleString() }} SV</div>
                <div class="tooltip-percentage">{{ getPercentage(chartData[hoveredSegment].value) }}%</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Legend -->
        <div class="chart-legend">
          <div v-for="(item, index) in chartData" 
               :key="index" 
               class="legend-item"
               :class="{ active: selectedSegment === index }"
               @click="selectSegment(index)">
            <div class="legend-marker" :style="{ backgroundColor: item.color }">
              <div class="marker-shine"></div>
            </div>
            <div class="legend-content">
              <div class="legend-name">{{ item.name }}</div>
              <div class="legend-stats">
                <span class="legend-value">{{ item.value.toLocaleString() }}</span>
                <span class="legend-percentage">{{ getPercentage(item.value) }}%</span>
              </div>
            </div>
            <div class="legend-trend">
              <i class="fas fa-arrow-up trend-icon"></i>
              <span class="trend-value">+12%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bar Chart View -->
      <div v-else class="bar-chart-container">
        <div class="bar-chart">
          <div class="chart-area">
            <!-- Y-axis labels -->
            <div class="y-axis">
              <div v-for="tick in yAxisTicks" :key="tick" class="y-tick">
                <span class="tick-label">{{ tick }}</span>
                <div class="tick-line"></div>
              </div>
            </div>
            
            <!-- Bars container -->
            <div class="bars-container">
              <div v-for="(item, index) in chartData" 
                   :key="index" 
                   class="bar-item"
                   @mouseenter="highlightBar(index)"
                   @mouseleave="unhighlightBar">
                
                <div class="bar-wrapper">
                  <div class="bar" 
                       :style="{ 
                         height: getBarHeight(item.value),
                         background: `linear-gradient(180deg, ${lightenColor(item.color, 10)}, ${item.color})`,
                         animationDelay: `${index * 0.1}s`
                       }">
                    <div class="bar-glow" :style="{ backgroundColor: item.color }"></div>
                    <div class="bar-value">{{ item.value.toLocaleString() }}</div>
                  </div>
                </div>
                
                <div class="bar-label">{{ item.name.replace(' K', '\nK') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Chart Footer Stats -->
    <div class="chart-footer">
      <div class="footer-stats">
        <div class="stat-item">
          <span class="stat-label">Tăng trưởng:</span>
          <span class="stat-value positive">+8.5%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Khóa lớn nhất:</span>
          <span class="stat-value">{{ largestCohort.name }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Xu hướng:</span>
          <span class="stat-value trending">📈 Tăng</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'StudentDistributionChart',
  props: {
    data: {
      type: Array,
      default: () => [
        { label: 'Khóa 2021', value: 850, percentage: 26.5 },
        { label: 'Khóa 2022', value: 920, percentage: 28.7 },
        { label: 'Khóa 2023', value: 780, percentage: 24.3 },
        { label: 'Khóa 2024', value: 660, percentage: 20.5 }
      ]
    }
  },
  setup(props) {
    const viewMode = ref('pie') // 'pie' or 'bar'
    const hoveredSegment = ref(null)
    const selectedSegment = ref(null)
    const tooltipStyle = ref({})
    
    const chartData = computed(() => props.data)
    const totalStudents = computed(() => chartData.value.reduce((sum, item) => sum + item.value, 0))
    
    // Pie chart calculations
    const pieSegments = computed(() => {
      let currentAngle = 0
      const total = totalStudents.value
      
      return chartData.value.map(item => {
        const percentage = (item.value / total) * 100
        const angle = (percentage / 100) * 360
        
        const startAngle = currentAngle
        const endAngle = currentAngle + angle
        
        // Convert to radians
        const startRadian = (startAngle * Math.PI) / 180
        const endRadian = (endAngle * Math.PI) / 180
        
        // Calculate path
        const largeArcFlag = angle > 180 ? 1 : 0
        const x1 = 100 + 65 * Math.cos(startRadian)
        const y1 = 100 + 65 * Math.sin(startRadian)
        const x2 = 100 + 65 * Math.cos(endRadian)
        const y2 = 100 + 65 * Math.sin(endRadian)
        
        const path = [
          `M 100 100`,
          `L ${x1} ${y1}`,
          `A 65 65 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `Z`
        ].join(' ')
        
        currentAngle = endAngle
        
        return { path, percentage, angle }
      })
    })
    
    // Bar chart calculations
    const maxValue = computed(() => Math.max(...chartData.value.map(item => item.value)))
    const yAxisTicks = computed(() => {
      const max = maxValue.value
      const step = Math.ceil(max / 5 / 100) * 100
      return Array.from({ length: 6 }, (_, i) => i * step)
    })
    
    const getBarHeight = (value) => {
      const percentage = (value / maxValue.value) * 80 // 80% of container height
      return `${percentage}%`
    }
    
    // Utility functions
    const getPercentage = (value) => {
      return Math.round((value / totalStudents.value) * 100)
    }
    
    const lightenColor = (color, amount) => {
      const usePound = false
      const col = color[0] === '#' ? color.slice(1) : color
      const num = parseInt(col, 16)
      let r = (num >> 16) + amount
      let b = (num >> 8 & 0x00FF) + amount
      let g = (num & 0x0000FF) + amount
      r = r > 255 ? 255 : r < 0 ? 0 : r
      b = b > 255 ? 255 : b < 0 ? 0 : b
      g = g > 255 ? 255 : g < 0 ? 0 : g
      return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16)
    }
    
    const largestCohort = computed(() => {
      if (chartData.value.length === 0) {
        return { label: 'N/A', value: 0, percentage: 0 }
      }
      return chartData.value.reduce((prev, current) => 
        (prev.value > current.value) ? prev : current
      )
    })
    
    // Event handlers
    const toggleView = () => {
      viewMode.value = viewMode.value === 'pie' ? 'bar' : 'pie'
    }
    
    const refreshChart = () => {
      // Animation refresh logic
      console.log('Refreshing chart...')
    }
    
    const highlightSegment = (index) => {
      hoveredSegment.value = index
    }
    
    const unhighlightSegment = () => {
      hoveredSegment.value = null
    }
    
    const selectSegment = (index) => {
      selectedSegment.value = selectedSegment.value === index ? null : index
    }
    
    const highlightBar = (index) => {
      hoveredSegment.value = index
    }
    
    const unhighlightBar = () => {
      hoveredSegment.value = null
    }
    
    return {
      viewMode,
      hoveredSegment,
      selectedSegment,
      tooltipStyle,
      chartData,
      totalStudents,
      pieSegments,
      yAxisTicks,
      largestCohort,
      getPercentage,
      getBarHeight,
      lightenColor,
      toggleView,
      refreshChart,
      highlightSegment,
      unhighlightSegment,
      selectSegment,
      highlightBar,
      unhighlightBar
    }
  }
}
</script>

<style scoped>
.student-distribution-chart {
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
  margin-bottom: 8px;
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
  gap: 8px;
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

.chart-subtitle {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

/* Chart Content */
.chart-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Pie Chart */
.pie-chart-container {
  display: flex;
  gap: 24px;
  align-items: center;
  width: 100%;
  height: 100%;
}

.pie-chart-main {
  position: relative;
  width: 200px;
  height: 200px;
}

.pie-svg {
  width: 100%;
  height: 100%;
}

.pie-segment {
  cursor: pointer;
  transition: all 0.3s ease;
  animation: segmentGrow 0.8s ease-out forwards;
  transform-origin: center;
}

.pie-segment:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

@keyframes segmentGrow {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.center-circle {
  animation: centerPulse 2s ease-in-out infinite;
}

@keyframes centerPulse {
  0%, 100% { r: 35; }
  50% { r: 37; }
}

.center-text-main {
  font-size: 14px;
  font-weight: 700;
  fill: #2d3748;
}

.center-text-sub {
  font-size: 10px;
  fill: #64748b;
}

/* Tooltip */
.segment-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px;
  border-radius: 8px;
  pointer-events: none;
  z-index: 10;
  min-width: 120px;
}

.tooltip-content {
  text-align: left;
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.tooltip-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.tooltip-title {
  font-size: 12px;
  font-weight: 600;
}

.tooltip-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tooltip-value {
  font-size: 14px;
  font-weight: 700;
}

.tooltip-percentage {
  font-size: 12px;
  opacity: 0.8;
}

/* Legend */
.chart-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 200px;
  overflow-y: auto;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.legend-item:hover {
  background: #f8fafc;
}

.legend-item.active {
  background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
}

.legend-marker {
  position: relative;
  width: 16px;
  height: 16px;
  border-radius: 4px;
  overflow: hidden;
}

.marker-shine {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(255,255,255,0.6), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { transform: translateX(-100%) translateY(-100%); }
  50% { transform: translateX(100%) translateY(100%); }
  100% { transform: translateX(-100%) translateY(-100%); }
}

.legend-content {
  flex: 1;
}

.legend-name {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.legend-stats {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 2px;
}

.legend-value {
  font-size: 12px;
  font-weight: 700;
  color: #2d3748;
}

.legend-percentage {
  font-size: 11px;
  color: #64748b;
}

.legend-trend {
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-icon {
  color: #10b981;
  font-size: 10px;
}

.trend-value {
  font-size: 11px;
  font-weight: 600;
  color: #10b981;
}

/* Bar Chart */
.bar-chart-container {
  width: 100%;
  height: 100%;
}

.bar-chart {
  width: 100%;
  height: 100%;
  padding: 0 20px;
}

.chart-area {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
}

.y-axis {
  display: flex;
  flex-direction: column-reverse;
  justify-content: space-between;
  height: 100%;
  width: 40px;
  padding-right: 10px;
}

.y-tick {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tick-label {
  font-size: 10px;
  color: #9ca3af;
  text-align: right;
  min-width: 30px;
}

.tick-line {
  width: 100%;
  height: 1px;
  background: #e5e7eb;
}

.bars-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: space-around;
  height: 100%;
  padding: 0 10px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 60px;
  height: 100%;
}

.bar-wrapper {
  position: relative;
  width: 100%;
  height: 80%;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.bar {
  position: relative;
  width: 32px;
  border-radius: 6px 6px 0 0;
  min-height: 5px;
  animation: barGrow 1s ease-out forwards;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bar:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

@keyframes barGrow {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.bar-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: inherit;
  opacity: 0.3;
  filter: blur(4px);
  z-index: -1;
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 600;
  color: #374151;
  background: white;
  padding: 2px 4px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.bar-label {
  margin-top: 8px;
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
  text-align: center;
  line-height: 1.2;
  white-space: pre-line;
}

/* Chart Footer */
.chart-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.footer-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}

.stat-value {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
}

.stat-value.positive {
  color: #10b981;
}

.stat-value.trending {
  color: #f59e0b;
}

/* Responsive */
@media (max-width: 768px) {
  .pie-chart-container {
    flex-direction: column;
    gap: 16px;
  }
  
  .pie-chart-main {
    width: 150px;
    height: 150px;
  }
  
  .footer-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style>