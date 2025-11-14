<template>
  <div class="notes-list">
    <div 
      class="notes-container"
      :class="{ 
        'grid-view': viewMode === 'grid', 
        'list-view': viewMode === 'list',
        'compact': density === 'compact'
      }"
    >
      <div
        v-for="note in notes"
        :key="note.id"
        class="note-card"
        :class="{ 
          'selected': selectedNotes.includes(note.id),
          [`priority-${note.priority}`]: true,
          'archived': note.isArchived,
          'favorite': note.isFavorite
        }"
        @click="handleNoteClick(note)"
      >
        <!-- Selection Checkbox -->
        <div class="note-selection" @click.stop>
          <input 
            type="checkbox" 
            :value="note.id"
            :checked="selectedNotes.includes(note.id)"
            @change="toggleSelection(note.id)"
            class="selection-checkbox"
          />
        </div>
        
        <!-- Priority Indicator -->
        <div class="priority-indicator" :class="note.priority"></div>
        
        <!-- Note Content -->
        <div class="note-content">
          <!-- Header with category and status -->
          <div class="note-header">
            <div class="category-badge" :class="note.category">
              <i :class="getCategoryIcon(note.category)"></i>
              <span>{{ getCategoryLabel(note.category) }}</span>
            </div>
            <div class="note-status">
              <span v-if="note.isFavorite" class="status-badge favorite">
                <i class="fas fa-heart"></i>
              </span>
              <span v-if="note.isArchived" class="status-badge archived">
                <i class="fas fa-archive"></i>
              </span>
              <span class="status-badge" :class="note.status">
                <i :class="getStatusIcon(note.status)"></i>
              </span>
            </div>
          </div>
          
          <!-- Title -->
          <h3 class="note-title">{{ note.title }}</h3>
          
          <!-- Content preview -->
          <p class="note-preview">{{ truncateText(note.content, viewMode === 'grid' ? 100 : 200) }}</p>
          
          <!-- Tags -->
          <div class="note-tags" v-if="note.tags && note.tags.length > 0">
            <span 
              v-for="tag in note.tags.slice(0, viewMode === 'grid' ? 2 : 4)" 
              :key="tag"
              class="tag"
            >
              {{ tag }}
            </span>
            <span v-if="note.tags.length > (viewMode === 'grid' ? 2 : 4)" class="tag-more">
              +{{ note.tags.length - (viewMode === 'grid' ? 2 : 4) }} more
            </span>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="note-footer">
            <div class="author-info">
              <div class="author-avatar">
                {{ (resolveAuthorName(note) || '?').charAt ? (resolveAuthorName(note) || '?').charAt(0).toUpperCase() : '?' }}
              </div>
              <div class="author-details">
                <span class="author-name">{{ resolveAuthorName(note) }}</span>
                <span class="note-date">{{ formatRelativeDate(note.updatedAt) }}</span>
              </div>
            </div>
          
          <!-- Quick Actions -->
          <div class="quick-actions">
            <button 
              @click.stop="$emit('toggle-favorite', note)" 
              class="quick-action"
              :class="{ active: note.isFavorite }"
              title="Yêu thích"
            >
              <i class="fas fa-heart"></i>
            </button>
            <button 
              @click.stop="$emit('edit', note)" 
              class="quick-action"
              title="Chỉnh sửa"
            >
              <i class="fas fa-edit"></i>
            </button>
            <div class="action-dropdown">
              <button @click.stop="toggleDropdown(note.id)" class="quick-action dropdown-toggle">
                <i class="fas fa-ellipsis-h"></i>
              </button>
              <div v-if="activeDropdown === note.id" class="dropdown-menu" @click.stop>
                <button @click="$emit('view', note)" class="dropdown-item">
                  <i class="fas fa-eye"></i>
                  Xem chi tiết
                </button>
                <button @click="handleToggleArchive(note)" class="dropdown-item">
                  <i class="fas fa-archive"></i>
                  {{ note.isArchived ? 'Bỏ lưu trữ' : 'Lưu trữ' }}
                </button>
                <button @click="handleDelete(note)" class="dropdown-item danger">
                  <i class="fas fa-trash"></i>
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUsers } from '@/hooks/useUsers'

