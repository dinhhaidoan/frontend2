<template>
  <Transition name="modal">
    <div v-if="lesson" class="modal-overlay" @click="close">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <div class="header-info">
            <h2>{{ lesson.title }}</h2>
            <span class="lesson-class">{{ lesson.className }}</span>
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
                <i class="fas fa-info-circle"></i>
                <div>
                  <div class="info-label">Trạng thái</div>
                  <span :class="['status-badge', lesson.status]">
                    {{ getStatusLabel(lesson.status) }}
                  </span>
                </div>
              </div>
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
                Tham gia
              </a>
            </div>
          </div>

          <!-- Videos -->
          <div v-if="lesson.videos && lesson.videos.length > 0" class="content-section">
            <h3><i class="fas fa-play-circle"></i> Video bài giảng ({{ lesson.videos.length }})</h3>
            <div class="videos-grid">
              <div 
                v-for="(video, index) in lesson.videos" 
                :key="index"
                class="video-card"
              >
                <div class="video-title">{{ video.title || `Video ${index + 1}` }}</div>
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
            <h3><i class="fas fa-file-alt"></i> Tài liệu ({{ lesson.documents.length }})</h3>
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
                <a :href="doc.url" target="_blank" class="btn-download">
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
          <button @click="confirmDelete" class="btn btn-danger">
            <i class="fas fa-trash"></i>
            Xóa
          </button>
          <button @click="editLesson" class="btn btn-primary">
            <i class="fas fa-edit"></i>
            Chỉnh sửa
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Delete Confirmation Dialog -->
  <Transition name="fade">
    <div v-if="showDeleteConfirm" class="delete-overlay" @click.self="cancelDelete">
      <div class="delete-dialog">
        <div class="delete-header">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>Xác nhận xóa bài học</h3>
        </div>
        
        <div class="delete-body">
          <p>Bạn có chắc chắn muốn xóa bài học này không?</p>
          <div class="lesson-info-box">
            <strong>{{ lesson.title }}</strong>
            <span>{{ lesson.className }}</span>
          </div>
          <div class="delete-warning">
            <i class="fas fa-info-circle"></i>
            <span>Hành động này không thể hoàn tác!</span>
          </div>
        </div>

        <div class="delete-footer">
          <button @click="cancelDelete" class="btn-delete-cancel">
            <i class="fas fa-times"></i>
            Hủy
          </button>
          <button @click="deleteLesson" class="btn-delete-confirm">
            <i class="fas fa-trash"></i>
            Xóa bài học
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  lesson: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'edit', 'delete'])

const showDeleteConfirm = ref(false)

const formatDate = (date) => {
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', { 
    weekday: 'long',
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  })
}

const getStatusLabel = (status) => {
  const labels = {
    published: 'Đã công bố',
    draft: 'Bản nháp',
    scheduled: 'Đã lên lịch'
  }
  return labels[status] || status
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

const close = () => {
  emit('close')
}

const editLesson = () => {
  emit('edit', props.lesson)
}

const confirmDelete = () => {
  showDeleteConfirm.value = true
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
}

const deleteLesson = () => {
  emit('delete', props.lesson)
  showDeleteConfirm.value = false
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

.header-info h2 {
  margin: 0 0 6px 0;
  font-size: 24px;
  color: #1f2937;
}

.lesson-class {
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

.status-badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
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

.video-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 12px;
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

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover {
  background: #dc2626;
}

/* Delete Confirmation Dialog */
.delete-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}

.delete-dialog {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.delete-header {
  padding: 24px;
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 2px solid #fca5a5;
}

.delete-header i {
  font-size: 32px;
  color: #dc2626;
}

.delete-header h3 {
  margin: 0;
  font-size: 20px;
  color: #991b1b;
  font-weight: 700;
}

.delete-body {
  padding: 24px;
}

.delete-body p {
  margin: 0 0 16px;
  font-size: 15px;
  color: #374151;
}

.lesson-info-box {
  padding: 16px;
  background: #f9fafb;
  border-radius: 10px;
  border-left: 4px solid #ef4444;
  margin-bottom: 16px;
}

.lesson-info-box strong {
  display: block;
  font-size: 16px;
  color: #1f2937;
  margin-bottom: 4px;
}

.lesson-info-box span {
  font-size: 14px;
  color: #6b7280;
}

.delete-warning {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: #fef3c7;
  border-radius: 8px;
  border-left: 4px solid #f59e0b;
}

.delete-warning i {
  color: #d97706;
  font-size: 18px;
}

.delete-warning span {
  color: #92400e;
  font-weight: 600;
  font-size: 14px;
}

.delete-footer {
  padding: 20px 24px;
  background: #f9fafb;
  border-radius: 0 0 16px 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 2px solid #e5e7eb;
}

.btn-delete-cancel,
.btn-delete-confirm {
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-delete-cancel {
  background: #f3f4f6;
  color: #374151;
}

.btn-delete-cancel:hover {
  background: #e5e7eb;
}

.btn-delete-confirm {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

.btn-delete-confirm:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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

  .meet-link-box {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-join {
    justify-content: center;
  }
}
</style>
