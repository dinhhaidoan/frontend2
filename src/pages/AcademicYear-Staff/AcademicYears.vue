<template>
  <div class="academic-year-page">
    <div class="page-header">
      <div class="breadcrumb">
        <i class="fas fa-home"></i>
        <span>Dashboard</span>
        <i class="fas fa-angle-right"></i>
        <span class="current">Quản lý Khóa học & Học kỳ</span>
      </div>
      <div class="header-main">
        <div class="title-section">
          <h1>
            <i class="fas fa-user-graduate"></i>
            Quản lý Khóa học & Học kỳ
          </h1>
        </div>
        <div class="header-actions">
          <router-link :to="{ name: 'staff-frameworksubject' }" class="btn-export">
            <i class="fas fa-sitemap"></i>
            <span>Quản lý chương trình khung</span>
          </router-link>
        </div>
      </div>
    </div>

    <div class="main-section">
      <div class="course-management">
        <div class="course-header">
          <h3>
            <i class="fas fa-user-graduate"></i>
            Quản lý Khóa học
          </h3>
          <div class="course-actions">
            <button @click="openCourseModal(true)" class="btn-add-course">
              <i class="fas fa-plus"></i>
              Tạo Khóa
            </button>
          </div>
        </div>

        <div class="course-list">
          <table class="course-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên Khóa</th>
                <th>Năm bắt đầu</th>
                <th>Năm kết thúc</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(c, idx) in courses" :key="c.id || idx">
                <td>{{ idx + 1 }}</td>
                <td>{{ c.name }}</td>
                <td>{{ c.start }}</td>
                <td>{{ c.end }}</td>
                <td>
                  <button class="action-btn edit" @click="editCourse(c)"><i class="fas fa-edit"></i></button>
                  <button class="action-btn delete" @click="promptDeleteCourse(c)"><i class="fas fa-trash"></i></button>
                </td>
              </tr>
              <tr v-if="courses.length === 0"><td colspan="5" class="empty">Chưa có Khóa học</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="semester-management">
        <div class="semester-header">
          <h3>
            <i class="fas fa-calendar-alt"></i>
            Quản lý học kỳ
          </h3>
          <button @click="openSemesterModal" class="btn-add-semester">
            <i class="fas fa-plus"></i>
            Tạo học kỳ
          </button>
        </div>

        <div class="semester-list">
          <div v-if="semestersLoading" class="empty-semesters">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Đang tải danh sách Học kỳ…</p>
          </div>
          <div 
            v-for="semester in semesters" 
            :key="semester.id"
            class="semester-card"
          >
            <div class="semester-info">
              <div class="semester-name">{{ semester.name }}</div>
              <div class="semester-meta">
                <span class="semester-period">{{ formatDateDDMMYYYY(semester.startDate) }} - {{ formatDateDDMMYYYY(semester.endDate) }}</span>
                <span class="semester-status" :class="semester.status">{{ getStatusLabel(semester.status) }}</span>
              </div>
            </div>
            <div class="semester-stats">
              <div class="stat-item">
                <span class="stat-value">{{ semester.subjectCount || 0 }}</span>
                <span class="stat-label">môn</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ semester.maxCredits }}</span>
                <span class="stat-label">TC</span>
              </div>
            </div>
            <div class="semester-actions">
              <button @click="viewSemesterDetail(semester)" class="action-btn view"><i class="fas fa-eye"></i></button>
              <button @click="editSemester(semester)" class="action-btn edit"><i class="fas fa-edit"></i></button>
              <button @click="promptDeleteSemester(semester)" class="action-btn delete"><i class="fas fa-trash"></i></button>
            </div>
          </div>

          <div v-if="!semestersLoading && semesters.length === 0" class="empty-semesters">
            <i class="fas fa-calendar-plus"></i>
            <p>Chưa có học kỳ nào</p>
            <button @click="openSemesterModal" class="btn-create-first">Tạo học kỳ đầu tiên</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Course Modal -->
    <Transition name="modal-fade">
      <div v-if="courseModalVisible" class="modal-overlay" @click.self="closeCourseModal">
        <div class="semester-modal" @click.stop>
          <div class="modal-header">
            <h3>{{ courseModalMode === 'create' ? 'Tạo Khóa' : 'Chỉnh sửa Khóa' }}</h3>
            <button class="close-btn" @click="closeCourseModal"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label>Tên Khóa</label>
              <div class="input-with-action" style="display:flex; gap:8px; align-items:center;">
                <input v-model="courseForm.name" placeholder="VD: K22" maxlength="255" style="flex:1" />
                <button type="button" class="btn-suggest" @click="courseForm.name = suggestedName">Gợi ý</button>
              </div>
              <p class="text-muted">Ví dụ: K22 — hoặc <strong>{{ namePreview }}</strong></p>
              <p v-if="serverErrors.academic_year_name || serverErrors.name" class="text-error">{{ serverErrors.academic_year_name || serverErrors.name }}</p>
              <p v-else-if="isNameDuplicate" class="text-error">Tên Khóa đã tồn tại trên hệ thống</p>
              <p v-else class="text-help">Tối đa 255 ký tự. Khoá sẽ được hiển thị như: <strong>{{ namePreview }}</strong></p>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label>Năm bắt đầu</label>
                <input v-model.number="courseForm.start" type="number" placeholder="2024" />
                <p v-if="serverErrors.academic_year_start || serverErrors.start" class="text-error">{{ serverErrors.academic_year_start || serverErrors.start }}</p>
              </div>
              <div class="form-group">
                <label>Năm kết thúc</label>
                <input v-model.number="courseForm.end" type="number" placeholder="2028" />
                <p v-if="serverErrors.academic_year_end || serverErrors.end" class="text-error">{{ serverErrors.academic_year_end || serverErrors.end }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn-cancel" @click="closeCourseModal">Hủy</button>
            <button class="btn-primary" :disabled="isSaveDisabled || savingCourse" @click="saveCourse">{{ courseModalMode === 'create' ? 'Tạo' : 'Lưu' }}</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Course Delete Confirmation (shared ConfirmDialog) -->
    <ConfirmDialog
      :show="deleteCourseModalVisible"
      type="danger"
      title="Xác nhận xóa Khóa học"
      :message="courseToDelete ? `Bạn có chắc muốn xóa Khóa ${courseToDelete.name}? Hành động này không thể hoàn tác.` : 'Bạn có chắc muốn xóa Khóa này?'
      "
      confirmText="Xóa"
      cancelText="Hủy"
      @confirm="confirmDeleteCourse"
      @cancel="closeDeleteCourseModal"
    />

    <!-- Semester Delete Confirmation (shared ConfirmDialog) -->
    <ConfirmDialog
      :show="deleteSemesterModalVisible"
      type="danger"
      title="Xác nhận xóa Học kỳ"
      :message="semesterToDelete ? `Bạn có chắc muốn xóa học kỳ ${semesterToDelete.name}? Hành động này không thể hoàn tác.` : 'Bạn có chắc muốn xóa học kỳ này?'
      "
      confirmText="Xóa"
      cancelText="Hủy"
      @confirm="confirmDeleteSemester"
      @cancel="closeDeleteSemesterModal"
    />

    <!-- Course Save Confirmation -->
    <ConfirmDialog
      :show="saveCourseConfirmVisible"
      type="warning"
      title="Xác nhận lưu Khóa"
      :message="courseModalMode === 'create' ? `Bạn có chắc chắn muốn tạo Khóa ${pendingCourse?.name || ''}?` : `Bạn có chắc chắn muốn lưu thay đổi cho Khóa ${pendingCourse?.name || ''}?`"
      confirmText="Lưu"
      cancelText="Hủy"
      @confirm="confirmSaveCourse"
      @cancel="closeSaveCourseConfirm"
    />

    <!-- Semester Save Confirmation -->
    <ConfirmDialog
      :show="saveSemesterConfirmVisible"
      type="warning"
      title="Xác nhận lưu Học kỳ"
      :message="semesterModalMode === 'create' ? `Bạn có chắc chắn muốn tạo Học kỳ ${pendingSemester?.name || ''}?` : `Bạn có chắc chắn muốn lưu thay đổi cho Học kỳ ${pendingSemester?.name || ''}?`"
      confirmText="Lưu"
      cancelText="Hủy"
      @confirm="confirmSaveSemester"
      @cancel="closeSaveSemesterConfirm"
    />

    <!-- Semester Modals -->
    <SemesterModal 
      :is-visible="semesterModalVisible"
      :mode="semesterModalMode"
      :semester="selectedSemester"
      :server-errors="semesterServerErrors"
      :saving="savingSemester"
      @close="closeSemesterModal"
      @save="handleSemesterSave"
    />

    <SemesterDetailModal 
      :is-visible="semesterDetailModalVisible"
      :semester="selectedSemesterDetail"
      @close="closeSemesterDetailModal"
      @edit="handleEditFromDetail"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useToast } from '@/composables/useToast'
