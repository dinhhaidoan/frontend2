<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ assignment.title }}</h2>
        <button @click="close" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
        <!-- Assignment Info Cards -->
        <div class="info-cards">
          <div class="info-card">
            <i class="fas fa-chalkboard"></i>
            <div class="info-content">
              <span class="info-label">Lớp học</span>
              <span class="info-value">{{ assignment.className }}</span>
            </div>
          </div>
          <div class="info-card">
            <i class="fas fa-calendar"></i>
            <div class="info-content">
              <span class="info-label">Hạn nộp</span>
              <span class="info-value">{{ formatDate(assignment.deadline) }}</span>
            </div>
          </div>
          <div class="info-card">
            <i class="fas fa-star"></i>
            <div class="info-content">
              <span class="info-label">Điểm tối đa</span>
              <span class="info-value">{{ assignment.maxScore }}</span>
            </div>
          </div>
        </div>

        <!-- Type and Status -->
        <div class="badges-row">
          <span :class="['type-badge', assignment.type]">
            <i :class="getTypeIcon(assignment.type)"></i>
            {{ getTypeLabel(assignment.type) }}
          </span>
          <span :class="['status-badge', assignment.status]">
            {{ getStatusLabel(assignment.status) }}
          </span>
        </div>

        <!-- Description -->
        <div v-if="assignment.description" class="section">
          <h3 class="section-title">Mô tả</h3>
          <p class="description">{{ assignment.description }}</p>
        </div>

        <!-- Statistics -->
        <div class="section">
          <h3 class="section-title">Thống kê</h3>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">Tổng số sinh viên</span>
              <span class="stat-value">{{ assignment.totalStudents }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Đã nộp bài</span>
              <span class="stat-value submitted">{{ assignment.submitted }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Đã chấm</span>
              <span class="stat-value graded">{{ assignment.graded }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Điểm trung bình</span>
              <span class="stat-value avg">{{ assignment.avgScore || '--' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Điểm cao nhất</span>
              <span class="stat-value">{{ assignment.maxScoreAchieved || '--' }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">Điểm thấp nhất</span>
              <span class="stat-value">{{ assignment.minScore || '--' }}</span>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div class="section">
          <h3 class="section-title">Tiến độ</h3>
          <div class="progress-item">
            <div class="progress-header">
              <span>Nộp bài</span>
              <span>{{ assignment.submitted }}/{{ assignment.totalStudents }}</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill submit"
                :style="{ width: (assignment.submitted / assignment.totalStudents * 100) + '%' }"
              ></div>
            </div>
          </div>
          <div class="progress-item">
            <div class="progress-header">
              <span>Chấm điểm</span>
              <span>{{ assignment.graded }}/{{ assignment.submitted }}</span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill grade"
                :style="{ width: assignment.submitted > 0 ? (assignment.graded / assignment.submitted * 100) + '%' : '0%' }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Questions -->
        <div class="section">
          <h3 class="section-title">Câu hỏi ({{ assignment.questions.length }})</h3>
          <div class="questions-list">
            <div 
              v-for="(question, index) in assignment.questions" 
              :key="question.id"
              class="question-card"
            >
              <div class="question-header">
                <span class="question-number">Câu {{ index + 1 }}</span>
                <div class="question-meta">
                  <span :class="['question-type-badge', question.type]">
                    {{ question.type === 'essay' ? 'Tự luận' : 'Trắc nghiệm' }}
                  </span>
                  <span class="question-points">{{ question.points }} điểm</span>
                </div>
              </div>
              <p class="question-content">{{ question.content }}</p>
              
              <!-- Multiple Choice Options -->
              <div v-if="question.type === 'multiple-choice' && question.options" class="options-list">
                <div 
                  v-for="(option, optIndex) in question.options" 
                  :key="optIndex"
                  :class="['option', { correct: optIndex === question.correctAnswer }]"
                >
                  <span class="option-letter">{{ String.fromCharCode(65 + optIndex) }}</span>
                  <span class="option-text">{{ option }}</span>
                  <i v-if="optIndex === question.correctAnswer" class="fas fa-check correct-icon"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="close" class="btn-cancel">Đóng</button>
        <button @click="confirmDelete" class="btn-delete">
          <i class="fas fa-trash"></i>
          Xóa
        </button>
        <button @click="editAssignment" class="btn-edit">
          <i class="fas fa-edit"></i>
          Chỉnh sửa
        </button>
        <button @click="gradeAssignment" class="btn-grade">
          <i class="fas fa-check-circle"></i>
          Chấm điểm
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Transition name="fade">
      <div v-if="showDeleteConfirm" class="delete-overlay" @click.self="cancelDelete">
        <div class="delete-dialog">
          <div class="delete-header">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Xác nhận xóa bài tập</h3>
          </div>
          
          <div class="delete-body">
            <p>Bạn có chắc chắn muốn xóa bài tập này không?</p>
            <div class="assignment-info-box">
              <strong>{{ assignment.title }}</strong>
              <span>{{ assignment.className }}</span>
              <div class="info-row">
                <span class="label">Số bài đã nộp:</span>
                <span class="value">{{ assignment.submitted }}/{{ assignment.totalStudents }}</span>
              </div>
              <div class="info-row">
                <span class="label">Số bài đã chấm:</span>
                <span class="value">{{ assignment.graded }}</span>
              </div>
            </div>
            <div class="delete-warning">
              <i class="fas fa-info-circle"></i>
              <span>Tất cả dữ liệu bài tập, bài nộp và điểm số sẽ bị xóa vĩnh viễn!</span>
            </div>
          </div>

          <div class="delete-footer">
            <button @click="cancelDelete" class="btn-delete-cancel">
              <i class="fas fa-times"></i>
              Hủy
            </button>
            <button @click="deleteAssignment" class="btn-delete-confirm">
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
import { ref } from 'vue'

const props = defineProps({
  assignment: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'edit', 'grade', 'delete'])

const showDeleteConfirm = ref(false)

const getTypeLabel = (type) => {
  const labels = {
    'essay': 'Tự luận',
    'multiple-choice': 'Trắc nghiệm',
    'mixed': 'Hỗn hợp'
  }
  return labels[type] || type
}

const getTypeIcon = (type) => {
  const icons = {
    'essay': 'fas fa-pen',
    'multiple-choice': 'fas fa-check-square',
    'mixed': 'fas fa-tasks'
  }
  return icons[type] || 'fas fa-file-alt'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Chờ chấm',
    graded: 'Đã chấm',
    returned: 'Đã trả bài'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const close = () => {
  emit('close')
}

const editAssignment = () => {
  emit('edit', props.assignment)
}

const gradeAssignment = () => {
  emit('grade', props.assignment)
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const deleteAssignment = () => {
  emit('delete', props.assignment)
  showDeleteConfirm.value = false
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
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
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
  flex: 1;
  padding-right: 20px;
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
  flex-shrink: 0;
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

.info-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
}

.info-card i {
  font-size: 28px;
  color: #3b82f6;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.info-value {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.badges-row {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.type-badge {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-badge.essay {
  background: #dbeafe;
  color: #1e40af;
}

.type-badge.multiple-choice {
  background: #d1fae5;
  color: #065f46;
}

.type-badge.mixed {
  background: #fce7f3;
  color: #9f1239;
}

.status-badge {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.status-badge.pending {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.graded {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.returned {
  background: #d1fae5;
  color: #059669;
}

.section {
  margin-bottom: 32px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.description {
  margin: 0;
  color: #374151;
  line-height: 1.6;
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
  border-left: 4px solid #3b82f6;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.stat-item {
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.stat-value.submitted {
  color: #3b82f6;
}

.stat-value.graded {
  color: #059669;
}

.stat-value.avg {
  color: #d97706;
}

.progress-item {
  margin-bottom: 16px;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.progress-bar {
  height: 12px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s;
}

.progress-fill.submit {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.progress-fill.grade {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: #f9fafb;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.question-number {
  font-weight: 700;
  color: #1f2937;
  font-size: 16px;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 10px;
}

.question-type-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.question-type-badge.essay {
  background: #dbeafe;
  color: #1e40af;
}

.question-type-badge.multiple-choice {
  background: #d1fae5;
  color: #065f46;
}

.question-points {
  padding: 4px 10px;
  background: #fef3c7;
  color: #d97706;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.question-content {
  margin: 0 0 16px;
  color: #1f2937;
  font-size: 15px;
  line-height: 1.6;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.option.correct {
  background: #f0fdf4;
  border-color: #86efac;
}

.option-letter {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  border-radius: 50%;
  font-weight: 700;
  color: #1f2937;
  font-size: 13px;
  flex-shrink: 0;
}

.option.correct .option-letter {
  background: #86efac;
  color: #065f46;
}

.option-text {
  flex: 1;
  color: #374151;
  font-size: 14px;
}

.correct-icon {
  color: #059669;
  font-size: 16px;
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
.btn-edit,
.btn-grade {
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

.btn-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-edit {
  background: #f3f4f6;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.btn-edit:hover {
  background: #eff6ff;
}

.btn-grade {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-grade:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-delete {
  background: #ef4444;
  color: white;
  border: none;
}

.btn-delete:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* Delete Confirmation Dialog */
.delete-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.delete-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
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

.delete-header {
  padding: 24px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 2px solid #fca5a5;
}

.delete-header i {
  font-size: 32px;
  color: #dc2626;
}

.delete-header h3 {
  margin: 0;
  font-size: 20px;
  color: #991b1b;
  font-weight: 700;
}

.delete-body {
  padding: 24px;
}

.delete-body p {
  margin: 0 0 16px;
  font-size: 15px;
  color: #374151;
  font-weight: 500;
}

.assignment-info-box {
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
  border-left: 4px solid #ef4444;
  margin-bottom: 16px;
}

.assignment-info-box strong {
  display: block;
  font-size: 16px;
  color: #1f2937;
  margin-bottom: 4px;
  font-weight: 700;
}

.assignment-info-box > span {
  display: block;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid #e5e7eb;
}

.info-row:first-of-type {
  margin-top: 8px;
}

.info-row .label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.info-row .value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 700;
}

.delete-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fef3c7;
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
}

.delete-warning i {
  color: #d97706;
  font-size: 18px;
}

.delete-warning span {
  color: #92400e;
  font-weight: 600;
  font-size: 14px;
}

.delete-footer {
  padding: 20px 24px;
  background: #f9fafb;
  border-radius: 0 0 16px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 2px solid #e5e7eb;
}

.btn-delete-cancel,
.btn-delete-confirm {
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

.btn-delete-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-delete-cancel:hover {
  background: #e5e7eb;
}

.btn-delete-confirm {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-delete-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
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
  .info-cards,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    flex-wrap: wrap;
  }

  .btn-cancel,
  .btn-edit,
  .btn-grade {
    flex: 1;
  }
}
</style>
