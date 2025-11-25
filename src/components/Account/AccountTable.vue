<template>
  <div class="table-container">
    <div class="table-header">
      <h3>Danh sách tài khoản ({{ accounts.length }})</h3>
      <div class="table-controls">
        <div class="entries-per-page">
          <label>Hiển thị:</label>
          <select :value="itemsPerPage" @change="$emit('update:itemsPerPage', $event.target.value)">
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <span>mục</span>
        </div>
      </div>
    </div>
    
    <div class="table-wrapper">
      <table class="account-table">
        <thead>
          <tr>
            <th @click="$emit('sort', 'avatar')" class="sortable">
              <i class="fas fa-user-circle"></i>
            </th>
            <th @click="$emit('sort', 'name')" class="sortable">
              Họ tên
              <i class="fas fa-sort" :class="getSortIcon('name')"></i>
            </th>
            <th @click="$emit('sort', 'email')" class="sortable">
              Email
              <i class="fas fa-sort" :class="getSortIcon('email')"></i>
            </th>
            <th @click="$emit('sort', 'role')" class="sortable">
              Vai trò
              <i class="fas fa-sort" :class="getSortIcon('role')"></i>
            </th>
            <th @click="$emit('sort', 'department')" class="sortable">
              Khoa / Phòng
              <i class="fas fa-sort" :class="getSortIcon('department')"></i>
            </th>
            <th @click="$emit('sort', 'status')" class="sortable">
              Trạng thái
              <i class="fas fa-sort" :class="getSortIcon('status')"></i>
            </th>
            <th @click="$emit('sort', 'lastLogin')" class="sortable">
              Đăng nhập cuối
              <i class="fas fa-sort" :class="getSortIcon('lastLogin')"></i>
            </th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="account in accounts" 
            :key="account.id"
            :class="{ 'selected': selectedAccounts.includes(account.id) }">
            <td class="avatar-cell">
              <div class="user-avatar">
                <img
                  v-if="account.avatar && (!_failed.has(account.avatar) || _blobMap.has(account.avatar))"
                  :src="avatarSrc(account.avatar)"
                  :alt="account.name"
                  @error="onAvatarError($event, account.avatar)"
                />
                <div v-else class="avatar-placeholder">
                  {{ getInitials(account.name) }}
                </div>
              </div>
            </td>
            <td class="name-cell">
              <div class="user-info">
                <span class="name">{{ account.name }}</span>
                <span class="user-id">{{ account.userId }}</span>
              </div>
            </td>
            <td class="email-cell">{{ account.email }}</td>
            <td class="role-cell">
              <span class="role-badge" :class="account.role">
                {{ getRoleLabel(account.role) }}
              </span>
            </td>
            <td class="department-cell">{{ account.department || 'CNTT' }}</td>
            <td class="status-cell">
              <span class="status-badge" :class="account.status">
                <i :class="getStatusIcon(account.status)"></i>
                {{ getStatusLabel(account.status) }}
              </span>
            </td>
            <td class="last-login-cell">
              <span class="date">{{ formatDate(account.lastLogin) }}</span>
            </td>
            <td class="actions-cell">
              <div class="action-buttons">
                <button @click="$emit('view', account)" class="btn-action view" title="Xem chi tiết">
                  <i class="fas fa-eye"></i>
                </button>
                <button @click="$emit('edit', account)" class="btn-action edit" title="Chỉnh sửa">
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  @click="$emit('toggle-status', account)" 
                  class="btn-action toggle"
                  :class="account.status === 'active' ? 'deactivate' : 'activate'"
                  :title="account.status === 'active' ? 'Tạm khóa' : 'Kích hoạt'"
                >
                  <i :class="account.status === 'active' ? 'fas fa-user-slash' : 'fas fa-user-check'"></i>
                </button>
                <button @click="$emit('delete', account)" class="btn-action delete" title="Xóa">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Pagination -->
    <div class="pagination-container">
      <div class="pagination-info">
        Hiển thị {{ startIndex }} - {{ endIndex }} 
        trong tổng số {{ totalItems }} tài khoản
      </div>
      <div class="pagination-controls">
        <button 
          @click="$emit('page-change', 1)"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="fas fa-angle-double-left"></i>
        </button>
        <button 
          @click="$emit('page-change', currentPage - 1)"
          :disabled="currentPage === 1"
          class="page-btn"
        >
          <i class="fas fa-angle-left"></i>
        </button>
        
        <span v-for="page in visiblePages" :key="page">
          <button 
            v-if="page !== '...'"
            @click="$emit('page-change', page)"
            :class="['page-btn', { active: page === currentPage }]"
          >
            {{ page }}
          </button>
          <span v-else class="page-ellipsis">...</span>
        </span>
        
        <button 
          @click="$emit('page-change', currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          <i class="fas fa-angle-right"></i>
        </button>
        <button 
          @click="$emit('page-change', totalPages)"
          :disabled="currentPage === totalPages"
          class="page-btn"
        >
          <i class="fas fa-angle-double-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onBeforeUnmount } from 'vue'
import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'

