<template>
  <div class="schedule-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="breadcrumb">
        <i class="fas fa-home"></i>
        <span>Dashboard</span>
        <i class="fas fa-angle-right"></i>
        <span class="current">Xếp lịch học & thi</span>
      </div>
      
      <div class="header-main">
        <div class="title-section">
          <h1>
            <i class="fas fa-calendar-alt"></i>
            Xếp lịch học & Lịch thi
          </h1>
          <p>Quản lý thời khóa biểu, xếp lịch học và lịch thi cho các môn học</p>
        </div>
        
        <div class="header-actions">
          <button @click="exportSchedule" class="btn-export">
            <i class="fas fa-download"></i>
            <span>Xuất lịch</span>
          </button>
          <button @click="openConflictChecker" class="btn-check">
            <i class="fas fa-exclamation-triangle"></i>
            <span>Kiểm tra xung đột</span>
          </button>
          <button @click="openScheduleModal" class="btn-primary">
            <i class="fas fa-plus"></i>
            <span>Thêm lịch học</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Schedule Tabs -->
    <div class="schedule-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <i :class="tab.icon"></i>
        {{ tab.label }}
        <span v-if="tab.count" class="count-badge">{{ tab.count }}</span>
      </button>
    </div>

    <!-- Statistics Cards -->
    <ScheduleStats :stats="statistics" :active-tab="activeTab" />

    <!-- Filters -->
    <ScheduleFilters 
      :filters="filters"
      :semesters="semesters"
      :teachers="teachers"
      :rooms="rooms"
      :subjects="subjects"
      :active-tab="activeTab"
      @update:filters="updateFilters"
      @reset-filters="resetFilters"
    />

    <!-- Schedule Content -->
    <div class="schedule-content">
      <!-- Class Schedule View -->
      <div v-if="activeTab === 'class'" class="schedule-view">
        <WeeklyCalendar 
          :schedules="filteredClassSchedules"
          :loading="loading"
          type="class"
          @edit:schedule="editSchedule"
          @delete:schedule="deleteSchedule"
          @view:details="viewScheduleDetails"
        />
      </div>

      <!-- Exam Schedule View -->
      <div v-if="activeTab === 'exam'" class="schedule-view">
        <ExamCalendar 
          :exams="filteredExamSchedules"
          :loading="loading"
          @edit:exam="editExam"
          @delete:exam="deleteExam"
          @view:details="viewExamDetails"
        />
      </div>

      <!-- Monthly Calendar View -->
      <div v-if="activeTab === 'monthly'" class="schedule-view">
        <MonthlyCalendar 
          :schedules="filteredAllSchedules"
          :loading="loading"
          @edit:schedule="editSchedule"
          @delete:schedule="deleteSchedule"
          @view:details="viewScheduleDetails"
          @add:schedule="openScheduleModal"
        />
      </div>

      <!-- List View -->
      <div v-if="activeTab === 'list'" class="schedule-view">
        <ScheduleTable 
          :schedules="filteredAllSchedules"
          :loading="loading"
          @edit:schedule="editSchedule"
          @delete:schedule="deleteSchedule"
          @duplicate:schedule="duplicateSchedule"
        />
      </div>
    </div>

    <!-- Modals -->
    <ScheduleModal 
      v-if="showScheduleModal"
      :schedule="editingSchedule"
      :subjects="subjects"
      :teachers="teachers"
      :rooms="rooms"
      :semesters="semesters"
      :is-edit="isEditMode"
      :schedule-type="scheduleType"
      @close="closeScheduleModal"
      @save="saveSchedule"
    />

    <ExamModal 
      v-if="showExamModal"
      :exam="editingExam"
      :subjects="subjects"
      :teachers="teachers"
      :rooms="rooms"
      :semesters="semesters"
      :is-edit="isExamEditMode"
      @close="closeExamModal"
      @save="saveExam"
    />

    <ScheduleDetailsModal 
      v-if="showDetailsModal"
      :schedule="viewingSchedule"
      :schedule-type="viewingType"
      @close="closeDetailsModal"
      @edit="editFromDetails"
    />

    <ConflictCheckerModal 
      v-if="showConflictModal"
      :conflicts="scheduleConflicts"
      @close="closeConflictModal"
      @resolve="resolveConflict"
    />

    <!-- Delete Schedule Confirmation (shared ConfirmDialog) -->
    <ConfirmDialog
      :show="deleteScheduleModalVisible"
      type="danger"
      title="Xác nhận xóa lịch"
      :message="scheduleToDelete ? `Bạn có chắc muốn xóa ${scheduleToDelete.examType ? 'lịch thi' : 'lịch học'} ${scheduleToDelete.subjectName || scheduleToDelete.subjectCode}? Hành động này sẽ không thể hoàn tác.` : 'Bạn có chắc muốn xóa lịch này?'
      "
      confirmText="Xóa"
      cancelText="Hủy"
      @confirm="confirmDeleteSchedule"
      @cancel="closeDeleteScheduleModal"
    />

    <!-- Update Schedule Confirmation (shared ConfirmDialog) -->
    <ConfirmDialog
      :show="updateScheduleModalVisible"
      type="warning"
      title="Xác nhận cập nhật lịch"
      :message="scheduleToUpdate ? `Bạn có chắc chắn muốn lưu các thay đổi cho lịch ${scheduleToUpdate.subjectName || scheduleToUpdate.subjectCode}?` : 'Bạn có chắc chắn muốn cập nhật lịch này?'
      "
      confirmText="Xác nhận"
      cancelText="Hủy"
      @confirm="confirmUpdateSchedule"
      @cancel="closeUpdateScheduleModal"
    />

    <!-- Update Exam confirmation (shared ConfirmDialog) -->
    <ConfirmDialog
      :show="updateExamModalVisible"
      type="warning"
      title="Xác nhận cập nhật lịch thi"
      :message="examToUpdate ? `Bạn có chắc chắn muốn lưu các thay đổi cho lịch thi ${examToUpdate.subjectName || examToUpdate.subjectCode}?` : 'Bạn có chắc chắn muốn cập nhật lịch thi này?'
      "
      confirmText="Xác nhận"
      cancelText="Hủy"
      @confirm="confirmUpdateExam"
      @cancel="closeUpdateExamModal"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import ScheduleStats from '@/components/Schedule-Staff/ScheduleStats.vue'
