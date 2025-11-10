<template>
  <div class="modal-overlay" @click.self="close">
    <div class="modal-container">
      <div class="modal-header">
        <div class="header-content">
          <h2>{{ assignment.title }}</h2>
          <span :class="['status-badge', assignment.studentStatus]">
            {{ getStatusLabel(assignment.studentStatus) }}
          </span>
        </div>
        <button @click="close" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="modal-body">
  <!-- Assignment Info -->
  <div v-if="lockedReason !== 'notOpen'" class="info-section">
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
                <span class="info-value">{{ formatDateTime(assignment.deadline) }}</span>
              </div>
            </div>
            <div class="info-card">
              <i class="fas fa-star"></i>
              <div class="info-content">
                <span class="info-label">Điểm tối đa</span>
                <span class="info-value">{{ assignment.maxScore }}</span>
              </div>
            </div>
            <div class="info-card">
              <i class="fas fa-clock"></i>
              <div class="info-content">
                <span class="info-label">Còn lại</span>
                <span :class="['info-value', getTimeRemainingClass()]">
                  {{ getTimeRemaining() }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <!-- (removed duplicate compact locked banner) -->

        <!-- In-app confirmation dialog -->
        <div v-if="showConfirm" class="confirm-overlay" @click.self="cancelConfirm">
          <div class="confirm-dialog">
            <div class="confirm-header">
              <h3>{{ confirmTitle }}</h3>
            </div>
            <div class="confirm-body">
              <p>{{ confirmMessage }}</p>
            </div>
            <div class="confirm-actions">
              <button class="btn btn-cancel" @click="cancelConfirm">Hủy</button>
              <button v-if="confirmMode === 'submit'" class="btn btn-submit" @click="proceedConfirm()">Xác nhận nộp</button>

              <div v-else-if="confirmMode === 'close'" class="close-actions">
                <button class="btn btn-save" @click="proceedConfirm('save')">Lưu & Đóng</button>
                <button class="btn btn-submit" @click="proceedConfirm('no-save')">Đóng không lưu</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Locked Banner (Not Open or Overdue) -->
        <div v-if="lockedReason" class="locked-banner">
          <div v-if="lockedReason === 'notOpen'" class="locked-content not-open">
            <i class="fas fa-lock"></i>
            <div class="locked-message">
              <h4>Bài tập chưa mở</h4>
              <p>Bài tập này chưa đến thời gian mở. Bạn chỉ có thể xem nội dung nhưng không thể làm bài.</p>
              <p v-if="assignment.openAt" class="open-time">
                <i class="fas fa-clock"></i>
                Thời gian mở: {{ formatDateTime(assignment.openAt) }}
              </p>
            </div>
          </div>
          <div v-else-if="lockedReason === 'overdue'" class="locked-content overdue">
            <i class="fas fa-exclamation-triangle"></i>
            <div class="locked-message">
              <h4>Bài tập đã quá hạn</h4>
              <p>Thời hạn nộp bài đã kết thúc. Bạn không thể làm bài hoặc nộp bài nữa.</p>
              <p class="deadline-time">
                <i class="fas fa-calendar-times"></i>
                Hạn nộp: {{ formatDateTime(assignment.deadline) }}
              </p>
            </div>
          </div>
        </div>

  <!-- Description -->
  <div v-if="assignment.description && lockedReason !== 'notOpen'" class="description-section">
          <h3 class="section-title">
            <i class="fas fa-info-circle"></i>
            Mô tả bài tập
          </h3>
          <p class="description-text">{{ assignment.description }}</p>
        </div>

  <!-- Score Display (if graded) -->
  <div v-if="assignment.studentStatus === 'graded' && assignment.studentScore !== null && lockedReason !== 'notOpen'" class="score-display-section">
          <div class="score-card">
            <i class="fas fa-trophy"></i>
            <div class="score-info">
              <span class="score-label">Điểm của bạn</span>
              <span class="score-value">{{ assignment.studentScore }}/{{ assignment.maxScore }}</span>
            </div>
            <div class="score-progress">
              <div 
                class="score-bar"
                :style="{ 
                  width: (assignment.studentScore / assignment.maxScore * 100) + '%',
                  background: getScoreColor(assignment.studentScore / assignment.maxScore * 100)
                }"
              ></div>
            </div>
          </div>
          <div v-if="assignment.feedback" class="feedback-section">
            <h4>
              <i class="fas fa-comment-dots"></i>
              Nhận xét của giảng viên
            </h4>
            <p>{{ assignment.feedback }}</p>
          </div>
        </div>

  <!-- Questions Section -->
  <div v-if="lockedReason !== 'notOpen'" class="questions-section">
          <h3 class="section-title">
            <i class="fas fa-list-ol"></i>
            Câu hỏi ({{ assignment.questions?.length || 0 }})
          </h3>

          <div 
            v-for="(question, index) in assignment.questions" 
            :key="question.id"
            class="question-card"
          >
            <div class="question-header">
              <span class="question-number">Câu {{ index + 1 }}</span>
              <span class="question-points">{{ question.points }} điểm</span>
            </div>

            <div class="question-content">
              <p class="question-text">{{ question.content }}</p>
            </div>

            <!-- Multiple Choice Question -->
            <div v-if="question.type === 'multiple-choice'" class="answer-section">
              <div class="options-list">
                <label 
                  v-for="(option, optIndex) in question.options" 
                  :key="optIndex"
                  :class="[
                    'option-item',
                    { 
                      'selected': studentAnswers[question.id] === option,
                      'correct': assignment.studentStatus === 'graded' && option === question.correctAnswer,
                      'incorrect': assignment.studentStatus === 'graded' && studentAnswers[question.id] === option && option !== question.correctAnswer,
                      'disabled': assignment.studentStatus === 'submitted' || assignment.studentStatus === 'graded'
                    }
                  ]"
                >
                      <input 
                        type="radio" 
                        :name="'question-' + question.id"
                        :value="option"
                        v-model="studentAnswers[question.id]"
                        :disabled="assignment.studentStatus === 'submitted' || assignment.studentStatus === 'graded' || lockedReason"
                      />
                  <span class="option-text">{{ option }}</span>
                  <i 
                    v-if="assignment.studentStatus === 'graded' && option === question.correctAnswer"
                    class="fas fa-check-circle correct-icon"
                  ></i>
                  <i 
                    v-if="assignment.studentStatus === 'graded' && studentAnswers[question.id] === option && option !== question.correctAnswer"
                    class="fas fa-times-circle incorrect-icon"
                  ></i>
                </label>
              </div>
            </div>

            <!-- Essay Question -->
            <div v-else-if="question.type === 'essay'" class="answer-section">
              <div class="essay-answer">
                <textarea 
                  v-model="studentAnswers[question.id]"
                  :disabled="assignment.studentStatus === 'submitted' || assignment.studentStatus === 'graded' || lockedReason"
                  placeholder="Nhập câu trả lời của bạn..."
                  rows="6"
                  class="essay-textarea"
                ></textarea>

                <!-- File Upload for Essay -->
                <div class="file-upload-section">
                  <h4 class="upload-title">
                    <i class="fas fa-paperclip"></i>
                    Tải tệp đính kèm (Word, PDF)
                  </h4>
                  
                  <!-- Uploaded Files Display -->
                  <div v-if="studentFiles[question.id] && studentFiles[question.id].length > 0" class="uploaded-files">
                    <div 
                      v-for="(file, fileIndex) in studentFiles[question.id]" 
                      :key="fileIndex"
                      class="file-item"
                    >
                      <div class="file-info">
                        <i :class="getFileIcon(file.name)"></i>
                        <div class="file-details">
                          <span class="file-name">{{ file.name }}</span>
                          <span class="file-size">{{ formatFileSize(file.size) }}</span>
                        </div>
                      </div>
                      <button 
                        v-if="assignment.studentStatus !== 'submitted' && assignment.studentStatus !== 'graded' && !lockedReason"
                        @click="removeFile(question.id, fileIndex)"
                        class="btn-remove-file"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                      <a 
                        v-if="(assignment.studentStatus === 'submitted' || assignment.studentStatus === 'graded') && file.url"
                        :href="file.url"
                        download
                      >
                        <i class="fas fa-download"></i>
                      </a>
                    </div>
                  </div>

                  <!-- Upload Button -->
                  <div 
                    v-if="assignment.studentStatus !== 'submitted' && assignment.studentStatus !== 'graded' && !lockedReason"
                    class="upload-area"
                  >
                    <input 
                      type="file" 
                      :id="'file-' + question.id"
                      @change="handleFileUpload($event, question.id)"
                      accept=".doc,.docx,.pdf"
                      multiple
                      class="file-input"
                    />
                    <label :for="'file-' + question.id" class="upload-label">
                      <i class="fas fa-cloud-upload-alt"></i>
                      <span>Chọn tệp hoặc kéo thả vào đây</span>
                      <span class="upload-hint">Hỗ trợ: .doc, .docx, .pdf (tối đa 10MB/tệp)</span>
                    </label>
                  </div>
                </div>

                <!-- Grading feedback for essay -->
                <div v-if="assignment.studentStatus === 'graded' && question.earnedPoints !== undefined" class="essay-score">
                  <div class="earned-points">
                    <i class="fas fa-check-circle"></i>
                    <span>Điểm đạt được: {{ question.earnedPoints }}/{{ question.points }}</span>
                  </div>
                  <div v-if="question.feedback" class="question-feedback">
                    <i class="fas fa-comment"></i>
                    <span>{{ question.feedback }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <div class="footer-info">
          <span v-if="assignment.studentStatus === 'submitted'" class="submit-time">
            <i class="fas fa-check"></i>
            Đã nộp lúc: {{ formatDateTime(assignment.submittedAt) }}
          </span>
          <span v-else-if="assignment.studentStatus === 'graded'" class="graded-time">
            <i class="fas fa-clipboard-check"></i>
            Đã chấm lúc: {{ formatDateTime(assignment.gradedAt) }}
          </span>
        </div>

        <div class="footer-actions">
          <button @click="close" class="btn-cancel">
            <i class="fas fa-times"></i>
            {{ assignment.studentStatus === 'notStarted' || assignment.studentStatus === 'inProgress' ? 'Hủy' : 'Đóng' }}
          </button>

          <button 
            v-if="(assignment.studentStatus === 'notStarted' || assignment.studentStatus === 'inProgress') && !lockedReason"
            @click="saveDraft"
            class="btn-save"
          >
            <i class="fas fa-save"></i>
            Lưu nháp
          </button>

          <button 
            v-if="(assignment.studentStatus === 'notStarted' || assignment.studentStatus === 'inProgress') && !lockedReason"
            @click="submitAssignment"
            class="btn-submit"
            :disabled="!canSubmit || lockedReason"
          >
            <i class="fas fa-paper-plane"></i>
            Nộp bài
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

const props = defineProps({
  assignment: {
    type: Object,
    required: true
  },
  lockedReason: {
    type: String,
    default: '' // '', 'notOpen', 'overdue'
  }
});

const emit = defineEmits(['close', 'save-draft', 'submit']);

const studentAnswers = ref({});
const studentFiles = ref({});

onMounted(() => {
  // Load existing answers if any
  if (props.assignment.studentAnswers) {
    studentAnswers.value = { ...props.assignment.studentAnswers };
  }
  if (props.assignment.studentFiles) {
    studentFiles.value = { ...props.assignment.studentFiles };
  }
});

const canSubmit = computed(() => {
  // Check if all questions have answers
  return props.assignment.questions?.every(q => {
    if (q.type === 'multiple-choice') {
      return studentAnswers.value[q.id];
    } else if (q.type === 'essay') {
      return studentAnswers.value[q.id]?.trim() || studentFiles.value[q.id]?.length > 0;
    }
    return true;
  });
});

const handleFileUpload = (event, questionId) => {
  const files = Array.from(event.target.files);
  const validFiles = [];

  files.forEach(file => {
    // Validate file type
    const validTypes = ['.doc', '.docx', '.pdf'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validTypes.includes(fileExt)) {
      alert(`Tệp ${file.name} không được hỗ trợ. Chỉ chấp nhận .doc, .docx, .pdf`);
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert(`Tệp ${file.name} quá lớn. Kích thước tối đa là 10MB`);
      return;
    }

    validFiles.push({
      name: file.name,
      size: file.size,
      type: file.type,
      file: file,
      url: URL.createObjectURL(file)
    });
  });

  if (validFiles.length > 0) {
    if (!studentFiles.value[questionId]) {
      studentFiles.value[questionId] = [];
    }
    studentFiles.value[questionId].push(...validFiles);
  }

  // Reset input
  event.target.value = '';
};

const removeFile = (questionId, fileIndex) => {
  if (studentFiles.value[questionId]) {
    studentFiles.value[questionId].splice(fileIndex, 1);
    if (studentFiles.value[questionId].length === 0) {
      delete studentFiles.value[questionId];
    }
  }
};

const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'fas fa-file-pdf';
  if (ext === 'doc' || ext === 'docx') return 'fas fa-file-word';
  return 'fas fa-file';
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const saveDraft = () => {
  emit('save-draft', {
    answers: studentAnswers.value,
    files: studentFiles.value
  });
};

// In-app confirmation states
const showConfirm = ref(false);
const confirmMode = ref(''); // 'submit' | 'close'
const confirmTitle = ref('');
const confirmMessage = ref('');

const submitAssignment = () => {
  if (!canSubmit.value) {
    // Use in-app alert area; for now simple alert to keep UX immediate
    alert('Vui lòng trả lời tất cả các câu hỏi trước khi nộp bài');
    return;
  }

  // Open custom confirmation dialog
  confirmMode.value = 'submit';
  confirmTitle.value = 'Xác nhận nộp bài';
  confirmMessage.value = 'Bạn có chắc chắn muốn nộp bài? Sau khi nộp bạn sẽ không thể chỉnh sửa.';
  showConfirm.value = true;
};

const close = () => {
  // If the assignment is locked (not open yet or overdue), just close the modal (view-only)
  if (props.lockedReason) {
    emit('close');
    return;
  }

  if (props.assignment.studentStatus === 'inProgress' || props.assignment.studentStatus === 'notStarted') {
    // Ask whether to save draft or close without saving using custom modal
    confirmMode.value = 'close';
    confirmTitle.value = 'Bạn có muốn lưu nháp trước khi đóng?';
    confirmMessage.value = 'Bạn có thể lưu nháp để tiếp tục làm sau hoặc đóng mà không lưu.';
    showConfirm.value = true;
    return;
  }

  emit('close');
};

const cancelConfirm = () => {
  showConfirm.value = false;
};

const proceedConfirm = (action) => {
  // action: undefined for submit; 'save' or 'no-save' for close
  if (confirmMode.value === 'submit') {
    // perform submit
    emit('submit', {
      answers: studentAnswers.value,
      files: studentFiles.value,
      submittedAt: new Date().toISOString()
    });
    showConfirm.value = false;
    return;
  }

  if (confirmMode.value === 'close') {
    if (action === 'save') {
      saveDraft();
      showConfirm.value = false;
      emit('close');
      return;
    }
    // no-save
    showConfirm.value = false;
    emit('close');
    return;
  }
};

const getStatusLabel = (status) => {
  const labels = {
    notStarted: 'Chưa làm',
    inProgress: 'Đang làm',
    submitted: 'Đã nộp',
    graded: 'Đã chấm'
  };
  return labels[status] || status;
};

const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN');
};

