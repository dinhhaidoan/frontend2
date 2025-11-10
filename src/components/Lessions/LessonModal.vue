<template>
  <Transition name="modal">
    <div v-if="modelValue" class="modal-overlay" @click="close">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>
            <i class="fas fa-book-open"></i>
            {{ isEdit ? 'Chỉnh sửa bài học' : 'Thêm bài học mới' }}
          </h2>
          <button @click="close" class="close-btn">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-section">
            <h3>Thông tin cơ bản</h3>
            <div class="form-grid">
              <div class="form-group full-width">
                <label>Tiêu đề bài học <span class="required">*</span></label>
                <input 
                  v-model="formData.title" 
                  type="text" 
                  placeholder="Nhập tiêu đề bài học..."
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label>Lớp học <span class="required">*</span></label>
                <select v-model="formData.classId" class="form-input">
                  <option value="">-- Chọn lớp --</option>
                  <option value="1">Lập trình Web - WEB301</option>
                  <option value="2">Thực hành Web - WEB301.1</option>
                  <option value="3">Lập trình Mobile - MOB201</option>
                  <option value="4">Cơ sở dữ liệu - DB301</option>
                </select>
              </div>

              <div class="form-group">
                <label>Ngày học <span class="required">*</span></label>
                <input 
                  v-model="formData.date" 
                  type="date" 
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label>Thời lượng (phút)</label>
                <input 
                  v-model.number="formData.duration" 
                  type="number" 
                  placeholder="90"
                  class="form-input"
                >
              </div>

              <div class="form-group">
                <label>Trạng thái</label>
                <select v-model="formData.status" class="form-input">
                  <option value="draft">Bản nháp</option>
                  <option value="published">Công bố</option>
                  <option value="scheduled">Lên lịch</option>
                </select>
              </div>

              <div class="form-group full-width">
                <label>Mô tả bài học</label>
                <textarea 
                  v-model="formData.description" 
                  rows="4"
                  placeholder="Nhập mô tả chi tiết về bài học..."
                  class="form-input"
                ></textarea>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h3>
              <i class="fas fa-video"></i>
              Học trực tuyến
            </h3>
            <div class="form-group">
              <label>Link Google Meet / Zoom</label>
              <div class="input-with-icon">
                <i class="fas fa-link"></i>
                <input 
                  v-model="formData.meetLink" 
                  type="url" 
                  placeholder="https://meet.google.com/..."
                  class="form-input"
                >
              </div>
              <small class="form-hint">Thêm link để học sinh tham gia học trực tuyến</small>
            </div>
          </div>

          <div class="form-section">
            <h3>
              <i class="fas fa-play-circle"></i>
              Video bài giảng
            </h3>
            <div class="video-list">
              <div 
                v-for="(video, index) in formData.videos" 
                :key="index"
                class="video-item"
              >
                <div class="video-input-group">
                  <input 
                    v-model="video.title" 
                    type="text" 
                    placeholder="Tiêu đề video..."
                    class="form-input"
                  >
                  <input 
                    v-if="!video.isUploaded"
                    v-model="video.url" 
                    type="url" 
                    placeholder="URL video (YouTube, Vimeo, etc.)..."
                    class="form-input"
                  >
                  <div v-else class="upload-info">
                    <i class="fas fa-check-circle"></i>
                    <span>{{ video.file?.name }}</span>
                  </div>
                  <button @click="removeVideo(index)" class="btn-remove">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                
                <div class="upload-section">
                  <label v-if="!video.isUploaded" class="upload-label">
                    <input 
                      type="file" 
                      accept="video/*"
                      @change="handleVideoFileUpload($event, index)"
                      style="display: none"
                    >
                    <i class="fas fa-upload"></i>
                    Hoặc tải video từ máy
                  </label>
                  <button v-else @click="removeVideoFile(index)" class="btn-remove-file">
                    <i class="fas fa-trash"></i>
                    Xóa file
                  </button>
                </div>

                <div v-if="video.url && !video.isUploaded && isValidVideoUrl(video.url)" class="video-preview">
                  <div class="video-embed">
                    <iframe 
                      :src="getEmbedUrl(video.url)" 
                      frameborder="0" 
                      allowfullscreen
                    ></iframe>
                  </div>
                </div>
              </div>
            </div>
            <button @click="addVideo" class="btn-add">
              <i class="fas fa-plus"></i>
              Thêm video
            </button>
          </div>

          <div class="form-section">
            <h3>
              <i class="fas fa-file-alt"></i>
              Tài liệu
            </h3>
            <div class="document-list">
              <div 
                v-for="(doc, index) in formData.documents" 
                :key="index"
                class="document-item"
              >
                <div class="document-input-group">
                  <input 
                    v-model="doc.name" 
                    type="text" 
                    placeholder="Tên tài liệu..."
                    class="form-input"
                  >
                  <input 
                    v-if="!doc.isUploaded"
                    v-model="doc.url" 
                    type="url" 
                    placeholder="URL tài liệu (Google Drive, Dropbox, etc.)..."
                    class="form-input"
                  >
                  <div v-else class="upload-info">
                    <i class="fas fa-check-circle"></i>
                    <span>{{ doc.file?.name }}</span>
                  </div>
                  <select v-model="doc.type" class="form-input">
                    <option value="pdf">PDF</option>
                    <option value="doc">Word</option>
                    <option value="ppt">PowerPoint</option>
                    <option value="excel">Excel</option>
                    <option value="other">Khác</option>
                  </select>
                  <button @click="removeDocument(index)" class="btn-remove">
                    <i class="fas fa-times"></i>
                  </button>
                </div>

                <div class="upload-section">
                  <label v-if="!doc.isUploaded" class="upload-label">
                    <input 
                      type="file" 
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                      @change="handleDocumentFileUpload($event, index)"
                      style="display: none"
                    >
                    <i class="fas fa-upload"></i>
                    Hoặc tải tài liệu từ máy
                  </label>
                  <button v-else @click="removeDocumentFile(index)" class="btn-remove-file">
                    <i class="fas fa-trash"></i>
                    Xóa file
                  </button>
                </div>
              </div>
            </div>
            <button @click="addDocument" class="btn-add">
              <i class="fas fa-plus"></i>
              Thêm tài liệu
            </button>
            <small class="form-hint">Hỗ trợ link từ Google Drive, Dropbox, OneDrive hoặc upload file từ máy</small>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="close" class="btn btn-secondary">
            <i class="fas fa-times"></i>
            Hủy
          </button>
          <button @click="saveLesson" class="btn btn-primary">
            <i class="fas fa-save"></i>
            {{ isEdit ? 'Cập nhật' : 'Tạo bài học' }}
          </button>
        </div>
      </div>

      <!-- Confirmation Dialog -->
      <Transition name="fade">
        <div v-if="showConfirmation" class="confirmation-overlay" @click="closeConfirmation">
          <div class="confirmation-dialog" @click.stop>
            <div class="confirmation-header">
              <i class="fas fa-check-circle"></i>
              <h3>Xác nhận {{ isEdit ? 'cập nhật' : 'tạo' }} bài học</h3>
            </div>
            <div class="confirmation-body">
              <p>Bạn có chắc chắn muốn {{ isEdit ? 'cập nhật' : 'tạo' }} bài học này không?</p>
              
              <div class="confirmation-info">
                <div class="info-row">
                  <strong>Tiêu đề:</strong>
                  <span>{{ formData.title }}</span>
                </div>
                <div class="info-row">
                  <strong>Lớp học:</strong>
                  <span>{{ getClassName(formData.classId) }}</span>
                </div>
                <div class="info-row">
                  <strong>Ngày học:</strong>
                  <span>{{ formatDate(formData.date) }}</span>
                </div>
              </div>

              <div class="confirmation-summary">
                <div v-if="getConfirmationSummary().hasMeetLink" class="summary-item online">
                  <i class="fas fa-video"></i>
                  <span>Có link học online</span>
                </div>
                <div v-if="getConfirmationSummary().videos > 0" class="summary-item video">
                  <i class="fas fa-play-circle"></i>
                  <div>
                    <strong>{{ getConfirmationSummary().videos }} Video</strong>
                    <small v-if="getConfirmationSummary().videosFromFile > 0">
                      ({{ getConfirmationSummary().videosFromFile }} từ máy, {{ getConfirmationSummary().videosFromUrl }} từ link)
                    </small>
                  </div>
                </div>
                <div v-if="getConfirmationSummary().documents > 0" class="summary-item document">
                  <i class="fas fa-file-alt"></i>
                  <div>
                    <strong>{{ getConfirmationSummary().documents }} Tài liệu</strong>
                    <small v-if="getConfirmationSummary().docsFromFile > 0">
                      ({{ getConfirmationSummary().docsFromFile }} từ máy, {{ getConfirmationSummary().docsFromUrl }} từ link)
                    </small>
                  </div>
                </div>
              </div>
            </div>
            <div class="confirmation-footer">
              <button @click="closeConfirmation" class="btn-cancel-confirm">
                <i class="fas fa-times"></i>
                Hủy
              </button>
              <button @click="confirmSave" class="btn-confirm">
                <i class="fas fa-check"></i>
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  lesson: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'save'])

