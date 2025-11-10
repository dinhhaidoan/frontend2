<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click="close">
        <div class="modal-container" @click.stop>
          <div class="modal-header">
            <h3>
              <i class="fas fa-info-circle"></i>
              Chi tiết lớp học phần
            </h3>
            <button class="close-btn" @click="close">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body" v-if="classData">
            <div class="class-title">
              <h2>{{ classData.className }}</h2>
              <span class="class-code-badge">{{ classData.classCode }}</span>
            </div>

            <div class="info-section">
              <h4 class="section-title">
                <i class="fas fa-book"></i>
                Thông tin môn học
              </h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Mã môn:</span>
                  <span class="value">{{ classData.subjectCode }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Tên môn:</span>
                  <span class="value">{{ classData.subjectName }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Số tín chỉ:</span>
                  <span class="value">{{ classData.credits }} TC</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h4 class="section-title">
                <i class="fas fa-chalkboard-teacher"></i>
                Thông tin lớp học
              </h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="label">Giảng viên:</span>
                  <span class="value">{{ classData.teacher }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Email GV:</span>
                  <span class="value">{{ classData.teacherEmail || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Phòng học:</span>
                  <span class="value">{{ classData.room }}</span>
                </div>
                <div class="info-item">
                  <span class="label">Sĩ số:</span>
                  <span class="value">{{ classData.currentStudents }}/{{ classData.maxStudents }}</span>
                </div>
              </div>
            </div>

            <div class="info-section">
              <h4 class="section-title">
                <i class="fas fa-calendar-alt"></i>
                Lịch học
              </h4>
              <div class="schedule-list">
                <div
                  v-for="(schedule, index) in classData.schedule"
                  :key="index"
                  class="schedule-item"
                >
                  <div class="schedule-day">{{ schedule.dayOfWeek }}</div>
                  <div class="schedule-time">
                    Tiết {{ schedule.startPeriod }} - {{ schedule.endPeriod }}
                    <span class="time-range">({{ getTimeRange(schedule) }})</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="info-section" v-if="classData.description">
              <h4 class="section-title">
                <i class="fas fa-align-left"></i>
                Mô tả
              </h4>
              <p class="description">{{ classData.description }}</p>
            </div>

            <div class="info-section" v-if="classData.note">
              <h4 class="section-title">
                <i class="fas fa-sticky-note"></i>
                Ghi chú
              </h4>
              <div class="note-box">
                {{ classData.note }}
              </div>
            </div>

            <div v-if="classData.hasConflict || classData.isFull" class="alert-section">
              <div v-if="classData.hasConflict" class="alert alert-warning">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Lớp này trùng lịch với môn học bạn đã đăng ký</span>
              </div>
              <div v-if="classData.isFull" class="alert alert-danger">
                <i class="fas fa-users-slash"></i>
                <span>Lớp đã đầy sĩ số</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-close" @click="close">
              <i class="fas fa-times"></i>
              Đóng
            </button>
            <button
              v-if="!classData?.isRegistered"
              class="btn btn-register"
              :disabled="classData?.isFull || classData?.hasConflict"
              @click="handleRegister"
            >
              <i class="fas fa-plus-circle"></i>
              Đăng ký lớp này
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  classData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['close', 'register']);

const close = () => {
  emit('close');
};

const handleRegister = () => {
  emit('register', props.classData);
};

const getTimeRange = (schedule) => {
  // Giả sử mỗi tiết 50 phút, bắt đầu từ 7h00
  const startHour = 7;
  const periodDuration = 50;
  
  const startTime = startHour * 60 + (schedule.startPeriod - 1) * periodDuration;
  const endTime = startHour * 60 + schedule.endPeriod * periodDuration;
  
  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
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
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  margin: auto;
}

.modal-header {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #e5e7eb;
  background: #f9fafb;
}

.modal-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.modal-header h3 i {
  color: #3b82f6;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #6b7280;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.1);
  color: #1a1a1a;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.class-title {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
}

.class-title h2 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.class-code-badge {
  display: inline-block;
  padding: 6px 14px;
  background: #3b82f6;
  color: white;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
}

.info-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title i {
  color: #3b82f6;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  font-weight: 500;
}

.info-item .value {
  font-size: 15px;
  color: #1a1a1a;
  font-weight: 600;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item {
  background: #f0f9ff;
  border-left: 4px solid #3b82f6;
  padding: 12px 16px;
  border-radius: 6px;
}

.schedule-day {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.schedule-time {
  font-size: 14px;
  color: #4b5563;
}

.time-range {
  color: #6b7280;
  font-size: 13px;
  margin-left: 8px;
}

.description {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
}

.note-box {
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  color: #92400e;
}

.alert-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
}

.alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.alert i {
  font-size: 18px;
}

.alert-warning {
  background: #fef3c7;
  color: #92400e;
  border-left: 4px solid #f59e0b;
}

.alert-warning i {
  color: #f59e0b;
}

.alert-danger {
  background: #fee2e2;
  color: #7f1d1d;
  border-left: 4px solid #ef4444;
}

.alert-danger i {
  color: #ef4444;
}

.modal-footer {
  padding: 20px 24px;
  background: #f9fafb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  border-top: 2px solid #e5e7eb;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-close {
  background: white;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.btn-close:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-register {
  background: #3b82f6;
  color: white;
}

.btn-register:hover:not(:disabled) {
  background: #2563eb;
}

.btn-register:disabled {
  background: #cbd5e1;
  color: #94a3b8;
  cursor: not-allowed;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}
</style>