import ScheduleFilters from '@/components/Schedule-Staff/ScheduleFilters.vue'
import WeeklyCalendar from '@/components/Schedule-Staff/WeeklyCalendar.vue'
import ExamCalendar from '@/components/Schedule-Staff/ExamCalendar.vue'
import MonthlyCalendar from '@/components/Schedule-Staff/MonthlyCalendar.vue'
import ScheduleTable from '@/components/Schedule-Staff/ScheduleTable.vue'
import ScheduleModal from '@/components/Schedule-Staff/ScheduleModal.vue'
import ExamModal from '@/components/Schedule-Staff/ExamModal.vue'
import ScheduleDetailsModal from '@/components/Schedule-Staff/ScheduleDetailsModal.vue'
import ConflictCheckerModal from '@/components/Schedule-Staff/ConflictCheckerModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

export default {
  name: 'Schedule',
  components: {
    ScheduleStats,
    ScheduleFilters,
    WeeklyCalendar,
    ExamCalendar,
    MonthlyCalendar,
    ScheduleTable,
    ScheduleModal,
    ExamModal,
    ScheduleDetailsModal,
    ConflictCheckerModal
  },
  setup() {
    // State
    const loading = ref(false)
    const activeTab = ref('class')
    const classSchedules = ref([])
    const examSchedules = ref([])
    const subjects = ref([])
    const teachers = ref([])
    const rooms = ref([])
    const semesters = ref([])
    
    // Modals
    const showScheduleModal = ref(false)
    const showExamModal = ref(false)
    const showDetailsModal = ref(false)
    const showConflictModal = ref(false)
    const deleteScheduleModalVisible = ref(false)
    const scheduleToDelete = ref(null)
    const updateScheduleModalVisible = ref(false)
    const scheduleToUpdate = ref(null)
    const updateExamModalVisible = ref(false)
    const examToUpdate = ref(null)
    const editingSchedule = ref(null)
    const editingExam = ref(null)
    const viewingSchedule = ref(null)
    const viewingType = ref('class')
    const isEditMode = ref(false)
    const isExamEditMode = ref(false)
    const scheduleType = ref('class')
    const scheduleConflicts = ref([])

    // Filters
    const filters = ref({
      search: '',
      semester: '',
      teacher: '',
      room: '',
      subject: '',
      dayOfWeek: '',
      timeSlot: '',
      status: ''
    })

    // Tabs configuration
    const tabs = computed(() => [
      {
        key: 'class',
        label: 'Lịch học',
        icon: 'fas fa-chalkboard-teacher',
        count: classSchedules.value.length
      },
      {
        key: 'exam',
        label: 'Lịch thi',
        icon: 'fas fa-file-alt',
        count: examSchedules.value.length
      },
      {
        key: 'monthly',
        label: 'Lịch tháng',
        icon: 'fas fa-calendar-alt',
        count: classSchedules.value.length + examSchedules.value.length
      },
      {
        key: 'list',
        label: 'Danh sách',
        icon: 'fas fa-list',
        count: classSchedules.value.length + examSchedules.value.length
      }
    ])

    // Computed
    const statistics = computed(() => {
      const totalClass = classSchedules.value.length
      const totalExam = examSchedules.value.length
      const conflictCount = scheduleConflicts.value.length
      
      return {
        totalSchedules: totalClass + totalExam,
        classSchedules: totalClass,
        examSchedules: totalExam,
        conflicts: conflictCount,
        roomsUsed: [...new Set([
          ...classSchedules.value.map(s => s.roomId),
          ...examSchedules.value.map(s => s.roomId)
        ].filter(Boolean))].length,
        teachersAssigned: [...new Set([
          ...classSchedules.value.map(s => s.teacherId),
          ...examSchedules.value.map(s => s.teacherId)
        ].filter(Boolean))].length
      }
    })

    const filteredClassSchedules = computed(() => {
      return filterSchedules(classSchedules.value)
    })

    const filteredExamSchedules = computed(() => {
      return filterSchedules(examSchedules.value)
    })

    const filteredAllSchedules = computed(() => {
      return [
        ...filteredClassSchedules.value.map(s => ({ ...s, type: 'class' })),
        ...filteredExamSchedules.value.map(s => ({ ...s, type: 'exam' }))
      ].sort((a, b) => new Date(a.date) - new Date(b.date))
    })

    // Methods
    const filterSchedules = (schedules) => {
      let result = schedules

      if (filters.value.search) {
        const search = filters.value.search.toLowerCase()
        result = result.filter(schedule => 
          schedule.subjectName?.toLowerCase().includes(search) ||
          schedule.teacherName?.toLowerCase().includes(search) ||
          schedule.roomName?.toLowerCase().includes(search)
        )
      }

      if (filters.value.semester) {
        result = result.filter(schedule => schedule.semesterId === filters.value.semester)
      }

      if (filters.value.teacher) {
        result = result.filter(schedule => schedule.teacherId === filters.value.teacher)
      }

      if (filters.value.room) {
        result = result.filter(schedule => schedule.roomId === filters.value.room)
      }

      if (filters.value.subject) {
        result = result.filter(schedule => schedule.subjectId === filters.value.subject)
      }

      if (filters.value.dayOfWeek) {
        result = result.filter(schedule => schedule.dayOfWeek === parseInt(filters.value.dayOfWeek))
      }

      if (filters.value.timeSlot) {
        result = result.filter(schedule => schedule.timeSlot === filters.value.timeSlot)
      }

      if (filters.value.status) {
        result = result.filter(schedule => schedule.status === filters.value.status)
      }

      return result
    }

    const loadData = async () => {
      loading.value = true
      try {
        await Promise.all([
          loadClassSchedules(),
          loadExamSchedules(),
          loadSubjects(),
          loadTeachers(),
          loadRooms(),
          loadSemesters()
        ])
        await checkConflicts()
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error)
      } finally {
        loading.value = false
      }
    }

    const loadClassSchedules = async () => {
      // Mock data
      classSchedules.value = [
        {
          id: 1,
          subjectId: 1,
          subjectName: 'Lập trình cơ bản',
          subjectCode: 'CS101-01',
          teacherId: 1,
          teacherName: 'Nguyễn Văn A',
          roomId: 1,
          roomName: 'P301',
          semesterId: 1,
          dayOfWeek: 2, // Monday = 1, Tuesday = 2, etc.
          timeSlot: '7:00-9:00',
          startTime: '07:00',
          endTime: '09:00',
          date: '2024-01-15',
          duration: 120,
          status: 'scheduled',
          notes: 'Lớp lý thuyết',
          createdAt: '2024-01-10'
        },
        {
          id: 2,
          subjectId: 1,
          subjectName: 'Lập trình cơ bản',
          subjectCode: 'CS101-01',
          teacherId: 1,
          teacherName: 'Nguyễn Văn A',
          roomId: 2,
          roomName: 'LAB1',
          semesterId: 1,
          dayOfWeek: 4,
          timeSlot: '13:00-15:00',
          startTime: '13:00',
          endTime: '15:00',
          date: '2024-01-17',
          duration: 120,
          status: 'scheduled',
          notes: 'Lớp thực hành',
          createdAt: '2024-01-10'
        }
      ]
    }

    const loadExamSchedules = async () => {
      // Mock data
      examSchedules.value = [
        {
          id: 1,
          subjectId: 1,
          subjectName: 'Lập trình cơ bản',
          subjectCode: 'CS101',
          teacherId: 1,
          teacherName: 'Nguyễn Văn A',
          roomId: 1,
          roomName: 'P301',
          semesterId: 1,
          examType: 'midterm',
          examTypeName: 'Giữa kỳ',
          date: '2024-02-15',
          startTime: '07:00',
          endTime: '09:00',
          duration: 120,
          maxStudents: 40,
          registeredStudents: 35,
          status: 'scheduled',
          instructions: 'Sinh viên cần mang theo CMND và thẻ SV',
          createdAt: '2024-01-20'
        },
        {
          id: 2,
          subjectId: 2,
          subjectName: 'Cấu trúc dữ liệu',
          subjectCode: 'CS102',
          teacherId: 2,
          teacherName: 'Trần Thị B',
          roomId: 2,
          roomName: 'P302',
          semesterId: 1,
          examType: 'final',
          examTypeName: 'Cuối kỳ',
          date: '2024-03-20',
          startTime: '09:00',
          endTime: '11:00',
          duration: 120,
          maxStudents: 45,
          registeredStudents: 42,
          status: 'scheduled',
          instructions: 'Thi trắc nghiệm trên máy tính',
          createdAt: '2024-02-01'
        }
      ]
    }

    const loadSubjects = async () => {
      subjects.value = [
        { id: 1, name: 'Lập trình cơ bản', code: 'CS101' },
        { id: 2, name: 'Cấu trúc dữ liệu', code: 'CS102' }
      ]
    }

    const loadTeachers = async () => {
      teachers.value = [
        { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com' },
        { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com' }
      ]
    }

    const loadRooms = async () => {
      rooms.value = [
        { id: 1, name: 'P301', building: 'Tòa A', capacity: 50 },
        { id: 2, name: 'LAB1', building: 'Tòa B', capacity: 30 }
      ]
    }

    const loadSemesters = async () => {
      semesters.value = [
        { id: 1, name: 'Học kỳ I - 2024-2025', status: 'active' },
        { id: 2, name: 'Học kỳ II - 2024-2025', status: 'upcoming' }
      ]
    }

    const checkConflicts = async () => {
      // Check for scheduling conflicts
      scheduleConflicts.value = []
      // Implementation for conflict detection
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
        subject: '',
        dayOfWeek: '',
        timeSlot: '',
        status: ''
      }
    }

    // Schedule methods
    const openScheduleModal = () => {
      editingSchedule.value = null
      isEditMode.value = false
      scheduleType.value = activeTab.value === 'exam' ? 'exam' : 'class'
      if (scheduleType.value === 'exam') {
        showExamModal.value = true
      } else {
        showScheduleModal.value = true
      }
    }

    const editSchedule = (schedule) => {
      editingSchedule.value = { ...schedule }
      isEditMode.value = true
      showScheduleModal.value = true
    }

    const editExam = (exam) => {
      editingExam.value = { ...exam }
      isExamEditMode.value = true
      showExamModal.value = true
    }

    const deleteSchedule = (schedule) => {
      scheduleToDelete.value = schedule
      deleteScheduleModalVisible.value = true
    }

    const closeDeleteScheduleModal = () => {
      deleteScheduleModalVisible.value = false
      scheduleToDelete.value = null
    }

    const confirmDeleteSchedule = () => {
      if (!scheduleToDelete.value) return
      
      const type = scheduleToDelete.value.type || (scheduleToDelete.value.examType ? 'exam' : 'class')
      const name = scheduleToDelete.value.subjectName
      
      if (type === 'exam') {
        const index = examSchedules.value.findIndex(s => s.id === scheduleToDelete.value.id)
        if (index > -1) examSchedules.value.splice(index, 1)
      } else {
        const index = classSchedules.value.findIndex(s => s.id === scheduleToDelete.value.id)
        if (index > -1) classSchedules.value.splice(index, 1)
      }
      
      alert(`Đã xóa ${type === 'exam' ? 'lịch thi' : 'lịch học'} "${name}" thành công`)
      closeDeleteScheduleModal()
    }

    const deleteExam = (exam) => {
      deleteSchedule({ ...exam, type: 'exam' })
    }

    const duplicateSchedule = (schedule) => {
      const type = schedule.type || (schedule.examType ? 'exam' : 'class')
      const duplicated = {
        ...schedule,
        id: null,
        date: '',
        status: 'draft'
      }
      
      if (type === 'exam') {
        editingExam.value = duplicated
        isExamEditMode.value = false
        showExamModal.value = true
      } else {
        editingSchedule.value = duplicated
        isEditMode.value = false
        showScheduleModal.value = true
      }
    }

    const saveSchedule = (scheduleData) => {
      if (isEditMode.value) {
        // Show update confirmation modal
        scheduleToUpdate.value = scheduleData
        updateScheduleModalVisible.value = true
      } else {
        const newSchedule = {
          ...scheduleData,
          id: Date.now(),
          createdAt: new Date().toISOString().split('T')[0]
        }
        classSchedules.value.push(newSchedule)
        closeScheduleModal()
        checkConflicts()
      }
    }

    const closeUpdateScheduleModal = () => {
      updateScheduleModalVisible.value = false
      scheduleToUpdate.value = null
    }

    const confirmUpdateSchedule = () => {
      if (!scheduleToUpdate.value) return
      
      const index = classSchedules.value.findIndex(s => s.id === editingSchedule.value.id)
      if (index > -1) {
        classSchedules.value[index] = { ...scheduleToUpdate.value }
      }
      closeUpdateScheduleModal()
      closeScheduleModal()
      checkConflicts()
      alert('Đã cập nhật lịch học thành công')
    }

    const saveExam = (examData) => {
      if (isExamEditMode.value) {
        // Show update confirmation modal
        examToUpdate.value = examData
        updateExamModalVisible.value = true
      } else {
        const newExam = {
          ...examData,
          id: Date.now(),
          createdAt: new Date().toISOString().split('T')[0]
        }
        examSchedules.value.push(newExam)
        closeExamModal()
        checkConflicts()
      }
    }

    const closeUpdateExamModal = () => {
      updateExamModalVisible.value = false
      examToUpdate.value = null
    }

    const confirmUpdateExam = () => {
      if (!examToUpdate.value) return
      
      const index = examSchedules.value.findIndex(s => s.id === editingExam.value.id)
      if (index > -1) {
        examSchedules.value[index] = { ...examToUpdate.value }
      }
      closeUpdateExamModal()
      closeExamModal()
      checkConflicts()
      alert('Đã cập nhật lịch thi thành công')
    }

    const closeScheduleModal = () => {
      showScheduleModal.value = false
      editingSchedule.value = null
    }

    const closeExamModal = () => {
      showExamModal.value = false
      editingExam.value = null
    }

    const viewScheduleDetails = (schedule) => {
      viewingSchedule.value = schedule
      viewingType.value = schedule.examType ? 'exam' : 'class'
      showDetailsModal.value = true
    }

    const viewExamDetails = (exam) => {
      viewingSchedule.value = exam
      viewingType.value = 'exam'
      showDetailsModal.value = true
    }

    const closeDetailsModal = () => {
      showDetailsModal.value = false
      viewingSchedule.value = null
    }

    const editFromDetails = () => {
      if (viewingType.value === 'exam') {
        editExam(viewingSchedule.value)
      } else {
        editSchedule(viewingSchedule.value)
      }
      closeDetailsModal()
    }

    // Conflict methods
    const openConflictChecker = () => {
      checkConflicts()
      showConflictModal.value = true
    }

    const closeConflictModal = () => {
      showConflictModal.value = false
    }

    const resolveConflict = (conflictId, resolution) => {
      // Implementation for resolving conflicts
      console.log('Resolving conflict:', conflictId, resolution)
    }

    const exportSchedule = () => {
      // Implementation for exporting schedules
      console.log('Xuất lịch học/thi')
    }

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      // State
      loading,
      activeTab,
      classSchedules,
      examSchedules,
      subjects,
      teachers,
      rooms,
      semesters,
      
      // Modals
      showScheduleModal,
      showExamModal,
      showDetailsModal,
      showConflictModal,
      deleteScheduleModalVisible,
      scheduleToDelete,
      updateScheduleModalVisible,
      scheduleToUpdate,
      updateExamModalVisible,
      examToUpdate,
      editingSchedule,
      editingExam,
      viewingSchedule,
      viewingType,
      isEditMode,
      isExamEditMode,
      scheduleType,
      scheduleConflicts,
      
      // Filters
      filters,
      
      // Computed
      tabs,
      statistics,
      filteredClassSchedules,
      filteredExamSchedules,
      filteredAllSchedules,
      
      // Methods
      updateFilters,
      resetFilters,
      openScheduleModal,
      editSchedule,
      editExam,
      deleteSchedule,
      closeDeleteScheduleModal,
      confirmDeleteSchedule,
      deleteExam,
      duplicateSchedule,
      saveSchedule,
      closeUpdateScheduleModal,
      confirmUpdateSchedule,
      saveExam,
      closeUpdateExamModal,
      confirmUpdateExam,
      closeScheduleModal,
      closeExamModal,
      viewScheduleDetails,
      viewExamDetails,
      closeDetailsModal,
      editFromDetails,
      openConflictChecker,
      closeConflictModal,
      resolveConflict,
      exportSchedule
    }
  }
}
</script>