const isEdit = computed(() => !!props.lesson)
const showConfirmation = ref(false)

const defaultFormData = {
  title: '',
  classId: '',
  date: '',
  duration: 90,
  status: 'draft',
  description: '',
  meetLink: '',
  videos: [],
  documents: []
}

const formData = ref({ ...defaultFormData })

watch(() => props.lesson, (newLesson) => {
  if (newLesson) {
    formData.value = {
      ...newLesson,
      videos: newLesson.videos ? [...newLesson.videos] : [],
      documents: newLesson.documents ? [...newLesson.documents] : []
    }
  } else {
    formData.value = { ...defaultFormData }
  }
}, { immediate: true })

const close = () => {
  emit('update:modelValue', false)
  setTimeout(() => {
    formData.value = { ...defaultFormData }
  }, 300)
}

const addVideo = () => {
  formData.value.videos.push({
    title: '',
    url: '',
    file: null,
    isUploaded: false
  })
}

const removeVideo = (index) => {
  formData.value.videos.splice(index, 1)
}

const handleVideoFileUpload = (event, index) => {
  const file = event.target.files[0]
  if (file) {
    formData.value.videos[index].file = file
    formData.value.videos[index].isUploaded = true
    if (!formData.value.videos[index].title) {
      formData.value.videos[index].title = file.name.replace(/\.[^/.]+$/, '')
    }
  }
}

