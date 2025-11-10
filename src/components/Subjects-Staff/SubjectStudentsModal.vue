<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-info">
          <h2>
            <i class="fas fa-user-graduate"></i>
            Danh sách sinh viên đăng ký
          </h2>
          <div class="subject-info">
            <span class="subject-code">{{ subject?.code }}</span>
            <span class="subject-name">{{ subject?.name }}</span>
            <span class="subject-credits">({{ subject?.credits }} tín chỉ)</span>
          </div>
        </div>
        <button @click="close" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Summary Stats -->
        <div class="summary-stats">
          <div class="stat-item">
            <i class="fas fa-users"></i>
            <div>
              <span class="stat-number">{{ registeredStudents.length }}</span>
              <span class="stat-label">Đã đăng ký</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-user-check"></i>
            <div>
              <span class="stat-number">{{ studyingCount }}</span>
              <span class="stat-label">Đang học</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-user-times"></i>
            <div>
              <span class="stat-number">{{ withdrawnCount }}</span>
              <span class="stat-label">Đã rút</span>
            </div>
          </div>
          <div class="stat-item">
            <i class="fas fa-graduation-cap"></i>
            <div>
              <span class="stat-number">{{ completedCount }}</span>
              <span class="stat-label">Hoàn thành</span>
            </div>
          </div>
        </div>

        <!-- Filters -->
        <div class="filters-section">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Tìm theo mã SV, tên sinh viên, lớp..."
            />
          </div>
          <div class="filter-select">
            <select v-model="statusFilter">
              <option value="">Tất cả trạng thái</option>
              <option value="registered">Đã đăng ký</option>
              <option value="studying">Đang học</option>
              <option value="withdrawn">Đã rút</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>
          <div class="filter-select">
            <select v-model="classFilter">
              <option value="">Tất cả lớp</option>
              <option v-for="cls in uniqueClasses" :key="cls" :value="cls">
                {{ cls }}
              </option>
            </select>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions-section">
          <button @click="exportStudentList" class="btn-export">
            <i class="fas fa-download"></i>
            Xuất danh sách
          </button>
          <button @click="addStudent" class="btn-add">
            <i class="fas fa-user-plus"></i>
            Thêm sinh viên
          </button>
          <button
            v-if="selectedStudents.length > 0"
            @click="bulkRemove"
            class="btn-bulk-remove"
          >
            <i class="fas fa-user-minus"></i>
            Xóa {{ selectedStudents.length }} sinh viên
          </button>
        </div>

        <!-- Students Table -->
        <div class="table-container">
          <table class="students-table">
            <thead>
              <tr>
                <th class="checkbox-col">
                  <input
                    type="checkbox"
                    :checked="allSelected"
                    @change="toggleSelectAll"
                  />
                </th>
                <th>Mã SV</th>
                <th>Họ và tên</th>
                <th>Lớp</th>
                <th>Trạng thái</th>
                <th>Ngày ĐK</th>
                <th>Điểm giữa kỳ</th>
                <th>Điểm cuối kỳ</th>
                <th>Điểm tổng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="student in filteredStudents"
                :key="student.id"
                :class="{ selected: selectedStudents.includes(student.id) }"
              >
                <td class="checkbox-col">
                  <input
                    type="checkbox"
                    :value="student.id"
                    v-model="selectedStudents"
                  />
                </td>
                <td class="student-code">{{ student.studentCode }}</td>
                <td class="student-name">
                  <div class="name-info">
                    <span class="name">{{ student.fullName }}</span>
                    <span v-if="student.email" class="email">{{ student.email }}</span>
                  </div>
                </td>
                <td class="class-name">{{ student.className }}</td>
                <td class="status">
                  <span class="status-badge" :class="student.status">
                    {{ getStatusLabel(student.status) }}
                  </span>
                </td>
                <td class="register-date">{{ formatDate(student.registeredAt) }}</td>
                <td class="midterm-score">
                  <input
                    v-if="student.status === 'studying'"
                    v-model.number="student.midtermScore"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    @change="updateScore(student, 'midterm')"
                    class="score-input"
                  />
                  <span v-else class="score-display">
                    {{ student.midtermScore || '-' }}
                  </span>
                </td>
                <td class="final-score">
                  <input
                    v-if="student.status === 'studying'"
                    v-model.number="student.finalScore"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    @change="updateScore(student, 'final')"
                    class="score-input"
                  />
                  <span v-else class="score-display">
                    {{ student.finalScore || '-' }}
                  </span>
                </td>
                <td class="total-score">
                  <span class="total-score-value" :class="getTotalScoreClass(student.totalScore)">
                    {{ student.totalScore || '-' }}
                  </span>
                </td>
                <td class="actions">
                  <button
                    @click="viewStudentDetail(student)"
                    class="btn-action view"
                    title="Xem chi tiết"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button
                    v-if="student.status === 'registered'"
                    @click="removeStudent(student)"
                    class="btn-action remove"
                    title="Xóa khỏi học phần"
                  >
                    <i class="fas fa-user-times"></i>
                  </button>
                  <button
                    v-else-if="student.status === 'studying'"
                    @click="withdrawStudent(student)"
                    class="btn-action withdraw"
                    title="Cho rút học phần"
                  >
                    <i class="fas fa-sign-out-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div v-if="filteredStudents.length === 0" class="empty-state">
            <i class="fas fa-user-slash"></i>
            <p>{{ searchTerm ? 'Không tìm thấy sinh viên nào' : 'Chưa có sinh viên đăng ký' }}</p>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="pagination">
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="btn-page"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <span class="page-info">
            {{ currentPage }} / {{ totalPages }} ({{ filteredStudents.length }} sinh viên)
          </span>
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="btn-page"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Student Modal -->
    <div v-if="showAddStudentModal" class="modal-overlay" @click.self="showAddStudentModal = false">
      <div class="modal-container small">
        <div class="modal-header">
          <h3><i class="fas fa-user-plus"></i> Thêm sinh viên vào học phần</h3>
          <button @click="showAddStudentModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="search-box">
            <input
              v-model="studentSearchTerm"
              type="text"
              placeholder="Tìm kiếm theo mã SV hoặc tên..."
            />
          </div>
          <div class="available-students-list">
            <div
              v-for="student in filteredAvailableStudents"
              :key="student.id"
              class="available-student-item"
              @click="addStudentToSubject(student)"
            >
              <div class="student-info">
                <strong>{{ student.studentCode }}</strong>
                <span>{{ student.fullName }}</span>
                <small>Lớp: {{ student.className }}</small>
              </div>
              <button class="btn-add-student">
                <i class="fas fa-plus-circle"></i>
              </button>
            </div>
            <div v-if="filteredAvailableStudents.length === 0" class="empty-state">
              <i class="fas fa-search"></i>
              <p>Không tìm thấy sinh viên</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  subject: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'updateSubject'])

