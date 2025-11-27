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
                  v-model="formData.code"
                  placeholder="VD: IT101"
                  :disabled="mode === 'view'"
                  required
                  class="form-input"
                />
                <small class="help-text">Mã môn học theo quy định của trường</small>
              </div>

              <div class="form-group">
                <label>Số tín chỉ <span class="required">*</span></label>
                <select
                  v-model="formData.credits"
                  :disabled="mode === 'view'"
                  required
                  class="form-select"
                >
                  <option value="">Chọn số tín chỉ</option>
                  <option value="1">1 tín chỉ</option>
                  <option value="2">2 tín chỉ</option>
                  <option value="3">3 tín chỉ</option>
                  <option value="4">4 tín chỉ</option>
                  <option value="5">5 tín chỉ</option>
                  <option value="6">6 tín chỉ</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Tên môn học (Tiếng Việt) <span class="required">*</span></label>
                <input
                  type="text"
                  v-model="formData.name"
                  placeholder="VD: Nhập môn Công nghệ thông tin"
                  :disabled="mode === 'view'"
                  required
                  class="form-input"
                />
              </div>

              <div class="form-group full-width">
                <label>Tên môn học (Tiếng Anh)</label>
                <input
                  type="text"
                  v-model="formData.englishName"
                  placeholder="VD: Introduction to Information Technology"
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
                  v-model="formData.type"
                  :disabled="mode === 'view'"
                  required
                  class="form-select"
                >
                  <option value="">Chọn loại môn học</option>
                  <option value="required">Môn bắt buộc</option>
                  <option value="elective">Môn tự chọn</option>
                  <option value="specialization">Môn chuyên ngành</option>
                </select>
              </div>

              <div class="form-group">
                <label>Học kỳ đề xuất <span class="required">*</span></label>
                <select
                  v-model="formData.semester"
                  :disabled="mode === 'view'"
                  required
                  class="form-select"
                >
                  <option value="">Chọn học kỳ</option>
                  <option v-for="sem in 8" :key="sem" :value="sem">
                    Học kỳ {{ sem }}
                  </option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Chuyên ngành áp dụng <span class="required">*</span></label>
                <div class="checkbox-group">
                  <label
                    v-for="major in majorOptions"
                    :key="major.id"
                    class="checkbox-item"
                  >
                    <input
                      type="checkbox"
                      :value="major.id"
                      v-model="formData.majors"
                      :disabled="mode === 'view'"
                      class="checkbox"
                    />
                    <span class="checkbox-label">{{ major.name }}</span>
                  </label>
                </div>
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
                <input
                  type="text"
                  v-model="newPrerequisite"
                  placeholder="Nhập mã môn tiên quyết (VD: IT101)"
                  :disabled="mode === 'view'"
                  class="form-input"
                  @keypress.enter="addPrerequisite"
                />
                <button
                  type="button"
                  @click="addPrerequisite"
                  :disabled="mode === 'view'"
                  class="btn-add-prereq"
                >
                  <i class="fas fa-plus"></i>
                  Thêm
                </button>
              </div>
              
              <div v-if="formData.prerequisites.length > 0" class="prereq-list">
                <div
                  v-for="(prereq, index) in formData.prerequisites"
                  :key="index"
                  class="prereq-item"
                >
                  <span class="prereq-code">{{ prereq }}</span>
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
            :disabled="!isFormValid"
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
import { ref, reactive, computed, watch, nextTick } from 'vue'

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
  }
})

const emit = defineEmits(['close', 'save', 'duplicate'])

// Form data
const formData = reactive({
  code: '',
  name: '',
  englishName: '',
  credits: '',
  type: '',
  semester: '',
  majors: [],
  prerequisites: [],
  description: '',
  content: '',
  status: 'active'
})

const newPrerequisite = ref('')

// Options
const majorOptions = ref([
  { id: 'cntt', name: 'Công nghệ thông tin' },
  { id: 'ktpm', name: 'Kỹ thuật phần mềm' },
  { id: 'httt', name: 'Hệ thống thông tin' },
  { id: 'mmt', name: 'Mạng máy tính' },
  { id: 'ai', name: 'Trí tuệ nhân tạo' },
  { id: 'ds', name: 'Khoa học dữ liệu' }
])

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
  return formData.code &&
         formData.name &&
         formData.credits &&
         formData.type &&
         formData.semester &&
         formData.majors.length > 0
})

// Methods
const resetForm = () => {
  Object.assign(formData, {
    code: '',
    name: '',
    englishName: '',
    credits: '',
    type: '',
    semester: '',
    majors: [],
    prerequisites: [],
    description: '',
    content: '',
    status: 'active'
  })
  newPrerequisite.value = ''
}

const loadSubjectData = () => {
  if (props.subject) {
    Object.assign(formData, {
      code: props.subject.code || '',
      name: props.subject.name || '',
      englishName: props.subject.englishName || '',
      credits: props.subject.credits || '',
      type: props.subject.type || '',
      semester: props.subject.semester || '',
      majors: [...(props.subject.majors || [])],
      prerequisites: [...(props.subject.prerequisites || [])],
      description: props.subject.description || '',
      content: props.subject.content || '',
      status: props.subject.status || 'active'
    })
  }
}

const addPrerequisite = () => {
  const code = newPrerequisite.value.trim().toUpperCase()
  if (code && !formData.prerequisites.includes(code)) {
    formData.prerequisites.push(code)
    newPrerequisite.value = ''
  }
}

const removePrerequisite = (index) => {
  formData.prerequisites.splice(index, 1)
}

const handleSubmit = () => {
  if (!isFormValid.value) return
  
  const submitData = {
    ...formData,
    credits: parseInt(formData.credits),
    semester: parseInt(formData.semester)
  }
  
  if (props.mode === 'add') {
    submitData.id = Date.now() // Temporary ID for demo
  } else if (props.subject?.id) {
    submitData.id = props.subject.id
  }
  
  emit('save', submitData)
}

const duplicateSubject = () => {
  const duplicateData = {
    ...formData,
    code: formData.code + '_COPY',
    name: formData.name + ' (Bản sao)',
    id: Date.now()
  }
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

// Watchers
watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    if (props.mode === 'add') {
      resetForm()
    } else {
      loadSubjectData()
    }
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