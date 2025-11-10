<template>
  <div class="ai-chat-box">
    <div class="chat-header">
      <div class="header-info">
        <div class="ai-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="ai-info">
          <h3>Trợ lý AI Học tập</h3>
          <span class="ai-status">
            <span class="status-dot"></span>
            Sẵn sàng hỗ trợ
          </span>
        </div>
      </div>
      <button @click="clearChat" class="btn-clear">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>

    <div class="chat-body" ref="chatBody">
      <!-- Welcome message -->
      <div v-if="messages.length === 0" class="welcome-message">
        <i class="fas fa-sparkles"></i>
        <h4>Xin chào! Tôi là trợ lý AI của bạn</h4>
        <p>Tôi có thể giúp bạn:</p>
        <div class="suggestion-chips">
          <button 
            v-for="(suggestion, index) in quickSuggestions" 
            :key="index"
            @click="sendMessage(suggestion)"
            class="chip"
          >
            {{ suggestion }}
          </button>
        </div>
      </div>

      <!-- Messages -->
      <div v-else class="messages">
        <div 
          v-for="(msg, index) in messages" 
          :key="index"
          :class="['message', msg.type]"
        >
          <div v-if="msg.type === 'ai'" class="message-avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="message-content">
            <div class="message-bubble">
              <div v-html="formatMessage(msg.text)"></div>
            </div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
          <div v-if="msg.type === 'user'" class="message-avatar">
            <i class="fas fa-user"></i>
          </div>
        </div>

        <!-- Typing indicator -->
        <div v-if="isTyping" class="message ai">
          <div class="message-avatar">
            <i class="fas fa-robot"></i>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-footer">
      <div class="input-container">
        <button @click="toggleVoice" class="btn-icon voice">
          <i :class="isRecording ? 'fas fa-microphone-slash' : 'fas fa-microphone'"></i>
        </button>
        <input 
          v-model="inputMessage"
          @keypress.enter="handleSend"
          type="text" 
          placeholder="Nhập câu hỏi của bạn..."
          class="chat-input"
        />
        <button 
          @click="handleSend"
          :disabled="!inputMessage.trim()"
          class="btn-send"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
      <div class="quick-actions">
        <button 
          v-for="(action, index) in quickActions" 
          :key="index"
          @click="sendMessage(action.text)"
          class="quick-action"
        >
          <i :class="action.icon"></i>
          {{ action.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const messages = ref([])
const inputMessage = ref('')
const isTyping = ref(false)
const isRecording = ref(false)
const chatBody = ref(null)

const quickSuggestions = [
  'Giải thích về Composition API trong Vue 3',
  'Tóm tắt bài học hôm nay',
  'Gợi ý lịch ôn tập cho tuần này',
  'Phân tích điểm yếu của tôi'
]

const quickActions = [
  { icon: 'fas fa-lightbulb', label: 'Gợi ý', text: 'Gợi ý cho tôi nội dung học hôm nay' },
  { icon: 'fas fa-calendar-check', label: 'Lịch học', text: 'Lịch học của tôi tuần này như thế nào?' },
  { icon: 'fas fa-book', label: 'Tài liệu', text: 'Tìm tài liệu về chủ đề đang học' }
]

const sendMessage = (text) => {
  if (!text.trim()) return
  
  // Add user message
  messages.value.push({
    type: 'user',
    text: text,
    timestamp: new Date()
  })

  inputMessage.value = ''
  scrollToBottom()

  // Simulate AI response
  isTyping.value = true
  setTimeout(() => {
    const aiResponse = generateAIResponse(text)
    messages.value.push({
      type: 'ai',
      text: aiResponse,
      timestamp: new Date()
    })
    isTyping.value = false
    scrollToBottom()
  }, 1500)
}

const handleSend = () => {
  sendMessage(inputMessage.value)
}

const clearChat = () => {
  if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
    messages.value = []
  }
}

const toggleVoice = () => {
  isRecording.value = !isRecording.value
  // TODO: Implement voice recording
}

const scrollToBottom = () => {
  nextTick(() => {
    if (chatBody.value) {
      chatBody.value.scrollTop = chatBody.value.scrollHeight
    }
  })
}

const formatMessage = (text) => {
  // Simple markdown formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const generateAIResponse = (userMessage) => {
  // Mock AI responses based on keywords
  const lowerMessage = userMessage.toLowerCase()
  
  if (lowerMessage.includes('composition api') || lowerMessage.includes('vue')) {
    return '**Composition API** trong Vue 3 là một cách mới để tổ chức code component. Ưu điểm:\n\n• Tái sử dụng logic dễ dàng hơn\n• Code dễ đọc và maintain\n• TypeScript support tốt hơn\n\nBạn muốn tôi giải thích chi tiết về setup(), ref(), reactive() không?'
  }
  
  if (lowerMessage.includes('lịch') || lowerMessage.includes('tuần')) {
    return 'Dựa trên **lịch học hiện tại** của bạn:\n\n• **Thứ 2**: Lập trình Web (7:30-10:30)\n• **Thứ 3**: Mobile Android (7:30-10:30)\n• **Thứ 4**: Thực hành Web (13:30-16:30)\n• **Thứ 5**: Cơ sở dữ liệu (7:30-10:30)\n\n💡 **Gợi ý**: Nên ôn tập trước bài Mobile vào Chủ nhật tối nhé!'
  }
  
  if (lowerMessage.includes('gợi ý') || lowerMessage.includes('hôm nay')) {
    return '📚 **Gợi ý học tập hôm nay**:\n\n1. Ôn lại bài Vue 3 Composition API (30 phút)\n2. Làm bài tập Mobile Android còn thiếu (1 giờ)\n3. Xem video bài giảng Database tuần trước (45 phút)\n\nThời gian học tối ưu: **19:00-21:30** (theo thói quen của bạn)'
  }
  
  if (lowerMessage.includes('điểm yếu') || lowerMessage.includes('phân tích')) {
    return '📊 **Phân tích năng lực học tập**:\n\n**Điểm mạnh**:\n• Lập trình Web: 9.0/10\n• Điểm danh: 95%\n\n**Cần cải thiện**:\n• Mobile Android: 7.8/10 (nên tập trung state management)\n• Bài tập nộp đúng hạn: 80% (cần cải thiện time management)\n\n💪 Gợi ý: Dành 2-3 buổi tuần này để practice Android!'
  }
  
  return `Cảm ơn bạn đã hỏi! Tôi đang học hỏi để trả lời tốt hơn về "${userMessage}". Bạn có thể hỏi tôi về:\n\n• Giải thích kiến thức môn học\n• Gợi ý lịch học và ôn tập\n• Phân tích năng lực học tập\n• Tìm tài liệu và bài tập`
}
</script>

<style scoped>
.ai-chat-box {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  height: 600px;
  overflow: hidden;
}

.chat-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.ai-info h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.ai-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  opacity: 0.9;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.btn-clear {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-clear:hover {
  background: rgba(255, 255, 255, 0.3);
}

.chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: #f9fafb;
}

.welcome-message {
  text-align: center;
  padding: 40px 20px;
}

.welcome-message i {
  font-size: 48px;
  color: #667eea;
  margin-bottom: 16px;
}

.welcome-message h4 {
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #1f2937;
}

.welcome-message p {
  margin: 0 0 20px 0;
  color: #6b7280;
}

.suggestion-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: 500px;
  margin: 0 auto;
}

