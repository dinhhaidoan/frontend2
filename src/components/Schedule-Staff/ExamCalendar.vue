<template>
  <div class="exam-calendar">
    <div class="calendar-header">
      <div class="calendar-nav">
        <button @click="previousMonth" class="nav-btn">
          <i class="fas fa-chevron-left"></i>
        </button>
        <div class="current-month">
          <h3>{{ monthTitle }}</h3>
        </div>
        <button @click="nextMonth" class="nav-btn">
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="view-controls">
        <button @click="goToToday" class="btn-today">Hôm nay</button>
        <div class="exam-legend">
          <div class="legend-item">
            <span class="legend-color midterm"></span>
            <span>Giữa kỳ</span>
          </div>
          <div class="legend-item">
            <span class="legend-color final"></span>
            <span>Cuối kỳ</span>
          </div>
          <div class="legend-item">
            <span class="legend-color makeup"></span>
            <span>Thi lại</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Đang tải lịch thi...</p>
    </div>

    <!-- Calendar Grid -->
    <div v-else class="calendar-grid">
      <!-- Day Headers -->
      <div class="day-names">
        <div v-for="dayName in dayNames" :key="dayName" class="day-name">
          {{ dayName }}
        </div>
      </div>

      <!-- Calendar Days -->
      <div class="calendar-days">
        <div 
          v-for="day in calendarDays" 
          :key="day.date"
          class="calendar-day"
          :class="getDayClass(day)"
        >
          <div class="day-number">{{ day.dayNumber }}</div>
          
          <!-- Exam Events -->
          <div class="exam-events">
            <div 
              v-for="exam in getDayExams(day.date)" 
              :key="exam.id"
              class="exam-event"
              :class="getExamClass(exam)"
              @click="$emit('view:details', exam)"
            >
              <div class="exam-info">
                <div class="exam-subject">{{ exam.subjectCode }}</div>
                <div class="exam-time">{{ exam.startTime }}</div>
                <div class="exam-room">{{ exam.roomName }}</div>
              </div>
              <div class="exam-actions">
                <button @click.stop="$emit('edit:exam', exam)" class="action-btn edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click.stop="$emit('delete:exam', exam)" class="action-btn delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- More exams indicator -->
          <div 
            v-if="getDayExams(day.date).length > 2" 
            class="more-exams"
            @click="showMoreExams(day.date)"
          >
            +{{ getDayExams(day.date).length - 2 }} khác
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && exams.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-file-alt"></i>
      </div>
      <h3>Chưa có lịch thi nào</h3>
      <p>Bắt đầu tạo lịch thi cho học kỳ này</p>
    </div>

    <!-- Exam Details Modal -->
    <div v-if="showExamsModal" class="exams-modal-overlay" @click="closeExamsModal">
      <div class="exams-modal" @click.stop>
        <div class="modal-header">
          <h3>Lịch thi ngày {{ formatSelectedDate }}</h3>
          <button @click="closeExamsModal" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div 
            v-for="exam in selectedDateExams" 
            :key="exam.id"
            class="exam-item"
          >
            <div class="exam-details">
              <div class="exam-main">
                <h4>{{ exam.subjectName }}</h4>
                <div class="exam-meta">
                  <span class="exam-type" :class="exam.examType">{{ exam.examTypeName }}</span>
                  <span class="exam-time">{{ exam.startTime }} - {{ exam.endTime }}</span>
                  <span class="exam-room">{{ exam.roomName }}</span>
                </div>
              </div>
              <div class="exam-stats">
                <span class="student-count">{{ exam.registeredStudents }}/{{ exam.maxStudents }}</span>
                <span class="teacher">{{ exam.teacherName }}</span>
              </div>
            </div>
            <div class="exam-actions">
              <button @click="$emit('edit:exam', exam)" class="btn-edit">
                <i class="fas fa-edit"></i>
                Sửa
              </button>
              <button @click="$emit('view:details', exam)" class="btn-view">
                <i class="fas fa-eye"></i>
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'ExamCalendar',
  props: {
    exams: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['edit:exam', 'delete:exam', 'view:details'],
  setup(props) {
    const currentMonth = ref(new Date())
    const showExamsModal = ref(false)
    const selectedDate = ref(null)

    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

    const monthTitle = computed(() => {
      return currentMonth.value.toLocaleDateString('vi-VN', { 
        month: 'long', 
        year: 'numeric' 
      })
    })

    const calendarDays = computed(() => {
      const year = currentMonth.value.getFullYear()
      const month = currentMonth.value.getMonth()
      
      // Get first day of month and calculate starting point
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const startDate = new Date(firstDay)
      
      // Start from Sunday of the week containing the 1st
      startDate.setDate(startDate.getDate() - startDate.getDay())
      
      const days = []
      const current = new Date(startDate)
      
      // Generate 42 days (6 weeks)
      for (let i = 0; i < 42; i++) {
        days.push({
          date: new Date(current),
          dayNumber: current.getDate(),
          isCurrentMonth: current.getMonth() === month,
          isToday: isToday(current)
        })
        current.setDate(current.getDate() + 1)
      }
      
      return days
    })

    const selectedDateExams = computed(() => {
      if (!selectedDate.value) return []
      
      const dateStr = selectedDate.value.toISOString().split('T')[0]
      return props.exams.filter(exam => exam.date === dateStr)
    })

    const formatSelectedDate = computed(() => {
      if (!selectedDate.value) return ''
      
      return selectedDate.value.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      })
    })

    const isToday = (date) => {
      const today = new Date()
      return date.toDateString() === today.toDateString()
    }

    const getDayClass = (day) => {
      const classes = []
      
      if (!day.isCurrentMonth) classes.push('other-month')
      if (day.isToday) classes.push('today')
      if (getDayExams(day.date).length > 0) classes.push('has-exams')
      
      return classes
    }

    const getDayExams = (date) => {
      const dateStr = date.toISOString().split('T')[0]
      return props.exams.filter(exam => exam.date === dateStr)
    }

    const getExamClass = (exam) => {
      return `exam-type-${exam.examType}`
    }

    const showMoreExams = (date) => {
      selectedDate.value = date
      showExamsModal.value = true
    }

    const closeExamsModal = () => {
      showExamsModal.value = false
      selectedDate.value = null
    }

    const previousMonth = () => {
      const newMonth = new Date(currentMonth.value)
      newMonth.setMonth(newMonth.getMonth() - 1)
      currentMonth.value = newMonth
    }

    const nextMonth = () => {
      const newMonth = new Date(currentMonth.value)
      newMonth.setMonth(newMonth.getMonth() + 1)
      currentMonth.value = newMonth
    }

    const goToToday = () => {
      currentMonth.value = new Date()
    }

    return {
      currentMonth,
      showExamsModal,
      selectedDate,
      dayNames,
      monthTitle,
      calendarDays,
      selectedDateExams,
      formatSelectedDate,
      getDayClass,
      getDayExams,
      getExamClass,
      showMoreExams,
      closeExamsModal,
      previousMonth,
      nextMonth,
      goToToday
    }
  }
}
</script>

