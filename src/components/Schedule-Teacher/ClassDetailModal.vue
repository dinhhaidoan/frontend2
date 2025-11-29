<template>
  <Transition name="modal">
    <div v-if="classData" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header" :style="{ background: classData.color }">
          <div class="header-content">
            <h2>{{ classData.name }}</h2>
            <p class="class-code">{{ classData.code }}</p>
          </div>
          <button @click="close" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Class Overview -->
          <div class="overview-grid">
            <div class="overview-card">
              <div class="card-icon students">
                <i class="fas fa-user-graduate"></i>
              </div>
              <div class="card-content">
                <div class="card-value">{{ classData.studentCount }}</div>
                <div class="card-label">Sinh viên</div>
              </div>
            </div>
            <div class="overview-card">
              <div class="card-icon schedule">
                <i class="fas fa-calendar-alt"></i>
              </div>
              <div class="card-content">
                <div class="card-value">{{ classData.scheduleCount }}</div>
                <div class="card-label">Buổi/tuần</div>
              </div>
            </div>
            <div class="overview-card">
              <div class="card-icon progress">
                <i class="fas fa-chart-line"></i>
              </div>
              <div class="card-content">
                <div class="card-value">{{ classData.progress }}%</div>
                <div class="card-label">Tiến độ</div>
              </div>
            </div>
            <div class="overview-card">
              <div class="card-icon room">
                <i class="fas fa-door-open"></i>
              </div>
              <div class="card-content">
                <div class="card-value">{{ classData.room }}</div>
                <div class="card-label">Phòng học</div>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <div class="tabs">
            <button 
              v-for="tab in tabs"
              :key="tab.id"
              :class="['tab', { active: activeTab === tab.id }]"
              @click="activeTab = tab.id"
            >
              <i :class="tab.icon"></i>
              {{ tab.label }}
            </button>
          </div>

          <!-- Tab Content -->
          <div class="tab-content">
            <!-- Students Tab -->
            <div v-if="activeTab === 'students'" class="students-list">
              <div class="list-header">
                <input 
                  v-model="searchStudent"
                  type="text"
                  placeholder="Tìm sinh viên..."
                  class="search-input"
                />
              </div>
              <div class="student-items">
                <div 
                  v-for="student in filteredStudents"
                  :key="student.id"
                  class="student-item"
                >
                  <img :src="avatarSrc(student.avatar)" :alt="student.name" class="student-avatar" @error="onAvatarError($event, student.avatar)">
                  <div class="student-info">
                    <div class="student-name">{{ student.name }}</div>
                    <div class="student-code">{{ student.code }}</div>
                  </div>
                  <div class="student-stats">
                    <span class="stat" :class="{ warning: student.attendance < 80 }">
                      {{ student.attendance }}% điểm danh
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Schedule Tab -->
            <div v-if="activeTab === 'schedule'" class="schedule-list">
              <div 
                v-for="schedule in classSchedules"
                :key="schedule.id"
                class="schedule-item"
              >
                <div class="schedule-day">{{ schedule.day }}</div>
                <div class="schedule-time">
                  <i class="fas fa-clock"></i>
                  {{ schedule.time }}
                </div>
                <div class="schedule-room">
                  <i class="fas fa-door-open"></i>
                  {{ schedule.room }}
                </div>
              </div>
            </div>

            <!-- Grades Tab -->
            <div v-if="activeTab === 'grades'" class="grades-summary">
              <div class="grade-chart">
                <div class="chart-item">
                  <div class="chart-label">Điểm TB</div>
                  <div class="chart-value">{{ averageGrade }}</div>
                </div>
                <div class="chart-item">
                  <div class="chart-label">Cao nhất</div>
                  <div class="chart-value">{{ maxGrade }}</div>
                </div>
                <div class="chart-item">
                  <div class="chart-label">Thấp nhất</div>
                  <div class="chart-value">{{ minGrade }}</div>
                </div>
              </div>
              <div class="grade-distribution">
                <div class="distribution-title">Phân bố điểm</div>
                <div class="distribution-bars">
                  <div 
                    v-for="range in gradeDistribution"
                    :key="range.label"
                    class="distribution-bar"
                  >
                    <div class="bar-label">{{ range.label }}</div>
                    <div class="bar-container">
                      <div 
                        class="bar-fill"
                        :style="{ width: range.percentage + '%' }"
                      ></div>
                    </div>
                    <div class="bar-value">{{ range.count }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="close" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            Đóng
          </button>
          <button @click="handleAction('attendance')" class="btn btn-primary">
            <i class="fas fa-clipboard-check"></i>
            Điểm danh
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'

const props = defineProps({
  classData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'action'])

const activeTab = ref('students')
const searchStudent = ref('')

const tabs = [
  { id: 'students', label: 'Sinh viên', icon: 'fas fa-users' },
  { id: 'schedule', label: 'Lịch học', icon: 'fas fa-calendar' },
  { id: 'grades', label: 'Điểm số', icon: 'fas fa-chart-bar' }
]

// Mock data
const students = ref([
  { id: 1, name: 'Nguyễn Văn A', code: 'SV001', avatar: 'https://i.pravatar.cc/150?img=1', attendance: 95 },
  { id: 2, name: 'Trần Thị B', code: 'SV002', avatar: 'https://i.pravatar.cc/150?img=2', attendance: 88 },
  { id: 3, name: 'Lê Văn C', code: 'SV003', avatar: 'https://i.pravatar.cc/150?img=3', attendance: 75 },
  { id: 4, name: 'Phạm Thị D', code: 'SV004', avatar: 'https://i.pravatar.cc/150?img=4', attendance: 92 },
  { id: 5, name: 'Hoàng Văn E', code: 'SV005', avatar: 'https://i.pravatar.cc/150?img=5', attendance: 100 }
])

const classSchedules = ref([
  { id: 1, day: 'Thứ 2', time: '07:30 - 09:30', room: 'A201' },
  { id: 2, day: 'Thứ 4', time: '10:00 - 12:00', room: 'A201' },
  { id: 3, day: 'Thứ 6', time: '13:30 - 15:30', room: 'Lab2' }
])

const averageGrade = ref(7.5)
const maxGrade = ref(9.5)
const minGrade = ref(4.0)

const gradeDistribution = ref([
  { label: '9-10', count: 5, percentage: 15 },
  { label: '8-8.9', count: 12, percentage: 35 },
  { label: '7-7.9', count: 15, percentage: 44 },
  { label: '6-6.9', count: 8, percentage: 23 },
  { label: '5-5.9', count: 3, percentage: 9 },
  { label: '<5', count: 2, percentage: 6 }
])

const blobMap = ref({})

const avatarSrc = (url) => {
  if (!url) return '/default-avatar.svg'
  return blobMap.value[url] || url
}

const onAvatarError = async (event, url) => {
  try {
    if (!url || blobMap.value[url]) return
    const b = await fetchImageAsBlobUrl(url)
    blobMap.value[url] = b
    event.target.src = b
  } catch (err) {
    console.debug('avatar fetch fallback failed', err)
  }
}

onBeforeUnmount(() => {
  // revoke any created blob urls
  Object.values(blobMap.value).forEach(v => revokeBlobUrl(v))
})

const filteredStudents = computed(() => {
  if (!searchStudent.value) return students.value
  
  const query = searchStudent.value.toLowerCase()
  return students.value.filter(s => 
    s.name.toLowerCase().includes(query) ||
    s.code.toLowerCase().includes(query)
  )
})

const close = () => {
  emit('close')
}

const handleAction = (action) => {
  emit('action', action, props.classData)
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
  backdrop-filter: blur(4px);
}

.modal-container {
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 24px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
}

.class-code {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.overview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.card-icon.students {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.card-icon.schedule {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.card-icon.progress {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.card-icon.room {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.card-value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
}

.tabs {
  display: flex;
  gap: 4px;
  background: #f3f4f6;
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.tab {
  flex: 1;
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.tab:hover {
  color: #374151;
}

.tab.active {
  background: white;
  color: #3b82f6;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-content {
  min-height: 300px;
}

.list-header {
  margin-bottom: 16px;
}

.search-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
}

.student-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.student-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.student-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.student-info {
  flex: 1;
}

.student-name {
  font-weight: 600;
  color: #111827;
  font-size: 14px;
}

.student-code {
  font-size: 12px;
  color: #6b7280;
}

.student-stats .stat {
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
}

.student-stats .stat.warning {
  color: #f59e0b;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item {
  display: flex;
  gap: 20px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #3b82f6;
}

.schedule-day {
  font-weight: 600;
  color: #111827;
  min-width: 60px;
}

.schedule-time, .schedule-room {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #6b7280;
  font-size: 14px;
}

.grades-summary {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.grade-chart {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.chart-item {
  text-align: center;
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
}

.chart-label {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.chart-value {
  font-size: 28px;
  font-weight: 700;
  color: #3b82f6;
}

.distribution-title {
  font-weight: 600;
  color: #111827;
  margin-bottom: 16px;
}

.distribution-bars {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.distribution-bar {
  display: grid;
  grid-template-columns: 60px 1fr 40px;
  gap: 12px;
  align-items: center;
}

.bar-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.bar-container {
  height: 24px;
  background: #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  border-radius: 12px;
  transition: width 0.3s;
}

.bar-value {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  text-align: right;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

/* Transitions */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .grade-chart {
    grid-template-columns: 1fr;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