<style scoped>
.schedule-page {
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
}

.title-section p {
  margin: 0;
  color: #64748b;
  font-size: 15px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-export,
.btn-check,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-export {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-export:hover {
  background: #e2e8f0;
}

.btn-check {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #fcd34d;
}

.btn-check:hover {
  background: #fde68a;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.schedule-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 24px;
  background: white;
  padding: 4px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #3b82f6;
  background: #f1f5f9;
}

.tab-btn.active {
  background: #3b82f6;
  color: white;
}

.count-badge {
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.tab-btn.active .count-badge {
  background: rgba(255, 255, 255, 0.3);
}

.schedule-content {
  margin-top: 24px;
}

.schedule-view {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Responsive */
@media (max-width: 768px) {
  .schedule-page {
    padding: 16px;
  }
  
  .header-main {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .schedule-tabs {
    flex-direction: column;
  }
  
  .tab-btn {
    justify-content: flex-start;
  }
}

/* Modal Styles - Delete & Update Popups */
.modal-overlay-delete {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100001;
  padding: 20px;
}

.delete-modal-popup,
.update-modal-popup {
  background: white;
  border-radius: 24px;
  max-width: 550px;
  width: 100%;
  padding: 40px;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.05);
  position: relative;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.close-modal-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 18px;
}

.close-modal-btn:hover {
  background: rgba(107, 114, 128, 0.2);
  color: #374151;
  transform: rotate(90deg);
}

.delete-icon-wrapper,
.update-icon-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.delete-icon-animated {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  animation: pulse 2s ease-in-out infinite;
  box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
  }
  50% {
    box-shadow: 0 0 0 15px rgba(220, 38, 38, 0);
  }
}

.update-icon-animated {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
    box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4);
  }
  50% {
    transform: translateY(-10px);
    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.2);
  }
}

