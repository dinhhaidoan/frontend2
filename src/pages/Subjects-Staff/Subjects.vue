<template>
  <div class="subjects-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <i class="fas fa-home"></i>
        <span>Dashboard</span>
        <i class="fas fa-angle-right"></i>
        <span class="current">Quản lý môn học</span>
      </div>
      
      <div class="header-main">
        <div class="title-section">
          <h1>
            <i class="fas fa-book"></i>
            Quản lý Môn học
          </h1>
          <p>Quản lý môn học từ chương trình đào tạo, gán giáo viên, phòng học và đăng ký</p>
        </div>
        
        <div class="header-actions">
          <button @click="exportData" class="btn-export">
            <i class="fas fa-download"></i>
            <span>Xuất Excel</span>
          </button>
          <button @click="openRegistrationModal" class="btn-registration" :disabled="!hasActiveRegistration">
            <i class="fas fa-user-plus"></i>
            <span>{{ isRegistrationOpen ? 'Đóng đăng ký' : 'Mở đăng ký' }}</span>
          </button>
          <button @click="openAddSubjectModal" class="btn-primary">
            <i class="fas fa-plus"></i>
            <span>Thêm môn học</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Statistics Cards -->
    <SubjectStats :stats="statistics" />

    <!-- Filters -->
    <SubjectFilters 
      :filters="filters"
      :semesters="semesters"
      :teachers="teachers"
      :rooms="rooms"
      @update:filters="updateFilters"
      @reset-filters="resetFilters"
    />

    <!-- Subject Table -->
    <SubjectTable 
      :subjects="filteredSubjects"
      :loading="loading"
      :selected-subjects="selectedSubjects"
      @select:subjects="handleSubjectSelection"
      @edit:subject="editSubject"
      @delete:subject="deleteSubject"
      @view:subject="viewSubject"
      @duplicate:subject="duplicateSubject"
      @toggle:registration="toggleSubjectRegistration"
      @view:students="viewSubjectStudents"
    />

    <!-- Bulk Actions -->
    <BulkActions 
      v-if="selectedSubjects.length > 0"
      :selected-count="selectedSubjects.length"
      @bulk:delete="bulkDeleteSubjects"
      @bulk:assign-teacher="bulkAssignTeacher"
      @bulk:assign-room="bulkAssignRoom"
      @bulk:toggle-registration="bulkToggleRegistration"
      @clear-selection="clearSelection"
    />

    <!-- Modals -->
    <SubjectModal 
      v-if="showSubjectModal"
      :subject="editingSubject"
      :framework-subjects="frameworkSubjects"
      :teachers="teachers"
      :rooms="rooms"
      :semesters="semesters"
      :is-edit="isEditMode"
      @close="closeSubjectModal"
      @save="saveSubject"
    />

    <SubjectViewModal 
      v-if="showViewModal"
      :subject="viewingSubject"
      @close="closeViewModal"
    />

    <TeacherAssignModal 
      v-if="showTeacherModal"
      :subjects="selectedSubjects"
      :teachers="teachers"
      @close="closeTeacherModal"
      @save="saveTeacherAssignment"
    />

    <RoomAssignModal 
      v-if="showRoomModal"
      :subjects="selectedSubjects"
      :rooms="rooms"
      @close="closeRoomModal"
      @save="saveRoomAssignment"
    />

    <RegistrationModal 
      v-if="showRegistrationModal"
      :registration-config="registrationConfig"
      @close="closeRegistrationModal"
      @save="saveRegistrationConfig"
    />

    <SubjectStudentsModal 
      v-if="showStudentsModal"
      :is-open="showStudentsModal"
      :subject="selectedSubjectForStudents"
      @close="closeStudentsModal"
      @update-subject="updateSubjectData"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import SubjectStats from '@/components/Subjects-Staff/SubjectStats.vue'
