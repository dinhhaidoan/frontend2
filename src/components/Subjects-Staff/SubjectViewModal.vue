<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-eye"></i>
          Chi tiết môn học
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="subject-detail">
          <!-- Basic Information -->
          <div class="info-section">
            <h4>
              <i class="fas fa-info-circle"></i>
              Thông tin cơ bản
            </h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Mã môn học:</label>
                <span class="subject-code">{{ subject.code }}</span>
              </div>
              <div class="info-item">
                <label>Tên môn học:</label>
                <span>{{ subject.name }}</span>
              </div>
              <div class="info-item">
                <label>Số tín chỉ:</label>
                <span class="credits-badge">{{ subject.credits }} TC</span>
              </div>
              <div class="info-item">
                <label>Khoa/Bộ môn:</label>
                <span>{{ subject.department }}</span>
              </div>
              <div class="info-item">
                <label>Học kỳ:</label>
                <span class="semester-badge">{{ getSemesterName(subject.semesterId) }}</span>
              </div>
              <div class="info-item">
                <label>Trạng thái:</label>
                <span class="status-badge" :class="subject.status">
                  {{ getStatusLabel(subject.status) }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- Teaching Information -->
          <div class="info-section">
            <h4>
              <i class="fas fa-chalkboard-teacher"></i>
              Thông tin giảng dạy
            </h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Giáo viên:</label>
                <span v-if="subject.teacherId">{{ subject.teacherName }}</span>
                <span v-else class="not-assigned">Chưa được gán</span>
              </div>
              <div class="info-item">
                <label>Phòng học:</label>
                <span v-if="subject.roomId">{{ subject.roomName }}</span>
                <span v-else class="not-assigned">Chưa được gán</span>
              </div>
              <div class="info-item">
                <label>Lịch học:</label>
                <span v-if="subject.schedule">{{ subject.schedule }}</span>
                <span v-else class="not-assigned">Chưa xếp lịch</span>
              </div>
            </div>
          </div>
          
          <!-- Registration Information -->
          <div class="info-section">
            <h4>
              <i class="fas fa-user-plus"></i>
              Thông tin đăng ký
            </h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Trạng thái đăng ký:</label>
                <span class="registration-status" :class="{ active: subject.registrationOpen }">
                  <i :class="subject.registrationOpen ? 'fas fa-toggle-on' : 'fas fa-toggle-off'"></i>
                  {{ subject.registrationOpen ? 'Mở đăng ký' : 'Đóng đăng ký' }}
                </span>
              </div>
              <div class="info-item">
                <label>Số sinh viên đã đăng ký:</label>
                <span class="student-count">
                  {{ subject.registeredCount || 0 }} / {{ subject.maxStudents }} sinh viên
                </span>
              </div>
              <div class="info-item full-width">
                <label>Tiến độ đăng ký:</label>
                <div class="progress-container">
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ width: getRegistrationProgress() + '%' }"
                    ></div>
                  </div>
                  <span class="progress-text">{{ getRegistrationProgress().toFixed(1) }}%</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Description -->
          <div class="info-section" v-if="subject.description">
            <h4>
              <i class="fas fa-file-alt"></i>
              Mô tả môn học
            </h4>
            <div class="description-content">
              {{ subject.description }}
            </div>
          </div>
          
          <!-- Metadata -->
          <div class="info-section">
            <h4>
              <i class="fas fa-calendar"></i>
              Thông tin tạo
            </h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Ngày tạo:</label>
                <span>{{ formatDate(subject.createdAt) }}</span>
              </div>
              <div class="info-item">
                <label>Lần cập nhật cuối:</label>
                <span>{{ formatDate(subject.updatedAt || subject.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-close-modal">
          <i class="fas fa-times"></i>
          Đóng
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SubjectViewModal',
  props: {
    subject: {
      type: Object,
      required: true
    }
  },
  emits: ['close'],
  setup(props, { emit }) {
    const handleOverlayClick = () => {
      emit('close')
    }
    
    const getSemesterName = (semesterId) => {
      // This should be passed as a prop or accessed from a store
      const semesters = [
        { id: 1, name: 'Học kỳ I - 2024-2025' },
        { id: 2, name: 'Học kỳ II - 2024-2025' }
      ]
      const semester = semesters.find(s => s.id === semesterId)
      return semester ? semester.name : 'Không xác định'
    }
    
    const getStatusLabel = (status) => {
      const labels = {
        active: 'Hoạt động',
        inactive: 'Không hoạt động',
        pending: 'Chờ duyệt'
      }
      return labels[status] || status
    }
    
    const getRegistrationProgress = () => {
      if (!props.subject.maxStudents) return 0
      return Math.min(100, (props.subject.registeredCount || 0) / props.subject.maxStudents * 100)
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Không xác định'
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN')
    }
    
    return {
      handleOverlayClick,
      getSemesterName,
      getStatusLabel,
      getRegistrationProgress,
      formatDate
    }
  }
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
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.modal-header h3 i {
  color: #3b82f6;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.subject-detail {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section h4 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  padding-bottom: 8px;
  border-bottom: 2px solid #f3f4f6;
}

.info-section h4 i {
  color: #3b82f6;
  font-size: 14px;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.info-item span {
  font-size: 14px;
  color: #0f172a;
  font-weight: 500;
}

.subject-code {
  font-family: monospace;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px !important;
}

.credits-badge {
  background: #dbeafe;
  color: #1e40af;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px !important;
  font-weight: 500;
  display: inline-block;
}

.semester-badge {
  background: #e0e7ff;
  color: #3730a3;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px !important;
  font-weight: 500;
  display: inline-block;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px !important;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: inline-block;
}

.status-badge.active {
  background: #dcfce7;
  color: #166534;
}

.status-badge.inactive {
  background: #fef2f2;
  color: #991b1b;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.not-assigned {
  color: #9ca3af !important;
  font-style: italic;
}

.registration-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.registration-status.active {
  color: #059669;
}

.registration-status:not(.active) {
  color: #6b7280;
}

.student-count {
  font-family: monospace;
  background: #f9fafb;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px !important;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #10b981;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px !important;
  font-weight: 500;
  color: #6b7280;
  min-width: 40px;
}

.description-content {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  line-height: 1.6;
  color: #374151;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-close-modal {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #6b7280;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: #4b5563;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 10px;
    max-width: none;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 16px;
  }
  
  .subject-detail {
    gap: 20px;
  }
  
  .progress-container {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .progress-text {
    text-align: center;
  }
}
</style>