// State
const registeredStudents = ref([])
const selectedStudents = ref([])
const searchTerm = ref('')
const statusFilter = ref('')
const classFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const showAddStudentModal = ref(false)
const studentSearchTerm = ref('')

// Mock data for registered students
const mockRegisteredStudents = [
  {
    id: 1,
    studentId: 101,
    studentCode: '2251052001',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@student.edu.vn',
    className: '22IT1',
    status: 'studying',
    registeredAt: '2024-09-01',
    midtermScore: 8.5,
    finalScore: 9.0,
    totalScore: 8.8
  },
  {
    id: 2,
    studentId: 102,
    studentCode: '2251052002',
    fullName: 'Trần Thị B',
    email: 'tranthib@student.edu.vn',
    className: '22IT1',
    status: 'studying',
    registeredAt: '2024-09-01',
    midtermScore: 7.0,
    finalScore: null,
    totalScore: null
  },
  {
    id: 3,
    studentId: 103,
    studentCode: '2251052003',
    fullName: 'Lê Văn C',
    email: 'levanc@student.edu.vn',
    className: '22IT2',
    status: 'withdrawn',
    registeredAt: '2024-09-01',
    withdrawnAt: '2024-10-01',
    midtermScore: null,
    finalScore: null,
    totalScore: null
  },
  {
    id: 4,
    studentId: 104,
    studentCode: '2251052004',
    fullName: 'Phạm Thị D',
    email: 'phamthid@student.edu.vn',
    className: '22IT1',
    status: 'completed',
    registeredAt: '2024-09-01',
    midtermScore: 9.5,
    finalScore: 9.0,
    totalScore: 9.2
  },
  {
    id: 5,
    studentId: 105,
    studentCode: '2251052005',
    fullName: 'Hoàng Văn E',
    email: 'hoangvane@student.edu.vn',
    className: '22IT2',
    status: 'registered',
    registeredAt: '2024-10-15',
    midtermScore: null,
    finalScore: null,
    totalScore: null
  }
]

