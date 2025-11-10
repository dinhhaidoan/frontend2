<template>
  <div class="chat-input">
    <!-- Reply preview -->
    <div v-if="replyingTo" class="reply-preview-bar">
      <div class="reply-info">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <polyline points="9 14 4 9 9 4"/>
          <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
        </svg>
        <div>
          <span class="reply-label">Đang trả lời <strong>{{ replyingTo.sender }}</strong></span>
          <p class="reply-message">{{ replyingTo.text }}</p>
        </div>
      </div>
      <button class="cancel-reply-btn" @click="cancelReply">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <!-- AI suggestions -->
    <div v-if="showAISuggestions && aiSuggestions.length > 0" class="ai-suggestions">
      <div class="suggestions-header">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <span>AI gợi ý phản hồi nhanh</span>
      </div>
      <div class="suggestions-list">
        <button 
          v-for="(suggestion, index) in aiSuggestions" 
          :key="index"
          class="suggestion-btn"
          @click="applySuggestion(suggestion)"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>

    <!-- File previews -->
    <div v-if="selectedFiles.length > 0" class="file-previews">
      <div 
        v-for="(file, index) in selectedFiles" 
        :key="index"
        class="file-preview-item"
      >
        <img 
          v-if="file.type.startsWith('image/')" 
          :src="file.preview" 
          class="preview-image"
        />
        <div v-else class="preview-file">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
          <span class="file-name">{{ file.name }}</span>
        </div>
        <button class="remove-file-btn" @click="removeFile(index)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Input area -->
    <div class="input-wrapper">
      <div class="input-actions-left">
        <button class="input-btn" title="Đính kèm file" @click="triggerFileInput">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
          </svg>
        </button>

        <button class="input-btn" title="Emoji" @click="toggleEmojiPicker">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
        </button>

        <button class="input-btn" title="GIF" @click="$emit('open-gif')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
            <line x1="7" y1="2" x2="7" y2="22"/>
            <line x1="17" y1="2" x2="17" y2="22"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <line x1="2" y1="7" x2="7" y2="7"/>
            <line x1="2" y1="17" x2="7" y2="17"/>
            <line x1="17" y1="17" x2="22" y2="17"/>
            <line x1="17" y1="7" x2="22" y2="7"/>
          </svg>
        </button>
      </div>

      <div class="input-container">
        <textarea
          ref="inputRef"
          v-model="message"
          class="message-input"
          placeholder="Nhập tin nhắn..."
          rows="1"
          @keydown.enter.exact.prevent="handleSend"
          @keydown.enter.shift.exact="addNewLine"
          @input="handleInput"
        ></textarea>
      </div>

      <div class="input-actions-right">
        <button 
          class="send-btn" 
          :disabled="!canSend"
          @click="handleSend"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>

      <!-- Hidden file input -->
      <input
        ref="fileInputRef"
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        style="display: none"
        @change="handleFileSelect"
      />
    </div>

    <!-- Emoji picker -->
    <div v-if="showEmojiPicker" class="emoji-picker">
      <div class="emoji-header">
        <span>Emoji</span>
        <button @click="toggleEmojiPicker">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="emoji-grid">
        <button 
          v-for="emoji in emojis" 
          :key="emoji"
          class="emoji-btn"
          @click="insertEmoji(emoji)"
        >
          {{ emoji }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'

const props = defineProps({
  replyingTo: {
    type: Object,
    default: null
  },
  showAISuggestions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['send', 'cancel-reply', 'typing', 'open-gif'])

const message = ref('')
const selectedFiles = ref([])
const showEmojiPicker = ref(false)
const inputRef = ref(null)
const fileInputRef = ref(null)

const aiSuggestions = ref([
  'Cảm ơn bạn!',
  'Mình hiểu rồi 👍',
  'Được, để mình xem và phản hồi nhé',
  'Tuyệt vời! Cảm ơn bạn đã chia sẻ',
])

const emojis = ref([
  '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
  '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘',
  '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪',
  '👍', '👎', '👏', '🙌', '🤝', '🙏', '💪', '✌️',
  '❤️', '💙', '💚', '💛', '🧡', '💜', '🖤', '🤍',
  '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '⭐', '✨',
])

const canSend = computed(() => {
  return message.value.trim() || selectedFiles.value.length > 0
})

const handleInput = () => {
  emit('typing')
  autoResize()
}

const autoResize = () => {
  const textarea = inputRef.value
  if (textarea) {
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px'
  }
}

const handleSend = () => {
  if (!canSend.value) return

  const payload = {
    text: message.value.trim(),
    files: selectedFiles.value,
    replyTo: props.replyingTo
  }

  emit('send', payload)
  message.value = ''
  selectedFiles.value = []
  
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
    }
  })
}

