<template>
  <div class="monthly-calendar">
    <!-- Calendar Header -->
    <div class="calendar-header">
      <div class="month-navigation">
        <button @click="previousMonth" class="nav-btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        <h2 class="month-title">
          {{ currentMonthYear }}
        </h2>
        <button @click="nextMonth" class="nav-btn">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="calendar-actions">
        <button @click="goToToday" class="btn-today">
          <i class="fas fa-calendar-day"></i>
          Hôm nay
        </button>
        <button @click="$emit('add:schedule')" class="btn-add">
          <i class="fas fa-plus"></i>
          Thêm lịch
        </button>
      </div>
    </div>

    <!-- Legend -->
    <div class="calendar-legend">
      <div class="legend-item">
        <span class="legend-dot class-dot"></span>
        <span>Lịch học</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot exam-dot"></span>
        <span>Lịch thi</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot conflict-dot"></span>
        <span>Xung đột</span>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Day Headers -->
      <div class="day-headers">
        <div v-for="day in dayHeaders" :key="day" class="day-header">
          {{ day }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="calendar-body">
        <div 
          v-for="week in calendarWeeks" 
          :key="week.id" 
          class="calendar-week"
        >
          <div 
            v-for="day in week.days" 
            :key="day.date"
            class="calendar-day"
            :class="{
              'other-month': !day.isCurrentMonth,
              'today': day.isToday,
              'weekend': day.isWeekend,
              'has-events': day.events.length > 0
            }"
            @click="selectDay(day)"
          >
            <div class="day-number">{{ day.number }}</div>
            
            <!-- Events for this day -->
            <div class="day-events">
              <div 
                v-for="event in day.events.slice(0, 3)" 
                :key="event.id"
                class="event-dot"
                :class="{
                  'class-event': event.type === 'class',
                  'exam-event': event.type === 'exam',
                  'conflict-event': event.hasConflict
                }"
                :title="getEventTitle(event)"
                @click.stop="viewEventDetails(event)"
              ></div>
              
              <!-- More events indicator -->
              <div 
                v-if="day.events.length > 3" 
                class="more-events"
                :title="`Còn ${day.events.length - 3} sự kiện khác`"
              >
                +{{ day.events.length - 3 }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Day Events Modal -->
    <div v-if="showDayEventsModal" class="modal-overlay" @click="closeDayEventsModal">
      <div class="day-events-modal" @click.stop>
        <div class="modal-header">
          <div class="modal-title">
            <i class="fas fa-calendar-day"></i>
            <div>
              <h3>{{ formatSelectedDate(selectedDay.date) }}</h3>
              <p>{{ selectedDay.events.length }} sự kiện trong ngày</p>
            </div>
          </div>
          <button @click="closeDayEventsModal" class="close-modal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedDay.events.length === 0" class="empty-state">
            <i class="fas fa-calendar-times"></i>
            <h4>Không có lịch học/thi</h4>
            <p>Ngày này chưa có sự kiện nào được lên lịch</p>
            <button @click="addEventForDay" class="btn-add-event">
              <i class="fas fa-plus"></i>
              Thêm lịch cho ngày này
            </button>
          </div>

          <div v-else class="events-timeline">
            <div 
              v-for="event in sortedEvents" 
              :key="event.id"
              class="timeline-item"
              :class="{
                'class-event': event.type === 'class',
                'exam-event': event.type === 'exam',
                'conflict-event': event.hasConflict
              }"
            >
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="event-header">
                  <div class="event-time">
                    <i class="fas fa-clock"></i>
                    {{ event.timeSlot || getTimeFromSlots(event.scheduleDays) }}
                  </div>
                  <div class="event-type-badge">
                    <i :class="event.type === 'exam' ? 'fas fa-file-alt' : 'fas fa-chalkboard-teacher'"></i>
                    {{ event.type === 'exam' ? 'Lịch thi' : 'Lịch học' }}
                  </div>
                </div>
                
                <div class="event-main">
                  <h4 class="event-title">{{ event.subjectName }}</h4>
                  <div class="event-code">{{ event.subjectCode }}</div>
                </div>

                <div class="event-details">
                  <div class="detail-row">
                    <i class="fas fa-user"></i>
                    <span>{{ event.teacherName }}</span>
                  </div>
                  <div class="detail-row">
                    <i class="fas fa-door-open"></i>
                    <span>{{ event.roomName }}</span>
                  </div>
                  <div v-if="event.groupId" class="detail-row">
                    <i class="fas fa-users"></i>
                    <span>{{ getGroupName(event.groupId) }}</span>
                  </div>
                  <div v-if="event.notes" class="detail-row">
                    <i class="fas fa-sticky-note"></i>
                    <span>{{ event.notes }}</span>
                  </div>
                </div>

                <div v-if="event.hasConflict" class="conflict-warning">
                  <i class="fas fa-exclamation-triangle"></i>
                  <span>Có xung đột lịch học</span>
                </div>

                <div class="event-actions">
                  <button @click="editEvent(event)" class="action-btn primary">
                    <i class="fas fa-edit"></i>
                    Sửa
                  </button>
                  <button @click="viewEventDetails(event)" class="action-btn secondary">
                    <i class="fas fa-eye"></i>
                    Chi tiết
                  </button>
                  <button @click="duplicateEvent(event)" class="action-btn secondary">
                    <i class="fas fa-copy"></i>
                    Sao chép
                  </button>
                  <button @click="deleteEvent(event)" class="action-btn danger">
                    <i class="fas fa-trash"></i>
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="addEventForDay" class="btn-add-new">
            <i class="fas fa-plus"></i>
            Thêm lịch mới cho ngày này
          </button>
          <button @click="closeDayEventsModal" class="btn-close-modal">
            Đóng
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Đang tải lịch...</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'MonthlyCalendar',
  props: {
    schedules: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit:schedule', 'delete:schedule', 'view:details', 'add:schedule', 'duplicate:schedule'],
  setup(props, { emit }) {
    const currentDate = ref(new Date())
    const selectedDay = ref(null)
    const showDayEventsModal = ref(false)

    const dayHeaders = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

    // Current month/year display
    const currentMonthYear = computed(() => {
      return currentDate.value.toLocaleDateString('vi-VN', {
        month: 'long',
        year: 'numeric'
      })
    })

    // Generate calendar weeks
    const calendarWeeks = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      
      // First day of the month
      const firstDay = new Date(year, month, 1)
      // Last day of the month
      const lastDay = new Date(year, month + 1, 0)
      
      // Start from Sunday of the week containing the first day
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      // End on Saturday of the week containing the last day
      const endDate = new Date(lastDay)
      endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()))

      const weeks = []
      const current = new Date(startDate)
      
      while (current <= endDate) {
        const week = {
          id: `week-${current.getTime()}`,
          days: []
        }

        for (let i = 0; i < 7; i++) {
          const dayDate = new Date(current)
          const isCurrentMonth = dayDate.getMonth() === month
          const isToday = isSameDay(dayDate, new Date())
          const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6

          // Get events for this day
          const dayEvents = getEventsForDate(dayDate)

          week.days.push({
            date: dayDate.toISOString().split('T')[0],
            number: dayDate.getDate(),
            isCurrentMonth,
            isToday,
            isWeekend,
            events: dayEvents
          })

          current.setDate(current.getDate() + 1)
        }

        weeks.push(week)
      }

      return weeks
    })

    // Get events for a specific date
    const getEventsForDate = (date) => {
      const dateStr = date.toISOString().split('T')[0]
      const dayOfWeek = date.getDay() === 0 ? 8 : date.getDay() + 1 // Convert to our format (2-8)

      return props.schedules.filter(schedule => {
        // Check if schedule occurs on this day of week
        if (schedule.scheduleDays) {
          return schedule.scheduleDays.some(day => parseInt(day.day) === dayOfWeek)
        }
        // Fallback for old format
        return schedule.dayOfWeek === dayOfWeek
      }).map(schedule => ({
        ...schedule,
        hasConflict: checkForConflict(schedule, date)
      }))
    }

    // Check for conflicts (simplified)
    const checkForConflict = (schedule, date) => {
      // This would implement actual conflict detection logic
      return false
    }

    // Utility functions
    const isSameDay = (date1, date2) => {
      return date1.toDateString() === date2.toDateString()
    }

    const getEventTitle = (event) => {
      return `${event.subjectName} - ${event.teacherName} (${event.roomName})`
    }

    const formatSelectedDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // Navigation functions
    const previousMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
    }

    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
    }

    const goToToday = () => {
      currentDate.value = new Date()
      selectedDay.value = null
    }

    const selectDay = (day) => {
      selectedDay.value = day
      showDayEventsModal.value = true
    }

    const closeDayEventsModal = () => {
      showDayEventsModal.value = false
      selectedDay.value = null
    }

    const sortedEvents = computed(() => {
      if (!selectedDay.value) return []
      
      return selectedDay.value.events.sort((a, b) => {
        const timeA = a.timeSlot || getTimeFromSlots(a.scheduleDays)
        const timeB = b.timeSlot || getTimeFromSlots(b.scheduleDays)
        return timeA.localeCompare(timeB)
      })
    })

    const getTimeFromSlots = (scheduleDays) => {
      if (!scheduleDays || scheduleDays.length === 0) return '00:00'
      
      // Find the day that matches current selected day
      const currentDayOfWeek = new Date(selectedDay.value.date).getDay()
      const dayNum = currentDayOfWeek === 0 ? 8 : currentDayOfWeek + 1
      
      const daySchedule = scheduleDays.find(d => parseInt(d.day) === dayNum)
      if (daySchedule && daySchedule.slots && daySchedule.slots.length > 0) {
        // Get first slot time
        const firstSlot = daySchedule.slots[0]
        const timeSlotOptions = [
          { value: '1', time: '07:00-07:45' },
          { value: '2', time: '07:50-08:35' },
          { value: '3', time: '08:40-09:25' },
          { value: '4', time: '09:35-10:20' },
          { value: '5', time: '10:25-11:10' },
          { value: '6', time: '13:00-13:45' },
          { value: '7', time: '13:50-14:35' },
          { value: '8', time: '14:40-15:25' },
          { value: '9', time: '15:35-16:20' },
          { value: '10', time: '16:25-17:10' },
          { value: '11', time: '18:00-18:45' },
          { value: '12', time: '18:50-19:35' },
          { value: '13', time: '19:40-20:25' }
        ]
        
        const slot = timeSlotOptions.find(s => s.value === firstSlot)
        return slot ? slot.time : '00:00'
      }
      
      return '00:00'
    }

    const getGroupName = (groupId) => {
      const groupNames = {
        'group1': 'Nhóm 1',
        'group2': 'Nhóm 2', 
        'group3': 'Nhóm 3',
        'group4': 'Nhóm 4'
      }
      return groupNames[groupId] || groupId
    }

    const addEventForDay = () => {
      // Emit event to add new schedule for this specific day
      const dayOfWeek = new Date(selectedDay.value.date).getDay()
      const dayNum = dayOfWeek === 0 ? 8 : dayOfWeek + 1
      
      emit('add:schedule', {
        date: selectedDay.value.date,
        dayOfWeek: dayNum
      })
      closeDayEventsModal()
    }

    const editEvent = (event) => {
      emit('edit:schedule', event)
      closeDayEventsModal()
    }

    const viewEventDetails = (event) => {
      emit('view:details', event)
      closeDayEventsModal()
    }

    const duplicateEvent = (event) => {
      emit('duplicate:schedule', event)
      closeDayEventsModal()
    }

    const deleteEvent = (event) => {
      if (confirm(`Bạn có chắc muốn xóa lịch "${event.subjectName}"?`)) {
        emit('delete:schedule', event)
        closeDayEventsModal()
      }
    }

    return {
      currentDate,
      selectedDay,
      showDayEventsModal,
      dayHeaders,
      currentMonthYear,
      calendarWeeks,
      sortedEvents,
      getEventTitle,
      formatSelectedDate,
      getTimeFromSlots,
      getGroupName,
      previousMonth,
      nextMonth,
      goToToday,
      selectDay,
      closeDayEventsModal,
      addEventForDay,
      editEvent,
      viewEventDetails,
      duplicateEvent,
      deleteEvent
    }
  }
}
</script>

