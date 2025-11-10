<template>
  <div class="chat-window">
    <ChatHeader 
      v-if="currentChat"
      :chat="currentChat"
      @back="$emit('back')"
      @search="handleSearch"
      @voice-call="handleVoiceCall"
      @video-call="handleVideoCall"
      @toggle-info="$emit('toggle-info')"
    />

    <div v-if="!currentChat" class="empty-chat">
      <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
      <h3>Chọn một cuộc trò chuyện</h3>
      <p>Chọn từ danh sách bên trái hoặc tạo cuộc trò chuyện mới</p>
    </div>

    <div v-else class="messages-container" ref="messagesContainer">
      <!-- Date divider -->
      <div 
        v-for="(group, date) in groupedMessages" 
        :key="date"
        class="message-group"
      >
        <div class="date-divider">
          <span>{{ formatDate(date) }}</span>
        </div>

        <div 
          v-for="message in group" 
          :key="message.id"
          class="message-wrapper"
        >
          <MessageBubble
            :message="message"
            :is-mine="message.senderId === currentUserId"
            :show-sender-name="currentChat.type !== 'personal'"
            :current-user-id="currentUserId"
            @reply="handleReply"
            @react="handleReact"
            @more="handleMore"
            @preview-image="handlePreviewImage"
            @toggle-reaction="handleToggleReaction"
          />
        </div>
      </div>

      <!-- Typing indicator -->
      <div v-if="isTyping" class="typing-indicator">
        <div class="typing-bubble">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <!-- Scroll to bottom button -->
      <button 
        v-if="showScrollButton" 
        class="scroll-to-bottom"
        @click="scrollToBottom"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
        <span v-if="unreadCount > 0" class="unread-badge">{{ unreadCount }}</span>
      </button>
    </div>

    <ChatInput
      v-if="currentChat"
      :replying-to="replyingTo"
      :show-a-i-suggestions="currentChat.type === 'ai' || showAISuggestions"
      @send="handleSendMessage"
      @cancel-reply="replyingTo = null"
      @typing="handleTyping"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import ChatHeader from './ChatHeader.vue'
import MessageBubble from './MessageBubble.vue'
import ChatInput from './ChatInput.vue'

const props = defineProps({
  currentChat: {
    type: Object,
    default: null
  },
  messages: {
    type: Array,
    default: () => []
  },
  currentUserId: {
    type: [String, Number],
    required: true
  },
  isTyping: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'back',
  'toggle-info',
  'send-message',
  'typing',
  'voice-call',
  'video-call',
  'search'
])

const messagesContainer = ref(null)
const replyingTo = ref(null)
const showScrollButton = ref(false)
const unreadCount = ref(0)
const showAISuggestions = ref(false)

const groupedMessages = computed(() => {
  const groups = {}
  
  props.messages.forEach(message => {
    const date = new Date(message.timestamp).toDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
  })
  
  return groups
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (date.toDateString() === today.toDateString()) {
    return 'Hôm nay'
  }
  
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Hôm qua'
  }
  
  return date.toLocaleDateString('vi-VN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

const handleSendMessage = (payload) => {
  emit('send-message', payload)
  replyingTo.value = null
  showAISuggestions.value = false
  
  nextTick(() => {
    scrollToBottom(true)
  })
}

const handleReply = (message) => {
  replyingTo.value = message
}

const handleReact = (messageId) => {
  // Open reaction picker
  console.log('React to message:', messageId)
}

const handleMore = (message) => {
  // Open message context menu
  console.log('More actions for message:', message)
}

const handlePreviewImage = (file) => {
  // Open image preview modal
  console.log('Preview image:', file)
}

const handleToggleReaction = (messageId, emoji) => {
  // Toggle reaction on message
  console.log('Toggle reaction:', messageId, emoji)
}

const handleTyping = () => {
  emit('typing')
}

const handleSearch = () => {
  console.log('Search messages')
}

const handleVoiceCall = () => {
  emit('voice-call')
}

const handleVideoCall = () => {
  emit('video-call')
}

const scrollToBottom = (smooth = true) => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }
}

const handleScroll = () => {
  if (!messagesContainer.value) return
  
  const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight
  
  showScrollButton.value = distanceFromBottom > 300
}

watch(() => props.currentChat, () => {
  replyingTo.value = null
  showAISuggestions.value = false
  nextTick(() => {
    scrollToBottom(false)
  })
})

watch(() => props.messages.length, () => {
  nextTick(() => {
    if (!showScrollButton.value) {
      scrollToBottom(true)
    }
  })
})

onMounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll)
    scrollToBottom(false)
  }
})

onUnmounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll)
  }
})
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f9fafb;
  overflow: hidden;
}

.empty-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  text-align: center;
  padding: 48px 24px;
}

.empty-chat svg {
  opacity: 0.3;
  margin-bottom: 24px;
  stroke-width: 1;
}

.empty-chat h3 {
  margin: 0 0 8px;
  font-size: 20px;
  color: #6b7280;
}

.empty-chat p {
  margin: 0;
  font-size: 14px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
  min-height: 0;
  width: 100%;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.message-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  position: relative;
}

.date-divider::before,
.date-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.date-divider span {
  padding: 0 16px;
  font-size: 12px;
  font-weight: 500;
  color: #9ca3af;
  background: #f9fafb;
  border-radius: 12px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
}

.typing-indicator {
  display: flex;
  align-items: center;
  margin: 8px 0;
}

.typing-bubble {
  background: #f3f4f6;
  border-radius: 16px;
  border-bottom-left-radius: 4px;
  padding: 12px 16px;
  display: flex;
  gap: 4px;
}

.typing-bubble span {
  width: 8px;
  height: 8px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-bubble span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-bubble span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-8px);
    opacity: 1;
  }
}

.scroll-to-bottom {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s;
  z-index: 5;
}

.scroll-to-bottom:hover {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.unread-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #ef4444;
  color: white;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}
</style>
