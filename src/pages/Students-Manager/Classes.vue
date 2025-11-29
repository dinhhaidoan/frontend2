<template>
  <div class="official-class-page">
    <div class="page-header">
      <div class="header-content">
        <h1><i class="fas fa-users"></i> Quản lý lớp hành chính</h1>
        <p>Quản lý danh sách lớp, cố vấn học tập và sinh viên</p>
      </div>
      <button @click="openAddModal" class="btn-add">
        <i class="fas fa-plus"></i> Tạo lớp mới
      </button>
    </div>

    <div class="page-content">
      <div class="stats-grid">
        <div class="stat-card">
          <i class="fas fa-users"></i>
          <div>
            <h3>{{ statistics.totalClasses }}</h3>
            <p>Tổng số lớp</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-user-check"></i>
          <div>
            <h3>{{ statistics.activeClasses }}</h3>
            <p>Đang hoạt động</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-user-graduate"></i>
          <div>
            <h3>{{ statistics.totalStudents }}</h3>
            <p>Tổng sinh viên</p>
          </div>
        </div>
        <div class="stat-card">
          <i class="fas fa-user-tie"></i>
          <div>
            <h3>{{ statistics.totalAdvisors }}</h3>
            <p>Cố vấn</p>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <div class="filters-container">
          <div class="filter-group">
            <label><i class="fas fa-search"></i></label>
            <input
              v-model="filters.search"
              type="text"
              placeholder="Tìm theo mã lớp, tên lớp..."
            />
          </div>

          <div class="filter-group">
            <label><i class="fas fa-book"></i> Ngành</label>
            <select v-model="filters.major">
              <option value="">Tất cả ngành</option>
              <option 
                v-for="m in majors" 
                :key="m.id || m.major_id" 
                :value="m.id || m.major_id"
              >
                {{ m.name || m.major_name }}
              </option>
            </select>
          </div>

          <div class="filter-group">
            <label><i class="fas fa-calendar"></i> Khóa</label>
            <select v-model="filters.course">
              <option value="">Tất cả khóa</option>
              <option 
                v-for="y in academicYears" 
                :key="y.id || y.academic_year_id" 
                :value="y.id || y.academic_year_id"
              >
                {{ y.name || y.academic_year_name || y.code }}
              </option>
            </select>
          </div>
          <button @click="resetFilters" class="btn-reset">
            <i class="fas fa-redo"></i> Đặt lại
          </button>
        </div>
      </div>

      <div v-if="classesLoading" class="loading-state">
        <p>Đang tải danh sách lớp...</p>
      </div>
      <div v-else-if="classesError" class="error-banner">
        <p>Có lỗi khi tải danh sách lớp: {{ (classesError.message || classesError).toString() }}</p>
        <button @click="retryClasses" class="btn-retry">Thử lại</button>
      </div>
      <div class="classes-grid">
        <div
          v-for="officialClass in filteredClasses"
          :key="officialClass.id"
          class="class-card"
          :class="officialClass.status"
        >
          <div class="class-header">
            <div class="class-title">
              <h3>{{ officialClass.code }}</h3>
              <span class="class-status" :class="officialClass.status">
                {{ getStatusLabel(officialClass.status) }}
              </span>
            </div>
            <div class="class-actions">
              <button @click="viewClass(officialClass)" class="btn-icon" title="Xem chi tiết">
                <i class="fas fa-eye"></i>
              </button>
              <button @click="editClass(officialClass)" class="btn-icon" title="Chỉnh sửa">
                <i class="fas fa-edit"></i>
              </button>
              <button
                @click="deleteClass(officialClass)"
                class="btn-icon delete"
                title="Xóa"
              >
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <div class="class-body">
            <p class="class-name">{{ officialClass.name }}</p>

            <div class="class-info">
              <div class="info-item">
                <i class="fas fa-book"></i>
                <span>{{ officialClass.majorName || getMajorLabel(officialClass.major) }}</span>
              </div>
              <div class="info-item">
                <i class="fas fa-calendar"></i>
                <span>Khóa {{ officialClass.academicYearName || getAcademicYearLabel(officialClass.course) || officialClass.course || 'Chưa có Khóa' }}</span>
              </div>
            </div>

            <div class="class-advisor">
              <i class="fas fa-user-tie"></i>
              <span>{{ officialClass.advisorName || getAdvisorName(officialClass.advisorId) || 'Chưa có cố vấn' }}</span>
            </div>

            <div class="class-stats">
              <div class="stat-item">
                <i class="fas fa-users"></i>
                <span>
                  {{ officialClass.studentCount || 0 }}
                </span>
              </div>
              <div class="progress-bar">
                <div
                  class="progress-fill"
                  :style="{
                    width: getProgressWidth(officialClass)
                  }"
                ></div>
              </div>
            </div>
          </div>

          <div class="class-footer">
            <button @click="manageStudents(officialClass)" class="btn-manage">
              <i class="fas fa-user-cog"></i> Quản lý sinh viên
            </button>
          </div>
        </div>

        <div v-if="filteredClasses.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>Không tìm thấy lớp học nào</p>
          <button @click="openAddModal" class="btn-add-empty">
            <i class="fas fa-plus"></i> Tạo lớp mới
          </button>
        </div>
      </div>
    </div>

    <OfficialClassModal
      :isOpen="showClassModal"
      :officialClass="selectedClass"
      :advisors="teachers"
      :majors="majors"
      :academicYears="academicYears"
      :serverErrors="serverErrors"
      :saving="saving"
      :isView="isViewMode"
      @close="closeClassModal"
      @submit="handleSubmitClass"
    />
    <ConfirmDialog
      :show="confirmDialog.show"
      :type="confirmDialog.type"
      :title="confirmDialog.title"
      :message="confirmDialog.message"
      :loading="confirmLoading"
      confirmText="Xác nhận"
      @confirm="onConfirm"
      @cancel="() => { confirmDialog.show = false; confirmDialog.payload = null; confirmDialog.action = null }"
      @update:show="val => confirmDialog.show = val"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import OfficialClassModal from '@/components/Students-Manager/OfficialClassModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { useToast } from '@/composables/useToast'
