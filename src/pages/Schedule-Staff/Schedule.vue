<template>
  <div class="schedule-page">
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

    <ScheduleStats :stats="statistics" :active-tab="activeTab" />

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

    <div class="schedule-content">
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

      <div v-if="activeTab === 'exam'" class="schedule-view">
        <ExamCalendar 
          :exams="filteredExamSchedules"
          :loading="loading"
          @edit:exam="editExam"
          @delete:exam="deleteExam"
          @view:details="viewExamDetails"
        />
      </div>

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

    <ConfirmDialog
      :show="deleteScheduleModalVisible"
      type="danger"
      title="Xác nhận xóa lịch"
      :message="scheduleToDelete ? `Bạn có chắc muốn xóa ${scheduleToDelete.examType ? 'lịch thi' : 'lịch học'} ${scheduleToDelete.subjectName || scheduleToDelete.subjectCode}?` : 'Bạn có chắc muốn xóa lịch này?'"
      confirmText="Xóa"
      cancelText="Hủy"
      @confirm="confirmDeleteSchedule"
      @cancel="closeDeleteScheduleModal"
    />

    <ConfirmDialog
      :show="updateScheduleModalVisible"
      type="warning"
      title="Xác nhận cập nhật lịch"
      :message="scheduleToUpdate ? `Bạn có chắc chắn muốn lưu các thay đổi cho lịch ${scheduleToUpdate.subjectName || scheduleToUpdate.subjectCode}?` : 'Bạn có chắc chắn muốn cập nhật lịch này?'"
      confirmText="Xác nhận"
      cancelText="Hủy"
      @confirm="confirmUpdateSchedule"
      @cancel="closeUpdateScheduleModal"
    />

    <ConfirmDialog
      :show="updateExamModalVisible"
      type="warning"
      title="Xác nhận cập nhật lịch thi"
      :message="examToUpdate ? `Bạn có chắc chắn muốn lưu các thay đổi cho lịch thi ${examToUpdate.subjectName || examToUpdate.subjectCode}?` : 'Bạn có chắc chắn muốn cập nhật lịch thi này?'"
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