const props = defineProps({
  notes: {
    type: Array,
    default: () => []
  },
  viewMode: {
    type: String,
    default: 'grid' // 'grid' or 'list'
  },
  density: {
    type: String,
    default: 'comfortable' // 'comfortable' or 'compact'
  },
  selectedNotes: {
    type: Array,
    default: () => []
  }
})

const activeDropdown = ref(null)

// Auth store to get current user info (fallback when note.author is missing)
const authStore = useAuthStore()
const { accounts: userAccounts, fetchUsers } = useUsers()
const currentUserName = computed(() => {
  const u = authStore.user || {}
  return (
    u.name || u.full_name || u.user_name || u.userId || u.user_code || u.username || u.displayName || 'Người dùng'
  )
})

// Resolve author name for a note: prefer explicit note.author, then lookup by userId in accounts, then auth user
const resolveAuthorName = (note) => {
  if (note?.author && String(note.author).toLowerCase() !== 'user' && String(note.author).trim() !== '') return String(note.author)

  // Try to find in accounts by common id fields
  const uid = note?.userId
  if (uid !== null && uid !== undefined) {
    const found = (userAccounts?.value || []).find(a => String(a.userId) === String(uid) || String(a.user_code) === String(uid) || String(a.id) === String(uid))
    if (found && found.name) return found.name
  }

  return currentUserName.value
}

const emit = defineEmits([
  'update:selectedNotes',
  'view', 
  'edit', 
  'delete', 
  'toggle-favorite', 
  'toggle-archive'
])

const toggleSelection = (noteId) => {
  const selected = [...props.selectedNotes]
  const index = selected.indexOf(noteId)
  
  if (index > -1) {
    selected.splice(index, 1)
  } else {
    selected.push(noteId)
  }
  
  emit('update:selectedNotes', selected)
}

const handleNoteClick = (note) => {
  emit('view', note)
}

const handleToggleArchive = (note) => {
  activeDropdown.value = null
  emit('toggle-archive', note)
}

const handleDelete = (note) => {
  activeDropdown.value = null
  emit('delete', note)
}

const toggleDropdown = (noteId) => {
  activeDropdown.value = activeDropdown.value === noteId ? null : noteId
}

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  activeDropdown.value = null
})

const getCategoryIcon = (category) => {
  const icons = {
    'study': 'fas fa-graduation-cap',
    'project': 'fas fa-project-diagram',
    'resource': 'fas fa-book',
    'meeting': 'fas fa-users',
    'personal': 'fas fa-user'
  }
  return icons[category] || 'fas fa-sticky-note'
}

const getCategoryLabel = (category) => {
  const labels = {
    'study': 'Học tập',
    'project': 'Dự án', 
    'resource': 'Tài liệu',
    'meeting': 'Họp',
    'personal': 'Cá nhân'
  }
  return labels[category] || 'Ghi chú'
}

const getStatusIcon = (status) => {
  const icons = {
    'active': 'fas fa-circle',
    'completed': 'fas fa-check-circle',
    'draft': 'fas fa-edit'
  }
  return icons[status] || 'fas fa-circle'
}

const truncateText = (text, maxLength) => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

