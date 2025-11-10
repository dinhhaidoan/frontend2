<template>
  <div class="lessons-container">
    <div class="top-section">
      <LessonStats :stats="stats" />
    </div>

    <div class="main-section">
      <div class="sidebar">
        <LessonFilters :filters="filters" @update="updateFilters" />
      </div>

      <div class="content-area">
        <div class="content-header">
          <h2>
            <i class="fas fa-book-open"></i>
            Quản lý bài học
          </h2>
          <div class="header-actions">
            <button @click="refreshLessons" class="btn-action">
              <i class="fas fa-sync-alt"></i>
              Làm mới
            </button>
            <button @click="openCreateModal" class="btn-action primary">
              <i class="fas fa-plus"></i>
              Thêm bài học
            </button>
          </div>
        </div>

        <LessonList 
          :lessons="mockLessons" 
          :filters="filters"
          @lesson-click="viewLesson"
          @edit-lesson="editLesson"
        />
      </div>
    </div>

    <LessonModal 
      v-model="showLessonModal" 
      :lesson="selectedLesson"
      @save="saveLesson"
    />

    <LessonViewModal 
      :lesson="viewingLesson" 
      @close="closeViewModal"
      @edit="editFromView"
      @delete="handleDeleteLesson"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import LessonStats from '@/components/Lessions/LessonStats.vue'
import LessonFilters from '@/components/Lessions/LessonFilters.vue'
import LessonList from '@/components/Lessions/LessonList.vue'
import LessonModal from '@/components/Lessions/LessonModal.vue'
import LessonViewModal from '@/components/Lessions/LessonViewModal.vue'

const filters = ref({
  class: 'all',
  status: 'all',
  type: 'all',
  sortBy: 'date-desc'
})

const showLessonModal = ref(false)
const selectedLesson = ref(null)
const viewingLesson = ref(null)

