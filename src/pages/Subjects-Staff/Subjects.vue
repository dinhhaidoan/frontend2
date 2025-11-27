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

    <!-- Filters -->
    <SubjectFilters 
      :filters="filters"
      :semesters="semesters"
      :teachers="teachers"
      :rooms="rooms"
      :subjects="frameworkSubjects.length ? frameworkSubjects : subjects"
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
      @assign:teacher="assignTeacherForSubject"
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
    
    <ConfirmDialog
      :show="confirmDialog.show"
      :type="confirmDialog.type"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      confirmText="Xác nhận"
      cancelText="Hủy"
      @confirm="confirmDialogConfirm"
      @cancel="() => { confirmDialog.show = false }"
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
import { useToast } from '@/composables/useToast'
import SubjectFilters from '@/components/Subjects-Staff/SubjectFilters.vue'
import SubjectTable from '@/components/Subjects-Staff/SubjectTable.vue'
import BulkActions from '@/components/Subjects-Staff/BulkActions.vue'
import SubjectModal from '@/components/Subjects-Staff/SubjectModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import SubjectViewModal from '@/components/Subjects-Staff/SubjectViewModal.vue'
import { useSemesters } from '@/hooks/useSemesters'
import { useMajors } from '@/hooks/useMajors'
import TeacherAssignModal from '@/components/Subjects-Staff/TeacherAssignModal.vue'
import RoomAssignModal from '@/components/Subjects-Staff/RoomAssignModal.vue'
import RegistrationModal from '@/components/Subjects-Staff/RegistrationModal.vue'
import SubjectStudentsModal from '@/components/Subjects-Staff/SubjectStudentsModal.vue'