const getTimeRemaining = () => {
  const now = new Date();
  const deadline = new Date(props.assignment.deadline);
  const diffTime = deadline - now;
  
  if (diffTime < 0) {
    return 'Đã quá hạn';
  }

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} ngày ${diffHours} giờ`;
  } else if (diffHours > 0) {
    return `${diffHours} giờ ${diffMinutes} phút`;
  } else {
    return `${diffMinutes} phút`;
  }
};

const getTimeRemainingClass = () => {
  const now = new Date();
  const deadline = new Date(props.assignment.deadline);
  const diffTime = deadline - now;
  const diffHours = diffTime / (1000 * 60 * 60);

  if (diffTime < 0) return 'overdue';
  if (diffHours < 24) return 'urgent';
  return '';
};

const getScoreColor = (percentage) => {
  if (percentage >= 80) return 'linear-gradient(90deg, #10b981 0%, #059669 100%)';
  if (percentage >= 50) return 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)';
  return 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)';
};
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
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 24px 32px;
  border-bottom: 2px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.header-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.header-content h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.status-badge {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.notStarted {
  background: #f1f5f9;
  color: #64748b;
}

.status-badge.inProgress {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.submitted {
  background: #cffafe;
  color: #0891b2;
}

.status-badge.graded {
  background: #d1fae5;
  color: #059669;
}

.btn-close {
  background: #f1f5f9;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #64748b;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-close:hover {
  background: #e2e8f0;
  color: #475569;
}

.modal-body {
  padding: 32px;
  overflow-y: auto;
  flex: 1;
}

.info-section {
  margin-bottom: 32px;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-card {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-card i {
  font-size: 24px;
  color: #667eea;
}

.info-content {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.info-value {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.info-value.overdue {
  color: #dc2626;
}

.info-value.urgent {
  color: #f59e0b;
}

.description-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 12px;
}

/* Locked Banner Styles */
.locked-banner {
  margin-bottom: 24px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.locked-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 24px;
  border-radius: 12px;
  border: 2px solid;
}

.locked-content.not-open {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #f59e0b;
  color: #92400e;
}

.locked-content.overdue {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #ef4444;
  color: #991b1b;
}

.locked-content i {
  font-size: 28px;
  flex-shrink: 0;
  margin-top: 4px;
}

.locked-content.not-open i {
  color: #d97706;
}

.locked-content.overdue i {
  color: #dc2626;
}

.locked-message {
  flex: 1;
}

.locked-message h4 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px 0;
}

.locked-message p {
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 8px 0;
  opacity: 0.9;
}

.locked-message p:last-child {
  margin-bottom: 0;
}

.open-time,
.deadline-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-top: 12px !important;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.open-time i,
.deadline-time i {
  font-size: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: #667eea;
}

.description-text {
  font-size: 14px;
  color: #475569;
  line-height: 1.7;
  margin: 0;
}

.score-display-section {
  margin-bottom: 32px;
}

.score-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 24px;
  border-radius: 12px;
  color: white;
  margin-bottom: 16px;
}

.score-card i {
  font-size: 32px;
  margin-bottom: 12px;
}

.score-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.score-label {
  font-size: 14px;
  opacity: 0.9;
}

.score-value {
  font-size: 32px;
  font-weight: 700;
}

.score-progress {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.score-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.feedback-section {
  background: #f8fafc;
  padding: 16px;
  border-radius: 12px;
}

.feedback-section h4 {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.feedback-section p {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.questions-section {
  margin-bottom: 24px;
}

.question-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  border: 2px solid transparent;
  transition: all 0.3s;
}

.question-card:hover {
  border-color: #e2e8f0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.question-number {
  background: #667eea;
  color: white;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
}

.question-points {
  background: #fef3c7;
  color: #d97706;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

.question-content {
  margin-bottom: 20px;
}

.question-text {
  font-size: 15px;
  color: #1e293b;
  line-height: 1.7;
  font-weight: 500;
  margin: 0;
}

.answer-section {
  margin-top: 16px;
}

.options-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  background: white;
  padding: 16px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s;
  position: relative;
}

.option-item:hover:not(.disabled) {
  border-color: #667eea;
  background: #f8fafc;
}

.option-item.selected {
  border-color: #667eea;
  background: #ede9fe;
}

.option-item.correct {
  border-color: #10b981;
  background: #d1fae5;
}

.option-item.incorrect {
  border-color: #ef4444;
  background: #fee2e2;
}

.option-item.disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.option-item input[type="radio"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #667eea;
  flex-shrink: 0;
}

.option-item.disabled input[type="radio"] {
  cursor: not-allowed;
}

.option-text {
  flex: 1;
  font-size: 14px;
  color: #1e293b;
}

.correct-icon,
.incorrect-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.correct-icon {
  color: #10b981;
}

.incorrect-icon {
  color: #ef4444;
}

.essay-answer {
  background: white;
  border-radius: 10px;
  padding: 16px;
}

.essay-textarea {
  width: 100%;
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  color: #1e293b;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.essay-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.essay-textarea:disabled {
  background: #f8fafc;
  cursor: not-allowed;
}

.file-upload-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

.upload-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.uploaded-files {
  margin-bottom: 16px;
}

.file-item {
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.file-info i {
  font-size: 24px;
  color: #667eea;
  flex-shrink: 0;
}

.file-info i.fa-file-pdf {
  color: #dc2626;
}

.file-info i.fa-file-word {
  color: #2563eb;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.file-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: 12px;
  color: #64748b;
}

.btn-remove-file,
.btn-download-file {
  background: #fee2e2;
  color: #dc2626;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.btn-download-file {
  background: #dbeafe;
  color: #2563eb;
  text-decoration: none;
}

.btn-remove-file:hover {
  background: #fecaca;
}

.btn-download-file:hover {
  background: #bfdbfe;
}

.upload-area {
  position: relative;
}

.file-input {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
}

.upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  background: #f8fafc;
}

.upload-label:hover {
  border-color: #667eea;
  background: #f1f5f9;
}

.upload-label i {
  font-size: 48px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.upload-label span:first-of-type {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
}

.upload-hint {
  font-size: 12px;
  color: #94a3b8;
}

.essay-score {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.earned-points {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #059669;
  margin-bottom: 8px;
}

.question-feedback {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: #64748b;
  line-height: 1.6;
}

.question-feedback i {
  color: #94a3b8;
  margin-top: 2px;
  flex-shrink: 0;
}

.modal-footer {
  padding: 24px 32px;
  border-top: 2px solid #f1f5f9;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.footer-info {
  flex: 1;
}

.submit-time,
.graded-time {
  font-size: 13px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.submit-time i {
  color: #0891b2;
}

.graded-time i {
  color: #059669;
}

.footer-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-cancel,
.btn-save,
.btn-submit {
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
  border: none;
}

.btn-cancel {
  background: #f1f5f9;
  color: #64748b;
}

.btn-cancel:hover {
  background: #e2e8f0;
}

.btn-save {
  background: #cffafe;
  color: #0891b2;
}

.btn-save:hover {
  background: #a5f3fc;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
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

  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 20px;
  }

  .header-content h2 {
    font-size: 20px;
  }

  .info-cards {
    grid-template-columns: 1fr;
  }

  .modal-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .footer-actions {
    width: 100%;
  }

  .btn-cancel,
  .btn-save,
  .btn-submit {
    flex: 1;
    justify-content: center;
  }
}

/* Confirmation dialog styles */
.confirm-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.55);
  z-index: 1100;
}

.confirm-dialog {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
  padding: 18px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
}

.confirm-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #1e293b;
}

.confirm-body p {
  margin: 0 0 12px 0;
  color: #475569;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.close-actions {
  display: flex;
  gap: 10px;
}

.btn-cancel {
  background: #f1f5f9;
  color: #475569;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-save {
  background: #cffafe;
  color: #04516b;
  border: none;
  padding: 8px 14px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
