<template>
  <div class="today-schedule">
    <div class="schedule-header">
      <h3>
        <i class="fas fa-calendar-day"></i>
        Lịch học hôm nay
      </h3>
      <span class="today-date">{{ todayFormatted }}</span>
    </div>

    <div v-if="todayClasses.length === 0" class="no-classes">
      <i class="fas fa-calendar-times"></i>
      <p>Không có lịch học hôm nay</p>
      <span>Tận dụng thời gian để ôn tập nhé!</span>
    </div>

    <div v-else class="schedule-list">
      <div 
        v-for="(classItem, index) in todayClasses" 
        :key="index"
        class="schedule-item"
        :class="{ current: classItem.isCurrent, finished: classItem.isFinished }"
      >
        <div class="time-badge" :class="{ current: classItem.isCurrent }">
          <div class="time">{{ classItem.time }}</div>
          <div class="duration">{{ classItem.duration }}</div>
        </div>
        <div class="class-info">
          <div class="class-header">
            <div class="class-name">{{ classItem.name }}</div>
            <span v-if="classItem.isCurrent" class="status-badge current">
              <i class="fas fa-circle"></i>
              Đang diễn ra
            </span>
            <span v-else-if="classItem.isFinished" class="status-badge finished">
              <i class="fas fa-check"></i>
              Đã kết thúc
            </span>
          </div>
          <div class="class-details">
            <span class="detail-item">
              <i class="fas fa-chalkboard-teacher"></i>
              {{ classItem.teacher }}
            </span>
            <!-- Room display removed per UX request -->
          </div>
        </div>
        <button 
          v-if="classItem.meetLink && !classItem.isFinished" 
          @click="joinClass(classItem.meetLink)"
          class="btn-join"
          :class="{ pulse: classItem.isCurrent }"
        >
          <i class="fas fa-video"></i>
          {{ classItem.isCurrent ? 'Vào lớp' : 'Sẵn sàng' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const today = new Date()
const todayFormatted = computed(() => {
  return new Intl.DateTimeFormat('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }).format(today)
})

const todayClasses = ref([
  {
    time: '07:30',
    duration: '3 tiết',
    name: 'Lập trình Web với Vue.js',
    teacher: 'TS. Nguyễn Văn A',
    room: 'A101',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    isCurrent: false,
    isFinished: true
  },
  {
    time: '13:30',
    duration: '3 tiết',
    name: 'Phát triển ứng dụng Mobile',
    teacher: 'ThS. Trần Thị B',
    room: 'B203',
    meetLink: 'https://meet.google.com/xyz-uvwx-rst',
    isCurrent: true,
    isFinished: false
  },
  {
    time: '18:30',
    duration: '2 tiết',
    name: 'Tiếng Anh chuyên ngành',
    teacher: 'CN. Lê Văn C',
    room: 'C305',
    meetLink: null,
    isCurrent: false,
    isFinished: false
  }
])

const joinClass = (meetLink) => {
  window.open(meetLink, '_blank')
}
</script>

<style scoped>
.today-schedule {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 24px;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.schedule-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.schedule-header h3 i {
  color: #667eea;
}

.today-date {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.no-classes {
  text-align: center;
  padding: 40px 20px;
}

.no-classes i {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.no-classes p {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #6b7280;
}

.no-classes span {
  font-size: 13px;
  color: #9ca3af;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  background: #f9fafb;
  border: 2px solid #f3f4f6;
  transition: all 0.3s;
}

.schedule-item:hover {
  background: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.schedule-item.current {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: #667eea;
}

.schedule-item.finished {
  opacity: 0.6;
}

.time-badge {
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  min-width: 80px;
  flex-shrink: 0;
}

.time-badge.current {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
}

.time {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.duration {
  font-size: 11px;
  opacity: 0.8;
}

.class-info {
  flex: 1;
}

.class-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.class-name {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-badge.current {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.current i {
  animation: blink 1.5s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-badge.finished {
  background: #d1fae5;
  color: #065f46;
}

.class-details {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #6b7280;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-item i {
  font-size: 12px;
}

.btn-join {
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.btn-join:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-join.pulse {
  animation: pulse-btn 2s infinite;
}

@keyframes pulse-btn {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.6);
  }
}

@media (max-width: 768px) {
  .schedule-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .btn-join {
    width: 100%;
    justify-content: center;
  }
}
</style>
