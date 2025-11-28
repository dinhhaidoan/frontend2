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
        <WeeklyListView
          :schedules="combinedListForListView"
          :days="weekDaysForList"
          :timeSlots="timeSlotsForList"
          :loading="loading"
          @edit:schedule="editSchedule"
          @delete:schedule="deleteSchedule"
          @view:details="viewScheduleDetails"
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
import WeeklyListView from '@/components/Schedule-Staff/WeeklyListView.vue'
import ScheduleModal from '@/components/Schedule-Staff/ScheduleModal.vue'
import ExamModal from '@/components/Schedule-Staff/ExamModal.vue'
import ScheduleDetailsModal from '@/components/Schedule-Staff/ScheduleDetailsModal.vue'
import ConflictCheckerModal from '@/components/Schedule-Staff/ConflictCheckerModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useSemesters } from '@/hooks/useSemesters'
import { useCourseClasses } from '@/hooks/useCourseClasses'
import { useTeachers } from '@/hooks/useTeachers'
import shareService from '@/services/shareService'
import useCourseSchedules from '@/hooks/useCourseSchedules'
import { useToast } from '@/composables/useToast'
import { mapCourseSchedule } from '@/types/courseSchedule'

export default {
  name: 'Schedule',
  components: {
    ScheduleStats,
    ScheduleFilters,
    WeeklyCalendar,
    ExamCalendar,
    MonthlyCalendar,
    ScheduleTable,
    WeeklyListView,
    ScheduleModal,
    ExamModal,
    ScheduleDetailsModal,
    ConflictCheckerModal,
    ConfirmDialog
  },
  setup() {
    // State
    const loading = ref(false)
    const activeTab = ref('class')
    const classSchedules = ref([])
    const examSchedules = ref([])
    const { loading: scheduleLoading, schedules: hookSchedules, rawSchedules: hookRawSchedules, pagination, fetchCourseSchedules, fetchCourseSchedule, createCourseSchedule, updateCourseSchedule, deleteCourseSchedule } = useCourseSchedules()
    const subjects = ref([])
    const teachers = ref([])
    const rooms = ref([])
    const { semesters, fetchSemesters } = useSemesters()
    const { courseClasses, fetchCourseClasses } = useCourseClasses()
    const { teachers: hookTeachers, fetchTeachers } = useTeachers()

    // Week days + times for the simple list view
    const weekDaysForList = computed(() => ([
      { dayOfWeek: 1, name: 'Thứ Hai' },
      { dayOfWeek: 2, name: 'Thứ Ba' },
      { dayOfWeek: 3, name: 'Thứ Tư' },
      { dayOfWeek: 4, name: 'Thứ Năm' },
      { dayOfWeek: 5, name: 'Thứ Sáu' },
      { dayOfWeek: 6, name: 'Thứ Bảy' },
      { dayOfWeek: 0, name: 'Chủ Nhật' }
    ]))

    const timeSlotsForList = computed(() => ([
      { key: 1, label: '07:00–07:45', start: '07:00', end: '07:45' },
      { key: 2, label: '07:50–08:35', start: '07:50', end: '08:35' },
      { key: 3, label: '08:40–09:25', start: '08:40', end: '09:25' },
      { key: 4, label: '09:35–10:20', start: '09:35', end: '10:20' },
      { key: 5, label: '10:25–11:10', start: '10:25', end: '11:10' }
    ]))
    
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
    const viewingType = ref('study')
    const isEditMode = ref(false)
    const isExamEditMode = ref(false)
    const scheduleType = ref('study')
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

    // Build maps for faster lookups
    const subjectMap = computed(() => {
      try {
        const map = {}
        const arr = Array.isArray(subjects.value) ? subjects.value : (subjects.value?.rows || subjects.value?.items || [])
        arr.forEach(s => { if (s && (s.id !== undefined)) map[s.id] = s })
        return map
      } catch (err) {
        console.error('subjectMap compute error', err, subjects.value)
        return {}
      }
    })

    const teacherMap = computed(() => {
      try {
        const map = {}
        const arr = Array.isArray(teachers.value) ? teachers.value : (teachers.value?.rows || teachers.value?.items || [])
        arr.forEach(t => { if (t && (t.id !== undefined)) map[t.id] = t; if (t && t.teacherId !== undefined) map[t.teacherId] = t })
        return map
      } catch (err) {
        console.error('teacherMap compute error', err, teachers.value)
        return {}
      }
    })

    const roomMap = computed(() => {
      try {
        const map = {}
        const arr = Array.isArray(rooms.value) ? rooms.value : (rooms.value?.rows || rooms.value?.items || [])
        arr.forEach(r => { if (r && (r.id !== undefined)) map[r.id] = r })
        return map
      } catch (err) {
        console.error('roomMap compute error', err, rooms.value)
        return {}
      }
    })
    const enrichSchedule = (s) => {
      if (!s) return s
      const out = { ...s }

      // 1. Lấy ID chuẩn xác (kiểm tra cả camelCase và snake_case)
      const subjectId = out.courseClassId || out.course_class_id || out.subjectId || out.subject_id
      const teacherId = out.teacherId || out.teacher_id
      const roomId = out.roomId || out.room_id

      // 2. Xử lý Tên Môn học / Lớp học phần
      // Ưu tiên 1: Tìm trong subjectMap (dữ liệu đã load sẵn)
      const sub = subjectMap.value[subjectId]
      if (sub) {
        out.subjectName = out.subjectName || sub.name || sub.subjectName || sub.subject_name
        out.subjectCode = out.subjectCode || sub.code || sub.subjectCode || sub.subject_code
      } 
      // Ưu tiên 2: Tìm trong object lồng nhau (nếu API trả về dạng include)
      else if (out.CourseClass) {
        out.subjectName = out.CourseClass.name || out.CourseClass.subject_name
        out.subjectCode = out.CourseClass.code || out.CourseClass.subject_code
      }
      // Ưu tiên 3: Tìm trong thuộc tính snake_case trực tiếp
      else {
        out.subjectName = out.subjectName || out.subject_name
        out.subjectCode = out.subjectCode || out.subject_code
      }

      // 3. Xử lý Tên Giáo viên
      const t = teacherMap.value[teacherId]
      if (t) {
        out.teacherName = out.teacherName || t.name || t.teacherName || t.fullName
      } else if (out.Teacher) {
        out.teacherName = out.Teacher.name || out.Teacher.full_name || out.Teacher.teacher_name
      } else {
        out.teacherName = out.teacherName || out.teacher_name
      }

      // 4. Xử lý Tên Phòng
      const rm = roomMap.value[roomId]
      if (rm) {
        out.roomName = out.roomName || rm.name || rm.roomName || rm.room_name
      } else if (out.Room) {
        out.roomName = out.Room.name || out.Room.room_name
      } else {
        out.roomName = out.roomName || out.room_name
      }

      // 5. Cập nhật lại ID chuẩn để dùng cho các logic khác (edit/delete)
      out.courseClassId = subjectId
      out.teacherId = teacherId
      out.roomId = roomId

      return out
    }
    const enrichedClassSchedules = computed(() => (classSchedules.value || []).map(enrichSchedule))
    const enrichedExamSchedules = computed(() => (examSchedules.value || []).map(enrichSchedule))

    const filteredClassSchedules = computed(() => {
      return filterSchedules(enrichedClassSchedules.value)
    })

    const filteredExamSchedules = computed(() => {
      return filterSchedules(enrichedExamSchedules.value)
    })

    const filteredAllSchedules = computed(() => {
      return [
        ...filteredClassSchedules.value.map(s => ({ ...s, type: 'class' })),
        ...filteredExamSchedules.value.map(s => ({ ...s, type: 'exam' }))
      ].sort((a, b) => new Date(a.date) - new Date(b.date))
    })

    // Parents without scheduled occurrences — show as parent only items so that they are visible in list view
    const parentsWithoutOccurrences = computed(() => {
      const parents = hookRawSchedules.value || []
      return parents.filter(p => {
        const days = p.scheduleDays || p.CourseScheduleDays || []
        return !Array.isArray(days) || days.length === 0
      })
    })

    const parentOnlyEntriesForList = computed(() => {
      return (parentsWithoutOccurrences.value || []).map(p => ({
        id: `parent-${p.id || p.schedule_id}`,
        parentId: p.id || p.schedule_id,
        scheduleType: p.scheduleType || p.schedule_type || 'study',
        subjectId: p.courseClassId || p.course_class_id || p.subjectId || p.subject_id || (p.CourseClass && (p.CourseClass.id || p.CourseClass.course_class_id)) || null,
        subjectName: p.subjectName || p.subject_name || p.CourseClass?.subject_name || p.CourseClass?.name,
        subjectCode: p.subjectCode || p.subject_code || p.CourseClass?.subject_code || '',
        teacherId: p.teacherId || p.teacher_id || p.Teacher?.id || (p.CourseClass && (p.CourseClass.teacherId || p.CourseClass.teacher_id)) || null,
        teacherName: p.teacherName || p.teacher_name || p.Teacher?.name || '',
        roomId: p.roomId || p.room_id || p.Room?.id || (p.CourseClass && (p.CourseClass.room_id || p.CourseClass.roomId)) || null,
        roomName: p.roomName || p.room_name || p.Room?.name || '',
        date: p.startDate || p.start_date || null,
        isParentOnly: true,
        rawParent: p
      }))
    })

    const combinedListForListView = computed(() => {
      // Combine flattened occurrences and any parent-only rows (no duplicates)
      const occurrences = filteredAllSchedules.value || []
      const parentEntries = (parentOnlyEntriesForList.value || []).map(enrichSchedule)
      return [
        ...occurrences,
        ...parentEntries
      ].sort((a, b) => {
        const dateA = a.date || ''
        const dateB = b.date || ''
        if (dateA && dateB) return new Date(dateA) - new Date(dateB)
        if (dateA && !dateB) return -1
        if (!dateA && dateB) return 1
        return 0
      })
    })

    const { success, error } = useToast()

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
        const requested = parseInt(filters.value.dayOfWeek)
        const mappedDay = requested === 7 ? 0 : requested
        result = result.filter(schedule => schedule.dayOfWeek === mappedDay)
      }

      if (filters.value.timeSlot) {
        result = result.filter(schedule => schedule.timeSlot === filters.value.timeSlot)
      }

      if (filters.value.status) {
        result = result.filter(schedule => schedule.status === filters.value.status)
      }

      return result
    }

    const reloadAllSchedules = async () => {
      try {
        const studyRes = await fetchCourseSchedules({ page: 1, limit: 500, schedule_type: 'study' })
        const examRes = await fetchCourseSchedules({ page: 1, limit: 500, schedule_type: 'exam' })
        const studyRows = Array.isArray(studyRes) ? studyRes : (hookSchedules.value || [])
        const examRows = Array.isArray(examRes) ? examRes : (hookSchedules.value || [])
        classSchedules.value = studyRows.filter(s => (s.scheduleType || s.type || 'study') === 'study').map(enrichSchedule)
        examSchedules.value = examRows.filter(s => (s.scheduleType || s.type) === 'exam').map(enrichSchedule)
        try {
          console.debug('reloadAllSchedules: hookRawSchedules', { rawCount: hookRawSchedules.value.length, sampleRaw: hookRawSchedules.value.slice(0,3) })
        } catch (e) {}
        try {
          console.debug('reloadAllSchedules: hookSchedules (flattened)', { hookCount: hookSchedules.value.length, sampleHook: hookSchedules.value.slice(0,5) })
        } catch (e) {}
        try {
          console.debug('reloadAllSchedules: local class & exam counts', { classCount: classSchedules.value.length, examCount: examSchedules.value.length, sampleClass: classSchedules.value.slice(0,5), sampleExam: examSchedules.value.slice(0,5) })
        } catch (e) {}
        try { console.debug('reloadAllSchedules: enrichedClass sample', enrichedClassSchedules.value.slice(0,5)) } catch (e) {}
        try { console.debug('reloadAllSchedules: enrichedExam sample', enrichedExamSchedules.value.slice(0,5)) } catch (e) {}
        try { console.debug('reloadAllSchedules: reloaded', { study: classSchedules.value.length, exam: examSchedules.value.length }) } catch (e) {}
      } catch (err) {
        console.error('Failed to reload all schedules:', err)
      }
    }

    const loadData = async () => {
      loading.value = true
      try {
        await Promise.all([
          loadSubjects(),
          loadTeachers(),
          loadRooms(),
          loadSemesters()
        ])
        // Ensure we load schedules after we have subjects/rooms/teachers so enrichment can attach names
        await reloadAllSchedules()
        await checkConflicts()
        // debug: show loaded counts
        try { console.debug('loadData: loaded schedules', { classCount: classSchedules.value.length, examCount: examSchedules.value.length }) } catch (e) {}
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu:', error)
      } finally {
        loading.value = false
      }
    }

    const loadClassSchedules = async () => {
      try {
        // fetch for study schedules and use the returned value instead of relying on hookSchedules
        const res = await fetchCourseSchedules({ page: 1, limit: 500, schedule_type: 'study' })
        const rows = Array.isArray(res) ? res : (hookSchedules.value || [])
        // ensure we only assign schedules with type study
        classSchedules.value = rows.filter(s => (s.scheduleType || s.type || 'study') === 'study').map(enrichSchedule)
        // debug: log when we load
        if (!classSchedules.value.length) console.debug('loadClassSchedules: no study schedules loaded')
      } catch (err) {
        console.error('Failed to load class schedules:', err)
      }
    }

    const loadExamSchedules = async () => {
      try {
        const res = await fetchCourseSchedules({ page: 1, limit: 500, schedule_type: 'exam' })
        const rows = Array.isArray(res) ? res : (hookSchedules.value || [])
        examSchedules.value = rows.filter(s => (s.scheduleType || s.type) === 'exam').map(enrichSchedule)
        if (!examSchedules.value.length) console.debug('loadExamSchedules: no exam schedules loaded')
      } catch (err) {
        console.error('Failed to load exam schedules:', err)
      }
    }

    const loadSubjects = async () => {
      try {
        await fetchCourseClasses({ page: 1, limit: 500 })
        // Đảm bảo load Semesters và Teachers trước để map tên
        await fetchSemesters()
        await fetchTeachers({ page: 1, limit: 500 })
        
        const semesterMap = (semesters.value || []).reduce((acc, s) => { acc[s.id || s.semester_id] = s; return acc }, {})
        
        // Tạo map teacher dùng cả id và teacher_id làm key để chắc chắn tìm thấy
        const teacherMap = (hookTeachers.value || []).reduce((acc, t) => { 
          if(t.id) acc[t.id] = t; 
          if(t.teacherId) acc[t.teacherId] = t;
          if(t.teacher_id) acc[t.teacher_id] = t; 
          return acc 
        }, {})

        // Xử lý mảng courseClasses (có thể nằm trong .data, .rows hoặc trực tiếp)
        let classesData = courseClasses.value || []
        if (classesData.data) classesData = classesData.data
        if (classesData.rows) classesData = classesData.rows

        subjects.value = classesData.map(c => {
          const semesterId = c.semesterId || c.semester || c.semester_id
          const semester = semesterMap[semesterId]
          // Lấy teacher ID từ lớp học phần
          const teacherId = c.teacherId || c.teacher_id || (c.Teacher ? c.Teacher.id : null)
          const teacher = teacherMap[teacherId]
          
          return {
            id: c.id || c.course_class_id,
            name: c.name || c.subject_name,
            code: c.code || c.subject_code,
            teacherId: teacherId,
            teacherName: c.teacherName || (teacher ? teacher.name : ''),
            roomName: c.roomName || c.room || '', // Room mặc định của lớp (nếu có)
            semesterId: semesterId,
            semesterName: semester ? (semester.name || semester.semester_name || semester.label) : '',
            maxStudents: c.maxStudents || c.capacity || 0
          }
        })
      } catch (err) {
        console.error('Failed to load course classes for subjects', err)
        subjects.value = []
      }
    }

    const loadTeachers = async () => {
      try {
        await fetchTeachers({ page: 1, limit: 500 })
        teachers.value = (hookTeachers.value || []).map(t => ({ id: t.id, teacherId: t.teacherId || t.teacher?.teacher_id || t.teacher?.teacher_id, name: t.name, email: t.email }))
      } catch (err) {
        console.error('Failed to load teachers:', err)
        teachers.value = []
      }
    }

    const loadRooms = async () => {
      try {
        const res = await shareService.listRooms({ limit: 500, page: 1 })
        let rows = []
        if (Array.isArray(res)) rows = res
        else if (Array.isArray(res.data)) rows = res.data
        else if (Array.isArray(res.rows)) rows = res.rows
        rooms.value = (rows || []).map(r => ({ id: r.room_id || r.id, name: r.room_name || r.name, building: r.building || r.base_building, capacity: r.capacity || r.room_capacity || 0 }))
      } catch (err) {
        console.error('Failed to load rooms from backend', err)
        rooms.value = []
      }
    }

    const loadSemesters = async () => {
      try {
        await fetchSemesters()
      } catch (err) {
        console.error('Failed to load semesters in Schedule', err)
      }
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
      scheduleType.value = activeTab.value === 'exam' ? 'exam' : 'study'
      if (scheduleType.value === 'exam') {
        showExamModal.value = true
      } else {
        showScheduleModal.value = true
      }
    }

    const editSchedule = async (schedule) => {
      try {
        isEditMode.value = true
        const parentId = schedule.scheduleId || schedule.parentId || schedule.id
        const res = await fetchCourseSchedule(parentId)
        editingSchedule.value = enrichSchedule(res) // mapped parent schedule enriched
        showScheduleModal.value = true
      } catch (err) {
        console.error('Failed to fetch schedule for edit', err)
        error('Không thể tải chi tiết lịch để sửa. Vui lòng thử lại.')
      }
    }

    const editExam = async (exam) => {
      try {
        isExamEditMode.value = true
        const parentId = exam.scheduleId || exam.parentId || exam.id
        const res = await fetchCourseSchedule(parentId)
        editingExam.value = enrichSchedule(res)
        showExamModal.value = true
      } catch (err) {
        console.error('Failed to fetch exam for edit', err)
        error('Không thể tải chi tiết lịch thi để sửa. Vui lòng thử lại.')
      }
    }

    const deleteSchedule = (schedule) => {
      scheduleToDelete.value = schedule
      deleteScheduleModalVisible.value = true
    }

    const closeDeleteScheduleModal = () => {
      deleteScheduleModalVisible.value = false
      scheduleToDelete.value = null
    }

    const confirmDeleteSchedule = async () => {
      if (!scheduleToDelete.value) return
      try {
        const parentId = scheduleToDelete.value.scheduleId || scheduleToDelete.value.parentId || scheduleToDelete.value.id
        await deleteCourseSchedule(parentId)
        const type = scheduleToDelete.value.type || (scheduleToDelete.value.examType ? 'exam' : 'class')
        if (type === 'exam') {
          // remove all occurrences with parentId
          const parentId = scheduleToDelete.value.scheduleId || scheduleToDelete.value.parentId || scheduleToDelete.value.id
          examSchedules.value = examSchedules.value.filter(s => s.scheduleId !== parentId)
        } else {
          const parentId = scheduleToDelete.value.scheduleId || scheduleToDelete.value.parentId || scheduleToDelete.value.id
          classSchedules.value = classSchedules.value.filter(s => s.scheduleId !== parentId)
        }
        // refresh lists and use the returned arrays (avoid relying on hookSchedules which is overwritten by parallel calls)
        const studyRes = await fetchCourseSchedules({ page: 1, limit: 500, schedule_type: 'study' })
        const examRes = await fetchCourseSchedules({ page: 1, limit: 500, schedule_type: 'exam' })
        const studyRows = Array.isArray(studyRes) ? studyRes : (hookSchedules.value || [])
        const examRows = Array.isArray(examRes) ? examRes : (hookSchedules.value || [])
        classSchedules.value = studyRows.filter(s => (s.scheduleType || s.type || 'study') === 'study').map(enrichSchedule)
        examSchedules.value = examRows.filter(s => (s.scheduleType || s.type) === 'exam').map(enrichSchedule)
        success(`Đã xóa lịch thành công.`)
        closeDeleteScheduleModal()
      } catch (err) {
        console.error('Failed to delete schedule', err)
        if (err?.details) {
          error('Lỗi khi xóa lịch: ' + (err.details.message || JSON.stringify(err.details)))
        } else {
          error(err.message || 'Lỗi khi xóa lịch')
        }
      }
    }

    const deleteExam = (exam) => {
      deleteSchedule({ ...exam, type: 'exam' })
    }

    const handleTablePageChange = async ({ page, limit }) => {
      try {
        const params = { page, limit, schedule_type: activeTab.value === 'exam' ? 'exam' : 'study' }
        if (filters.value.search) params.q = filters.value.search
        const res = await fetchCourseSchedules(params)
        const rows = Array.isArray(res) ? res : (hookSchedules.value || [])
        // Map and enrich before assigning
        const study = rows.filter(s => (s.scheduleType || s.type || 'study') === 'study').map(enrichSchedule)
        const exam = rows.filter(s => (s.scheduleType || s.type) === 'exam').map(enrichSchedule)
        classSchedules.value = study
        examSchedules.value = exam
      } catch (err) {
        console.error('Failed to fetch page of schedules', err)
      }
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

    const saveSchedule = async (scheduleData) => {
      try {
        if (isEditMode.value && editingSchedule.value && editingSchedule.value.id) {
          // update
          await updateCourseSchedule(editingSchedule.value.id, scheduleData)
          await reloadAllSchedules()
          closeUpdateScheduleModal()
          closeScheduleModal()
          checkConflicts()
          success('Đã cập nhật lịch học thành công')
        } else {
          // create
          await createCourseSchedule(scheduleData)
          await reloadAllSchedules()
          closeScheduleModal()
          checkConflicts()
          success('Đã tạo lịch học thành công')
        }
      } catch (err) {
        console.error('Failed to save schedule:', err)
        if (err?.details) {
          error('Lỗi khi lưu lịch: ' + (err.details.message || JSON.stringify(err.details)))
        } else {
          error(err.message || 'Có lỗi xảy ra khi lưu lịch.')
        }
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
      success('Đã cập nhật lịch học thành công')
    }

    const saveExam = async (examData) => {
      try {
        if (isExamEditMode.value && editingExam.value && editingExam.value.id) {
          await updateCourseSchedule(editingExam.value.id, examData)
          await reloadAllSchedules()
          closeUpdateExamModal()
          closeExamModal()
          checkConflicts()
          success('Đã cập nhật lịch thi thành công')
        } else {
          await createCourseSchedule(examData)
          await reloadAllSchedules()
          closeExamModal()
          checkConflicts()
          success('Đã tạo lịch thi thành công')
        }
      } catch (err) {
        console.error('Failed to save exam:', err)
        if (err?.details) {
          error('Lỗi khi lưu lịch thi: ' + (err.details.message || JSON.stringify(err.details)))
        } else {
          error(err.message || 'Có lỗi xảy ra khi lưu lịch thi.')
        }
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
      success('Đã cập nhật lịch thi thành công')
    }

    const closeScheduleModal = () => {
      showScheduleModal.value = false
      editingSchedule.value = null
    }

    const closeExamModal = () => {
      showExamModal.value = false
      editingExam.value = null
    }

    const viewScheduleDetails = async (schedule) => {
      try {
        const parentId = schedule.scheduleId || schedule.parentId || schedule.id
        const res = await fetchCourseSchedule(parentId)
        // merge occurrence-specific data into the parent schedule object for display
        viewingSchedule.value = enrichSchedule({
          ...res,
          date: schedule.date || res.startDate || res.start_date,
          startTime: schedule.startTime || res.startTime,
          endTime: schedule.endTime || res.endTime,
          slotNumber: schedule.slotNumber || null
        })
        viewingType.value = res.scheduleType || res.schedule_type || (schedule.examType ? 'exam' : 'class')
        showDetailsModal.value = true
      } catch (err) {
        console.error('Failed to fetch schedule details', err)
        error('Không thể tải chi tiết lịch.')
      }
    }

    const viewExamDetails = async (exam) => {
      try {
        const parentId = exam.scheduleId || exam.parentId || exam.id
        const res = await fetchCourseSchedule(parentId)
        viewingSchedule.value = enrichSchedule({
          ...res,
          date: exam.date || res.startDate || res.start_date,
          startTime: exam.startTime || res.startTime,
          endTime: exam.endTime || res.endTime,
          slotNumber: exam.slotNumber || null
        })
        viewingType.value = 'exam'
        showDetailsModal.value = true
      } catch (err) {
        console.error('Failed to fetch exam details', err)
        error('Không thể tải chi tiết lịch thi')
      }
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

    // computed combined loading
    const isLoading = computed(() => loading.value || scheduleLoading.value)

    // Lifecycle
    onMounted(() => {
      loadData()
    })

    return {
      // State
      loading: isLoading,
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
      enrichedClassSchedules,
      enrichedExamSchedules,
      subjectMap,
      teacherMap,
      roomMap,
      
      // Methods
      weekDaysForList,
      timeSlotsForList,
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