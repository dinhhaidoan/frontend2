<template>
  <div class="chat-header">
    <div class="chat-header-left">
      <button class="back-btn" @click="$emit('back')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      
      <div class="avatar-wrapper">
        <img 
          :src="chat.avatar || getDefaultAvatar()" 
          :alt="chat.name" 
          class="avatar"
        />
        <span v-if="chat.isOnline" class="online-indicator"></span>
      </div>
      
      <div class="chat-info">
        <h3 class="chat-name">{{ chat.name }}</h3>
        <p class="chat-status">
          <template v-if="chat.type === 'ai'">
            <span class="ai-badge">🤖 AI Assistant</span>
          </template>
          <template v-else-if="chat.isOnline">
            <span class="status-online">● Đang hoạt động</span>
          </template>
          <template v-else-if="chat.lastSeen">
            Hoạt động {{ formatLastSeen(chat.lastSeen) }}
          </template>
          <template v-else-if="chat.type === 'group' || chat.type === 'class'">
            {{ chat.memberCount }} thành viên
          </template>
        </p>
      </div>
    </div>
    
    <div class="chat-header-actions">
      <button class="action-btn" title="Tìm kiếm tin nhắn" @click="$emit('search')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"/>
          <path d="m21 21-4.35-4.35"/>
        </svg>
      </button>
      
      <button class="action-btn" title="Gọi thoại" @click="$emit('voice-call')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
        </svg>
      </button>
      
      <button class="action-btn" title="Gọi video" @click="$emit('video-call')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        </svg>
      </button>
      
      <button class="action-btn" title="Xem thông tin" @click="$emit('toggle-info')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  chat: {
    type: Object,
    required: true
  }
})

defineEmits(['back', 'search', 'voice-call', 'video-call', 'toggle-info'])

const getDefaultAvatar = () => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(props.chat.name)}&background=6366f1&color=fff`
}

const formatLastSeen = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`
  
  return date.toLocaleDateString('vi-VN')
}
</script>

<style scoped>
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.chat-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.back-btn {
  display: none;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.back-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

@media (max-width: 768px) {
  .back-btn {
    display: flex;
  }
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 12px;
  height: 12px;
  background: #10b981;
  border: 2px solid white;
  border-radius: 50%;
}

.chat-info {
  flex: 1;
  min-width: 0;
}

.chat-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-status {
  margin: 2px 0 0;
  font-size: 13px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-online {
  color: #10b981;
  font-weight: 500;
}

.ai-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

@media (max-width: 640px) {
  .action-btn:nth-child(1),
  .action-btn:nth-child(2),
  .action-btn:nth-child(3) {
    display: none;
  }
}
</style>
