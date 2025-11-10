<template>
  <div class="lesson-list">
    <div v-if="filteredLessons.length === 0" class="empty-state">
      <i class="fas fa-inbox"></i>
      <p>Không tìm thấy bài học nào</p>
    </div>

    <div v-else class="lessons">
      <div 
        v-for="lesson in filteredLessons" 
        :key="lesson.id"
        class="lesson-card"
        @click="selectLesson(lesson)"
      >
        <div class="lesson-header">
          <div class="lesson-info">
            <h3 class="lesson-title">{{ lesson.title }}</h3>
            <span class="lesson-class">{{ lesson.className }}</span>
          </div>
          <span :class="['status-badge', lesson.status]">
            {{ getStatusLabel(lesson.status) }}
          </span>
        </div>

        <div class="lesson-body">
          <div class="lesson-description">
            {{ lesson.description }}
          </div>

          <div class="lesson-meta">
            <div class="meta-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatDate(lesson.date) }}</span>
            </div>
            <div class="meta-item">
              <i class="fas fa-clock"></i>
              <span>{{ lesson.duration }} phút</span>
            </div>
          </div>

          <div class="lesson-features">
            <span v-if="lesson.meetLink" class="feature-badge online">
              <i class="fas fa-video"></i>
              Online
            </span>
            <span v-if="lesson.videos && lesson.videos.length > 0" class="feature-badge video">
              <i class="fas fa-play-circle"></i>
              {{ lesson.videos.length }} Video
            </span>
            <span v-if="lesson.documents && lesson.documents.length > 0" class="feature-badge document">
              <i class="fas fa-file-alt"></i>
              {{ lesson.documents.length }} Tài liệu
            </span>
          </div>
        </div>

        <div class="lesson-footer">
          <button @click.stop="editLesson(lesson)" class="btn-action">
            <i class="fas fa-edit"></i>
            Chỉnh sửa
          </button>
          <button @click.stop="viewLesson(lesson)" class="btn-action primary">
            <i class="fas fa-eye"></i>
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  lessons: {
    type: Array,
    required: true
  },
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['lesson-click', 'edit-lesson'])

const filteredLessons = computed(() => {
  let result = [...props.lessons]

  if (props.filters.class !== 'all') {
    result = result.filter(l => l.classId === props.filters.class)
  }

  if (props.filters.status !== 'all') {
    result = result.filter(l => l.status === props.filters.status)
  }

  if (props.filters.type !== 'all') {
    if (props.filters.type === 'online') {
      result = result.filter(l => l.meetLink)
    } else if (props.filters.type === 'video') {
      result = result.filter(l => l.videos && l.videos.length > 0)
    } else if (props.filters.type === 'document') {
      result = result.filter(l => l.documents && l.documents.length > 0)
    }
  }

  // Sort
  if (props.filters.sortBy === 'date-desc') {
    result.sort((a, b) => new Date(b.date) - new Date(a.date))
  } else if (props.filters.sortBy === 'date-asc') {
    result.sort((a, b) => new Date(a.date) - new Date(b.date))
  } else if (props.filters.sortBy === 'name-asc') {
    result.sort((a, b) => a.title.localeCompare(b.title))
  } else if (props.filters.sortBy === 'name-desc') {
    result.sort((a, b) => b.title.localeCompare(a.title))
  }

  return result
})

const getStatusLabel = (status) => {
  const labels = {
    published: 'Đã công bố',
    draft: 'Bản nháp',
    scheduled: 'Đã lên lịch'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const selectLesson = (lesson) => {
  emit('lesson-click', lesson)
}

const editLesson = (lesson) => {
  emit('edit-lesson', lesson)
}

const viewLesson = (lesson) => {
  emit('lesson-click', lesson)
}
</script>

<style scoped>
.lesson-list {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-size: 16px;
  margin: 0;
}

.lessons {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.lesson-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.lesson-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  border-color: #3b82f6;
}

.lesson-header {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.lesson-info {
  flex: 1;
}

.lesson-title {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
}

.lesson-class {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.status-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.published {
  background: #d1fae5;
  color: #059669;
}

.status-badge.draft {
  background: #fef3c7;
  color: #d97706;
}

.status-badge.scheduled {
  background: #e0e7ff;
  color: #4f46e5;
}

.lesson-body {
  padding: 20px;
}

.lesson-description {
  font-size: 14px;
  color: #4b5563;
  line-height: 1.6;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.lesson-meta {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #6b7280;
}

.meta-item i {
  color: #9ca3af;
}

.lesson-features {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
}

.feature-badge.online {
  background: #dbeafe;
  color: #1d4ed8;
}

.feature-badge.video {
  background: #fce7f3;
  color: #be185d;
}

.feature-badge.document {
  background: #e0e7ff;
  color: #4338ca;
}

.lesson-footer {
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 10px;
  background: #f9fafb;
}

.btn-action {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.btn-action:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.btn-action.primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-action.primary:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .lesson-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
