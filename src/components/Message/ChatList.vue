<template>
  <div class="chat-list">
    <div class="chat-list-header">
      <h2>Tin nhắn</h2>
      <button class="new-chat-btn" @click="$emit('new-chat')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Tạo cuộc trò chuyện
      </button>
    </div>
    
    <ChatSearch @search="handleSearch" />
    
    <div class="chat-items-wrapper">
      <div v-if="filteredChats.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>Không tìm thấy cuộc trò chuyện</p>
      </div>
      
      <ChatListItem
        v-for="chat in filteredChats"
        :key="chat.id"
        :chat="chat"
        :is-active="selectedChatId === chat.id"
        @select="handleSelectChat"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ChatSearch from './ChatSearch.vue'
import ChatListItem from './ChatListItem.vue'

const props = defineProps({
  chats: {
    type: Array,
    default: () => []
  },
  selectedChatId: {
    type: [String, Number],
    default: null
  }
})

const emit = defineEmits(['select-chat', 'new-chat', 'new-ai-chat'])

const searchQuery = ref('')
const activeTab = ref('all')
const filteredChats = computed(() => {
  let result = props.chats

  // Filter by tab
  if (activeTab.value !== 'all') {
    result = result.filter(chat => chat.type === activeTab.value)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(chat => 
      chat.name.toLowerCase().includes(query) ||
      chat.lastMessage?.toLowerCase().includes(query)
    )
  }

  // Sort by last message time
  return result.sort((a, b) => {
    return new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
  })
})

const handleSearch = (query) => {
  searchQuery.value = query
}

const handleSelectChat = (chatId) => {
  emit('select-chat', chatId)
}
</script>

<style scoped>
.chat-list {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: white;
  border-right: 1px solid #e5e7eb;
  overflow: hidden;
}

.chat-list-header {
  padding: 20px 16px 16px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  height: 100px;
  box-sizing: border-box;
}

.chat-list-header h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.new-chat-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.new-chat-btn:hover {
  background: #5856eb;
  transform: translateY(-1px);
}

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
}

.filter-tab {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-tab:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.filter-tab.active {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

.tab-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.filter-tab.active .tab-count {
  background: rgba(255, 255, 255, 0.3);
}

.chat-items-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.chat-items-wrapper::-webkit-scrollbar {
  width: 6px;
}

.chat-items-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.chat-items-wrapper::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.chat-items-wrapper::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  color: #9ca3af;
  text-align: center;
}

.empty-state svg {
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}
</style>