.chip {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}

.message.ai .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.message.user .message-avatar {
  background: #3b82f6;
  color: white;
}

.message-content {
  max-width: 70%;
}

.message-bubble {
  padding: 12px 16px;
  border-radius: 12px;
  line-height: 1.6;
  font-size: 14px;
}

.message.ai .message-bubble {
  background: white;
  color: #1f2937;
  border-bottom-left-radius: 4px;
}

.message.user .message-bubble {
  background: #3b82f6;
  color: white;
  border-bottom-right-radius: 4px;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
  padding: 0 4px;
}

.message.user .message-time {
  text-align: right;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  border-bottom-left-radius: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #9ca3af;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-10px); }
}

.chat-footer {
  padding: 16px;
  background: white;
  border-top: 1px solid #e5e7eb;
}

.input-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.btn-icon {
  width: 40px;
  height: 40px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-icon:hover {
  background: #f9fafb;
  border-color: #667eea;
  color: #667eea;
}

.btn-icon.voice.active {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.chat-input {
  flex: 1;
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s;
}

.chat-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-send {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-send:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-send:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quick-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-action {
  padding: 6px 12px;
  background: #f3f4f6;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}

.quick-action:hover {
  background: #667eea;
  color: white;
}

.quick-action i {
  font-size: 11px;
}
</style>
