<template>
  <!-- Modal Overlay -->
  <div v-if="isVisible" class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <!-- Modal Header -->
      <div class="modal-header">
        <div class="header-info">
          <div class="modal-icon">
            <i :class="headerIcon"></i>
          </div>
          <div>
            <h2>{{ modalTitle }}</h2>
            <p>{{ modalDescription }}</p>
          </div>
        </div>
        <button @click="closeModal" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="modal-body">
        <div v-if="serverErrors.non_field_errors || serverErrors.error" class="server-error-box">
          <ul>
            <li v-for="(err, idx) in (serverErrors.non_field_errors || (serverErrors.error ? [serverErrors.error] : []))" :key="idx">{{ err }}</li>
          </ul>
        </div>
        <form @submit.prevent="handleSubmit">
          <!-- Thông tin cơ bản -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-info-circle"></i>
              Thông tin cơ bản
            </h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label>Mã môn học <span class="required">*</span></label>
                <input
                  type="text"
                  v-model="formData.sku"
                  placeholder="VD: CS101"
                  :disabled="mode === 'view' || mode === 'edit'"
                  required
                  class="form-input"
                />
                <small class="help-text">Mã môn học theo quy định của trường</small>
                  <span v-if="serverErrors.sku || serverErrors.course_SKU" class="error-message">{{ (serverErrors.sku || serverErrors.course_SKU)[0] || (serverErrors.sku || serverErrors.course_SKU) }}</span>
              </div>

              <div class="form-group">
                <label>Số tín chỉ <span class="required">*</span></label>
                <input
                  type="number"
                  v-model.number="formData.credits"
                  min="1"
                  max="10"
                  placeholder="VD: 3"
                  :disabled="mode === 'view'"
                  required
                  class="form-input"
                />
                  <span v-if="serverErrors.credits" class="error-message">{{ serverErrors.credits[0] || serverErrors.credits }}</span>
              </div>

              <div class="form-group full-width">
                <label>Tên môn học (Tiếng Việt) <span class="required">*</span></label>
                <input
                  type="text"
                  v-model="formData.nameVn"
                  placeholder="VD: Nhập môn Khoa học Máy tính"
                  :disabled="mode === 'view'"
                  required
                  class="form-input"
                />
                <span v-if="serverErrors.nameVn || serverErrors.course_name_vn" class="error-message">{{ (serverErrors.nameVn || serverErrors.course_name_vn)[0] || (serverErrors.nameVn || serverErrors.course_name_vn) }}</span>
              </div>

              <div class="form-group full-width">
                <label>Tên môn học (Tiếng Anh)</label>
                <input
                  type="text"
                  v-model="formData.nameEn"
                  placeholder="VD: Introduction to Computer Science"
                  :disabled="mode === 'view'"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Phân loại và thuộc tính -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-tags"></i>
              Phân loại và thuộc tính
            </h3>
            
            <div class="form-grid">
              <div class="form-group">
                <label>Loại môn học <span class="required">*</span></label>
                <select
                  v-model="formData.courseType"
                  :disabled="mode === 'view'"
                  required
                  class="form-select"
                >
                  <option value="">Chọn loại môn học</option>
                  <option value="required">Bắt buộc</option>
                  <option value="elective">Tự chọn</option>
                </select>
                <span v-if="serverErrors.courseType || serverErrors.course_type" class="error-message">{{ (serverErrors.courseType || serverErrors.course_type)[0] || (serverErrors.courseType || serverErrors.course_type) }}</span>
              </div>

              <div class="form-group">
                <label>Học kỳ <span class="required">*</span></label>
                <select
                  v-model.number="formData.semesterId"
                  :disabled="mode === 'view'"
                  required
                  class="form-select"
                >
                  <option value="">Chọn học kỳ</option>
                  <option 
                    v-for="sem in semesterOptions" 
                    :key="sem.id" 
                    :value="sem.id"
                  >
                    {{ sem.name }}
                  </option>
                </select>
                <span v-if="serverErrors.semesterId || serverErrors.semester_id" class="error-message">{{ (serverErrors.semesterId || serverErrors.semester_id)[0] || (serverErrors.semesterId || serverErrors.semester_id) }}</span>
              </div>

              <div class="form-group full-width">
                <label>Chuyên ngành áp dụng <span class="required">*</span></label>
                <div class="majors-selection checkbox-group">
                  <label
                    v-for="major in majorOptions"
                    :key="major.major_id || major.id"
                    class="checkbox-item"
                  >
                    <input
                      type="checkbox"
                      :value="major.major_id || major.id"
                      v-model="selectedMajors"
                      :disabled="mode === 'view'"
                      class="checkbox"
                    />
                    <span class="checkbox-label">{{ major.major_name || major.name || major.major_code || major.code }}</span>
                  </label>
                </div>
                <span v-if="serverErrors.majorIds" class="error-message">{{ serverErrors.majorIds[0] }}</span>
                <small class="help-text">Nhấn Ctrl để chọn nhiều chuyên ngành hoặc chọn từng ô</small>
              </div>
            </div>
          </div>

          <!-- Điều kiện tiên quyết -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-sitemap"></i>
              Điều kiện tiên quyết
            </h3>
            
            <div class="prerequisites-section">
              <div class="prereq-input">
                <select
                  v-model="newPrerequisite"
                  :disabled="mode === 'view'"
                  class="form-select"
                >
                  <option value="">Chọn môn tiên quyết</option>
                  <option
                    v-for="course in availableCourses"
                    :key="course.id"
                    :value="course.id"
                  >
                    {{ course.sku }} - {{ course.nameVn }}
                  </option>
                </select>
                <button
                  type="button"
                  @click="addPrerequisite"
                  :disabled="mode === 'view' || !newPrerequisite"
                  class="btn-add-prereq"
                >
                  <i class="fas fa-plus"></i>
                  Thêm
                </button>
              </div>
              
              <div v-if="selectedPrerequisites.length > 0" class="prereq-list">
                <div
                  v-for="(prereq, index) in selectedPrerequisites"
                  :key="index"
                  class="prereq-item"
                >
                  <span class="prereq-code">{{ getCourseDisplayName(prereq) }}</span>
                  <button
                    v-if="mode !== 'view'"
                    type="button"
                    @click="removePrerequisite(index)"
                    class="btn-remove-prereq"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              
              <p v-else class="no-prereq">Không có điều kiện tiên quyết</p>
              <span v-if="serverErrors.prerequisiteIds || serverErrors.prerequisite_ids" class="error-message">{{ (serverErrors.prerequisiteIds || serverErrors.prerequisite_ids)[0] || (serverErrors.prerequisiteIds || serverErrors.prerequisite_ids) }}</span>
            </div>
          </div>

          <!-- Mô tả môn học -->
          <div class="form-section">
            <h3 class="section-title">
              <i class="fas fa-align-left"></i>
              Mô tả môn học
            </h3>
            
            <div class="form-group full-width">
              <label>Mô tả ngắn</label>
              <textarea
                v-model="formData.description"
                rows="3"
                placeholder="Mô tả ngắn gọn về môn học..."
                :disabled="mode === 'view'"
                class="form-textarea"
              ></textarea>
              <span v-if="serverErrors.description" class="error-message">{{ serverErrors.description[0] || serverErrors.description }}</span>
            </div>
          </div>
        </form>
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer">
        <div class="footer-left">
          <button
            v-if="mode === 'edit' && subject?.id"
            @click="duplicateSubject"
            class="btn-secondary"
          >
            <i class="fas fa-copy"></i>
            Nhân bản
          </button>
        </div>
        
        <div class="footer-right">
          <button @click="closeModal" class="btn-cancel">
            Hủy
          </button>
          
          <button
            v-if="mode !== 'view'"
            @click="handleSubmit"
            :disabled="!isFormValid || saving"
            class="btn-primary"
          >
            <i :class="submitIcon"></i>
            {{ submitText }}
          </button>
          
          <button
            v-if="mode === 'view'"
            @click="startEdit"
            class="btn-primary"
          >
            <i class="fas fa-edit"></i>
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useSemesters } from '@/hooks/useSemesters'
import { useMajors } from '@/hooks/useMajors'
import { useCourses } from '@/hooks/useCourses'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'add', // 'add', 'edit', 'view'
    validator: (value) => ['add', 'edit', 'view'].includes(value)
  },
  subject: {
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
  }
})

