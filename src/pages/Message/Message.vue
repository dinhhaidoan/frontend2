<template>
  <div class="message-page">
    <!-- Sidebar: Chat list -->
    <div class="chat-sidebar" :class="{ 'mobile-hidden': selectedChatId && !showSidebar }">
      <ChatList
        :chats="chats"
        :selected-chat-id="selectedChatId"
        @select-chat="handleSelectChat"
        @new-ai-chat="handleNewAIChat"
      />
    </div>

    <!-- Main: Chat window -->
    <div class="chat-main" :class="{ 'mobile-hidden': !selectedChatId }">
      <ChatWindow
        :current-chat="currentChat"
        :messages="currentMessages"
        :current-user-id="currentUserId"
        :is-typing="isTyping"
        @back="handleBack"
        @toggle-info="toggleInfoDrawer"
        @send-message="handleSendMessage"
        @typing="handleTyping"
        @voice-call="handleVoiceCall"
        @video-call="handleVideoCall"
        @search="handleSearchMessages"
      />
    </div>

    <!-- Drawer: Chat info -->
    <ChatInfoDrawer
      :is-open="showInfoDrawer"
      :chat="currentChat"
      :pinned-messages="currentPinnedMessages"
      :members="currentMembers"
      :shared-files="currentSharedFiles"
      :current-user-id="currentUserId"
      @close="toggleInfoDrawer"
      @mute="handleMuteChat"
      @search="handleSearchMessages"
      @change-avatar="handleChangeAvatar"
      @jump-to-message="handleJumpToMessage"
      @unpin-message="handleUnpinMessage"
      @view-profile="handleViewProfile"
      @add-member="handleAddMember"
      @member-actions="handleMemberActions"
      @view-all-files="handleViewAllFiles"
      @leave-chat="handleLeaveChat"
      @delete-chat="handleDeleteChat"
      @report="handleReport"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ChatList from '@/components/Message/ChatList.vue'
import ChatWindow from '@/components/Message/ChatWindow.vue'
import ChatInfoDrawer from '@/components/Message/ChatInfoDrawer.vue'

// State
const currentUserId = ref(1) // TODO: Get from auth store
const selectedChatId = ref(null)
const showInfoDrawer = ref(false)
const showSidebar = ref(true)
const isTyping = ref(false)

// Mock data - Replace with API calls
const chats = ref([
  {
    id: 1,
    name: 'Nguyễn Văn A',
    avatar: null,
    type: 'personal',
    lastMessage: 'Chào bạn, hẹn gặp lại!',
    lastMessageTime: new Date(Date.now() - 300000),
    lastMessageSender: null,
    unreadCount: 2,
    isOnline: true,
    isMuted: false
  },
  {
    id: 2,
    name: 'Nhóm học tập CNTT',
    avatar: null,
    type: 'group',
    lastMessage: 'Ai đã làm bài tập chưa?',
    lastMessageTime: new Date(Date.now() - 3600000),
    lastMessageSender: 'Trần B',
    unreadCount: 5,
    isOnline: false,
    memberCount: 12,
    isMuted: false
  },
  {
    id: 3,
    name: 'Lớp 12A1',
    avatar: null,
    type: 'class',
    lastMessage: 'Thông báo: Ngày mai nghỉ học',
    lastMessageTime: new Date(Date.now() - 7200000),
    lastMessageSender: 'Giáo viên',
    unreadCount: 0,
    isOnline: false,
    memberCount: 35,
    isMuted: false
  },
  {
    id: 4,
    name: 'AI Trợ lý',
    avatar: null,
    type: 'ai',
    lastMessage: 'Tôi có thể giúp gì cho bạn?',
    lastMessageTime: new Date(Date.now() - 86400000),
    lastMessageSender: null,
    unreadCount: 0,
    isOnline: true,
    isMuted: false
  }
])

