<template>
  <Teleport to="body">
    <div v-if="isVisible && note" class="modal-overlay" @click="closeModal">
      <div class="modal-container" @click.stop>
        <!-- Modal Header -->
        <div class="modal-header">
          <div class="header-content">
            <div class="note-meta">
              <span class="note-category" :class="note.category">
                <i :class="getCategoryIcon(note.category)"></i>
                {{ getCategoryLabel(note.category) }}
              </span>
              <span class="note-priority" :class="note.priority">
                {{ getPriorityLabel(note.priority) }}
              </span>
              <span class="note-status" :class="note.status">
                <i :class="getStatusIcon(note.status)"></i>
                {{ getStatusLabel(note.status) }}
              </span>
            </div>
            <div class="header-actions">
              <button 
                @click="$emit('toggle-favorite', note)" 
                class="action-btn favorite" 
                :class="{ active: note.isFavorite }"
                title="Yêu thích"
              >
                <i class="fas fa-heart"></i>
              </button>
              <button 
                @click="$emit('toggle-archive', note)" 
                class="action-btn archive"
                :class="{ active: note.isArchived }"
                title="Lưu trữ"
              >
                <i class="fas fa-archive"></i>
              </button>
              <button @click="$emit('edit', note)" class="action-btn edit" title="Chỉnh sửa">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="exportNote" class="action-btn export" title="Xuất file">
                <i class="fas fa-download"></i>
              </button>
              <button @click="closeModal" class="close-btn">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Modal Body -->
      <div class="modal-body">
        <!-- Note Title -->
        <div class="note-header">
          <h1 class="note-title">{{ note.title }}</h1>
          <div class="note-badges">
            <span v-if="note.isFavorite" class="badge favorite">
              <i class="fas fa-heart"></i>
              Yêu thích
            </span>
            <span v-if="note.isArchived" class="badge archived">
              <i class="fas fa-archive"></i>
              Lưu trữ
            </span>
          </div>
        </div>
        
        <!-- Note Info -->
        <div class="note-info">
          <div class="info-item">
            <i class="fas fa-user"></i>
            <span>Tác giả: <strong>{{ note.author }}</strong></span>
          </div>
          <div class="info-item">
            <i class="fas fa-calendar-plus"></i>
            <span>Tạo: <strong>{{ formatDate(note.createdAt) }}</strong></span>
          </div>
          <div class="info-item">
            <i class="fas fa-clock"></i>
            <span>Cập nhật: <strong>{{ formatDate(note.updatedAt) }}</strong></span>
          </div>
          <div class="info-item" v-if="note.tags && note.tags.length > 0">
            <i class="fas fa-tags"></i>
            <div class="tags-container">
              <span v-for="tag in note.tags" :key="tag" class="tag">
                #{{ tag }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Note Content -->
        <div class="note-content">
          <div class="content-toolbar">
            <h3>Nội dung</h3>
            <div class="toolbar-actions">
              <button 
                @click="toggleViewMode" 
                class="toolbar-btn"
                :class="{ active: viewMode === 'rendered' }"
                title="Chuyển đổi chế độ xem"
              >
                <i class="fas fa-eye"></i>
                {{ viewMode === 'rendered' ? 'Markdown' : 'Rendered' }}
              </button>
              <button @click="copyContent" class="toolbar-btn" title="Sao chép nội dung">
                <i class="fas fa-copy"></i>
                {{ copied ? 'Đã sao chép!' : 'Sao chép' }}
              </button>
            </div>
          </div>
          
          <div class="content-display">
            <div v-if="viewMode === 'markdown'" class="markdown-content">
              <pre>{{ note.content }}</pre>
            </div>
            <div v-else class="rendered-content" v-html="renderedContent"></div>
          </div>
        </div>
        
        <!-- Statistics -->
        <div class="note-stats">
          <div class="stat-item">
            <i class="fas fa-font"></i>
            <span>{{ getWordCount(note.content) }} từ</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-keyboard"></i>
            <span>{{ note.content.length }} ký tự</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-paragraph"></i>
            <span>{{ getLineCount(note.content) }} dòng</span>
          </div>
          <div class="stat-item" v-if="note.tags && note.tags.length > 0">
            <i class="fas fa-hashtag"></i>
            <span>{{ note.tags.length }} thẻ</span>
          </div>
        </div>
        
        <!-- Related Actions -->
        <div class="related-actions">
          <h4>Thao tác khác</h4>
          <div class="action-grid">
            <button @click="duplicateNote" class="action-card">
              <i class="fas fa-copy"></i>
              <span>Nhân bản</span>
            </button>
            <button @click="shareNote" class="action-card">
              <i class="fas fa-share"></i>
              <span>Chia sẻ</span>
            </button>
            <button @click="printNote" class="action-card">
              <i class="fas fa-print"></i>
              <span>In</span>
            </button>
            <button @click="$emit('delete', note)" class="action-card danger">
              <i class="fas fa-trash"></i>
              <span>Xóa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  note: {
    type: Object,
    default: null
  }
})

