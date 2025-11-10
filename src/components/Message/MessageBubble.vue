<template>
  <div 
    class="message-bubble" 
    :class="[isMine ? 'mine' : 'theirs', { 'has-reply': message.replyTo }]"
  >
    <!-- Reply preview -->
    <div v-if="message.replyTo" class="reply-preview">
      <div class="reply-line"></div>
      <div class="reply-content">
        <span class="reply-sender">{{ message.replyTo.sender }}</span>
        <span class="reply-text">{{ message.replyTo.text }}</span>
      </div>
    </div>

    <!-- Message content -->
    <div class="bubble-content">
      <!-- Sender name (for group chats) -->
      <span v-if="!isMine && showSenderName" class="sender-name">
        {{ message.sender }}
      </span>

      <!-- Text content -->
      <div v-if="message.text" class="message-text" v-html="formatMessage(message.text)"></div>

      <!-- File/Image attachments -->
      <div v-if="message.attachments && message.attachments.length > 0" class="attachments">
        <div 
          v-for="(file, index) in message.attachments" 
          :key="index"
          class="attachment-item"
        >
          <!-- Image -->
          <img 
            v-if="file.type === 'image'" 
            :src="file.url" 
            :alt="file.name"
            class="attachment-image"
            @click="$emit('preview-image', file)"
          />
          
          <!-- File -->
          <a 
            v-else 
            :href="file.url" 
            target="_blank"
            class="attachment-file"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
              <polyline points="13 2 13 9 20 9"/>
            </svg>
            <div class="file-info">
              <span class="file-name">{{ file.name }}</span>
              <span class="file-size">{{ formatFileSize(file.size) }}</span>
            </div>
          </a>
        </div>
      </div>

      <!-- Link preview -->
      <div v-if="message.linkPreview" class="link-preview">
        <img v-if="message.linkPreview.image" :src="message.linkPreview.image" class="preview-image" />
        <div class="preview-content">
          <h4 class="preview-title">{{ message.linkPreview.title }}</h4>
          <p class="preview-description">{{ message.linkPreview.description }}</p>
          <a :href="message.linkPreview.url" target="_blank" class="preview-url">
            {{ message.linkPreview.domain }}
          </a>
        </div>
      </div>

      <!-- Message footer -->
      <div class="message-footer">
        <span class="message-time">{{ formatTime(message.timestamp) }}</span>
        <svg 
          v-if="isMine && message.status === 'sent'" 
          class="status-icon sent"
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
        >
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <svg 
          v-if="isMine && message.status === 'delivered'" 
          class="status-icon delivered"
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
        >
          <polyline points="20 6 9 17 4 12"/>
          <polyline points="23 6 12 17"/>
        </svg>
        <svg 
          v-if="isMine && message.status === 'read'" 
          class="status-icon read"
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
        >
          <polyline points="20 6 9 17 4 12"/>
          <polyline points="23 6 12 17"/>
        </svg>
      </div>
    </div>

    <!-- Message actions -->
    <div class="message-actions">
      <button class="action-btn" title="Phản ứng" @click="$emit('react', message.id)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="10"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
          <line x1="9" y1="9" x2="9.01" y2="9"/>
          <line x1="15" y1="9" x2="15.01" y2="9"/>
        </svg>
      </button>
      <button class="action-btn" title="Trả lời" @click="$emit('reply', message)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="9 14 4 9 9 4"/>
          <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
        </svg>
      </button>
      <button class="action-btn" title="Thêm" @click="$emit('more', message)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </svg>
      </button>
    </div>

    <!-- Reactions -->
    <div v-if="message.reactions && message.reactions.length > 0" class="reactions">
      <button 
        v-for="reaction in message.reactions" 
        :key="reaction.emoji"
        class="reaction-badge"
        :class="{ active: reaction.users.includes(currentUserId) }"
        @click="$emit('toggle-reaction', message.id, reaction.emoji)"
      >
        <span class="reaction-emoji">{{ reaction.emoji }}</span>
        <span class="reaction-count">{{ reaction.count }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  isMine: {
    type: Boolean,
    default: false
  },
  showSenderName: {
    type: Boolean,
    default: false
  },
  currentUserId: {
    type: [String, Number],
    default: null
  }
})