import { useAcademicYears } from '@/hooks/useAcademicYears'
import { useSemesters } from '@/hooks/useSemesters'
import { formatDateDDMMYYYY } from '@/utils/formatters'
import { useRouter } from 'vue-router'
import SemesterModal from '@/components/FrameworkSubject-Staff/SemesterModal.vue'
import SemesterDetailModal from '@/components/FrameworkSubject-Staff/SemesterDetailModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const router = useRouter()
const toast = useToast()

// Courses (Academic Years) - use the hook to fetch from backend
const { academicYears, fetchAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear, loading } = useAcademicYears()
const courses = academicYears
const courseModalVisible = ref(false)
const courseModalMode = ref('create') // 'create' | 'edit'
const selectedCourse = ref(null)
const courseForm = reactive({ id: null, name: '', start: new Date().getFullYear(), end: new Date().getFullYear() + 4 })
const serverErrors = ref({})
const courseToDelete = ref(null)
const deleteCourseModalVisible = ref(false)
// Save confirmation state for course
const pendingCourse = ref(null)
const saveCourseConfirmVisible = ref(false)
// Confirm dialog state for semester deletion
const semesterToDelete = ref(null)
const deleteSemesterModalVisible = ref(false)

const openCourseModal = (isCreate = true) => {
  courseModalMode.value = isCreate ? 'create' : 'edit'
  if (isCreate) {
    courseForm.id = null
    courseForm.name = ''
    courseForm.start = new Date().getFullYear()
    courseForm.end = new Date().getFullYear() + 4
  }
  serverErrors.value = {}
  courseModalVisible.value = true
}