const emit = defineEmits(['close', 'save', 'duplicate'])

const { semesters, fetchSemesters } = useSemesters()
const { majors, fetchMajors } = useMajors()
const { courses: allCourses, fetchCourses } = useCourses()

const semesterOptions = computed(() => semesters.value)
const majorOptions = computed(() => majors.value)
const availableCourses = computed(() => {
  // Exclude current course from prerequisites
  return allCourses.value.filter(c => !props.subject || c.id !== props.subject.id)
})

// Form data
const formData = reactive({
  sku: '',
  nameVn: '',
  nameEn: '',
  credits: 0,
  courseType: '',
  semesterId: null,
  description: ''
})

const selectedMajors = ref([])
const selectedPrerequisites = ref([])
const newPrerequisite = ref('')

// Computed
const modalTitle = computed(() => {
  const titles = {
    'add': 'Thêm môn học mới',
    'edit': 'Chỉnh sửa môn học',
    'view': 'Chi tiết môn học'
  }
  return titles[props.mode]
})

const modalDescription = computed(() => {
  const descriptions = {
    'add': 'Nhập thông tin chi tiết để tạo môn học mới',
    'edit': 'Cập nhật thông tin môn học',
    'view': 'Xem thông tin chi tiết của môn học'
  }
  return descriptions[props.mode]
})