.delete-title,
.update-title {
  margin: 0 0 24px 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
}

.delete-content,
.update-content {
  margin-bottom: 32px;
}

.subject-info-delete,
.subject-info-update {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.subject-code-delete,
.subject-code-update {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 700;
  font-size: 16px;
  color: #3b82f6;
  background: white;
  padding: 8px 16px;
  border-radius: 8px;
  display: inline-block;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.subject-name-delete,
.subject-name-update {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
  margin-bottom: 12px;
}

.schedule-meta-delete,
.schedule-meta-update {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  margin-top: 12px;
}

.schedule-meta-delete span,
.schedule-meta-update span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.schedule-meta-delete i,
.schedule-meta-update i {
  color: #3b82f6;
  font-size: 14px;
}

.warning-box {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #fbbf24;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #92400e;
  font-size: 14px;
  line-height: 1.6;
}

.warning-box i {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  color: #d97706;
}

.info-box {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border: 2px solid #60a5fa;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  color: #1e40af;
  font-size: 14px;
  line-height: 1.6;
}

.info-box i {
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
  color: #2563eb;
}

.delete-actions,
.update-actions {
  display: flex;
  gap: 12px;
}

.btn-cancel-delete,
.btn-confirm-delete,
.btn-cancel-update,
.btn-confirm-update {
  flex: 1;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
}

.btn-cancel-delete,
.btn-cancel-update {
  background: white;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.btn-cancel-delete:hover,
.btn-cancel-update:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #9ca3af;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-confirm-delete {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  color: white;
  border: 2px solid #dc2626;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.btn-confirm-delete:hover {
  background: linear-gradient(135deg, #b91c1c, #991b1b);
  border-color: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.4);
}

.btn-confirm-update {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  border: 2px solid #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-confirm-update:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  border-color: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

/* Modal Transition */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .delete-modal-popup,
.modal-fade-enter-active .update-modal-popup {
  animation: slideUp 0.3s ease-out;
}

.modal-fade-leave-active .delete-modal-popup,
.modal-fade-leave-active .update-modal-popup {
  animation: slideDown 0.3s ease-in;
}

@keyframes slideDown {
  from {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  to {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
}

/* Mobile Responsive for Modals */
@media (max-width: 768px) {
  .delete-modal-popup,
  .update-modal-popup {
    padding: 32px 24px;
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
  
  .delete-icon-animated,
  .update-icon-animated {
    width: 70px;
    height: 70px;
    font-size: 32px;
  }
  
  .delete-title,
  .update-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
  
  .subject-code-delete,
  .subject-code-update {
    font-size: 14px;
    padding: 6px 12px;
  }
  
  .subject-name-delete,
  .subject-name-update {
    font-size: 16px;
  }
  
  .warning-box,
  .info-box {
    padding: 14px;
    font-size: 13px;
  }
  
  .delete-actions,
  .update-actions {
    flex-direction: column;
  }
  
  .btn-cancel-delete,
  .btn-confirm-delete,
  .btn-cancel-update,
  .btn-confirm-update {
    width: 100%;
    padding: 14px;
  }
}
</style>