export default {
  name: 'Schedule',
  components: {
    ScheduleStats, ScheduleFilters, WeeklyCalendar, ExamCalendar, MonthlyCalendar,
    ScheduleTable, WeeklyListView, ScheduleModal, ExamModal, ScheduleDetailsModal,
    ConflictCheckerModal, ConfirmDialog
  },
setup() {
    // --- STATE ---
    const loading = ref(false)
    const activeTab = ref('class')
    const classSchedules = ref([])
    const examSchedules = ref([])
    // Hooks
    const { loading: scheduleLoading, fetchCourseSchedules, fetchCourseSchedule, createCourseSchedule, updateCourseSchedule, deleteCourseSchedule } = useCourseSchedules()
    const { semesters, fetchSemesters } = useSemesters()
    const { courseClasses, fetchCourseClasses } = useCourseClasses()
    const { teachers: hookTeachers, fetchTeachers } = useTeachers()
    const { success, error } = useToast()

    // Local Data
    const subjects = ref([])
    const teachers = ref([])
    const rooms = ref([])

    // Modals & Flags
    const showScheduleModal = ref(false)
    const showExamModal = ref(false)
    const showDetailsModal = ref(false)
    const showConflictModal = ref(false)
    const deleteScheduleModalVisible = ref(false)
    const updateScheduleModalVisible = ref(false)
    const updateExamModalVisible = ref(false)
    
    const scheduleToDelete = ref(null)
    const scheduleToUpdate = ref(null)
    const examToUpdate = ref(null)
    const editingSchedule = ref(null)
    const editingExam = ref(null)
    const viewingSchedule = ref(null)
    const viewingType = ref('study')
    const isEditMode = ref(false)
    const isExamEditMode = ref(false)
    const scheduleType = ref('study')
    const scheduleConflicts = ref([])

    const filters = ref({
      search: '', semester: '', teacher: '', room: '', subject: '',
      dayOfWeek: '', timeSlot: '', status: ''
    })

    // --- COMPUTED MAPS ---
    const subjectMap = computed(() => {
      const map = {}
      subjects.value.forEach(s => { if (s && s.id) map[s.id] = s })
      return map
    })
    const teacherMap = computed(() => {
      const map = {}
      teachers.value.forEach(t => { 
        if (t.id) map[t.id] = t
        if (t.teacherId) map[t.teacherId] = t 
      })
      return map
    })
    const roomMap = computed(() => {
      const map = {}
      rooms.value.forEach(r => { if (r.id) map[r.id] = r })
      return map
    })

    // --- ENRICH DATA FUNCTION ---
  const enrichSchedule = (s) => {
  if (!s) return s
  const out = { ...s }

  // Chuẩn hóa ID và các field cơ bản
  out.id = out.id || out.schedule_id || out.scheduleId
  // Lưu ý: api thường trả về course_class_id cho môn học
  const subjectId = out.courseClassId || out.course_class_id || out.subjectId || out.subject_id
  const teacherId = out.teacherId || out.teacher_id
  const roomId = out.roomId || out.room_id
  
  out.startDate = out.startDate || out.start_date
  out.endDate = out.endDate || out.end_date
  out.scheduleType = out.scheduleType || out.schedule_type || (out.type === 'exam' ? 'exam' : 'study')
  out.repeatType = out.repeatType || out.repeat_type || 'weekly'
  out.repeatInterval = out.repeatInterval || out.repeat_weeks || 1
  out.notes = out.notes || ''

  // --- Map Tên (Môn, GV, Phòng) ---
  // Dùng == để so sánh lỏng (ví dụ "1" == 1)
  const sub = Object.values(subjectMap.value).find(x => x.id == subjectId)

  // Tên Môn học
  if (sub) {
    out.subjectName = sub.name
    out.subjectCode = sub.code
    out.subjectId = sub.id
  } else {
    // Fallback nếu không tìm thấy trong danh sách (lấy từ object lồng nhau nếu có)
    out.subjectName = out.subjectName || out.subject_name || out.CourseClass?.name || ''
    out.subjectCode = out.subjectCode || out.subject_code || out.CourseClass?.code || ''
    out.subjectId = subjectId 
  }

  // Tên Giáo viên
  const tId = teacherId || (sub ? sub.teacherId : null)
  const t = Object.values(teacherMap.value).find(x => x.id == tId || x.teacherId == tId)
  out.teacherName = t ? t.name : (out.teacherName || out.teacher_name || out.Teacher?.name || (sub ? sub.teacherName : ''))
  out.teacherId = t ? t.id : tId

  // Tên Phòng
  const rId = roomId || (sub ? sub.roomId : null)
  const r = Object.values(roomMap.value).find(x => x.id == rId)
  out.roomName = r ? r.name : (out.roomName || out.room_name || out.Room?.name || (sub ? sub.roomName : ''))
  out.roomId = r ? r.id : rId

  // --- Xử lý danh sách ngày học (Fix lỗi form sửa trống) ---
  // API có thể trả về nhiều kiểu tên: scheduleDays, schedule_days, CourseScheduleDays
  let rawDays = out.scheduleDays || out.schedule_days || out.CourseScheduleDays || []
  if (!Array.isArray(rawDays)) rawDays = []
  
  out.scheduleDays = rawDays.map(day => ({
    // Kiểm tra đủ các trường hợp tên biến của Backend
    day: day.day || day.dayOfWeek || day.day_of_week || day.weekdayId || day.weekday_id, 
    slots: day.slots || day.timeSlots || day.time_slots || [] 
  }))

  return out
}

    const enrichedClassSchedules = computed(() => classSchedules.value.map(enrichSchedule))
    const enrichedExamSchedules = computed(() => examSchedules.value.map(enrichSchedule))

    // --- FILTERS ---
    const filterSchedules = (list) => {
      let res = list
      if (filters.value.search) {
        const s = filters.value.search.toLowerCase()
        res = res.filter(x => x.subjectName?.toLowerCase().includes(s) || x.teacherName?.toLowerCase().includes(s))
      }
      if (filters.value.subject) res = res.filter(x => x.subjectId === filters.value.subject)
      if (filters.value.teacher) res = res.filter(x => x.teacherId === filters.value.teacher)
      if (filters.value.room) res = res.filter(x => x.roomId === filters.value.room)
      if (filters.value.semester) res = res.filter(x => x.semesterId === filters.value.semester)
      return res
    }

    const filteredClassSchedules = computed(() => filterSchedules(enrichedClassSchedules.value))
    const filteredExamSchedules = computed(() => filterSchedules(enrichedExamSchedules.value))
    
    const filteredAllSchedules = computed(() => [
      ...filteredClassSchedules.value.map(s => ({ ...s, type: 'class' })),
      ...filteredExamSchedules.value.map(s => ({ ...s, type: 'exam' }))
    ].sort((a, b) => new Date(a.date) - new Date(b.date)))

    // --- DATA LOADING FUNCTIONS ---
    
    // 1. Load Rooms (Đã sửa lỗi rows.map)
    const loadRooms = async () => {
      try {
        const res = await shareService.listRooms({ limit: 500, page: 1 })
        // Kiểm tra kỹ kiểu dữ liệu trả về để đảm bảo là mảng
        let rows = []
        if (Array.isArray(res)) rows = res
        else if (Array.isArray(res?.data)) rows = res.data
        else if (Array.isArray(res?.rows)) rows = res.rows
        
        rooms.value = rows.map(r => ({ 
          id: r.room_id || r.id, 
          name: r.room_name || r.name,
          capacity: r.capacity || r.room_capacity || 0
        }))
      } catch (err) {
        console.error('Failed to load rooms:', err)
        rooms.value = []
      }
    }

    // 2. Load Teachers
    const loadTeachers = async () => {
      try {
        await fetchTeachers({ page: 1, limit: 500 })
        teachers.value = (hookTeachers.value || []).map(t => ({ 
          id: t.id, 
          teacherId: t.teacherId || t.teacher?.teacher_id || t.id, 
          name: t.name || t.full_name 
        }))
      } catch (err) {
        console.error('Failed to load teachers:', err)
      }
    }

    // 3. Load Semesters (Đã thêm lại hàm bị thiếu)
    const loadSemesters = async () => {
      try {
        await fetchSemesters()
      } catch (err) {
        console.error('Failed to load semesters:', err)
      }
    }

    // 4. Load Subjects (Classes)
    const loadSubjects = async () => {
      try {
        await fetchCourseClasses({ page: 1, limit: 500 })
        let data = courseClasses.value.data || courseClasses.value.rows || courseClasses.value || []
        
        subjects.value = data.map(c => {
          const tId = c.teacherId || c.teacher_id || c.Teacher?.id
          const rId = c.roomId || c.room_id || c.Room?.id
          const sId = c.semesterId || c.semester_id

          const teacher = teacherMap.value[tId]
          const room = roomMap.value[rId]
          const semester = semesters.value.find(s => (s.id || s.semester_id) === sId)

          return {
            id: c.id || c.course_class_id,
            name: c.name || c.subject_name,
            code: c.code || c.subject_code,
            teacherId: tId,
            teacherName: c.teacherName || (teacher ? teacher.name : ''),
            roomId: rId,
            roomName: c.roomName || (room ? room.name : ''),
            semesterId: sId,
            semesterName: semester ? (semester.name || semester.label) : '',
            maxStudents: c.maxStudents || 0
          }
        })
      } catch (err) {
        console.error('Failed to load subjects:', err)
      }
    }

    // 5. Reload Schedules
    const reloadAllSchedules = async () => {
      try {
        const [study, exam] = await Promise.all([
          fetchCourseSchedules({ page: 1, limit: 500, schedule_type: 'study' }),
          fetchCourseSchedules({ page: 1, limit: 500, schedule_type: 'exam' })
        ])
        const studyRows = Array.isArray(study) ? study : study.data || []
        const examRows = Array.isArray(exam) ? exam : exam.data || []
        
        classSchedules.value = studyRows.map(enrichSchedule)
        examSchedules.value = examRows.map(enrichSchedule)
      } catch (err) {
        console.error('Failed to reload schedules:', err)
      }
    }

    // 6. Main Load Data Function
    const loadData = async () => {
      loading.value = true
      try {
        // Load danh mục trước để có dữ liệu map
        await Promise.all([loadRooms(), loadTeachers(), loadSemesters()])
        // Sau đó load subjects và schedules
        await loadSubjects() 
        await reloadAllSchedules()
      } catch (e) {
        console.error('Init data error:', e)
      } finally {
        loading.value = false
      }
    }

    // --- ACTIONS ---
    const openScheduleModal = () => {
      editingSchedule.value = null
      isEditMode.value = false
      scheduleType.value = activeTab.value === 'exam' ? 'exam' : 'study'
      scheduleType.value === 'exam' ? (showExamModal.value = true) : (showScheduleModal.value = true)
    }

   const editSchedule = async (s) => {
  try {
    const id = s.scheduleId || s.parentId || s.id
    const res = await fetchCourseSchedule(id)
    
    // FIX QUAN TRỌNG: Lấy dữ liệu từ res.data nếu có wrapper
    const rawData = res.data || res 
    
    console.log('API Edit Response:', rawData) // Debug để xem data trả về
    editingSchedule.value = enrichSchedule(rawData)
    
    isEditMode.value = true
    showScheduleModal.value = true
  } catch (e) {
    console.error(e)
    error('Lỗi tải chi tiết lịch')
  }
}

    const editExam = async (e) => {
      try {
        const id = e.scheduleId || e.parentId || e.id
        const res = await fetchCourseSchedule(id)
        editingExam.value = enrichSchedule(res)
        isExamEditMode.value = true
        showExamModal.value = true
      } catch (err) { error('Lỗi tải chi tiết lịch thi') }
    }

    const saveSchedule = async (data) => {
      try {
        if (isEditMode.value && editingSchedule.value?.id) {
          await updateCourseSchedule(editingSchedule.value.id, data)
          success('Cập nhật thành công')
        } else {
          await createCourseSchedule(data)
          success('Tạo lịch thành công')
        }
        await reloadAllSchedules()
        closeScheduleModal()
      } catch (e) { 
        console.error(e)
        error('Lỗi lưu dữ liệu: ' + (e.message || 'Unknown error')) 
      }
    }

    const saveExam = async (data) => {
      try {
        if (isExamEditMode.value && editingExam.value?.id) {
          await updateCourseSchedule(editingExam.value.id, data)
          success('Cập nhật lịch thi thành công')
        } else {
          await createCourseSchedule(data)
          success('Tạo lịch thi thành công')
        }
        await reloadAllSchedules()
        closeExamModal()
      } catch (e) {
        console.error(e)
        error('Lỗi lưu lịch thi: ' + (e.message || 'Unknown error'))
      }
    }

    const deleteSchedule = (s) => {
      scheduleToDelete.value = s
      deleteScheduleModalVisible.value = true
    }

    const confirmDeleteSchedule = async () => {
      if (!scheduleToDelete.value) return
      try {
        const id = scheduleToDelete.value.scheduleId || scheduleToDelete.value.parentId || scheduleToDelete.value.id
        await deleteCourseSchedule(id)
        success('Xóa thành công')
        await reloadAllSchedules()
        closeDeleteScheduleModal()
      } catch (e) { error('Lỗi xóa lịch') }
    }

    const viewScheduleDetails = async (s) => {
      try {
        // BƯỚC 1: Hiển thị ngay lập tức dữ liệu từ danh sách (đang đúng)
        // Việc này đảm bảo Modal luôn có Tên môn, GV, Phòng ngay khi mở
        const baseData = enrichSchedule(s)
        viewingSchedule.value = { ...baseData }
        viewingType.value = s.type === 'exam' || s.scheduleType === 'exam' ? 'exam' : 'class'
        showDetailsModal.value = true // Mở modal ngay

        // BƯỚC 2: Gọi API lấy thêm chi tiết (nếu cần description, ds sinh viên...)
        const id = s.scheduleId || s.parentId || s.id
        if (id) {
            const res = await fetchCourseSchedule(id)
            const rawData = res.data || res 
            const enrichedDetail = enrichSchedule(rawData)
            
            // BƯỚC 3: Merge thông minh
            // Chỉ ghi đè các field chi tiết, giữ nguyên thông tin hiển thị cơ bản nếu API trả về null
            viewingSchedule.value = {
                ...viewingSchedule.value, // Giữ thông tin cũ
                ...enrichedDetail,        // Ghi đè thông tin mới
                // Khôi phục lại Subject/Teacher/Room Name nếu API chi tiết bị thiếu
                subjectName: enrichedDetail.subjectName || viewingSchedule.value.subjectName,
                teacherName: enrichedDetail.teacherName || viewingSchedule.value.teacherName,
                roomName: enrichedDetail.roomName || viewingSchedule.value.roomName,
                // Quan trọng: Giữ nguyên ngày giờ của slot đang click (không dùng ngày bắt đầu của cả chuỗi lịch)
                date: s.date || enrichedDetail.startDate,
                startTime: s.startTime || enrichedDetail.startTime,
                endTime: s.endTime || enrichedDetail.endTime
            }
        }
      } catch (e) { 
        console.error('Lỗi tải chi tiết:', e)
        // Không show error toast vì người dùng vẫn xem được thông tin cơ bản
      }
    }

    const viewExamDetails = (e) => viewScheduleDetails({ ...e, type: 'exam' })
    
    // --- HELPERS ---
    const exportSchedule = () => { console.log('Exporting...') }
    const openConflictChecker = () => { checkConflicts(); showConflictModal.value = true }
    const closeScheduleModal = () => { showScheduleModal.value = false; editingSchedule.value = null }
    const closeExamModal = () => { showExamModal.value = false; editingExam.value = null }
    const closeDetailsModal = () => { showDetailsModal.value = false; viewingSchedule.value = null }
    const closeDeleteScheduleModal = () => { deleteScheduleModalVisible.value = false; scheduleToDelete.value = null }
    const closeUpdateScheduleModal = () => updateScheduleModalVisible.value = false
    const closeUpdateExamModal = () => updateExamModalVisible.value = false
    const confirmUpdateSchedule = () => {}
    const confirmUpdateExam = () => {}
    const resolveConflict = () => {}
    const closeConflictModal = () => showConflictModal.value = false
    const checkConflicts = () => {}
    const editFromDetails = () => {
       closeDetailsModal()
       viewingType.value === 'exam' ? editExam(viewingSchedule.value) : editSchedule(viewingSchedule.value)
    }
    const deleteExam = (e) => deleteSchedule({ ...e, type: 'exam' })
    const updateFilters = (f) => filters.value = { ...filters.value, ...f }
    const resetFilters = () => filters.value = { search: '', semester: '', teacher: '', room: '', subject: '', dayOfWeek: '', timeSlot: '', status: '' }

    // List View Data
    const weekDaysForList = [{ dayOfWeek: 2, name: 'Thứ Hai' }, { dayOfWeek: 3, name: 'Thứ Ba' }, { dayOfWeek: 4, name: 'Thứ Tư' }, { dayOfWeek: 5, name: 'Thứ Năm' }, { dayOfWeek: 6, name: 'Thứ Sáu' }, { dayOfWeek: 7, name: 'Thứ Bảy' }, { dayOfWeek: 8, name: 'Chủ Nhật' }]
    const timeSlotsForList = [] 
    const combinedListForListView = computed(() => filteredAllSchedules.value)

    const tabs = computed(() => [
      { key: 'class', label: 'Lịch học', icon: 'fas fa-chalkboard-teacher', count: classSchedules.value.length },
      { key: 'exam', label: 'Lịch thi', icon: 'fas fa-file-alt', count: examSchedules.value.length },
      { key: 'monthly', label: 'Lịch tháng', icon: 'fas fa-calendar-alt', count: filteredAllSchedules.value.length },
      { key: 'list', label: 'Danh sách', icon: 'fas fa-list', count: filteredAllSchedules.value.length }
    ])
    const statistics = computed(() => ({ 
      totalSchedules: classSchedules.value.length + examSchedules.value.length, 
      classSchedules: classSchedules.value.length, 
      examSchedules: examSchedules.value.length, 
      conflicts: 0, roomsUsed: rooms.value.length, teachersAssigned: teachers.value.length 
    }))

    onMounted(loadData)

    return {
      loading, activeTab, tabs, statistics, filters, 
      filteredClassSchedules, filteredExamSchedules, filteredAllSchedules, combinedListForListView,
      subjects, teachers, rooms, semesters,
      weekDaysForList, timeSlotsForList, scheduleConflicts,
      // Modals
      showScheduleModal, showExamModal, showDetailsModal, showConflictModal,
      deleteScheduleModalVisible, updateScheduleModalVisible, updateExamModalVisible,
      editingSchedule, editingExam, viewingSchedule, viewingType,
      isEditMode, isExamEditMode, scheduleType, scheduleToDelete, scheduleToUpdate, examToUpdate,
      // Methods
      updateFilters, resetFilters,
      openScheduleModal, editSchedule, editExam, deleteSchedule, deleteExam,
      saveSchedule, saveExam,
      viewScheduleDetails, viewExamDetails, editFromDetails,
      exportSchedule, openConflictChecker,
      closeScheduleModal, closeExamModal, closeDetailsModal, closeDeleteScheduleModal,
      confirmDeleteSchedule, closeUpdateScheduleModal, closeUpdateExamModal,
      confirmUpdateSchedule, confirmUpdateExam, closeConflictModal, resolveConflict
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