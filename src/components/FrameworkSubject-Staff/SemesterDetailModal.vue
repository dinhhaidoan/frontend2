<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="semester-detail-modal" @click.stop>
      <div class="modal-header">
        <div class="header-info">
          <h3>{{ semester?.name }}</h3>
          <span class="semester-status" :class="semester?.status">
            {{ getStatusLabel(semester?.status) }}
          </span>
        </div>
        <button @click="closeModal" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="detail-section">
          <h4><i class="fas fa-info-circle"></i> Thông tin cơ bản</h4>
          <div class="detail-grid">
            <div class="detail-item">
              <label>Tên học kỳ:</label>
              <span>{{ semester?.name }}</span>
            </div>
            <div class="detail-item">
              <label>Thời gian:</label>
              <span>{{ formatDateRange(semester?.startDate, semester?.endDate) }}</span>
            </div>
            <div class="detail-item">
              <label>Số tín chỉ tối đa:</label>
              <span>{{ semester?.maxCredits }} tín chỉ</span>
            </div>
            <div class="detail-item">
              <label>Trạng thái:</label>
              <span class="semester-status" :class="semester?.status">
                {{ getStatusLabel(semester?.status) }}
              </span>
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h4><i class="fas fa-chart-bar"></i> Thống kê</h4>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon subjects">
                <i class="fas fa-book"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ semester?.subjectCount || 0 }}</div>
                <div class="stat-label">Môn học</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon credits">
                <i class="fas fa-calculator"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ calculateTotalCredits(semester) }}</div>
                <div class="stat-label">Tín chỉ hiện tại</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon progress">
                <i class="fas fa-percentage"></i>
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ calculateProgress(semester) }}%</div>
                <div class="stat-label">Hoàn thành</div>
              </div>
            </div>
          </div>
        </div>

        <div class="detail-section" v-if="semester?.subjects?.length > 0">
          <h4><i class="fas fa-list"></i> Danh sách môn học</h4>
          <div class="subjects-list">
            <div v-for="subject in semester?.subjects" :key="subject.id" class="subject-item">
              <div class="subject-code">{{ subject.code }}</div>
              <div class="subject-name">{{ subject.name }}</div>
              <div class="subject-credits">{{ subject.credits }} TC</div>
              <div class="subject-type" :class="subject.type">{{ getSubjectTypeLabel(subject.type) }}</div>
            </div>
          </div>
        </div>

        <div class="detail-section" v-else>
          <h4><i class="fas fa-list"></i> Danh sách môn học</h4>
          <div class="empty-subjects">
            <i class="fas fa-book-open"></i>
            <p>Chưa có môn học nào được phân bổ</p>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="closeModal" class="btn-cancel">
          Đóng
        </button>
        <button @click="handleEdit" class="btn-primary">
          <i class="fas fa-edit"></i>
          Chỉnh sửa
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  semester: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['close', 'edit'])

// Methods
const closeModal = () => {
  emit('close')
}

const handleEdit = () => {
  emit('edit', props.semester)
}

const getStatusLabel = (status) => {
  const labels = {
    'active': 'Đang diễn ra',
    'upcoming': 'Sắp tới',
    'completed': 'Đã kết thúc'
  }
  return labels[status] || status
}

import { formatDateDDMMYYYY } from '@/utils/formatters'

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Chưa xác định'
  const start = formatDateDDMMYYYY(startDate)
  const end = formatDateDDMMYYYY(endDate)
  return `${start} - ${end}`
}

const calculateTotalCredits = (semester) => {
  if (!semester?.subjects) return 0
  return semester.subjects.reduce((total, subject) => total + subject.credits, 0)
}

const calculateProgress = (semester) => {
  if (!semester?.maxCredits) return 0
  const currentCredits = calculateTotalCredits(semester)
  return Math.round((currentCredits / semester.maxCredits) * 100)
}

const getSubjectTypeLabel = (type) => {
  const labels = {
    'required': 'Bắt buộc',
    'elective': 'Tự chọn',
    'specialization': 'Chuyên ngành'
  }
  return labels[type] || type
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
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.semester-detail-modal {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: white;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header-info h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.header-info .semester-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.header-info .semester-status.completed {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}
.header-info .semester-status.upcoming {
  background: rgba(255, 255, 255, 0.12);
  color: white;
}
.header-info .semester-status.active {
  background: rgba(255, 255, 255, 0.12);
  color: white;
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

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 32px;
}

.detail-section:last-child {
  margin-bottom: 0;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-section h4 i {
  color: #3b82f6;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.detail-item span {
  font-size: 14px;
  color: #1f2937;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
}

.stat-card {
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.stat-icon.subjects {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.stat-icon.credits {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
}

.stat-icon.progress {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
}

.subjects-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.subject-item {
  display: grid;
  grid-template-columns: 80px 1fr 60px 80px;
  gap: 16px;
  align-items: center;
  padding: 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.subject-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.subject-code {
  font-family: monospace;
  font-weight: 700;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.subject-name {
  font-weight: 500;
  color: #1f2937;
  font-size: 14px;
}

.subject-credits {
  font-weight: 600;
  color: #6b7280;
  font-size: 13px;
  text-align: center;
}

.subject-type {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-align: center;
}

.subject-type.required {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.subject-type.elective {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.subject-type.specialization {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}

.empty-subjects {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 12px;
}

.empty-subjects i {
  font-size: 32px;
  margin-bottom: 12px;
  color: #d1d5db;
}

.empty-subjects p {
  margin: 0;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-cancel,
.btn-primary {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 2px solid transparent;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border-color: #e5e7eb;
}

.btn-cancel:hover {
  background: #f9fafb;
  color: #374151;
  border-color: #d1d5db;
}

.btn-primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-primary:hover {
  background: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .semester-detail-modal {
    margin: 20px;
    max-width: calc(100vw - 40px);
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .subject-item {
    grid-template-columns: 1fr;
    gap: 8px;
    text-align: center;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn-cancel,
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
}
</style>