<template>
  <div class="member-list">
    <div class="section-header">
      <h4>Thành viên ({{ members.length }})</h4>
      <button v-if="canAddMembers" class="add-btn" @click="$emit('add-member')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <line x1="12" y1="5" x2="12" y2="19"/>
          <line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>
    </div>

    <div class="members-list">
      <div 
        v-for="member in members" 
        :key="member.id"
        class="member-item"
        @click="$emit('view-profile', member.id)"
      >
        <div class="avatar-wrapper">
          <img 
            :src="member.avatar || getDefaultAvatar(member.name)" 
            :alt="member.name"
            class="avatar"
          />
          <span v-if="member.isOnline" class="online-indicator"></span>
        </div>

        <div class="member-info">
          <h5 class="member-name">
            {{ member.name }}
            <span v-if="member.role === 'admin'" class="admin-badge">Quản trị</span>
            <span v-if="member.role === 'moderator'" class="mod-badge">Phụ trách</span>
          </h5>
          <p class="member-status">
            <template v-if="member.isOnline">
              <span class="status-online">● Đang hoạt động</span>
            </template>
            <template v-else-if="member.lastSeen">
              {{ formatLastSeen(member.lastSeen) }}
            </template>
          </p>
        </div>

        <button 
          v-if="canManageMembers && member.id !== currentUserId"
          class="more-btn"
          @click.stop="$emit('member-actions', member)"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="1"/>
            <circle cx="12" cy="5" r="1"/>
            <circle cx="12" cy="19" r="1"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  members: {
    type: Array,
    default: () => []
  },
  currentUserId: {
    type: [String, Number],
    default: null
  },
  canAddMembers: {
    type: Boolean,
    default: false
  },
  canManageMembers: {
    type: Boolean,
    default: false
  }
})

defineEmits(['view-profile', 'add-member', 'member-actions'])

const getDefaultAvatar = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
}

const formatLastSeen = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Vừa xong'
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`
  
  return date.toLocaleDateString('vi-VN')
}
</script>

<style scoped>
.member-list {
  padding: 16px 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 12px;
}

.section-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #111827;
}

.add-btn {
  width: 28px;
  height: 28px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.add-btn:hover {
  background: #4f46e5;
  transform: scale(1.05);
}

.members-list {
  display: flex;
  flex-direction: column;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.2s;
}

.member-item:hover {
  background: #f9fafb;
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

.member-info {
  flex: 1;
  min-width: 0;
}

.member-name {
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 500;
  color: #111827;
  display: flex;
  align-items: center;
  gap: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-badge,
.mod-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  flex-shrink: 0;
}

.admin-badge {
  background: #fee2e2;
  color: #ef4444;
}

.mod-badge {
  background: #dbeafe;
  color: #3b82f6;
}

.member-status {
  margin: 0;
  font-size: 12px;
  color: #9ca3af;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-online {
  color: #10b981;
  font-weight: 500;
}

.more-btn {
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  opacity: 0;
  flex-shrink: 0;
}

.member-item:hover .more-btn {
  opacity: 1;
}

.more-btn:hover {
  background: #f3f4f6;
  color: #6b7280;
}
</style>
