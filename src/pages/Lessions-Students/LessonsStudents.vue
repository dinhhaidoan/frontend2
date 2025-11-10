<template>
  <div class="lessons-container">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1>
          <i class="fas fa-book-reader"></i>
          Bài học của tôi
        </h1>
        <p class="header-subtitle">
          <span v-if="currentClassName">{{ currentClassName }}</span>
          <span v-else>Xem và học tất cả bài học từ các lớp học</span>
        </p>
      </div>
      <div class="header-actions">
        <button @click="refreshLessons" class="btn-action">
          <i class="fas fa-sync-alt"></i>
          Làm mới
        </button>
      </div>
    </div>

    <!-- Statistics -->
    <div class="top-section">
      <StudentLessonStats :stats="stats" />
    </div>

    <!-- Main Content -->
    <div class="main-section">
      <!-- Filters Sidebar -->
      <div class="sidebar">
        <StudentLessonFilters :filters="filters" @update="updateFilters" />
      </div>

      <!-- Lessons List -->
      <div class="content-area">
        <div class="content-header">
          <h2>
            <i class="fas fa-list"></i>
            Danh sách bài học
            <span class="lesson-count">({{ filteredLessonsCount }})</span>
          </h2>
        </div>

        <StudentLessonList 
          :lessons="mockLessons" 
          :filters="filters"
          @lesson-click="viewLesson"
        />
      </div>
    </div>

    <!-- View Modal -->
    <StudentLessonViewModal 
      :lesson="viewingLesson" 
      @close="closeViewModal"
      @update-progress="handleProgressUpdate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import StudentLessonStats from '@/components/Lessions-Students/StudentLessonStats.vue'
import StudentLessonFilters from '@/components/Lessions-Students/StudentLessonFilters.vue'
import StudentLessonList from '@/components/Lessions-Students/StudentLessonList.vue'
import StudentLessonViewModal from '@/components/Lessions-Students/StudentLessonViewModal.vue'

const route = useRoute()

const filters = ref({
  class: 'all',
  status: 'all',
  type: 'all',
  sortBy: 'date-desc'
})

const viewingLesson = ref(null)
const currentClassName = ref('')

// Mock data với student progress
const mockLessons = ref([
  {
    id: 1,
    lessonNumber: 1,
    title: 'Giới thiệu về Vue 3 và Composition API',
    classId: '1',
    className: 'Lập trình Web - WEB301',
    date: '2025-10-28',
    duration: 90,
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
    ],
    studentProgress: {
      status: 'completed',
      watchedVideos: [0, 1],
      downloadedDocs: [0, 1],
      lastAccessed: '2025-10-27T14:30:00'
    }
  },
  {
    id: 2,
    lessonNumber: 2,
    title: 'Reactive State và Refs trong Vue 3',
    classId: '1',
    className: 'Lập trình Web - WEB301',
    date: '2025-10-21',
    duration: 90,
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
    ],
    studentProgress: {
      status: 'in-progress',
      watchedVideos: [0],
      downloadedDocs: [],
      lastAccessed: '2025-10-25T10:15:00'
    }
  },
  {
    id: 3,
    lessonNumber: 3,
    title: 'Component Props và Events',
    classId: '2',
    className: 'Thực hành Web - WEB301.1',
    date: '2025-10-30',
    duration: 120,
    description: 'Thực hành tạo component, truyền props và xử lý events giữa các component.',
    meetLink: 'https://meet.google.com/xyz-abcd-efg',
    documents: [
      {
        name: 'Hướng dẫn thực hành',
        url: 'https://example.com/guide.pdf',
        type: 'pdf'
      }
    ],
    studentProgress: {
      status: 'not-started',
      watchedVideos: [],
      downloadedDocs: [],
      lastAccessed: null
    }
  },
  {
    id: 4,
    lessonNumber: 1,
    title: 'Flutter Widgets cơ bản',
    classId: '3',
    className: 'Lập trình Mobile - MOB201',
    date: '2025-11-05',
    duration: 90,
    description: 'Giới thiệu các widget cơ bản trong Flutter: Container, Row, Column, Text, Image...',
    videos: [
      {
        title: 'Flutter Widgets Overview',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      }
    ],
    documents: [
      {
        name: 'Flutter Widgets Catalog',
        url: 'https://example.com/flutter.pdf',
        type: 'pdf'
      }
    ],
    studentProgress: {
      status: 'not-started',
      watchedVideos: [],
      downloadedDocs: [],
      lastAccessed: null
    }
  },
  {
    id: 5,
    lessonNumber: 1,
    title: 'SQL Queries và Joins',
    classId: '4',
    className: 'Cơ sở dữ liệu - DB301',
    date: '2025-10-25',
    duration: 90,
    description: 'Học các câu lệnh SQL SELECT, WHERE, JOIN để truy vấn dữ liệu từ nhiều bảng.',
    videos: [
      {
        title: 'SQL Joins Explained',
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      },
      {
        title: 'Advanced SQL Queries',
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
    ],
    studentProgress: {
      status: 'in-progress',
      watchedVideos: [0],
      downloadedDocs: [0],
      lastAccessed: '2025-10-26T16:45:00'
    }
  }
])