const props = defineProps({
  accounts: {
    type: Array,
    required: true,
    default: () => []
  },
  selectedAccounts: {
    type: Array,
    default: () => []
  },
  selectAll: {
    type: Boolean,
    default: false
  },
  sortField: {
    type: String,
    default: 'name'
  },
  sortDirection: {
    type: String,
    default: 'asc'
  },
  currentPage: {
    type: Number,
    default: 1
  },
  itemsPerPage: {
    type: Number,
    default: 25
  },
  totalItems: {
    type: Number,
    required: true
  }
})

// local cache for fallback blob urls and failed urls
const _blobMap = ref(new Map()) // originalUrl -> blobUrl
const _failed = ref(new Set())

const avatarSrc = (url) => {
  if (!url) return ''
  if (_blobMap.value.has(url)) return _blobMap.value.get(url)
  return url
}

const onAvatarError = async (ev, url) => {
  if (!url) return
  // prevent infinite retry loops
  if (ev && ev.target && ev.target.dataset && ev.target.dataset._fetchTried === '1') {
    _failed.value.add(url)
    // hide broken image so placeholder shows
    try { ev.target.style.display = 'none' } catch (e) {}
    return
  }
  if (ev && ev.target && ev.target.dataset) ev.target.dataset._fetchTried = '1'

  try {
    const blobUrl = await fetchImageAsBlobUrl(url)
    if (blobUrl) {
      _blobMap.value.set(url, blobUrl)
      if (ev && ev.target) ev.target.src = blobUrl
      return
    }
  } catch (e) {
    // fetch failed (403 or other). mark as failed to show placeholder
    _failed.value.add(url)
  }
  try { if (ev && ev.target) ev.target.style.display = 'none' } catch (e) {}
}

onBeforeUnmount(() => {
  // revoke any created blob urls
  for (const v of _blobMap.value.values()) revokeBlobUrl(v)
  _blobMap.value.clear()
  _failed.value.clear()
})

const emit = defineEmits([
  'sort', 'view', 'edit', 'toggle-status', 'delete', 
  'toggle-select', 'toggle-select-all', 'page-change', 
  'update:itemsPerPage'
])

const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage))

const startIndex = computed(() => (props.currentPage - 1) * props.itemsPerPage + 1)
const endIndex = computed(() => Math.min(props.currentPage * props.itemsPerPage, props.totalItems))

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = props.currentPage
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

const getSortIcon = (field) => {
  if (props.sortField !== field) return ''
  return props.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down'
}

const getInitials = (name) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const getRoleLabel = (role) => {
  const labels = {
    student: 'Sinh viên',
    teacher: 'Giảng viên',
    staff: 'Giáo vụ',
    admin: 'Quản trị'
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
/* Table Container */
.table-container {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.table-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.table-controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.entries-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #6b7280;
}

.entries-per-page select {
  padding: 4px 8px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  border-radius: 6px;
  background: white;
}

/* Table */
.table-wrapper {
  overflow-x: auto;
}

.account-table {
  width: 100%;
  border-collapse: collapse;
}

.account-table th,
.account-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.account-table th {
  background: rgba(249, 250, 251, 0.8);
  font-weight: 600;
  color: #374151;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.account-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.account-table th.sortable:hover {
  background: rgba(243, 244, 246, 0.8);
}

.account-table tbody tr:hover {
  background: rgba(59, 130, 246, 0.02);
}

.account-table tbody tr.selected {
  background: rgba(59, 130, 246, 0.05);
}

/* Table Cells */
.avatar-cell {
  width: 60px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
}

.user-avatar img {
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
  color: white;
  font-weight: 600;
  font-size: 12px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-info .name {
  font-weight: 600;
  color: #1f2937;
}

.user-info .user-id {
  font-size: 12px;
  color: #6b7280;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-badge.student { background: rgba(16, 185, 129, 0.1); color: #059669; }
.role-badge.teacher { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
.role-badge.staff { background: rgba(139, 92, 246, 0.1); color: #7c3aed; }
.role-badge.admin { background: rgba(239, 68, 68, 0.1); color: #dc2626; }

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.active { background: rgba(16, 185, 129, 0.1); color: #059669; }
.status-badge.inactive { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
.status-badge.pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }

.date {
  font-size: 14px;
  color: #6b7280;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
}

.btn-action.view { background: rgba(59, 130, 246, 0.1); color: #2563eb; }
.btn-action.edit { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.btn-action.activate { background: rgba(16, 185, 129, 0.1); color: #059669; }
.btn-action.deactivate { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
.btn-action.delete { background: rgba(239, 68, 68, 0.1); color: #dc2626; }

.btn-action:hover {
  transform: scale(1.1);
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-btn {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(209, 213, 219, 0.5);
  background: white;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  color: #374151;
}

.page-btn:hover:not(:disabled) {
  background: rgba(59, 130, 246, 0.05);
  border-color: #3b82f6;
}

.page-btn.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 0 8px;
  color: #9ca3af;
}

/* Responsive */
@media (max-width: 768px) {
  .table-wrapper {
    overflow-x: scroll;
  }
  
  .account-table {
    min-width: 800px;
  }
  
  .pagination-container {
    flex-direction: column;
    gap: 16px;
  }
}
</style>