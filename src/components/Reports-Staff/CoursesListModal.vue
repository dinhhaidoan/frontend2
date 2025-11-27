<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-graduation-cap"></i>
          Danh sách học phần đang mở
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="modal-stats">
          <div class="stat-item">
            <span class="stat-label">Tổng số học phần:</span>
            <span class="stat-value">{{ courses.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Đã đăng ký:</span>
            <span class="stat-value success">{{ registeredCount }}</span>
          </div>
        </div>

        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Tìm kiếm học phần..."
          >
        </div>

        <div class="courses-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã HP</th>
                <th>Tên học phần</th>
                <th>Giảng viên</th>
                <th>Phòng học</th>
                <th>Thời gian</th>
                <th>SL</th>
                <th>Tỷ lệ ĐK</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(course, index) in filteredCourses" :key="course.id">
                <td class="text-center">{{ index + 1 }}</td>
                <td class="course-code">{{ course.code }}</td>
                <td class="course-name">{{ course.name }}</td>
                <td>{{ course.teacher }}</td>
                <td class="text-center">{{ course.room }}</td>
                <td class="course-schedule">{{ course.schedule }}</td>
                <td class="text-center">{{ course.registered }}/{{ course.capacity }}</td>
                <td>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: course.registrationRate + '%' }"
                      :class="getProgressClass(course.registrationRate)"
                    ></div>
                    <span class="progress-text">{{ course.registrationRate }}%</span>
                  </div>
                </td>
                <td class="text-center">
                  <span class="status-badge" :class="course.status">
                    {{ getStatusLabel(course.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="filteredCourses.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Không tìm thấy học phần nào</p>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="exportList" class="btn-export">
          <i class="fas fa-file-excel"></i>
          Xuất danh sách
        </button>
        <button @click="$emit('close')" class="btn-secondary">
          <i class="fas fa-times"></i>
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineEmits(['close'])

const searchQuery = ref('')

const courses = ref([
  { id: 1, code: 'IT001-01', name: 'Nhập môn lập trình', teacher: 'TS. Nguyễn Văn A', room: 'A101', schedule: 'T2: 7-9', capacity: 60, registered: 58, registrationRate: 97, status: 'open' },
  { id: 2, code: 'IT002-01', name: 'Lập trình hướng đối tượng', teacher: 'PGS.TS. Trần Thị B', room: 'B205', schedule: 'T3: 13-15', capacity: 50, registered: 50, registrationRate: 100, status: 'full' },
  { id: 3, code: 'IT003-01', name: 'Cấu trúc dữ liệu và giải thuật', teacher: 'TS. Lê Văn C', room: 'C302', schedule: 'T4: 7-9', capacity: 55, registered: 52, registrationRate: 95, status: 'open' },
  { id: 4, code: 'IT004-01', name: 'Cơ sở dữ liệu', teacher: 'ThS. Phạm Thị D', room: 'A205', schedule: 'T5: 13-15', capacity: 60, registered: 45, registrationRate: 75, status: 'open' },
  { id: 5, code: 'IT005-01', name: 'Mạng máy tính', teacher: 'TS. Hoàng Văn E', room: 'B101', schedule: 'T6: 9-11', capacity: 50, registered: 48, registrationRate: 96, status: 'open' },
  { id: 6, code: 'IT006-01', name: 'Hệ điều hành', teacher: 'PGS.TS. Vũ Thị F', room: 'C401', schedule: 'T2: 15-17', capacity: 55, registered: 55, registrationRate: 100, status: 'full' },
  { id: 7, code: 'IT007-01', name: 'An toàn thông tin', teacher: 'TS. Đỗ Văn G', room: 'A305', schedule: 'T3: 7-9', capacity: 60, registered: 42, registrationRate: 70, status: 'open' },
  { id: 8, code: 'IT008-01', name: 'Lập trình Web', teacher: 'ThS. Bùi Thị H', room: 'B301', schedule: 'T4: 13-15', capacity: 50, registered: 50, registrationRate: 100, status: 'full' },
  { id: 9, code: 'IT009-01', name: 'Phát triển ứng dụng di động', teacher: 'TS. Ngô Văn I', room: 'C205', schedule: 'T5: 7-9', capacity: 45, registered: 43, registrationRate: 96, status: 'open' },
  { id: 10, code: 'IT010-01', name: 'Trí tuệ nhân tạo', teacher: 'PGS.TS. Lý Thị K', room: 'A401', schedule: 'T6: 13-15', capacity: 55, registered: 54, registrationRate: 98, status: 'open' },
  { id: 11, code: 'IT001-02', name: 'Nhập môn lập trình', teacher: 'ThS. Đinh Văn L', room: 'B405', schedule: 'T2: 9-11', capacity: 60, registered: 55, registrationRate: 92, status: 'open' },
  { id: 12, code: 'IT011-01', name: 'Công nghệ phần mềm', teacher: 'TS. Mai Thị M', room: 'C105', schedule: 'T3: 15-17', capacity: 50, registered: 38, registrationRate: 76, status: 'open' },
  { id: 13, code: 'IT012-01', name: 'Lập trình Python', teacher: 'ThS. Trương Văn N', room: 'A201', schedule: 'T4: 9-11', capacity: 55, registered: 52, registrationRate: 95, status: 'open' },
  { id: 14, code: 'IT013-01', name: 'Machine Learning', teacher: 'PGS.TS. Phan Thị O', room: 'B201', schedule: 'T5: 15-17', capacity: 45, registered: 45, registrationRate: 100, status: 'full' },
  { id: 15, code: 'IT014-01', name: 'Phân tích thiết kế hệ thống', teacher: 'TS. Lương Văn P', room: 'C301', schedule: 'T6: 7-9', capacity: 60, registered: 48, registrationRate: 80, status: 'open' },
  { id: 16, code: 'IT002-02', name: 'Lập trình hướng đối tượng', teacher: 'ThS. Đặng Thị Q', room: 'A105', schedule: 'T2: 13-15', capacity: 50, registered: 47, registrationRate: 94, status: 'open' },
  { id: 17, code: 'IT015-01', name: 'Kiểm thử phần mềm', teacher: 'TS. Võ Văn R', room: 'B305', schedule: 'T3: 9-11', capacity: 55, registered: 41, registrationRate: 75, status: 'open' },
  { id: 18, code: 'IT016-01', name: 'Cloud Computing', teacher: 'PGS.TS. Hồ Thị S', room: 'C405', schedule: 'T4: 15-17', capacity: 50, registered: 50, registrationRate: 100, status: 'full' },
  { id: 19, code: 'IT017-01', name: 'DevOps', teacher: 'ThS. Cao Văn T', room: 'A301', schedule: 'T5: 9-11', capacity: 45, registered: 39, registrationRate: 87, status: 'open' },
  { id: 20, code: 'IT003-02', name: 'Cấu trúc dữ liệu và giải thuật', teacher: 'TS. Dương Thị U', room: 'B105', schedule: 'T6: 15-17', capacity: 55, registered: 53, registrationRate: 96, status: 'open' },
  { id: 21, code: 'IT018-01', name: 'Blockchain', teacher: 'ThS. Tô Văn V', room: 'C201', schedule: 'T2: 7-9', capacity: 60, registered: 44, registrationRate: 73, status: 'open' },
  { id: 22, code: 'IT019-01', name: 'IoT', teacher: 'PGS.TS. Hà Thị W', room: 'A405', schedule: 'T3: 13-15', capacity: 50, registered: 47, registrationRate: 94, status: 'open' },
  { id: 23, code: 'IT020-01', name: 'Big Data', teacher: 'TS. Lâm Văn X', room: 'B401', schedule: 'T4: 7-9', capacity: 55, registered: 55, registrationRate: 100, status: 'full' },
  { id: 24, code: 'IT004-02', name: 'Cơ sở dữ liệu', teacher: 'ThS. Từ Thị Y', room: 'C105', schedule: 'T5: 13-15', capacity: 60, registered: 51, registrationRate: 85, status: 'open' },
  { id: 25, code: 'IT021-01', name: 'Xử lý ảnh', teacher: 'TS. Ông Văn Z', room: 'A201', schedule: 'T6: 9-11', capacity: 50, registered: 46, registrationRate: 92, status: 'open' },
  { id: 26, code: 'IT005-02', name: 'Mạng máy tính', teacher: 'ThS. Khúc Thị AA', room: 'B205', schedule: 'T2: 15-17', capacity: 55, registered: 40, registrationRate: 73, status: 'open' },
  { id: 27, code: 'IT022-01', name: 'Lập trình game', teacher: 'PGS.TS. Ưu Văn BB', room: 'C305', schedule: 'T3: 7-9', capacity: 45, registered: 45, registrationRate: 100, status: 'full' },
  { id: 28, code: 'IT023-01', name: 'Computer Vision', teacher: 'TS. Âu Thị CC', room: 'A101', schedule: 'T4: 13-15', capacity: 60, registered: 57, registrationRate: 95, status: 'open' },
  { id: 29, code: 'IT006-02', name: 'Hệ điều hành', teacher: 'ThS. Ơ Văn DD', room: 'B301', schedule: 'T5: 7-9', capacity: 50, registered: 48, registrationRate: 96, status: 'open' },
  { id: 30, code: 'IT024-01', name: 'Natural Language Processing', teacher: 'PGS.TS. Ă Thị EE', room: 'C401', schedule: 'T6: 13-15', capacity: 55, registered: 43, registrationRate: 78, status: 'open' },
  { id: 31, code: 'IT007-02', name: 'An toàn thông tin', teacher: 'TS. Ê Văn FF', room: 'A305', schedule: 'T2: 9-11', capacity: 60, registered: 56, registrationRate: 93, status: 'open' },
  { id: 32, code: 'IT025-01', name: 'Robotics', teacher: 'ThS. Ô Thị GG', room: 'B105', schedule: 'T3: 15-17', capacity: 50, registered: 50, registrationRate: 100, status: 'full' },
  { id: 33, code: 'IT026-01', name: 'Embedded Systems', teacher: 'TS. Đ Văn HH', room: 'C205', schedule: 'T4: 9-11', capacity: 45, registered: 42, registrationRate: 93, status: 'open' },
  { id: 34, code: 'IT008-02', name: 'Lập trình Web', teacher: 'ThS. Y Thị II', room: 'A401', schedule: 'T5: 15-17', capacity: 55, registered: 49, registrationRate: 89, status: 'open' },
  { id: 35, code: 'IT027-01', name: 'Microcontrollers', teacher: 'PGS.TS. U Văn JJ', room: 'B405', schedule: 'T6: 7-9', capacity: 60, registered: 45, registrationRate: 75, status: 'open' },
  { id: 36, code: 'IT009-02', name: 'Phát triển ứng dụng di động', teacher: 'TS. I Thị KK', room: 'C101', schedule: 'T2: 13-15', capacity: 50, registered: 47, registrationRate: 94, status: 'open' },
  { id: 37, code: 'IT028-01', name: 'Digital Signal Processing', teacher: 'ThS. O Văn LL', room: 'A205', schedule: 'T3: 9-11', capacity: 55, registered: 52, registrationRate: 95, status: 'open' },
  { id: 38, code: 'IT029-01', name: 'Computer Graphics', teacher: 'TS. E Thị MM', room: 'B201', schedule: 'T4: 15-17', capacity: 45, registered: 41, registrationRate: 91, status: 'open' },
  { id: 39, code: 'IT010-02', name: 'Trí tuệ nhân tạo', teacher: 'ThS. A Văn NN', room: 'C301', schedule: 'T5: 9-11', capacity: 60, registered: 58, registrationRate: 97, status: 'open' },
  { id: 40, code: 'IT030-01', name: 'Multimedia Systems', teacher: 'PGS.TS. Ý Thị OO', room: 'A101', schedule: 'T6: 15-17', capacity: 50, registered: 50, registrationRate: 100, status: 'full' },
  { id: 41, code: 'IT031-01', name: 'Distributed Systems', teacher: 'TS. Ư Văn PP', room: 'B305', schedule: 'T2: 7-9', capacity: 55, registered: 46, registrationRate: 84, status: 'open' },
  { id: 42, code: 'IT032-01', name: 'Parallel Computing', teacher: 'ThS. Ơ Thị QQ', room: 'C405', schedule: 'T3: 13-15', capacity: 50, registered: 44, registrationRate: 88, status: 'open' },
  { id: 43, code: 'IT011-02', name: 'Công nghệ phần mềm', teacher: 'TS. Ă Văn RR', room: 'A301', schedule: 'T4: 7-9', capacity: 45, registered: 43, registrationRate: 96, status: 'open' },
  { id: 44, code: 'IT033-01', name: 'Quantum Computing', teacher: 'PGS.TS. Ê Thị SS', room: 'B105', schedule: 'T5: 13-15', capacity: 60, registered: 35, registrationRate: 58, status: 'open' },
  { id: 45, code: 'IT012-02', name: 'Lập trình Python', teacher: 'ThS. Ô Văn TT', room: 'C201', schedule: 'T6: 9-11', capacity: 50, registered: 49, registrationRate: 98, status: 'open' },
  { id: 46, code: 'IT034-01', name: 'Compiler Design', teacher: 'TS. Đ Thị UU', room: 'A405', schedule: 'T2: 15-17', capacity: 55, registered: 42, registrationRate: 76, status: 'open' },
  { id: 47, code: 'IT035-01', name: 'Theory of Computation', teacher: 'ThS. Y Văn VV', room: 'B401', schedule: 'T3: 7-9', capacity: 50, registered: 38, registrationRate: 76, status: 'open' },
  { id: 48, code: 'IT013-02', name: 'Machine Learning', teacher: 'PGS.TS. U Thị WW', room: 'C105', schedule: 'T4: 13-15', capacity: 45, registered: 45, registrationRate: 100, status: 'full' },
  { id: 49, code: 'IT036-01', name: 'Algorithm Analysis', teacher: 'TS. I Văn XX', room: 'A201', schedule: 'T5: 7-9', capacity: 60, registered: 54, registrationRate: 90, status: 'open' },
  { id: 50, code: 'IT014-02', name: 'Phân tích thiết kế hệ thống', teacher: 'ThS. O Thị YY', room: 'B205', schedule: 'T6: 13-15', capacity: 50, registered: 47, registrationRate: 94, status: 'open' },
  { id: 51, code: 'IT037-01', name: 'Discrete Mathematics', teacher: 'TS. E Văn ZZ', room: 'C305', schedule: 'T2: 9-11', capacity: 55, registered: 51, registrationRate: 93, status: 'open' },
  { id: 52, code: 'IT015-02', name: 'Kiểm thử phần mềm', teacher: 'ThS. A Thị AAA', room: 'A101', schedule: 'T3: 15-17', capacity: 45, registered: 40, registrationRate: 89, status: 'open' },
  { id: 53, code: 'IT038-01', name: 'Linear Algebra', teacher: 'PGS.TS. Ý Văn BBB', room: 'B301', schedule: 'T4: 9-11', capacity: 60, registered: 58, registrationRate: 97, status: 'open' },
  { id: 54, code: 'IT016-02', name: 'Cloud Computing', teacher: 'TS. Ư Thị CCC', room: 'C401', schedule: 'T5: 15-17', capacity: 50, registered: 48, registrationRate: 96, status: 'open' },
  { id: 55, code: 'IT017-02', name: 'DevOps', teacher: 'ThS. Ơ Văn DDD', room: 'A305', schedule: 'T6: 7-9', capacity: 55, registered: 44, registrationRate: 80, status: 'open' },
  { id: 56, code: 'IT018-02', name: 'Blockchain', teacher: 'TS. Ă Thị EEE', room: 'B105', schedule: 'T2: 13-15', capacity: 50, registered: 46, registrationRate: 92, status: 'open' },
  { id: 57, code: 'IT019-02', name: 'IoT', teacher: 'ThS. Ê Văn FFF', room: 'C205', schedule: 'T3: 9-11', capacity: 45, registered: 43, registrationRate: 96, status: 'open' },
  { id: 58, code: 'IT020-02', name: 'Big Data', teacher: 'PGS.TS. Ô Thị GGG', room: 'A401', schedule: 'T4: 15-17', capacity: 60, registered: 55, registrationRate: 92, status: 'open' },
  { id: 59, code: 'IT021-02', name: 'Xử lý ảnh', teacher: 'TS. Đ Văn HHH', room: 'B405', schedule: 'T5: 9-11', capacity: 50, registered: 47, registrationRate: 94, status: 'open' },
  { id: 60, code: 'IT022-02', name: 'Lập trình game', teacher: 'ThS. Y Thị III', room: 'C101', schedule: 'T6: 13-15', capacity: 55, registered: 52, registrationRate: 95, status: 'open' },
  { id: 61, code: 'IT023-02', name: 'Computer Vision', teacher: 'TS. U Văn JJJ', room: 'A205', schedule: 'T2: 7-9', capacity: 50, registered: 49, registrationRate: 98, status: 'open' },
  { id: 62, code: 'IT024-02', name: 'Natural Language Processing', teacher: 'ThS. I Thị KKK', room: 'B201', schedule: 'T3: 13-15', capacity: 45, registered: 41, registrationRate: 91, status: 'open' }
])

const filteredCourses = computed(() => {
  if (!searchQuery.value) return courses.value
  
  const query = searchQuery.value.toLowerCase()
  return courses.value.filter(course => 
    course.code.toLowerCase().includes(query) ||
    course.name.toLowerCase().includes(query) ||
    course.teacher.toLowerCase().includes(query) ||
    course.room.toLowerCase().includes(query) ||
    course.schedule.toLowerCase().includes(query)
  )
})

const registeredCount = computed(() => {
  return courses.value.filter(c => c.registered > 0).length
})

const getStatusLabel = (status) => {
  const labels = {
    open: 'Đang mở',
    full: 'Đã đầy',
    closed: 'Đã đóng'
  }
  return labels[status] || status
}

const getProgressClass = (rate) => {
  if (rate >= 90) return 'high'
  if (rate >= 70) return 'medium'
  return 'low'
}

const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget) {
    // Optional: Uncomment to close on overlay click
    // emit('close')
  }
}

const exportList = () => {
  console.log('Exporting courses list...')
  // Export functionality
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100001;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 95%;
  max-width: 1400px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  color: white;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 1.5rem 2rem;
  overflow-y: auto;
  flex: 1;
}

.modal-stats {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  gap: 2rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stat-label {
  color: #718096;
  font-size: 0.9rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #f5576c;
}

.stat-value.success {
  color: #38ef7d;
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #718096;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #f5576c;
  box-shadow: 0 0 0 3px rgba(245, 87, 108, 0.1);
}

.courses-table {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

thead {
  background: #f7fafc;
}

th {
  padding: 0.875rem 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.8rem;
  border-bottom: 2px solid #e2e8f0;
  white-space: nowrap;
}

td {
  padding: 0.875rem 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
}

tbody tr:hover {
  background: #f7fafc;
}

tbody tr:last-child td {
  border-bottom: none;
}

.text-center {
  text-align: center;
}

.course-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #f5576c;
  white-space: nowrap;
}

.course-name {
  font-weight: 500;
  color: #2d3748;
  min-width: 200px;
}

.course-schedule {
  white-space: nowrap;
  font-size: 0.85rem;
}

.progress-bar {
  position: relative;
  background: #e2e8f0;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  min-width: 80px;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  transition: width 0.3s ease;
}

.progress-fill.high {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.progress-fill.medium {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.progress-fill.low {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.progress-text {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.75rem;
  font-weight: 600;
  color: #2d3748;
  z-index: 1;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.open {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.status-badge.full {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.status-badge.closed {
  background: #e2e8f0;
  color: #718096;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #718096;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.modal-footer {
  padding: 1rem 2rem;
  border-top: 2px solid #f0f0f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-export,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-export {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(17, 153, 142, 0.4);
}

.btn-secondary {
  background: #f7fafc;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #e2e8f0;
}
</style>
