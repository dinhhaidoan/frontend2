<template>
  <teleport to="body">
    <div 
      class="chat-info-drawer" 
      :class="{ open: isOpen }"
    >
      <div class="drawer-overlay" @click="$emit('close')"></div>
      
      <div class="drawer-content">
        <div class="drawer-header">
          <h3>Thông tin</h3>
          <button class="close-btn" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div v-if="chat" class="drawer-body">
          <!-- Chat info -->
          <div class="chat-profile">
            <div class="profile-avatar">
              <img 
                :src="chat.avatar || getDefaultAvatar()" 
                :alt="chat.name"
              />
            </div>
            <h2 class="profile-name">{{ chat.name }}</h2>
            <p v-if="chat.description" class="profile-description">
              {{ chat.description }}
            </p>
            <p v-if="chat.type === 'group' || chat.type === 'class'" class="profile-meta">
              {{ chat.memberCount }} thành viên
            </p>
          </div>

          <!-- Quick actions -->
          <div class="quick-actions">
            <button class="quick-action-btn" @click="$emit('mute')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 5L6 9H2v6h4l5 4V5z"/>
                <line x1="23" y1="9" x2="17" y2="15"/>
                <line x1="17" y1="9" x2="23" y2="15"/>
              </svg>
              <span>{{ chat.isMuted ? 'Bật thông báo' : 'Tắt thông báo' }}</span>
            </button>

            <button class="quick-action-btn" @click="$emit('search')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <span>Tìm kiếm</span>
            </button>

            <button v-if="chat.type === 'group' || chat.type === 'class'" class="quick-action-btn" @click="$emit('change-avatar')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
              <span>Đổi ảnh nhóm</span>
            </button>
          </div>

          <!-- Pinned messages -->
          <PinnedMessages
            :messages="pinnedMessages"
            @jump-to="handleJumpToMessage"
            @unpin="handleUnpinMessage"
          />

          <div class="divider"></div>

          <!-- Members (for group/class) -->
          <MemberList
            v-if="chat.type === 'group' || chat.type === 'class'"
            :members="members"
            :current-user-id="currentUserId"
            :can-add-members="canManageChat"
            :can-manage-members="canManageChat"
            @view-profile="handleViewProfile"
            @add-member="handleAddMember"
            @member-actions="handleMemberActions"
          />

          <div class="divider"></div>

          <!-- Shared files -->
          <SharedFiles
            :files="sharedFiles"
            @view-all="handleViewAllFiles"
          />

          <div class="divider"></div>

          <!-- Danger zone -->
          <div class="danger-zone">
            <button 
              v-if="chat.type === 'group' || chat.type === 'class'" 
              class="danger-btn leave"
              @click="handleLeaveChat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Rời {{ chat.type === 'class' ? 'lớp' : 'nhóm' }}</span>
            </button>

            <button class="danger-btn delete" @click="handleDeleteChat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              <span>Xóa cuộc trò chuyện</span>
            </button>

            <button v-if="chat.type === 'personal'" class="danger-btn report" @click="handleReport">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Báo cáo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { watch, onMounted, onUnmounted } from 'vue'
import PinnedMessages from './PinnedMessages.vue'
import MemberList from './MemberList.vue'
import SharedFiles from './SharedFiles.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  chat: {
    type: Object,
    default: null
  },
  pinnedMessages: {
    type: Array,
    default: () => []
  },
  members: {
    type: Array,
    default: () => []
  },
  sharedFiles: {
    type: Array,
    default: () => []
  },
  currentUserId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits([
  'close',
  'mute',
  'search',
  'change-avatar',
  'jump-to-message',
  'unpin-message',
  'view-profile',
  'add-member',
  'member-actions',
  'view-all-files',
  'leave-chat',
  'delete-chat',
  'report'
])

const canManageChat = computed(() => {
  // Check if current user can manage this chat
  if (!props.chat || !props.currentUserId) return false
  
  const currentMember = props.members.find(m => m.id === props.currentUserId)
  return currentMember && (currentMember.role === 'admin' || currentMember.role === 'moderator')
})

const getDefaultAvatar = () => {
  if (!props.chat) return ''
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(props.chat.name)}&background=6366f1&color=fff&size=128`
}

const handleJumpToMessage = (messageId) => {
  emit('jump-to-message', messageId)
}

const handleUnpinMessage = (messageId) => {
  emit('unpin-message', messageId)
}

const handleViewProfile = (userId) => {
  emit('view-profile', userId)
}

const handleAddMember = () => {
  emit('add-member')
}

const handleMemberActions = (member) => {
  emit('member-actions', member)
}

const handleViewAllFiles = () => {
  emit('view-all-files')
}

const handleLeaveChat = () => {
  if (confirm(`Bạn có chắc muốn rời ${props.chat.type === 'class' ? 'lớp' : 'nhóm'} này?`)) {
    emit('leave-chat')
  }
}

const handleDeleteChat = () => {
  if (confirm('Bạn có chắc muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác.')) {
    emit('delete-chat')
  }
}

const handleReport = () => {
  emit('report')
}

// Prevent background scroll when drawer is open
const propsRef = props
const lockBodyScroll = (lock) => {
  try {
    if (lock) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  } catch (e) {
    // ignore - server render or no document
  }
}

watch(() => propsRef.isOpen, (open) => {
  lockBodyScroll(open)
}, { immediate: true })

onUnmounted(() => lockBodyScroll(false))
</script>

<style scoped>
.chat-info-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  pointer-events: none;
}

.chat-info-drawer.open {
  pointer-events: auto;
}

.drawer-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.3s;
}

.chat-info-drawer.open .drawer-overlay {
  opacity: 1;
}

.drawer-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 360px;
  max-width: 90vw;
  background: white;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  transform: translateX(100%);
  transition: transform 0.3s;
  display: flex;
  flex-direction: column;
}

.chat-info-drawer.open .drawer-content {
  transform: translateX(0);
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  background: white;
  z-index: 5;
}

.drawer-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.drawer-body {
  flex: 1 1 auto;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 24px; /* space for danger zone */
}

.drawer-body::-webkit-scrollbar {
  width: 6px;
}

.drawer-body::-webkit-scrollbar-track {
  background: transparent;
}

.drawer-body::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.chat-profile {
  padding: 20px 24px;
  text-align: center;
  border-bottom: 1px solid #e5e7eb;
}

.profile-avatar {
  width: 96px;
  height: 96px;
  margin: 0 auto 16px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #e5e7eb;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-name {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.profile-description {
  margin: 0 0 8px;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.profile-meta {
  margin: 0;
  font-size: 13px;
  color: #9ca3af;
}

.quick-actions {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.quick-action-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-action-btn:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.quick-action-btn svg {
  color: #6b7280;
}

.divider {
  height: 8px;
  background: #f9fafb;
}

.danger-zone {
  padding: 16px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.danger-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.danger-btn.leave {
  color: #f59e0b;
  border-color: #fbbf24;
}

.danger-btn.leave:hover {
  background: #fffbeb;
  border-color: #f59e0b;
}

.danger-btn.delete,
.danger-btn.report {
  color: #ef4444;
  border-color: #fca5a5;
}

.danger-btn.delete:hover,
.danger-btn.report:hover {
  background: #fef2f2;
  border-color: #ef4444;
}

@media (max-width: 768px) {
  .drawer-content {
    width: 100%;
    max-width: 100%;
  }
}

/* When drawer is open, prevent body scroll (fallback class) */
.chat-info-drawer.open ~ .no-scroll {
  overflow: hidden;
}
</style>