<style scoped>
.monthly-calendar {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.month-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  text-transform: capitalize;
}

.calendar-actions {
  display: flex;
  gap: 12px;
}

.btn-today,
.btn-add {
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 8px 16px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}

.btn-today:hover,
.btn-add:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.calendar-legend {
  display: flex;
  gap: 20px;
  padding: 16px 24px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.class-dot {
  background: #3b82f6;
}

.exam-dot {
  background: #ef4444;
}

.conflict-dot {
  background: #f59e0b;
}

.calendar-grid {
  padding: 0;
}

.day-headers {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f1f5f9;
  border-bottom: 1px solid #e2e8f0;
}

.day-header {
  padding: 12px;
  text-align: center;
  font-weight: 600;
  color: #475569;
  font-size: 14px;
}

.calendar-body {
  display: grid;
  grid-template-rows: repeat(auto-fit, minmax(120px, 1fr));
}

.calendar-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 120px;
  border-right: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.calendar-day:hover {
  background: #f8fafc;
}

.calendar-day.other-month {
  background: #f9fafb;
  color: #9ca3af;
}

.calendar-day.today {
  background: #dbeafe;
}

.calendar-day.today .day-number {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

.calendar-day.weekend {
  background: #fef7f0;
}

.calendar-day.has-events {
  cursor: pointer;
}

.calendar-day.has-events:hover {
  background: #f0f9ff;
  border-color: #0ea5e9;
}

.day-number {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.day-events {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.event-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.event-dot:hover {
  transform: scale(1.5);
}

.event-dot.class-event {
  background: #3b82f6;
}

.event-dot.exam-event {
  background: #ef4444;
}

.event-dot.conflict-event {
  background: #f59e0b;
  animation: pulse 2s infinite;
}

.more-events {
  font-size: 10px;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
  padding: 2px 4px;
  background: #e2e8f0;
  border-radius: 3px;
}

.selected-day-detail {
  padding: 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-header h3 {
  margin: 0;
  color: #1e293b;
  font-size: 18px;
}

.close-detail {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-detail:hover {
  background: #e2e8f0;
  color: #374151;
}

.day-schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid #3b82f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.schedule-item.exam-item {
  border-left-color: #ef4444;
}

.schedule-time {
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  min-width: 100px;
}

.schedule-info {
  flex: 1;
}

.schedule-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 4px;
}

.schedule-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.schedule-meta span {
  display: flex;
  align-items: center;
  gap: 4px;
}

.schedule-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f1f5f9;
}

.action-btn.edit:hover {
  color: #3b82f6;
}

.action-btn.view:hover {
  color: #059669;
}

.action-btn.delete:hover {
  color: #ef4444;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
}

.loading-spinner i {
  font-size: 24px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive */
/* Day Events Modal */
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

.day-events-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-title i {
  font-size: 20px;
}

.modal-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.modal-title p {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.close-modal {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-modal:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  color: #64748b;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: #cbd5e1;
}

.empty-state h4 {
  margin: 0 0 8px 0;
  color: #374151;
}

.empty-state p {
  margin: 0 0 20px 0;
  font-size: 14px;
}

.btn-add-event {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-add-event:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.events-timeline {
  padding: 20px;
}

.timeline-item {
  position: relative;
  padding-left: 32px;
  padding-bottom: 24px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 24px;
  bottom: -24px;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item:last-child::before {
  display: none;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 16px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #e2e8f0;
}

.timeline-item.class-event .timeline-dot {
  background: #3b82f6;
  box-shadow: 0 0 0 2px #3b82f6;
}

.timeline-item.exam-event .timeline-dot {
  background: #ef4444;
  box-shadow: 0 0 0 2px #ef4444;
}

.timeline-item.conflict-event .timeline-dot {
  background: #f59e0b;
  box-shadow: 0 0 0 2px #f59e0b;
  animation: pulse 2s infinite;
}

.timeline-content {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-left: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.timeline-item.class-event .timeline-content {
  border-left: 4px solid #3b82f6;
}

.timeline-item.exam-event .timeline-content {
  border-left: 4px solid #ef4444;
}

.timeline-item.conflict-event .timeline-content {
  border-left: 4px solid #f59e0b;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.event-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
}

.event-type-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f1f5f9;
  color: #475569;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.event-main {
  margin-bottom: 12px;
}

.event-title {
  margin: 0 0 4px 0;
  color: #1e293b;
  font-size: 16px;
  font-weight: 600;
}

.event-code {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
  background: #f8fafc;
  padding: 2px 6px;
  border-radius: 3px;
  display: inline-block;
}

.event-details {
  margin-bottom: 16px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 14px;
  color: #64748b;
}

.detail-row i {
  width: 16px;
  color: #9ca3af;
}

.conflict-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fef3c7;
  color: #92400e;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 16px;
}

.event-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.primary:hover {
  background: #2563eb;
}

.action-btn.secondary {
  background: #f1f5f9;
  color: #64748b;
  border-color: #e2e8f0;
}

.action-btn.secondary:hover {
  background: #e2e8f0;
  color: #374151;
}

.action-btn.danger {
  background: #fef2f2;
  color: #dc2626;
  border-color: #fecaca;
}

.action-btn.danger:hover {
  background: #fee2e2;
  border-color: #f87171;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.btn-add-new {
  background: #059669;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-add-new:hover {
  background: #047857;
}

.btn-close-modal {
  background: #6b7280;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-close-modal:hover {
  background: #4b5563;
}

@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .calendar-legend {
    flex-wrap: wrap;
    justify-content: center;
  }

  .calendar-day {
    min-height: 80px;
    padding: 4px;
  }

  .day-events-modal {
    margin: 10px;
    max-height: 90vh;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-title {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .event-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .event-actions {
    justify-content: center;
  }

  .modal-footer {
    flex-direction: column;
    gap: 12px;
  }
}
</style>