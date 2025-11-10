<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ isEdit ? 'Chỉnh sửa bài tập' : 'Tạo bài tập mới' }}</h2>
        <button @click="close" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>



      <div class="modal-body">
        <!-- Basic Info -->
        <div class="form-section">
          <h3 class="section-title">Thông tin cơ bản</h3>
          
          <div class="form-group">
            <label>Tiêu đề bài tập <span class="required">*</span></label>
            <input 
              v-model="formData.title" 
              type="text" 
              placeholder="Nhập tiêu đề bài tập"
              class="form-input"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Lớp học <span class="required">*</span></label>
              <select v-model="formData.classId" class="form-select">
                <option value="">-- Chọn lớp --</option>
                <option value="1">Lập trình hướng đối tượng - Nhóm 01</option>
                <option value="2">Phát triển ứng dụng Web - Nhóm 02</option>
                <option value="3">Cơ sở dữ liệu - Nhóm 03</option>
                <option value="4">Cấu trúc dữ liệu & Giải thuật - Nhóm 04</option>
              </select>
            </div>

            <div class="form-group">
              <label>Loại bài tập <span class="required">*</span></label>
              <select v-model="formData.type" class="form-select">
                <option value="essay">Tự luận</option>
                <option value="multiple-choice">Trắc nghiệm</option>
                <option value="mixed">Hỗn hợp</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Hạn nộp <span class="required">*</span></label>
              <input 
                v-model="formData.deadline" 
                type="datetime-local" 
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label>Điểm tối đa <span class="required">*</span></label>
              <input 
                v-model.number="formData.maxScore" 
                type="number" 
                min="0" 
                max="10" 
                step="0.5"
                class="form-input"
              />
            </div>
          </div>

          <div class="form-group">
            <label>Mô tả</label>
            <textarea 
              v-model="formData.description" 
              rows="4" 
              placeholder="Nhập mô tả bài tập"
              class="form-textarea"
            ></textarea>
          </div>
        </div>

        <!-- Questions Section -->
        <div class="form-section">
          <div class="section-header">
            <h3 class="section-title">Câu hỏi</h3>
            <button @click="addQuestion" class="btn-add-question">
              <i class="fas fa-plus"></i>
              Thêm câu hỏi
            </button>
          </div>

          <div v-if="formData.questions.length === 0" class="empty-questions">
            <i class="fas fa-question-circle"></i>
            <p>Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.</p>
          </div>

          <div v-else class="questions-list">
            <div 
              v-for="(question, index) in formData.questions" 
              :key="question.id"
              class="question-item"
            >
              <div class="question-header">
                <span class="question-number">Câu {{ index + 1 }}</span>
                <div class="question-actions">
                  <select v-model="question.type" class="question-type-select">
                    <option value="essay">Tự luận</option>
                    <option value="multiple-choice">Trắc nghiệm</option>
                  </select>
                  <button @click="removeQuestion(index)" class="btn-remove">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>

              <div class="question-body">
                <div class="form-group">
                  <label>Nội dung câu hỏi</label>
                  <textarea 
                    v-model="question.content" 
                    rows="3" 
                    placeholder="Nhập nội dung câu hỏi"
                    class="form-textarea"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label>Số điểm</label>
                  <input 
                    v-model.number="question.points" 
                    type="number" 
                    min="0" 
                    step="0.5"
                    class="form-input small"
                  />
                </div>

                <!-- Multiple Choice Options -->
                <div v-if="question.type === 'multiple-choice'" class="options-section">
                  <label>Các đáp án</label>
                  <div class="options-list">
                    <div 
                      v-for="(option, optIndex) in question.options" 
                      :key="optIndex"
                      class="option-item"
                    >
                      <input 
                        type="radio" 
                        :name="'correct-' + question.id"
                        :value="optIndex"
                        v-model="question.correctAnswer"
                        class="option-radio"
                      />
                      <input 
                        v-model="question.options[optIndex]" 
                        type="text" 
                        :placeholder="'Đáp án ' + String.fromCharCode(65 + optIndex)"
                        class="option-input"
                      />
                      <button 
                        v-if="question.options.length > 2"
                        @click="removeOption(question, optIndex)" 
                        class="btn-remove-option"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                  <button 
                    v-if="question.options.length < 6"
                    @click="addOption(question)" 
                    class="btn-add-option"
                  >
                    <i class="fas fa-plus"></i>
                    Thêm đáp án
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Total Points Display -->
          <div v-if="formData.questions.length > 0" class="total-points">
            <span>Tổng điểm câu hỏi:</span>
            <strong>{{ totalQuestionPoints }} / {{ formData.maxScore }}</strong>
            <span 
              v-if="totalQuestionPoints !== formData.maxScore" 
              class="warning-text"
            >
              ⚠️ Tổng điểm câu hỏi phải bằng điểm tối đa
            </span>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="close" class="btn-cancel">Hủy</button>
        <!-- Footer add question button for quick access -->
        <button @click="addQuestion" class="btn-add-question-footer" title="Thêm câu hỏi" aria-label="Thêm câu hỏi">
          <i class="fas fa-plus"></i>
          Thêm câu hỏi
        </button>
        <!-- Compact icon-only delete button (matches screenshot) -->
        <button
          v-if="isEdit"
          @click="confirmDelete"
          class="btn-danger btn-danger-icon"
          title="Xóa bài tập"
          aria-label="Xóa bài tập"
        >
          <i class="fas fa-trash"></i>
        </button>
        <button @click="showConfirmDialog" class="btn-save" :disabled="!isValid">
          <i class="fas fa-check"></i>
          {{ isEdit ? 'Cập nhật' : 'Tạo bài tập' }}
        </button>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <Transition name="fade">
      <div v-if="showConfirmation" class="confirmation-overlay" @click.self="cancelConfirmation">
        <div class="confirmation-dialog">
          <div class="confirmation-header">
            <i class="fas fa-info-circle"></i>
            <h3>Xác nhận {{ isEdit ? 'cập nhật' : 'tạo' }} bài tập</h3>
          </div>
          
          <div class="confirmation-body">
            <div class="confirm-section">
              <h4>Thông tin bài tập</h4>
              <div class="confirm-row">
                <span class="label">Tiêu đề:</span>
                <span class="value">{{ formData.title }}</span>
              </div>
              <div class="confirm-row">
                <span class="label">Lớp học:</span>
                <span class="value">{{ getClassName(formData.classId) }}</span>
              </div>
              <div class="confirm-row">
                <span class="label">Loại bài tập:</span>
                <span class="value">
                  <span :class="['type-pill', formData.type]">
                    {{ getTypeLabel(formData.type) }}
                  </span>
                </span>
              </div>
              <div class="confirm-row">
                <span class="label">Hạn nộp:</span>
                <span class="value">{{ formatDeadline(formData.deadline) }}</span>
              </div>
              <div class="confirm-row">
                <span class="label">Điểm tối đa:</span>
                <span class="value"><strong>{{ formData.maxScore }}</strong></span>
              </div>
            </div>

            <div class="confirm-section">
              <h4>Câu hỏi</h4>
              <div class="question-summary">
                <div class="summary-item">
                  <i class="fas fa-list"></i>
                  <span>{{ formData.questions.length }} câu hỏi</span>
                </div>
                <div class="summary-item" v-if="essayCount > 0">
                  <i class="fas fa-pen"></i>
                  <span>{{ essayCount }} tự luận</span>
                </div>
                <div class="summary-item" v-if="multipleChoiceCount > 0">
                  <i class="fas fa-check-square"></i>
                  <span>{{ multipleChoiceCount }} trắc nghiệm</span>
                </div>
                <div class="summary-item total">
                  <i class="fas fa-star"></i>
                  <span>Tổng: {{ totalQuestionPoints }}/{{ formData.maxScore }} điểm</span>
                </div>
              </div>
            </div>

            <div class="confirm-warning">
              <i class="fas fa-exclamation-triangle"></i>
              <span>Bạn có chắc chắn muốn {{ isEdit ? 'cập nhật' : 'tạo' }} bài tập này không?</span>
            </div>
          </div>

          <div class="confirmation-footer">
            <button @click="cancelConfirmation" class="btn-confirm-cancel">
              <i class="fas fa-times"></i>
              Hủy
            </button>
            <button @click="confirmSave" class="btn-confirm-save">
              <i class="fas fa-check"></i>
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </Transition>
    <!-- Delete Confirmation Dialog -->
    <Transition name="fade">
      <div v-if="showDeleteConfirm" class="confirmation-overlay" @click.self="cancelDelete">
        <div class="confirmation-dialog">
          <div class="delete-header">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Xác nhận xóa bài tập</h3>
          </div>

          <div class="confirmation-body">
            <p>Bạn có chắc chắn muốn xóa bài tập này không? Hành động này không thể hoàn tác.</p>
            <div class="confirm-section">
              <div class="confirm-row">
                <span class="label">Tiêu đề:</span>
                <span class="value">{{ formData.title }}</span>
              </div>
              <div class="confirm-row">
                <span class="label">Lớp học:</span>
                <span class="value">{{ getClassName(formData.classId) }}</span>
              </div>
            </div>
          </div>

          <div class="confirmation-footer">
            <button @click="cancelDelete" class="btn-confirm-cancel">
              <i class="fas fa-times"></i>
              Hủy
            </button>
            <button @click="deleteAssignment" class="btn-confirm-save" style="background: linear-gradient(135deg,#ef4444 0%,#dc2626 100%);">
              <i class="fas fa-trash"></i>
              Xóa bài tập
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  assignment: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'save', 'delete'])