const formatRelativeDate = (date) => {
  if (!date) return 'chưa cập nhật'
  const now = new Date()
  const noteDate = new Date(date)
  if (isNaN(noteDate)) return 'chưa cập nhật'
  const diffInHours = Math.floor((now - noteDate) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'Vừa xong'
  if (diffInHours < 24) return `${diffInHours} giờ trước`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `${diffInDays} ngày trước`
  
  return noteDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatDate = (date) => {
  const now = new Date()
  const noteDate = new Date(date)
  const diffInDays = Math.floor((now - noteDate) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Hôm nay'
  if (diffInDays === 1) return 'Hôm qua'
  if (diffInDays < 7) return `${diffInDays} ngày trước`
  
  return noteDate.toLocaleDateString('vi-VN')
}
</script>

<style scoped>
/* Notes Container */
.notes-container.grid-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.notes-container.list-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notes-container.compact.grid-view {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.notes-container.compact.list-view {
  gap: 8px;
}

/* Note Card */
.note-card {
  position: relative;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.grid-view .note-card {
  min-height: 240px;
}

.list-view .note-card {
  flex-direction: row;
  min-height: 120px;
}

.compact .note-card {
  min-height: 200px;
}

.compact.list-view .note-card {
  min-height: 100px;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.note-card.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.note-card.archived {
  opacity: 0.6;
}

/* Priority Indicator */
.priority-indicator {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
}

.priority-indicator.high { background: #ef4444; }
.priority-indicator.medium { background: #f59e0b; }
.priority-indicator.low { background: #10b981; }

.list-view .priority-indicator {
  height: 4px;
  width: 100%;
}

/* Selection */
.note-selection {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 10;
}

.selection-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #3b82f6;
}

/* Note Content */
.note-content {
  flex: 1;
  padding: 16px;
  padding-left: 36px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.compact .note-content {
  padding: 14px;
  padding-left: 32px;
  gap: 8px;
}

.list-view .note-content {
  padding: 16px 20px;
  flex: 1;
}

/* Header */
.note-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.category-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-badge.study { background: #eff6ff; color: #3b82f6; }
.category-badge.project { background: #f3e8ff; color: #8b5cf6; }
.category-badge.resource { background: #fef3c7; color: #f59e0b; }
.category-badge.meeting { background: #d1fae5; color: #10b981; }
.category-badge.personal { background: #fee2e2; color: #ef4444; }

.note-status {
  display: flex;
  gap: 4px;
}

.status-badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
}

.status-badge.favorite { background: #fee2e2; color: #ef4444; }
.status-badge.archived { background: #f3f4f6; color: #6b7280; }
.status-badge.active { background: #d1fae5; color: #10b981; }
.status-badge.completed { background: #eff6ff; color: #3b82f6; }

/* Title */
.note-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.compact .note-title {
  font-size: 15px;
  -webkit-line-clamp: 1;
  line-clamp: 1;
}

/* Preview */
.note-preview {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.compact .note-preview {
  font-size: 13px;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.list-view .note-preview {
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

/* Tags */
.note-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.tag {
  padding: 2px 6px;
  background: #f3f4f6;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 500;
  color: #6b7280;
}

.tag-more {
  padding: 2px 6px;
  background: #eff6ff;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  color: #3b82f6;
}

/* Footer */
.note-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid #f3f4f6;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 600;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.note-date {
  font-size: 11px;
  color: #9ca3af;
}

/* Quick Actions */
.quick-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity 0.2s;
}

.note-card:hover .quick-actions {
  opacity: 1;
}

.quick-action {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: #f9fafb;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  transition: all 0.2s;
}

.quick-action:hover {
  background: #f3f4f6;
  color: #374151;
}

.quick-action.active {
  background: #fee2e2;
  color: #ef4444;
}

/* Dropdown */
.action-dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 100;
  min-width: 140px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: none;
  border: none;
  text-align: left;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: background 0.2s;
}

.dropdown-item:hover {
  background: #f9fafb;
}

.dropdown-item.danger {
  color: #ef4444;
}

.dropdown-item.danger:hover {
  background: #fef2f2;
}

/* Responsive */
@media (max-width: 768px) {
  .notes-container.grid-view {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .list-view .note-card {
    flex-direction: column;
  }
  
  .note-content {
    padding: 14px;
    padding-left: 32px;
  }
  
  .note-title {
    font-size: 15px;
  }
  
  .note-preview {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .note-content {
    padding: 12px;
    padding-left: 28px;
  }
  
  .quick-actions {
    opacity: 1;
  }
}
</style>