const removeVideoFile = (index) => {
  formData.value.videos[index].file = null
  formData.value.videos[index].isUploaded = false
}

const addDocument = () => {
  formData.value.documents.push({
    name: '',
    url: '',
    type: 'pdf',
    file: null,
    isUploaded: false
  })
}

const removeDocument = (index) => {
  formData.value.documents.splice(index, 1)
}

const handleDocumentFileUpload = (event, index) => {
  const file = event.target.files[0]
  if (file) {
    formData.value.documents[index].file = file
    formData.value.documents[index].isUploaded = true
    if (!formData.value.documents[index].name) {
      formData.value.documents[index].name = file.name
    }
    // Auto detect file type
    const ext = file.name.split('.').pop().toLowerCase()
    if (ext === 'pdf') formData.value.documents[index].type = 'pdf'
    else if (['doc', 'docx'].includes(ext)) formData.value.documents[index].type = 'doc'
    else if (['ppt', 'pptx'].includes(ext)) formData.value.documents[index].type = 'ppt'
    else if (['xls', 'xlsx'].includes(ext)) formData.value.documents[index].type = 'excel'
    else formData.value.documents[index].type = 'other'
  }
}

const removeDocumentFile = (index) => {
  formData.value.documents[index].file = null
  formData.value.documents[index].isUploaded = false
}

