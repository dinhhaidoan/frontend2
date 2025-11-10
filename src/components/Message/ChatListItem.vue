<template>
  <div 
    class="chat-list-item" 
    :class="{ active: isActive, unread: chat.unreadCount > 0 }"
    @click="$emit('select', chat.id)"
  >
    <div class="avatar-wrapper">
      <img 
        :src="chat.avatar || getDefaultAvatar()" 
        :alt="chat.name" 
        class="avatar"
      />
      <span 
        v-if="chat.isOnline" 
        class="online-indicator"
      ></span>
    </div>
    
    <div class="chat-info">
      <div class="chat-header">
        <h4 class="chat-name">{{ chat.name }}</h4>
        <span class="chat-time">{{ formatTime(chat.lastMessageTime) }}</span>
      </div>
      
      <div class="chat-preview">
        <p class="last-message">
          <span v-if="chat.lastMessageSender && chat.type === 'group'" class="sender-name">
            {{ chat.lastMessageSender }}:
          </span>
          {{ chat.lastMessage }}
        </p>
        <span v-if="chat.unreadCount > 0" class="unread-badge">
          {{ chat.unreadCount > 99 ? '99+' : chat.unreadCount }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  chat: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['select'])

const getDefaultAvatar = () => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(props.chat.name)}&background=6366f1&color=fff`
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  // Hôm nay
  if (diff < 86400000 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }
  
  // Hôm qua
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getDate() === yesterday.getDate()) {
    return 'Hôm qua'
  }
  
  // Tuần này
  if (diff < 604800000) {
    return date.toLocaleDateString('vi-VN', { weekday: 'short' })
  }
  
  // Cũ hơn
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
}
</script>

<style scoped>
.chat-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  position: relative;
  min-height: 72px;
  height: 72px;
  box-sizing: border-box;
}

.chat-list-item:hover {
  background: #f9fafb;
}

.chat-list-item.active {
  background: #eef2ff;
  border-left-color: #6366f1;
}

.chat-list-item.unread {
  background: #fefce8;
}

.chat-list-item.unread:hover {
  background: #fef9c3;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
}

.online-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
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

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.chat-name {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chat-time {
  font-size: 12px;
  color: #9ca3af;
  flex-shrink: 0;
  margin-left: 8px;
}

.chat-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.last-message {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.chat-list-item.unread .last-message {
  color: #374151;
  font-weight: 500;
}

.sender-name {
  font-weight: 600;
  color: #4b5563;
  margin-right: 4px;
}

.unread-badge {
  background: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.chat-tag {
  position: absolute;
  top: 8px;
  right: 8px;
  font-size: 16px;
}
</style>
