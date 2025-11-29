<template>
  <Transition name="modal">
    <div v-if="classData" class="modal-overlay" @click="close">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="header-info">
            <h2>{{ classData.name }}</h2>
            <div class="header-badges">
              <span class="class-code">{{ classData.code }}</span>
              <span :class="['status-badge', classData.status]">
                {{ getStatusLabel(classData.status) }}
              </span>
            </div>
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
            <!-- Tab: Tổng quan -->
            <div v-if="activeTab === 'overview'" class="tab-panel">
              <div class="overview-grid">
                <div class="info-card">
                  <div class="info-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
                    <i class="fas fa-chalkboard-teacher"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Giảng viên</div>
                    <div class="info-value">{{ classData.teacher.name }}</div>
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                    <i class="fas fa-calendar-check"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Lịch học</div>
                    <div class="info-value">{{ classData.schedule }}</div>
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                    <i class="fas fa-door-open"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Phòng học</div>
                    <div class="info-value">{{ classData.room }}</div>
                  </div>
                </div>

                <div class="info-card">
                  <div class="info-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
                    <i class="fas fa-users"></i>
                  </div>
                  <div class="info-content">
                    <div class="info-label">Sĩ số</div>
                    <div class="info-value">{{ classData.studentCount }} SV</div>
                  </div>
                </div>
              </div>

              <div class="detail-section">
                <h3>Thông tin chi tiết</h3>
                <div class="detail-grid">
                  <div class="detail-item">
                    <span class="detail-label">Học kỳ:</span>
                    <span class="detail-value">{{ classData.semester }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Loại lớp:</span>
                    <span class="detail-value">{{ classData.type === 'theory' ? 'Lý thuyết' : 'Thực hành' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Số tín chỉ:</span>
                    <span class="detail-value">{{ classData.credits }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Điểm danh:</span>
                    <span class="detail-value">{{ classData.attendance }}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Bài tập hoàn thành:</span>
                    <span class="detail-value">{{ classData.completedAssignments }}/{{ classData.totalAssignments }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Điểm hiện tại:</span>
                    <span :class="['grade-badge', getGradeClass(classData.currentGrade)]">
                      {{ classData.currentGrade?.toFixed(1) || 'Chưa có' }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Teacher Contact -->
              <div class="teacher-contact-section">
                <h3>Liên hệ giảng viên</h3>
                <div class="teacher-contact-card">
                  <img :src="avatarSrc(classData.teacher?.avatar)" :alt="classData.teacher.name" class="teacher-avatar" @error="onAvatarError($event, classData.teacher?.avatar)">
                  <div class="teacher-info">
                    <div class="teacher-name">{{ classData.teacher.name }}</div>
                    <div class="teacher-title">{{ classData.teacher.title }}</div>
                    <div class="contact-info">
                      <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>{{ classData.teacher.email }}</span>
                      </div>
                      <div class="contact-item">
                        <i class="fas fa-phone"></i>
                        <span>{{ classData.teacher.phone }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab: Lịch học -->
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
                    <div class="schedule-title">{{ schedule.title }}</div>
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

            <!-- Tab: Tài liệu -->
            <div v-if="activeTab === 'materials'" class="tab-panel">
              <div class="materials-list">
                <div 
                  v-for="material in mockMaterials" 
                  :key="material.id"
                  class="material-item"
                >
                  <div class="material-icon" :class="material.type">
                    <i :class="getMaterialIcon(material.type)"></i>
                  </div>
                  <div class="material-info">
                    <div class="material-name">{{ material.name }}</div>
                    <div class="material-meta">
                      <span>{{ material.size }}</span>
                      <span>•</span>
                      <span>{{ material.uploadDate }}</span>
                    </div>
                  </div>
                  <button class="btn-download">
                    <i class="fas fa-download"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Tab: Bài tập -->
            <div v-if="activeTab === 'assignments'" class="tab-panel">
              <div class="assignments-list">
                <div 
                  v-for="assignment in mockAssignments" 
                  :key="assignment.id"
                  class="assignment-item"
                >
                  <div class="assignment-header">
                    <div class="assignment-title">{{ assignment.title }}</div>
                    <span :class="['assignment-status', assignment.status]">
                      {{ getAssignmentStatus(assignment.status) }}
                    </span>
                  </div>
                  <div class="assignment-meta">
                    <div class="meta-item">
                      <i class="fas fa-calendar"></i>
                      <span>Hạn nộp: {{ assignment.dueDate }}</span>
                    </div>
                    <div v-if="assignment.grade" class="meta-item">
                      <i class="fas fa-star"></i>
                      <span>Điểm: {{ assignment.grade }}/10</span>
                    </div>
                  </div>
                  <button class="btn-view-assignment">
                    <i class="fas fa-eye"></i>
                    Xem chi tiết
                  </button>
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
          <button @click="goToLessons" class="btn btn-info">
            <i class="fas fa-book-reader"></i>
            Xem bài học
          </button>
          <button @click="goToAssignments" class="btn btn-warning">
            <i class="fas fa-tasks"></i>
            Làm bài tập
          </button>
          <button v-if="classData.meetLink" @click="goToMeet" class="btn btn-primary">
            <i class="fas fa-video"></i>
            Vào lớp học
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'

const props = defineProps({
  classData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])
const router = useRouter()

const activeTab = ref('overview')

const tabs = [
  { id: 'overview', label: 'Tổng quan', icon: 'fas fa-info-circle' },
  { id: 'schedule', label: 'Lịch học', icon: 'fas fa-calendar-alt' },
  { id: 'materials', label: 'Tài liệu', icon: 'fas fa-folder' },
  { id: 'assignments', label: 'Bài tập', icon: 'fas fa-tasks' }
]

const mockSchedules = [
  { id: 1, day: 28, month: 10, title: 'Buổi 5: ReactJS Advanced', time: '07:30 - 09:30', room: 'A101', status: 'upcoming' },
  { id: 2, day: 21, month: 10, title: 'Buổi 4: State Management', time: '07:30 - 09:30', room: 'A101', status: 'completed' },
  { id: 3, day: 14, month: 10, title: 'Buổi 3: Component Lifecycle', time: '07:30 - 09:30', room: 'A101', status: 'completed' }
]

const mockMaterials = [
  { id: 1, name: 'Bài giảng - ReactJS Fundamentals.pdf', type: 'pdf', size: '2.5 MB', uploadDate: '20/10/2024' },
  { id: 2, name: 'Source code - Demo Component.zip', type: 'zip', size: '850 KB', uploadDate: '15/10/2024' },
  { id: 3, name: 'Video bài giảng - Buổi 3.mp4', type: 'video', size: '125 MB', uploadDate: '14/10/2024' }
]

const mockAssignments = [
  { id: 1, title: 'Bài tập 3: Xây dựng Todo App', dueDate: '30/10/2024', status: 'pending', grade: null },
  { id: 2, title: 'Bài tập 2: Component Props & State', dueDate: '23/10/2024', status: 'graded', grade: 8.5 },
  { id: 3, title: 'Bài tập 1: Setup React Project', dueDate: '16/10/2024', status: 'graded', grade: 9.0 }
]

const getStatusLabel = (status) => {
  const labels = {
    active: 'Đang học',
    completed: 'Đã kết thúc',
    upcoming: 'Sắp diễn ra'
  }
  return labels[status] || status
}

const getGradeClass = (grade) => {
  if (!grade) return 'none'
  if (grade >= 8.5) return 'excellent'
  if (grade >= 7.0) return 'good'
  if (grade >= 5.5) return 'average'
  return 'low'
}

const getScheduleStatus = (status) => {
  const labels = {
    upcoming: 'Sắp diễn ra',
    completed: 'Đã hoàn thành',
    cancelled: 'Đã hủy'
  }
  return labels[status] || status
}

const getMaterialIcon = (type) => {
  const icons = {
    pdf: 'fas fa-file-pdf',
    zip: 'fas fa-file-archive',
    video: 'fas fa-file-video',
    doc: 'fas fa-file-word'
  }
  return icons[type] || 'fas fa-file'
}

const getAssignmentStatus = (status) => {
  const labels = {
    pending: 'Chưa nộp',
    submitted: 'Đã nộp',
    graded: 'Đã chấm điểm'
  }
  return labels[status] || status
}

const close = () => {
  emit('close')
}

const goToMeet = () => {
  if (props.classData?.meetLink) {
    window.open(props.classData.meetLink, '_blank')
  }
}

const goToLessons = () => {
  router.push({ 
    path: '/student-lessons',
    query: { 
      classId: props.classData.id, 
      className: props.classData.name 
    }
  })
  close()
}

const goToAssignments = () => {
  router.push({ 
    path: '/student-assignments',
    query: { 
      classId: props.classData.id, 
      className: props.classData.name,
      lessonTitle: props.classData.name
    }
  })
  close()
}

// avatar blob fallback helpers
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
  max-width: 1000px;
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
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #1f2937;
}

.header-badges {
  display: flex;
  gap: 8px;
  align-items: center;
}

.class-code {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
  background: white;
  padding: 4px 10px;
  border-radius: 6px;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #059669;
}

.status-badge.completed {
  background: #e0e7ff;
  color: #4f46e5;
}

.status-badge.upcoming {
  background: #fef3c7;
  color: #d97706;
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
  overflow-x: auto;
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
  white-space: nowrap;
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
  flex-shrink: 0;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1;
}

.detail-section,
.teacher-contact-section {
  background: #f9fafb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
}

.detail-section:last-child,
.teacher-contact-section:last-child {
  margin-bottom: 0;
}

.detail-section h3,
.teacher-contact-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #374151;
  font-weight: 700;
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

.grade-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
}

.grade-badge.excellent {
  background: #d1fae5;
  color: #059669;
}

.grade-badge.good {
  background: #dbeafe;
  color: #2563eb;
}

.grade-badge.average {
  background: #fef3c7;
  color: #d97706;
}

.grade-badge.low {
  background: #fee2e2;
  color: #dc2626;
}

.grade-badge.none {
  background: #f3f4f6;
  color: #6b7280;
}

.teacher-contact-card {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 16px;
  background: white;
  border-radius: 10px;
}

.teacher-avatar {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  object-fit: cover;
}

.teacher-info {
  flex: 1;
}

.teacher-name {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
}

.teacher-title {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #4b5563;
}

.contact-item i {
  width: 20px;
  color: #3b82f6;
}

.schedule-list,
.materials-list,
.assignments-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item,
.material-item,
.assignment-item {
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.2s;
}

.schedule-item:hover,
.material-item:hover,
.assignment-item:hover {
  background: #f9fafb;
  border-color: #3b82f6;
}

.schedule-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.schedule-date {
  text-align: center;
  padding: 8px 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-radius: 8px;
  flex-shrink: 0;
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

.schedule-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 6px;
}

.schedule-time,
.schedule-room {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
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

.material-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.material-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.material-icon.pdf {
  background: #fee2e2;
  color: #dc2626;
}

.material-icon.zip {
  background: #fef3c7;
  color: #d97706;
}

.material-icon.video {
  background: #dbeafe;
  color: #2563eb;
}

.material-info {
  flex: 1;
}

.material-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.material-meta {
  font-size: 12px;
  color: #6b7280;
  display: flex;
  gap: 6px;
}

.btn-download {
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-download:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.assignment-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.assignment-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  flex: 1;
}

.assignment-status {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.assignment-status.pending {
  background: #fef3c7;
  color: #d97706;
}

.assignment-status.submitted {
  background: #dbeafe;
  color: #2563eb;
}

.assignment-status.graded {
  background: #d1fae5;
  color: #059669;
}

.assignment-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
}

.meta-item i {
  color: #9ca3af;
}

.btn-view-assignment {
  padding: 8px 14px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.btn-view-assignment:hover {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.modal-footer {
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
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

.btn-info {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
  color: white;
}

.btn-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
}

.btn-warning {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
}

.btn-warning:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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

  .modal-footer {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