import SubjectFilters from '@/components/Subjects-Staff/SubjectFilters.vue'
import SubjectTable from '@/components/Subjects-Staff/SubjectTable.vue'
import BulkActions from '@/components/Subjects-Staff/BulkActions.vue'
import SubjectModal from '@/components/Subjects-Staff/SubjectModal.vue'
import SubjectViewModal from '@/components/Subjects-Staff/SubjectViewModal.vue'
import TeacherAssignModal from '@/components/Subjects-Staff/TeacherAssignModal.vue'
import RoomAssignModal from '@/components/Subjects-Staff/RoomAssignModal.vue'
import RegistrationModal from '@/components/Subjects-Staff/RegistrationModal.vue'
import SubjectStudentsModal from '@/components/Subjects-Staff/SubjectStudentsModal.vue'

export default {
  name: 'Subjects',
  components: {
    SubjectStats,
    SubjectFilters,
    SubjectTable,
    BulkActions,
    SubjectModal,
    SubjectViewModal,
    TeacherAssignModal,
    RoomAssignModal,
    RegistrationModal,
    SubjectStudentsModal
  },
  setup() {
    // State
    const loading = ref(false)
    const subjects = ref([])
    const frameworkSubjects = ref([])
    const semesters = ref([])
    const teachers = ref([])
    const rooms = ref([])
    const selectedSubjects = ref([])
    const registrationConfig = ref({})

    // Modals
    const showSubjectModal = ref(false)
    const showViewModal = ref(false)
    const showTeacherModal = ref(false)
    const showRoomModal = ref(false)
    const showRegistrationModal = ref(false)
    const showStudentsModal = ref(false)
    const editingSubject = ref(null)
    const selectedSubjectForStudents = ref(null)
    const viewingSubject = ref(null)
    const isEditMode = ref(false)

    // Filters
    const filters = ref({
      search: '',
      semester: '',
      teacher: '',
      room: '',
      status: '',
      registrationStatus: '',
      department: '',
      credits: ''
    })

    // Computed
    const statistics = computed(() => ({
      total: subjects.value.length,
      active: subjects.value.filter(s => s.status === 'active').length,
      withTeacher: subjects.value.filter(s => s.teacherId).length,
      withRoom: subjects.value.filter(s => s.roomId).length,
      registrationOpen: subjects.value.filter(s => s.registrationOpen).length,
      registered: subjects.value.reduce((sum, s) => sum + (s.registeredCount || 0), 0)
    }))

    const filteredSubjects = computed(() => {
      let result = subjects.value

      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        result = result.filter(subject => 
          subject.name.toLowerCase().includes(search) ||
          subject.code.toLowerCase().includes(search) ||
          (subject.teacherName && subject.teacherName.toLowerCase().includes(search))
        )
      }

      if (filters.value.semester) {
        result = result.filter(subject => subject.semesterId === filters.value.semester)
      }

      if (filters.value.teacher) {
        result = result.filter(subject => subject.teacherId === filters.value.teacher)
      }

      if (filters.value.room) {
        result = result.filter(subject => subject.roomId === filters.value.room)
      }

      if (filters.value.status) {
        result = result.filter(subject => subject.status === filters.value.status)
      }

      if (filters.value.registrationStatus) {
        result = result.filter(subject => {
          if (filters.value.registrationStatus === 'open') return subject.registrationOpen
          if (filters.value.registrationStatus === 'closed') return !subject.registrationOpen
          return true
        })
      }

      if (filters.value.department) {
        result = result.filter(subject => subject.department === filters.value.department)
      }

      if (filters.value.credits) {
        result = result.filter(subject => subject.credits === parseInt(filters.value.credits))
      }

      return result
    })

    const isRegistrationOpen = computed(() => {
      return registrationConfig.value.isOpen || false
    })

    const hasActiveRegistration = computed(() => {
      return subjects.value.some(s => s.registrationOpen)
    })

    // Methods
    const loadData = async () => {
      loading.value = true
      try {
        await Promise.all([
          loadSubjects(),
          loadFrameworkSubjects(),
          loadSemesters(),
          loadTeachers(),
          loadRooms(),
          loadRegistrationConfig()
        ])
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error)
      } finally {
        loading.value = false
      }
    }

    const loadSubjects = async () => {
      // Mock data - thay thế bằng API call thực tế
      subjects.value = [
        {
          id: 1,
          code: 'CS101-01',
          name: 'Lập trình cơ bản',
          frameworkSubjectId: 1,
          semesterId: 1,
          teacherId: 1,
          teacherName: 'Nguyễn Văn A',
          roomId: 1,
          roomName: 'P301',
          credits: 3,
          maxStudents: 40,
          registeredCount: 25,
          status: 'active',
          registrationOpen: true,
          department: 'CNTT',
          description: 'Môn học cơ bản về lập trình',
          schedule: 'Thứ 2, 4, 6 - 7:00-9:00',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          code: 'CS101-02',
          name: 'Lập trình cơ bản',
          frameworkSubjectId: 1,
          semesterId: 1,
          teacherId: 2,
          teacherName: 'Trần Thị B',
          roomId: 2,
          roomName: 'P302',
          credits: 3,
          maxStudents: 40,
          registeredCount: 30,
          status: 'active',
          registrationOpen: true,
          department: 'CNTT',
          description: 'Môn học cơ bản về lập trình - Lớp 2',
          schedule: 'Thứ 3, 5, 7 - 7:00-9:00',
          createdAt: '2024-01-15'
        }
      ]
    }

    const loadFrameworkSubjects = async () => {
      // Mock data - lấy từ trang chương trình đào tạo
      frameworkSubjects.value = [
        {
          id: 1,
          code: 'CS101',
          name: 'Lập trình cơ bản',
          credits: 3,
          description: 'Môn học cơ bản về lập trình',
          department: 'CNTT'
        },
        {
          id: 2,
          code: 'CS102',
          name: 'Cấu trúc dữ liệu',
          credits: 3,
          description: 'Môn học về cấu trúc dữ liệu và giải thuật',
          department: 'CNTT'
        }
      ]
    }

    const loadSemesters = async () => {
      // Mock data
      semesters.value = [
        {
          id: 1,
          name: 'Học kỳ I - 2024-2025',
          startDate: '2024-09-01',
          endDate: '2024-12-31',
          status: 'active'
        },
        {
          id: 2,
          name: 'Học kỳ II - 2024-2025',
          startDate: '2025-01-15',
          endDate: '2025-05-31',
          status: 'upcoming'
        }
      ]
    }

    const loadTeachers = async () => {
      // Mock data
      teachers.value = [
        {
          id: 1,
          name: 'Nguyễn Văn A',
          email: 'nguyenvana@email.com',
          department: 'CNTT',
          specialization: 'Lập trình'
        },
        {
          id: 2,
          name: 'Trần Thị B',
          email: 'tranthib@email.com',
          department: 'CNTT',
          specialization: 'Cơ sở dữ liệu'
        }
      ]
    }

    const loadRooms = async () => {
      // Mock data
      rooms.value = [
        {
          id: 1,
          name: 'P301',
          building: 'Tòa A',
          capacity: 50,
          type: 'Lý thuyết',
          equipment: ['Máy chiếu', 'Máy tính']
        },
        {
          id: 2,
          name: 'P302',
          building: 'Tòa A',
          capacity: 45,
          type: 'Lý thuyết',
          equipment: ['Máy chiếu']
        }
      ]
    }

    const loadRegistrationConfig = async () => {
      // Mock data
      registrationConfig.value = {
        isOpen: true,
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        maxSubjectsPerStudent: 8
      }
    }

    // Filter methods
    const updateFilters = (newFilters) => {
      filters.value = { ...filters.value, ...newFilters }
    }

    const resetFilters = () => {
      filters.value = {
        search: '',
        semester: '',
        teacher: '',
        room: '',
        status: '',
        registrationStatus: '',
        department: '',
        credits: ''
      }
    }

    // Subject methods
    const openAddSubjectModal = () => {
      editingSubject.value = null
      isEditMode.value = false
      showSubjectModal.value = true
    }

    const editSubject = (subject) => {
      editingSubject.value = { ...subject }
      isEditMode.value = true
      showSubjectModal.value = true
    }

    const duplicateSubject = (subject) => {
      editingSubject.value = { 
        ...subject, 
        id: null,
        code: subject.code + '-copy',
        name: subject.name + ' (Sao chép)',
        registeredCount: 0
      }
      isEditMode.value = false
      showSubjectModal.value = true
    }

    const deleteSubject = (subject) => {
      if (confirm(`Bạn có chắc chắn muốn xóa môn học "${subject.name}"?`)) {
        const index = subjects.value.findIndex(s => s.id === subject.id)
        if (index > -1) {
          subjects.value.splice(index, 1)
        }
      }
    }

    const viewSubject = (subject) => {
      viewingSubject.value = subject
      showViewModal.value = true
    }

    const saveSubject = (subjectData) => {
      if (isEditMode.value) {
        // Update existing subject
        const index = subjects.value.findIndex(s => s.id === editingSubject.value.id)
        if (index > -1) {
          subjects.value[index] = { ...subjectData }
        }
      } else {
        // Add new subject
        const newSubject = {
          ...subjectData,
          id: Date.now(),
          registeredCount: 0,
          createdAt: new Date().toISOString().split('T')[0]
        }
        subjects.value.push(newSubject)
      }
      closeSubjectModal()
    }

    const closeSubjectModal = () => {
      showSubjectModal.value = false
      editingSubject.value = null
    }

    const closeViewModal = () => {
      showViewModal.value = false
      viewingSubject.value = null
    }

    // Selection methods
    const handleSubjectSelection = (selectedIds) => {
      selectedSubjects.value = subjects.value.filter(s => selectedIds.includes(s.id))
    }

    const clearSelection = () => {
      selectedSubjects.value = []
    }

    // Bulk actions
    const bulkDeleteSubjects = () => {
      if (confirm(`Bạn có chắc chắn muốn xóa ${selectedSubjects.value.length} môn học đã chọn?`)) {
        const selectedIds = selectedSubjects.value.map(s => s.id)
        subjects.value = subjects.value.filter(s => !selectedIds.includes(s.id))
        clearSelection()
      }
    }

    const bulkAssignTeacher = () => {
      showTeacherModal.value = true
    }

    const bulkAssignRoom = () => {
      showRoomModal.value = true
    }

    const bulkToggleRegistration = () => {
      const hasOpenRegistration = selectedSubjects.value.some(s => s.registrationOpen)
      const newStatus = !hasOpenRegistration
      
      selectedSubjects.value.forEach(subject => {
        const index = subjects.value.findIndex(s => s.id === subject.id)
        if (index > -1) {
          subjects.value[index].registrationOpen = newStatus
        }
      })
      clearSelection()
    }

    // Modal handlers
    const closeTeacherModal = () => {
      showTeacherModal.value = false
    }

    const saveTeacherAssignment = (teacherData) => {
      selectedSubjects.value.forEach(subject => {
        const index = subjects.value.findIndex(s => s.id === subject.id)
        if (index > -1) {
          subjects.value[index].teacherId = teacherData.teacherId
          subjects.value[index].teacherName = teacherData.teacherName
        }
      })
      closeTeacherModal()
      clearSelection()
    }

    const closeRoomModal = () => {
      showRoomModal.value = false
    }

    const saveRoomAssignment = (roomData) => {
      selectedSubjects.value.forEach(subject => {
        const index = subjects.value.findIndex(s => s.id === subject.id)
        if (index > -1) {
          subjects.value[index].roomId = roomData.roomId
          subjects.value[index].roomName = roomData.roomName
        }
      })
      closeRoomModal()
      clearSelection()
    }

    // Registration methods
    const openRegistrationModal = () => {
      showRegistrationModal.value = true
    }

    const closeRegistrationModal = () => {
      showRegistrationModal.value = false
    }

    const saveRegistrationConfig = (config) => {
      registrationConfig.value = config
      closeRegistrationModal()
    }

    const toggleSubjectRegistration = (subject) => {
      const index = subjects.value.findIndex(s => s.id === subject.id)
      if (index > -1) {
        subjects.value[index].registrationOpen = !subjects.value[index].registrationOpen
      }
    }

    // Students modal methods
    const viewSubjectStudents = (subject) => {
      selectedSubjectForStudents.value = subject
      showStudentsModal.value = true
    }

    const closeStudentsModal = () => {
      showStudentsModal.value = false
      selectedSubjectForStudents.value = null
    }

    const updateSubjectData = (updatedSubject) => {
      const index = subjects.value.findIndex(s => s.id === updatedSubject.id)
      if (index > -1) {
        subjects.value[index] = { ...subjects.value[index], ...updatedSubject }
      }
    }

    // Export methods
    const exportData = () => {
      // Implement export functionality
      console.log('Xuất dữ liệu môn học')
    }

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      // State
      loading,
      subjects,
      frameworkSubjects,
      semesters,
      teachers,
      rooms,
      selectedSubjects,
      registrationConfig,
      
      // Modals
      showSubjectModal,
      showViewModal,
      showTeacherModal,
      showRoomModal,
      showRegistrationModal,
      showStudentsModal,
      editingSubject,
      viewingSubject,
      selectedSubjectForStudents,
      isEditMode,
      
      // Filters
      filters,
      
      // Computed
      statistics,
      filteredSubjects,
      isRegistrationOpen,
      hasActiveRegistration,
      
      // Methods
      updateFilters,
      resetFilters,
      openAddSubjectModal,
      editSubject,
      duplicateSubject,
      deleteSubject,
      viewSubject,
      saveSubject,
      closeSubjectModal,
      closeViewModal,
      handleSubjectSelection,
      clearSelection,
      bulkDeleteSubjects,
      bulkAssignTeacher,
      bulkAssignRoom,
      bulkToggleRegistration,
      closeTeacherModal,
      saveTeacherAssignment,
      closeRoomModal,
      saveRoomAssignment,
      openRegistrationModal,
      closeRegistrationModal,
      saveRegistrationConfig,
      toggleSubjectRegistration,
      viewSubjectStudents,
      closeStudentsModal,
      updateSubjectData,
      exportData
    }
  }
}
</script>

<style scoped>
.subjects-page {
  padding: 24px;
  background: #f8fafc;
  min-height: 100vh;
}

.page-header {
  margin-bottom: 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #64748b;
}

.breadcrumb i {
  font-size: 12px;
}

.breadcrumb .current {
  color: #0f172a;
  font-weight: 500;
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
  gap: 12px;
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
}

.title-section h1 i {
  color: #3b82f6;
  font-size: 24px;
}

.title-section p {
  margin: 0;
  color: #64748b;
  font-size: 16px;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-export:hover {
  border-color: #9ca3af;
  background: #f9fafb;
}

.btn-registration {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #10b981;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-registration:hover:not(:disabled) {
  background: #059669;
}

.btn-registration:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #3b82f6;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Responsive */
@media (max-width: 768px) {
  .subjects-page {
    padding: 16px;
  }
  
  .header-main {
    flex-direction: column;
    align-items: stretch;
  }
  
  .header-actions {
    flex-wrap: wrap;
  }
  
  .title-section h1 {
    font-size: 24px;
  }
  
  .btn-export,
  .btn-registration,
  .btn-primary {
    font-size: 14px;
    padding: 10px 16px;
  }
}
</style>