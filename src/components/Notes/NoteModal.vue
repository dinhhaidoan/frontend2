<template>
  <div v-if="isVisible" class="modal-overlay" @click="closeModal">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditing ? 'Chỉnh sửa ghi chú' : 'Tạo ghi chú mới' }}</h2>
        <button @click="closeModal" class="close-btn">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <form @submit.prevent="handleSubmit" class="modal-body">
        <!-- Title -->
        <div class="form-group">
          <label for="title">Tiêu đề <span class="required">*</span></label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            placeholder="Nhập tiêu đề ghi chú..."
            class="form-input"
            :class="{ error: errors.title }"
            required
          />
          <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
        </div>
        
        <!-- Category & Priority Row -->
        <div class="form-row">
          <div class="form-group">
            <label for="category">Danh mục</label>
            <select id="category" v-model="formData.category" class="form-select">
              <option value="">Chọn danh mục</option>
              <option value="study">📚 Học tập</option>
              <option value="project">📋 Dự án</option>
              <option value="meeting">👥 Cuộc họp</option>
              <option value="resource">📖 Tài liệu</option>
              <option value="personal">👤 Cá nhân</option>
              <option value="work">💼 Công việc</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="priority">Độ ưu tiên</label>
            <select id="priority" v-model="formData.priority" class="form-select">
              <option value="low">🟢 Thấp</option>
              <option value="medium">🟡 Trung bình</option>
              <option value="high">🔴 Cao</option>
            </select>
          </div>
        </div>
        
        <!-- Status & Options Row -->
        <div class="form-row">
          <div class="form-group">
            <label for="status">Trạng thái</label>
            <select id="status" v-model="formData.status" class="form-select">
              <option value="draft">📝 Nháp</option>
              <option value="active">🟢 Hoạt động</option>
              <option value="completed">✅ Hoàn thành</option>
            </select>
          </div>
          
          <div class="form-group">
            <div class="form-options">
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.isFavorite" />
                <span class="checkbox-custom"></span>
                <i class="fas fa-heart"></i>
                Yêu thích
              </label>
              <label class="checkbox-label">
                <input type="checkbox" v-model="formData.isArchived" />
                <span class="checkbox-custom"></span>
                <i class="fas fa-archive"></i>
                Lưu trữ
              </label>
            </div>
          </div>
        </div>
        
        <!-- Content -->
        <div class="form-group">
          <label for="content">Nội dung <span class="required">*</span></label>
          <div class="editor-toolbar">
            <button type="button" @click="formatText('bold')" class="toolbar-btn" title="Đậm">
              <i class="fas fa-bold"></i>
            </button>
            <button type="button" @click="formatText('italic')" class="toolbar-btn" title="Nghiêng">
              <i class="fas fa-italic"></i>
            </button>
            <button type="button" @click="formatText('underline')" class="toolbar-btn" title="Gạch chân">
              <i class="fas fa-underline"></i>
            </button>
            <div class="toolbar-divider"></div>
            <button type="button" @click="formatText('heading')" class="toolbar-btn" title="Tiêu đề">
              <i class="fas fa-heading"></i>
            </button>
            <button type="button" @click="formatText('list')" class="toolbar-btn" title="Danh sách">
              <i class="fas fa-list"></i>
            </button>
            <button type="button" @click="formatText('link')" class="toolbar-btn" title="Liên kết">
              <i class="fas fa-link"></i>
            </button>
            <div class="toolbar-divider"></div>
            <button type="button" @click="togglePreview" class="toolbar-btn" :class="{ active: showPreview }" title="Xem trước">
              <i class="fas fa-eye"></i>
            </button>
          </div>
          
          <div class="editor-container">
            <textarea
              v-if="!showPreview"
              id="content"
              ref="contentEditor"
              v-model="formData.content"
              placeholder="Viết nội dung ghi chú của bạn tại đây...&#10;&#10;Bạn có thể sử dụng Markdown:&#10;# Tiêu đề 1&#10;## Tiêu đề 2&#10;**Đậm** *Nghiêng*&#10;- Danh sách&#10;[Liên kết](url)"
              class="form-textarea"
              :class="{ error: errors.content }"
              rows="12"
              required
            ></textarea>
            
            <div v-if="showPreview" class="content-preview" v-html="markdownPreview"></div>
          </div>
          
          <span v-if="errors.content" class="error-message">{{ errors.content }}</span>
          <div class="character-count">
            {{ formData.content.length }} ký tự
            <span v-if="formData.content.length > 1000" class="count-warning">
              (Khuyến nghị dưới 1000 ký tự)
            </span>
          </div>
        </div>
        
        <!-- Tags -->
        <div class="form-group">
          <label for="tags">Thẻ</label>
          <div class="tags-input-container">
            <div class="tags-display">
              <span 
                v-for="(tag, index) in formData.tags" 
                :key="index"
                class="tag-item"
              >
                #{{ tag }}
                <button type="button" @click="removeTag(index)" class="tag-remove">
                  <i class="fas fa-times"></i>
                </button>
              </span>
            </div>
            <input
              v-model="newTag"
              @keyup.enter="addTag"
              @keyup.comma="addTag"
              type="text"
              placeholder="Nhập thẻ và nhấn Enter..."
              class="tag-input"
            />
          </div>
          <div class="tags-hint">
            Nhấn Enter hoặc dấu phẩy để thêm thẻ. Tối đa 10 thẻ.
          </div>
        </div>
        
        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" @click="closeModal" class="btn-secondary">
            Hủy
          </button>
          <div class="action-buttons">
            <button 
              v-if="!isEditing"
              type="button" 
              @click="saveDraft" 
              class="btn-outline"
              :disabled="loading"
            >
              <i class="fas fa-save"></i>
              Lưu nháp
            </button>
            <button 
              type="submit" 
              class="btn-primary"
              :disabled="loading || !isFormValid"
            >
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-check"></i>
              {{ isEditing ? 'Cập nhật' : 'Tạo ghi chú' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false
  },
  note: {
    type: Object,
    default: null
  },
  isEditing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'save', 'save-draft'])

