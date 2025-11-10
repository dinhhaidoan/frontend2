<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-exclamation-triangle"></i>
          Kiểm tra xung đột lịch
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body">
        <!-- Summary -->
        <div class="conflict-summary">
          <div class="summary-item">
            <div class="summary-number">{{ conflicts.length }}</div>
            <div class="summary-label">Xung đột phát hiện</div>
          </div>
          <div class="summary-item">
            <div class="summary-number">{{ teacherConflicts.length }}</div>
            <div class="summary-label">Xung đột giáo viên</div>
          </div>
          <div class="summary-item">
            <div class="summary-number">{{ roomConflicts.length }}</div>
            <div class="summary-label">Xung đột phòng học</div>
          </div>
        </div>

        <!-- No Conflicts -->
        <div v-if="conflicts.length === 0" class="no-conflicts">
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h3>Không có xung đột</h3>
          <p>Tất cả lịch học và lịch thi đều được xếp hợp lý, không có xung đột nào được phát hiện.</p>
        </div>

        <!-- Conflicts List -->
        <div v-else class="conflicts-list">
          <div 
            v-for="conflict in conflicts" 
            :key="conflict.id"
            class="conflict-item"
            :class="conflict.type"
          >
            <div class="conflict-header">
              <div class="conflict-icon">
                <i :class="getConflictIcon(conflict.type)"></i>
              </div>
              <div class="conflict-info">
                <div class="conflict-title">{{ getConflictTitle(conflict.type) }}</div>
                <div class="conflict-description">{{ conflict.description }}</div>
              </div>
              <div class="conflict-actions">
                <button 
                  @click="resolveConflict(conflict)" 
                  class="btn-resolve"
                  title="Giải quyết xung đột"
                >
                  <i class="fas fa-tools"></i>
                </button>
              </div>
            </div>
            
            <div class="conflict-details">
              <div class="conflicting-schedules">
                <div 
                  v-for="schedule in conflict.schedules" 
                  :key="schedule.id"
                  class="schedule-card"
                >
                  <div class="schedule-header">
                    <span class="schedule-type" :class="schedule.type">
                      {{ schedule.type === 'exam' ? 'Thi' : 'Học' }}
                    </span>
                    <span class="schedule-subject">{{ schedule.subjectName }}</span>
                  </div>
                  <div class="schedule-meta">
                    <span class="schedule-time">{{ schedule.timeSlot || `${schedule.startTime}-${schedule.endTime}` }}</span>
                    <span class="schedule-date">{{ formatDate(schedule.date) }}</span>
                  </div>
                  <div class="schedule-location">
                    <span v-if="conflict.type === 'teacher'" class="teacher-name">
                      <i class="fas fa-user"></i>
                      {{ schedule.teacherName }}
                    </span>
                    <span v-if="conflict.type === 'room'" class="room-name">
                      <i class="fas fa-door-open"></i>
                      {{ schedule.roomName }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">
          Đóng
        </button>
        <button v-if="conflicts.length > 0" @click="resolveAllConflicts" class="btn-resolve-all">
          <i class="fas fa-magic"></i>
          Tự động giải quyết
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'ConflictCheckerModal',
  props: {
    conflicts: {
      type: Array,
      default: () => []
    }
  },
  emits: ['close', 'resolve'],
  setup(props, { emit }) {
    const teacherConflicts = computed(() => {
      return props.conflicts.filter(c => c.type === 'teacher')
    })

    const roomConflicts = computed(() => {
      return props.conflicts.filter(c => c.type === 'room')
    })

    const getConflictIcon = (type) => {
      return type === 'teacher' ? 'fas fa-user-times' : 'fas fa-door-closed'
    }

    const getConflictTitle = (type) => {
      return type === 'teacher' ? 'Xung đột giáo viên' : 'Xung đột phòng học'
    }

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('vi-VN', { 
        weekday: 'short', 
        day: '2-digit', 
        month: '2-digit' 
      })
    }

    const resolveConflict = (conflict) => {
      emit('resolve', conflict.id, 'manual')
    }

    const resolveAllConflicts = () => {
      props.conflicts.forEach(conflict => {
        emit('resolve', conflict.id, 'auto')
      })
    }

    return {
      teacherConflicts,
      roomConflicts,
      getConflictIcon,
      getConflictTitle,
      formatDate,
      resolveConflict,
      resolveAllConflicts
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
  max-width: 800px;
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
  background: #fef3c7;
}

.modal-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #92400e;
}

.modal-header h3 i {
  color: #f59e0b;
}

.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(146, 64, 14, 0.1);
  color: #92400e;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: rgba(146, 64, 14, 0.2);
}

.modal-body {
  padding: 24px;
  max-height: calc(80vh - 140px);
  overflow-y: auto;
}

.conflict-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.summary-item {
  text-align: center;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.summary-number {
  font-size: 24px;
  font-weight: 700;
  color: #f59e0b;
  margin-bottom: 4px;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
}

.no-conflicts {
  text-align: center;
  padding: 40px 20px;
}

.success-icon {
  width: 64px;
  height: 64px;
  background: #d1fae5;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.success-icon i {
  font-size: 24px;
  color: #10b981;
}

.no-conflicts h3 {
  margin: 0 0 8px 0;
  color: #0f172a;
  font-size: 20px;
}

.no-conflicts p {
  margin: 0;
  color: #6b7280;
  line-height: 1.6;
}

.conflicts-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.conflict-item {
  background: white;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  overflow: hidden;
}

.conflict-item.teacher {
  border-left: 4px solid #3b82f6;
}

.conflict-item.room {
  border-left: 4px solid #f59e0b;
}

.conflict-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #fef3c7;
}

.conflict-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  color: #f59e0b;
}

.conflict-info {
  flex: 1;
}

.conflict-title {
  font-weight: 600;
  color: #92400e;
  margin-bottom: 4px;
}

.conflict-description {
  font-size: 14px;
  color: #6b7280;
}

.btn-resolve {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: #f59e0b;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-resolve:hover {
  background: #d97706;
}

.conflict-details {
  padding: 16px;
}

.conflicting-schedules {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 12px;
}

.schedule-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 12px;
}

.schedule-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.schedule-type {
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.schedule-type.class {
  background: #dbeafe;
  color: #1e40af;
}

.schedule-type.exam {
  background: #fef3c7;
  color: #92400e;
}

.schedule-subject {
  font-weight: 600;
  color: #0f172a;
}

.schedule-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 12px;
  color: #6b7280;
}

.schedule-location {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #374151;
}

.schedule-location i {
  width: 12px;
  color: #9ca3af;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
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

.btn-resolve-all {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #f59e0b;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-resolve-all:hover {
  background: #d97706;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-container {
    margin: 10px;
    max-width: none;
  }
  
  .conflict-summary {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .conflicting-schedules {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 12px;
  }
}
</style>