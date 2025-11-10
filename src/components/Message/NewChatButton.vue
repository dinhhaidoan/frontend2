<template>
  <div class="new-chat-buttons">
    <button class="new-chat-btn primary" @click="$emit('new-chat')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        <line x1="12" y1="9" x2="12" y2="15"/>
        <line x1="9" y1="12" x2="15" y2="12"/>
      </svg>
      <span>Chat mới</span>
    </button>
    
    <button class="new-chat-btn ai" @click="$emit('new-ai-chat')">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
      <span>Chat AI</span>
    </button>
  </div>
</template>

<script setup>
defineEmits(['new-chat', 'new-ai-chat'])
</script>

<style scoped>
.new-chat-buttons {
  padding: 16px;
  display: flex;
  gap: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.new-chat-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.new-chat-btn.primary {
  background: #6366f1;
  color: white;
}

.new-chat-btn.primary:hover {
  background: #4f46e5;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.new-chat-btn.ai {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.new-chat-btn.ai:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.new-chat-btn svg {
  stroke-width: 2;
}
</style>
