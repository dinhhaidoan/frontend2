<template>
  <div class="my-classes-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-graduation-cap"></i>
          Lớp học của tôi
        </h1>
        <p class="header-subtitle">Quản lý và theo dõi các lớp học đang tham gia</p>
      </div>
      <div class="header-actions">
        <button @click="refreshClasses" class="btn-action">
          <i class="fas fa-sync-alt"></i>
          Làm mới
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <StudentClassStats :stats="stats" />

    <!-- Main Content -->
    <div class="main-section">
      <!-- Filters Sidebar -->
      <div class="sidebar">
        <StudentClassFilters :filters="filters" @update="updateFilters" />
      </div>

      <!-- Classes Grid -->
      <div class="content-area">
        <div class="content-header">
          <h2>
            <i class="fas fa-book-open"></i>
            Danh sách lớp học
            <span class="class-count">({{ filteredClasses.length }})</span>
          </h2>
          <div class="view-options">
            <button 
              @click="viewMode = 'grid'" 
              :class="['view-btn', { active: viewMode === 'grid' }]"
            >
              <i class="fas fa-th"></i>
            </button>
            <button 
              @click="viewMode = 'list'" 
              :class="['view-btn', { active: viewMode === 'list' }]"
            >
              <i class="fas fa-list"></i>
            </button>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="filteredClasses.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>Không tìm thấy lớp học</h3>
          <p>Thử thay đổi bộ lọc để xem các lớp học khác</p>
        </div>

        <!-- Classes Grid/List View -->
        <div v-else :class="['classes-container', viewMode]">
          <StudentClassCard
            v-for="classItem in filteredClasses"
            :key="classItem.id"
            :class-data="classItem"
            @click="openClassDetail"
            @view-details="openClassDetail"
          />
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <StudentClassDetailModal
      v-if="showDetailModal"
      :class-data="selectedClass"
      @close="closeDetailModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import StudentClassStats from '@/components/MyClass-Students/StudentClassStats.vue'
import StudentClassFilters from '@/components/MyClass-Students/StudentClassFilters.vue'
import StudentClassCard from '@/components/MyClass-Students/StudentClassCard.vue'
import StudentClassDetailModal from '@/components/MyClass-Students/StudentClassDetailModal.vue'

// Stats data
const stats = ref({
  totalClasses: 5,
  attendanceRate: 92,
  completedAssignments: 12,
  totalAssignments: 15,
  averageGrade: 8.2
})

// Filters
const filters = ref({
  semester: 'all',
  status: 'all',
  classType: 'all',
  subject: 'all'
})

// View mode
const viewMode = ref('grid')

// Modal state
const showDetailModal = ref(false)
const selectedClass = ref(null)

