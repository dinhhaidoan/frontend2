<template>
  <Transition name="modal">
    <div v-if="schedule" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Chi tiết lịch dạy</h2>
          <button @click="close" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Subject Info -->
          <div class="info-section">
            <div class="section-title">Thông tin môn học</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Môn học:</span>
                <span class="value">{{ schedule.subject }}</span>
              </div>
              <div class="info-item">
                <span class="label">Mã lớp:</span>
                <span class="value">{{ schedule.class }}</span>
              </div>
              <div class="info-item">
                <span class="label">Loại lớp:</span>
                <span :class="['badge', schedule.type]">
                  {{ getTypeText(schedule.type) }}
                </span>
              </div>
              <div class="info-item">
                <span class="label">Số sinh viên:</span>
                <span class="value">{{ schedule.studentCount || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- Schedule Info -->
          <div class="info-section">
            <div class="section-title">Thời gian & Địa điểm</div>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Thời gian:</span>
                <span class="value">{{ schedule.startTime }} - {{ schedule.endTime }}</span>
              </div>
              <div class="info-item">
                <span class="label">Phòng học:</span>
                <span class="value">{{ schedule.room }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="close" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            Đóng
          </button>
          <button @click="handleAction('attendance')" class="btn btn-primary">
            <i class="fas fa-clipboard-check"></i>
            Điểm danh
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  schedule: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'action'])

const close = () => {
  emit('close')
}

const handleAction = (action) => {
  emit('action', action, props.schedule)
}

const getTypeText = (type) => {
  const types = {
    theory: 'Lý thuyết',
    practice: 'Thực hành',
    lab: 'Bài tập'
  }
  return types[type] || type
}

const getStatusText = (status) => {
  const statuses = {
    scheduled: 'Đã lên lịch',
    ongoing: 'Đang diễn ra',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy'
  }
  return statuses[status] || status
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
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.info-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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

.info-item .label {
  font-size: 13px;
  color: #6b7280;
}

.info-item .value {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.badge.theory {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.badge.practice {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.badge.lab {
  background: rgba(236, 72, 153, 0.1);
  color: #ec4899;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  width: fit-content;
}

.status-badge.scheduled {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-badge.ongoing {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.status-badge.completed {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
