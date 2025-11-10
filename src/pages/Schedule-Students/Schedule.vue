<template>
  <div class="student-schedule-container">
    <div class="top-section">
      <QuickStats :stats="stats" />
    </div>
    <div class="main-section">
      <div class="sidebar">
        <MiniCalendar :selected-date="selectedDate" @date-change="handleDateChange" />
        <ScheduleFilters :filters="filters" @update="updateFilters" />
      </div>
      <div class="content-area">
        <div class="view-header">
          <div class="view-tabs">
            <button v-for="view in views" :key="view.id" :class="['view-tab', { active: currentView === view.id }]" @click="switchView(view.id)">
              <i :class="view.icon"></i>{{ view.label }}
            </button>
          </div>
          <div class="view-actions">
            <button @click="refreshSchedule" class="btn-action"><i class="fas fa-sync-alt"></i>Làm mới</button>
            <button @click="exportSchedule" class="btn-action primary"><i class="fas fa-download"></i>Xuất lịch</button>
          </div>
        </div>
        <div class="view-content">
          <Transition name="slide-fade" mode="out-in">
            <component :is="currentComponent" :key="currentView" :date="selectedDate" :filters="filters" @schedule-click="openScheduleDetail" @class-click="openClassDetail" @date-change="handleDateChange" />
          </Transition>
        </div>
      </div>
    </div>
    <ScheduleDetailModal v-if="showScheduleModal" :schedule="selectedSchedule" @close="closeScheduleModal" />
    <ClassDetailModal v-if="showClassModal" :class-data="selectedClass" @close="closeClassModal" />
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import QuickStats from '@/components/Schedule-Students/QuickStats.vue'
import MiniCalendar from '@/components/Schedule-Students/MiniCalendar.vue'
import ScheduleFilters from '@/components/Schedule-Students/ScheduleFilters.vue'
import DailyView from '@/components/Schedule-Students/DailyView.vue'
import WeeklyView from '@/components/Schedule-Students/WeeklyView.vue'
import MonthlyView from '@/components/Schedule-Students/MonthlyView.vue'
import ScheduleDetailModal from '@/components/Schedule-Students/ScheduleDetailModal.vue'
import ClassDetailModal from '@/components/Schedule-Students/ClassDetailModal.vue'
const router = useRouter()
const currentView = ref('daily')
const selectedDate = ref(new Date())
const showScheduleModal = ref(false)
const showClassModal = ref(false)
const selectedSchedule = ref(null)
const selectedClass = ref(null)
const filters = ref({ classType: 'all', subject: 'all', status: 'all' })
const stats = ref({ todayClasses: 3, weekClasses: 12, totalCredits: 18, upcomingExams: 2, pendingAssignments: 5, attendance: 92 })
const views = [
  { id: 'daily', label: 'Ngày', icon: 'fas fa-calendar-day' },
  { id: 'weekly', label: 'Tuần', icon: 'fas fa-calendar-week' },
  { id: 'monthly', label: 'Tháng', icon: 'fas fa-calendar-alt' }
]
const currentComponent = computed(() => {
  const componentMap = { daily: DailyView, weekly: WeeklyView, monthly: MonthlyView }
  return componentMap[currentView.value] || DailyView
})
const switchView = (viewId) => { currentView.value = viewId }
const handleDateChange = (date) => { selectedDate.value = date }
const updateFilters = (newFilters) => { filters.value = { ...filters.value, ...newFilters } }
const refreshSchedule = () => { console.log('Refreshing schedule...') }
const exportSchedule = () => { console.log('Exporting schedule...') }
const openScheduleDetail = (schedule) => { selectedSchedule.value = schedule; showScheduleModal.value = true }
const closeScheduleModal = () => { showScheduleModal.value = false; selectedSchedule.value = null }
const openClassDetail = (classData) => { selectedClass.value = classData; showClassModal.value = true }
const closeClassModal = () => { showClassModal.value = false; selectedClass.value = null }
onMounted(() => { console.log('Student Schedule Page loaded') })
</script>
<style scoped>
.student-schedule-container { min-height: 100vh; background: #f5f7fa; padding: 20px; }
.top-section { margin-bottom: 20px; }
.main-section { display: grid; grid-template-columns: 280px 1fr; gap: 20px; min-height: calc(100vh - 200px); }
.sidebar { display: flex; flex-direction: column; gap: 20px; }
.content-area { background: white; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden; }
.view-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e5e7eb; background: white; }
.view-tabs { display: flex; gap: 4px; background: #f3f4f6; padding: 4px; border-radius: 12px; }
.view-tab { padding: 10px 20px; background: transparent; border: none; border-radius: 8px; font-weight: 500; color: #6b7280; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
.view-tab:hover { color: #374151; background: rgba(255,255,255,0.5); }
.view-tab.active { background: white; color: #3b82f6; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
.view-actions { display: flex; gap: 12px; }
.btn-action { padding: 10px 16px; border: 1px solid #e5e7eb; background: white; border-radius: 8px; color: #374151; font-weight: 500; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; }
.btn-action:hover { background: #f9fafb; border-color: #d1d5db; }
.btn-action.primary { background: #3b82f6; color: white; border-color: #3b82f6; }
.btn-action.primary:hover { background: #2563eb; }
.view-content { padding: 24px; min-height: 500px; }
.slide-fade-enter-active { transition: all 0.3s ease-out; }
.slide-fade-leave-active { transition: all 0.2s cubic-bezier(1,0.5,0.8,1); }
.slide-fade-enter-from { transform: translateX(20px); opacity: 0; }
.slide-fade-leave-to { transform: translateX(-20px); opacity: 0; }
@media (max-width: 1200px) {
  .top-section { grid-template-columns: 1fr; }
  .main-section { grid-template-columns: 1fr; }
  .sidebar { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
}
@media (max-width: 768px) {
  .student-schedule-container { padding: 12px; }
  .sidebar { grid-template-columns: 1fr; }
  .view-header { flex-direction: column; gap: 16px; align-items: stretch; }
  .view-tabs { justify-content: center; }
  .view-actions { justify-content: center; }
  .view-content { padding: 16px; }
}
</style>
