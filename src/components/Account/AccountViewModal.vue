<template>
  <Teleport to="body">
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
      <div class="modal-content view-modal" @click.stop>
        <div class="modal-header">
          <div class="header-left">
            <div class="modal-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div>
              <h3>Chi tiết tài khoản</h3>
              <p class="header-subtitle">Thông tin đầy đủ về người dùng</p>
            </div>
          </div>
          <button @click="$emit('close')" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      
      <div class="account-details" v-if="account">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="profile-avatar">
            <div class="avatar-container">
              <img v-if="account.avatar" :src="account.avatar" :alt="account.name" />
              <div v-else class="avatar-placeholder">
                {{ getInitials(account.name) }}
              </div>
              
            </div>
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ account.name }}</h2>
            <p class="profile-email">{{ account.email }}</p>
            <div class="profile-badges">
              <span class="role-badge" :class="account.role">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path v-if="account.role === 'admin'" d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path v-else-if="account.role === 'teacher'" d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <path v-else d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                </svg>
                {{ getRoleLabel(account.role) }}
              </span>
              <span class="status-badge" :class="account.status">
                <div class="status-dot"></div>
                {{ getStatusLabel(account.status) }}
              </span>
            </div>
          </div>
          <div class="profile-actions">
            <button @click="$emit('edit', account)" class="action-btn primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Chỉnh sửa
            </button>
          </div>
        </div>

        <!-- Information Tabs -->
        <div class="info-tabs">
          <div class="tab-headers">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              class="tab-header"
              :class="{ active: activeTab === tab.id }"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path :d="tab.icon"/>
              </svg>
              {{ tab.label }}
            </button>
          </div>

          <div class="tab-content">
            <!-- Basic Info Tab -->
            <div v-if="activeTab === 'basic'" class="tab-panel">
              <div class="info-grid">
                <div class="info-card">
                  <div class="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <h4>Thông tin cá nhân</h4>
                  </div>
                  <div class="info-items">
                    <div class="info-item">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <div class="item-content">
                        <span class="label">Họ và tên</span>
                        <span class="value">{{ account.name }}</span>
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                          <polyline points="22,6 12,13 2,6"/>
                        </svg>
                      </div>
                      <div class="item-content">
                        <span class="label">Email</span>
                        <span class="value">{{ account.email }}</span>
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M9 12l2 2 4-4"/>
                          <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                        </svg>
                      </div>
                      <div class="item-content">
                        <span class="label">Mã số</span>
                        <span class="value">{{ account.userId || 'Chưa có' }}</span>
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                      </div>
                      <div class="item-content">
                        <span class="label">Số điện thoại</span>
                        <span class="value">{{ account.phone || 'Chưa có' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Role & Department Tab -->
            <div v-if="activeTab === 'role'" class="tab-panel">
              <div class="info-grid">
                <div class="info-card">
                  <div class="card-header">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="8.5" cy="7" r="4"/>
                      <path d="M20 8v6M23 11h-6"/>
                    </svg>
                    <h4>Vai trò & Quyền hạn</h4>
                  </div>
                  <div class="info-items">
                    <div class="info-item">
                      <div class="item-icon role-icon" :class="account.role">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M9 12l2 2 4-4"/>
                          <circle cx="12" cy="12" r="10"/>
                        </svg>
                      </div>
                      <div class="item-content">
                        <span class="label">Vai trò</span>
                        <span class="value role-value" :class="account.role">{{ getRoleLabel(account.role) }}</span>
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="item-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div class="item-content">
                        <span class="label">Khoa/Phòng ban</span>
                        <span class="value">{{ getDepartmentLabel(account.department) }}</span>
                      </div>
                    </div>
                    <div class="info-item">
                      <div class="item-icon status-icon" :class="account.status">
                        <div class="status-indicator"></div>
                      </div>
                      <div class="item-content">
                        <span class="label">Trạng thái tài khoản</span>
                        <span class="value status-value" :class="account.status">{{ getStatusLabel(account.status) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer">
          <div class="footer-info">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>ID: {{ account.id || account.userId || 'N/A' }}</span>
          </div>
          <div class="footer-actions">
            <button @click="$emit('close')" class="btn-secondary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </Teleport>
</template>

<script setup>
import { ref, toRef } from 'vue'
import { useModalBodyScroll } from '@/composables/useModalBodyScroll'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  account: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close', 'edit'])

// Sử dụng composable để quản lý body scroll
useModalBodyScroll(toRef(props, 'show'))

// Tab management
const activeTab = ref('basic')

const tabs = [
  {
    id: 'basic',
    label: 'Thông tin cơ bản',
    icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'
  },
  {
    id: 'role',
    label: 'Vai trò & Quyền hạn',
    icon: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2'
  }
]

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getRoleLabel = (role) => {
  const labels = {
    student: 'Sinh viên',
    teacher: 'Giảng viên',
    staff: 'Giáo vụ',
    admin: 'Quản trị viên'
  }
  return labels[role] || role
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Hoạt động',
    inactive: 'Tạm khóa',
    pending: 'Chờ xác thực'
  }
  return labels[status] || status
}

const getStatusIcon = (status) => {
  const icons = {
    active: 'fas fa-check-circle',
    inactive: 'fas fa-times-circle',
    pending: 'fas fa-clock'
  }
  return icons[status] || 'fas fa-question-circle'
}

const getDepartmentLabel = (department) => {
  const labels = {
    cntt: 'Công nghệ thông tin',
    dtvt: 'Điện tử viễn thông',
    'co-khi': 'Cơ khí',
    'kinh-te': 'Kinh tế'
  }
  return labels[department] || department || 'Chưa có'
}

const formatDate = (date) => {
  if (!date) return 'Chưa đăng nhập'
  try {
    return new Date(date).toLocaleString('vi-VN')
  } catch (e) {
    return 'Chưa đăng nhập'
  }
}
</script>

<style scoped>
/* Modern Modal Overlay */
.modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  z-index: 99999 !important;
  
  background: rgba(15, 23, 42, 0.7) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  
  animation: modalFadeIn 0.3s ease-out;
  padding: 20px !important;
  overflow: hidden !important;
  
  /* Reset any inherited styles */
  box-sizing: border-box !important;
  margin: 0 !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif !important;
  
  /* Prevent interaction with elements behind */
  pointer-events: auto !important;
  
  /* Remove any parent background effects */
  background-image: none !important;
  background-attachment: initial !important;
  filter: none !important;
  
  /* Animation */
  animation: fadeIn 0.3s ease !important;
}

.modal-content {
  background: white !important;
  border-radius: 20px !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
  animation: modalSlideIn 0.3s ease !important;
  
  /* Reset inherited styles */
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  position: relative !important;
  transform: none !important;
  background-image: none !important;
  filter: none !important;
}

.view-modal {
  max-width: 800px !important;
  width: 100% !important;
  max-height: calc(100vh - 120px) !important;
  overflow-y: auto !important;
  margin: auto !important;
  display: flex !important;
  flex-direction: column !important;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes modalSlideIn {
  from { transform: scale(0.8) translateY(-20px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

/* Modern Modal Header */
.modal-header {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  padding: 24px 32px !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.modal-header h3 {
  font-size: 20px !important;
  font-weight: 700 !important;
  color: #1e293b !important;
  margin: 0 !important;
  line-height: 1.2;
}

.header-subtitle {
  font-size: 14px !important;
  color: #64748b !important;
  margin: 4px 0 0 0 !important;
}

.modal-close {
  width: 44px !important;
  height: 44px !important;
  border: none !important;
  background: rgba(148, 163, 184, 0.1) !important;
  border-radius: 12px !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  color: #64748b !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-close:hover {
  background: rgba(148, 163, 184, 0.2) !important;
  transform: scale(1.05);
}

/* Account Details */
.account-details {
  padding: 0;
  overflow-y: auto;
  max-height: calc(95vh - 140px);
}

/* Modern Profile Header */
.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.profile-avatar {
  position: relative;
}

.avatar-container {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.avatar-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 700;
  color: white;
}

.avatar-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.avatar-status.active {
  background: #22c55e;
}

.avatar-status.inactive {
  background: #ef4444;
}

.avatar-status.pending {
  background: #f59e0b;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;
  line-height: 1.2;
}

.profile-email {
  font-size: 16px;
  color: #64748b;
  margin: 0 0 16px 0;
}

.profile-badges {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.profile-actions {
  display: flex;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
}

.action-btn.primary {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

/* Modern Tab System */
.info-tabs {
  padding: 0;
}

.tab-headers {
  display: flex;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.tab-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-bottom: 3px solid transparent;
  flex: 1;
  justify-content: center;
}

.tab-header:hover {
  background: rgba(59, 130, 246, 0.05);
  color: #3b82f6;
}

.tab-header.active {
  background: white;
  color: #3b82f6;
  border-bottom-color: #3b82f6;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.tab-content {
  padding: 32px;
  background: white;
}

.tab-panel {
  animation: tabSlideIn 0.3s ease-out;
}

@keyframes tabSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modern Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
}

.info-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.card-header svg {
  color: #3b82f6;
}

.card-header h4 {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.info-items {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item:hover {
  background: #f8fafc;
}

.item-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #f1f5f9;
  color: #64748b;
}

.item-icon.role-icon {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.item-icon.role-icon.admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.item-icon.role-icon.teacher {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.item-icon.status-icon {
  position: relative;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.item-icon.status-icon.active .status-indicator {
  background: #22c55e;
}

.item-icon.status-icon.inactive .status-indicator {
  background: #ef4444;
}

.item-icon.status-icon.pending .status-indicator {
  background: #f59e0b;
}

.item-icon.activity {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
}

.item-icon.created {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.item-icon.updated {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-content .label {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.item-content .value {
  font-size: 16px;
  font-weight: 500;
  color: #1e293b;
}

.value.role-value {
  font-weight: 600;
}

.value.role-value.admin {
  color: #8b5cf6;
}

.value.role-value.teacher {
  color: #22c55e;
}

.value.role-value.staff {
  color: #f59e0b;
}

.value.role-value.student {
  color: #3b82f6;
}

.value.status-value.active {
  color: #22c55e;
}

.value.status-value.inactive {
  color: #ef4444;
}

.value.status-value.pending {
  color: #f59e0b;
}

/* Modern Badges */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.student {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.role-badge.teacher {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.role-badge.staff {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.role-badge.admin {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge .status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-badge.active {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.status-badge.active .status-dot {
  background: #22c55e;
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.status-badge.inactive .status-dot {
  background: #ef4444;
}

.status-badge.pending {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.status-badge.pending .status-dot {
  background: #f59e0b;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Modern Footer */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 32px;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.footer-info svg {
  color: #94a3b8;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

.btn-secondary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: white;
  color: #374151;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  text-decoration: none;
}

.btn-secondary:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
  }
  
  .modal-content {
    width: 100% !important;
    max-height: calc(100vh - 32px) !important;
  }
  
  .modal-header {
    padding: 20px 24px;
  }
  
  .header-left {
    gap: 12px;
  }
  
  .modal-icon {
    width: 40px;
    height: 40px;
  }
  
  .modal-header h3 {
    font-size: 18px !important;
  }
  
  .profile-header {
    flex-direction: column;
    text-align: center;
    padding: 24px;
    gap: 20px;
  }
  
  .avatar-container {
    width: 80px;
    height: 80px;
    border-radius: 20px;
  }
  
  .profile-name {
    font-size: 20px;
  }
  
  .profile-badges {
    justify-content: center;
  }
  
  .profile-actions {
    justify-content: center;
  }
  
  .tab-headers {
    flex-direction: column;
  }
  
  .tab-header {
    border-bottom: none;
    border-right: 3px solid transparent;
    justify-content: flex-start;
    padding: 12px 24px;
  }
  
  .tab-header.active {
    border-right-color: #3b82f6;
    border-bottom: none;
  }
  
  .tab-content {
    padding: 24px;
  }
  
  .info-item {
    padding: 16px 20px;
  }
  
  .item-icon {
    width: 36px;
    height: 36px;
  }
  
  .modal-footer {
    flex-direction: column;
    gap: 12px;
    padding: 16px 24px;
  }
  
  .footer-actions {
    width: 100%;
    justify-content: center;
  }
  
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .modal-overlay {
    padding: 12px;
  }
  
  .profile-header {
    padding: 20px;
  }
  
  .tab-content {
    padding: 20px;
  }
  
  .info-item {
    padding: 12px 16px;
  }
}
</style>