const isEdit = computed(() => props.assignment !== null)

const formData = ref({
  title: '',
  classId: '',
  type: 'essay',
  deadline: '',
  maxScore: 10,
  description: '',
  questions: []
})

// Initialize form data
if (props.assignment) {
  formData.value = {
    title: props.assignment.title,
    classId: props.assignment.classId,
    type: props.assignment.type,
    deadline: props.assignment.deadline.substring(0, 16),
    maxScore: props.assignment.maxScore,
    description: props.assignment.description,
    questions: JSON.parse(JSON.stringify(props.assignment.questions || []))
  }
}

let questionIdCounter = formData.value.questions.length > 0 
  ? Math.max(...formData.value.questions.map(q => q.id)) + 1 
  : 1

const showConfirmation = ref(false)
const showDeleteConfirm = ref(false)

// Helper: distribute formData.maxScore evenly across multiple-choice questions
const distributePointsAcrossQuestions = () => {
  const qs = formData.value.questions
  const n = qs.length
  if (n === 0) return
  const max = parseFloat(formData.value.maxScore) || 0
  // base with 2 decimals
  const base = Math.floor((max / n) * 100) / 100
  // compute remainder to assign to last question (avoid floating sum issues)
  const remainder = Math.round((max - base * (n - 1)) * 100) / 100

  for (let i = 0; i < n; i++) {
    qs[i].points = i === n - 1 ? remainder : base
  }
}