const editCourse = (c) => {
  courseModalMode.value = 'edit'
  courseForm.id = c.id
  courseForm.name = c.name
  courseForm.start = c.start
  courseForm.end = c.end
  selectedCourse.value = c
  courseModalVisible.value = true
}

const validateCourse = (f) => {
  const errs = {}
  if (!f.name || String(f.name).trim() === '') errs.name = 'Tên khóa bắt buộc'
  const s = Number(f.start)
  const e = Number(f.end)
  if (!Number.isInteger(s) || s < 1900) errs.start = 'Năm bắt đầu không hợp lệ'
  if (!Number.isInteger(e) || e < 1900) errs.end = 'Năm kết thúc không hợp lệ'
  if (!errs.start && !errs.end && e < s) errs.end = 'Năm kết thúc phải lớn hơn hoặc bằng năm bắt đầu'
  return errs
}

// Generate a suggestion for course name based on start year
const suggestedName = computed(() => {
  const s = Number(courseForm.start)
  if (!Number.isInteger(s) || s < 1900) return ''
  const yy = String(s).slice(-2)
  return `K${yy}`
})

const namePreview = computed(() => {
  const name = courseForm.name && courseForm.name.trim() !== '' ? courseForm.name.trim() : suggestedName.value
  if (!name) return ''
  const s = courseForm.start
  const e = courseForm.end
  if (s && e) return `${name} (${s}-${e})`
  return name
})

const normalizeName = (n) => String(n || '').trim().toUpperCase()

const isNameDuplicate = computed(() => {
  const n = normalizeName(courseForm.name)
  if (!n) return false
  return courses.value.some(c => normalizeName(c.name) === n && c.id !== courseForm.id)
})

// Auto-uppercase name input and trim
watch(() => courseForm.name, (v) => {
  if (v == null) return
  const up = String(v).toUpperCase()
  if (up !== v) courseForm.name = up
})

