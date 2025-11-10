<template>
  <div class="reports-page">
    <!-- Header Section -->
    <div class="reports-header">
      <div class="header-content">
        <div class="header-info">
          <h1 class="page-title">
            <span class="title-icon">📈</span>
            Thống kê & Báo cáo
          </h1>
          <p class="page-subtitle">
            Phân tích chi tiết hoạt động giảng dạy - Học kỳ {{ currentSemester }}
          </p>
        </div>
        
        <div class="header-actions">
          <div class="time-info">
            <div class="current-time">{{ currentTime }}</div>
            <div class="current-date">{{ currentDate }}</div>
          </div>
          
          <div class="action-buttons">
            <button class="action-btn filter" @click="showFilters = !showFilters">
              <i class="fas fa-filter"></i>
              <span>Bộ lọc</span>
            </button>
            
            <button class="action-btn export" @click="exportReport">
              <i class="fas fa-file-export"></i>
              <span>Xuất báo cáo</span>
            </button>
            
            <button class="action-btn refresh" @click="refreshData" :disabled="isRefreshing">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': isRefreshing }"></i>
              <span>Làm mới</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Filter Panel -->
      <transition name="slide-down">
        <div v-if="showFilters" class="filter-panel">
          <div class="filter-group">
            <label>Khoảng thời gian:</label>
            <select v-model="filters.timeRange" class="filter-select">
              <option value="today">Hôm nay</option>
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="semester">Học kỳ này</option>
              <option value="year">Năm học này</option>
              <option value="custom">Tùy chỉnh</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Khoa/Bộ môn:</label>
            <select v-model="filters.department" class="filter-select">
              <option value="all">Tất cả</option>
              <option value="cntt">Công nghệ thông tin</option>
              <option value="dtvt">Điện tử viễn thông</option>
              <option value="ktmt">Kỹ thuật máy tính</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label>Loại báo cáo:</label>
            <select v-model="filters.reportType" class="filter-select">
              <option value="all">Tất cả</option>
              <option value="students">Sinh viên</option>
              <option value="teachers">Giảng viên</option>
              <option value="courses">Học phần</option>
              <option value="performance">Hiệu suất</option>
            </select>
          </div>
          
          <button class="apply-filter-btn" @click="applyFilters">
            <i class="fas fa-check"></i>
            Áp dụng
          </button>
        </div>
      </transition>
    </div>

    <!-- Summary Stats Section -->
    <div class="summary-section">
      <h2 class="section-title">
        <i class="fas fa-chart-line"></i>
        Tổng quan số liệu
      </h2>
      
      <div class="summary-grid">
        <div class="summary-card card-primary clickable" @click="showSubjectsModal = true">
          <div class="card-icon">
            <i class="fas fa-book"></i>
          </div>
          <div class="card-content">
            <div class="card-label">Tổng số môn học</div>
            <div class="card-value" ref="subjectsValue">{{ summaryStats.totalSubjects }}</div>
            <div class="card-trend positive">
              <i class="fas fa-arrow-up"></i>
              <span>+12% so với kỳ trước</span>
            </div>
          </div>
          <div class="card-sparkline">
            <svg viewBox="0 0 100 30" class="sparkline-svg">
              <polyline
                :points="generateSparkline([20, 25, 22, 30, 28, 35, 32, 38])"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </div>
          <div class="card-click-hint">
            <i class="fas fa-mouse-pointer"></i>
            <span>Click để xem chi tiết</span>
          </div>
        </div>

        <div class="summary-card card-success clickable" @click="showCoursesModal = true">
          <div class="card-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <div class="card-content">
            <div class="card-label">Học phần đang mở</div>
            <div class="card-value" ref="coursesValue">{{ summaryStats.totalCourses }}</div>
            <div class="card-trend positive">
              <i class="fas fa-arrow-up"></i>
              <span>+8.5% tăng trưởng</span>
            </div>
          </div>
          <div class="card-sparkline">
            <svg viewBox="0 0 100 30" class="sparkline-svg">
              <polyline
                :points="generateSparkline([45, 48, 50, 52, 49, 55, 58, 62])"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </div>
          <div class="card-click-hint">
            <i class="fas fa-mouse-pointer"></i>
            <span>Click để xem chi tiết</span>
          </div>
        </div>

        <div class="summary-card card-info">
          <div class="card-icon">
            <i class="fas fa-chalkboard-teacher"></i>
          </div>
          <div class="card-content">
            <div class="card-label">Giảng viên đang dạy</div>
            <div class="card-value" ref="teachersValue">{{ summaryStats.activeTeachers }}</div>
            <div class="card-trend positive">
              <i class="fas fa-arrow-up"></i>
              <span>+3 giảng viên mới</span>
            </div>
          </div>
          <div class="card-sparkline">
            <svg viewBox="0 0 100 30" class="sparkline-svg">
              <polyline
                :points="generateSparkline([30, 32, 31, 33, 35, 34, 36, 38])"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </div>
        </div>

        <div class="summary-card card-warning">
          <div class="card-icon">
            <i class="fas fa-user-graduate"></i>
          </div>
          <div class="card-content">
            <div class="card-label">Sinh viên đang học</div>
            <div class="card-value" ref="studentsValue">{{ summaryStats.totalStudents }}</div>
            <div class="card-trend positive">
              <i class="fas fa-arrow-up"></i>
              <span>+156 sinh viên mới</span>
            </div>
          </div>
          <div class="card-sparkline">
            <svg viewBox="0 0 100 30" class="sparkline-svg">
              <polyline
                :points="generateSparkline([800, 820, 850, 880, 900, 920, 950, 1012])"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </div>
        </div>

        <div class="summary-card card-purple">
          <div class="card-icon">
            <i class="fas fa-tasks"></i>
          </div>
          <div class="card-content">
            <div class="card-label">Tiến độ hoàn thành</div>
            <div class="card-value" ref="completionValue">{{ summaryStats.completionRate }}%</div>
            <div class="card-trend positive">
              <i class="fas fa-arrow-up"></i>
              <span>+5.2% tiến độ</span>
            </div>
          </div>
          <div class="card-sparkline">
            <svg viewBox="0 0 100 30" class="sparkline-svg">
              <polyline
                :points="generateSparkline([65, 68, 70, 73, 75, 78, 80, 82.5])"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Charts Section -->
    <div class="charts-section">
      <div class="charts-container">
        
        <!-- Student Distribution Analysis -->
        <div class="chart-card full-width">
          <div class="chart-header">
            <h3 class="chart-title">
              <i class="fas fa-chart-pie"></i>
              Phân bố sinh viên theo khóa học
            </h3>
            <div class="chart-controls">
              <button 
                class="chart-view-btn" 
                :class="{ active: studentChartView === 'pie' }"
                @click="studentChartView = 'pie'"
              >
                <i class="fas fa-chart-pie"></i>
              </button>
              <button 
                class="chart-view-btn" 
                :class="{ active: studentChartView === 'bar' }"
                @click="studentChartView = 'bar'"
              >
                <i class="fas fa-chart-bar"></i>
              </button>
              <button 
                class="chart-view-btn" 
                :class="{ active: studentChartView === 'line' }"
                @click="studentChartView = 'line'"
              >
                <i class="fas fa-chart-line"></i>
              </button>
            </div>
          </div>
          <div class="chart-body">
            <StudentDistributionChart 
              :data="studentDistributionData"
              :view="studentChartView"
            />
          </div>
        </div>

        <!-- Course Registration Analysis -->
        <div class="chart-card full-width">
          <div class="chart-header">
            <h3 class="chart-title">
              <i class="fas fa-clipboard-list"></i>
              Tỷ lệ đăng ký học phần
            </h3>
          </div>
          <div class="chart-body">
            <CourseRegistrationChart :data="courseRegistrationData" />
          </div>
        </div>

      </div>
    </div>

    <!-- Summary Statistics Table -->
    <div class="summary-table-section">
      <h2 class="section-title">
        <i class="fas fa-table"></i>
        Số học phần theo giảng viên
      </h2>
      
      <div class="summary-tables-grid">
        
        <!-- Teacher Subjects Summary - Số học phần theo giảng viên -->
        <div class="summary-table-card full-width-table">
          <div class="table-card-header">
            <h3><i class="fas fa-chalkboard-teacher"></i> Danh sách giảng viên và số học phần phụ trách</h3>
          </div>
          <div class="table-card-body">
            <table class="summary-table">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Giảng viên</th>
                  <th>Số học phần</th>
                  <th>Sinh viên</th>
                  <th>Giờ giảng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(teacher, index) in topTeachers" :key="teacher.id">
                  <td class="text-center">{{ index + 1 }}</td>
                  <td class="teacher-name">{{ teacher.name }}</td>
                  <td class="text-center"><strong>{{ teacher.subjects }}</strong> môn</td>
                  <td class="text-center">{{ teacher.students }}</td>
                  <td class="text-center">{{ teacher.hours }}h</td>
                  <td class="text-center">
                    <span class="status-badge good">Đang giảng dạy</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- Footer Info -->
    <div class="reports-footer">
      <div class="footer-info">
        <div class="info-item">
          <i class="fas fa-database"></i>
          <span>{{ totalRecords }} bản ghi</span>
        </div>
        <div class="info-item">
          <i class="fas fa-clock"></i>
          <span>Cập nhật: {{ lastUpdateTime }}</span>
        </div>
        <div class="info-item">
          <i class="fas fa-file-alt"></i>
          <span>Báo cáo: {{ generatedReports }} file</span>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    </transition>

    <!-- Modals -->
    <SubjectsListModal v-if="showSubjectsModal" @close="showSubjectsModal = false" />
    <CoursesListModal v-if="showCoursesModal" @close="showCoursesModal = false" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import StudentDistributionChart from '@/components/Reports-Staff/StudentDistributionChart.vue'