const totalQuestionPoints = computed(() => {
  return formData.value.questions.reduce((sum, q) => sum + (q.points || 0), 0)
})

const essayCount = computed(() => {
  return formData.value.questions.filter(q => q.type === 'essay').length
})

const multipleChoiceCount = computed(() => {
  return formData.value.questions.filter(q => q.type === 'multiple-choice').length
})

const isValid = computed(() => {
  return formData.value.title && 
         formData.value.classId && 
         formData.value.deadline && 
         formData.value.questions.length > 0 &&
         totalQuestionPoints.value === formData.value.maxScore
})

const addQuestion = () => {
  const newQuestion = {
    id: questionIdCounter++,
    type: formData.value.type === 'multiple-choice' ? 'multiple-choice' : 'essay',
    content: '',
    points: 0,
    options: ['', '', '', ''],
    correctAnswer: 0
  }
  formData.value.questions.push(newQuestion)
  // If it's multiple-choice, distribute points evenly across questions
  if (formData.value.type === 'multiple-choice') {
    distributePointsAcrossQuestions()
  } else if (newQuestion.points === 0) {
    // default for essay if not set
    newQuestion.points = 1
  }
}

const removeQuestion = (index) => {
  formData.value.questions.splice(index, 1)
  if (formData.value.type === 'multiple-choice') {
    // re-distribute points when count changes
    distributePointsAcrossQuestions()
  }
}