const headerIcon = computed(() => {
  const icons = {
    'add': 'fas fa-plus-circle',
    'edit': 'fas fa-edit',
    'view': 'fas fa-eye'
  }
  return icons[props.mode]
})

const submitText = computed(() => {
  const texts = {
    'add': 'Tạo môn học',
    'edit': 'Cập nhật'
  }
  return texts[props.mode]
})

const submitIcon = computed(() => {
  const icons = {
    'add': 'fas fa-plus',
    'edit': 'fas fa-save'
  }
  return icons[props.mode]
})

const isFormValid = computed(() => {
  return formData.sku &&
         formData.nameVn &&
         formData.credits > 0 &&
         formData.courseType &&
         formData.semesterId &&
         selectedMajors.value.length > 0
})

// Methods
const resetForm = () => {
  Object.assign(formData, {
    sku: '',
    nameVn: '',
    nameEn: '',
    credits: 0,
    courseType: '',
    semesterId: null,
    description: ''
  })
  selectedMajors.value = []
  selectedPrerequisites.value = []
  newPrerequisite.value = ''
}

const loadSubjectData = () => {
  if (props.subject) {
    Object.assign(formData, {
      sku: props.subject.sku || props.subject.code || props.subject.raw?.course_SKU || props.subject.raw?.sku || '',
      nameVn: props.subject.nameVn || props.subject.name || props.subject.raw?.name_vn || props.subject.raw?.course_name_vn || '',
      nameEn: props.subject.nameEn || props.subject.englishName || props.subject.raw?.name_en || props.subject.raw?.course_name_en || '',
      credits: props.subject.credits || Number(props.subject.credit || props.subject.credits) || 0,
      courseType: props.subject.courseType || props.subject.type || props.subject.raw?.course_type || '',
      semesterId: props.subject.semesterId || props.subject.semester || (props.subject.Semester && (props.subject.Semester.id || props.subject.Semester.semester_id)) || null,
      description: props.subject.description || props.subject.raw?.description || ''
    })
    // Major handling: support both object arrays (Majors) and primitive arrays (majors)
    if (props.subject.Majors && Array.isArray(props.subject.Majors)) {
      selectedMajors.value = [...new Set(props.subject.Majors.map(m => Number(m.major_id || m.id)).filter(n => Number.isFinite(n)))]
    } else if (props.subject.majors && Array.isArray(props.subject.majors)) {
      // majors may be array of codes or ids
      selectedMajors.value = [...new Set(props.subject.majors.map(m => Number.isFinite(Number(m)) ? Number(m) : m).filter(Boolean))]
    } else {
      selectedMajors.value = []
    }

    // Prerequisites handling: support both object arrays (Prerequisites) and primitive arrays (prerequisites)
    if (props.subject.Prerequisites && Array.isArray(props.subject.Prerequisites)) {
      selectedPrerequisites.value = props.subject.Prerequisites.map(p => Number(p?.course_id || p?.id || p)).filter(n => Number.isFinite(n))
    } else if (props.subject.prerequisites && Array.isArray(props.subject.prerequisites)) {
      selectedPrerequisites.value = props.subject.prerequisites.map(p => Number(p)).filter(n => Number.isFinite(n))
    } else {
      selectedPrerequisites.value = []
    }
  }
}

const addPrerequisite = () => {
  if (!newPrerequisite.value) return
  const id = Number(newPrerequisite.value)
  if (!Number.isFinite(id)) return
  if (!selectedPrerequisites.value.some(p => Number(p) === id)) {
    selectedPrerequisites.value.push(id)
  }
  newPrerequisite.value = ''
}