import CourseRegistrationChart from '@/components/Reports-Staff/CourseRegistrationChart.vue'
import SubjectsListModal from '@/components/Reports-Staff/SubjectsListModal.vue'
import CoursesListModal from '@/components/Reports-Staff/CoursesListModal.vue'

// Time display
const currentTime = ref('')
const currentDate = ref('')
const currentSemester = ref('1 - 2024/2025')

// UI States
const showFilters = ref(false)
const isRefreshing = ref(false)
const isLoading = ref(false)
const studentChartView = ref('pie')
const showSubjectsModal = ref(false)
const showCoursesModal = ref(false)

// Filters
const filters = ref({
  timeRange: 'semester',
  department: 'all',
  reportType: 'all'
})

// Summary Statistics
const summaryStats = ref({
  totalSubjects: 38,
  totalCourses: 62,
  activeTeachers: 45,
  totalStudents: 1012,
  completionRate: 82.5
})

// Chart Data
const studentDistributionData = ref([
  { label: 'Khóa 2021', value: 245, percentage: 24.2, color: '#667eea' },
  { label: 'Khóa 2022', value: 312, percentage: 30.8, color: '#764ba2' },
  { label: 'Khóa 2023', value: 289, percentage: 28.6, color: '#f093fb' },
  { label: 'Khóa 2024', value: 166, percentage: 16.4, color: '#4facfe' }
])

