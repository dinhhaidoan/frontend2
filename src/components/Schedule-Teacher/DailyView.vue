<template>
  <div class="daily-view">
    <div class="daily-header">
      <div class="header-left">
        <h2>Lịch dạy</h2>
        <p class="date-text">{{ formattedDate }}</p>
      </div>
      <div class="date-navigation">
        <button @click="previousDay" class="nav-btn" title="Ngày trước">
          <i class="fas fa-chevron-left"></i>
        </button>
        <button @click="today" class="nav-btn today-btn" title="Hôm nay">
          <i class="fas fa-calendar-day"></i>
          Hôm nay
        </button>
        <button @click="nextDay" class="nav-btn" title="Ngày sau">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div class="timeline">
      <div 
        v-for="schedule in filteredSchedules"
        :key="schedule.id"
        :class="['schedule-item', schedule.status]"
        @click="handleScheduleClick(schedule)"
      >
        <div class="time-marker">
          <div class="time-line"></div>
          <div class="time-dot"></div>
        </div>

        <div class="schedule-card">
          <div class="schedule-time">
            <i class="fas fa-clock"></i>
            {{ schedule.startTime }} - {{ schedule.endTime }}
          </div>
          
          <div class="schedule-content">
            <h3 class="schedule-title">{{ schedule.subject }}</h3>
            <div class="schedule-meta">
              <span class="meta-badge">
                <i class="fas fa-users"></i>
                {{ schedule.class }}
              </span>
              <span class="meta-badge">
                <i class="fas fa-door-open"></i>
                {{ schedule.room }}
              </span>
              <span class="meta-badge">
                <i class="fas fa-user-graduate"></i>
                {{ schedule.studentCount }} SV
              </span>
            </div>
          </div>

          <div class="schedule-status">
            <span :class="['status-badge', schedule.status]">
              {{ getStatusText(schedule.status) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="filteredSchedules.length === 0" class="empty-state">
        <i class="fas fa-calendar-check"></i>
        <p>Không có lịch dạy hôm nay</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  date: {
    type: Date,
    default: () => new Date()
  },
  filters: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['schedule-click', 'date-change'])

// Date navigation functions
const previousDay = () => {
  const newDate = new Date(props.date)
  newDate.setDate(newDate.getDate() - 1)
  emit('date-change', newDate)
}

const nextDay = () => {
  const newDate = new Date(props.date)
  newDate.setDate(newDate.getDate() + 1)
  emit('date-change', newDate)
}

const today = () => {
  emit('date-change', new Date())
}

// Mock data
const schedules = ref([
  {
    id: 1,
    subject: 'Lập trình hướng đối tượng',
    class: 'DHKTPM17A',
    room: 'A201',
    startTime: '07:30',
    endTime: '09:30',
    studentCount: 45,
    status: 'completed',
    type: 'theory'
  },
  {
    id: 2,
    subject: 'Cấu trúc dữ liệu và giải thuật',
    class: 'DHKTPM17B',
    room: 'B101',
    startTime: '10:00',
    endTime: '12:00',
    studentCount: 42,
    status: 'ongoing',
    type: 'theory'
  },
  {
    id: 3,
    subject: 'Thực hành CSDL',
    class: 'DHKTPM17C',
    room: 'Lab2',
    startTime: '13:30',
    endTime: '15:30',
    studentCount: 38,
    status: 'scheduled',
    type: 'practice'
  },
  {
    id: 4,
    subject: 'Mạng máy tính',
    class: 'DHKTPM18A',
    room: 'A302',
    startTime: '15:45',
    endTime: '17:45',
    studentCount: 40,
    status: 'scheduled',
    type: 'theory'
  }
])

const formattedDate = computed(() => {
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy']
  const day = days[props.date.getDay()]
  const date = props.date.getDate()
  const month = props.date.getMonth() + 1
  const year = props.date.getFullYear()
  return `${day}, ${date}/${month}/${year}`
})

const filteredSchedules = computed(() => {
  return schedules.value.filter(schedule => {
    if (props.filters.classType && props.filters.classType !== 'all') {
      if (schedule.type !== props.filters.classType) return false
    }
    if (props.filters.status && props.filters.status !== 'all') {
      if (schedule.status !== props.filters.status) return false
    }
    return true
  })
})

const getStatusText = (status) => {
  const statusMap = {
    scheduled: 'Đã lên lịch',
    ongoing: 'Đang diễn ra',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy'
  }
  return statusMap[status] || status
}

const handleScheduleClick = (schedule) => {
  emit('schedule-click', schedule)
}
</script>

<style scoped>
.daily-view {
  height: 100%;
}

.daily-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.header-left {
  flex: 1;
}

.daily-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 4px 0;
}

.date-text {
  color: #6b7280;
  margin: 0;
  font-size: 14px;
  font-weight: 500;
}

.date-navigation {
  display: flex;
  gap: 8px;
  align-items: center;
}

.nav-btn {
  padding: 8px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}

.nav-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
  color: #374151;
}

.nav-btn:active {
  transform: scale(0.95);
}

.today-btn {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.today-btn:hover {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.timeline {
  position: relative;
}

.schedule-item {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
}

.time-marker {
  position: relative;
  width: 2px;
  flex-shrink: 0;
}

.time-line {
  position: absolute;
  width: 2px;
  height: 100%;
  background: #e5e7eb;
  left: 50%;
  transform: translateX(-50%);
}

.time-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #d1d5db;
  border: 3px solid white;
  left: 50%;
  top: 24px;
  transform: translateX(-50%);
  transition: all 0.3s;
  z-index: 1;
}

.schedule-item.ongoing .time-dot {
  background: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  animation: pulse-dot 2s infinite;
}

.schedule-item.completed .time-dot {
  background: #6b7280;
}

.schedule-item.scheduled .time-dot {
  background: #3b82f6;
}

@keyframes pulse-dot {
  0%, 100% {
    box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(16, 185, 129, 0.1);
  }
}

.schedule-card {
  flex: 1;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.schedule-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);
  transform: translateX(4px);
}

.schedule-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.schedule-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 12px 0;
}

.schedule-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.meta-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 12px;
  color: #6b7280;
}

.schedule-status {
  display: flex;
  justify-content: flex-end;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
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

.status-badge.cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>