const emit = defineEmits([
  'close', 
  'edit', 
  'delete', 
  'toggle-favorite', 
  'toggle-archive',
  'duplicate',
  'share'
])

const viewMode = ref('rendered') // 'markdown' or 'rendered'
const copied = ref(false)

// Watch for modal visibility to control body scroll
watch(() => props.isVisible, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const renderedContent = computed(() => {
  if (!props.note?.content) return ''
  
  // Simple markdown to HTML conversion
  let html = props.note.content
  
  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')
  
  // Bold and Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  html = html.replace(/__(.*?)__/g, '<u>$1</u>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
  
  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  
  // Lists
  html = html.replace(/^\- (.*$)/gm, '<li>$1</li>')
  html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  // Blockquotes
  html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br>')
  html = `<p>${html}</p>`
  
  return html
})

const getCategoryIcon = (category) => {
  const icons = {
    study: 'fas fa-graduation-cap',
    project: 'fas fa-project-diagram',
    meeting: 'fas fa-users',
    resource: 'fas fa-book',
    personal: 'fas fa-user',
    work: 'fas fa-briefcase'
  }
  return icons[category] || 'fas fa-sticky-note'
}

const getCategoryLabel = (category) => {
  const labels = {
    study: 'Học tập',
    project: 'Dự án',
    meeting: 'Cuộc họp',
    resource: 'Tài liệu',
    personal: 'Cá nhân',
    work: 'Công việc'
  }
  return labels[category] || category
}

const getPriorityLabel = (priority) => {
  const labels = {
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp'
  }
  return labels[priority] || priority
}

const getStatusIcon = (status) => {
  const icons = {
    active: 'fas fa-circle',
    completed: 'fas fa-check-circle',
    draft: 'fas fa-edit'
  }
  return icons[status] || 'fas fa-circle'
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Hoạt động',
    completed: 'Hoàn thành',
    draft: 'Nháp'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  const noteDate = new Date(date)
  return noteDate.toLocaleString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getWordCount = (content) => {
  return content.trim().split(/\s+/).filter(word => word.length > 0).length
}

const getLineCount = (content) => {
  return content.split('\n').length
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'rendered' ? 'markdown' : 'rendered'
}

const copyContent = async () => {
  try {
    await navigator.clipboard.writeText(props.note.content)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy content:', error)
  }
}

const exportNote = () => {
  const content = `# ${props.note.title}\n\n${props.note.content}`
  const blob = new Blob([content], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.note.title.replace(/[^a-zA-Z0-9]/g, '_')}.md`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

const duplicateNote = () => {
  emit('duplicate', props.note)
}

const shareNote = () => {
  if (navigator.share) {
    navigator.share({
      title: props.note.title,
      text: props.note.content,
      url: window.location.href
    })
  } else {
    // Fallback: copy URL to clipboard
    navigator.clipboard.writeText(window.location.href)
    // You can show a toast message here
  }
}

const printNote = () => {
  const printWindow = window.open('', '_blank')
  printWindow.document.write(`
    <html>
      <head>
        <title>${props.note.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
          h1 { color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px; }
          .meta { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .content { margin: 20px 0; }
          pre { background: #f8f8f8; padding: 15px; border-radius: 5px; overflow-x: auto; }
          code { background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
          blockquote { border-left: 4px solid #ddd; padding-left: 15px; margin: 15px 0; color: #666; }
        </style>
      </head>
      <body>
        <h1>${props.note.title}</h1>
        <div class="meta">
          <p><strong>Tác giả:</strong> ${props.note.author}</p>
          <p><strong>Tạo:</strong> ${formatDate(props.note.createdAt)}</p>
          <p><strong>Cập nhật:</strong> ${formatDate(props.note.updatedAt)}</p>
          <p><strong>Danh mục:</strong> ${getCategoryLabel(props.note.category)}</p>
          <p><strong>Độ ưu tiên:</strong> ${getPriorityLabel(props.note.priority)}</p>
          ${props.note.tags && props.note.tags.length > 0 ? `<p><strong>Thẻ:</strong> ${props.note.tags.map(tag => '#' + tag).join(', ')}</p>` : ''}
        </div>
        <div class="content">
          ${renderedContent.value}
        </div>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}

const closeModal = () => {
  document.body.style.overflow = ''
  emit('close')
}

// Cleanup on unmount
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* Complete CSS Reset and Isolation for Modal */
.modal-overlay {
  /* CRITICAL: Remove ALL inherited styles */
  all: initial !important;
  
  /* Critical positioning - must override everything */
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  
  /* Ensure modal is above all other elements */
  z-index: 99999 !important;
  
  /* Visual styling */
  background: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(4px) !important;
  -webkit-backdrop-filter: blur(4px) !important;
  
  /* Layout */
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 20px !important;
  overflow-y: auto !important;
  
  /* Reset any inherited styles */
  box-sizing: border-box !important;
  margin: 0 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
  
  /* Prevent interaction with elements behind */
  pointer-events: auto !important;
  
  /* Remove any parent background effects */
  background-image: none !important;
  background-attachment: initial !important;
  filter: none !important;
}

.modal-container {
  /* Critical styling - override any conflicts */
  background: white !important;
  border-radius: 20px !important;
  box-shadow: 0 20px 64px rgba(0, 0, 0, 0.15) !important;
  
  /* Size constraints */
  max-width: 900px !important;
  width: 100% !important;
  max-height: 90vh !important;
  
  /* Layout */
  overflow: hidden !important;
  display: flex !important;
  flex-direction: column !important;
  box-sizing: border-box !important;
  
  /* Positioning */
  margin: auto !important;
  position: relative !important;
  
  /* Reset any inherited transforms or positioning */
  transform: none !important;
  left: auto !important;
  right: auto !important;
  top: auto !important;
  bottom: auto !important;
  
  /* Ensure interactivity */
  pointer-events: auto !important;
  
  /* Reset inherited styles */
  padding: 0 !important;
  border: none !important;
}

.modal-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  padding: 20px 32px !important;
  color: white !important;
  flex-shrink: 0 !important;
  display: block !important;
  
  /* Reset any conflicting styles */
  margin: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  position: relative !important;
  z-index: 1 !important;
}

.header-content {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  
  /* Reset inherited styles */
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
}

.note-meta {
  display: flex !important;
  gap: 12px !important;
  flex-wrap: wrap !important;
  
  /* Reset inherited styles */
  margin: 0 !important;
  padding: 0 !important;
  align-items: center !important;
}

.note-category, .note-priority, .note-status {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 6px 12px !important;
  border-radius: 20px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  background: rgba(255, 255, 255, 0.2) !important;
  
  /* Reset inherited styles */
  margin: 0 !important;
  border: none !important;
  box-shadow: none !important;
  white-space: nowrap !important;
}

.header-actions {
  display: flex !important;
  gap: 8px !important;
  align-items: center !important;
  
  /* Reset inherited styles */
  margin: 0 !important;
  padding: 0 !important;
}

.action-btn {
  width: 40px !important;
  height: 40px !important;
  border: none !important;
  border-radius: 10px !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 16px !important;
  transition: all 0.2s ease !important;
  background: rgba(255, 255, 255, 0.1) !important;
  color: white !important;
  
  /* Reset inherited styles */
  padding: 0 !important;
  margin: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  font-weight: normal !important;
  line-height: 1 !important;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: scale(1.05) !important;
}

.action-btn.active {
  background: rgba(255, 255, 255, 0.3) !important;
}

.close-btn {
  width: 40px !important;
  height: 40px !important;
  border: none !important;
  background: rgba(255, 255, 255, 0.2) !important;
  border-radius: 10px !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: white !important;
  font-size: 18px !important;
  transition: all 0.2s ease !important;
  margin-left: 12px !important;
  
  /* Reset inherited styles */
  padding: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  font-weight: normal !important;
  line-height: 1 !important;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}

.modal-body {
  flex: 1 !important;
  overflow-y: auto !important;
  padding: 32px !important;
  min-height: 0 !important;
  box-sizing: border-box !important;
  
  /* Reset inherited styles */
  background: white !important;
  margin: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  position: relative !important;
  z-index: 1 !important;
}

.note-header {
  margin-bottom: 24px !important;
  
  /* Reset inherited styles */
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
}

.note-title {
  font-size: 28px !important;
  font-weight: 800 !important;
  color: #1f2937 !important;
  margin: 0 0 12px 0 !important;
  line-height: 1.3 !important;
  
  /* Reset inherited styles */
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  text-align: left !important;
}

.note-badges {
  display: flex !important;
  gap: 8px !important;
  margin: 0 !important;
  padding: 0 !important;
}

.badge {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 6px 12px !important;
  border-radius: 20px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  margin: 0 !important;
  border: none !important;
}

.badge.favorite {
  background: rgba(239, 68, 68, 0.1) !important;
  color: #ef4444 !important;
}

.badge.archived {
  background: rgba(107, 114, 128, 0.1) !important;
  color: #6b7280 !important;
}

.note-info {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)) !important;
  gap: 16px !important;
  margin-bottom: 32px !important;
  padding: 20px !important;
  background: #f9fafb !important;
  border-radius: 16px !important;
  border: none !important;
}

.info-item {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 14px !important;
  color: #6b7280 !important;
  margin: 0 !important;
  padding: 0 !important;
}

.info-item i {
  width: 16px !important;
  color: #9ca3af !important;
}

.tags-container {
  display: flex !important;
  flex-wrap: wrap !important;
  gap: 6px !important;
  margin: 0 !important;
  padding: 0 !important;
}

.tag {
  padding: 2px 8px !important;
  background: #3b82f6 !important;
  color: white !important;
  border-radius: 12px !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  margin: 0 !important;
  border: none !important;
}

.note-content {
  margin-bottom: 32px !important;
  padding: 0 !important;
}

.content-toolbar {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin-bottom: 16px !important;
  padding-bottom: 12px !important;
  border-bottom: 2px solid #e5e7eb !important;
}

.content-toolbar h3 {
  font-size: 18px !important;
  font-weight: 700 !important;
  color: #1f2937 !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
}

.toolbar-actions {
  display: flex !important;
  gap: 8px !important;
  margin: 0 !important;
  padding: 0 !important;
}

.toolbar-btn {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  padding: 8px 12px !important;
  border: 1px solid #d1d5db !important;
  border-radius: 8px !important;
  background: white !important;
  color: #6b7280 !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  margin: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  text-transform: none !important;
  line-height: normal !important;
}

.toolbar-btn:hover, .toolbar-btn.active {
  background: #f3f4f6 !important;
  border-color: #9ca3af !important;
  color: #374151 !important;
}

.content-display {
  background: white !important;
  border: 2px solid #e5e7eb !important;
  border-radius: 12px !important;
  overflow: hidden !important;
  margin: 0 !important;
  padding: 0 !important;
}

.markdown-content {
  padding: 20px !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
  font-size: 13px !important;
  line-height: 1.6 !important;
  background: #f8f9fa !important;
  margin: 0 !important;
  border: none !important;
}

.markdown-content pre {
  margin: 0 !important;
  white-space: pre-wrap !important;
  word-break: break-word !important;
  padding: 0 !important;
}

.rendered-content {
  padding: 20px !important;
  line-height: 1.8 !important;
  font-size: 15px !important;
  color: #374151 !important;
  margin: 0 !important;
  background: transparent !important;
  border: none !important;
}

.rendered-content h1, .rendered-content h2, .rendered-content h3 {
  color: #1f2937 !important;
  margin: 24px 0 16px 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
}

.rendered-content h1 { font-size: 24px !important; }
.rendered-content h2 { font-size: 20px !important; }
.rendered-content h3 { font-size: 18px !important; }

.rendered-content p {
  margin: 16px 0 !important;
  padding: 0 !important;
}

.rendered-content ul, .rendered-content ol {
  margin: 16px 0 !important;
  padding-left: 24px !important;
}

.rendered-content li {
  margin: 8px 0 !important;
  padding: 0 !important;
}

.rendered-content blockquote {
  border-left: 4px solid #3b82f6 !important;
  padding-left: 16px !important;
  margin: 16px 0 !important;
  color: #6b7280 !important;
  font-style: italic !important;
  background: transparent !important;
}

.rendered-content code {
  background: #f1f5f9 !important;
  padding: 2px 6px !important;
  border-radius: 4px !important;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace !important;
  font-size: 13px !important;
  color: #e11d48 !important;
  border: none !important;
}

.rendered-content pre {
  background: #1f2937 !important;
  color: #f9fafb !important;
  padding: 16px !important;
  border-radius: 8px !important;
  overflow-x: auto !important;
  margin: 16px 0 !important;
  border: none !important;
}

.rendered-content pre code {
  background: none !important;
  padding: 0 !important;
  color: inherit !important;
}

.rendered-content a {
  color: #3b82f6 !important;
  text-decoration: underline !important;
}

.rendered-content a:hover {
  color: #2563eb !important;
}

.note-stats {
  display: flex !important;
  gap: 24px !important;
  flex-wrap: wrap !important;
  margin-bottom: 32px !important;
  padding: 16px !important;
  background: #f9fafb !important;
  border-radius: 12px !important;
  border: none !important;
}

.stat-item {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 14px !important;
  color: #6b7280 !important;
  font-weight: 500 !important;
  margin: 0 !important;
  padding: 0 !important;
}

.stat-item i {
  color: #9ca3af !important;
}

.related-actions h4 {
  font-size: 16px !important;
  font-weight: 700 !important;
  color: #1f2937 !important;
  margin: 0 0 16px 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
}

.action-grid {
  display: grid !important;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)) !important;
  gap: 12px !important;
  margin: 0 !important;
  padding: 0 !important;
}

.action-card {
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 16px !important;
  border: 2px solid #e5e7eb !important;
  border-radius: 12px !important;
  background: white !important;
  color: #6b7280 !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  margin: 0 !important;
  outline: none !important;
  box-shadow: none !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  line-height: normal !important;
}

.action-card:hover {
  border-color: #3b82f6 !important;
  color: #3b82f6 !important;
  transform: translateY(-2px) !important;
}

.action-card.danger:hover {
  border-color: #ef4444 !important;
  color: #ef4444 !important;
}

.action-card i {
  font-size: 20px !important;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px !important;
  }
  
  .modal-header {
    padding: 16px 20px !important;
  }
  
  .header-content {
    flex-direction: column !important;
    gap: 16px !important;
    align-items: flex-start !important;
  }
  
  .modal-body {
    padding: 20px !important;
  }
  
  .note-title {
    font-size: 24px !important;
  }
  
  .note-info {
    grid-template-columns: 1fr !important;
    gap: 12px !important;
  }
  
  .content-toolbar {
    flex-direction: column !important;
    gap: 12px !important;
    align-items: flex-start !important;
  }
  
  .note-stats {
    flex-direction: column !important;
    gap: 12px !important;
  }
  
  .action-grid {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}

/* Additional CSS Isolation - Prevent conflicts with parent layouts */
.modal-overlay *,
.modal-overlay *::before,
.modal-overlay *::after {
  box-sizing: border-box !important;
}

/* Force reset all child elements */
.modal-overlay * {
  background-image: none !important;
  filter: none !important;
  -webkit-filter: none !important;
}

/* Reset all potential inherited styles from Deafault.vue */
.modal-overlay button {
  font-family: inherit !important;
  line-height: inherit !important;
  background-image: none !important;
  filter: none !important;
}

.modal-overlay h1,
.modal-overlay h2,
.modal-overlay h3,
.modal-overlay h4 {
  margin-block-start: 0 !important;
  margin-block-end: 0 !important;
  margin-inline-start: 0 !important;
  margin-inline-end: 0 !important;
  background-image: none !important;
  background-clip: unset !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  color: inherit !important;
}

.modal-overlay p {
  margin-block-start: 0 !important;
  margin-block-end: 0 !important;
}

.modal-overlay div {
  background-image: none !important;
  filter: none !important;
}

/* Ensure all flex containers work correctly */
.modal-overlay .flex,
.modal-overlay [class*="flex"] {
  display: flex !important;
}

/* Override any transform that might interfere from parent */
.modal-container {
  transform: none !important;
  -webkit-transform: none !important;
  animation: none !important;
}

/* Hide any floating elements that might appear over modal */
body:has(.modal-overlay) .floating-sidebar-toggle {
  display: none !important;
}

/* Ensure modal content is isolated from parent */
.modal-overlay {
  isolation: isolate !important;
}

/* Reset any gradient or backdrop filters from parent */
.modal-overlay::before,
.modal-overlay::after {
  content: none !important;
  display: none !important;
}

</style>