const addOption = (question) => {
  question.options.push('')
}

const removeOption = (question, index) => {
  question.options.splice(index, 1)
  if (question.correctAnswer >= question.options.length) {
    question.correctAnswer = 0
  }
}

const close = () => {
  emit('close')
}

const showConfirmDialog = () => {
  if (!isValid.value) return
  showConfirmation.value = true
}

const cancelConfirmation = () => {
  showConfirmation.value = false
}

const confirmSave = () => {
  save()
  showConfirmation.value = false
}

// Delete flow for editing mode
const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const deleteAssignment = () => {
  // emit original assignment object (parent will handle removal)
  emit('delete', props.assignment)
  showDeleteConfirm.value = false
  emit('close')
}

const save = () => {
  if (!isValid.value) return

  const assignmentData = {
    ...formData.value,
    deadline: formData.value.deadline + ':00',
    className: getClassName(formData.value.classId),
    totalStudents: getTotalStudents(formData.value.classId)
  }

  emit('save', assignmentData)
}

const getClassName = (classId) => {
  const classes = {
    '1': 'Lập trình hướng đối tượng - Nhóm 01',
    '2': 'Phát triển ứng dụng Web - Nhóm 02',
    '3': 'Cơ sở dữ liệu - Nhóm 03',
    '4': 'Cấu trúc dữ liệu & Giải thuật - Nhóm 04'
  }
  return classes[classId] || ''
}

const getTotalStudents = (classId) => {
  const students = {
    '1': 45,
    '2': 40,
    '3': 50,
    '4': 48
  }
  return students[classId] || 0
}

const getTypeLabel = (type) => {
  const labels = {
    'essay': 'Tự luận',
    'multiple-choice': 'Trắc nghiệm',
    'mixed': 'Hỗn hợp'
  }
  return labels[type] || type
}

