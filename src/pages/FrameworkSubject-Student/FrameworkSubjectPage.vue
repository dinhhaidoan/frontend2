<template>
  <div class="framework-subject-student-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <i class="fas fa-home"></i>
        <span>Dashboard</span>
        <i class="fas fa-angle-right"></i>
        <span class="current">Chương trình khung</span>
      </div>
      
      <div class="header-main">
        <div class="title-section">
          <h1>
            <i class="fas fa-sitemap"></i>
            Chương trình khung
          </h1>
          <p>Xem chương trình đào tạo và môn học theo từng học kỳ</p>
        </div>
        
        <div class="header-actions">
          <button @click="printProgram" class="btn-print">
            <i class="fas fa-print"></i>
            <span>In chương trình</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <StudentSubjectStats :stats="statistics" />

    <!-- Filters -->
    <StudentSubjectFilters 
      :filters="filters"
      @update:filters="updateFilters"
    />

    <!-- Main Content -->
    <div class="main-content">
      <!-- View Toggle & Info -->
      <div class="content-header">
        <div class="view-info">
          <h3>
            <i class="fas fa-list"></i>
            Danh sách môn học
            <span class="count">({{ filteredSubjectsCount }})</span>
          </h3>
          <p>Chương trình đào tạo ngành {{ studentMajor }}</p>
        </div>
        
        <div class="view-controls">
          <div class="view-toggle">
            <button 
              :class="['view-btn', { active: viewMode === 'table' }]"
              @click="setViewMode('table')"
            >
              <i class="fas fa-table"></i>
              <span>Bảng</span>
            </button>
            <button 
              :class="['view-btn', { active: viewMode === 'semester' }]"
              @click="setViewMode('semester')"
            >
              <i class="fas fa-calendar-alt"></i>
              <span>Theo kỳ</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <StudentSubjectTable
        v-if="viewMode === 'table'"
        :subjects="subjects"
        :filters="filters"
        :student-major="studentMajor"
        @view-subject="viewSubject"
      />

      <!-- Semester View -->
      <div v-else class="semester-view">
        <div
          v-for="semester in semesterData"
          :key="semester.id"
          class="semester-block"
        >
          <div class="semester-header">
            <div class="semester-info">
              <h3>{{ semester.name }}</h3>
              <div class="semester-meta">
                <span class="period">{{ semester.startDate }} - {{ semester.endDate }}</span>
                <span class="credits">{{ semester.totalCredits }} tín chỉ</span>
              </div>
            </div>
            <div class="semester-progress">
              <div class="progress-ring">
                <div class="progress-value">{{ semester.completionRate }}%</div>
              </div>
            </div>
          </div>
          
          <div class="subjects-grid">
            <div
              v-for="subject in semester.subjects"
              :key="subject.id"
              class="subject-card"
              :class="{ 'completed': subject.isCompleted, 'current': subject.isCurrent }"
              @click="viewSubject(subject)"
            >
              <div class="subject-status">
                <i v-if="subject.isCompleted" class="fas fa-check-circle completed-icon"></i>
                <i v-else-if="subject.isCurrent" class="fas fa-play-circle current-icon"></i>
                <i v-else class="fas fa-circle-notch pending-icon"></i>
              </div>
              
              <div class="subject-content">
                <div class="subject-code">{{ subject.code }}</div>
                <h4 class="subject-name">{{ subject.name }}</h4>
                <div class="subject-details">
                  <span class="credits">{{ subject.credits }} TC</span>
                  <span :class="['type-badge', subject.type]">
                    {{ getTypeLabel(subject.type) }}
                  </span>
                </div>
                
                <div v-if="subject.prerequisites.length > 0" class="prerequisites">
                  <small>Môn tiên quyết: {{ subject.prerequisites.map(p => getCourseLabel(p)).join(', ') }}</small>
                </div>
                
                <div v-if="subject.grade" class="grade-info">
                  <span class="grade">Điểm: {{ subject.grade }}</span>
                  <span :class="['grade-status', getGradeStatus(subject.grade)]">
                    {{ getGradeLabel(subject.grade) }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Empty state for semester -->
            <div v-if="semester.subjects.length === 0" class="empty-semester">
              <i class="fas fa-calendar-times"></i>
              <p>Chưa có môn học trong học kỳ này</p>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-if="semesterData.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-graduation-cap"></i>
          </div>
          <h3>Chưa có dữ liệu chương trình</h3>
          <p>Thông tin chương trình đào tạo sẽ được cập nhật sớm</p>
        </div>
      </div>
    </div>

    <!-- Subject Detail Modal -->
    <StudentSubjectModal
      :is-visible="modalVisible"
      :subject="selectedSubject"
      :student-major="studentMajor"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import StudentSubjectStats from '../../components/FrameworkSubject-Student/StudentSubjectStats.vue'
import StudentSubjectFilters from '../../components/FrameworkSubject-Student/StudentSubjectFilters.vue'
import StudentSubjectTable from '../../components/FrameworkSubject-Student/StudentSubjectTable.vue'
import StudentSubjectModal from '../../components/FrameworkSubject-Student/StudentSubjectModal.vue'

// State
const viewMode = ref('semester')
const modalVisible = ref(false)
const selectedSubject = ref(null)
const studentMajor = ref('Công nghệ thông tin') // This would come from user profile

// Filters
const filters = reactive({
  search: '',
  type: 'all',
  semester: '',
  status: 'all',
  academicYear: ''
})

// Mock data - Student's curriculum
const subjects = ref([
  {
    id: 1,
    code: 'IT101',
    name: 'Nhập môn Công nghệ thông tin',
    englishName: 'Introduction to Information Technology',
    credits: 3,
    type: 'required',
    semester: 1,
    academicYear: 1,
    prerequisites: [],
    status: 'active',
    description: 'Môn học giới thiệu tổng quan về lĩnh vực CNTT',
    content: 'Các khái niệm cơ bản, lịch sử phát triển, ứng dụng của CNTT...',
    isCompleted: true,
    isCurrent: false,
    grade: 8.5,
    completedDate: '2024-01-15'
  },
  {
    id: 2,
    code: 'MATH101',
    name: 'Toán cao cấp A1',
    englishName: 'Advanced Mathematics A1',
    credits: 3,
    type: 'required',
    semester: 1,
    academicYear: 1,
    prerequisites: [],
    status: 'active',
    description: 'Nền tảng toán học cho khoa học máy tính',
    content: 'Giới hạn, đạo hàm, tích phân...',
    isCompleted: true,
    isCurrent: false,
    grade: 7.8,
    completedDate: '2024-01-15'
  },
  {
    id: 3,
    code: 'ENG101',
    name: 'Tiếng Anh 1',
    englishName: 'English 1',
    credits: 3,
    type: 'required',
    semester: 1,
    academicYear: 1,
    prerequisites: [],
    status: 'active',
    description: 'Tiếng Anh cơ bản',
    content: 'Ngữ pháp, từ vựng, giao tiếp cơ bản...',
    isCompleted: true,
    isCurrent: false,
    grade: 8.0,
    completedDate: '2024-01-15'
  },
  {
    id: 4,
    code: 'IT102',
    name: 'Toán rời rạc',
    englishName: 'Discrete Mathematics',
    credits: 3,
    type: 'required',
    semester: 2,
    academicYear: 1,
    prerequisites: ['MATH101'],
    status: 'active',
    description: 'Nền tảng toán học cho khoa học máy tính',
    content: 'Logic, tập hợp, quan hệ, đồ thị, tổ hợp...',
    isCompleted: false,
    isCurrent: true,
    grade: null,
    completedDate: null
  },
  {
    id: 5,
    code: 'IT201',
    name: 'Cấu trúc dữ liệu và Giải thuật',
    englishName: 'Data Structures and Algorithms',
    credits: 4,
    type: 'required',
    semester: 2,
    academicYear: 1,
    prerequisites: ['IT101'],
    status: 'active',
    description: 'Các cấu trúc dữ liệu và giải thuật cơ bản',
    content: 'Mảng, danh sách, ngăn xếp, hàng đợi, cây, đồ thị...',
    isCompleted: false,
    isCurrent: true,
    grade: null,
    completedDate: null
  },
  {
    id: 6,
    code: 'IT301',
    name: 'Trí tuệ nhân tạo',
    englishName: 'Artificial Intelligence',
    credits: 3,
    type: 'elective',
    semester: 5,
    academicYear: 3,
    prerequisites: ['IT201', 'IT102'],
    status: 'active',
    description: 'Các khái niệm và kỹ thuật cơ bản trong AI',
    content: 'Tìm kiếm, logic, học máy, mạng neural...',
    isCompleted: false,
    isCurrent: false,
    grade: null,
    completedDate: null
  }
])

// Semester organization
const semesterData = computed(() => {
  const semesters = [
    {
      id: 1,
      name: 'Học kỳ 1 - Năm 1',
      startDate: '2024-09-01',
      endDate: '2025-01-15',
      subjects: subjects.value.filter(s => s.semester === 1 && s.academicYear === 1)
    },
    {
      id: 2,
      name: 'Học kỳ 2 - Năm 1',
      startDate: '2025-02-01',
      endDate: '2025-06-15',
      subjects: subjects.value.filter(s => s.semester === 2 && s.academicYear === 1)
    },
    {
      id: 5,
      name: 'Học kỳ 1 - Năm 3',
      startDate: '2026-09-01',
      endDate: '2027-01-15',
      subjects: subjects.value.filter(s => s.semester === 5 && s.academicYear === 3)
    }
  ]
  
  return semesters.map(semester => {
    const totalCredits = semester.subjects.reduce((sum, s) => sum + s.credits, 0)
    const completedSubjects = semester.subjects.filter(s => s.isCompleted).length
    const completionRate = semester.subjects.length > 0 
      ? Math.round((completedSubjects / semester.subjects.length) * 100)
      : 0
    
    return {
      ...semester,
      totalCredits,
      completionRate
    }
  }).filter(s => s.subjects.length > 0)
})

// Computed
const statistics = computed(() => {
  const total = subjects.value.length
  const completed = subjects.value.filter(s => s.isCompleted).length
  const current = subjects.value.filter(s => s.isCurrent).length
  const remaining = total - completed - current
  
  const required = subjects.value.filter(s => s.type === 'required').length
  const elective = subjects.value.filter(s => s.type === 'elective').length
  
  const totalCredits = subjects.value.reduce((sum, s) => sum + s.credits, 0)
  const completedCredits = subjects.value.filter(s => s.isCompleted).reduce((sum, s) => sum + s.credits, 0)
  const currentCredits = subjects.value.filter(s => s.isCurrent).reduce((sum, s) => sum + s.credits, 0)
  const remainingCredits = totalCredits - completedCredits - currentCredits
  
  const gpa = subjects.value.filter(s => s.grade).length > 0
    ? subjects.value.filter(s => s.grade).reduce((sum, s) => sum + s.grade, 0) / subjects.value.filter(s => s.grade).length
    : 0
  
  return {
    totalSubjects: total,
    completedSubjects: completed,
    currentSubjects: current,
    remainingSubjects: remaining,
    requiredSubjects: required,
    electiveSubjects: elective,
    totalCredits,
    completedCredits,
    currentCredits,
    remainingCredits,
    gpa: gpa.toFixed(2),
    progressPercentage: Math.round((completed / total) * 100)
  }
})

const filteredSubjects = computed(() => {
  let filtered = [...subjects.value]
  
  // Apply filters
  if (filters.search) {
    const search = filters.search.toLowerCase()
    filtered = filtered.filter(subject =>
      subject.code.toLowerCase().includes(search) ||
      subject.name.toLowerCase().includes(search) ||
      (subject.englishName && subject.englishName.toLowerCase().includes(search))
    )
  }
  
  if (filters.type && filters.type !== 'all') {
    filtered = filtered.filter(subject => subject.type === filters.type)
  }
  
  if (filters.semester) {
    filtered = filtered.filter(subject => subject.semester === parseInt(filters.semester))
  }
  
  if (filters.status && filters.status !== 'all') {
    if (filters.status === 'completed') {
      filtered = filtered.filter(subject => subject.isCompleted)
    } else if (filters.status === 'current') {
      filtered = filtered.filter(subject => subject.isCurrent)
    } else if (filters.status === 'remaining') {
      filtered = filtered.filter(subject => !subject.isCompleted && !subject.isCurrent)
    }
  }
  
  if (filters.academicYear) {
    filtered = filtered.filter(subject => subject.academicYear === parseInt(filters.academicYear))
  }
  
  return filtered
})

const filteredSubjectsCount = computed(() => filteredSubjects.value.length)

// Methods
const updateFilters = (newFilters) => {
  Object.assign(filters, newFilters)
}

const setViewMode = (mode) => {
  viewMode.value = mode
}

const viewSubject = (subject) => {
  selectedSubject.value = subject
  modalVisible.value = true
}

const closeModal = () => {
  modalVisible.value = false
  selectedSubject.value = null
}

const exportSchedule = () => {
  showNotification('Đang xuất lịch học...', 'info')
  // Implement export logic
}

const printProgram = () => {
  window.print()
}

const getTypeLabel = (type) => {
  const labels = {
    'required': 'Bắt buộc',
    'elective': 'Tự chọn',
    'specialization': 'Chuyên ngành'
  }
  return labels[type] || type
}

const getGradeStatus = (grade) => {
  if (grade >= 8.5) return 'excellent'
  if (grade >= 7.0) return 'good'
  if (grade >= 5.5) return 'average'
  if (grade >= 4.0) return 'poor'
  return 'fail'
}

const getGradeLabel = (grade) => {
  if (grade >= 8.5) return 'Xuất sắc'
  if (grade >= 7.0) return 'Khá'
  if (grade >= 5.5) return 'Trung bình'
  if (grade >= 4.0) return 'Yếu'
  return 'Kém'
}

const showNotification = (message, type = 'info') => {
  // Simple notification implementation
  console.log(`${type.toUpperCase()}: ${message}`)
}

// Courses lookup for resolving prerequisites (use live courses for names if available)
import { useCourses } from '@/hooks/useCourses'
const { courses, fetchCourses } = useCourses()

// Lifecycle
onMounted(async () => {
  try {
    await fetchCourses({ page: 1, limit: 100 })
  } catch(e) {
    // ignore, fallback to local subject.prerequisites values
  }
})

const getCourseLabel = (courseRef) => {
  if (!courseRef && courseRef !== 0) return ''
  const s = String(courseRef)
  // find in global courses
  const found = (courses && courses.value ? courses.value : []).map(c => c.raw || c).find(c => String(c.id || c.course_id || c.sku || c.course_SKU || c.code) === s)
  if (found) return (found.sku || found.course_SKU || found.code || String(found.id)) + (found.course_name_vn || found.name_vn || found.name ? ' - ' + (found.course_name_vn || found.name_vn || found.name) : '')
  return s
}
</script>

<style scoped>
.framework-subject-student-page {
  min-height: 100vh;
  background: #f8fafc;
  padding: 20px;
}

.page-header {
  margin-bottom: 32px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #6b7280;
}

.breadcrumb i {
  font-size: 12px;
}

.breadcrumb .current {
  color: #3b82f6;
  font-weight: 600;
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.title-section h1 {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.2;
}

.title-section p {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.btn-export,
.btn-print {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  white-space: nowrap;
}

.btn-export {
  background: white;
  color: #059669;
  border: 2px solid #059669;
}

.btn-export:hover {
  background: #059669;
  color: white;
  transform: translateY(-1px);
}

.btn-print {
  background: white;
  color: #7c3aed;
  border: 2px solid #7c3aed;
}

.btn-print:hover {
  background: #7c3aed;
  color: white;
  transform: translateY(-1px);
}

.main-content {
  margin-top: 32px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.view-info h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

.count {
  color: #6b7280;
  font-weight: 500;
}

.view-info p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.view-toggle {
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  background: white;
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.view-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.view-btn.active {
  background: #3b82f6;
  color: white;
}

/* Semester View */
.semester-view {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.semester-block {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.semester-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.semester-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.semester-meta {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
}

.period,
.credits {
  display: flex;
  align-items: center;
  gap: 6px;
}

.semester-progress {
  display: flex;
  align-items: center;
}

.progress-ring {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: conic-gradient(#3b82f6 var(--progress, 0%), #e5e7eb 0%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.progress-ring::before {
  content: '';
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  position: absolute;
}

.progress-value {
  position: relative;
  z-index: 1;
  font-size: 12px;
  font-weight: 700;
  color: #1f2937;
}

.subjects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.subject-card {
  background: #f8fafc;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  gap: 16px;
}

.subject-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.subject-card.completed {
  background: rgba(16, 185, 129, 0.05);
  border-color: #10b981;
}

.subject-card.current {
  background: rgba(59, 130, 246, 0.05);
  border-color: #3b82f6;
}

.subject-status {
  display: flex;
  align-items: flex-start;
  padding-top: 4px;
}

.completed-icon {
  color: #10b981;
  font-size: 20px;
}

.current-icon {
  color: #3b82f6;
  font-size: 20px;
}

.pending-icon {
  color: #9ca3af;
  font-size: 20px;
}

.subject-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subject-code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 700;
  font-size: 12px;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  width: fit-content;
}

.subject-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.subject-details {
  display: flex;
  gap: 12px;
  align-items: center;
}

.credits {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.type-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.type-badge.required {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.type-badge.elective {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.prerequisites {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

.grade-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.grade {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
}

.grade-status {
  font-size: 12px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 12px;
}

.grade-status.excellent {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.grade-status.good {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.grade-status.average {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.grade-status.poor {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.grade-status.fail {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}

.empty-semester {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-semester i {
  font-size: 32px;
  margin-bottom: 12px;
  color: #d1d5db;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 16px;
  border: 2px dashed #e5e7eb;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(107, 114, 128, 0.1);
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 24px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1f2937;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
}

@media (max-width: 1024px) {
  .header-main {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
  
  .header-actions {
    justify-content: center;
  }
  
  .content-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .view-controls {
    justify-content: center;
  }
  
  .subjects-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .framework-subject-student-page {
    padding: 16px;
  }
  
  .title-section h1 {
    font-size: 24px;
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .header-actions {
    flex-direction: column;
  }
  
  .subjects-grid {
    grid-template-columns: 1fr;
  }
  
  .subject-card {
    padding: 16px;
    flex-direction: column;
    gap: 12px;
  }
  
  .semester-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .progress-ring {
    align-self: center;
  }
}
</style>