<template>
  <div class="class-card" @click="$emit('click', classData)">
    <div class="card-header">
      <div class="class-badge" :class="classData.type">
        {{ classData.type === 'theory' ? 'Lý thuyết' : 'Thực hành' }}
      </div>
      <span :class="['status-badge', classData.status]">
        {{ getStatusLabel(classData.status) }}
      </span>
    </div>

    <div class="card-body">
      <h3 class="class-name">{{ classData.name }}</h3>
      <p class="class-code">{{ classData.code }} • {{ classData.semester }}</p>

      <div class="teacher-info">
        <img :src="avatarSrc(classData.teacher?.avatar)" :alt="classData.teacher.name" class="teacher-avatar" @error="onAvatarError($event, classData.teacher?.avatar)">
        <div class="teacher-details">
          <div class="teacher-name">{{ classData.teacher.name }}</div>
          <div class="teacher-title">{{ classData.teacher.title }}</div>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-item">
          <i class="fas fa-calendar-alt"></i>
          <span>{{ classData.schedule }}</span>
        </div>
        <!-- Room display removed per UX request -->
        <div class="info-item">
          <i class="fas fa-users"></i>
          <span>{{ classData.studentCount }} sinh viên</span>
        </div>
        <div class="info-item">
          <i class="fas fa-clock"></i>
          <span>{{ classData.credits }} tín chỉ</span>
        </div>
      </div>

      <!-- Progress Section -->
      <div class="progress-section">
        <div class="progress-item">
          <div class="progress-header">
            <span class="progress-label">Điểm danh</span>
            <span class="progress-value">{{ classData.attendance }}%</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill attendance"
              :style="{ width: classData.attendance + '%' }"
            ></div>
          </div>
        </div>

        <div class="progress-item">
          <div class="progress-header">
            <span class="progress-label">Bài tập</span>
            <span class="progress-value">{{ classData.completedAssignments }}/{{ classData.totalAssignments }}</span>
          </div>
          <div class="progress-bar">
            <div 
              class="progress-fill assignments"
              :style="{ width: (classData.completedAssignments / classData.totalAssignments * 100) + '%' }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Grade Display -->
      <div v-if="classData.currentGrade" class="grade-display">
        <div class="grade-label">Điểm hiện tại</div>
        <div class="grade-value" :class="getGradeClass(classData.currentGrade)">
          {{ classData.currentGrade.toFixed(1) }}
        </div>
      </div>
    </div>

    <div class="card-footer">
      <button @click.stop="$emit('view-details', classData)" class="btn-action secondary">
        <i class="fas fa-info-circle"></i>
        Chi tiết
      </button>
      <button @click.stop="goToLessons(classData)" class="btn-action primary">
        <i class="fas fa-book-reader"></i>
        Học ngay
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onBeforeUnmount } from 'vue'
import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'

const props = defineProps({
  classData: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['click', 'view-details'])
const router = useRouter()

const getStatusLabel = (status) => {
  const labels = {
    active: 'Đang học',
    completed: 'Đã kết thúc',
    upcoming: 'Sắp diễn ra'
  }
  return labels[status] || status
}

const getGradeClass = (grade) => {
  if (grade >= 8.5) return 'excellent'
  if (grade >= 7.0) return 'good'
  if (grade >= 5.5) return 'average'
  return 'low'
}

const goToLessons = (classData) => {
  // Navigate to student lessons page (use student route)
  router.push({ 
    path: '/student-lessons',
    query: { classId: classData.id, className: classData.name }
  })
}

// avatar fallback helpers
const blobMap = ref({})
const avatarSrc = (url) => blobMap.value[url] || url || '/default-avatar.svg'
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
.class-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
}

.class-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.card-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.class-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.class-badge.theory {
  background: #dbeafe;
  color: #1e40af;
}

.class-badge.practice {
  background: #d1fae5;
  color: #065f46;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
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

.card-body {
  padding: 20px;
  flex: 1;
}

.class-name {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.3;
}

.class-code {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.teacher-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 10px;
  margin-bottom: 16px;
}

.teacher-avatar {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  object-fit: cover;
}

.teacher-details {
  flex: 1;
}

.teacher-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
}

.teacher-title {
  font-size: 12px;
  color: #6b7280;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #4b5563;
}

.info-item i {
  width: 16px;
  color: #9ca3af;
  font-size: 12px;
}

.progress-section {
  margin-bottom: 16px;
}

.progress-item {
  margin-bottom: 12px;
}

.progress-item:last-child {
  margin-bottom: 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.progress-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.progress-value {
  font-size: 13px;
  color: #1f2937;
  font-weight: 700;
}

.progress-bar {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s;
  border-radius: 3px;
}

.progress-fill.attendance {
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
}

.progress-fill.assignments {
  background: linear-gradient(90deg, #3b82f6 0%, #2563eb 100%);
}

.grade-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 10px;
  border: 1px solid #e5e7eb;
}

.grade-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.grade-value {
  font-size: 24px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 8px;
}

.grade-value.excellent {
  color: #059669;
  background: #d1fae5;
}

.grade-value.good {
  color: #2563eb;
  background: #dbeafe;
}

.grade-value.average {
  color: #d97706;
  background: #fef3c7;
}

.grade-value.low {
  color: #dc2626;
  background: #fee2e2;
}

.card-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 10px;
  background: #f9fafb;
}

.btn-action {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.btn-action.secondary {
  background: white;
  color: #374151;
  border: 1px solid #e5e7eb;
}

.btn-action.secondary:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.btn-action.primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
}

.btn-action.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