// Suggest name when user changes years and name is empty
watch(() => [courseForm.start, courseForm.end], ([s, e]) => {
  if ((courseForm.name == null || String(courseForm.name).trim() === '') && suggestedName.value) {
    courseForm.name = suggestedName.value
  }
})

const savingCourse = ref(false)
const isSaveDisabled = computed(() => {
  const errs = validateCourse(courseForm)
  if (Object.keys(errs).length) return true
  if (isNameDuplicate.value) return true
  return false
})

const saveCourse = () => {
  const errs = validateCourse(courseForm)
  if (Object.keys(errs).length) return toast.error('Vui lòng kiểm tra thông tin khóa học')
  // Prevent duplicates client-side
  const nameLower = String(courseForm.name || '').trim().toLowerCase()
  if (courseModalMode.value === 'create' && courses.value.some(c => String(c.name || '').trim().toLowerCase() === nameLower)) {
    return toast.error('Tên Khóa đã tồn tại')
  }
  if (isNameDuplicate.value) return toast.error('Tên Khóa đã tồn tại, vui lòng đổi tên khác')
  // store pending and show confirmation
  pendingCourse.value = { ...courseForm }
  saveCourseConfirmVisible.value = true
}

const confirmSaveCourse = async () => {
  if (!pendingCourse.value) return closeSaveCourseConfirm()
  const f = pendingCourse.value
  savingCourse.value = true
  try {
    if (courseModalMode.value === 'create') {
      const payload = {
        academic_year_name: f.name,
        academic_year_start: Number(f.start),
        academic_year_end: Number(f.end)
      }
      await createAcademicYear(payload)
    } else {
      const payload = {}
      if (f.start !== undefined) payload.academic_year_start = Number(f.start)
      if (f.end !== undefined) payload.academic_year_end = Number(f.end)
      if (f.name !== undefined) payload.academic_year_name = f.name
      await updateAcademicYear(f.id, payload)
    }
    serverErrors.value = {}
  } catch (err) {
    // If backend provided field-level errors, attach them to UI
    if (err.details && typeof err.details === 'object') {
      serverErrors.value = err.details
    }
    toast.error(err.message || 'Lưu Khóa học thất bại')
  }
    finally {
      savingCourse.value = false
    }
  closeSaveCourseConfirm()
  courseModalVisible.value = false
}

const closeSaveCourseConfirm = () => { saveCourseConfirmVisible.value = false; pendingCourse.value = null }
// Close course modal and clear server errors
const closeCourseModal = () => { courseModalVisible.value = false; serverErrors.value = {} }

const promptDeleteCourse = (c) => {
  courseToDelete.value = c
  deleteCourseModalVisible.value = true
}

const confirmDeleteCourse = async () => {
  if (!courseToDelete.value) return closeDeleteCourseModal()
  try {
    await deleteAcademicYear(courseToDelete.value.id)
  } catch (err) {
    toast.error(err.message || 'Xóa Khóa học thất bại')
  }
  closeDeleteCourseModal()
}

const closeDeleteCourseModal = () => { deleteCourseModalVisible.value = false; courseToDelete.value = null }

// Semesters - use the hook we created
const { semesters: semestersList, fetchSemesters, getSemester, createSemester, updateSemester, deleteSemester, loading: semestersLoading } = useSemesters()
const semesters = semestersList

const semesterModalVisible = ref(false)
const semesterModalMode = ref('create')
const selectedSemester = ref(null)
const semesterDetailModalVisible = ref(false)
const selectedSemesterDetail = ref(null)

const openSemesterModal = () => {
  semesterModalMode.value = 'create'
  selectedSemester.value = null
  semesterServerErrors.value = {}
  semesterModalVisible.value = true
}

const closeSemesterModal = () => {
  semesterModalVisible.value = false
  selectedSemester.value = null
  semesterServerErrors.value = {}
  savingSemester.value = false
}

const pendingSemester = ref(null)
const saveSemesterConfirmVisible = ref(false)

const semesterServerErrors = ref({})
const savingSemester = ref(false)

const handleSemesterSave = (formData) => {
  // Store pending data and show confirmation dialog
  pendingSemester.value = { ...formData }
  semesterServerErrors.value = {}
  saveSemesterConfirmVisible.value = true
}