// Mock data - Danh sách lớp học mà sinh viên đang tham gia
const mockClasses = ref([
  {
    id: 1,
    name: 'Lập trình Web nâng cao',
    code: 'WEB301',
    subject: 'Lập trình Web',
    subjectCode: 'web',
    type: 'theory',
    semester: 'HK1 2024-2025',
    credits: 3,
    schedule: 'Thứ 2, 7:30 - 10:30',
    room: 'A101',
    studentCount: 45,
    attendance: 95,
    completedAssignments: 3,
    totalAssignments: 4,
    currentGrade: 8.5,
    status: 'active',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    teacher: {
      name: 'TS. Nguyễn Văn A',
      title: 'Tiến sĩ - Giảng viên',
      avatar: 'https://i.pravatar.cc/150?img=12',
      email: 'nguyenvana@university.edu.vn',
      phone: '0123 456 789'
    }
  },
  {
    id: 2,
    name: 'Thực hành Lập trình Web',
    code: 'WEB301.1',
    subject: 'Lập trình Web',
    subjectCode: 'web',
    type: 'practice',
    semester: 'HK1 2024-2025',
    credits: 2,
    schedule: 'Thứ 4, 13:30 - 16:30',
    room: 'LAB1',
    studentCount: 45,
    attendance: 92,
    completedAssignments: 4,
    totalAssignments: 4,
    currentGrade: 9.0,
    status: 'active',
    meetLink: 'https://meet.google.com/xyz-uvwx-rst',
    teacher: {
      name: 'ThS. Trần Thị B',
      title: 'Thạc sĩ - Giảng viên',
      avatar: 'https://i.pravatar.cc/150?img=26',
      email: 'tranthib@university.edu.vn',
      phone: '0123 456 790'
    }
  },
  {
    id: 3,
    name: 'Lập trình Mobile Android',
    code: 'MOB201',
    subject: 'Lập trình Mobile',
    subjectCode: 'mobile',
    type: 'theory',
    semester: 'HK1 2024-2025',
    credits: 3,
    schedule: 'Thứ 3, 7:30 - 10:30',
    room: 'B202',
    studentCount: 38,
    attendance: 88,
    completedAssignments: 2,
    totalAssignments: 4,
    currentGrade: 7.8,
    status: 'active',
    meetLink: 'https://meet.google.com/mob-andr-oid',
    teacher: {
      name: 'ThS. Lê Văn C',
      title: 'Thạc sĩ - Giảng viên',
      avatar: 'https://i.pravatar.cc/150?img=33',
      email: 'levanc@university.edu.vn',
      phone: '0123 456 791'
    }
  },
  {
    id: 4,
    name: 'Cơ sở dữ liệu nâng cao',
    code: 'DB301',
    subject: 'Cơ sở dữ liệu',
    subjectCode: 'database',
    type: 'theory',
    semester: 'HK1 2024-2025',
    credits: 3,
    schedule: 'Thứ 5, 7:30 - 10:30',
    room: 'C103',
    studentCount: 42,
    attendance: 90,
    completedAssignments: 3,
    totalAssignments: 3,
    currentGrade: 8.2,
    status: 'active',
    teacher: {
      name: 'PGS.TS. Phạm Thị D',
      title: 'Phó Giáo sư - Tiến sĩ',
      avatar: 'https://i.pravatar.cc/150?img=45',
      email: 'phamthid@university.edu.vn',
      phone: '0123 456 792'
    }
  },
  {
    id: 5,
    name: 'Mạng máy tính',
    code: 'NET201',
    subject: 'Mạng máy tính',
    subjectCode: 'network',
    type: 'theory',
    semester: 'HK2 2024-2025',
    credits: 3,
    schedule: 'Thứ 6, 7:30 - 10:30',
    room: 'A205',
    studentCount: 40,
    attendance: 0,
    completedAssignments: 0,
    totalAssignments: 0,
    currentGrade: null,
    status: 'upcoming',
    teacher: {
      name: 'ThS. Hoàng Văn E',
      title: 'Thạc sĩ - Giảng viên',
      avatar: 'https://i.pravatar.cc/150?img=51',
      email: 'hoangvane@university.edu.vn',
      phone: '0123 456 793'
    }
  }
])

// Computed - Filtered classes
const filteredClasses = computed(() => {
  let result = [...mockClasses.value]

  if (filters.value.semester !== 'all') {
    result = result.filter(c => c.semester === filters.value.semester)
  }

  if (filters.value.status !== 'all') {
    result = result.filter(c => c.status === filters.value.status)
  }

  if (filters.value.classType !== 'all') {
    result = result.filter(c => c.type === filters.value.classType)
  }

  if (filters.value.subject !== 'all') {
    result = result.filter(c => c.subjectCode === filters.value.subject)
  }

  return result
})

// Methods
const updateFilters = (newFilters) => {
  filters.value = { ...filters.value, ...newFilters }
}

const refreshClasses = () => {
  console.log('Refreshing classes...')
  // TODO: Implement API call to refresh classes
}

const openClassDetail = (classData) => {
  selectedClass.value = classData
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedClass.value = null
}
</script>

<style scoped>
.my-classes-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content h1 i {
  color: #3b82f6;
}

.header-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-action {
  padding: 10px 20px;
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

.main-section {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  min-height: calc(100vh - 300px);
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
  font-size: 20px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.content-header h2 i {
  color: #3b82f6;
}

.class-count {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
}

.view-options {
  display: flex;
  gap: 8px;
}

.view-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.view-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 72px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #6b7280;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.classes-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
}

.classes-container.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 1200px) {
  .main-section {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .my-classes-container {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .btn-action {
    flex: 1;
  }

  .sidebar {
    grid-template-columns: 1fr;
  }

  .classes-container.grid {
    grid-template-columns: 1fr;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