// Computed stats
const stats = computed(() => {
  const totalLessons = mockLessons.value.length
  const completedLessons = mockLessons.value.filter(
    l => l.studentProgress?.status === 'completed'
  ).length
  
  let totalVideos = 0
  let watchedVideos = 0
  let totalDocs = 0
  let downloadedDocs = 0
  
  mockLessons.value.forEach(lesson => {
    totalVideos += lesson.videos?.length || 0
    totalDocs += lesson.documents?.length || 0
    watchedVideos += lesson.studentProgress?.watchedVideos?.length || 0
    downloadedDocs += lesson.studentProgress?.downloadedDocs?.length || 0
  })
  
  const totalHours = mockLessons.value.reduce((sum, l) => sum + (l.duration || 0), 0) / 60
  const completionRate = totalLessons > 0 
    ? Math.round((completedLessons / totalLessons) * 100) 
    : 0

  return {
    totalLessons,
    completedLessons,
    watchedVideos,
    downloadedMaterials: downloadedDocs,
    totalHours: Math.round(totalHours * 10) / 10,
    completionRate
  }
})

const filteredLessonsCount = computed(() => {
  let count = mockLessons.value.length

  if (filters.value.class !== 'all') {
    count = mockLessons.value.filter(l => l.classId === filters.value.class).length
  }

  if (filters.value.status !== 'all') {
    count = mockLessons.value.filter(l => {
      const status = l.studentProgress?.status || 'not-started'
      return status === filters.value.status
    }).length
  }

  return count
})

onMounted(() => {
  // Check if coming from specific class
  const classId = route.query.classId
  const className = route.query.className
  
  if (classId) {
    filters.value.class = classId
    currentClassName.value = className || ''
  }
})

const updateFilters = (newFilters) => {
  filters.value = { ...filters.value, ...newFilters }
}

const refreshLessons = () => {
  console.log('Refreshing lessons...')
  // TODO: Implement API call to refresh lessons
}

const viewLesson = (lesson) => {
  viewingLesson.value = lesson
}

const closeViewModal = () => {
  viewingLesson.value = null
}

const handleProgressUpdate = (progressData) => {
  const lessonIndex = mockLessons.value.findIndex(l => l.id === progressData.lessonId)
  
  if (lessonIndex !== -1) {
    if (!mockLessons.value[lessonIndex].studentProgress) {
      mockLessons.value[lessonIndex].studentProgress = {}
    }
    
    mockLessons.value[lessonIndex].studentProgress = {
      ...mockLessons.value[lessonIndex].studentProgress,
      ...progressData
    }
    
    console.log('Updated lesson progress:', progressData)
    // TODO: Send to API to save progress
  }
}
</script>

<style scoped>
.lessons-container {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-content h1 i {
  color: #3b82f6;
}

.header-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-action {
  padding: 10px 20px;
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

.top-section {
  margin-bottom: 20px;
}

.main-section {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
  min-height: calc(100vh - 350px);
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
  font-size: 20px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
}

.content-header h2 i {
  color: #3b82f6;
}

.lesson-count {
  font-size: 16px;
  color: #6b7280;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .main-section {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .lessons-container {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .btn-action {
    flex: 1;
  }

  .sidebar {
    grid-template-columns: 1fr;
  }
}
</style>