// Form data
const formData = ref({
  title: '',
  content: '',
  category: '',
  priority: 'medium',
  status: 'draft',
  tags: [],
  isFavorite: false,
  isArchived: false
})

// Form state
const errors = ref({})
const loading = ref(false)
const showPreview = ref(false)
const newTag = ref('')
const contentEditor = ref(null)

// Watch for prop changes
watch(() => props.note, (newNote) => {
  if (newNote && props.isEditing) {
    formData.value = {
      title: newNote.title || '',
      content: newNote.content || '',
      category: newNote.category || '',
      priority: newNote.priority || 'medium',
      status: newNote.status || 'draft',
      tags: [...(newNote.tags || [])],
      isFavorite: newNote.isFavorite || false,
      isArchived: newNote.isArchived || false
    }
  }
}, { immediate: true })

watch(() => props.isVisible, (visible) => {
  if (visible && !props.isEditing) {
    resetForm()
  }
  if (visible) {
    document.body.style.overflow = 'hidden'
    nextTick(() => {
      const titleInput = document.getElementById('title')
      if (titleInput) titleInput.focus()
    })
  } else {
    document.body.style.overflow = ''
  }
})

// Computed properties
const isFormValid = computed(() => {
  return formData.value.title.trim() && formData.value.content.trim()
})

const markdownPreview = computed(() => {
  // Simple markdown to HTML conversion
  let html = formData.value.content
  
  // Headers
  html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>')
  
  // Bold and Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
  
  // Lists
  html = html.replace(/^\- (.*$)/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  // Line breaks
  html = html.replace(/\n/g, '<br>')
  
  return html
})

// Methods
const resetForm = () => {
  formData.value = {
    title: '',
    content: '',
    category: '',
    priority: 'medium',
    status: 'draft',
    tags: [],
    isFavorite: false,
    isArchived: false
  }
  errors.value = {}
  showPreview.value = false
  newTag.value = ''
}

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.title.trim()) {
    errors.value.title = 'Tiêu đề không được để trống'
  }
  
  if (!formData.value.content.trim()) {
    errors.value.content = 'Nội dung không được để trống'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    const noteData = {
      ...formData.value,
      title: formData.value.title.trim(),
      content: formData.value.content.trim(),
      tags: formData.value.tags.filter(tag => tag.trim()),
      updatedAt: new Date().toISOString()
    }
    
    if (props.isEditing) {
      noteData.id = props.note.id
    } else {
      noteData.createdAt = new Date().toISOString()
      noteData.author = 'Admin' // This should come from user context
    }
    
    emit('save', noteData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
  } catch (error) {
    console.error('Error saving note:', error)
  } finally {
    loading.value = false
  }
}