import { useOfficeClasses } from '@/hooks/useOfficeClasses'
import { useTeachers } from '@/hooks/useTeachers'
import { useAcademicYears } from '@/hooks/useAcademicYears'
import { useMajors } from '@/hooks/useMajors'

// State
const { officeClasses, fetchOfficeClasses, getOfficeClass, createOfficeClass, updateOfficeClass, deleteOfficeClass, loading: classesLoading, error: classesError } = useOfficeClasses()
const { teachers, fetchTeachers } = useTeachers()
const { academicYears, fetchAcademicYears } = useAcademicYears()
const { majors, fetchMajors } = useMajors()
const filters = ref({
  search: '',
  major: '',
  course: '',
  status: ''
})

const showClassModal = ref(false)
const selectedClass = ref(null)
const isViewMode = ref(false)

// Server state
const serverErrors = ref({})
const saving = ref(false)
const toast = useToast()
const confirmDialog = ref({ show: false, type: 'warning', title: '', message: '', payload: null })
const confirmLoading = ref(false)

// Initialize data from server
onMounted(async () => {
  try {
    const [ayRes] = await Promise.allSettled([fetchAcademicYears()])
    if (ayRes && ayRes.status === 'rejected') console.warn('Failed to fetch academic years', ayRes)
    const results = await Promise.allSettled([
      fetchOfficeClasses(),
      fetchTeachers(),
      fetchMajors()
    ])
    const rejected = results.filter(r => r.status === 'rejected')
    if (rejected.length) {
      console.warn('Some lookups failed during Classes initialization.' , rejected)
    }
  } catch (err) {
    console.error('Initialization error (unexpected):', err)
  }
})

