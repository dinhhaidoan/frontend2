<template>
  <div class="weekly-view">
    <div class="weekly-header">
      <h2>Lịch dạy tuần</h2>
      <div class="week-navigation">
        <button @click="prevWeek" class="nav-btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="week-text">{{ weekRange }}</span>
        <button @click="nextWeek" class="nav-btn">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div class="calendar-grid">
      <div class="time-column">
        <div class="time-header">Giờ</div>
        <div 
          v-for="hour in timeSlots"
          :key="hour"
          class="time-slot"
        >
          {{ hour }}:00
        </div>
      </div>

      <div 
        v-for="day in weekDays"
        :key="day.date"
        class="day-column"
      >
        <div :class="['day-header', { today: day.isToday }]">
          <div class="day-name">{{ day.name }}</div>
          <div class="day-date">{{ day.dateText }}</div>
        </div>
        
        <div class="day-schedule">
          <div 
            v-for="schedule in day.schedules"
            :key="schedule.id"
            :class="['schedule-block', schedule.type]"
            :style="{
              top: calculateTop(schedule.startTime) + 'px',
              height: calculateHeight(schedule.startTime, schedule.endTime) + 'px'
            }"
            @click="handleScheduleClick(schedule)"
          >
            <div class="schedule-time">{{ schedule.startTime }} - {{ schedule.endTime }}</div>
            <div class="schedule-subject">{{ schedule.subject }}</div>
            <div class="schedule-room">
              <i class="fas fa-door-open"></i>
              {{ schedule.room }}
            </div>
            <div class="schedule-class">{{ schedule.class }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  date: {
    type: Date,
    default: () => new Date()
  }
})

const emit = defineEmits(['schedule-click'])

const currentWeekStart = ref(getWeekStart(props.date))

// react to parent date changes
watch(() => props.date, (newDate) => {
  currentWeekStart.value = getWeekStart(new Date(newDate))
})
const timeSlots = Array.from({ length: 13 }, (_, i) => i + 7) // 7:00 - 19:00

// Mock weekly schedules (sample for Oct 20-26, 2025)
const weeklySchedules = ref({
  '2025-10-20': [
    { id: 101, subject: 'Lập trình hướng đối tượng', class: 'DHKTPM17A', room: 'A201', startTime: '07:30', endTime: '09:30', type: 'theory' },
    { id: 102, subject: 'Cấu trúc dữ liệu và giải thuật', class: 'DHKTPM17B', room: 'B101', startTime: '10:00', endTime: '12:00', type: 'theory' }
  ],
  '2025-10-21': [
    { id: 103, subject: 'Thực hành CSDL', class: 'DHKTPM17C', room: 'Lab2', startTime: '13:30', endTime: '15:30', type: 'practice' }
  ],
  '2025-10-22': [
    { id: 104, subject: 'Mạng máy tính', class: 'DHKTPM18A', room: 'A302', startTime: '07:30', endTime: '09:30', type: 'theory' },
    { id: 105, subject: 'Web Programming', class: 'DHKTPM18B', room: 'Lab1', startTime: '15:45', endTime: '17:45', type: 'practice' }
  ],
  '2025-10-23': [
    { id: 106, subject: 'Lập trình hướng đối tượng', class: 'DHKTPM17A', room: 'A201', startTime: '10:00', endTime: '12:00', type: 'theory' }
  ],
  '2025-10-24': [
    { id: 107, subject: 'Cấu trúc dữ liệu và giải thuật', class: 'DHKTPM17B', room: 'B101', startTime: '13:30', endTime: '15:30', type: 'theory' }
  ],
  '2025-10-25': [
    { id: 108, subject: 'Mạng máy tính - Bổ sung', class: 'DHKTPM18A', room: 'A302', startTime: '08:00', endTime: '09:30', type: 'theory' },
    { id: 109, subject: 'Hướng dẫn Lab: CSDL', class: 'DHKTPM17C', room: 'Lab2', startTime: '14:00', endTime: '16:00', type: 'practice' }
  ],
  '2025-10-26': [
    { id: 110, subject: 'Web Programming - Lab', class: 'DHKTPM18B', room: 'Lab1', startTime: '09:00', endTime: '11:00', type: 'practice' }
  ]
})

