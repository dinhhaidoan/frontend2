<template>
  <div class="weekly-calendar">
    <div class="calendar-header">
      <div class="calendar-nav">
        <button @click="previousWeek" class="nav-btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="current-week">
          <h3>{{ weekTitle }}</h3>
          <span class="date-range">{{ dateRange }}</span>
        </div>
        <button @click="nextWeek" class="nav-btn">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="view-controls">
        <button @click="goToToday" class="btn-today">Hôm nay</button>
        <div class="view-options">
          <button 
            v-for="view in viewOptions" 
            :key="view.key"
            class="view-btn"
            :class="{ active: currentView === view.key }"
            @click="currentView = view.key"
          >
            {{ view.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Đang tải lịch học...</p>
    </div>

    <!-- Calendar Grid -->
    <div v-else class="calendar-grid">
      <!-- Time Column -->
      <div class="time-column">
        <div class="time-header"></div>
        <div 
          v-for="timeSlot in timeSlots" 
          :key="timeSlot.key"
          class="time-slot"
          :style="{ height: timeSlotHeight + 'px' }"
        >
          <span class="time-label">{{ timeSlot.label }}</span>
        </div>
      </div>

      <!-- Days Columns -->
      <div 
        v-for="day in weekDays" 
        :key="day.date"
        class="day-column"
      >
        <div class="day-header" :class="{ today: isToday(day.date) }">
          <div class="day-name">{{ day.name }}</div>
          <div class="day-date">{{ formatDate(day.date) }}</div>
        </div>
        
        <!-- Schedule Events -->
        <div class="day-events" :style="{ height: (timeSlots.length * timeSlotHeight) + 'px' }">
          <div 
            v-for="schedule in getDaySchedules(day.dayOfWeek)" 
            :key="schedule.id"
            class="schedule-event"
            :class="getEventClass(schedule)"
            :style="getEventStyle(schedule)"
            @click="$emit('view:details', schedule)"
          >
            <div class="event-content">
              <div class="event-title">{{ schedule.subjectName }}</div>
              <div class="event-details">
                <div class="event-time">{{ schedule.timeSlot }}</div>
                <div class="event-room">{{ schedule.roomName }}</div>
                <div class="event-teacher">{{ schedule.teacherName }}</div>
              </div>
            </div>
            <div class="event-actions">
              <button @click.stop="$emit('edit:schedule', schedule)" class="action-btn edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click.stop="$emit('delete:schedule', schedule)" class="action-btn delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && schedules.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-calendar-plus"></i>
      </div>
      <h3>Chưa có lịch học nào</h3>
      <p>Bắt đầu tạo lịch học cho tuần này</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'

export default {
  name: 'WeeklyCalendar',
  props: {
    schedules: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: 'class'
    }
  },
  emits: ['edit:schedule', 'delete:schedule', 'view:details'],
  setup(props) {
    const currentWeek = ref(new Date())
    const currentView = ref('week')
    const timeSlotHeight = ref(80)

    const viewOptions = [
      { key: 'week', label: 'Tuần' },
      { key: 'day', label: 'Ngày' }
    ]

    const timeSlots = [
      { key: 1, label: '7:00', start: '07:00', end: '09:00' },
      { key: 2, label: '9:00', start: '09:00', end: '11:00' },
      { key: 3, label: '13:00', start: '13:00', end: '15:00' },
      { key: 4, label: '15:00', start: '15:00', end: '17:00' },
      { key: 5, label: '18:00', start: '18:00', end: '20:00' }
    ]

    const weekTitle = computed(() => {
      const startOfWeek = getStartOfWeek(currentWeek.value)
      return `Tuần ${getWeekNumber(startOfWeek)} - ${startOfWeek.getFullYear()}`
    })

    const dateRange = computed(() => {
      const startOfWeek = getStartOfWeek(currentWeek.value)
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      
      return `${formatDateShort(startOfWeek)} - ${formatDateShort(endOfWeek)}`
    })

    const weekDays = computed(() => {
      const startOfWeek = getStartOfWeek(currentWeek.value)
      const days = []
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek)
        date.setDate(startOfWeek.getDate() + i)
        
        days.push({
          date: date,
          dayOfWeek: i === 6 ? 0 : i + 1, // Convert Sunday to 0
          name: getDayName(date)
        })
      }
      
      return days
    })

    const getStartOfWeek = (date) => {
      const startOfWeek = new Date(date)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Monday as start
      startOfWeek.setDate(diff)
      startOfWeek.setHours(0, 0, 0, 0)
      return startOfWeek
    }

    const getWeekNumber = (date) => {
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
      const pastDaysOfYear = (date - firstDayOfYear) / 86400000
      return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
    }

    const getDayName = (date) => {
      return date.toLocaleDateString('vi-VN', { weekday: 'long' })
    }

    const formatDate = (date) => {
      return date.getDate().toString().padStart(2, '0')
    }

    const formatDateShort = (date) => {
      return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    }

    const isToday = (date) => {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }

    const getDaySchedules = (dayOfWeek) => {
      return props.schedules.filter(schedule => schedule.dayOfWeek === dayOfWeek)
    }

    const getEventClass = (schedule) => {
      const classes = ['schedule-type-' + (schedule.type || 'class')]
      
      if (schedule.status === 'cancelled') {
        classes.push('cancelled')
      }
      
      return classes.join(' ')
    }

    const getEventStyle = (schedule) => {
      const timeSlot = timeSlots.find(slot => 
        schedule.startTime >= slot.start && schedule.startTime < slot.end
      )
      
      if (!timeSlot) return {}

      const topPosition = (timeSlot.key - 1) * timeSlotHeight.value
      const height = Math.max(timeSlotHeight.value - 4, 60)
      
      return {
        top: topPosition + 'px',
        height: height + 'px'
      }
    }

    const previousWeek = () => {
      const newWeek = new Date(currentWeek.value)
      newWeek.setDate(newWeek.getDate() - 7)
      currentWeek.value = newWeek
    }

    const nextWeek = () => {
      const newWeek = new Date(currentWeek.value)
      newWeek.setDate(newWeek.getDate() + 7)
      currentWeek.value = newWeek
    }

    const goToToday = () => {
      currentWeek.value = new Date()
    }

    return {
      currentWeek,
      currentView,
      timeSlotHeight,
      viewOptions,
      timeSlots,
      weekTitle,
      dateRange,
      weekDays,
      formatDate,
      isToday,
      getDaySchedules,
      getEventClass,
      getEventStyle,
      previousWeek,
      nextWeek,
      goToToday
    }
  }
}
</script>

