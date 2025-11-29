<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-eye"></i>
          Chi tiết {{ scheduleType === 'exam' ? 'lịch thi' : 'lịch học' }}
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <div class="details-content">
          <!-- Basic Info -->
          <div class="info-section">
            <h4>Thông tin cơ bản</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Môn học:</label>
                <span>{{ schedule.subjectName }} ({{ schedule.subjectCode }})</span>
              </div>
              <div class="info-item">
                <label>{{ scheduleType === 'exam' ? 'Loại thi:' : 'Loại lịch:' }}</label>
                <span class="type-badge" :class="scheduleType">
                  {{ scheduleType === 'exam' ? schedule.examTypeName : 'Lịch học' }}
                </span>
              </div>
              <div class="info-item">
                <label>Thời gian:</label>
                <span>{{ formatDateTime() }}</span>
              </div>
              <div class="info-item">
                <label>Thời lượng:</label>
                <span>{{ getDuration() }}</span>
              </div>
            </div>
          </div>

          <!-- Location & People -->
          <div class="info-section">
            <h4>Địa điểm & Nhân sự</h4>
            <div class="info-grid">
              <div class="info-item">
                <label>Phòng:</label>
                <span>{{ schedule.roomName || 'Chưa xếp phòng' }}</span>
              </div>
              <div class="info-item">
                <label>Giáo viên:</label>
                <span>{{ schedule.teacherName || 'Chưa phân công' }}</span>
              </div>
              <div v-if="scheduleType === 'exam'" class="info-item">
                <label>Sức chứa:</label>
                <span>{{ schedule.maxStudents }} sinh viên</span>
              </div>
              <div v-if="scheduleType === 'exam'" class="info-item">
                <label>Đã đăng ký:</label>
                <span>{{ schedule.registeredStudents || 'chưa có' }} sinh viên</span>
              </div>
            </div>
          </div>

        </div>

        <div class="modal-footer">
          <button @click="$emit('close')" class="btn-cancel">
            Đóng
          </button>
          <button @click="$emit('edit')" class="btn-primary">
            <i class="fas fa-edit"></i>
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ScheduleDetailsModal',
  props: {
    schedule: {
      type: Object,
      required: true
    },
    scheduleType: {
      type: String,
      default: 'class'
    }
  },
  emits: ['close', 'edit'],
  setup(props) {
    const formatDateTime = () => {
      if (!props.schedule.date) return ''
      
      const date = new Date(props.schedule.date)
      const dateStr = date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
      const timeStr = `${props.schedule.startTime} - ${props.schedule.endTime}`
      return `${dateStr}, ${timeStr}`
    }

    const getDuration = () => {
      if (props.scheduleType === 'exam' && props.schedule.duration) {
        return `${props.schedule.duration} phút`
      }
      
      if (props.schedule.startTime && props.schedule.endTime) {
        const start = new Date(`2024-01-01T${props.schedule.startTime}`)
        const end = new Date(`2024-01-01T${props.schedule.endTime}`)
        const duration = (end - start) / (1000 * 60)
        return `${duration} phút`
      }
      
      return 'Không xác định'
    }

    const getStatusLabel = (status) => {
      const labels = {
        'scheduled': 'Đã xếp lịch',
        'draft': 'Nháp',
        'cancelled': 'Đã hủy',
        'completed': 'Hoàn thành'
      }
      return labels[status] || status
    }

    return {
      formatDateTime,
      getDuration,
      getStatusLabel
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
  z-index: 100000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 24px;
  max-height: calc(80vh - 120px);
  overflow-y: auto;
}

.info-section {
  margin-bottom: 24px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
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
}

.notes-text {
  margin: 0;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.class {
  background: #dbeafe;
  color: #1e40af;
}

.type-badge.exam {
  background: #fef3c7;
  color: #92400e;
}

.status-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.scheduled {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.draft {
  background: #f3f4f6;
  color: #374151;
}

.status-badge.cancelled {
  background: #fef2f2;
  color: #dc2626;
}

.status-badge.completed {
  background: #ede9fe;
  color: #7c3aed;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.btn-cancel {
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background: #f9fafb;
  border-color: #9ca3af;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #3b82f6;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary:hover {
  background: #2563eb;
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
  .modal-body {
    padding: 16px;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
  }
}
</style>