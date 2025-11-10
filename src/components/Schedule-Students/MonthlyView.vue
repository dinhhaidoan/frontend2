<template>
  <div class="monthly-view">
    <div class="monthly-header">
      <h2>Lịch tháng</h2>
      <div class="month-navigation">
        <button @click="prevMonth" class="nav-btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        <span class="month-text">{{ monthYearText }}</span>
        <button @click="nextMonth" class="nav-btn">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>

    <div class="calendar-container">
      <div class="weekdays">
        <div v-for="day in weekdays" :key="day" class="weekday">{{ day }}</div>
      </div>

      <div class="calendar-days">
        <div 
          v-for="(day, index) in calendarDays"
          :key="index"
          :class="['calendar-day', {
            'other-month': day.otherMonth,
            'today': day.isToday,
            'has-schedule': day.schedules && day.schedules.length > 0
          }]"
          @click="selectDay(day)"
        >
          <div class="day-number">{{ day.day }}</div>
          
          <div v-if="day.schedules && day.schedules.length > 0" class="day-schedules">
            <div 
              v-for="(schedule, idx) in day.schedules.slice(0, 3)"
              :key="idx"
              :class="['schedule-pill', schedule.type]"
            >
              {{ schedule.time }} - {{ schedule.subject }}
            </div>
            <div v-if="day.schedules.length > 3" class="more-schedules">
              +{{ day.schedules.length - 3 }} lịch khác
            </div>
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

const currentMonth = ref(props.date.getMonth())
const currentYear = ref(props.date.getFullYear())

// update month/year when parent date changes
watch(() => props.date, (d) => {
  const dt = new Date(d)
  currentMonth.value = dt.getMonth()
  currentYear.value = dt.getFullYear()
})

const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// Mock monthly schedules (sample data for Oct 2025)
const monthlySchedules = ref({
  '2025-10-05': [
    { id: 201, startTime: '07:30', endTime: '09:00', time: '07:30', subject: 'Lập trình OOP', class: 'DHKTPM17A', room: 'A201', type: 'theory' }
  ],
  '2025-10-10': [
    { id: 202, startTime: '10:00', endTime: '12:00', time: '10:00', subject: 'Cấu trúc dữ liệu và giải thuật', class: 'DHKTPM17A', room: 'B101', type: 'theory' }
  ],
  '2025-10-12': [
    { id: 203, startTime: '13:30', endTime: '15:30', time: '13:30', subject: 'Thực hành CSDL', class: 'DHKTPM17A', room: 'Lab2', type: 'practice' }
  ],
  '2025-10-15': [
    { id: 204, startTime: '07:30', endTime: '09:30', time: '07:30', subject: 'Mạng máy tính', class: 'DHKTPM17A', room: 'A302', type: 'theory' },
    { id: 205, startTime: '15:45', endTime: '17:45', time: '15:45', subject: 'Web Programming', class: 'DHKTPM17A', room: 'Lab1', type: 'practice' }
  ],
  '2025-10-20': [
    { id: 206, startTime: '07:30', endTime: '09:30', time: '07:30', subject: 'Lập trình hướng đối tượng', class: 'DHKTPM17A', room: 'A201', type: 'theory' },
    { id: 207, startTime: '10:00', endTime: '12:00', time: '10:00', subject: 'CTDL & GT', class: 'DHKTPM17A', room: 'B101', type: 'theory' }
  ],
  '2025-10-21': [
    { id: 208, startTime: '13:30', endTime: '15:30', time: '13:30', subject: 'Thực hành CSDL', class: 'DHKTPM17A', room: 'Lab2', type: 'practice' }
  ],
  '2025-10-22': [
    { id: 209, startTime: '07:30', endTime: '09:30', time: '07:30', subject: 'Mạng máy tính', class: 'DHKTPM17A', room: 'A302', type: 'theory' },
    { id: 210, startTime: '15:45', endTime: '17:45', time: '15:45', subject: 'Web Programming', class: 'DHKTPM17A', room: 'Lab1', type: 'practice' }
  ],
  '2025-10-25': [
    { id: 211, startTime: '08:00', endTime: '09:30', time: '08:00', subject: 'Mạng máy tính - Bổ sung', class: 'DHKTPM17A', room: 'A302', type: 'theory' },
    { id: 212, startTime: '14:00', endTime: '16:00', time: '14:00', subject: 'Hướng dẫn Lab: CSDL', class: 'DHKTPM17A', room: 'Lab2', type: 'practice' }
  ],
  '2025-10-28': [
    { id: 213, startTime: '09:00', endTime: '11:00', time: '09:00', subject: 'Web Programming - Lab', class: 'DHKTPM17A', room: 'Lab1', type: 'practice' }
  ]
})