const messages = ref({
  1: [
    {
      id: 1,
      senderId: 2,
      sender: 'Nguyễn Văn A',
      text: 'Chào bạn!',
      timestamp: new Date(Date.now() - 3600000),
      status: 'read',
      reactions: []
    },
    {
      id: 2,
      senderId: 1,
      sender: 'Tôi',
      text: 'Chào! Bạn khỏe không?',
      timestamp: new Date(Date.now() - 3500000),
      status: 'read',
      reactions: [
        { emoji: '👍', count: 1, users: [2] }
      ]
    },
    {
      id: 3,
      senderId: 2,
      sender: 'Nguyễn Văn A',
      text: 'Mình khỏe, cảm ơn bạn. Còn bạn thì sao?',
      timestamp: new Date(Date.now() - 3400000),
      status: 'read',
      reactions: []
    },
    {
      id: 4,
      senderId: 1,
      sender: 'Tôi',
      text: 'Mình cũng ổn. Hẹn gặp lại nhé!',
      timestamp: new Date(Date.now() - 1800000),
      status: 'delivered',
      reactions: []
    },
    {
      id: 5,
      senderId: 2,
      sender: 'Nguyễn Văn A',
      text: 'Chào bạn, hẹn gặp lại!',
      timestamp: new Date(Date.now() - 300000),
      status: 'sent',
      reactions: []
    }
  ],
  2: [
    {
      id: 1,
      senderId: 3,
      sender: 'Trần B',
      text: 'Ai đã làm bài tập chưa?',
      timestamp: new Date(Date.now() - 3600000),
      status: 'read',
      reactions: []
    }
  ]
})

const pinnedMessages = ref({
  2: [
    {
      id: 100,
      sender: 'Giáo viên',
      text: 'Nhắc nhở: Nộp bài tập trước thứ 6',
      timestamp: new Date(Date.now() - 86400000)
    }
  ]
})

const members = ref({
  2: [
    { id: 1, name: 'Tôi', avatar: null, role: 'admin', isOnline: true },
    { id: 3, name: 'Trần B', avatar: null, role: 'member', isOnline: true },
    { id: 4, name: 'Lê C', avatar: null, role: 'moderator', isOnline: false, lastSeen: new Date(Date.now() - 3600000) },
    { id: 5, name: 'Phạm D', avatar: null, role: 'member', isOnline: false, lastSeen: new Date(Date.now() - 7200000) }
  ]
})

const sharedFiles = ref({
  2: [
    {
      id: 1,
      name: 'Bài giảng tuần 1.pdf',
      type: 'document',
      size: 2048576,
      url: '#',
      uploadedAt: new Date(Date.now() - 86400000)
    },
    {
      id: 2,
      name: 'screenshot.png',
      type: 'image',
      size: 512000,
      url: 'https://picsum.photos/400/300',
      uploadedAt: new Date(Date.now() - 43200000)
    }
  ]
})

// Computed
const currentChat = computed(() => {
  return chats.value.find(chat => chat.id === selectedChatId.value) || null
})

const currentMessages = computed(() => {
  return messages.value[selectedChatId.value] || []
})

const currentPinnedMessages = computed(() => {
  return pinnedMessages.value[selectedChatId.value] || []
})

const currentMembers = computed(() => {
  return members.value[selectedChatId.value] || []
})

const currentSharedFiles = computed(() => {
  return sharedFiles.value[selectedChatId.value] || []
})

// Methods
const handleSelectChat = (chatId) => {
  selectedChatId.value = chatId
  showSidebar.value = false
  
  // Mark as read
  const chat = chats.value.find(c => c.id === chatId)
  if (chat) {
    chat.unreadCount = 0
  }
}

const handleBack = () => {
  showSidebar.value = true
  selectedChatId.value = null
}

const toggleInfoDrawer = () => {
  showInfoDrawer.value = !showInfoDrawer.value
}


