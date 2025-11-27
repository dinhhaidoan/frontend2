<template>
  <div v-if="isOpen" class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
          <h2>
          <i class="fas fa-users"></i>
          {{ isView ? 'Xem chi tiết lớp' : (isEdit ? 'Chỉnh sửa lớp hành chính' : 'Tạo lớp hành chính mới') }}
        </h2>
        <button @click="close" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <!-- Thông tin cơ bản -->
          <div class="form-section">
            <h3><i class="fas fa-info-circle"></i> Thông tin cơ bản</h3>
            
            <div class="form-row">
              <div class="form-group">
                <label>Mã lớp <span class="required">*</span></label>
                <input
                  v-model="formData.code"
                  type="text"
                  placeholder="VD: 22IT1"
                  required
                  :disabled="isEdit || isView"
                />
                <p v-if="serverErrors.office_class_SKU || serverErrors.code" class="text-error">{{ serverErrors.office_class_SKU || serverErrors.code }}</p>
                <p v-else-if="clientErrors.value?.code" class="text-error">{{ clientErrors.value.code }}</p>
              </div>

              <div class="form-group">
                <label>Tên lớp <span class="required">*</span></label>
                <input
                  v-model="formData.name"
                  type="text"
                  placeholder="VD: Lớp Công nghệ thông tin 1"
                  required
                />
                  <p v-if="serverErrors.office_class_name || serverErrors.name" class="text-error">{{ serverErrors.office_class_name || serverErrors.name }}</p>
                  <p v-else-if="clientErrors.value?.name" class="text-error">{{ clientErrors.value.name }}</p>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Ngành học <span class="required">*</span></label>
                <select v-model.number="formData.major_id" required :disabled="isView || majors.length === 0">
                  <option value="">-- Chọn ngành --</option>
                  <option v-if="majors.length === 0" disabled>Đang tải danh sách ngành...</option>
                  <option v-for="m in majors" :key="m.major_id || m.id || m.code" :value="m.major_id || m.id || m.code">{{ m.major_name || m.name }}</option>
                </select>
                <p v-if="serverErrors.major_id || serverErrors.major" class="text-error">{{ serverErrors.major_id || serverErrors.major }}</p>
                <p v-else-if="clientErrors.value?.major" class="text-error">{{ clientErrors.value.major }}</p>
              </div>

              <div class="form-group">
                <label>Khóa học <span class="required">*</span></label>
                <select v-model.number="formData.course" required :disabled="isView || academicYears.length === 0">
                  <option value="">-- Chọn Khóa / Khóa học --</option>
                  <option v-if="academicYears.length === 0" disabled>Đang tải danh sách Khóa...</option>
                  <option v-for="ay in academicYears" :key="ay.id || ay.academic_year_id" :value="Number(ay.id || ay.academic_year_id)">{{ ay.name || ay.academic_year_name }}</option>
                </select>
                <div v-if="!isView && (!formData.course || formData.course === '') && getCurrentCourseLabel()" class="read-only-note" style="margin-top:8px;color:#6b7280;font-size:13px;">
                  <i class="fas fa-info-circle"></i>
                  &nbsp;Khóa hiện tại: <strong>{{ getCurrentCourseLabel() }}</strong> (lookup chưa khớp)
                </div>
                <p v-if="serverErrors.academic_year_id || serverErrors.course" class="text-error">{{ serverErrors.academic_year_id || serverErrors.course }}</p>
                <p v-else-if="clientErrors.value?.course" class="text-error">{{ clientErrors.value.course }}</p>
              </div>
            </div>
          </div>

          <!-- Cố vấn học tập -->
          <div class="form-section">
            <h3><i class="fas fa-user-tie"></i> Cố vấn học tập</h3>
            
            <div class="form-group">
              <label>Chọn cố vấn</label>
              <select v-model.number="formData.advisorId" :disabled="isView || advisors.length === 0">
                <option value="">-- Chưa chọn cố vấn --</option>
                <option v-if="advisors.length === 0" disabled>Đang tải danh sách cố vấn...</option>
                <option v-for="advisor in validAdvisors" :key="advisor.teacher_id || advisor.id" :value="advisor.teacher_id || advisor.id">{{ advisor.display || advisor.name || advisor.user_name }}</option>
              </select>
              <p v-if="serverErrors.teacher_id || serverErrors.advisorId" class="text-error">{{ serverErrors.teacher_id || serverErrors.advisorId }}</p>
            </div>

            <div v-if="formData.advisorId" class="advisor-info">
              <i class="fas fa-info-circle"></i>
              <span>
                Cố vấn: <strong>{{ getAdvisorName(formData.advisorId) }}</strong>
              </span>
            </div>
          </div>

          <!-- Sinh viên trong lớp -->
          <div class="form-section">
            <h3>
              <i class="fas fa-user-graduate"></i> Sinh viên trong lớp
              <span class="student-count">({{ selectedStudents.length }})</span>
            </h3>

            <!-- Search và Add Student -->
            <div class="student-search">
              <input
                v-model="searchStudent"
                type="text"
                placeholder="Tìm sinh viên theo mã hoặc tên..."
                @input="filterStudents"
              />
              <div class="student-actions">
                <button v-if="!isView" type="button" @click="showImportModal = true" class="btn-import-student">
                  <i class="fas fa-file-import"></i> Import danh sách
                </button>
                <button v-if="!isView" type="button" @click="showAddStudentModal = true" class="btn-add-student">
                  <i class="fas fa-user-plus"></i> Thêm từng sinh viên
                </button>
              </div>
            </div>

            <!-- Selected Students List -->
            <div v-if="selectedStudents.length > 0" class="selected-students">
              <div
                v-for="student in selectedStudents"
                :key="student.id"
                class="student-item"
              >
                <div class="student-info">
                  <span class="student-code">{{ student.studentCode }}</span>
                  <span class="student-name">{{ student.fullName }}</span>
                  <span v-if="student.email" class="student-email">{{ student.email }}</span>
                </div>
                <button v-if="!isView"
                  type="button"
                  @click="confirmRemoveStudent(student)"
                  class="btn-remove-student"
                  title="Xóa sinh viên khỏi lớp"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <div v-else class="empty-students">
              <i class="fas fa-users-slash"></i>
              <p>Chưa có sinh viên nào trong lớp</p>
            </div>
          </div>

          <!-- Ghi chú -->
          <div class="form-section">
            <h3><i class="fas fa-sticky-note"></i> Ghi chú</h3>
            <div class="form-group">
              <textarea
                v-model="formData.notes"
                rows="3"
                placeholder="Ghi chú về lớp học..."
              ></textarea>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="form-actions">
            <button type="button" @click="close" class="btn-cancel">
              <i class="fas fa-times"></i> Hủy
            </button>
            <button type="submit" class="btn-submit" :disabled="!canSubmit || saving">
              <i class="fas fa-save"></i>
              {{ isEdit ? 'Cập nhật' : 'Tạo lớp' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Student Modal -->
    <div v-if="showAddStudentModal" class="modal-overlay" @click.self="showAddStudentModal = false">
      <div class="modal-container small">
        <div class="modal-header">
          <h3><i class="fas fa-user-plus"></i> Thêm sinh viên vào lớp</h3>
          <button @click="showAddStudentModal = false" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="search-box">
            <input
              v-model="studentSearchTerm"
              type="text"
              placeholder="Tìm kiếm theo mã SV hoặc tên..."
            />
            <div class="selection-actions">
              <button @click="toggleSelectAllVisible" class="btn-select-all">
                <i class="fas fa-check-double"></i>
                {{ isAllVisibleSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả' }}
              </button>
              <button 
                @click="addSelectedStudents" 
                :disabled="tempSelectedStudents.length === 0"
                class="btn-add-selected"
              >
                <i class="fas fa-plus-circle"></i>
                Thêm {{ tempSelectedStudents.length > 0 ? `(${tempSelectedStudents.length})` : '' }}
              </button>
            </div>
          </div>
          <div class="available-students-list">
            <div
              v-for="student in filteredAvailableStudents"
              :key="student.id"
              :class="['available-student-item', { selected: isTempSelected(student.id) }]"
              @click="toggleTempSelect(student.id)"
            >
              <input 
                type="checkbox" 
                :checked="isTempSelected(student.id)"
                @click.stop="toggleTempSelect(student.id)"
              />
              <div class="student-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="student-details">
                <strong>{{ student.studentCode }}</strong>
                <span>{{ student.fullName }}</span>
                <small v-if="student.currentClass">Lớp hiện tại: {{ student.currentClass }}</small>
              </div>
              <button @click.stop="addStudent(student)" class="btn-add-icon">
                <i class="fas fa-plus-circle"></i>
              </button>
            </div>
            <div v-if="filteredAvailableStudents.length === 0" class="empty-state">
              <i class="fas fa-search"></i>
              <p>Không tìm thấy sinh viên</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Import Modal -->
    <ImportModal
      :isOpen="showImportModal"
      @close="showImportModal = false"
      @import="handleImportStudents"
    />

    <!-- Confirm Remove Student Dialog -->
    <div v-if="showRemoveConfirm" class="modal-overlay" @click.self="cancelRemove">
      <div class="confirm-dialog">
        <div class="confirm-header">
          <div class="confirm-icon warning">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Xác nhận xóa sinh viên</h3>
        </div>
        
        <div class="confirm-body">
          <p>Bạn có chắc chắn muốn xóa sinh viên này khỏi lớp?</p>
          <div v-if="studentToRemove" class="student-preview">
            <div class="student-avatar-small">
              <i class="fas fa-user"></i>
            </div>
            <div class="student-info-small">
              <strong>{{ studentToRemove.studentCode }}</strong>
              <span>{{ studentToRemove.fullName }}</span>
            </div>
          </div>
          <p class="warning-text">
            <i class="fas fa-info-circle"></i>
            Hành động này không thể hoàn tác. Sinh viên sẽ bị xóa khỏi danh sách lớp.
          </p>
        </div>
        
        <div class="confirm-actions">
          <button @click="cancelRemove" class="btn-confirm-cancel">
            <i class="fas fa-times"></i>
            Hủy
          </button>
          <button @click="executeRemove" class="btn-confirm-remove">
            <i class="fas fa-trash-alt"></i>
            Xóa sinh viên
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, toRefs } from 'vue'
import ImportModal from './ImportModal.vue'

const props = defineProps({
  isOpen: Boolean,
  officialClass: {
    type: Object,
    default: null
  },
  serverErrors: {
    type: Object,
    default: () => ({})
  },
  saving: {
    type: Boolean,
    default: false
  },
  advisors: {
    type: Array,
    default: () => []
  },
  majors: {
    type: Array,
    default: () => []
  },
  academicYears: {
    type: Array,
    default: () => []
  }
  ,
  isView: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'submit'])

// Use reactive references to props so updates from parent are reflected
const { advisors, majors, academicYears, isView } = toRefs(props)
const validAdvisors = computed(() => (advisors?.value || []).filter(a => (a.teacher_id || a.id)))

const formData = ref({
  code: '',
  name: '',
  major: '',
  major_id: null,
  course: '',
  maxStudents: 50,
  status: 'active',
  advisorId: '',
  notes: ''
})

const selectedStudents = ref([])
const searchStudent = ref('')
const showAddStudentModal = ref(false)
const showImportModal = ref(false)
const studentSearchTerm = ref('')
const tempSelectedStudents = ref([])
const showRemoveConfirm = ref(false)
const studentToRemove = ref(null)

const isEdit = computed(() => !!props.officialClass)

// Mock advisor list
const advisorList = ref([
  { id: 1, name: 'TS. Nguyễn Văn A', department: 'Khoa CNTT' },
  { id: 2, name: 'ThS. Trần Thị B', department: 'Khoa CNTT' },
  { id: 3, name: 'TS. Lê Văn C', department: 'Khoa CNTT' },
  { id: 4, name: 'PGS.TS. Phạm Thị D', department: 'Khoa CNTT' },
  { id: 5, name: 'TS. Hoàng Văn E', department: 'Khoa CNTT' }
])

// Mock available students (students not in this class)
const availableStudents = ref([
  {
    id: 1,
    studentCode: '2251052001',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@student.edu.vn',
    currentClass: null
  },
  {
    id: 2,
    studentCode: '2251052002',
    fullName: 'Trần Thị B',
    email: 'tranthib@student.edu.vn',
    currentClass: '22IT2'
  },
  {
    id: 3,
    studentCode: '2251052003',
    fullName: 'Lê Văn C',
    email: 'levanc@student.edu.vn',
    currentClass: null
  },
  {
    id: 4,
    studentCode: '2251052004',
    fullName: 'Phạm Thị D',
    email: 'phamthid@student.edu.vn',
    currentClass: null
  },
  {
    id: 5,
    studentCode: '2251052005',
    fullName: 'Hoàng Văn E',
    email: 'hoangvane@student.edu.vn',
    currentClass: '22IT3'
  }
])

const filteredAvailableStudents = computed(() => {
  // Filter out students already in the class
  const notInClass = availableStudents.value.filter(
    student => !selectedStudents.value.find(s => s.id === student.id)
  )
  
  if (!studentSearchTerm.value) return notInClass
  
  const search = studentSearchTerm.value.toLowerCase()
  return notInClass.filter(
    (student) =>
      student.studentCode.toLowerCase().includes(search) ||
      student.fullName.toLowerCase().includes(search)
  )
})

const isAllVisibleSelected = computed(() => {
  if (filteredAvailableStudents.value.length === 0) return false
  return filteredAvailableStudents.value.every(student => 
    tempSelectedStudents.value.includes(student.id)
  )
})

const isTempSelected = (studentId) => {
  return tempSelectedStudents.value.includes(studentId)
}

const clientErrors = ref({})

const canSubmit = computed(() => {
  return (
    formData.value.code &&
    formData.value.name &&
    (formData.value.major_id !== undefined && formData.value.major_id !== null && formData.value.major_id !== '') &&
    formData.value.course
  )
})

const resetForm = () => {
  formData.value = {
    code: '',
    name: '',
    major: '',
    course: '',
    maxStudents: 50,
    status: 'active',
    advisorId: '',
    notes: ''
  }
  selectedStudents.value = []
  searchStudent.value = ''
  studentSearchTerm.value = ''
}

watch(
  () => props.officialClass,
  (newClass) => {
      if (newClass) {
        Object.assign(formData.value, newClass)
        // Ensure we map major_id if server returns Major object or major_id
        formData.value.major_id = newClass.major_id || newClass.major || (newClass.Major && (newClass.Major.major_id || newClass.Major.id)) || null
        // Map course to academic_year_id when available
        let courseVal = newClass.academic_year_id || newClass.course || (newClass.AcademicYear && (newClass.AcademicYear.id || newClass.AcademicYear.academic_year_id)) || ''
        // Resolve course to an academic year id if lookup is available
        const resolvedCourse = resolveCourseToAcademicYearId(courseVal)
        console.debug('[OfficialClassModal] watch officialClass mapping: courseVal ->', courseVal, 'resolvedCourse ->', resolvedCourse, 'type ->', typeof resolvedCourse)
        // If server returns AcademicYear object or academic_year_id, prefer that numeric id
        const pref = newClass.academic_year_id || (newClass.AcademicYear && (newClass.AcademicYear.id || newClass.AcademicYear.academic_year_id))
        let finalCourse = (pref !== undefined && pref !== null && pref !== '') ? Number(pref) : resolvedCourse
        // If resolver returned string and we have academicYears, try to match academicYear by name contains string
        if ((finalCourse === '' || typeof finalCourse === 'string') && academicYears?.value && academicYears.value.length) {
          const s = String(finalCourse || courseVal || '').trim()
          const found = academicYears.value.find(ay => (ay.name || ay.academic_year_name || '').toLowerCase().includes(s.toLowerCase()) || (ay.name || '').toLowerCase() === s.toLowerCase())
          if (found) finalCourse = Number(found.id)
        }
        formData.value.course = finalCourse
        selectedStudents.value = newClass.students || []
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

// When academicYears list is updated, try resolving course into an academicYear id again
watch(academicYears, (newVal) => {
  if (props.officialClass) {
    const newClass = props.officialClass
    const rawCourse = newClass.academic_year_id || newClass.course || (newClass.AcademicYear && (newClass.AcademicYear.id || newClass.AcademicYear.academic_year_id)) || ''
    const resolved = resolveCourseToAcademicYearId(rawCourse)
    console.debug('[OfficialClassModal] academicYears watch: academicYears:', academicYears?.value, 'rawCourse:', rawCourse, 'resolved:', resolved)
    console.debug('[OfficialClassModal] watch academicYears mapping: rawCourse ->', rawCourse, 'resolved ->', resolved, 'formData.course ->', formData.value.course)
    // If resolved is string and we have academicYears, try to find a matching id by name
    let finalResolved = resolved
    if ((finalResolved === '' || typeof finalResolved === 'string') && academicYears?.value && academicYears.value.length) {
      const s = String(finalResolved || rawCourse || '').trim()
      const found = academicYears.value.find(ay => (ay.name || ay.academic_year_name || '').toLowerCase().includes(s.toLowerCase()) || (ay.name || '').toLowerCase() === s.toLowerCase())
      if (found) finalResolved = Number(found.id)
    }
    if (finalResolved !== formData.value.course) formData.value.course = finalResolved
  }
}, { immediate: true })

// Helper to find an academicYear id from a value that might be 
// an id, a year (2022), or a name like 'Khóa 2022'. Returns number or string depending.
function resolveCourseToAcademicYearId(courseVal) {
  if (courseVal === undefined || courseVal === null || courseVal === '') return ''
  // If we already have numeric id and it matches an academicYear id, return it
  const asNumber = Number(courseVal)
  if (!isNaN(asNumber) && academicYears?.value && academicYears.value.find(ay => Number(ay.id) === asNumber)) return asNumber

  // Try to match by name (case-insensitive)
  const str = String(courseVal)
  if (academicYears?.value && academicYears.value.length) {
    const byName = academicYears.value.find(ay => (ay.name || '').toLowerCase() === str.toLowerCase() || (ay.name || '').toLowerCase().includes(str.toLowerCase()))
    if (byName) return Number(byName.id)

    // Try to extract 4-digit year and match
    const y = (str.match(/\d{4}/) || [])[0]
    if (y) {
      const byYear = academicYears.value.find(ay => (ay.name || '').includes(y))
      if (byYear) return Number(byYear.id)
    }
  }

  // As final fallback, if it's numeric but didn't match an id, still return the numeric form
  return !isNaN(asNumber) ? asNumber : courseVal
}

const toggleTempSelect = (studentId) => {
  const index = tempSelectedStudents.value.indexOf(studentId)
  if (index > -1) {
    tempSelectedStudents.value.splice(index, 1)
  } else {
    tempSelectedStudents.value.push(studentId)
  }
}

const toggleSelectAllVisible = () => {
  if (isAllVisibleSelected.value) {
    // Deselect all visible
    const visibleIds = filteredAvailableStudents.value.map(s => s.id)
    tempSelectedStudents.value = tempSelectedStudents.value.filter(id => !visibleIds.includes(id))
  } else {
    // Select all visible
    const visibleIds = filteredAvailableStudents.value.map(s => s.id)
    tempSelectedStudents.value = [...new Set([...tempSelectedStudents.value, ...visibleIds])]
  }
}

const addStudent = (student) => {
  if (!selectedStudents.value.find((s) => s.id === student.id)) {
    selectedStudents.value.push(student)
  }
}

const addSelectedStudents = () => {
  const studentsToAdd = availableStudents.value.filter(student => 
    tempSelectedStudents.value.includes(student.id)
  )
  
  studentsToAdd.forEach(student => {
    if (!selectedStudents.value.find((s) => s.id === student.id)) {
      selectedStudents.value.push(student)
    }
  })
  
  tempSelectedStudents.value = []
  showAddStudentModal.value = false
  studentSearchTerm.value = ''
}

const confirmRemoveStudent = (student) => {
  studentToRemove.value = student
  showRemoveConfirm.value = true
}

const executeRemove = () => {
  if (studentToRemove.value) {
    selectedStudents.value = selectedStudents.value.filter(
      (s) => s.id !== studentToRemove.value.id
    )
  }
  cancelRemove()
}

const cancelRemove = () => {
  showRemoveConfirm.value = false
  studentToRemove.value = null
}

const removeStudent = (studentId) => {
  selectedStudents.value = selectedStudents.value.filter((s) => s.id !== studentId)
}

const handleImportStudents = (importData) => {
  // Convert imported data to student objects
  const importedStudents = importData.data
    .filter(row => !row.hasError)
    .map((row, index) => ({
      id: Date.now() + index,
      studentCode: row.studentCode,
      fullName: row.fullName,
      email: row.email,
      currentClass: row.officialClass || null
    }))
  
  // Add to selected students (avoid duplicates)
  importedStudents.forEach(student => {
    if (!selectedStudents.value.find((s) => s.studentCode === student.studentCode)) {
      selectedStudents.value.push(student)
    }
  })
  
  showImportModal.value = false
}

const getAdvisorName = (advisorId) => {
  const advisor = (validAdvisors.value || []).find((a) => (a.teacher_id || a.id) === advisorId) || (advisors || []).find((a) => (a.teacher_id || a.id) === advisorId)
  if (advisor) return (advisor.display || advisor.name || advisor.user_name || '')
  // Fallback to local mock list if provided
  const mockAdvisor = advisorList.value.find((a) => a.id === advisorId)
  return mockAdvisor ? mockAdvisor.name : ''
}

const getCurrentCourseLabel = () => {
  let val = formData.value.course
  if (!val && props.officialClass) {
    // prefer AcademicYear name if present
    const ac = props.officialClass.AcademicYear || (props.officialClass.AcademicYear && props.officialClass.AcademicYear.name)
    if (ac && ac.name) return ac.name
    if (props.officialClass.academic_year_id) {
      const ay = (academicYears?.value || []).find(a => Number(a.id) === Number(props.officialClass.academic_year_id))
      if (ay) return ay.name || ay.academic_year_name
    }
    if (props.officialClass.course) return String(props.officialClass.course)
  }
  if (val) {
    // find label
    const ay = (academicYears?.value || []).find(a => Number(a.id) === Number(val))
    if (ay) return ay.name || ay.academic_year_name
    return String(val)
  }
  return ''
}

const filterStudents = () => {
  // This would filter selected students if needed
}

const handleSubmit = () => {
  // Reset errors
  clientErrors.value = {}
  // Basic validation
  if (!formData.value.code || !String(formData.value.code).trim()) clientErrors.value.code = 'Mã lớp bắt buộc'
  if (!formData.value.name || !String(formData.value.name).trim()) clientErrors.value.name = 'Tên lớp bắt buộc'
  if (!formData.value.major_id) clientErrors.value.major = 'Ngành học bắt buộc'
  if (!formData.value.course) clientErrors.value.course = 'Khóa/Academic Year bắt buộc'
  if (formData.value.maxStudents && Number(formData.value.maxStudents) < 1) clientErrors.value.maxStudents = 'Số lượng tối đa phải >= 1'

  if (Object.keys(clientErrors.value).length) return

  const classData = {
    ...formData.value,
    students: selectedStudents.value,
    studentCount: selectedStudents.value.length
  }
  emit('submit', classData)
  close()
}

const close = () => {
  emit('close')
  resetForm()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100001;
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease;
}

.modal-container.small {
  max-width: 600px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 2px solid #f0f0f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.modal-header h2,
.modal-header h3 {
  margin: 0;
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header h3 {
  font-size: 20px;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.3s;
}

.btn-close:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-body {
  padding: 32px;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h3 {
  margin: 0 0 20px;
  color: #2c3e50;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.student-count {
  font-size: 14px;
  color: #667eea;
  font-weight: 600;
  margin-left: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 14px;
}

.required {
  color: #e74c3c;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.advisor-info {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #e8f5e9;
  border-radius: 8px;
  color: #2e7d32;
  font-size: 14px;
  margin-top: 12px;
}

.advisor-info i {
  font-size: 18px;
}

.student-search {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.student-search input {
  flex: 1;
  min-width: 250px;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.student-actions {
  display: flex;
  gap: 8px;
}

.btn-import-student,
.btn-add-student {
  padding: 12px 20px;
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
  white-space: nowrap;
}

.btn-import-student {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.btn-import-student:hover,
.btn-add-student:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.selected-students {
  max-height: 300px;
  overflow-y: auto;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 12px;
}

.student-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s;
}

.student-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.student-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-code {
  font-weight: 700;
  color: #667eea;
  font-size: 14px;
}

.student-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 15px;
}

.student-email {
  font-size: 13px;
  color: #7f8c8d;
}

.btn-remove-student {
  background: #e74c3c;
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-remove-student:hover {
  background: #c0392b;
  transform: scale(1.1);
}

.empty-students {
  text-align: center;
  padding: 40px;
  color: #95a5a6;
}

.empty-students i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-students p {
  margin: 0;
  font-size: 14px;
}

/* Add Student Modal Styles */
.search-box {
  margin-bottom: 16px;
}

.search-box input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  margin-bottom: 12px;
}

.selection-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.btn-select-all,
.btn-add-selected {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  transition: all 0.3s;
}

.btn-select-all {
  background: #f3f4f6;
  color: #374151;
}

.btn-select-all:hover {
  background: #e5e7eb;
}

.btn-add-selected {
  background: #667eea;
  color: white;
}

.btn-add-selected:hover:not(:disabled) {
  background: #5568d3;
}

.btn-add-selected:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.available-students-list {
  max-height: 400px;
  overflow-y: auto;
}

.available-student-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.available-student-item:hover {
  border-color: #667eea;
  background: #f8f9ff;
  transform: translateY(-2px);
}

.available-student-item.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.available-student-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.student-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.student-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-details strong {
  color: #667eea;
  font-size: 14px;
}

.student-details span {
  color: #2c3e50;
  font-weight: 600;
}

.student-details small {
  color: #7f8c8d;
  font-size: 12px;
}

.btn-add-icon {
  background: transparent;
  border: none;
  color: #667eea;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-add-icon:hover {
  transform: scale(1.2);
  color: #764ba2;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #95a5a6;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid #f0f0f0;
}

.btn-cancel,
.btn-submit {
  padding: 12px 32px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-cancel {
  background: #f8f9fa;
  color: #7f8c8d;
  border: 2px solid #e0e0e0;
}

.btn-cancel:hover {
  background: #e9ecef;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header {
    border-radius: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .student-search {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }
}

/* Confirm Remove Dialog */
.confirm-dialog {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease;
  overflow: hidden;
}

.confirm-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 24px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin-bottom: 16px;
}

.confirm-icon.warning {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.confirm-header h3 {
  margin: 0;
  font-size: 20px;
  color: #2c3e50;
  text-align: center;
}

.confirm-body {
  padding: 24px;
}

.confirm-body > p {
  margin: 0 0 20px;
  color: #2c3e50;
  font-size: 15px;
  text-align: center;
}

.student-preview {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 2px solid #e0e0e0;
}

.student-avatar-small {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}

.student-info-small {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.student-info-small strong {
  color: #667eea;
  font-size: 14px;
  font-weight: 700;
}

.student-info-small span {
  color: #2c3e50;
  font-size: 15px;
  font-weight: 600;
}

.warning-text {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: #fff3cd;
  border-left: 4px solid #ffc107;
  border-radius: 8px;
  color: #856404;
  font-size: 13px;
  margin: 0;
}

.warning-text i {
  font-size: 18px;
  flex-shrink: 0;
}

.confirm-actions {
  display: flex;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #f0f0f0;
  background: #f8f9fa;
}

.btn-confirm-cancel,
.btn-confirm-remove {
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.3s;
  border: none;
}

.btn-confirm-cancel {
  background: white;
  color: #6b7280;
  border: 2px solid #e0e0e0;
}

.btn-confirm-cancel:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.btn-confirm-remove {
  background: #ef4444;
  color: white;
}

.btn-confirm-remove:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
}

@media (max-width: 768px) {
  .confirm-dialog {
    max-width: 90%;
  }
  
  .confirm-actions {
    flex-direction: column;
  }
  
  .btn-confirm-cancel,
  .btn-confirm-remove {
    width: 100%;
  }
}
</style>