const isValidVideoUrl = (url) => {
  if (!url) return false
  return url.includes('youtube.com') || url.includes('youtu.be') || url.includes('vimeo.com')
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

const saveLesson = () => {
  // Validation
  if (!formData.value.title || !formData.value.classId || !formData.value.date) {
    alert('Vui lòng điền đầy đủ thông tin bắt buộc!')
    return
  }

  showConfirmation.value = true
}

const closeConfirmation = () => {
  showConfirmation.value = false
}

const confirmSave = () => {
  emit('save', { ...formData.value })
  showConfirmation.value = false
  close()
}

const getConfirmationSummary = () => {
  const videos = formData.value.videos.length
  const videosFromUrl = formData.value.videos.filter(v => v.url && !v.isUploaded).length
  const videosFromFile = formData.value.videos.filter(v => v.isUploaded).length
  
  const documents = formData.value.documents.length
  const docsFromUrl = formData.value.documents.filter(d => d.url && !d.isUploaded).length
  const docsFromFile = formData.value.documents.filter(d => d.isUploaded).length

  return {
    videos,
    videosFromUrl,
    videosFromFile,
    documents,
    docsFromUrl,
    docsFromFile,
    hasMeetLink: !!formData.value.meetLink
  }
}

const getClassName = (classId) => {
  const classes = {
    '1': 'Lập trình Web - WEB301',
    '2': 'Thực hành Web - WEB301.1',
    '3': 'Lập trình Mobile - MOB201',
    '4': 'Cơ sở dữ liệu - DB301'
  }
  return classes[classId] || 'Chưa chọn lớp'
}

const formatDate = (date) => {
  if (!date) return 'Chưa chọn ngày'
  const d = new Date(date)
  return d.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
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
  align-items: center;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 20px 20px 0 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 22px;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-header h2 i {
  color: #3b82f6;
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
  padding: 24px;
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.form-section h3 {
  margin: 0 0 20px 0;
  font-size: 16px;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
}

.form-section h3 i {
  color: #3b82f6;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.required {
  color: #ef4444;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

textarea.form-input {
  resize: vertical;
  font-family: inherit;
}

.input-with-icon {
  position: relative;
}

.input-with-icon i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.input-with-icon .form-input {
  padding-left: 40px;
}

.form-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: -4px;
}

.video-list,
.document-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
}

.video-item,
.document-item {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  background: #f9fafb;
}

.video-input-group,
.document-input-group {
  display: grid;
  grid-template-columns: 1fr 2fr auto;
  gap: 12px;
  align-items: start;
}

.video-input-group {
  grid-template-columns: 1fr 2fr auto;
}

.upload-section {
  margin-top: 8px;
}

.upload-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #eff6ff;
  color: #3b82f6;
  border: 2px dashed #3b82f6;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s;
}

.upload-label:hover {
  background: #dbeafe;
  border-color: #2563eb;
}

.upload-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #d1fae5;
  border: 1px solid #10b981;
  border-radius: 8px;
  color: #059669;
  font-size: 13px;
  font-weight: 500;
}

.upload-info i {
  color: #10b981;
}

.btn-remove-file {
  padding: 8px 12px;
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-remove-file:hover {
  background: #fecaca;
  border-color: #f87171;
}

.document-input-group {
  grid-template-columns: 1fr 2fr 100px auto;
}

.btn-remove {
  width: 36px;
  height: 36px;
  border: 1px solid #fca5a5;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-remove:hover {
  background: #fecaca;
  border-color: #f87171;
}

.video-preview {
  margin-top: 12px;
}

.video-embed {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 8px;
}

.video-embed iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.btn-add {
  padding: 10px 16px;
  border: 2px dashed #d1d5db;
  background: white;
  color: #3b82f6;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: center;
}

.btn-add:hover {
  border-color: #3b82f6;
  background: #eff6ff;
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

/* Confirmation Dialog */
.confirmation-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.confirmation-dialog {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 550px;
  width: 100%;
  overflow: hidden;
}

.confirmation-header {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
}

.confirmation-header i {
  font-size: 24px;
}

.confirmation-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.confirmation-body {
  padding: 24px;
}

.confirmation-body p {
  margin: 0 0 20px 0;
  color: #374151;
  font-size: 15px;
  line-height: 1.6;
}

.confirmation-info {
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e5e7eb;
}

.info-row:last-child {
  border-bottom: none;
}

.info-row strong {
  color: #6b7280;
  font-size: 14px;
}

.info-row span {
  color: #1f2937;
  font-weight: 600;
  font-size: 14px;
}

.confirmation-summary {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 10px;
}

.summary-item i {
  font-size: 20px;
}

.summary-item strong {
  display: block;
  font-size: 14px;
  margin-bottom: 2px;
}

.summary-item small {
  display: block;
  font-size: 12px;
  opacity: 0.8;
}

.summary-item.online {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.summary-item.video {
  background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
  color: #be185d;
}

.summary-item.document {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  color: #4338ca;
}

.confirmation-footer {
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn-cancel-confirm,
.btn-confirm {
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

.btn-cancel-confirm {
  background: #f3f4f6;
  color: #374151;
}

.btn-cancel-confirm:hover {
  background: #e5e7eb;
}

.btn-confirm {
  background: #10b981;
  color: white;
}

.btn-confirm:hover {
  background: #059669;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.fade-enter-active .confirmation-dialog,
.fade-leave-active .confirmation-dialog {
  transition: transform 0.2s;
}

.fade-enter-from .confirmation-dialog,
.fade-leave-to .confirmation-dialog {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .video-input-group,
  .document-input-group {
    grid-template-columns: 1fr;
  }

  .btn-remove {
    width: 100%;
  }
}
</style>
