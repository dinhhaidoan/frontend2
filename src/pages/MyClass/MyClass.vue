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
            <button @click="refreshClasses" class="btn-action">
              <i class="fas fa-sync-alt"></i>
              Làm mới
            </button>
            <button @click="exportClasses" class="btn-action primary">
              <i class="fas fa-download"></i>
              Xuất danh sách
            </button>
          </div>
        </div>

        <ClassGridView 
          :classes="mockClasses" 
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
import { ref } from 'vue'
import ClassStats from '@/components/MyClass/ClassStats.vue'
import ClassFilters from '@/components/MyClass/ClassFilters.vue'
import ClassGridView from '@/components/MyClass/ClassGridView.vue'
import ClassDetailModal from '@/components/MyClass/ClassDetailModal.vue'

const stats = ref({
  totalClasses: 6,
  totalStudents: 245,
  totalSessions: 45,
  avgAttendance: 92,
  pendingGrades: 8,
  avgGrade: 7.5
})

const filters = ref({
  semester: 'all',
  classType: 'all',
  subject: 'all',
  status: 'all'
})

const showClassModal = ref(false)
const selectedClass = ref(null)

// Mock data
const mockClasses = ref([
  {
    id: 1,
    name: 'Lập trình Web nâng cao',
    code: 'WEB301',
    subject: 'Lập trình Web',
    subjectCode: 'web',
    type: 'theory',
    semester: 'HK1 2024-2025',
    studentCount: 45,
    room: 'A101',
    attendance: 95,
    status: 'active'
  },
  {
    id: 2,
    name: 'Thực hành Lập trình Web',
    code: 'WEB301.1',
    subject: 'Lập trình Web',
    subjectCode: 'web',
    type: 'practice',
    semester: 'HK1 2024-2025',
    studentCount: 45,
    room: 'LAB1',
    attendance: 92,
    status: 'active'
  },
  {
    id: 3,
    name: 'Lập trình Mobile Android',
    code: 'MOB201',
    subject: 'Lập trình Mobile',
    subjectCode: 'mobile',
    type: 'theory',
    semester: 'HK1 2024-2025',
    studentCount: 38,
    room: 'B202',
    attendance: 88,
    status: 'active'
  },
  {
    id: 4,
    name: 'Cơ sở dữ liệu nâng cao',
    code: 'DB301',
    subject: 'Cơ sở dữ liệu',
    subjectCode: 'database',
    type: 'theory',
    semester: 'HK1 2024-2025',
    studentCount: 42,
    room: 'C103',
    attendance: 90,
    status: 'active'
  },
  {
    id: 5,
    name: 'Mạng máy tính',
    code: 'NET201',
    subject: 'Mạng máy tính',
    subjectCode: 'network',
    type: 'theory',
    semester: 'HK2 2024-2025',
    studentCount: 40,
    room: 'A205',
    attendance: 85,
    status: 'upcoming'
  },
  {
    id: 6,
    name: 'Thực hành Mạng',
    code: 'NET201.1',
    subject: 'Mạng máy tính',
    subjectCode: 'network',
    type: 'practice',
    semester: 'HK1 2024-2025',
    studentCount: 35,
    room: 'LAB3',
    attendance: 78,
    status: 'completed'
  }
])

const updateFilters = (newFilters) => {
  filters.value = { ...filters.value, ...newFilters }
}

const refreshClasses = () => {
  console.log('Refreshing classes...')
}

const exportClasses = () => {
  console.log('Exporting classes...')
}

const openClassDetail = (classData) => {
  selectedClass.value = classData
  showClassModal.value = true
}

const closeClassModal = () => {
  showClassModal.value = false
  selectedClass.value = null
}
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
