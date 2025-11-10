<template>
  <div class="official-class-page">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-users"></i> Quản lý lớp hành chính</h1>
        <p>Quản lý danh sách lớp, cố vấn học tập và sinh viên</p>
      </div>
      <button @click="openAddModal" class="btn-add">
        <i class="fas fa-plus"></i> Tạo lớp mới
      </button>
    </div>

    <div class="page-content">
      <!-- Statistics -->
      <div class="stats-grid">
        <div class="stat-card">
          <i class="fas fa-users"></i>
          <div>
            <h3>{{ statistics.totalClasses }}</h3>
            <p>Tổng số lớp</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-user-check"></i>
          <div>
            <h3>{{ statistics.activeClasses }}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-user-graduate"></i>
          <div>
            <h3>{{ statistics.totalStudents }}</h3>
            <p>Tổng sinh viên</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-user-tie"></i>
          <div>
            <h3>{{ statistics.totalAdvisors }}</h3>
            <p>Cố vấn</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filters-container">
          <div class="filter-group">
            <label><i class="fas fa-search"></i></label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Tìm theo mã lớp, tên lớp..."
            />
          </div>

          <div class="filter-group">
            <label><i class="fas fa-book"></i> Ngành</label>
            <select v-model="filters.major">
              <option value="">Tất cả ngành</option>
              <option value="IT">Công nghệ thông tin</option>
              <option value="CS">Khoa học máy tính</option>
              <option value="IS">Hệ thống thông tin</option>
              <option value="SE">Kỹ thuật phần mềm</option>
              <option value="DS">Khoa học dữ liệu</option>
              <option value="AI">Trí tuệ nhân tạo</option>
            </select>
          </div>

          <div class="filter-group">
            <label><i class="fas fa-calendar"></i> Khóa</label>
            <select v-model="filters.course">
              <option value="">Tất cả khóa</option>
              <option value="2022">Khóa 2022</option>
              <option value="2023">Khóa 2023</option>
              <option value="2024">Khóa 2024</option>
              <option value="2025">Khóa 2025</option>
            </select>
          </div>

          <div class="filter-group">
            <label><i class="fas fa-toggle-on"></i> Trạng thái</label>
            <select v-model="filters.status">
              <option value="">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Ngừng hoạt động</option>
              <option value="completed">Đã tốt nghiệp</option>
            </select>
          </div>

          <button @click="resetFilters" class="btn-reset">
            <i class="fas fa-redo"></i> Đặt lại
          </button>
        </div>
      </div>

      <!-- Classes Grid -->
      <div class="classes-grid">
        <div
          v-for="officialClass in filteredClasses"
          :key="officialClass.id"
          class="class-card"
          :class="officialClass.status"
        >
          <div class="class-header">
            <div class="class-title">
              <h3>{{ officialClass.code }}</h3>
              <span class="class-status" :class="officialClass.status">
                {{ getStatusLabel(officialClass.status) }}
              </span>
            </div>
            <div class="class-actions">
              <button @click="viewClass(officialClass)" class="btn-icon" title="Xem chi tiết">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editClass(officialClass)" class="btn-icon" title="Chỉnh sửa">
                <i class="fas fa-edit"></i>
              </button>
              <button
                @click="deleteClass(officialClass.id)"
                class="btn-icon delete"
                title="Xóa"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="class-body">
            <p class="class-name">{{ officialClass.name }}</p>

            <div class="class-info">
              <div class="info-item">
                <i class="fas fa-book"></i>
                <span>{{ getMajorLabel(officialClass.major) }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-calendar"></i>
                <span>Khóa {{ officialClass.course }}</span>
              </div>
            </div>

            <div class="class-advisor">
              <i class="fas fa-user-tie"></i>
              <span>{{ officialClass.advisorName || 'Chưa có cố vấn' }}</span>
            </div>

            <div class="class-stats">
              <div class="stat-item">
                <i class="fas fa-users"></i>
                <span>
                  {{ officialClass.studentCount || 0 }}/{{ officialClass.maxStudents }}
                </span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{
                    width: ((officialClass.studentCount || 0) / officialClass.maxStudents) * 100 + '%'
                  }"
                ></div>
              </div>
            </div>
          </div>

          <div class="class-footer">
            <button @click="manageStudents(officialClass)" class="btn-manage">
              <i class="fas fa-user-cog"></i> Quản lý sinh viên
            </button>
          </div>
        </div>

        <div v-if="filteredClasses.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>Không tìm thấy lớp học nào</p>
          <button @click="openAddModal" class="btn-add-empty">
            <i class="fas fa-plus"></i> Tạo lớp mới
          </button>
        </div>
      </div>
    </div>

    <!-- Official Class Modal -->
    <OfficialClassModal
      :isOpen="showClassModal"
      :officialClass="selectedClass"
      @close="closeClassModal"
      @submit="handleSubmitClass"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import OfficialClassModal from '@/components/Students-Manager/OfficialClassModal.vue'

// State
const classes = ref([])
const filters = ref({
  search: '',
  major: '',
  course: '',
  status: ''
})

const showClassModal = ref(false)
const selectedClass = ref(null)

// Mock data
const mockClasses = [
  {
    id: 1,
    code: '22IT1',
    name: 'Lớp Công nghệ thông tin 1',
    major: 'IT',
    course: '2022',
    maxStudents: 50,
    studentCount: 45,
    status: 'active',
    advisorId: 1,
    advisorName: 'TS. Nguyễn Văn A',
    notes: 'Lớp chuyên ngành AI',
    students: []
  },
  {
    id: 2,
    code: '22IT2',
    name: 'Lớp Công nghệ thông tin 2',
    major: 'IT',
    course: '2022',
    maxStudents: 50,
    studentCount: 48,
    status: 'active',
    advisorId: 2,
    advisorName: 'ThS. Trần Thị B',
    notes: '',
    students: []
  },
  {
    id: 3,
    code: '23CS1',
    name: 'Lớp Khoa học máy tính 1',
    major: 'CS',
    course: '2023',
    maxStudents: 45,
    studentCount: 42,
    status: 'active',
    advisorId: 3,
    advisorName: 'TS. Lê Văn C',
    notes: '',
    students: []
  },
  {
    id: 4,
    code: '21IT1',
    name: 'Lớp Công nghệ thông tin 1',
    major: 'IT',
    course: '2021',
    maxStudents: 50,
    studentCount: 50,
    status: 'completed',
    advisorId: 4,
    advisorName: 'PGS.TS. Phạm Thị D',
    notes: 'Đã tốt nghiệp tháng 6/2025',
    students: []
  },
  {
    id: 5,
    code: '24SE1',
    name: 'Lớp Kỹ thuật phần mềm 1',
    major: 'SE',
    course: '2024',
    maxStudents: 40,
    studentCount: 38,
    status: 'active',
    advisorId: 5,
    advisorName: 'TS. Hoàng Văn E',
    notes: '',
    students: []
  }
]

// Initialize data
classes.value = mockClasses

// Computed
const statistics = computed(() => ({
  totalClasses: classes.value.length,
  activeClasses: classes.value.filter((c) => c.status === 'active').length,
  totalStudents: classes.value.reduce((sum, c) => sum + (c.studentCount || 0), 0),
  totalAdvisors: new Set(classes.value.map((c) => c.advisorId).filter(Boolean)).size
}))

const filteredClasses = computed(() => {
  let result = classes.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(
      (c) =>
        c.code.toLowerCase().includes(search) ||
        c.name.toLowerCase().includes(search)
    )
  }

  if (filters.value.major) {
    result = result.filter((c) => c.major === filters.value.major)
  }

  if (filters.value.course) {
    result = result.filter((c) => c.course === filters.value.course)
  }

  if (filters.value.status) {
    result = result.filter((c) => c.status === filters.value.status)
  }

  return result
})