const removePrerequisite = (index) => {
  selectedPrerequisites.value.splice(index, 1)
}

const getCourseDisplayName = (courseId) => {
  if (courseId === null || courseId === undefined) return ''
  const idStr = String(courseId)
  const course = allCourses.value.find(c => String(c.id) === idStr || String(c.course_id) === idStr || String(c.sku) === idStr || String(c.course_SKU) === idStr || String(c.code) === idStr)
  if (course) return `${course.sku || course.course_SKU || course.code} - ${course.nameVn || course.course_name_vn || course.name || ''}`
  return `Môn học ${courseId}`
}

const handleSubmit = () => {
  if (!isFormValid.value) return
  
  // Ensure numeric deduped IDs are sent
  const dedupMajors = Array.from(new Set((selectedMajors.value || []).map(Number).filter(v => !Number.isNaN(v))))
  const dedupPrereq = Array.from(new Set((selectedPrerequisites.value || []).map(Number).filter(v => !Number.isNaN(v))))

  const submitData = {
    ...formData,
    majorIds: dedupMajors,
    prerequisiteIds: dedupPrereq
  }
  
  emit('save', submitData)
}

const duplicateSubject = () => {
  const duplicateData = {
    ...formData,
    sku: formData.sku + '_COPY',
    nameVn: formData.nameVn + ' (Bản sao)',
    majorIds: Array.from(new Set((selectedMajors.value || []).map(Number).filter(n => Number.isFinite(n)))),
    prerequisiteIds: Array.from(new Set((selectedPrerequisites.value || []).map(Number).filter(n => Number.isFinite(n))))
  }
  console.debug('SubjectModal.duplicateSubject payload:', duplicateData)
  emit('duplicate', duplicateData)
}

const startEdit = () => {
  emit('close')
  nextTick(() => {
    // Re-emit with edit mode
    emit('edit-subject', props.subject)
  })
}

const closeModal = () => {
  emit('close')
}

const handleOverlayClick = () => {
  closeModal()
}

// Initialize data
onMounted(async () => {
  await Promise.allSettled([
    fetchSemesters(),
    fetchMajors(),
    fetchCourses({ limit: 100 }) // Load all courses for prerequisites
  ])
})

// Watchers
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    Promise.allSettled([
      fetchSemesters(),
      fetchMajors(),
      fetchCourses({ limit: 100 })
    ]).then(() => {
      if (props.mode === 'add') {
        resetForm()
      } else {
        loadSubjectData()
      }
    })
  }
})

watch(() => props.subject, () => {
  if (props.isVisible && props.subject) {
    loadSubjectData()
  }
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px 24px 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.header-info {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.header-info h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.header-info p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #374151;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.server-error-box {
  background: #fff6f6;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 8px;
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.section-title i {
  color: #3b82f6;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #dc2626;
}

.form-input,
.form-select,
.form-textarea {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input:disabled,
.form-select:disabled,
.form-textarea:disabled {
  background: #f9fafb;
  color: #6b7280;
  border-color: #e5e7eb;
}

.help-text {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.checkbox-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-label {
  color: #374151;
  font-weight: 500;
}

.prerequisites-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.prereq-input {
  display: flex;
  gap: 12px;
  align-items: flex-end;
}

.prereq-input .form-input {
  flex: 1;
}

.btn-add-prereq {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-add-prereq:hover:not(:disabled) {
  background: #2563eb;
}

.btn-add-prereq:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prereq-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.prereq-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 20px;
  font-size: 13px;
}

.prereq-code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  color: #92400e;
}

.btn-remove-prereq {
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(220, 38, 38, 0.1);
  color: #dc2626;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.btn-remove-prereq:hover {
  background: rgba(220, 38, 38, 0.2);
}

.no-prereq {
  color: #9ca3af;
  font-style: italic;
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.footer-left,
.footer-right {
  display: flex;
  gap: 12px;
}

.btn-cancel,
.btn-secondary,
.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-cancel:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
  border: 2px solid #e5e7eb;
}

.btn-secondary:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border: 2px solid #3b82f6;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-container {
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .header-info {
    gap: 12px;
  }
  
  .modal-icon {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
  
  .header-info h2 {
    font-size: 18px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .checkbox-group {
    grid-template-columns: 1fr;
  }
  
  .prereq-input {
    flex-direction: column;
    align-items: stretch;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 16px;
    padding: 16px 20px;
  }
  
  .footer-left,
  .footer-right {
    width: 100%;
    justify-content: center;
  }
}
</style>