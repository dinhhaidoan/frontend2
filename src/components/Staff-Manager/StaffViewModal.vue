<template>
  <div class="modal-overlay" @click="$emit('close')" v-if="isOpen">
    <div class="modal-container" @click.stop>
      <div class="modal-header">
        <h3>
          <i class="fas fa-user-tie"></i>
          Thông tin chi tiết giáo vụ
        </h3>
        <button @click="$emit('close')" class="btn-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="modal-body" v-if="staff">
        <!-- Avatar & Basic Info -->
        <div class="staff-profile">
          <div class="avatar-large">
            <img
              v-if="staff.avatar && (!this._failed.has(staff.avatar) || this._blobMap.has(staff.avatar))"
              :src="avatarSrc(staff.avatar)"
              :alt="staff.name"
              @error="onAvatarError($event, staff.avatar)"
            />
            <i v-else class="fas fa-user"></i>
          </div>
          <div class="profile-info">
            <h2>{{ staff.name }}</h2>
            <p class="staff-code">{{ staff.code }}</p>
            <!-- Show account status here (mapped from user.is_active) to avoid 'Không xác định' when work-status missing -->
            <span class="status-badge" :class="staff.accountStatus">
              <i :class="getStatusIcon(staff.accountStatus)"></i>
              {{ getAccountStatusName(staff.accountStatus) }}
            </span>
          </div>
        </div>
        
        <!-- Details Grid -->
        <div class="details-grid">
          <div class="detail-item">
            <label><i class="fas fa-envelope"></i> Email</label>
            <a :href="`mailto:${staff.email}`" class="value">{{ staff.email }}</a>
          </div>
          
          <div class="detail-item">
            <label><i class="fas fa-phone"></i> Số điện thoại</label>
            <span class="value">{{ staff.phone || 'Chưa cập nhật' }}</span>
          </div>
          
          <div class="detail-item">
            <label><i class="fas fa-birthday-cake"></i> Ngày sinh</label>
            <span class="value">{{ formatDate(staff.birthDate) }}</span>
          </div>
          
          <div class="detail-item">
            <label><i class="fas fa-venus-mars"></i> Giới tính</label>
            <span class="value">{{ getGenderName(staff.gender) }}</span>
          </div>
          
          <div class="detail-item">
            <label><i class="fas fa-user-tag"></i> Vai trò</label>
            <span class="value role-badge">{{ getRoleName(staff.role) }}</span>
          </div>
          
          <div class="detail-item">
            <label><i class="fas fa-toggle-on"></i> Trạng thái tài khoản</label>
            <span class="value">
              <span class="account-status" :class="staff.accountStatus">
                {{ getAccountStatusName(staff.accountStatus) }}
              </span>
            </span>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="$emit('close')" class="btn-cancel">
          <i class="fas fa-times"></i>
          Đóng
        </button>
        <button @click="$emit('edit', staff)" class="btn-edit">
          <i class="fas fa-edit"></i>
          Chỉnh sửa
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'
export default {
  name: 'StaffViewModal',
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    staff: {
      type: Object,
      default: null
    }
  },
  emits: ['close', 'edit'],
  methods: {
    formatDate(date) {
      if (!date) return 'Chưa cập nhật'
      const d = new Date(date)
      return d.toLocaleDateString('vi-VN')
    },
    getGenderName(gender) {
      const map = { male: 'Nam', female: 'Nữ', other: 'Khác' }
      return map[gender] || 'Chưa xác định'
    },
    getRoleName(role) {
      const map = {
        admin: 'Quản trị viên',
        staff: 'Giáo vụ khoa',
        teacher: 'Giảng viên',
        student: 'Sinh viên'
      }
      return map[role] || role || 'Chưa xác định'
    },
    getStatusName(status) {
      const map = {
        active: 'Đang công tác',
        'on-break': 'Tạm nghỉ',
        resigned: 'Nghỉ việc'
      }
      return map[status] || 'Không xác định'
    },
    getStatusIcon(status) {
      const map = {
        active: 'fas fa-check-circle',
        'on-break': 'fas fa-pause-circle',
        resigned: 'fas fa-times-circle'
      }
      return map[status] || 'fas fa-question-circle'
    },
    getAccountStatusName(status) {
      const map = {
        active: 'Đang hoạt động',
        inactive: 'Đã khóa',
        pending: 'Chờ kích hoạt'
      }
      return map[status] || 'Không xác định'
    }
    ,
    avatarSrc(url) {
      if (!url) return ''
      return this._blobMap && this._blobMap.has(url) ? this._blobMap.get(url) : url
    },

    async onAvatarError(ev, url) {
      if (!url) return
      try {
        if (ev && ev.target && ev.target.dataset && ev.target.dataset._fetchTried === '1') {
          this._failed.add(url)
          if (ev && ev.target) ev.target.style.display = 'none'
          return
        }
        if (ev && ev.target && ev.target.dataset) ev.target.dataset._fetchTried = '1'
        const b = await fetchImageAsBlobUrl(url)
        if (b) {
          this._blobMap.set(url, b)
          if (ev && ev.target) ev.target.src = b
          return
        }
      } catch (e) {
        this._failed.add(url)
      }
      try { if (ev && ev.target) ev.target.style.display = 'none' } catch (e) {}
    }
  }

  ,data() {
    return {
      _blobMap: new Map(),
      _failed: new Set()
    }
  }

  ,
  beforeUnmount() {
    for (const v of this._blobMap.values()) revokeBlobUrl(v)
    this._blobMap.clear()
    this._failed.clear()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #374151;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
}

.btn-close {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.staff-profile {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 24px;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #9ca3af;
  font-size: 32px;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.avatar-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-info {
  flex: 1;
  color: white;
}

.profile-info h2 {
  margin: 0 0 4px 0;
  font-size: 24px;
  font-weight: 600;
}

.staff-code {
  margin: 0 0 8px 0;
  opacity: 0.9;
  font-size: 14px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item label {
  font-weight: 500;
  color: #6b7280;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.detail-item label i {
  width: 16px;
  text-align: center;
}

.detail-item .value {
  color: #111827;
  font-size: 15px;
  font-weight: 500;
}

.detail-item .value a {
  color: #3b82f6;
  text-decoration: none;
}

.detail-item .value a:hover {
  text-decoration: underline;
}

.role-badge {
  background: #dbeafe;
  color: #1d4ed8;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  display: inline-block;
}

.account-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  display: inline-block;
}

.account-status.active {
  background: #dcfce7;
  color: #166534;
}

.account-status.inactive {
  background: #fecaca;
  color: #991b1b;
}

.account-status.pending {
  background: #fef3c7;
  color: #92400e;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 0 0 12px 12px;
}

.btn-cancel,
.btn-edit {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-cancel {
  background: white;
  color: #6b7280;
  border: 1px solid #d1d5db;
}

.btn-cancel:hover {
  background: #f3f4f6;
  color: #374151;
}

.btn-edit {
  background: #3b82f6;
  color: white;
  border: 1px solid #3b82f6;
}

.btn-edit:hover {
  background: #2563eb;
  border-color: #2563eb;
}

@media (max-width: 768px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .staff-profile {
    flex-direction: column;
    text-align: center;
  }
}
</style>