const monthYearText = computed(() => {
  const months = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12']
  return `${months[currentMonth.value]} ${currentYear.value}`
})

const calendarDays = computed(() => {
  const days = []
  const firstDay = new Date(currentYear.value, currentMonth.value, 1)
  const lastDay = new Date(currentYear.value, currentMonth.value + 1, 0)
  const prevLastDay = new Date(currentYear.value, currentMonth.value, 0)
  
  const firstDayOfWeek = firstDay.getDay()
  const lastDate = lastDay.getDate()
  const prevLastDate = prevLastDay.getDate()

  // Previous month days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevLastDate - i,
      otherMonth: true,
      isToday: false,
      schedules: []
    })
  }

  // Current month days
  const today = new Date()
  for (let i = 1; i <= lastDate; i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    const dateStr = formatDateKey(date)
    const isToday = isSameDay(date, today)
    
    days.push({
      day: i,
      date: date,
      otherMonth: false,
      isToday: isToday,
      schedules: monthlySchedules.value[dateStr] || []
    })
  }

  // Next month days
  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      otherMonth: true,
      isToday: false,
      schedules: []
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

function isSameDay(date1, date2) {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const selectDay = (day) => {
  if (!day.otherMonth && day.date) {
      if (day.schedules && day.schedules.length > 0) {
        // Emit the first schedule object so parent can open the schedule modal
        const s = { ...day.schedules[0], date: day.date }
        emit('schedule-click', s)
      } else {
        // emit a bare day object (no schedules)
        emit('schedule-click', { date: day.date })
      }
  }
}
</script>

<style scoped>
.monthly-view {
  height: 100%;
}

.monthly-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.monthly-header h2 {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.month-navigation {
  display: flex;
  align-items: center;
  gap: 12px;
}

.month-text {
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

.calendar-container {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, minmax(120px, 1fr));
  gap: 6px;
  margin-bottom: 6px;
}

.weekday {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  padding: 12px 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, minmax(120px, 1fr));
  gap: 6px;
}

.calendar-day {
  min-height: 56px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  display: flex;
  flex-direction: column;
}

.calendar-day:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.calendar-day.other-month {
  background: #f9fafb;
  opacity: 0.5;
}

.calendar-day.other-month:hover {
  border-color: #e5e7eb;
  box-shadow: none;
}

.calendar-day.today {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #3b82f6;
}

.calendar-day.has-schedule {
  background: linear-gradient(135deg, #fefce8, #fef9c3);
}

.day-number {
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
  font-size: 12px;
}

.calendar-day.other-month .day-number {
  color: #9ca3af;
}

.calendar-day.today .day-number {
  color: #1e40af;
}

.day-schedules {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.schedule-pill {
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 8px;
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.schedule-pill.theory {
  background: #dbeafe;
  color: #1e40af;
}

.schedule-pill.practice {
  background: #d1fae5;
  color: #065f46;
}

.schedule-pill.lab {
  background: #fce7f3;
  color: #9f1239;
}

.more-schedules {
  font-size: 10px;
  color: #6b7280;
  text-align: center;
  padding: 2px 0;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .calendar-day {
    min-height: 70px;
    padding: 4px;
  }
  
  .schedule-pill {
    font-size: 8px;
    padding: 2px 4px;
  }
  
  .day-number {
    font-size: 13px;
  }
}

@media (max-width: 768px) {
  .calendar-day {
    min-height: 60px;
    padding: 3px;
  }
  
  .day-schedules {
    gap: 1px;
  }
  
  .schedule-pill {
    font-size: 8px;
    padding: 2px 3px;
  }
  
  .day-number {
    font-size: 12px;
    margin-bottom: 3px;
  }
}
</style>