const confirmSaveSemester = async () => {
  if (!pendingSemester.value) return closeSaveSemesterConfirm()
  const formData = pendingSemester.value
  savingSemester.value = true
  try {
    const payload = {
      semester_name: formData.name,
      semester_start: formData.startDate,
      semester_end: formData.endDate,
      max_credits: formData.maxCredits != null ? Number(formData.maxCredits) : 0
    }
    if (semesterModalMode.value === 'create') {
      await createSemester(payload)
    } else {
      await updateSemester(formData.id, payload)
    }
    semesterServerErrors.value = {}
    toast.success(semesterModalMode.value === 'create' ? 'Tạo Học kỳ thành công' : 'Cập nhật Học kỳ thành công')
  } catch (err) {
    if (err.details && typeof err.details === 'object') {
      semesterServerErrors.value = err.details
    }
    // The hook already toasts error; also display a toast here for clarity
    toast.error(err.message || 'Lưu Học kỳ thất bại')
  } finally {
    savingSemester.value = false
  }
  closeSaveSemesterConfirm()
  closeSemesterModal()
}

const closeSaveSemesterConfirm = () => { saveSemesterConfirmVisible.value = false; pendingSemester.value = null; semesterServerErrors.value = {} }

const editSemester = (semester) => {
  semesterModalMode.value = 'edit'
  selectedSemester.value = semester
  semesterServerErrors.value = {}
  semesterModalVisible.value = true
}

const viewSemesterDetail = async (semester) => {
  try {
    if (typeof getSemester === 'function') {
      const sem = await getSemester(semester.id)
      selectedSemesterDetail.value = sem
    } else {
      selectedSemesterDetail.value = semester
    }
    semesterDetailModalVisible.value = true
  } catch (err) {
    selectedSemesterDetail.value = semester
    semesterDetailModalVisible.value = true
  }
}

const handleEditFromDetail = (semester) => {
  // Close detail modal and open the semester modal in edit mode
  semesterDetailModalVisible.value = false
  editSemester(semester)
}

const closeSemesterDetailModal = () => {
  semesterDetailModalVisible.value = false
  selectedSemesterDetail.value = null
}

const promptDeleteSemester = (semester) => {
  semesterToDelete.value = semester
  deleteSemesterModalVisible.value = true
}

const confirmDeleteSemester = async () => {
  if (!semesterToDelete.value) return closeDeleteSemesterModal()
  try {
    await deleteSemester(semesterToDelete.value.id)
    toast.success('Xóa Học kỳ thành công')
  } catch (err) {
    toast.error(err.message || 'Xóa Học kỳ thất bại')
  }
  closeDeleteSemesterModal()
}

const closeDeleteSemesterModal = () => { deleteSemesterModalVisible.value = false; semesterToDelete.value = null }

const getStatusLabel = (status) => {
  const labels = {
    'active': 'Đang diễn ra',
    'upcoming': 'Sắp tới',
    'completed': 'Đã kết thúc'
  }
  return labels[status] || status
}

onMounted(() => {
  fetchAcademicYears({ page: 1, limit: 100 })
  fetchSemesters({ page: 1, limit: 100 })
})
</script>