const courseRegistrationData = ref([
  { subject: 'Lập trình Web', registered: 145, capacity: 160, rate: 90.6 },
  { subject: 'Cơ sở dữ liệu', registered: 152, capacity: 160, rate: 95.0 },
  { subject: 'Mạng máy tính', registered: 138, capacity: 150, rate: 92.0 },
  { subject: 'Trí tuệ nhân tạo', registered: 160, capacity: 160, rate: 100 },
  { subject: 'An toàn thông tin', registered: 98, capacity: 120, rate: 81.7 }
])

// Teacher data for table
const topTeachers = ref([
  { id: 'GV001', name: 'ThS. Lê Văn C', subjects: 4, students: 320, hours: 240 },
  { id: 'GV002', name: 'TS. Nguyễn Văn A', subjects: 3, students: 240, hours: 180 },
  { id: 'GV003', name: 'TS. Phạm Thị D', subjects: 2, students: 180, hours: 135 },
  { id: 'GV004', name: 'ThS. Hoàng Văn E', subjects: 3, students: 200, hours: 150 },
  { id: 'GV005', name: 'PGS. Trần Thị B', subjects: 2, students: 160, hours: 120 },
  { id: 'GV006', name: 'TS. Vũ Minh F', subjects: 3, students: 195, hours: 165 },
  { id: 'GV007', name: 'ThS. Đỗ Thu G', subjects: 2, students: 140, hours: 105 },
  { id: 'GV008', name: 'TS. Bùi Văn H', subjects: 3, students: 210, hours: 175 },
  { id: 'GV009', name: 'ThS. Mai Thị I', subjects: 2, students: 125, hours: 90 },
  { id: 'GV010', name: 'PGS.TS. Ngô Văn K', subjects: 4, students: 285, hours: 220 }
])

// Footer stats
const totalRecords = ref(15847)
const lastUpdateTime = ref('')
const generatedReports = ref(24)

// Methods
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
  currentDate.value = now.toLocaleDateString('vi-VN', { 
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  lastUpdateTime.value = now.toLocaleString('vi-VN')
}

const generateSparkline = (data) => {
  if (!data || data.length === 0) return ''
  
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  
  return data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100
    const y = 30 - ((value - min) / range) * 25
    return `${x},${y}`
  }).join(' ')
}

const refreshData = async () => {
  isRefreshing.value = true
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  isRefreshing.value = false
  updateTime()
}

