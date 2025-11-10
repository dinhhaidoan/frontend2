<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-book"></i>
          Danh sách môn học đang giảng dạy
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="modal-stats">
          <div class="stat-item">
            <span class="stat-label">Tổng số môn:</span>
            <span class="stat-value">{{ subjects.length }}</span>
          </div>
        </div>

        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Tìm kiếm môn học..."
          >
        </div>

        <div class="subjects-table">
          <table>
            <thead>
              <tr>
                <th>STT</th>
                <th>Mã môn</th>
                <th>Tên môn học</th>
                <th>Tín chỉ</th>
                <th>Bộ môn</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(subject, index) in filteredSubjects" :key="subject.id">
                <td class="text-center">{{ index + 1 }}</td>
                <td class="subject-code">{{ subject.code }}</td>
                <td class="subject-name">{{ subject.name }}</td>
                <td class="text-center">{{ subject.credits }} TC</td>
                <td>{{ subject.department }}</td>
                <td class="text-center">
                  <span class="status-badge" :class="subject.status">
                    {{ getStatusLabel(subject.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div v-if="filteredSubjects.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Không tìm thấy môn học nào</p>
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

const subjects = ref([
  { id: 1, code: 'IT001', name: 'Nhập môn lập trình', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 2, code: 'IT002', name: 'Lập trình hướng đối tượng', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 3, code: 'IT003', name: 'Cấu trúc dữ liệu và giải thuật', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 4, code: 'IT004', name: 'Cơ sở dữ liệu', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 5, code: 'IT005', name: 'Mạng máy tính', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 6, code: 'IT006', name: 'Hệ điều hành', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 7, code: 'IT007', name: 'An toàn thông tin', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 8, code: 'IT008', name: 'Lập trình Web', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 9, code: 'IT009', name: 'Phát triển ứng dụng di động', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 10, code: 'IT010', name: 'Trí tuệ nhân tạo', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 11, code: 'IT011', name: 'Công nghệ phần mềm', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 12, code: 'IT012', name: 'Lập trình Python', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 13, code: 'IT013', name: 'Machine Learning', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 14, code: 'IT014', name: 'Phân tích thiết kế hệ thống', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 15, code: 'IT015', name: 'Kiểm thử phần mềm', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 16, code: 'IT016', name: 'Cloud Computing', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 17, code: 'IT017', name: 'DevOps', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 18, code: 'IT018', name: 'Blockchain', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 19, code: 'IT019', name: 'IoT', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 20, code: 'IT020', name: 'Big Data', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 21, code: 'IT021', name: 'Xử lý ảnh', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 22, code: 'IT022', name: 'Lập trình game', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 23, code: 'IT023', name: 'Computer Vision', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 24, code: 'IT024', name: 'Natural Language Processing', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 25, code: 'IT025', name: 'Robotics', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 26, code: 'IT026', name: 'Embedded Systems', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 27, code: 'IT027', name: 'Microcontrollers', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 28, code: 'IT028', name: 'Digital Signal Processing', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 29, code: 'IT029', name: 'Computer Graphics', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 30, code: 'IT030', name: 'Multimedia Systems', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 31, code: 'IT031', name: 'Distributed Systems', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 32, code: 'IT032', name: 'Parallel Computing', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 33, code: 'IT033', name: 'Quantum Computing', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 34, code: 'IT034', name: 'Compiler Design', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 35, code: 'IT035', name: 'Theory of Computation', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 36, code: 'IT036', name: 'Algorithm Analysis', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 37, code: 'IT037', name: 'Discrete Mathematics', credits: 3, department: 'Khoa CNTT', status: 'active' },
  { id: 38, code: 'IT038', name: 'Linear Algebra', credits: 3, department: 'Khoa CNTT', status: 'active' }
])

const filteredSubjects = computed(() => {
  if (!searchQuery.value) return subjects.value
  
  const query = searchQuery.value.toLowerCase()
  return subjects.value.filter(subject => 
    subject.code.toLowerCase().includes(query) ||
    subject.name.toLowerCase().includes(query) ||
    subject.department.toLowerCase().includes(query)
  )
})

const getStatusLabel = (status) => {
  const labels = {
    active: 'Đang giảng dạy',
    inactive: 'Tạm ngưng',
    pending: 'Chờ xử lý'
  }
  return labels[status] || status
}

const handleOverlayClick = (e) => {
  if (e.target === e.currentTarget) {
    // Optional: Uncomment to close on overlay click
    // emit('close')
  }
}

const exportList = () => {
  console.log('Exporting subjects list...')
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
  z-index: 9999;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 1000px;
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  color: #667eea;
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
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.subjects-table {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f7fafc;
}

th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2d3748;
  font-size: 0.875rem;
  border-bottom: 2px solid #e2e8f0;
}

td {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
  font-size: 0.9rem;
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

.subject-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #667eea;
}

.subject-name {
  font-weight: 500;
  color: #2d3748;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
}

.status-badge.inactive {
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