const saveDraft = async () => {
  if (!formData.value.title.trim()) {
    errors.value.title = 'Tiêu đề không được để trống khi lưu nháp'
    return
  }
  
  loading.value = true
  
  try {
    const noteData = {
      ...formData.value,
      title: formData.value.title.trim(),
      content: formData.value.content.trim(),
      status: 'draft',
      tags: formData.value.tags.filter(tag => tag.trim()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: 'Admin'
    }
    
    emit('save-draft', noteData)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
  } catch (error) {
    console.error('Error saving draft:', error)
  } finally {
    loading.value = false
  }
}

const addTag = () => {
  const tag = newTag.value.trim().replace(/[,#]/g, '')
  
  if (tag && !formData.value.tags.includes(tag) && formData.value.tags.length < 10) {
    formData.value.tags.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index) => {
  formData.value.tags.splice(index, 1)
}

const formatText = (format) => {
  const textarea = contentEditor.value
  if (!textarea) return
  
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const selectedText = formData.value.content.substring(start, end)
  
  let replacement = selectedText
  
  switch (format) {
    case 'bold':
      replacement = `**${selectedText}**`
      break
    case 'italic':
      replacement = `*${selectedText}*`
      break
    case 'underline':
      replacement = `__${selectedText}__`
      break
    case 'heading':
      replacement = `## ${selectedText}`
      break
    case 'list':
      replacement = `- ${selectedText}`
      break
    case 'link':
      replacement = `[${selectedText}](url)`
      break
  }
  
  formData.value.content = 
    formData.value.content.substring(0, start) + 
    replacement + 
    formData.value.content.substring(end)
  
  // Set cursor position
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + replacement.length, start + replacement.length)
  })
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
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
/* Reset và isolation cho modal */
.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.5) !important;
  backdrop-filter: blur(4px) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 9999 !important;
  padding: 20px !important;
  overflow-y: auto !important;
  box-sizing: border-box !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
}

.modal-container {
  background: white !important;
  border-radius: 20px !important;
  box-shadow: 0 20px 64px rgba(0, 0, 0, 0.15) !important;
  max-width: 800px !important;
  width: 100% !important;
  max-height: 90vh !important;
  overflow-y: auto !important;
  display: flex !important;
  flex-direction: column !important;
  box-sizing: border-box !important;
  margin: auto !important;
  position: relative !important;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 32px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.required {
  color: #ef4444;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  transition: all 0.2s ease;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error, .form-textarea.error {
  border-color: #ef4444;
}

.form-options {
  display: flex;
  gap: 20px;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0;
}

.checkbox-label input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-label input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: -2px;
  left: 2px;
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-bottom: none;
  border-radius: 12px 12px 0 0;
}

.toolbar-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s ease;
}

.toolbar-btn:hover, .toolbar-btn.active {
  background: #e5e7eb;
  color: #374151;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: #d1d5db;
  margin: 0 4px;
}

.editor-container {
  position: relative;
}

.form-textarea {
  border-radius: 0 0 12px 12px;
  border-top: none;
  resize: vertical;
  font-family: 'Segoe UI', system-ui, sans-serif;
  line-height: 1.6;
}

.content-preview {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-top: none;
  border-radius: 0 0 12px 12px;
  background: white;
  min-height: 300px;
  line-height: 1.6;
}

.content-preview h1, .content-preview h2, .content-preview h3 {
  margin: 16px 0 8px 0;
  color: #1f2937;
}

.content-preview ul {
  margin: 8px 0;
  padding-left: 20px;
}

.content-preview a {
  color: #3b82f6;
  text-decoration: underline;
}

.character-count {
  font-size: 12px;
  color: #6b7280;
  text-align: right;
  margin-top: 4px;
}

.count-warning {
  color: #f59e0b;
  font-weight: 600;
}

.tags-input-container {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 8px;
  min-height: 48px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  transition: all 0.2s ease;
}

.tags-input-container:focus-within {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: #3b82f6;
  color: white;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
}

.tag-remove {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
}

.tag-remove:hover {
  background: rgba(255, 255, 255, 0.2);
}

.tag-input {
  border: none;
  outline: none;
  flex: 1;
  min-width: 120px;
  padding: 4px;
  font-size: 14px;
}

.tags-hint {
  font-size: 12px;
  color: #6b7280;
  margin-top: 4px;
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

.btn-secondary, .btn-outline, .btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #f3f4f6;
  border: 1px solid #d1d5db;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-outline {
  background: white;
  border: 1px solid #3b82f6;
  color: #3b82f6;
}

.btn-outline:hover {
  background: #3b82f6;
  color: white;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled, .btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 10px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .modal-body {
    padding: 20px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .editor-toolbar {
    flex-wrap: wrap;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .action-buttons {
    width: 100%;
    justify-content: center;
  }
}
</style>