const exportReport = () => {
  // Show export options modal
  const reportTypes = [
    { type: 'excel', name: 'Excel (.xlsx)', icon: 'fa-file-excel' },
    { type: 'pdf', name: 'PDF (.pdf)', icon: 'fa-file-pdf' },
    { type: 'csv', name: 'CSV (.csv)', icon: 'fa-file-csv' }
  ]
  
  // Create export dialog
  const exportDialog = document.createElement('div')
  exportDialog.className = 'export-dialog-overlay'
  exportDialog.innerHTML = `
    <div class="export-dialog">
      <div class="export-header">
        <h3><i class="fas fa-download"></i> Xuất báo cáo</h3>
        <button class="close-btn" onclick="this.closest('.export-dialog-overlay').remove()">
          <i class="fas fa-times"></i>
        </button>
      </div>
      <div class="export-body">
        <p>Chọn định dạng báo cáo:</p>
        <div class="export-options">
          ${reportTypes.map(type => `
            <button class="export-option" data-type="${type.type}">
              <i class="fas ${type.icon}"></i>
              <span>${type.name}</span>
            </button>
          `).join('')}
        </div>
        <div class="export-content-options">
          <p>Nội dung báo cáo:</p>
          <label class="checkbox-label">
            <input type="checkbox" checked data-content="summary"> Thống kê tổng quan
          </label>
          <label class="checkbox-label">
            <input type="checkbox" checked data-content="charts"> Biểu đồ phân tích
          </label>
          <label class="checkbox-label">
            <input type="checkbox" checked data-content="tables"> Bảng dữ liệu chi tiết
          </label>
          <label class="checkbox-label">
            <input type="checkbox" data-content="performance"> Xu hướng hiệu suất
          </label>
        </div>
      </div>
      <div class="export-footer">
        <button class="cancel-btn" onclick="this.closest('.export-dialog-overlay').remove()">
          Hủy
        </button>
        <button class="confirm-btn" id="confirmExport">
          <i class="fas fa-download"></i> Xuất báo cáo
        </button>
      </div>
    </div>
  `
  
  document.body.appendChild(exportDialog)
  
  // Handle export
  document.getElementById('confirmExport').addEventListener('click', () => {
    const selectedType = exportDialog.querySelector('.export-option.selected')?.dataset.type || 'pdf'
    const selectedContent = Array.from(exportDialog.querySelectorAll('input[data-content]:checked'))
      .map(input => input.dataset.content)
    
    // Simulate export
    console.log('Exporting report:', { type: selectedType, content: selectedContent })
    
    // Show success notification
    const notification = document.createElement('div')
    notification.className = 'export-notification'
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>Đang xuất báo cáo ${selectedType.toUpperCase()}...</span>
    `
    document.body.appendChild(notification)
    
    setTimeout(() => {
      notification.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>Xuất báo cáo thành công!</span>
      `
      setTimeout(() => notification.remove(), 2000)
    }, 1500)
    
    exportDialog.remove()
  })
  
  // Handle option selection
  exportDialog.querySelectorAll('.export-option').forEach(option => {
    option.addEventListener('click', () => {
      exportDialog.querySelectorAll('.export-option').forEach(o => o.classList.remove('selected'))
      option.classList.add('selected')
    })
  })
  
  // Select PDF by default
  exportDialog.querySelector('.export-option[data-type="pdf"]')?.classList.add('selected')
}

const applyFilters = () => {
  isLoading.value = true
  
  // Apply filters logic
  setTimeout(() => {
    isLoading.value = false
    showFilters.value = false
  }, 1000)
}

