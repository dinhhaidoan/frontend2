<template>
  <Transition name="modal">
    <div v-if="lesson" class="modal-overlay" @click="close">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="header-info">
            <h2>{{ lesson.title }}</h2>
            <div class="header-meta">
              <span class="lesson-class">{{ lesson.className }}</span>
              <span :class="['progress-badge', lesson.studentProgress?.status || 'not-started']">
                {{ getProgressLabel(lesson.studentProgress?.status) }}
              </span>
            </div>
          </div>
          <button @click="close" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Thông tin cơ bản -->
          <div class="info-section">
            <div class="info-grid">
              <div class="info-item">
                <i class="fas fa-calendar"></i>
                <div>
                  <div class="info-label">Ngày học</div>
                  <div class="info-value">{{ formatDate(lesson.date) }}</div>
                </div>
              </div>
              <div class="info-item">
                <i class="fas fa-clock"></i>
                <div>
                  <div class="info-label">Thời lượng</div>
                  <div class="info-value">{{ lesson.duration }} phút</div>
                </div>
              </div>
              <div class="info-item">
                <i class="fas fa-book-open"></i>
                <div>
                  <div class="info-label">Bài học số</div>
                  <div class="info-value">{{ lesson.lessonNumber || lesson.id }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Student Progress -->
          <div v-if="lesson.studentProgress" class="progress-section">
            <h3><i class="fas fa-chart-line"></i> Tiến độ học tập của bạn</h3>
            <div class="progress-cards">
              <div class="progress-card">
                <div class="progress-icon video">
                  <i class="fas fa-video"></i>
                </div>
                <div class="progress-info">
                  <div class="progress-title">Video đã xem</div>
                  <div class="progress-stats">
                    <span class="current">{{ lesson.studentProgress.watchedVideos || 0 }}</span>
                    <span class="separator">/</span>
                    <span class="total">{{ lesson.videos?.length || 0 }}</span>
                  </div>
                  <div class="progress-bar-mini">
                    <div 
                      class="progress-fill-mini video" 
                      :style="{ width: calculateProgress(lesson.studentProgress.watchedVideos, lesson.videos?.length) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
              <div class="progress-card">
                <div class="progress-icon document">
                  <i class="fas fa-file-alt"></i>
                </div>
                <div class="progress-info">
                  <div class="progress-title">Tài liệu đã tải</div>
                  <div class="progress-stats">
                    <span class="current">{{ lesson.studentProgress.downloadedDocs || 0 }}</span>
                    <span class="separator">/</span>
                    <span class="total">{{ lesson.documents?.length || 0 }}</span>
                  </div>
                  <div class="progress-bar-mini">
                    <div 
                      class="progress-fill-mini document" 
                      :style="{ width: calculateProgress(lesson.studentProgress.downloadedDocs, lesson.documents?.length) + '%' }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="lesson.studentProgress.lastAccessed" class="last-accessed">
              <i class="fas fa-history"></i>
              <span>Lần cuối truy cập: {{ formatDateTime(lesson.studentProgress.lastAccessed) }}</span>
            </div>
          </div>

          <!-- Mô tả -->
          <div v-if="lesson.description" class="content-section">
            <h3><i class="fas fa-align-left"></i> Mô tả bài học</h3>
            <p class="description">{{ lesson.description }}</p>
          </div>

          <!-- Link học online -->
          <div v-if="lesson.meetLink" class="content-section">
            <h3><i class="fas fa-video"></i> Học trực tuyến</h3>
            <div class="meet-link-box">
              <div class="meet-icon">
                <i class="fas fa-video"></i>
              </div>
              <div class="meet-info">
                <div class="meet-label">Link học trực tuyến</div>
                <a :href="lesson.meetLink" target="_blank" class="meet-url">
                  {{ lesson.meetLink }}
                </a>
              </div>
              <a :href="lesson.meetLink" target="_blank" class="btn-join">
                <i class="fas fa-external-link-alt"></i>
                Tham gia ngay
              </a>
            </div>
          </div>

          <!-- Videos -->
          <div v-if="lesson.videos && lesson.videos.length > 0" class="content-section">
            <h3>
              <i class="fas fa-play-circle"></i> 
              Video bài giảng ({{ lesson.videos.length }})
            </h3>
            <div class="videos-grid">
              <div 
                v-for="(video, index) in lesson.videos" 
                :key="index"
                class="video-card"
              >
                <div class="video-header">
                  <div class="video-title">
                    <i class="fas fa-play"></i>
                    {{ video.title || `Video ${index + 1}` }}
                  </div>
                  <button 
                    v-if="!isVideoWatched(index)"
                    @click="markVideoAsWatched(index)" 
                    class="btn-mark-watched"
                  >
                    <i class="fas fa-check"></i>
                    Đánh dấu đã xem
                  </button>
                  <span v-else class="watched-badge">
                    <i class="fas fa-check-circle"></i>
                    Đã xem
                  </span>
                </div>
                <div class="video-wrapper">
                  <iframe 
                    :src="getEmbedUrl(video.url)" 
                    frameborder="0" 
                    allowfullscreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  ></iframe>
                </div>
                <a :href="video.url" target="_blank" class="video-link">
                  <i class="fas fa-external-link-alt"></i>
                  Mở trong tab mới
                </a>
              </div>
            </div>
          </div>

          <!-- Tài liệu -->
          <div v-if="lesson.documents && lesson.documents.length > 0" class="content-section">
            <h3>
              <i class="fas fa-file-alt"></i> 
              Tài liệu ({{ lesson.documents.length }})
            </h3>
            <div class="documents-list">
              <div 
                v-for="(doc, index) in lesson.documents" 
                :key="index"
                class="document-card"
              >
                <div class="document-icon" :class="doc.type">
                  <i :class="getDocIcon(doc.type)"></i>
                </div>
                <div class="document-info">
                  <div class="document-name">{{ doc.name }}</div>
                  <div class="document-type">{{ getDocTypeLabel(doc.type) }}</div>
                </div>
                <a 
                  :href="doc.url" 
                  target="_blank" 
                  @click="markDocAsDownloaded(index)"
                  class="btn-download"
                >
                  <i class="fas fa-download"></i>
                  Tải về
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="close" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            Đóng
          </button>
          <button 
            @click="goToAssignments"
            class="btn btn-primary"
          >
            <i class="fas fa-file-alt"></i>
            Xem bài tập
          </button>
          <button 
            v-if="!isLessonCompleted"
            @click="markAsCompleted" 
            class="btn btn-success"
          >
            <i class="fas fa-check-circle"></i>
            Đánh dấu hoàn thành
          </button>
          <button 
            v-else
            class="btn btn-completed"
            disabled
          >
            <i class="fas fa-check-double"></i>
            Đã hoàn thành
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  lesson: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'update-progress'])
const router = useRouter()

