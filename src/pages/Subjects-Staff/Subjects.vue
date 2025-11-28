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
      :semesters="semesters"
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
      :server-errors="modalServerErrors"
      @close="closeSubjectModal"
      @save="saveSubject"
    />

    <SubjectViewModal 
      v-if="showViewModal"
      :subject="viewingSubject"
      :semesters="semesters"
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
import { useCourseClasses } from '@/hooks/useCourseClasses'
import { useMajors } from '@/hooks/useMajors'
import { useCourses } from '@/hooks/useCourses'
import { useTeachers } from '@/hooks/useTeachers'
import { useRooms } from '@/hooks/useRooms'
import shareService from '@/services/shareService'
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
    const { semesters, fetchSemesters } = useSemesters()
    const { majors: majorsList, fetchMajors } = useMajors()
    const { courses: frameworkSubjects, fetchCourses } = useCourses()
    const { teachers, fetchTeachers } = useTeachers()
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
    const modalServerErrors = ref({})
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

    const { courseClasses, fetchCourseClasses, createCourseClass, updateCourseClass, deleteCourseClass, loading: classesLoading } = useCourseClasses()

    const loadData = async () => {
      loading.value = true
      try {
        await Promise.all([
            fetchCourseClasses({ page: 1, limit: 200 }),
            fetchCourses({ page: 1, limit: 200 }),
            loadSemesters(),
            fetchTeachers({ page: 1, limit: 200 }),
            loadRooms(),
            loadRegistrationConfig(),
            fetchMajors()
          ])
        // sync local subjects from hook
        await loadSubjects()
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error)
      } finally {
        loading.value = false
      }
    }

    // We'll populate `subjects` from the courseClass hook result
    const loadSubjects = async () => {
      // Map courseClasses hook into subjects array
      subjects.value = (courseClasses && courseClasses.value) ? courseClasses.value.map(c => ({ ...c })) : []

      // Ensure display names (teacherName, roomName) are populated for UI
      // Backend may only return teacher_id/room_id without joined names, so fill from local lookups
      try {
        subjects.value = subjects.value.map(s => {
          const subj = { ...s }
          // Normalize teacher lookup: our teachers list exposes teacher_id as profile id
          if (subj.teacherId && (!subj.teacherName || subj.teacherName === '')) {
            const t = (teachers && teachers.value) ? teachers.value.find(x => String(x.teacher_id) === String(subj.teacherId) || String(x.id) === String(subj.teacherId)) : null
            if (t) subj.teacherName = t.name || subj.teacherName || ''
          }

          // Normalize room lookup
          if (subj.roomId && (!subj.roomName || subj.roomName === '')) {
            const r = (rooms && rooms.value) ? rooms.value.find(x => String(x.room_id || x.id) === String(subj.roomId) || String(x.id) === String(subj.roomId)) : null
            if (r) subj.roomName = r.room_name || r.name || subj.roomName || ''
          }

          return subj
        })
      } catch (e) {
        // non-fatal: log for debugging and continue
        console.debug('loadSubjects: failed to populate teacher/room names', e)
      }
    }

    const loadFrameworkSubjects = async () => {
      // Now using useCourses hook
      await fetchCourses({ page: 1, limit: 200 })
    }

    const loadSemesters = async () => {
      try {
        await fetchSemesters()
      } catch (err) {
        console.error('Failed to load semesters in Subjects page', err)
      }
    }

    const loadTeachers = async () => {
      // Now using useTeachers hook
      await fetchTeachers({ page: 1, limit: 200 })
    }

    const loadRooms = async () => {
      try {
        const res = await shareService.listRooms()
        rooms.value = res.rooms || res || []
      } catch (err) {
        console.error('Failed to load rooms', err)
        rooms.value = []
      }
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
    const updateFilters = async (newFilters) => {
      filters.value = { ...filters.value, ...newFilters }
      // Fetch from backend with search and status
      try {
        const statusToUse = filters.value.classStatus || filters.value.status || ''
        await fetchCourseClasses({ page: 1, limit: 200, q: filters.value.search || '', status: statusToUse })
        await loadSubjects()
      } catch (err) {
        console.error('Failed to fetch course classes for filters', err)
      }
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
      modalServerErrors.value = {}
      showSubjectModal.value = true
    }

    const editSubject = (subject) => {
      editingSubject.value = { ...subject }
      isEditMode.value = true
      modalServerErrors.value = {}
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

    const saveSubject = async (subjectData) => {
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
      // Build API payload mapping from FE to BE naming
      try {
        console.log('Selected teacher ID from form:', subjectData.teacherId)
        const selectedTeacher = teachers.value.find(t => t.teacher_id == subjectData.teacherId)
        const teacherIdToSend = selectedTeacher ? selectedTeacher.teacher_id : null // Use teacher profile id
        console.log('Teacher ID to send to API:', teacherIdToSend)
        
        // If base/floor isn't provided but a room is selected, try to derive them from the room object
        let inferredBaseId = subjectData.baseId || null
        let inferredFloorId = subjectData.floorId || null
        if ((!inferredBaseId || !inferredFloorId) && subjectData.roomId) {
          const roomObj = (rooms && rooms.value) ? rooms.value.find(r => String(r.room_id || r.id) === String(subjectData.roomId) || String(r.id) === String(subjectData.roomId)) : null
          if (roomObj) {
            if (!inferredBaseId) inferredBaseId = roomObj.base_id || roomObj.baseId || null
            if (!inferredFloorId) inferredFloorId = roomObj.floor_id || roomObj.floorId || null
          }
        }

        const payload = {
          course_id: subjectData.frameworkSubjectId,
          // only include suffix if provided
          ...(subjectData.classSuffix ? { course_class_suffix: Number(subjectData.classSuffix) } : {}),
          teacher_id: teacherIdToSend,
          room_id: subjectData.roomId || null,
          base_id: inferredBaseId || null,
          floor_id: inferredFloorId || null,
          capacity: subjectData.maxStudents || subjectData.capacity || null,
          description: subjectData.description || '',
          semester_id: subjectData.semesterId || null,
          // convert FE classStatus to BE status
          status: (subjectData.classStatus || 'open')
        }
        console.log('Creating course class with payload:', payload)
        const created = await createCourseClass(payload)
        // Populate teacher and room names for display
        if (created.teacherId) {
          const teacher = teachers.value.find(t => t.teacher_id == created.teacherId)
          created.teacherName = teacher ? teacher.name : ''
        }
        if (created.roomId) {
          const room = rooms.value.find(r => String(r.id) === String(created.roomId)) || rooms.value.find(r => String(r.room_id || r.id) === String(created.roomId))
          created.roomName = room ? room.name : ''
        }
        // ensure base/floor ids present for immediate UI
        if (!created.baseId && payload && payload.base_id) created.baseId = payload.base_id
        if (!created.floorId && payload && payload.floor_id) created.floorId = payload.floor_id
        // add to our subjects array - createCourseClass will refetch, but we also update local list for immediate UX
        subjects.value.push(created)
        closeSubjectModal()
        toast.success('Tạo lớp học thành công')
      } catch (err) {
        console.error('Failed to create course class', err)
        // If the backend responded with duplicate SKU, show informative error
        if (err && (err.status === 409 || err.status === 400) && err.details) {
          // look for keys that indicate sku/suffix duplication
          const detailKeys = Object.keys(err.details || {})
          if (detailKeys.some(k => k.includes('course_class_SKU') || k.includes('course_class_suffix') || k.includes('course_class') || k.includes('sku') || k.includes('suffix'))) {
            toast.error('Mã lớp (SKU) trùng. Vui lòng chọn suffix khác hoặc làm mới trang.')
            modalServerErrors.value = { course_class_SKU: [err.message || 'SKU duplicate'] }
            return
          }
        }
        toast.error(err.message || 'Tạo lớp học thất bại')
        // if error contains details, show in modal
        if (err && err.details) {
          modalServerErrors.value = err.details
        }
      }
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

    const bulkToggleRegistration = async () => {
      if (!selectedSubjects.value.length) return
      const hasOpenRegistration = selectedSubjects.value.some(s => s.registrationOpen)
      const newStatus = !hasOpenRegistration
      const statusStr = newStatus ? 'open' : 'closed'
      try {
        const results = await Promise.allSettled(selectedSubjects.value.map(s => updateCourseClass(s.id, { status: statusStr })))
        const successes = results.filter(r => r.status === 'fulfilled').length
        const failed = results.filter(r => r.status === 'rejected')
        if (successes > 0) {
          selectedSubjects.value.forEach(subject => {
            const index = subjects.value.findIndex(s => s.id === subject.id)
            if (index > -1) subjects.value[index].registrationOpen = newStatus
          })
          toast.success(`Cập nhật trạng thái cho ${successes} lớp thành công`)
        }
        if (failed.length > 0) {
          toast.error(`${failed.length} lớp cập nhật thất bại`)
          console.error('bulkToggleRegistration failed results', failed)
        }
        clearSelection()
      } catch (err) {
        console.error('bulk toggle registration error', err)
        toast.error(err.message || 'Cập nhật trạng thái đăng ký thất bại')
      }
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

    const confirmDialogConfirm = async () => {
      const p = confirmDialog.value.payload
      if (!p) { confirmDialog.value.show = false; return }
      if (p.action === 'updateSubject') {
        const subjectData = p.data
        try {
          // Map update to API payload
          const payload = {
            teacher_id: subjectData.teacherId || null,
            room_id: subjectData.roomId || null,
            base_id: subjectData.baseId || null,
            floor_id: subjectData.floorId || null,
            capacity: subjectData.maxStudents || subjectData.capacity || null,
            description: subjectData.description || '',
            semester_id: subjectData.semesterId || null,
            status: (subjectData.classStatus || 'open')
          }
          if (subjectData.classSuffix) payload.course_class_suffix = Number(subjectData.classSuffix)
          await updateCourseClass(subjectData.id, payload)
          // Update local UI value
          const idx = subjects.value.findIndex(s => s.id === subjectData.id)
          if (idx > -1) subjects.value[idx] = { ...subjects.value[idx], ...subjectData }
          closeSubjectModal()
          toast.success('Cập nhật lớp học thành công', `Lưu thay đổi cho lớp "${subjectData.name || subjectData.code}"`)
        } catch (err) {
          console.error('Update course class failed', err)
          toast.error(err.message || 'Cập nhật lớp học thất bại')
        }
      }
      if (p.action === 'assignTeacher') {
        const teacherData = p.data
        // Perform API updates for each selected subject
        try {
          await Promise.all(selectedSubjects.value.map(sub => updateCourseClass(sub.id, { teacher_id: teacherData.teacherId })))
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
        } catch (err) {
          console.error('Assign teacher failed', err)
          toast.error(err.message || 'Gán giáo viên thất bại')
        }
      }
      if (p.action === 'assignRoom') {
        const roomData = p.data
        try {
          await Promise.all(selectedSubjects.value.map(sub => updateCourseClass(sub.id, { room_id: roomData.roomId, base_id: roomData.baseId || null, floor_id: roomData.floorId || null })))
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
        } catch (err) {
          console.error('Assign room failed', err)
          toast.error(err.message || 'Gán phòng thất bại')
        }
      }
      if (p.action === 'deleteSubject') {
        const subjectData = p.data
        try {
          await deleteCourseClass(subjectData.id)
          const idx = subjects.value.findIndex(s => s.id === subjectData.id)
          if (idx > -1) {
            subjects.value.splice(idx, 1)
            toast.success(`Xóa thành công`, `Lớp "${subjectData.name || subjectData.code}" đã được xóa`)
          }
        } catch (err) {
          // surface backend errors - e.g., has enrollments
          console.error('Delete course class failed', err)
          if (err && err.status === 400) {
            toast.error(err.message || 'Không thể xóa: có sinh viên đang đăng ký')
          } else {
            toast.error(err.message || 'Xóa lớp học thất bại')
          }
        }
      }
      if (p.action === 'toggleRegistration') {
        const data = p.data || {}
        const subjectId = data.subjectId
        const newStatusBool = data.newStatus
        const idx = subjects.value.findIndex(s => s.id === subjectId)
        if (idx > -1) {
          const statusStr = newStatusBool ? 'open' : 'closed'
          try {
            await updateCourseClass(subjectId, { status: statusStr })
            subjects.value[idx].registrationOpen = newStatusBool
            toast.success('Cập nhật trạng thái lớp thành công')
          } catch (err) {
            console.error('Toggle registration (confirm) failed', err)
            toast.error(err.message || 'Không thể cập nhật trạng thái lớp')
          }
        }
      }
      if (p.action === 'bulkDeleteSubjects') {
        const items = p.data || []
        if (!items.length) return
        try {
          const results = await Promise.allSettled(items.map(i => deleteCourseClass(i.id)))
          const successes = results.filter(r => r.status === 'fulfilled').length
          const failures = results.filter(r => r.status === 'rejected')
          const deletedIds = items.filter((_, idx) => results[idx].status === 'fulfilled').map(it => it.id)
          if (deletedIds.length) {
            subjects.value = subjects.value.filter(s => !deletedIds.includes(s.id))
          }
          if (successes > 0) {
            toast.success(`Xóa ${successes} lớp thành công`, `${successes} lớp đã được xóa`)
          }
          if (failures.length > 0) {
            console.error('Some deletes failed', failures)
            toast.error(`${failures.length} lớp xóa thất bại. Vui lòng kiểm tra.`)
          }
          clearSelection()
        } catch (err) {
          console.error('bulk delete failed', err)
          toast.error(err.message || 'Xóa nhiều lớp thất bại')
        }
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

    const toggleSubjectRegistration = async (subject) => {
      // Show confirmation before toggling registration status
      const index = subjects.value.findIndex(s => s.id === subject.id)
      if (index < 0) return
      const newStatus = !subjects.value[index].registrationOpen
      const statusLabel = newStatus ? 'mở đăng ký' : 'đóng đăng ký'
      confirmDialog.value = {
        show: true,
        type: 'warning',
        title: 'Xác nhận thay đổi trạng thái lớp',
        message: `Bạn có chắc chắn muốn ${statusLabel} cho lớp "${subject.name || subject.code}"?`,
        payload: { action: 'toggleRegistration', data: { subjectId: subject.id, newStatus } }
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
      modalServerErrors,
      
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