const handleSendMessage = (payload) => {
  if (!selectedChatId.value) return
  
  const newMessage = {
    id: Date.now(),
    senderId: currentUserId.value,
    sender: 'Tôi',
    text: payload.text,
    timestamp: new Date(),
    status: 'sent',
    reactions: [],
    replyTo: payload.replyTo,
    attachments: payload.files
  }
  
  if (!messages.value[selectedChatId.value]) {
    messages.value[selectedChatId.value] = []
  }
  
  messages.value[selectedChatId.value].push(newMessage)
  
  // Update chat last message
  const chat = chats.value.find(c => c.id === selectedChatId.value)
  if (chat) {
    chat.lastMessage = payload.text || 'Đã gửi file'
    chat.lastMessageTime = new Date()
  }
  
  // Simulate message delivery
  setTimeout(() => {
    newMessage.status = 'delivered'
  }, 1000)
  
  setTimeout(() => {
    newMessage.status = 'read'
  }, 2000)
}

let typingTimeout
const handleTyping = () => {
  console.log('User is typing...')
  
  clearTimeout(typingTimeout)
  typingTimeout = setTimeout(() => {
    console.log('User stopped typing')
  }, 1000)
}

const handleVoiceCall = () => {
  console.log('Start voice call')
  // TODO: Implement voice call
}

const handleVideoCall = () => {
  console.log('Start video call')
  // TODO: Implement video call
}

const handleSearchMessages = () => {
  console.log('Search messages')
  // TODO: Implement message search
}

const handleMuteChat = () => {
  if (currentChat.value) {
    currentChat.value.isMuted = !currentChat.value.isMuted
    console.log('Mute chat:', currentChat.value.isMuted)
  }
}

const handleChangeAvatar = () => {
  console.log('Change avatar')
  // TODO: Implement avatar change
}

const handleJumpToMessage = (messageId) => {
  console.log('Jump to message:', messageId)
  // TODO: Scroll to message
}

const handleUnpinMessage = (messageId) => {
  console.log('Unpin message:', messageId)
  if (selectedChatId.value && pinnedMessages.value[selectedChatId.value]) {
    pinnedMessages.value[selectedChatId.value] = pinnedMessages.value[selectedChatId.value].filter(
      m => m.id !== messageId
    )
  }
}

const handleViewProfile = (userId) => {
  console.log('View profile:', userId)
  // TODO: Show user profile
}

const handleAddMember = () => {
  console.log('Add member')
  // TODO: Show add member dialog
}

const handleMemberActions = (member) => {
  console.log('Member actions:', member)
  // TODO: Show member actions menu
}

const handleViewAllFiles = () => {
  console.log('View all files')
  // TODO: Show all files modal
}

const handleLeaveChat = () => {
  console.log('Leave chat')
  // TODO: Implement leave chat
}

const handleDeleteChat = () => {
  console.log('Delete chat')
  chats.value = chats.value.filter(c => c.id !== selectedChatId.value)
  selectedChatId.value = null
  showInfoDrawer.value = false
}

const handleReport = () => {
  console.log('Report')
  // TODO: Show report dialog
}
</script>

<style scoped>
.message-page {
  display: flex;
  height: 100vh;
  width: 100%;
  background: #f9fafb;
  overflow: hidden;
}

.chat-sidebar {
  width: 360px;
  flex-shrink: 0;
  background: white;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100vh;
  overflow: hidden;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .chat-sidebar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    z-index: 10;
    transform: translateX(0);
  }
  
  .chat-sidebar.mobile-hidden {
    transform: translateX(-100%);
  }
  
  .chat-main {
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    transform: translateX(100%);
  }
  
  .chat-main:not(.mobile-hidden) {
    transform: translateX(0);
  }
}

@media (max-width: 640px) {
  .chat-sidebar {
    width: 100%;
  }
}

/* Tablet */
@media (min-width: 769px) and (max-width: 1024px) {
  .chat-sidebar {
    width: 280px;
  }
}
</style>