const watchedVideos = ref(new Set(props.lesson?.studentProgress?.watchedVideos || []))
const downloadedDocs = ref(new Set(props.lesson?.studentProgress?.downloadedDocs || []))

const isLessonCompleted = computed(() => {
  return props.lesson?.studentProgress?.status === 'completed'
})

const calculateProgress = (current, total) => {
  if (!total || total === 0) return 0
  return Math.round((current / total) * 100)
}

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', { 
    weekday: 'long',
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

const formatDateTime = (date) => {
  const d = new Date(date)
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getProgressLabel = (status) => {
  const labels = {
    'completed': 'Đã hoàn thành',
    'in-progress': 'Đang học',
    'not-started': 'Chưa học'
  }
  return labels[status] || 'Chưa học'
}

const getEmbedUrl = (url) => {
  if (!url) return ''
  
  // YouTube
  if (url.includes('youtube.com/watch')) {
    const videoId = url.split('v=')[1]?.split('&')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }
  
  // Vimeo
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
    return `https://player.vimeo.com/video/${videoId}`
  }
  
  return url
}

const getDocIcon = (type) => {
  const icons = {
    pdf: 'fas fa-file-pdf',
    doc: 'fas fa-file-word',
    ppt: 'fas fa-file-powerpoint',
    excel: 'fas fa-file-excel',
    other: 'fas fa-file'
  }
  return icons[type] || 'fas fa-file'
}

const getDocTypeLabel = (type) => {
  const labels = {
    pdf: 'PDF Document',
    doc: 'Word Document',
    ppt: 'PowerPoint',
    excel: 'Excel Spreadsheet',
    other: 'File'
  }
  return labels[type] || 'File'
}

const isVideoWatched = (index) => {
  return watchedVideos.value.has(index)
}

const markVideoAsWatched = (index) => {
  watchedVideos.value.add(index)
  updateProgress()
}

const markDocAsDownloaded = (index) => {
  downloadedDocs.value.add(index)
  updateProgress()
}

const markAsCompleted = () => {
  emit('update-progress', {
    lessonId: props.lesson.id,
    status: 'completed',
    watchedVideos: Array.from(watchedVideos.value),
    downloadedDocs: Array.from(downloadedDocs.value),
    completedAt: new Date().toISOString()
  })
}

const updateProgress = () => {
  const totalItems = (props.lesson.videos?.length || 0) + (props.lesson.documents?.length || 0)
  const completedItems = watchedVideos.value.size + downloadedDocs.value.size
  
  let status = 'not-started'
  if (completedItems > 0 && completedItems < totalItems) {
    status = 'in-progress'
  } else if (completedItems === totalItems && totalItems > 0) {
    status = 'completed'
  }

  emit('update-progress', {
    lessonId: props.lesson.id,
    status,
    watchedVideos: Array.from(watchedVideos.value),
    downloadedDocs: Array.from(downloadedDocs.value),
    lastAccessed: new Date().toISOString()
  })
}