const addNewLine = () => {
  message.value += '\n'
  nextTick(() => autoResize())
}

const cancelReply = () => {
  emit('cancel-reply')
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  files.forEach(file => {
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedFiles.value.push({
        name: file.name,
        type: file.type,
        size: file.size,
        preview: e.target.result,
        file: file
      })
    }
    reader.readAsDataURL(file)
  })
  event.target.value = ''
}

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1)
}

const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

const insertEmoji = (emoji) => {
  const textarea = inputRef.value
  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  
  message.value = message.value.substring(0, start) + emoji + message.value.substring(end)
  
  nextTick(() => {
    textarea.focus()
    textarea.setSelectionRange(start + emoji.length, start + emoji.length)
  })
}

const applySuggestion = (suggestion) => {
  message.value = suggestion
  inputRef.value?.focus()
}
</script>

<style scoped>
.chat-input {
  display: flex;
  flex-direction: column;
  background: white;
  border-top: 1px solid #e5e7eb;
  position: relative;
  flex-shrink: 0;
}

.reply-preview-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 16px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.reply-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
}

.reply-info svg {
  color: #6366f1;
  flex-shrink: 0;
  margin-top: 2px;
}

.reply-label {
  font-size: 13px;
  color: #6b7280;
}

.reply-message {
  margin: 2px 0 0;
  font-size: 13px;
  color: #111827;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cancel-reply-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.cancel-reply-btn:hover {
  background: #e5e7eb;
  color: #6b7280;
}

.ai-suggestions {
  padding: 12px 16px;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border-bottom: 1px solid #e5e7eb;
}

.suggestions-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
}

.suggestions-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.suggestion-btn {
  padding: 6px 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-btn:hover {
  background: #f3f4f6;
  border-color: #6366f1;
  color: #6366f1;
}

.file-previews {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  overflow-x: auto;
  border-bottom: 1px solid #e5e7eb;
}

.file-preview-item {
  position: relative;
  flex-shrink: 0;
}

.preview-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.preview-file {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px;
  gap: 4px;
}

.preview-file svg {
  color: #6b7280;
}

.file-name {
  font-size: 10px;
  color: #6b7280;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.remove-file-btn {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: #ef4444;
  color: white;
  border: 2px solid white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.remove-file-btn:hover {
  background: #dc2626;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
}

.input-actions-left {
  display: flex;
  gap: 4px;
}

.input-container {
  flex: 1;
  min-width: 0;
}

.message-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  font-size: 14px;
  font-family: inherit;
  resize: none;
  transition: all 0.2s;
  min-height: 40px;
  max-height: 150px;
}

.message-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-btn {
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.input-btn:hover {
  background: #f3f4f6;
  color: #111827;
}

.send-btn {
  width: 36px;
  height: 36px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
  background: #4f46e5;
  transform: scale(1.05);
}

.send-btn:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 16px;
  width: 320px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
  z-index: 10;
}

.emoji-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 600;
}

.emoji-header button {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.emoji-header button:hover {
  background: #f3f4f6;
  color: #6b7280;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  padding: 12px;
  max-height: 240px;
  overflow-y: auto;
}

.emoji-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
}

.emoji-btn:hover {
  background: #f3f4f6;
  transform: scale(1.2);
}

@media (max-width: 640px) {
  .input-actions-left button:nth-child(3) {
    display: none;
  }
}
</style>