<style scoped>
.weekly-calendar {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.calendar-nav {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.current-week {
  text-align: center;
}

.current-week h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.date-range {
  font-size: 14px;
  color: #6b7280;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-today {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-today:hover {
  background: #2563eb;
}

.view-options {
  display: flex;
  background: #f1f5f9;
  border-radius: 6px;
  padding: 2px;
}

.view-btn {
  padding: 6px 12px;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.calendar-grid {
  display: grid;
  grid-template-columns: 80px repeat(7, 1fr);
  border-bottom: 1px solid #e5e7eb;
}

.time-column {
  border-right: 1px solid #e5e7eb;
}

.time-header {
  height: 60px;
  border-bottom: 1px solid #e5e7eb;
}

.time-slot {
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  align-items: flex-start;
  padding: 8px;
}

.time-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.day-column {
  border-right: 1px solid #e5e7eb;
  position: relative;
}

.day-column:last-child {
  border-right: none;
}

.day-header {
  height: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.day-header.today {
  background: #dbeafe;
  color: #1d4ed8;
}

.day-name {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
}

.day-header.today .day-name {
  color: #1d4ed8;
}

.day-date {
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.day-header.today .day-date {
  color: #1d4ed8;
}

.day-events {
  position: relative;
  background: repeating-linear-gradient(
    transparent,
    transparent 79px,
    #f3f4f6 79px,
    #f3f4f6 80px
  );
}

.schedule-event {
  position: absolute;
  left: 4px;
  right: 4px;
  background: #dbeafe;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
}

.schedule-event:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.schedule-event.schedule-type-exam {
  background: #fef3c7;
  border-color: #f59e0b;
}

.schedule-event.cancelled {
  background: #fef2f2;
  border-color: #ef4444;
  opacity: 0.7;
}

.event-content {
  margin-bottom: 4px;
}

.event-title {
  font-weight: 600;
  color: #1e40af;
  font-size: 13px;
  margin-bottom: 2px;
  line-height: 1.2;
}

.schedule-event.schedule-type-exam .event-title {
  color: #92400e;
}

.schedule-event.cancelled .event-title {
  color: #dc2626;
  text-decoration: line-through;
}

.event-details {
  font-size: 11px;
  color: #1e40af;
  line-height: 1.3;
}

.schedule-event.schedule-type-exam .event-details {
  color: #92400e;
}

.event-actions {
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s;
}

.schedule-event:hover .event-actions {
  opacity: 1;
}

.action-btn {
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.2s;
}

.action-btn.edit {
  background: #3b82f6;
  color: white;
}

.action-btn.edit:hover {
  background: #2563eb;
}

.action-btn.delete {
  background: #ef4444;
  color: white;
}

.action-btn.delete:hover {
  background: #dc2626;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon i {
  font-size: 24px;
  color: #9ca3af;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 18px;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .calendar-grid {
    grid-template-columns: 60px repeat(7, minmax(100px, 1fr));
    overflow-x: auto;
  }
  
  .event-title {
    font-size: 11px;
  }
  
  .event-details {
    font-size: 9px;
  }
}
</style>