const formatDeadline = (deadline) => {
  if (!deadline) return ''
  const d = new Date(deadline)
  return d.toLocaleString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Watch type change to adjust questions
// When assignment type changes, adjust question types and points
watch(() => formData.value.type, (newType) => {
  if (newType === 'essay') {
    // keep only essay questions
    formData.value.questions = formData.value.questions.filter(q => q.type === 'essay')
  } else if (newType === 'multiple-choice') {
    // convert existing questions to multiple-choice and ensure options exist
    formData.value.questions = formData.value.questions.map(q => ({
      ...q,
      type: 'multiple-choice',
      options: q.options && q.options.length ? q.options : ['', '', '', ''],
      correctAnswer: q.correctAnswer || 0
    }))
    // distribute points evenly
    distributePointsAcrossQuestions()
  }
})

// Recompute distribution when maxScore changes
watch(() => formData.value.maxScore, (newMax) => {
  if (formData.value.type === 'multiple-choice') {
    distributePointsAcrossQuestions()
  }
})

// Watch questions length/content changes to keep distribution in sync for MCQ
watch(() => formData.value.questions.length, (len) => {
  if (formData.value.type === 'multiple-choice') {
    distributePointsAcrossQuestions()
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  position: relative;
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 2px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px 20px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.btn-close {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

.form-section {
  margin-bottom: 32px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 20px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.required {
  color: #ef4444;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.small {
  width: 120px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.btn-add-question {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.btn-add-question:hover {
  background: #2563eb;
}

/* Floating add question button */
.floating-add-question {
  position: absolute;
  right: 20px;
  bottom: 92px; /* sits above footer */
  z-index: 1200;
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  box-shadow: 0 10px 30px rgba(59,130,246,0.2);
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s;
}

.floating-add-question:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 36px rgba(59,130,246,0.26);
}

@media (max-width: 768px) {
  .floating-add-question { right: 16px; bottom: 110px; }
}

/* Footer add-question button */
.btn-add-question-footer {
  padding: 8px 14px;
  background: #eef2ff;
  color: #3730a3;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.btn-add-question-footer i { color: #4f46e5; }

.btn-add-question-footer:hover { background: #e0e7ff; }

.empty-questions {
  text-align: center;
  padding: 40px 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px dashed #e5e7eb;
  color: #9ca3af;
}

.empty-questions i {
  font-size: 48px;
  margin-bottom: 12px;
  opacity: 0.5;
}

.empty-questions p {
  margin: 0;
  font-size: 14px;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-item {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: #f9fafb;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.question-number {
  font-weight: 700;
  color: #1f2937;
  font-size: 16px;
}

.question-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.question-type-select {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  background: white;
}

.btn-remove {
  padding: 6px 10px;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #fecaca;
}

.question-body {
  background: white;
  padding: 16px;
  border-radius: 8px;
}

.options-section {
  margin-top: 16px;
}

.options-section label {
  display: block;
  margin-bottom: 12px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.option-radio {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.option-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.option-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.btn-remove-option {
  width: 28px;
  height: 28px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove-option:hover {
  background: #fecaca;
}

.btn-add-option {
  padding: 6px 12px;
  background: #f3f4f6;
  color: #374151;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.btn-add-option:hover {
  background: #e5e7eb;
}

.total-points {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f0f9ff;
  border: 2px solid #bfdbfe;
  border-radius: 10px;
  margin-top: 20px;
  font-size: 14px;
}

.total-points strong {
  color: #1e40af;
  font-size: 16px;
}

.warning-text {
  color: #d97706;
  font-weight: 600;
  font-size: 13px;
}

.modal-footer {
  padding: 20px 32px;
  border-top: 2px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f9fafb;
  border-radius: 0 0 20px 20px;
}

.btn-cancel,
.btn-save {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-save {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Delete / destructive button (red) */
.btn-danger {
  padding: 8px 14px;
  border: none;
  border-radius: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 6px 18px rgba(220, 38, 38, 0.18);
}

.btn-danger i {
  width: 18px;
  text-align: center;
}

.btn-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 26px rgba(220, 38, 38, 0.22);
}

.btn-danger:active {
  transform: translateY(0);
  box-shadow: 0 6px 14px rgba(220, 38, 38, 0.18);
}

/* Adjust delete button to be rectangular */
.btn-danger.btn-danger-icon {
  width: auto;
  height: 44px;
  padding: 0 16px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-danger.btn-danger-icon i {
  font-size: 16px;
  line-height: 1;
}

/* ensure spacing in footer when icon-only used */
.modal-footer { gap: 10px; }

/* Confirmation Dialog */
.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.confirmation-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 550px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.confirmation-header {
  padding: 24px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 2px solid #bfdbfe;
}

.confirmation-header i {
  font-size: 32px;
  color: #3b82f6;
}

.confirmation-header h3 {
  margin: 0;
  font-size: 20px;
  color: #1e40af;
  font-weight: 700;
}

.confirmation-body {
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
}

.confirm-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.confirm-section:last-of-type {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.confirm-section h4 {
  margin: 0 0 12px;
  font-size: 15px;
  font-weight: 700;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.confirm-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f3f4f6;
}

.confirm-row:last-child {
  border-bottom: none;
}

.confirm-row .label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.confirm-row .value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
}

.type-pill {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.type-pill.essay {
  background: #dbeafe;
  color: #1e40af;
}

.type-pill.multiple-choice {
  background: #d1fae5;
  color: #065f46;
}

.type-pill.mixed {
  background: #fce7f3;
  color: #9f1239;
}

.question-summary {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
}

.summary-item i {
  color: #3b82f6;
  font-size: 16px;
}

.summary-item.total {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  font-weight: 700;
  color: #92400e;
}

.summary-item.total i {
  color: #d97706;
}

.confirm-warning {
  margin-top: 20px;
  padding: 16px;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.confirm-warning i {
  color: #d97706;
  font-size: 20px;
}

.confirm-warning span {
  color: #92400e;
  font-weight: 600;
  font-size: 14px;
}

.confirmation-footer {
  padding: 20px 24px;
  background: #f9fafb;
  border-radius: 0 0 16px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 2px solid #e5e7eb;
}

.btn-confirm-cancel,
.btn-confirm-save {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-confirm-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-confirm-cancel:hover {
  background: #e5e7eb;
}

.btn-confirm-save {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-confirm-save:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-container {
    max-width: 100%;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-header,
  .modal-footer {
    border-radius: 0;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .modal-body {
    padding: 20px;
  }
}
</style>