// Mock available students (not registered for this subject)
const availableStudents = ref([
  {
    id: 201,
    studentCode: '2251052006',
    fullName: 'Võ Thị F',
    className: '22IT1'
  },
  {
    id: 202,
    studentCode: '2251052007',
    fullName: 'Đặng Văn G',
    className: '22IT2'
  }
])

// Initialize data when modal opens
watch(() => props.isOpen, (newValue) => {
  if (newValue && props.subject) {
    loadRegisteredStudents()
    resetFilters()
  }
})

const loadRegisteredStudents = () => {
  // In real app, this would be an API call
  registeredStudents.value = mockRegisteredStudents
}

// Computed properties
const studyingCount = computed(() => 
  registeredStudents.value.filter(s => s.status === 'studying').length
)

const withdrawnCount = computed(() => 
  registeredStudents.value.filter(s => s.status === 'withdrawn').length
)

const completedCount = computed(() => 
  registeredStudents.value.filter(s => s.status === 'completed').length
)

const uniqueClasses = computed(() => 
  [...new Set(registeredStudents.value.map(s => s.className))].sort()
)

const filteredStudents = computed(() => {
  let result = registeredStudents.value

  if (searchTerm.value) {
    const search = searchTerm.value.toLowerCase()
    result = result.filter(s =>
      s.studentCode.toLowerCase().includes(search) ||
      s.fullName.toLowerCase().includes(search) ||
      s.className.toLowerCase().includes(search)
    )
  }

  if (statusFilter.value) {
    result = result.filter(s => s.status === statusFilter.value)
  }

  if (classFilter.value) {
    result = result.filter(s => s.className === classFilter.value)
  }

  return result
})

const filteredAvailableStudents = computed(() => {
  if (!studentSearchTerm.value) return availableStudents.value
  
  const search = studentSearchTerm.value.toLowerCase()
  return availableStudents.value.filter(s =>
    s.studentCode.toLowerCase().includes(search) ||
    s.fullName.toLowerCase().includes(search)
  )
})

const totalPages = computed(() => Math.ceil(filteredStudents.value.length / pageSize.value))

const allSelected = computed({
  get: () => filteredStudents.value.length > 0 && 
    filteredStudents.value.every(s => selectedStudents.value.includes(s.id)),
  set: (value) => {
    if (value) {
      selectedStudents.value = filteredStudents.value.map(s => s.id)
    } else {
      selectedStudents.value = []
    }
  }
})

// Methods
const getStatusLabel = (status) => {
  const labels = {
    registered: 'Đã đăng ký',
    studying: 'Đang học',
    withdrawn: 'Đã rút',
    completed: 'Hoàn thành'
  }
  return labels[status] || status
}