export default {
  name: 'Subjects',
  components: {
    SubjectFilters,
    SubjectTable,
    BulkActions,
    SubjectModal,
    SubjectViewModal,
    TeacherAssignModal,
    RoomAssignModal,
    RegistrationModal,
    ConfirmDialog,
    SubjectStudentsModal
  },
  setup() {
    // State
    const loading = ref(false)
    const subjects = ref([])
    const frameworkSubjects = ref([])
    const { semesters, fetchSemesters } = useSemesters()
    const { majors: majorsList, fetchMajors } = useMajors()
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
    const confirmDialog = ref({ show: false, type: 'warning', title: '', message: '', payload: null })

    // Filters
    const filters = ref({
      search: '',
      type: 'all',
      semester: '',
      teacher: '',
      room: '',
      status: '',
      registrationStatus: '',
      department: '',
      credits: ''
    })

    // Computed
    const statistics = computed(() => {
      // prefer using frameworkSubjects as program-level subjects (unique subjects) if available
      const source = (frameworkSubjects.value && frameworkSubjects.value.length) ? frameworkSubjects.value : subjects.value
      const totalSubjects = source.length
      const requiredSubjects = source.filter(s => (s.type || s.courseType || s.course_type || 'required') === 'required').length
      const electiveSubjects = source.filter(s => (s.type || s.courseType || s.course_type) === 'elective').length
      const totalCredits = source.reduce((sum, s) => sum + (s.credits || 0), 0)
      const requiredCredits = source.filter(s => (s.type || s.courseType || s.course_type) === 'required').reduce((sum, s) => sum + (s.credits || 0), 0)
      const electiveCredits = totalCredits - requiredCredits
      const majorsCount = majorsList.value ? majorsList.value.length : 0
      const activeMajors = majorsList.value ? majorsList.value.filter(m => (m.status === 'active' || m.active === true)).length : 0
      const semestersCount = semesters.value ? semesters.value.length : 0

      return {
        totalSubjects,
        requiredSubjects,
        electiveSubjects,
        electiveGroups: 12,
        totalCredits,
        requiredCredits,
        electiveCredits,
        majors: majorsCount,
        activeMajors,
        semesters: semestersCount
      }
    })

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
    if (filters.value.type && filters.value.type !== 'all') {
      if (filters.value.type === 'new') {
        const now = Date.now()
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
        result = result.filter(subject => {
          const d = subject.updatedAt || subject.createdAt || subject.raw?.updatedAt || subject.raw?.createdAt || subject.raw?.updated_at || subject.raw?.created_at
          if (!d) return false
          const time = Date.parse(d)
          if (!time || Number.isNaN(time)) return false
          return (now - time) <= THIRTY_DAYS
        })
      } else {
        result = result.filter(subject => subject.type === filters.value.type)
      }
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
    const toast = useToast()

    const loadData = async () => {
      loading.value = true
      try {
        await Promise.all([
            loadSubjects(),
            loadFrameworkSubjects(),
            loadSemesters(),
            loadTeachers(),
            loadRooms(),
            loadRegistrationConfig(),
            fetchMajors()
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
      try {
        await fetchSemesters()
      } catch (err) {
        console.error('Failed to load semesters in Subjects page', err)
      }
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
      confirmDialog.value = {
        show: true,
        type: 'danger',
        title: 'Xác nhận xóa môn học',
        message: `Bạn có chắc chắn muốn xóa môn học "${subject.name}"?`,
        payload: { action: 'deleteSubject', data: subject }
      }
    }

    const viewSubject = (subject) => {
      viewingSubject.value = subject
      showViewModal.value = true
    }

    const saveSubject = (subjectData) => {
      if (isEditMode.value) {
        // Show confirmation before updating subject
        confirmDialog.value = {
          show: true,
          type: 'warning',
          title: 'Xác nhận cập nhật môn học',
          message: `Bạn có chắc chắn muốn lưu các thay đổi cho môn học "${subjectData.name || subjectData.code}"?`,
          payload: { action: 'updateSubject', data: subjectData }
        }
        return
      }
      // Add new subject
      const newSubject = {
        ...subjectData,
        id: Date.now(),
        registeredCount: 0,
        createdAt: new Date().toISOString().split('T')[0]
      }
      subjects.value.push(newSubject)
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
      confirmDialog.value = {
        show: true,
        type: 'danger',
        title: 'Xác nhận xóa nhiều môn học',
        message: `Bạn có chắc chắn muốn xóa ${selectedSubjects.value.length} môn học đã chọn?`,
        payload: { action: 'bulkDeleteSubjects', data: [...selectedSubjects.value] }
      }
    }

    const bulkAssignTeacher = () => {
      showTeacherModal.value = true
    }

    const assignTeacherForSubject = (subject) => {
      selectedSubjects.value = [subject]
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
      // Show confirmation before assigning teacher
      confirmDialog.value = {
        show: true,
        type: 'warning',
        title: 'Xác nhận gán giáo viên',
        message: `Bạn có chắc chắn muốn gán giáo viên "${teacherData.teacherName || '---'}" cho ${selectedSubjects.value.length} môn học đã chọn?`,
        payload: { action: 'assignTeacher', data: teacherData }
      }
    }

    const closeRoomModal = () => {
      showRoomModal.value = false
    }

    const saveRoomAssignment = (roomData) => {
      // Show confirmation before assigning room
      confirmDialog.value = {
        show: true,
        type: 'warning',
        title: 'Xác nhận gán phòng',
        message: `Bạn có chắc chắn muốn gán phòng "${roomData.roomName || '---'}" cho ${selectedSubjects.value.length} môn học đã chọn?`,
        payload: { action: 'assignRoom', data: roomData }
      }
    }

    const confirmDialogConfirm = () => {
      const p = confirmDialog.value.payload
      if (!p) { confirmDialog.value.show = false; return }
      if (p.action === 'updateSubject') {
        const subjectData = p.data
        const idx = subjects.value.findIndex(s => s.id === editingSubject.value.id)
        if (idx > -1) subjects.value[idx] = { ...subjectData }
        closeSubjectModal()
        toast.success('Cập nhật môn học thành công', `Lưu thay đổi cho môn học "${subjectData.name || subjectData.code}"`)
      }
      if (p.action === 'assignTeacher') {
        const teacherData = p.data
        selectedSubjects.value.forEach(subject => {
          const index = subjects.value.findIndex(s => s.id === subject.id)
          if (index > -1) {
            subjects.value[index].teacherId = teacherData.teacherId
            subjects.value[index].teacherName = teacherData.teacherName
          }
        })
        closeTeacherModal()
        toast.success('Gán giáo viên thành công', `Giáo viên "${teacherData.teacherName || '---'}" đã được gán`)        
        clearSelection()
      }
      if (p.action === 'assignRoom') {
        const roomData = p.data
        selectedSubjects.value.forEach(subject => {
          const index = subjects.value.findIndex(s => s.id === subject.id)
          if (index > -1) {
            subjects.value[index].roomId = roomData.roomId
            subjects.value[index].roomName = roomData.roomName
          }
        })
        closeRoomModal()
        toast.success('Gán phòng thành công', `Phòng "${roomData.roomName || '---'}" đã được gán`)
        clearSelection()
      }
      if (p.action === 'deleteSubject') {
        const subjectData = p.data
        const idx = subjects.value.findIndex(s => s.id === subjectData.id)
        if (idx > -1) {
          subjects.value.splice(idx, 1)
          toast.success(`Xóa môn học thành công`, `Môn học "${subjectData.name || subjectData.code}" đã được xóa`)
        }
      }
      if (p.action === 'bulkDeleteSubjects') {
        const items = p.data || []
        const idsToDelete = items.map(i => i.id)
        subjects.value = subjects.value.filter(s => !idsToDelete.includes(s.id))
        toast.success(`Xóa ${items.length} môn học thành công`, `${items.length} môn học đã được xóa`)
        clearSelection()
      }
      confirmDialog.value.show = false
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
      assignTeacherForSubject,
      bulkAssignRoom,
      bulkToggleRegistration,
      closeTeacherModal,
      saveTeacherAssignment,
      closeRoomModal,
      saveRoomAssignment,
      confirmDialog,
      confirmDialogConfirm,
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