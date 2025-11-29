<template>
  <Transition name="modal">
    <div v-if="classData" class="modal-overlay" @click="close">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="header-info">
            <h2>{{ classData.name }}</h2>
            <span class="class-code">{{ classData.code }}</span>
          </div>
          <button @click="close" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
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

          <div class="tab-content">
            <!-- Tổng quan -->
            <div v-if="activeTab === 'overview'" class="tab-panel">
              <div class="overview-grid">
                <div class="info-card">
                  <div class="info-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                    <i class="fas fa-users"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-value">{{ classData.studentCount }}</div>
                    <div class="info-label">Sinh viên</div>
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                    <i class="fas fa-calendar-check"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-value">{{ classData.totalSessions || 15 }}</div>
                    <div class="info-label">Buổi học</div>
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                    <i class="fas fa-user-check"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-value">{{ classData.attendance }}%</div>
                    <div class="info-label">Điểm danh</div>
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
                    <i class="fas fa-door-open"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-value">{{ classData.room }}</div>
                    <div class="info-label">Phòng học</div>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h3>Thông tin chi tiết</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Môn học:</span>
                    <span class="detail-value">{{ classData.subject }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Loại lớp:</span>
                    <span class="detail-value">{{ classData.type === 'theory' ? 'Lý thuyết' : 'Thực hành' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Học kỳ:</span>
                    <span class="detail-value">{{ classData.semester }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Trạng thái:</span>
                    <span :class="['badge', classData.status]">
                      {{ getStatusLabel(classData.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Danh sách sinh viên -->
            <div v-if="activeTab === 'students'" class="tab-panel">
              <div class="search-box">
                <i class="fas fa-search"></i>
                <input 
                  v-model="searchQuery" 
                  type="text" 
                  placeholder="Tìm kiếm sinh viên..."
                >
              </div>

              <div class="student-list">
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
                    <span class="stat">
                      <i class="fas fa-user-check"></i>
                      {{ student.attendance }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Lịch học -->
            <div v-if="activeTab === 'schedule'" class="tab-panel">
              <div class="schedule-list">
                <div 
                  v-for="schedule in mockSchedules" 
                  :key="schedule.id"
                  class="schedule-item"
                >
                  <div class="schedule-date">
                    <div class="day">{{ schedule.day }}</div>
                    <div class="month">Th{{ schedule.month }}</div>
                  </div>
                  <div class="schedule-info">
                    <div class="schedule-time">
                      <i class="fas fa-clock"></i>
                      {{ schedule.time }}
                    </div>
                    <div class="schedule-room">
                      <i class="fas fa-door-open"></i>
                      Phòng {{ schedule.room }}
                    </div>
                  </div>
                  <span :class="['schedule-status', schedule.status]">
                    {{ getScheduleStatus(schedule.status) }}
                  </span>
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

const emit = defineEmits(['close'])

const activeTab = ref('overview')
const searchQuery = ref('')

const tabs = [
  { id: 'overview', label: 'Tổng quan', icon: 'fas fa-info-circle' },
  { id: 'students', label: 'Sinh viên', icon: 'fas fa-users' },
  { id: 'schedule', label: 'Lịch học', icon: 'fas fa-calendar-alt' }
]

const mockStudents = [
  { id: 1, name: 'Nguyễn Văn A', code: 'SV001', avatar: 'https://i.pravatar.cc/150?img=1', attendance: 95 },
  { id: 2, name: 'Trần Thị B', code: 'SV002', avatar: 'https://i.pravatar.cc/150?img=2', attendance: 88 },
  { id: 3, name: 'Lê Văn C', code: 'SV003', avatar: 'https://i.pravatar.cc/150?img=3', attendance: 92 },
  { id: 4, name: 'Phạm Thị D', code: 'SV004', avatar: 'https://i.pravatar.cc/150?img=4', attendance: 85 },
  { id: 5, name: 'Hoàng Văn E', code: 'SV005', avatar: 'https://i.pravatar.cc/150?img=5', attendance: 90 }
]

const mockSchedules = [
  { id: 1, day: 28, month: 10, time: '07:30 - 09:30', room: 'A101', status: 'upcoming' },
  { id: 2, day: 21, month: 10, time: '07:30 - 09:30', room: 'A101', status: 'completed' },
  { id: 3, day: 14, month: 10, time: '07:30 - 09:30', room: 'A101', status: 'completed' },
  { id: 4, day: 7, month: 10, time: '07:30 - 09:30', room: 'A101', status: 'completed' }
]

const filteredStudents = computed(() => {
  if (!searchQuery.value) return mockStudents

  const query = searchQuery.value.toLowerCase()
  return mockStudents.filter(s => 
    s.name.toLowerCase().includes(query) ||
    s.code.toLowerCase().includes(query)
  )
})

const getStatusLabel = (status) => {
  const labels = {
    active: 'Đang học',
    completed: 'Đã kết thúc',
    upcoming: 'Sắp diễn ra'
  }
  return labels[status] || status
}

const getScheduleStatus = (status) => {
  const labels = {
    upcoming: 'Sắp diễn ra',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

const close = () => {
  emit('close')
}

// avatar fallback helpers
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
  Object.values(blobMap.value).forEach(v => revokeBlobUrl(v))
})
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
}

.modal-container {
  background: white;
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px 20px 0 0;
}

.header-info h2 {
  margin: 0 0 6px 0;
  font-size: 24px;
  color: #1f2937;
}

.class-code {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: white;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.tabs {
  display: flex;
  gap: 4px;
  padding: 20px 24px 0 24px;
  border-bottom: 2px solid #f3f4f6;
}

.tab {
  padding: 12px 20px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6b7280;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: -2px;
}

.tab:hover {
  color: #374151;
  background: #f9fafb;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.tab-content {
  padding: 24px;
}

.tab-panel {
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.info-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
}

.info-content {
  flex: 1;
}

.info-value {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
  margin-bottom: 4px;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
}

.detail-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
}

.detail-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #374151;
}

.detail-grid {
  display: grid;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
}

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge.active {
  background: #d1fae5;
  color: #059669;
}

.badge.completed {
  background: #e0e7ff;
  color: #4f46e5;
}

.badge.upcoming {
  background: #fef3c7;
  color: #d97706;
}

.search-box {
  position: relative;
  margin-bottom: 20px;
}

.search-box i {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.student-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.student-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
}

.student-item:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.student-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
}

.student-info {
  flex: 1;
}

.student-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.student-code {
  font-size: 13px;
  color: #6b7280;
}

.student-stats {
  display: flex;
  gap: 16px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.stat i {
  color: #10b981;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}

.schedule-date {
  text-align: center;
  padding: 8px 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 8px;
}

.schedule-date .day {
  font-size: 20px;
  font-weight: 700;
}

.schedule-date .month {
  font-size: 11px;
  opacity: 0.9;
}

.schedule-info {
  flex: 1;
}

.schedule-time,
.schedule-room {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4b5563;
  margin-bottom: 4px;
}

.schedule-time i,
.schedule-room i {
  color: #9ca3af;
  width: 16px;
}

.schedule-status {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.schedule-status.upcoming {
  background: #fef3c7;
  color: #d97706;
}

.schedule-status.completed {
  background: #d1fae5;
  color: #059669;
}

.schedule-status.cancelled {
  background: #fee2e2;
  color: #dc2626;
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
  font-size: 14px;
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

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

@media (max-width: 768px) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .tabs {
    overflow-x: auto;
  }

  .tab {
    white-space: nowrap;
  }
}
</style>
