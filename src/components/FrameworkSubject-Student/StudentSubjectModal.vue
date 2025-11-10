<template>
  <Teleport to="body">
    <div v-if="isVisible" class="modal-overlay" @click="closeModal">
      <div class="subject-modal" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="subject-code">{{ subject?.code }}</div>
            <div class="header-text">
              <h2>{{ subject?.name }}</h2>
              <p v-if="subject?.englishName" class="english-name">{{ subject?.englishName }}</p>
            </div>
          </div>
          <div class="header-actions">
            <div v-if="subject?.isCompleted" class="completion-badge">
              <i class="fas fa-check-circle"></i>
              <span>Đã hoàn thành</span>
            </div>
            <div v-else-if="subject?.isCurrent" class="current-badge">
              <i class="fas fa-play-circle"></i>
              <span>Đang học</span>
            </div>
            <button @click="closeModal" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Subject Info Cards -->
          <div class="info-cards">
            <div class="info-card credits-card">
              <div class="card-icon">
                <i class="fas fa-calculator"></i>
              </div>
              <div class="card-content">
                <h4>{{ subject?.credits }} tín chỉ</h4>
                <p>Khối lượng học tập</p>
              </div>
            </div>

            <div class="info-card semester-card">
              <div class="card-icon">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <div class="card-content">
                <h4>HK{{ subject?.semester }} - N{{ subject?.academicYear }}</h4>
                <p>Thời gian học</p>
              </div>
            </div>

            <div class="info-card type-card">
              <div class="card-icon">
                <i :class="getTypeIcon(subject?.type)"></i>
              </div>
              <div class="card-content">
                <h4>{{ getTypeLabel(subject?.type) }}</h4>
                <p>Loại môn học</p>
              </div>
            </div>

            <div v-if="subject?.grade" class="info-card grade-card">
              <div class="card-icon">
                <i class="fas fa-star"></i>
              </div>
              <div class="card-content">
                <h4>{{ subject?.grade }}/10</h4>
                <p class="grade-label" :class="getGradeStatus(subject?.grade)">
                  {{ getGradeLabel(subject?.grade) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Prerequisites -->
          <div v-if="subject?.prerequisites && subject.prerequisites.length > 0" class="section">
            <h3 class="section-title">
              <i class="fas fa-link"></i>
              Môn tiên quyết
            </h3>
            <div class="prerequisites-list">
              <div
                v-for="prereq in subject.prerequisites"
                :key="prereq"
                class="prerequisite-item"
              >
                <span class="prereq-code">{{ prereq }}</span>
                <span class="prereq-name">{{ getPrerequisiteName(prereq) }}</span>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div v-if="subject?.description" class="section">
            <h3 class="section-title">
              <i class="fas fa-info-circle"></i>
              Mô tả môn học
            </h3>
            <div class="description-content">
              <p>{{ subject.description }}</p>
            </div>
          </div>

          <!-- Content -->
          <div v-if="subject?.content" class="section">
            <h3 class="section-title">
              <i class="fas fa-book-open"></i>
              Nội dung chi tiết
            </h3>
            <div class="content-details">
              <p>{{ subject.content }}</p>
            </div>
          </div>

          <!-- Learning Outcomes -->
          <div class="section">
            <h3 class="section-title">
              <i class="fas fa-target"></i>
              Mục tiêu học tập
            </h3>
            <div class="learning-outcomes">
              <ul>
                <li>Hiểu được các khái niệm cơ bản của môn học</li>
                <li>Áp dụng kiến thức vào thực tế</li>
                <li>Phát triển kỹ năng tư duy logic</li>
                <li>Chuẩn bị nền tảng cho các môn học tiếp theo</li>
              </ul>
            </div>
          </div>

          <!-- Assessment Methods -->
          <div class="section">
            <h3 class="section-title">
              <i class="fas fa-clipboard-check"></i>
              Phương pháp đánh giá
            </h3>
            <div class="assessment-methods">
              <div class="assessment-item">
                <div class="assessment-type">Điểm chuyên cần</div>
                <div class="assessment-weight">10%</div>
              </div>
              <div class="assessment-item">
                <div class="assessment-type">Bài tập / Thực hành</div>
                <div class="assessment-weight">20%</div>
              </div>
              <div class="assessment-item">
                <div class="assessment-type">Kiểm tra giữa kỳ</div>
                <div class="assessment-weight">30%</div>
              </div>
              <div class="assessment-item">
                <div class="assessment-type">Thi cuối kỳ</div>
                <div class="assessment-weight">40%</div>
              </div>
            </div>
          </div>

          <!-- Grade Details (if completed) -->
          <div v-if="subject?.isCompleted && subject?.grade" class="section">
            <h3 class="section-title">
              <i class="fas fa-chart-line"></i>
              Chi tiết điểm số
            </h3>
            <div class="grade-details">
              <div class="grade-breakdown">
                <div class="grade-item">
                  <span class="grade-type">Chuyên cần:</span>
                  <span class="grade-value">9.0</span>
                </div>
                <div class="grade-item">
                  <span class="grade-type">Bài tập:</span>
                  <span class="grade-value">{{ Math.max(subject.grade - 1, 5) }}</span>
                </div>
                <div class="grade-item">
                  <span class="grade-type">Giữa kỳ:</span>
                  <span class="grade-value">{{ Math.max(subject.grade - 0.5, 5) }}</span>
                </div>
                <div class="grade-item">
                  <span class="grade-type">Cuối kỳ:</span>
                  <span class="grade-value">{{ subject.grade }}</span>
                </div>
                <div class="grade-item final">
                  <span class="grade-type">Điểm tổng kết:</span>
                  <span class="grade-value final-grade">{{ subject.grade }}</span>
                </div>
              </div>
              
              <div v-if="subject?.completedDate" class="completion-info">
                <div class="completion-date">
                  <i class="fas fa-calendar-check"></i>
                  <span>Hoàn thành: {{ formatDate(subject.completedDate) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Study Tips -->
          <div class="section">
            <h3 class="section-title">
              <i class="fas fa-lightbulb"></i>
              Gợi ý học tập
            </h3>
            <div class="study-tips">
              <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <span>Đọc kỹ tài liệu trước khi đến lớp</span>
              </div>
              <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <span>Tham gia đầy đủ các buổi thực hành</span>
              </div>
              <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <span>Thường xuyên ôn tập và làm bài tập</span>
              </div>
              <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <span>Tham khảo thêm tài liệu bổ sung</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="modal-footer">
          <div class="footer-info">
            <span class="major-info">
              <i class="fas fa-graduation-cap"></i>
              Ngành: {{ studentMajor }}
            </span>
          </div>
          <div class="footer-actions">
            <button @click="closeModal" class="btn-close">
              <i class="fas fa-times"></i>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  subject: {
    type: Object,
    default: null
  },
  studentMajor: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

// Methods
const closeModal = () => {
  emit('close')
}

const getTypeIcon = (type) => {
  const icons = {
    'required': 'fas fa-star',
    'elective': 'fas fa-list-ul',
    'specialization': 'fas fa-graduation-cap'
  }
  return icons[type] || 'fas fa-book'
}

const getTypeLabel = (type) => {
  const labels = {
    'required': 'Bắt buộc',
    'elective': 'Tự chọn',
    'specialization': 'Chuyên ngành'
  }
  return labels[type] || type
}

const getGradeStatus = (grade) => {
  if (grade >= 8.5) return 'excellent'
  if (grade >= 7.0) return 'good'
  if (grade >= 5.5) return 'average'
  if (grade >= 4.0) return 'poor'
  return 'fail'
}

const getGradeLabel = (grade) => {
  if (grade >= 8.5) return 'Xuất sắc'
  if (grade >= 7.0) return 'Khá'
  if (grade >= 5.5) return 'Trung bình'
  if (grade >= 4.0) return 'Yếu'
  return 'Kém'
}

const getPrerequisiteName = (code) => {
  // Mock data for prerequisite names
  const prereqNames = {
    'IT101': 'Nhập môn CNTT',
    'MATH101': 'Toán cao cấp A1',
    'IT102': 'Toán rời rạc',
    'IT201': 'Cấu trúc dữ liệu',
    'IT202': 'Lập trình hướng đối tượng'
  }
  return prereqNames[code] || 'Môn tiên quyết'
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.subject-modal {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Modal Header */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1;
}

.subject-code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 700;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 12px;
  border-radius: 8px;
  flex-shrink: 0;
}

.header-text h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
}

.english-name {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
  font-style: italic;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.completion-badge,
.current-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Modal Body */
.modal-body {
  padding: 24px;
  max-height: calc(90vh - 200px);
  overflow-y: auto;
}

.info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: white;
  flex-shrink: 0;
}

.credits-card .card-icon {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.semester-card .card-icon {
  background: linear-gradient(135deg, #06b6d4, #22d3ee);
}

.type-card .card-icon {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.grade-card .card-icon {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.card-content h4 {
  margin: 0 0 2px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
}

.card-content p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.grade-label {
  font-size: 12px !important;
  font-weight: 600 !important;
  padding: 2px 6px;
  border-radius: 4px;
}

.grade-label.excellent {
  background: rgba(16, 185, 129, 0.1);
  color: #059669 !important;
}

.grade-label.good {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6 !important;
}

.grade-label.average {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706 !important;
}

/* Sections */
.section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  padding-bottom: 8px;
  border-bottom: 2px solid #e5e7eb;
}

.section-title i {
  color: #3b82f6;
}

/* Prerequisites */
.prerequisites-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.prerequisite-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.prereq-code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 700;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.prereq-name {
  color: #374151;
  font-weight: 500;
}

/* Content */
.description-content,
.content-details {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
}

.description-content p,
.content-details p {
  margin: 0;
  line-height: 1.6;
  color: #374151;
}

/* Learning Outcomes */
.learning-outcomes ul {
  margin: 0;
  padding-left: 20px;
  color: #374151;
}

.learning-outcomes li {
  margin-bottom: 8px;
  line-height: 1.5;
}

/* Assessment Methods */
.assessment-methods {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.assessment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.assessment-type {
  font-weight: 500;
  color: #374151;
}

.assessment-weight {
  font-weight: 700;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

/* Grade Details */
.grade-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.grade-breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grade-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.grade-item.final {
  background: rgba(59, 130, 246, 0.05);
  border-color: #3b82f6;
  font-weight: 600;
}

.grade-type {
  color: #374151;
  font-weight: 500;
}

.grade-value {
  font-weight: 700;
  color: #1f2937;
}

.final-grade {
  color: #3b82f6;
  font-size: 16px;
}

.completion-info {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.completion-date {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #059669;
  font-weight: 500;
  font-size: 14px;
}

/* Study Tips */
.study-tips {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 8px;
  border-left: 4px solid #10b981;
}

.tip-item i {
  color: #10b981;
  font-size: 14px;
}

.tip-item span {
  color: #374151;
  font-weight: 500;
  line-height: 1.4;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.footer-info {
  display: flex;
  align-items: center;
}

.major-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
}

.major-info i {
  color: #3b82f6;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-close {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-close:hover {
  border-color: #d1d5db;
  color: #374151;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .subject-modal {
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-content {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .info-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .modal-footer {
    padding: 16px 20px;
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .footer-actions {
    width: 100%;
  }
  
  .btn-close {
    width: 100%;
    justify-content: center;
  }
}

/* Custom scrollbar */
.modal-body::-webkit-scrollbar {
  width: 6px;
}

.modal-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.modal-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>