// Mock data
const mockLessons = ref([
  {
    id: 1,
    title: 'Giới thiệu về Vue 3 và Composition API',
    classId: '1',
    className: 'Lập trình Web - WEB301',
    date: '2025-10-28',
    duration: 90,
    status: 'published',
    description: 'Bài học giới thiệu tổng quan về Vue 3, các tính năng mới và Composition API. Học sinh sẽ được làm quen với cách tổ chức code theo phong cách mới.',
    meetLink: 'https://meet.google.com/abc-defg-hij',
    videos: [
      {
        title: 'Tổng quan Vue 3',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        title: 'Composition API chi tiết',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    documents: [
      {
        name: 'Slide bài giảng Vue 3',
        url: 'https://example.com/slide.pdf',
        type: 'pdf'
      },
      {
        name: 'Tài liệu tham khảo',
        url: 'https://example.com/doc.docx',
        type: 'doc'
      }
    ]
  },
  {
    id: 2,
    title: 'Reactive State và Refs trong Vue 3',
    classId: '1',
    className: 'Lập trình Web - WEB301',
    date: '2025-10-21',
    duration: 90,
    status: 'published',
    description: 'Học cách sử dụng ref(), reactive(), computed() và watch() để quản lý state trong Vue 3.',
    videos: [
      {
        title: 'Reactive State Tutorial',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    documents: [
      {
        name: 'Bài tập thực hành',
        url: 'https://example.com/exercise.pdf',
        type: 'pdf'
      }
    ]
  },
  {
    id: 3,
    title: 'Component Props và Events',
    classId: '2',
    className: 'Thực hành Web - WEB301.1',
    date: '2025-10-30',
    duration: 120,
    status: 'scheduled',
    description: 'Thực hành tạo component, truyền props và xử lý events giữa các component.',
    meetLink: 'https://meet.google.com/xyz-abcd-efg',
    documents: []
  },
  {
    id: 4,
    title: 'Flutter Widgets cơ bản',
    classId: '3',
    className: 'Lập trình Mobile - MOB201',
    date: '2025-11-05',
    duration: 90,
    status: 'draft',
    description: 'Giới thiệu các widget cơ bản trong Flutter: Container, Row, Column, Text, Image...',
    videos: [],
    documents: [
      {
        name: 'Flutter Widgets Catalog',
        url: 'https://example.com/flutter.pdf',
        type: 'pdf'
      }
    ]
  },
  {
    id: 5,
    title: 'SQL Queries và Joins',
    classId: '4',
    className: 'Cơ sở dữ liệu - DB301',
    date: '2025-10-25',
    duration: 90,
    status: 'published',
    description: 'Học các câu lệnh SQL SELECT, WHERE, JOIN để truy vấn dữ liệu từ nhiều bảng.',
    videos: [
      {
        title: 'SQL Joins Explained',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    documents: [
      {
        name: 'SQL Cheat Sheet',
        url: 'https://example.com/sql.pdf',
        type: 'pdf'
      },
      {
        name: 'Practice Database',
        url: 'https://example.com/db.sql',
        type: 'other'
      }
    ]
  }
])

const stats = computed(() => {
  const totalLessons = mockLessons.value.length
  const published = mockLessons.value.filter(l => l.status === 'published').length
  const draft = mockLessons.value.filter(l => l.status === 'draft').length
  const withVideo = mockLessons.value.filter(l => l.videos && l.videos.length > 0).length
  const totalDocuments = mockLessons.value.reduce((sum, l) => sum + (l.documents?.length || 0), 0)
  const onlineSessions = mockLessons.value.filter(l => l.meetLink).length

  return {
    totalLessons,
    published,
    draft,
    withVideo,
    totalDocuments,
    onlineSessions
  }
})

const updateFilters = (newFilters) => {
  filters.value = { ...filters.value, ...newFilters }
}

const refreshLessons = () => {
  console.log('Refreshing lessons...')
}

const openCreateModal = () => {
  selectedLesson.value = null
  showLessonModal.value = true
}

const editLesson = (lesson) => {
  selectedLesson.value = { ...lesson }
  showLessonModal.value = true
}

const viewLesson = (lesson) => {
  viewingLesson.value = lesson
}

const closeViewModal = () => {
  viewingLesson.value = null
}

const editFromView = (lesson) => {
  viewingLesson.value = null
  selectedLesson.value = { ...lesson }
  showLessonModal.value = true
}

const handleDeleteLesson = (lesson) => {
  const index = mockLessons.value.findIndex(l => l.id === lesson.id)
  if (index !== -1) {
    mockLessons.value.splice(index, 1)
    console.log('Deleted lesson:', lesson)
  }
  viewingLesson.value = null
}

const saveLesson = (lessonData) => {
  if (lessonData.id) {
    // Update existing
    const index = mockLessons.value.findIndex(l => l.id === lessonData.id)
    if (index !== -1) {
      mockLessons.value[index] = lessonData
      console.log('Updated lesson:', lessonData)
    }
  } else {
    // Create new
    const newLesson = {
      ...lessonData,
      id: Date.now(),
      className: getClassName(lessonData.classId)
    }
    mockLessons.value.unshift(newLesson)
    console.log('Created lesson:', newLesson)
  }
}

const getClassName = (classId) => {
  const classes = {
    '1': 'Lập trình Web - WEB301',
    '2': 'Thực hành Web - WEB301.1',
    '3': 'Lập trình Mobile - MOB201',
    '4': 'Cơ sở dữ liệu - DB301'
  }
  return classes[classId] || 'Unknown Class'
}
</script>

<style scoped>
.lessons-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 20px;
}

.top-section {
  margin-bottom: 20px;
}

.main-section {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  min-height: calc(100vh - 200px);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.content-area {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  padding: 24px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
}

.content-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
}

.content-header h2 i {
  color: #3b82f6;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-action {
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
  gap: 8px;
  font-size: 14px;
}

.btn-action:hover {
  background: #f9fafb;
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

@media (max-width: 1200px) {
  .main-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .lessons-container {
    padding: 12px;
  }

  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .btn-action {
    flex: 1;
  }
}
</style>
