<template>
  <div class="my-class-container">
    <div class="top-section">
      <ClassStats :stats="stats" />
    </div>

    <div class="main-section">
      <div class="sidebar">
        <ClassFilters :filters="filters" @update="updateFilters" />
      </div>

      <div class="content-area">
        <div class="content-header">
          <h2>
            <i class="fas fa-chalkboard-teacher"></i>
            Lớp học phụ trách
          </h2>
          <div class="header-actions">
            <button @click="refreshClasses" class="btn-action" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              {{ loading ? 'Đang tải...' : 'Làm mới' }}
            </button>
          </div>
        </div>

        <div v-if="loading" class="loading-state" style="text-align: center; padding: 40px;">
           <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3b82f6;"></i>
           <p style="margin-top: 10px; color: #6b7280;">Đang tải dữ liệu lớp học...</p>
        </div>

        <ClassGridView 
          v-else
          :classes="mappedClasses" 
          :filters="filters"
          @class-click="openClassDetail"
        />
      </div>
    </div>

    <ClassDetailModal 
      v-if="showClassModal" 
      :class-data="selectedClass" 
      @close="closeClassModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useCourseClasses } from '@/hooks/useCourseClasses' // Import Hook lấy dữ liệu thật
import { useSemesters } from '@/hooks/useSemesters'
import ClassStats from '@/components/MyClass/ClassStats.vue'
import ClassFilters from '@/components/MyClass/ClassFilters.vue'
import ClassGridView from '@/components/MyClass/ClassGridView.vue'
import ClassDetailModal from '@/components/MyClass/ClassDetailModal.vue'

// 1. Khởi tạo Hook
const { 
  courseClasses, // Dữ liệu lớp học từ API (đã là computed ref)
  loading, 
  fetchCourseClasses,
  total, // Tổng số lớp (để tính stats tạm thời)
  // getCourseClass (no longer used to fetch students on modal open)
} = useCourseClasses()

// Semesters list for mapping semester name display
const { semesters, fetchSemesters, loading: semestersLoading } = useSemesters()

// 2. State quản lý Filters & Modal
const filters = ref({
  semester: 'all',
  classType: 'all',
  subject: 'all',
  status: 'all'
})

const showClassModal = ref(false)
const selectedClass = ref(null)

// 3. Mapping Data (Quan trọng)
// Chuyển đổi dữ liệu từ API sang format mà ClassGridView đang dùng
const mappedClasses = computed(() => {
  // Create a quick map of id->name from semesters to resolve semester display
  const semMap = (semesters && semesters.value) ? semesters.value.reduce((acc, s) => {
    if (s && s.id) acc[String(s.id)] = s.name || s.title || s.semester_name || s.name
    if (s && s.name) acc[s.name] = s.name
    return acc
  }, {}) : {}

  return courseClasses.value.map(item => ({
    id: item.id || item._id, // Fallback nếu ID khác nhau
    name: item.name,
    code: item.code,
    // API có thể trả về object subject hoặc string, cần xử lý an toàn
    subject: item.subject?.name || item.subject_name || 'Chưa cập nhật', 
    subjectCode: item.subject?.code || 'general',
    // Giả định logic mapping cho type (Lý thuyết/Thực hành) dựa trên tên hoặc trường type từ API
    type: item.type || (item.name.toLowerCase().includes('thực hành') ? 'practice' : 'theory'),
    // Resolve semester label: prefer an actual Semester name if we have semesterId
    semester: item.semester?.name || item.semester || semMap[String(item.semesterId)] || item.raw?.semester?.semester_name || 'Chưa cập nhật', // Fallback nếu chưa có semester real
    studentCount: item.student_count || item.max_students || 0,
    // room removed per UX request
    attendance: item.attendance_rate || 0, // Giả định trường này từ API
    status: mapStatus(item.status) // Hàm helper map status bên dưới
  }))
})

// Helper để map status từ API (ví dụ: 'opened', 'closed') sang status của UI ('active', 'completed')
const mapStatus = (apiStatus) => {
  const map = {
    'opened': 'active',
    'active': 'active',
    'closed': 'completed',
    'completed': 'completed',
    'upcoming': 'upcoming'
  }
  return map[apiStatus] || 'active'
}

// 4. Stats (Tạm thời tính toán dựa trên dữ liệu tải về hoặc số liệu ảo)
// Lý tưởng nhất là có 1 API riêng cho thống kê: /api/course-classes/stats
const stats = computed(() => ({
  totalClasses: total.value || mappedClasses.value.length,
  totalStudents: mappedClasses.value.reduce((sum, item) => sum + (item.studentCount || 0), 0),
  totalSessions: 45, // Placeholder
  avgAttendance: 92, // Placeholder
  pendingGrades: 0,
  avgGrade: 0
}))

// 5. Actions
const updateFilters = (newFilters) => {
  filters.value = { ...filters.value, ...newFilters }
  // Nếu muốn filter server-side thì gọi fetch lại ở đây:
  // fetchCourseClasses({ ...filters.value })
}

const refreshClasses = async () => {
  await fetchCourseClasses({ 
    page: 1, 
    limit: 100 // Tải nhiều để filter client-side tạm thời
  })
}

const exportClasses = () => {
  console.log('Exporting classes...', mappedClasses.value)
}

const openClassDetail = async (classData) => {
  // Hiển thị dữ liệu cơ bản trước để UI phản hồi nhanh
  selectedClass.value = { 
    ...classData, 
    students: [] // Reset danh sách sinh viên trong khi chờ tải
  } 
    showClassModal.value = true
}

const closeClassModal = () => {
  showClassModal.value = false
  selectedClass.value = null
}

// 6. Lifecycle
onMounted(() => {
  (async () => {
    await Promise.all([
      refreshClasses(),
      fetchSemesters({ page: 1, limit: 100 })
    ])
  })()
})
</script>

<style scoped>
.my-class-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.top-section {
  margin-bottom: 20px;
}

.main-section {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  min-height: calc(100vh - 200px);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-area {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 24px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
}

.content-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-header h2 i {
  color: #3b82f6;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-action {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-action:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-action.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-action.primary:hover {
  background: #2563eb;
}

@media (max-width: 1200px) {
  .main-section {
    grid-template-columns: 1fr;
  }

  .sidebar {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .my-class-container {
    padding: 12px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .btn-action {
    flex: 1;
  }
}
</style>