const retryClasses = async () => {
  try {
    await fetchOfficeClasses()
  } catch (err) {
    console.error('Retry fetch classes error:', err)
  }
}

// FIX: Computed property to handle data merging safely (avoids infinite watch loop)
const processedClasses = computed(() => {
  if (!officeClasses.value) return []
  return officeClasses.value.map(c => {
    const out = { ...c }
    const id = c.academic_year_id || c.academicYearId || c.course
    
    // Attach Academic Year Logic here inside computed
    if (id && academicYears.value?.length) {
      const ay = academicYears.value.find(a => Number(a.id) === Number(id))
      if (ay) {
        out.AcademicYear = ay
        out.academicYearName = ay.name || ay.academic_year_name || ''
      } else {
        const s = String(id)
        const ay2 = academicYears.value.find(a => (a.name || a.academic_year_name || '').includes(s))
        if (ay2) {
          out.AcademicYear = ay2
          out.academicYearName = ay2.name || ay2.academic_year_name || ''
        }
      }
    }
    return out
  })
})

// Computed
const statistics = computed(() => ({
  totalClasses: processedClasses.value.length,
  activeClasses: processedClasses.value.filter((c) => c.status === 'active').length,
  totalStudents: processedClasses.value.reduce((sum, c) => sum + (c.studentCount || 0), 0),
  totalAdvisors: new Set(processedClasses.value.map((c) => c.advisorId).filter(Boolean)).size
}))

const filteredClasses = computed(() => {
  let result = processedClasses.value

  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    result = result.filter(
      (c) =>
        c.code.toLowerCase().includes(search) ||
        c.name.toLowerCase().includes(search)
    )
  }

  if (filters.value.major) {
    result = result.filter((c) => c.major === filters.value.major)
  }

  if (filters.value.course) {
    result = result.filter((c) => c.course === filters.value.course)
  }

  if (filters.value.status) {
    result = result.filter((c) => c.status === filters.value.status)
  }

  return result
})

// Methods
const getMajorLabel = (major) => {
  const labels = {
    IT: 'Công nghệ thông tin',
    CS: 'Khoa học máy tính',
    IS: 'Hệ thống thông tin',
    SE: 'Kỹ thuật phần mềm',
    DS: 'Khoa học dữ liệu',
    AI: 'Trí tuệ nhân tạo'
  }
  return labels[major] || major
}

const getAcademicYearLabel = (courseOrId) => {
  if (courseOrId === undefined || courseOrId === null || courseOrId === '') return ''
  const asNumber = Number(courseOrId)
  if (!isNaN(asNumber) && academicYears?.value && academicYears.value.length) {
    const ay = academicYears.value.find(a => Number(a.id) === asNumber)
    if (ay) return ay.name || ay.academic_year_name || String(courseOrId)
  }
  const s = String(courseOrId).trim()
  if (academicYears?.value && academicYears.value.length) {
    const ay = academicYears.value.find(a => (a.name || a.academic_year_name || '').toLowerCase() === s.toLowerCase() || (a.name || a.academic_year_name || '').toLowerCase().includes(s.toLowerCase()))
    if (ay) return ay.name || ay.academic_year_name
  }
  return String(courseOrId)
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Đang hoạt động',
    inactive: 'Ngừng hoạt động',
    completed: 'Đã tốt nghiệp'
  }
  return labels[status] || status
}

const openAddModal = () => {
  selectedClass.value = null
  serverErrors.value = {}
  isViewMode.value = false
  Promise.allSettled([fetchTeachers(), fetchMajors(), fetchAcademicYears()]).then(() => {
    showClassModal.value = true
  })
}

// Fetch full details (including students) before opening modal
const editClass = async (officialClass) => {
  try {
    const detailedClass = await getOfficeClass(officialClass.id)
    selectedClass.value = detailedClass
  } catch (err) {
    console.error('Failed to fetch class details:', err)
    selectedClass.value = { ...officialClass }
  }
  
  serverErrors.value = {}
  isViewMode.value = false
  Promise.allSettled([fetchTeachers(), fetchMajors(), fetchAcademicYears()]).then(() => {
    showClassModal.value = true
  })
}