defineEmits(['reply', 'react', 'more', 'preview-image', 'toggle-reaction'])

const formatMessage = (text) => {
  // Convert URLs to links
  let formatted = text.replace(
    /(https?:\/\/[^\s]+)/g,
    '<a href="$1" target="_blank" class="message-link">$1</a>'
  )
  
  // Convert line breaks
  formatted = formatted.replace(/\n/g, '<br>')
  
  return formatted
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}
</script>

<style scoped>
.message-bubble {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 8px;
  position: relative;
  max-width: 70%;
  animation: slideIn 0.2s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-bubble.mine {
  align-items: flex-end;
  align-self: flex-end;
}

.message-bubble.theirs {
  align-items: flex-start;
  align-self: flex-start;
}

.reply-preview {
  display: flex;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px 8px 0 0;
  margin-bottom: -4px;
  width: 100%;
}

.reply-line {
  width: 3px;
  background: #6366f1;
  border-radius: 2px;
}

.reply-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.reply-sender {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
}

.reply-text {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bubble-content {
  background: #f3f4f6;
  padding: 10px 14px;
  border-radius: 16px;
  max-width: 100%;
  word-wrap: break-word;
}

.message-bubble.mine .bubble-content {
  background: #6366f1;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-bubble.theirs .bubble-content {
  background: #f3f4f6;
  color: #111827;
  border-bottom-left-radius: 4px;
}

.sender-name {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 4px;
}

.message-text {
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.message-text :deep(.message-link) {
  color: inherit;
  text-decoration: underline;
  font-weight: 500;
}

.attachments {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.attachment-image {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s;
}

.attachment-image:hover {
  transform: scale(1.02);
}

.attachment-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: background 0.2s;
}

.message-bubble.mine .attachment-file {
  background: rgba(255, 255, 255, 0.2);
}

.attachment-file:hover {
  background: rgba(0, 0, 0, 0.1);
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: 13px;
  font-weight: 500;
}

.file-size {
  font-size: 11px;
  opacity: 0.7;
}

.link-preview {
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.preview-image {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
}

.preview-content {
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
}

.preview-title {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 600;
}

.preview-description {
  margin: 0 0 6px;
  font-size: 12px;
  opacity: 0.8;
}

.preview-url {
  font-size: 11px;
  color: #6366f1;
  text-decoration: none;
}

.message-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 4px;
}

.message-time {
  font-size: 11px;
  opacity: 0.6;
}

.status-icon {
  width: 14px;
  height: 14px;
  stroke-width: 2;
}

.status-icon.sent {
  color: rgba(255, 255, 255, 0.6);
}

.status-icon.delivered {
  color: rgba(255, 255, 255, 0.8);
}

.status-icon.read {
  color: #10b981;
}

.message-actions {
  position: absolute;
  top: 8px;
  display: none;
  gap: 4px;
  background: white;
  padding: 4px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.message-bubble.mine .message-actions {
  left: -120px;
}

.message-bubble.theirs .message-actions {
  right: -120px;
}

.message-bubble:hover .message-actions {
  display: flex;
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

.reactions {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  flex-wrap: wrap;
}

.reaction-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.reaction-badge:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.reaction-badge.active {
  background: #eff6ff;
  border-color: #6366f1;
}

.reaction-emoji {
  font-size: 14px;
  line-height: 1;
}

.reaction-count {
  font-size: 11px;
  font-weight: 500;
  color: #6b7280;
}

@media (max-width: 768px) {
  .message-bubble {
    max-width: 85%;
  }
}
</style>
