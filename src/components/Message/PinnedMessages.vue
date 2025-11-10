<template>
  <div class="pinned-messages">
    <div class="section-header">
      <h4>Tin nhắn đã ghim</h4>
    </div>

    <div v-if="messages.length === 0" class="empty-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
      </svg>
      <p>Chưa có tin nhắn ghim</p>
    </div>

    <div v-else class="messages-list">
      <div 
        v-for="message in messages" 
        :key="message.id"
        class="pinned-message-item"
        @click="$emit('jump-to', message.id)"
      >
        <div class="pin-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </div>
        
        <div class="message-content">
          <div class="message-header">
            <span class="sender-name">{{ message.sender }}</span>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
          <p class="message-text">{{ message.text }}</p>
        </div>

        <button 
          class="unpin-btn"
          @click.stop="$emit('unpin', message.id)"
          title="Bỏ ghim"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  messages: {
    type: Array,
    default: () => []
  }
})

defineEmits(['jump-to', 'unpin'])

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.pinned-messages {
  padding: 16px 0;
}

.section-header {
  padding: 0 16px 12px;
}

.section-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
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

.messages-list {
  display: flex;
  flex-direction: column;
}

.pinned-message-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
  position: relative;
}

.pinned-message-item:hover {
  background: #f9fafb;
}

.pin-icon {
  color: #6366f1;
  flex-shrink: 0;
  margin-top: 2px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  gap: 8px;
}

.sender-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
  white-space: nowrap;
}

.message-text {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.unpin-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  opacity: 0;
  flex-shrink: 0;
}

.pinned-message-item:hover .unpin-btn {
  opacity: 1;
}

.unpin-btn:hover {
  background: #fee2e2;
  color: #ef4444;
}
</style>