// Lifecycle
let timeInterval = null

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
/* Main Container */
.reports-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Header */
.reports-header {
  background: white;
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 2.5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: #718096;
  margin: 0.5rem 0 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.time-info {
  text-align: right;
}

.current-time {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.current-date {
  font-size: 0.875rem;
  color: #718096;
  margin-top: 0.25rem;
}

.action-buttons {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f7fafc;
  color: #4a5568;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.action-btn.filter:hover {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-btn.export:hover {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.action-btn.refresh:hover {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.fa-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Filter Panel */
.filter-panel {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #2d3748;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.apply-filter-btn {
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-filter-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* Slide Down Animation */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 200px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

/* Summary Section */
.summary-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.summary-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.card-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.card-primary .card-icon { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.card-success .card-icon { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
.card-info .card-icon { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.card-warning .card-icon { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.card-purple .card-icon { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); }
.card-teal .card-icon { background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); }

.card-content {
  flex: 1;
}

.card-label {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.card-value {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.card-trend {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.card-trend.positive {
  color: #38a169;
}

.card-sparkline {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 120px;
  height: 50px;
  opacity: 0.3;
}

.sparkline-svg {
  width: 100%;
  height: 100%;
}

/* Clickable Cards */
.summary-card.clickable {
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.summary-card.clickable::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.summary-card.clickable:hover::before {
  opacity: 1;
}

.summary-card.clickable:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.summary-card.clickable:active {
  transform: translateY(-3px) scale(1.01);
}

.card-click-hint {
  position: absolute;
  bottom: 0.75rem;
  left: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #a0aec0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.summary-card.clickable:hover .card-click-hint {
  opacity: 1;
}

.card-click-hint i {
  font-size: 0.875rem;
}

/* Charts Section */
.charts-section {
  margin-bottom: 2rem;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

.chart-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.chart-card.full-width {
  grid-column: span 12;
}

.chart-card.half-width {
  grid-column: span 6;
}

@media (max-width: 968px) {
  .chart-card.half-width {
    grid-column: span 12;
  }
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f7fafc;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.chart-controls {
  display: flex;
  gap: 0.5rem;
}

.chart-view-btn {
  width: 36px;
  height: 36px;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #718096;
}

.chart-view-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.chart-view-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.chart-detail-btn {
  padding: 0.5rem 1rem;
  background: #f7fafc;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #4a5568;
}

.chart-detail-btn:hover {
  background: #e2e8f0;
}

.period-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  color: #2d3748;
}

.chart-legend {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.chart-body {
  min-height: 300px;
}

/* Summary Tables Section */
.summary-table-section {
  margin-bottom: 2rem;
}

.summary-tables-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.full-width-table {
  grid-column: span 2;
}

@media (max-width: 968px) {
  .summary-tables-grid {
    grid-template-columns: 1fr;
  }
  
  .full-width-table {
    grid-column: span 1;
  }
}

.summary-table-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.summary-table-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.table-card-header {
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.table-card-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.table-card-body {
  padding: 0;
}

.summary-table {
  width: 100%;
  border-collapse: collapse;
}

.summary-table thead {
  background: #f7fafc;
}

.summary-table th {
  padding: 1rem;
  text-align: left;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  border-bottom: 2px solid #e2e8f0;
}

.summary-table td {
  padding: 1rem;
  font-size: 0.875rem;
  color: #2d3748;
  border-bottom: 1px solid #e2e8f0;
}

.summary-table tbody tr:last-child td {
  border-bottom: none;
}

.summary-table tbody tr:hover {
  background: #f7fafc;
}

.text-center {
  text-align: center;
}

.dept-name,
.course-name,
.teacher-name,
.cohort-name {
  font-weight: 600;
  color: #2d3748;
}

.rate-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.rate-badge.high {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.rate-badge.medium {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.rate-badge.low {
  background: #e2e8f0;
  color: #4a5568;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.excellent {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.status-badge.good {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.status-badge.average {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.status-badge.warning {
  background: #e2e8f0;
  color: #4a5568;
}

/* Footer */
.reports-footer {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.footer-info {
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-size: 0.9rem;
}

.info-item i {
  color: #667eea;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
  color: white;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Export Dialog */
.export-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

.export-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.export-header {
  padding: 1.5rem;
  border-bottom: 2px solid #f7fafc;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.export-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f7fafc;
  border-radius: 8px;
  cursor: pointer;
  color: #4a5568;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #2d3748;
}

.export-body {
  padding: 1.5rem;
}

.export-body > p {
  margin: 0 0 1rem 0;
  font-weight: 600;
  color: #2d3748;
}

.export-options {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.export-option {
  flex: 1;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.export-option i {
  font-size: 2rem;
  color: #718096;
  transition: all 0.3s ease;
}

.export-option span {
  font-size: 0.875rem;
  color: #4a5568;
  font-weight: 600;
}

.export-option:hover {
  border-color: #667eea;
  background: #f7fafc;
}

.export-option.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.export-option.selected i,
.export-option.selected span {
  color: white;
}

.export-content-options {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 12px;
}

.export-content-options > p {
  margin: 0 0 0.75rem 0;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.9rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  cursor: pointer;
  color: #4a5568;
  font-size: 0.9rem;
}

.checkbox-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.export-footer {
  padding: 1rem 1.5rem;
  border-top: 2px solid #f7fafc;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f7fafc;
  color: #4a5568;
}

.cancel-btn:hover {
  background: #e2e8f0;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.confirm-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.export-notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 10001;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.export-notification i {
  font-size: 1.5rem;
  color: #38a169;
}

.export-notification span {
  font-weight: 600;
  color: #2d3748;
}

/* Responsive */
@media (max-width: 768px) {
  .reports-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.75rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .action-btn {
    flex: 1;
  }
}
</style>