<style scoped>
.exam-calendar {
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

.current-month h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
  text-transform: capitalize;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 16px;
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

.exam-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-color.midterm {
  background: #3b82f6;
}

.legend-color.final {
  background: #f59e0b;
}

.legend-color.makeup {
  background: #ef4444;
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
  padding: 0;
}

.day-names {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: #f8fafc;
  border-bottom: 1px solid #e5e7eb;
}

.day-name {
  padding: 12px;
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 120px;
  border-right: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
  padding: 8px;
  position: relative;
  background: white;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day.other-month {
  background: #fafbfc;
  color: #9ca3af;
}

.calendar-day.today {
  background: #f0f9ff;
}

.calendar-day.today .day-number {
  background: #3b82f6;
  color: white;
}

.calendar-day.has-exams {
  border-left: 3px solid #3b82f6;
}

.day-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.exam-events {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exam-event {
  background: #dbeafe;
  border: 1px solid #3b82f6;
  border-radius: 4px;
  padding: 4px 6px;
  font-size: 10px;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.exam-event:hover {
  transform: scale(1.02);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.exam-event.exam-type-midterm {
  background: #dbeafe;
  border-color: #3b82f6;
}

.exam-event.exam-type-final {
  background: #fef3c7;
  border-color: #f59e0b;
}

.exam-event.exam-type-makeup {
  background: #fef2f2;
  border-color: #ef4444;
}

.exam-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.exam-subject {
  font-weight: 600;
  color: #1e40af;
  line-height: 1.2;
}

.exam-event.exam-type-final .exam-subject {
  color: #92400e;
}

.exam-event.exam-type-makeup .exam-subject {
  color: #dc2626;
}

.exam-time,
.exam-room {
  color: #6b7280;
  font-size: 9px;
}

.exam-actions {
  position: absolute;
  top: 2px;
  right: 2px;
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.exam-event:hover .exam-actions {
  opacity: 1;
}

.action-btn {
  width: 16px;
  height: 16px;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
}

.action-btn.edit {
  background: #3b82f6;
  color: white;
}

.action-btn.delete {
  background: #ef4444;
  color: white;
}

.more-exams {
  font-size: 10px;
  color: #6b7280;
  cursor: pointer;
  padding: 2px 4px;
  text-align: center;
  border-radius: 3px;
  background: #f3f4f6;
  margin-top: 2px;
}

.more-exams:hover {
  background: #e5e7eb;
  color: #374151;
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

/* Exams Modal */
.exams-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
}

.exams-modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.exam-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 12px;
}

.exam-item:last-child {
  margin-bottom: 0;
}

.exam-details {
  flex: 1;
}

.exam-main h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
}

.exam-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.exam-type {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.exam-type.midterm {
  background: #dbeafe;
  color: #1e40af;
}

.exam-type.final {
  background: #fef3c7;
  color: #92400e;
}

.exam-type.makeup {
  background: #fef2f2;
  color: #dc2626;
}

.exam-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: right;
  margin: 8px 0;
  font-size: 12px;
  color: #6b7280;
}

.exam-actions {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-view {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-edit {
  background: #3b82f6;
  color: white;
}

.btn-edit:hover {
  background: #2563eb;
}

.btn-view {
  background: #f1f5f9;
  color: #475569;
  border: 1px solid #e2e8f0;
}

.btn-view:hover {
  background: #e2e8f0;
}

/* Responsive */
@media (max-width: 768px) {
  .calendar-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .view-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .exam-legend {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .calendar-day {
    min-height: 100px;
    padding: 4px;
  }
  
  .exam-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .exam-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>