const getTotalScoreClass = (score) => {
  if (!score) return ''
  if (score >= 8.5) return 'excellent'
  if (score >= 7.0) return 'good'
  if (score >= 5.5) return 'average'
  if (score >= 4.0) return 'fair'
  return 'poor'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('vi-VN')
}

const updateScore = (student, type) => {
  // Auto calculate total score
  if (student.midtermScore !== null && student.finalScore !== null) {
    student.totalScore = (student.midtermScore * 0.4 + student.finalScore * 0.6).toFixed(1)
    
    // Auto update status to completed if both scores exist
    if (student.status === 'studying') {
      student.status = 'completed'
    }
  }
  
  // In real app, save to API
  console.log(`Updated ${type} score for student ${student.studentCode}:`, student)
}

const toggleSelectAll = () => {
  allSelected.value = !allSelected.value
}

const removeStudent = (student) => {
  if (confirm(`Bạn có chắc chắn muốn xóa sinh viên ${student.fullName} khỏi học phần này?`)) {
    registeredStudents.value = registeredStudents.value.filter(s => s.id !== student.id)
    selectedStudents.value = selectedStudents.value.filter(id => id !== student.id)
    
    // Update subject's registered count
    emit('updateSubject', {
      ...props.subject,
      registeredCount: registeredStudents.value.length
    })
    
    alert('Đã xóa sinh viên khỏi học phần!')
  }
}

const withdrawStudent = (student) => {
  if (confirm(`Cho phép sinh viên ${student.fullName} rút khỏi học phần này?`)) {
    const studentIndex = registeredStudents.value.findIndex(s => s.id === student.id)
    if (studentIndex !== -1) {
      registeredStudents.value[studentIndex].status = 'withdrawn'
      registeredStudents.value[studentIndex].withdrawnAt = new Date().toISOString().split('T')[0]
    }
    alert('Đã cho phép sinh viên rút học phần!')
  }
}

const bulkRemove = () => {
  const count = selectedStudents.value.length
  if (confirm(`Bạn có chắc chắn muốn xóa ${count} sinh viên được chọn khỏi học phần?`)) {
    registeredStudents.value = registeredStudents.value.filter(
      s => !selectedStudents.value.includes(s.id)
    )
    selectedStudents.value = []
    
    emit('updateSubject', {
      ...props.subject,
      registeredCount: registeredStudents.value.length
    })
    
    alert(`Đã xóa ${count} sinh viên khỏi học phần!`)
  }
}

const addStudent = () => {
  showAddStudentModal.value = true
}

const addStudentToSubject = (student) => {
  const newRegistration = {
    id: Date.now(),
    studentId: student.id,
    studentCode: student.studentCode,
    fullName: student.fullName,
    email: student.email || '',
    className: student.className,
    status: 'registered',
    registeredAt: new Date().toISOString().split('T')[0],
    midtermScore: null,
    finalScore: null,
    totalScore: null
  }
  
  registeredStudents.value.push(newRegistration)
  showAddStudentModal.value = false
  studentSearchTerm.value = ''
  
  emit('updateSubject', {
    ...props.subject,
    registeredCount: registeredStudents.value.length
  })
  
  alert(`Đã thêm sinh viên ${student.fullName} vào học phần!`)
}

const viewStudentDetail = (student) => {
  // Navigate to student detail or show modal
  alert(`Xem chi tiết sinh viên: ${student.fullName}\nMã SV: ${student.studentCode}\nLớp: ${student.className}`)
}

const exportStudentList = () => {
  // Generate CSV
  const headers = ['Mã SV', 'Họ tên', 'Lớp', 'Trạng thái', 'Điểm GK', 'Điểm CK', 'Điểm tổng']
  const rows = filteredStudents.value.map(s => [
    s.studentCode,
    s.fullName,
    s.className,
    getStatusLabel(s.status),
    s.midtermScore || '',
    s.finalScore || '',
    s.totalScore || ''
  ])
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `danh-sach-${props.subject?.code || 'mon-hoc'}.csv`
  link.click()
}

