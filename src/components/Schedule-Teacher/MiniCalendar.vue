<template>
  <div class="mini-calendar">
    <div class="calendar-header">
      <button @click="prevMonth" class="nav-btn">
        <i class="fas fa-chevron-left"></i>
      </button>
      <div class="month-year">
        {{ monthYearText }}
      </div>
      <button @click="nextMonth" class="nav-btn">
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <div class="calendar-weekdays">
      <div v-for="day in weekdays" :key="day" class="weekday">
        {{ day }}
      </div>
    </div>

    <div class="calendar-days">
      <div 
        v-for="(day, index) in calendarDays"
        :key="index"
        :class="['calendar-day', {
          'other-month': day.otherMonth,
          'today': day.isToday,
          'selected': day.isSelected,
          'has-schedule': day.hasSchedule
        }]"
        @click="selectDate(day)"
      >
        <span class="day-number">{{ day.day }}</span>
        <span v-if="day.hasSchedule" class="schedule-dot"></span>
      </div>
    </div>

    <div class="calendar-legend">
      <div class="legend-item">
        <span class="legend-dot schedule"></span>
        <span class="legend-text">Có lịch dạy</span>
      </div>
      <div class="legend-item">
        <span class="legend-dot today"></span>
        <span class="legend-text">Hôm nay</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  selectedDate: {
    type: Date,
    default: () => new Date()
  }
})

const emit = defineEmits(['date-change'])

const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())

const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// Mock schedule dates (Oct 2025 - matches MonthlyView mock data)
const scheduleDates = ref([
  '2025-10-05', '2025-10-10', '2025-10-12', '2025-10-15', '2025-10-20',
  '2025-10-21', '2025-10-22', '2025-10-25', '2025-10-28'
])

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
      isSelected: false,
      hasSchedule: false
    })
  }

  // Current month days
  const today = new Date()
  for (let i = 1; i <= lastDate; i++) {
    const date = new Date(currentYear.value, currentMonth.value, i)
    const dateString = formatDate(date)
    
    days.push({
      day: i,
      date: date,
      otherMonth: false,
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, props.selectedDate),
      hasSchedule: scheduleDates.value.includes(dateString)
    })
  }

  // Next month days
  const remainingDays = 42 - days.length // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      otherMonth: true,
      isToday: false,
      isSelected: false,
      hasSchedule: false
    })
  }

  return days
})

const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear()
}

const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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

const selectDate = (day) => {
  if (!day.otherMonth && day.date) {
    emit('date-change', day.date)
  }
}
</script>

<style scoped>
.mini-calendar {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.month-year {
  font-weight: 600;
  color: #111827;
  font-size: 15px;
}

.nav-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.nav-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
}

.weekday {
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  padding: 8px 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  font-size: 13px;
}

.calendar-day:hover {
  background: #f3f4f6;
}

.calendar-day.other-month {
  color: #d1d5db;
  cursor: default;
}

.calendar-day.other-month:hover {
  background: transparent;
}

.calendar-day.today {
  background: #dbeafe;
  color: #1e40af;
  font-weight: 600;
}

.calendar-day.selected {
  background: #3b82f6;
  color: white;
  font-weight: 600;
}

.calendar-day.has-schedule .day-number {
  font-weight: 600;
}

.schedule-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #3b82f6;
  position: absolute;
  bottom: 4px;
}

.calendar-day.selected .schedule-dot {
  background: white;
}

.calendar-legend {
  display: flex;
  gap: 16px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.legend-dot.schedule {
  background: #3b82f6;
}

.legend-dot.today {
  background: #dbeafe;
  border: 2px solid #1e40af;
}

.legend-text {
  font-size: 11px;
  color: #6b7280;
}
</style>