const close = () => {
  emit('close')
}

const goToAssignments = () => {
  emit('close')
  router.push({
    path: '/student-assignments',
    query: {
      lessonId: props.lesson?.id,
      lessonTitle: props.lesson?.title,
      className: props.lesson?.className
    }
  })
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

.header-info {
  flex: 1;
}

.header-info h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  color: #1f2937;
}

.header-meta {
  display: flex;
  gap: 10px;
  align-items: center;
}

.lesson-class {
  font-size: 14px;
  color: #6b7280;
  font-weight: 600;
  background: white;
  padding: 4px 10px;
  border-radius: 6px;
}

.progress-badge {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.progress-badge.completed {
  background: #d1fae5;
  color: #059669;
}

.progress-badge.in-progress {
  background: #dbeafe;
  color: #2563eb;
}

.progress-badge.not-started {
  background: #f3f4f6;
  color: #6b7280;
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
  flex-shrink: 0;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.info-section {
  margin-bottom: 24px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.info-item > i {
  font-size: 24px;
  color: #3b82f6;
}

.info-label {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.info-value {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.progress-section {
  margin-bottom: 32px;
  padding: 20px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 16px;
  border: 2px solid #bae6fd;
}

.progress-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #0c4a6e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.progress-card {
  background: white;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  gap: 12px;
  border: 1px solid #e0f2fe;
}

.progress-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.progress-icon.video {
  background: #fce7f3;
  color: #be185d;
}

.progress-icon.document {
  background: #e0e7ff;
  color: #4338ca;
}

.progress-info {
  flex: 1;
}

.progress-title {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 6px;
}

.progress-stats {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 8px;
}

.progress-stats .current {
  color: #2563eb;
}

.progress-stats .separator {
  color: #9ca3af;
  margin: 0 4px;
}

.progress-stats .total {
  color: #6b7280;
}

.progress-bar-mini {
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill-mini {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.progress-fill-mini.video {
  background: linear-gradient(90deg, #ec4899 0%, #be185d 100%);
}

.progress-fill-mini.document {
  background: linear-gradient(90deg, #6366f1 0%, #4338ca 100%);
}

.last-accessed {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: white;
  border-radius: 8px;
  font-size: 13px;
  color: #6b7280;
}

.last-accessed i {
  color: #3b82f6;
}

.content-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.content-section:last-child {
  border-bottom: none;
}

.content-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.content-section h3 i {
  color: #3b82f6;
}

.description {
  margin: 0;
  font-size: 15px;
  line-height: 1.8;
  color: #4b5563;
  white-space: pre-wrap;
}

.meet-link-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12px;
  border: 2px solid #3b82f6;
}

.meet-icon {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #3b82f6;
  flex-shrink: 0;
}

.meet-info {
  flex: 1;
}

.meet-label {
  font-size: 13px;
  color: #1e40af;
  font-weight: 600;
  margin-bottom: 4px;
}

.meet-url {
  font-size: 14px;
  color: #1d4ed8;
  word-break: break-all;
  text-decoration: none;
}

.meet-url:hover {
  text-decoration: underline;
}

.btn-join {
  padding: 12px 20px;
  background: #3b82f6;
  color: white;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-join:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.videos-grid {
  display: grid;
  gap: 20px;
}

.video-card {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #e5e7eb;
}

.video-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.video-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.video-title i {
  color: #be185d;
}

.btn-mark-watched {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-mark-watched:hover {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.watched-badge {
  padding: 6px 12px;
  background: #d1fae5;
  color: #059669;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 12px;
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.video-link:hover {
  text-decoration: underline;
}

.documents-list {
  display: grid;
  gap: 12px;
}

.document-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s;
}

.document-card:hover {
  background: white;
  border-color: #3b82f6;
}

.document-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.document-icon.pdf {
  background: #fee2e2;
  color: #dc2626;
}

.document-icon.doc {
  background: #dbeafe;
  color: #2563eb;
}

.document-icon.ppt {
  background: #fed7aa;
  color: #ea580c;
}

.document-icon.excel {
  background: #d1fae5;
  color: #059669;
}

.document-icon.other {
  background: #e0e7ff;
  color: #6366f1;
}

.document-info {
  flex: 1;
}

.document-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.document-type {
  font-size: 13px;
  color: #6b7280;
}

.btn-download {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-download:hover {
  background: #2563eb;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
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

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-completed {
  background: #d1fae5;
  color: #059669;
  cursor: not-allowed;
  opacity: 0.8;
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
  .info-grid {
    grid-template-columns: 1fr;
  }

  .progress-cards {
    grid-template-columns: 1fr;
  }

  .meet-link-box {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-join {
    justify-content: center;
  }

  .video-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-mark-watched,
  .watched-badge {
    justify-content: center;
  }
}
</style>