function getWeekStart(date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is sunday
  return new Date(d.setDate(diff))
}

const weekRange = computed(() => {
  const start = new Date(currentWeekStart.value)
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  
  const formatDate = (d) => {
    return `${d.getDate()}/${d.getMonth() + 1}`
  }
  
  return `${formatDate(start)} - ${formatDate(end)}`
})

const weekDays = computed(() => {
  const days = []
  const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
  const today = new Date()
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + i)
    
    const dateStr = formatDateKey(date)
    const isToday = date.toDateString() === today.toDateString()
    
    days.push({
      name: dayNames[date.getDay()],
      date: date,
      dateText: `${date.getDate()}/${date.getMonth() + 1}`,
      isToday: isToday,
      schedules: weeklySchedules.value[dateStr] || []
    })
  }
  
  return days
})

function formatDateKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function calculateTop(time) {
  const [hours, minutes] = time.split(':').map(Number)
  const totalMinutes = (hours - 7) * 60 + minutes
  return (totalMinutes / 60) * 60 // 60px per hour
}

function calculateHeight(startTime, endTime) {
  const [startHours, startMinutes] = startTime.split(':').map(Number)
  const [endHours, endMinutes] = endTime.split(':').map(Number)
  
  const startTotal = startHours * 60 + startMinutes
  const endTotal = endHours * 60 + endMinutes
  const duration = endTotal - startTotal
  
  return (duration / 60) * 60 - 4 // 60px per hour, minus 4px for margin
}

const prevWeek = () => {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() - 7)
  currentWeekStart.value = newStart
}

const nextWeek = () => {
  const newStart = new Date(currentWeekStart.value)
  newStart.setDate(newStart.getDate() + 7)
  currentWeekStart.value = newStart
}

const handleScheduleClick = (schedule) => {
  emit('schedule-click', schedule)
}
</script>

<style scoped>
.weekly-view {
  height: 100%;
}

.weekly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.weekly-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.week-navigation {
  display: flex;
  align-items: center;
  gap: 12px;
}

.week-text {
  font-weight: 500;
  color: #6b7280;
  min-width: 120px;
  text-align: center;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.nav-btn:hover {
  background: #f9fafb;
  border-color: #3b82f6;
  color: #3b82f6;
}

.calendar-grid {
  display: grid;
  /* keep time column then 7 day columns with a sensible minimum so columns don't collapse
     allowing horizontal scroll when the container is too narrow */
  grid-template-columns: 60px repeat(7, minmax(140px, 1fr));
  gap: 1px;
  background: #e5e7eb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  /* allow horizontal scrolling to reveal clipped days */
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.time-column {
  background: white;
}

.time-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #6b7280;
  font-size: 12px;
  background: #f9fafb;
}

.time-slot {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: #9ca3af;
  border-top: 1px solid #f3f4f6;
}

.day-column {
  background: white;
  min-width: 120px;
}

.day-header {
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.day-header.today {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.day-name {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 2px;
}

.day-date {
  font-size: 11px;
  opacity: 0.8;
}

.day-schedule {
  position: relative;
  height: calc(60px * 13);
}

.schedule-block {
  position: absolute;
  left: 2px;
  right: 2px;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  overflow: hidden;
  font-size: 11px;
  line-height: 1.4;
}

.schedule-block.theory {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-left: 3px solid #3b82f6;
}

.schedule-block.practice {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  border-left: 3px solid #10b981;
}

.schedule-block.lab {
  background: linear-gradient(135deg, #fce7f3, #fbcfe8);
  border-left: 3px solid #ec4899;
}

.schedule-block:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.schedule-time {
  font-weight: 600;
  color: #374151;
  margin-bottom: 4px;
}

.schedule-subject {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.schedule-room {
  color: #6b7280;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.schedule-class {
  color: #6b7280;
}

@media (max-width: 1200px) {
  .calendar-grid {
    overflow-x: auto;
  }
}
</style>