// Methods
const getMajorLabel = (major) => {
  const labels = {
    IT: 'Công nghệ thông tin',
    CS: 'Khoa học máy tính',
    IS: 'Hệ thống thông tin',
    SE: 'Kỹ thuật phần mềm',
    DS: 'Khoa học dữ liệu',
    AI: 'Trí tuệ nhân tạo'
  }
  return labels[major] || major
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Đang hoạt động',
    inactive: 'Ngừng hoạt động',
    completed: 'Đã tốt nghiệp'
  }
  return labels[status] || status
}

const openAddModal = () => {
  selectedClass.value = null
  showClassModal.value = true
}

const editClass = (officialClass) => {
  selectedClass.value = { ...officialClass }
  showClassModal.value = true
}

const viewClass = (officialClass) => {
  // Navigate to class detail page or show detail modal
  console.log('View class:', officialClass)
  alert(`Chi tiết lớp ${officialClass.code}\nSinh viên: ${officialClass.studentCount}/${officialClass.maxStudents}\nCố vấn: ${officialClass.advisorName}`)
}

const manageStudents = (officialClass) => {
  // Open modal to manage students in this class
  editClass(officialClass)
}

const deleteClass = (classId) => {
  if (confirm('Bạn có chắc chắn muốn xóa lớp này?')) {
    classes.value = classes.value.filter((c) => c.id !== classId)
    alert('Đã xóa lớp thành công!')
  }
}