<style scoped>
/* Basic layout (copy of parts in FrameworkSubject) */
.academic-year-page { min-height: 100vh; padding: 20px; background: #f8fafc }
.page-header { margin-bottom: 14px }
.breadcrumb { display:flex; gap:8px; align-items:center; color:#6b7280 }
.breadcrumb .current { color:#3b82f6; font-weight:600 }
.header-main { display:flex; justify-content:space-between; align-items:flex-start; gap:16px }
.title-section h1 { margin:0; display:flex; gap:12px; align-items:center; font-size:24px }
.header-actions { display:flex; gap:12px }
.btn-export { background:white; border:2px solid #059669; color:#059669; padding:8px 12px; border-radius:12px }

/* Course management styles */
.course-management { background:white; border-radius:12px; padding:18px; margin-bottom:16px }
.course-header { display:flex; justify-content:space-between; align-items:center }
.course-table { width:100%; border-collapse:collapse }
.course-table th, .course-table td { padding:10px; border-bottom:1px solid #eef2f7 }
.course-table thead th { font-weight:700 }
.action-btn { width:36px; height:36px; }

/* Semester styles */
.semester-management { background:white; border-radius:12px; padding:18px; margin-top:12px }
.semester-card { background: #fff; border: 1px solid #eef2f7; padding: 16px; margin-bottom: 12px; border-radius: 12px; display:flex; gap:12px; align-items:center }
</style>

<style scoped>
/* Extended styles to match app theme - buttons, modals, card/spacing */
.btn-primary { background: #3b82f6; color: white; border: 2px solid #3b82f6; padding: 10px 14px; border-radius: 12px }
.btn-primary:hover { background: #2563eb }
.btn-import { background: white; color: #7c3aed; border: 2px solid #7c3aed; padding: 8px 12px; border-radius: 12px }

.main-section { margin-top: 16px }
.course-list { overflow-x:auto }
.course-table { width:100%; border-collapse:collapse; background:transparent }
.course-table th, .course-table td { padding:12px 10px; text-align:left; border-bottom:1px solid #eef2f7; color: #374151; font-size:14px }
.course-table thead th { font-weight:700; color: #1f2937 }
.course-table .empty { text-align:center; padding: 24px 0; color:#6b7280 }
.course-table .action-btn { width: 36px; height: 36px; margin-right: 6px; padding: 6px }

.semester-management { background:white; border-radius:12px; padding:18px; margin-top:12px; box-shadow: 0 2px 12px rgba(0,0,0,0.06); border: 1px solid rgba(0,0,0,0.03) }
.semester-card { background: #fff; border: 1px solid #eef2f7; padding: 16px; margin-bottom: 12px; border-radius: 12px; display:flex; gap:12px; align-items:center }
.semester-header { display:flex; justify-content:space-between; align-items:center }

.btn-add-semester { display:flex; align-items:center; gap:8px; padding:10px 16px; background:#3b82f6; color:white; border:none; border-radius:8px; font-size:14px; font-weight:500; cursor:pointer; transition: all 0.3s ease }
.btn-add-semester:hover{ background:#2563eb; transform:translateY(-1px) }
.btn-add-course{ display:flex; align-items:center; gap:8px; padding:8px 12px; background:#fff; color:#3b82f6; border:2px solid #3b82f6; border-radius:10px }
.btn-create-first{ background:white; border:2px solid #3b82f6; color:#3b82f6; padding:8px 12px; border-radius:10px }

.semester-list{ display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:16px }
.semester-card{ background:#f8fafc; border:2px solid #e2e8f0; border-radius:12px; padding:20px; transition: all 0.3s ease; position:relative }
.semester-card:hover{ border-color:#3b82f6; transform:translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.15) }

/* Modal + delete styles */
 .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display:flex; align-items:center; justify-content:center; z-index:100001 }
.semester-modal { width: 680px; max-width: 98%; background: white; border-radius:18px; padding: 20px; box-shadow: 0 25px 50px rgba(0,0,0,0.12); position:relative }
.modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px }
.modal-body { padding: 8px 0 }
.modal-footer { display:flex; gap:12px; justify-content:flex-end; margin-top:12px }
.close-btn { background: rgba(107,114,128,0.1); border-radius: 8px; padding: 6px 8px; border:none; cursor:pointer }
 .modal-overlay-delete { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 100001; padding: 20px; }
.delete-modal-popup { background: white; border-radius: 24px; max-width: 500px; width: 100%; padding: 40px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); position: relative; }
.btn-cancel-delete, .btn-confirm-delete { flex: 1; padding: 12px 16px; border-radius: 12px; font-weight:600; border:none; cursor:pointer }
.btn-cancel-delete { background: white; color: #6b7280; border: 2px solid #d1d5db }
.btn-confirm-delete { background: linear-gradient(135deg, #dc2626, #b91c1c); color: white; border: 2px solid #dc2626 }

.empty-semesters { padding: 18px; border-radius: 12px; background: #fff; border: 1px dashed #e5e7eb; text-align:left }

/* Improve modal form layout */
.form-group { display: block; margin-bottom: 12px }
.form-group label { display:block; font-size:14px; color:#374151; font-weight:600; margin-bottom:8px }
.form-group input[type="text"], .form-group input[type="number"], .form-group input[type="date"], .form-group select, .form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  font-size: 14px;
  color: #111827;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.form-group input:focus, .form-group select:focus, .form-group textarea:focus {
  border-color: #3b82f6;
  box-shadow: 0 6px 18px rgba(59,130,246,0.08);
}

.form-row { display:flex; gap:12px }
.form-row .form-group { flex:1 }

/* Modal header and close button */
.semester-modal .modal-header h3 { margin:0; font-size:18px; font-weight:700; color:#111827 }
.semester-modal .close-btn { position:absolute; top:12px; right:12px; width:38px; height:38px; display:flex; align-items:center; justify-content:center; border-radius:50%; background:#f3f4f6 }

/* Fancy Save/Cancel buttons */
.btn-cancel { background: white; border: 2px solid #e5e7eb; color: #374151; padding: 10px 18px; border-radius: 12px }
.btn-primary { background: linear-gradient(90deg,#3b82f6,#60a5fa); color: white; padding: 10px 18px; border-radius: 12px; border: none; box-shadow: 0 8px 20px rgba(59,130,246,0.12) }
.btn-primary:hover { transform: translateY(-2px) }

/* Table improvements */
.course-table thead th { text-align:left; padding: 16px 12px; border-bottom: 1px solid #eef2f7; font-size:15px }
.course-table tbody td { padding: 14px 12px; vertical-align: middle }
.course-table tbody tr:hover { background: #fafafa }

.action-btn { display:inline-flex; align-items:center; justify-content:center; border-radius:8px; border:none; width:36px; height:36px; cursor:pointer }
.action-btn:hover { transform: scale(1.05) }
.action-btn.edit { background: rgba(16,185,129,0.1); color: #059669 }
.action-btn.delete { background: rgba(239,68,68,0.08); color: #dc2626 }
.action-btn.view { background: rgba(99,102,241,0.08); color: #4f46e5 }
.course-table thead { background: #fff }
.course-table tbody tr:not(:last-child) td { border-bottom: 1px solid #f3f4f6 }
.course-table tbody tr:hover td { background: #fbfdff }
.course-table thead th:first-child,
.course-table tbody td:first-child { width: 60px; text-align: center }
.course-table thead th:last-child,
.course-table tbody td:last-child { width: 140px; text-align: right }

/* Semester card details */
.semester-info { flex: 1 }
.semester-name { font-size:16px; font-weight:700; color:#111827 }
.semester-meta { color:#6b7280; font-size:13px; margin-top:6px }
.semester-status { padding: 6px 10px; border-radius: 12px; font-size:12px; margin-left:8px; display:inline-block }
.semester-status.active { background: rgba(16,185,129,0.12); color: #059669 }
.semester-status.upcoming { background: rgba(59,130,246,0.08); color: #2563eb }
.semester-status.completed { background: rgba(247, 15, 42, 0.12); color: #4b5563 }
.semester-stats { display:flex; gap:16px; align-items:center }
.stat-item { display:flex; flex-direction:column; align-items:center }
.stat-value { font-weight:700; color:#1f2937 }
.stat-label { color:#6b7280; font-size:12px }

.semester-actions { display:flex; gap:8px; align-items:center }
.semester-actions .action-btn { margin-left:6px }

.course-header h3 i, .semester-header h3 i { color: #3b82f6; margin-right:8px }

.course-management, .semester-management { transition: all 0.2s ease }
.course-management:hover, .semester-management:hover { transform: translateY(-2px) }

/* Responsive */
@media (max-width: 720px) {
  .semester-modal { width: 100%; padding: 18px; border-radius: 12px }
  .form-row { flex-direction: column }
}

/* Small helpers */
.input-with-action .btn-suggest { background: #fff; border: 1px solid #e5e7eb; padding: 8px 12px; border-radius: 10px; cursor: pointer }
.text-muted { color: #6b7280; font-size: 12px; margin-top: 6px }
.text-help { color: #6b7280; font-size: 12px; margin-top: 6px }
.text-error { color: #dc2626; font-size: 12px; margin-top: 6px }
</style>