const viewClass = async (officialClass) => {
  try {
    const detailedClass = await getOfficeClass(officialClass.id)
    selectedClass.value = detailedClass
  } catch (err) {
    console.error('Failed to fetch class details:', err)
    selectedClass.value = { ...officialClass }
  }

  serverErrors.value = {}
  isViewMode.value = true
  Promise.allSettled([fetchTeachers(), fetchMajors(), fetchAcademicYears()]).then(() => {
    showClassModal.value = true
  })
}

const manageStudents = (officialClass) => {
  editClass(officialClass)
}

const deleteClass = (officialClass) => {
  confirmDialog.value = {
    show: true,
    type: 'warning',
    title: 'Xóa lớp',
    message: `Bạn có chắc chắn muốn xóa lớp "${officialClass.name}" (${officialClass.code})?`,
    payload: officialClass,
    action: 'delete'
  }
}

const performDelete = async () => {
  const cls = confirmDialog.value.payload
  if (!cls) return
  confirmDialog.value.show = false
  confirmDialog.value.payload = null
  confirmDialog.value.action = null
  try {
    confirmLoading.value = true
    await deleteOfficeClass(cls.id)
    toast.success('Xóa lớp thành công', 'Thành công')
    if (selectedClass.value && selectedClass.value.id === cls.id) closeClassModal()
  } catch (err) {
    serverErrors.value = err?.details || {}
    toast.error('Có lỗi khi xóa lớp', 'Lỗi')
    console.error('deleteClass error', err)
  }
}

const handleSubmitClass = async (classData) => {
  serverErrors.value = {}
  saving.value = true
  try {
    if (!classData.advisorId) {
      serverErrors.value = { teacher_id: 'Cố vấn học tập bắt buộc' }
      return
    }
    if (!classData.course) {
      serverErrors.value = { academic_year_id: 'Khóa học bắt buộc' }
      return
    }
    if (classData.major_id === undefined || classData.major_id === null || classData.major_id === '') {
      serverErrors.value = { major_id: 'Ngành học bắt buộc' }
      return
    }

    if (selectedClass.value && selectedClass.value.id) {
      confirmDialog.value = {
        show: true,
        type: 'warning',
        title: 'Cập nhật lớp',
        message: `Bạn có chắc chắn muốn cập nhật lớp "${selectedClass.value.name}" (${selectedClass.value.code})?`,
        payload: { id: selectedClass.value.id, data: classData },
        action: 'update'
      }
    } else {
      await createOfficeClass(classData)
      toast.success('Tạo lớp thành công', 'Thành công')
      closeClassModal()
    }
  } catch (err) {
    let mapped = {}
    if (Array.isArray(err?.details)) {
      err.details.forEach(d => {
        if (d && d.field) mapped[d.field] = d.message || d
      })
    } else if (err?.details && typeof err.details === 'object') {
      mapped = err.details
    } else if (err && typeof err === 'object') {
      try {
        const parsed = JSON.parse(err.message)
        if (parsed?.details && Array.isArray(parsed.details)) parsed.details.forEach(d => mapped[d.field] = d.message)
      } catch (e) {
        // ignored
      }
    }
    serverErrors.value = mapped
    console.error('handleSubmitClass error', err)
  } finally {
    saving.value = false
  }
}

const performUpdate = async () => {
  const payload = confirmDialog.value.payload
  if (!payload) return
  confirmDialog.value.show = false
  confirmDialog.value.payload = null
  confirmDialog.value.action = null
  saving.value = true
  try {
    confirmLoading.value = true
    await updateOfficeClass(payload.id, payload.data)
    toast.success('Cập nhật lớp thành công', 'Thành công')
    closeClassModal()
  } catch (err) {
    serverErrors.value = err?.details || {}
    toast.error('Có lỗi khi cập nhật lớp', 'Lỗi')
    console.error('updateOfficeClass error', err)
  } finally {
    saving.value = false
    confirmLoading.value = false
  }
}