const handleSubmitClass = (classData) => {
  if (selectedClass.value) {
    // Update existing class
    const index = classes.value.findIndex((c) => c.id === selectedClass.value.id)
    if (index !== -1) {
      classes.value[index] = {
        ...classes.value[index],
        ...classData,
        id: selectedClass.value.id
      }
      alert('Đã cập nhật lớp thành công!')
    }
  } else {
    // Add new class
    const newClass = {
      ...classData,
      id: Date.now(),
      advisorName: getAdvisorName(classData.advisorId)
    }
    classes.value.push(newClass)
    alert('Đã tạo lớp mới thành công!')
  }
}

const getAdvisorName = (advisorId) => {
  const advisors = {
    1: 'TS. Nguyễn Văn A',
    2: 'ThS. Trần Thị B',
    3: 'TS. Lê Văn C',
    4: 'PGS.TS. Phạm Thị D',
    5: 'TS. Hoàng Văn E'
  }
  return advisors[advisorId] || ''
}

const closeClassModal = () => {
  showClassModal.value = false
  selectedClass.value = null
}

const resetFilters = () => {
  filters.value = {
    search: '',
    major: '',
    course: '',
    status: ''
  }
}
</script>

<style scoped>
.official-class-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content h1 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.btn-add {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.page-content {
  max-width: 1400px;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-card i {
  font-size: 40px;
  color: #667eea;
}

.stat-card h3 {
  margin: 0 0 4px;
  font-size: 32px;
  color: #2c3e50;
}

.stat-card p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

/* Filters */
.filters-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filters-container {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr) auto;
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-group input,
.filter-group select {
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-reset {
  padding: 10px 20px;
  background: #f8f9fa;
  color: #7f8c8d;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-reset:hover {
  background: #e9ecef;
  border-color: #cbd5e0;
}

/* Classes Grid */
.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.class-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  border-top: 4px solid #667eea;
}

.class-card.completed {
  border-top-color: #95a5a6;
  opacity: 0.85;
}

.class-card.inactive {
  border-top-color: #e74c3c;
}

.class-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.class-header {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.class-title h3 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 22px;
  font-weight: 700;
}

.class-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.class-status.active {
  background: #d4edda;
  color: #155724;
}

.class-status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.class-status.completed {
  background: #d1ecf1;
  color: #0c5460;
}

.class-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: #667eea;
}

.btn-icon:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}

.btn-icon.delete {
  color: #e74c3c;
}

.btn-icon.delete:hover {
  background: #e74c3c;
  color: white;
}

.class-body {
  padding: 20px;
}

.class-name {
  margin: 0 0 16px;
  color: #2c3e50;
  font-size: 15px;
  font-weight: 600;
}

.class-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
  font-size: 14px;
}

.info-item i {
  width: 20px;
  color: #667eea;
}

.class-advisor {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9ff;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #2c3e50;
  font-size: 14px;
}

.class-advisor i {
  color: #667eea;
  font-size: 16px;
}

.class-stats {
  margin-bottom: 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.stat-item i {
  color: #667eea;
  margin-right: 8px;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.class-footer {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.btn-manage {
  width: 100%;
  padding: 10px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-manage:hover {
  background: #667eea;
  color: white;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  color: #95a5a6;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 24px;
  font-size: 18px;
}

.btn-add-empty {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-add-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

@media (max-width: 1024px) {
  .filters-container {
    grid-template-columns: 1fr 1fr;
  }
  
  .classes-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .filters-container {
    grid-template-columns: 1fr;
  }

  .classes-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
