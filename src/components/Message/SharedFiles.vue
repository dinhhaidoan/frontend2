<template>
  <div class="shared-files">
    <div class="section-header">
      <h4>File đã chia sẻ</h4>
      <button class="view-all-btn" @click="$emit('view-all')">
        Xem tất cả
      </button>
    </div>

    <div v-if="files.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
        <polyline points="13 2 13 9 20 9"/>
      </svg>
      <p>Chưa có file nào</p>
    </div>

    <div v-else class="files-list">
      <div 
        v-for="file in displayFiles" 
        :key="file.id"
        class="file-item"
      >
        <!-- Image preview -->
        <div v-if="file.type === 'image'" class="file-thumbnail image">
          <img :src="file.url" :alt="file.name" />
        </div>
        
        <!-- Document icon -->
        <div v-else class="file-thumbnail document">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
        </div>

        <div class="file-info">
          <h5 class="file-name">{{ file.name }}</h5>
          <div class="file-meta">
            <span class="file-size">{{ formatFileSize(file.size) }}</span>
            <span class="file-date">{{ formatDate(file.uploadedAt) }}</span>
          </div>
        </div>

        <div class="file-actions">
          <a 
            :href="file.url" 
            :download="file.name"
            class="action-btn"
            title="Tải về"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  },
  limit: {
    type: Number,
    default: 10
  }
})

defineEmits(['view-all'])

const displayFiles = computed(() => {
  return props.files.slice(0, props.limit)
})

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  if (diff < 86400000) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
  
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
</script>

<style scoped>
.shared-files {
  padding: 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 12px;
}

.section-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.view-all-btn {
  background: none;
  border: none;
  color: #6366f1;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.view-all-btn:hover {
  background: #eff6ff;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 16px;
  color: #9ca3af;
}

.empty-state svg {
  opacity: 0.5;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 13px;
}

.files-list {
  display: flex;
  flex-direction: column;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  transition: background 0.2s;
  cursor: pointer;
}

.file-item:hover {
  background: #f9fafb;
}

.file-thumbnail {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  flex-shrink: 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-thumbnail.image {
  border: 1px solid #e5e7eb;
}

.file-thumbnail.image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-thumbnail.document {
  background: #f3f4f6;
  color: #6b7280;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #9ca3af;
}

.file-actions {
  display: flex;
  opacity: 0;
  transition: opacity 0.2s;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #111827;
}
</style>