const resetFilters = () => {
  searchTerm.value = ''
  statusFilter.value = ''
  classFilter.value = ''
  selectedStudents.value = []
  currentPage.value = 1
}

const close = () => {
  resetFilters()
  emit('close')
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-container.small {
  max-width: 600px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-info h2 {
  margin: 0 0 8px;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.subject-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  opacity: 0.9;
}

.subject-code {
  background: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

/* Summary Stats */
.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.stat-item i {
  font-size: 24px;
  color: #667eea;
}

.stat-number {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  display: block;
  font-size: 14px;
  color: #7f8c8d;
}

/* Filters */
.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
}

.search-box {
  flex: 1;
  position: relative;
}

.search-box i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f8c8d;
}

.search-box input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.filter-select select {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  min-width: 150px;
}

/* Actions */
.actions-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.btn-export,
.btn-add,
.btn-bulk-remove {
  padding: 10px 20px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-export {
  background: #f8f9fa;
  color: #495057;
  border: 2px solid #e0e0e0;
}

.btn-export:hover {
  background: #e9ecef;
}

.btn-add {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
}

.btn-bulk-remove {
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.btn-bulk-remove:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
}

/* Table */
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.students-table {
  width: 100%;
  border-collapse: collapse;
}

.students-table th {
  background: #f8f9fa;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
  font-size: 14px;
  white-space: nowrap;
}

.students-table td {
  padding: 16px 12px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
  vertical-align: middle;
}

.students-table tr:hover {
  background: #f8f9ff;
}

.students-table tr.selected {
  background: #e3f2fd;
}

.checkbox-col {
  width: 40px;
  text-align: center;
}

.student-code {
  font-weight: 600;
  color: #667eea;
}

.name-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-info .name {
  font-weight: 600;
  color: #2c3e50;
}

.name-info .email {
  font-size: 12px;
  color: #7f8c8d;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.registered {
  background: #fff3cd;
  color: #856404;
}

.status-badge.studying {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.withdrawn {
  background: #f8d7da;
  color: #721c24;
}

.status-badge.completed {
  background: #d4edda;
  color: #155724;
}

.score-input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
}

.score-input:focus {
  outline: none;
  border-color: #667eea;
}

.score-display {
  color: #7f8c8d;
}

.total-score-value {
  font-weight: 600;
}

.total-score-value.excellent {
  color: #155724;
}

.total-score-value.good {
  color: #0c5460;
}

.total-score-value.average {
  color: #856404;
}

.total-score-value.fair {
  color: #b45309;
}

.total-score-value.poor {
  color: #721c24;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-action.view {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-action.view:hover {
  background: #1976d2;
  color: white;
}

.btn-action.remove {
  background: #ffebee;
  color: #d32f2f;
}

.btn-action.remove:hover {
  background: #d32f2f;
  color: white;
}

.btn-action.withdraw {
  background: #fff3e0;
  color: #f57c00;
}

.btn-action.withdraw:hover {
  background: #f57c00;
  color: white;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #95a5a6;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.btn-page {
  padding: 8px 12px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-page:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #7f8c8d;
}

/* Add Student Modal */
.available-students-list {
  max-height: 400px;
  overflow-y: auto;
}

.available-student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.available-student-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-info strong {
  color: #667eea;
  font-size: 14px;
}

.student-info span {
  color: #2c3e50;
}

.student-info small {
  color: #7f8c8d;
  font-size: 12px;
}

.btn-add-student {
  background: transparent;
  border: none;
  color: #667eea;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-student:hover {
  transform: scale(1.2);
  color: #764ba2;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .actions-section {
    flex-direction: column;
  }

  .btn-export,
  .btn-add,
  .btn-bulk-remove {
    justify-content: center;
  }

  .summary-stats {
    grid-template-columns: 1fr;
  }
}
</style>