const onConfirm = () => {
  if (!confirmDialog.value || !confirmDialog.value.payload) return
  if (confirmDialog.value.action === 'update') performUpdate()
  else performDelete()
}

const getAdvisorName = (advisorId) => {
  const adv = teachers.value.find(t => (t.teacher_id || t.id) === advisorId)
  return adv ? (adv.display || adv.name || adv.user_name || '') : ''
}

const closeClassModal = () => {
  showClassModal.value = false
  selectedClass.value = null
  serverErrors.value = {}
  isViewMode.value = false
}

const resetFilters = () => {
  filters.value = {
    search: '',
    major: '',
    course: '',
    status: ''
  }
}

const getProgressWidth = (officialClass) => {
  const studentCount = officialClass?.studentCount || 0
  const max = officialClass?.maxStudents || Math.max(studentCount, 1)
  const pct = Math.min(100, Math.round((studentCount / max) * 100))
  return pct + '%'
}
</script>

<style scoped>
.official-class-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.header-content h1 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

.btn-add {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.page-content {
  max-width: 1400px;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.stat-card i {
  font-size: 40px;
  color: #667eea;
}

.stat-card h3 {
  margin: 0 0 4px;
  font-size: 32px;
  color: #2c3e50;
}

.stat-card p {
  margin: 0;
  color: #7f8c8d;
  font-size: 14px;
}

/* Filters */
.filters-section {
  background: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.filters-container {
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr) auto;
  gap: 16px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-group input,
.filter-group select {
  padding: 10px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-reset {
  padding: 10px 20px;
  background: #f8f9fa;
  color: #7f8c8d;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-reset:hover {
  background: #e9ecef;
  border-color: #cbd5e0;
}

/* Classes Grid */
.classes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
}

.class-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  border-top: 4px solid #667eea;
}

.class-card.completed {
  border-top-color: #95a5a6;
  opacity: 0.85;
}

.class-card.inactive {
  border-top-color: #e74c3c;
}

.class-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.class-header {
  padding: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.class-title h3 {
  margin: 0 0 8px;
  color: #2c3e50;
  font-size: 22px;
  font-weight: 700;
}

.class-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.class-status.active {
  background: #d4edda;
  color: #155724;
}

.class-status.inactive {
  background: #f8d7da;
  color: #721c24;
}

.class-status.completed {
  background: #d1ecf1;
  color: #0c5460;
}

.class-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  color: #667eea;
}

.btn-icon:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}

.btn-icon.delete {
  color: #e74c3c;
}

.btn-icon.delete:hover {
  background: #e74c3c;
  color: white;
}

.class-body {
  padding: 20px;
}

.class-name {
  margin: 0 0 16px;
  color: #2c3e50;
  font-size: 15px;
  font-weight: 600;
}

.class-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7f8c8d;
  font-size: 14px;
}

.info-item i {
  width: 20px;
  color: #667eea;
}

.class-advisor {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f8f9ff;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #2c3e50;
  font-size: 14px;
}

.class-advisor i {
  color: #667eea;
  font-size: 16px;
}

.class-stats {
  margin-bottom: 0;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 600;
  font-size: 14px;
}

.stat-item i {
  color: #667eea;
  margin-right: 8px;
}

.progress-bar {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s;
}

.class-footer {
  padding: 16px 20px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

.btn-manage {
  width: 100%;
  padding: 10px;
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-manage:hover {
  background: #667eea;
  color: white;
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  color: #95a5a6;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0 0 24px;
  font-size: 18px;
}

.btn-add-empty {
  padding: 12px 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-add-empty:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

@media (max-width: 1024px) {
  .filters-container {
    grid-template-columns: 1fr 1fr;
  }
  
  .classes-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .btn-add {
    width: 100%;
    justify-content: center;
  }

  .filters-container {
    grid-template-columns: 1fr;
  }

  .classes-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>