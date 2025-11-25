<template>
  <div class="teacher-table">
    <div class="table-header">
      <div class="table-title">
        <h3>Danh sách giáo vụ ({{ filteredTeachers.length }})</h3>
        <div class="table-actions">
          <button @click="$emit('export')" class="btn-export">
            <i class="fas fa-download"></i>
            Xuất Excel
          </button>
        </div>
      </div>
    </div>
    
    <div class="table-container">
      <table class="teachers-table">
        <thead>
          <tr>
            <th>Mã giáo vụ</th>
            <th>Họ và tên</th>
            <th>Ngày sinh</th>
            <th>Giới tính</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Vai trò</th>
            <th>Trạng thái TK</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="staff in paginatedTeachers" 
            :key="staff.id"
          >
            <td>
              <span class="teacher-code">{{ staff.code }}</span>
            </td>
            <td>
              <div class="teacher-name">
                <div class="avatar">
                  <img
                    v-if="staff.avatar && (!(_failed && _failed.has && _failed.has(staff.avatar)) || (_blobMap && _blobMap.has && _blobMap.has(staff.avatar)))"
                    :src="avatarSrc(staff.avatar)"
                    :alt="staff.name"
                    @error="onAvatarError($event, staff.avatar)"
                  />
                  <i v-else class="fas fa-user"></i>
                </div>
                <strong>{{ staff.name }}</strong>
              </div>
            </td>
            <td>
              <span class="birth-date">{{ formatDate(staff.birthDate) }}</span>
            </td>
            <td>
              <span class="gender">{{ getGenderName(staff.gender) }}</span>
            </td>
            <td>
              <a :href="`mailto:${staff.email}`" class="email-link">
                {{ staff.email }}
              </a>
            </td>
            <td>
              <span class="phone">{{ staff.phone || '-' }}</span>
            </td>
            <td>
              <span class="role-badge" :class="staff.role">
                {{ getRoleName(staff.role) }}
              </span>
            </td>
            <td>
              <span class="account-status" :class="staff.accountStatus">
                {{ getAccountStatusName(staff.accountStatus) }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button 
                  @click="$emit('view', staff)" 
                  class="btn-action view"
                  title="Xem chi tiết"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button 
                  @click="$emit('edit', staff)" 
                  class="btn-action edit"
                  title="Chỉnh sửa"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  @click="$emit('delete', staff)" 
                  class="btn-action delete"
                  title="Xóa"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Empty State -->
      <div v-if="filteredTeachers.length === 0" class="empty-state">
        <i class="fas fa-chalkboard-teacher"></i>
        <h3>Không tìm thấy giáo vụ</h3>
        <p>Không có giáo vụ nào phù hợp với bộ lọc hiện tại</p>
      </div>
    </div>
    
    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="btn-page"
      >
        <i class="fas fa-chevron-left"></i>
        Trước
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="page in visiblePages"
          :key="page"
          @click="changePage(page)"
          :class="{ 'active': page === currentPage }"
          class="btn-page-number"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="btn-page"
      >
        Sau
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import { fetchImageAsBlobUrl, revokeBlobUrl } from '@/composables/useAvatarLoader'
export default {
  name: 'StaffTable',
  props: {
    teachers: {
      type: Array,
      default: () => []
    },
    filteredTeachers: {
      type: Array,
      default: () => []
    },
    selectedTeachers: {
      type: Array,
      default: () => []
    },
    currentPage: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 10
    }
  },
  data() {
    return {
      _blobMap: new Map(),
      _failed: new Set()
    }
  },
  emits: ['selection-change','page-change','view','edit','delete','suspend','activate','export'],
  computed: {
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredTeachers.length / this.pageSize))
    },
    paginatedTeachers() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredTeachers.slice(start, start + this.pageSize)
    },
    isAllSelected() {
      return this.paginatedTeachers.every(t => this.selectedTeachers.includes(t.id))
    },
    visiblePages() {
      const pages = []
      for (let i = 1; i <= this.totalPages; i++) pages.push(i)
      return pages
    }
  },
  methods: {
    changePage(page) {
      if (page < 1 || page > this.totalPages) return
      this.$emit('page-change', page)
    },
    formatDate(date) {
      if (!date) return '-'
      const d = new Date(date)
      return d.toLocaleDateString('vi-VN')
    },
    getGenderName(gender) {
      const map = { male: 'Nam', female: 'Nữ', other: 'Khác' }
      return map[gender] || '-'
    },
    getRoleName(role) {
      const map = {
        admin: 'Quản trị viên',
        staff: 'Giáo vụ',
        teacher: 'Giảng viên',
        student: 'Sinh viên'
      }
      return map[role] || '-'
    },
    getAccountStatusName(status) {
      const map = {
        active: 'Hoạt động',
        inactive: 'Đã khóa',
        pending: 'Chờ kích hoạt'
      }
      return map[status] || '-'
    },
    avatarSrc(url) {
      if (!url) return ''
      return this._blobMap && this._blobMap.has(url) ? this._blobMap.get(url) : url
    },

    async onAvatarError(ev, url) {
      if (!url) return
      try {
        // avoid infinite retry loops
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
  },
  beforeUnmount() {
    for (const v of this._blobMap.values()) revokeBlobUrl(v)
    this._blobMap.clear()
    this._failed.clear()
  },
}
</script>

<style scoped>
.teacher-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.table-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.table-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title h3 {
  margin: 0;
  color: #374151;
  font-size: 18px;
  font-weight: 600;
}

.table-actions {
  display: flex;
  gap: 12px;
}

.btn-export {
  background: #059669;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-export:hover {
  background: #047857;
}

.table-container {
  overflow-x: auto;
}

.teachers-table {
  width: 100%;
  border-collapse: collapse;
}

.teachers-table th,
.teachers-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #f3f4f6;
}

.teachers-table th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  white-space: nowrap;
}

.teachers-table tr:hover {
  background: #f9fafb;
}

.teachers-table tr.selected {
  background: #eff6ff;
}

.teacher-code {
  font-family: 'Monaco', 'Consolas', monospace;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  color: #374151;
}

.teacher-name {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  color: #9ca3af;
  overflow: hidden;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name-info {
  display: flex;
  flex-direction: column;
}

.name-info strong {
  color: #111827;
  font-size: 14px;
}

.name-info small {
  color: #6b7280;
  font-size: 12px;
}

.department {
  color: #374151;
  font-size: 14px;
}

.academic-rank {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: white;
}

.academic-rank.gs,
.academic-rank.pgs {
  background: #dc2626;
}

.academic-rank.ts {
  background: #7c3aed;
}

.academic-rank.ths {
  background: #059669;
}

.academic-rank.ksh,
.academic-rank.cn {
  background: #0891b2;
}

.email-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 14px;
}

.email-link:hover {
  text-decoration: underline;
}

.phone {
  color: #374151;
  font-size: 14px;
}

.status {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status.active {
  background: #dcfce7;
  color: #166534;
}

.status.on-break {
  background: #fef3c7;
  color: #92400e;
}

.status.resigned {
  background: #fecaca;
  color: #991b1b;
}

.subject-count,
.class-count {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.subject-count .count,
.class-count .count {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.subject-count small,
.class-count small {
  color: #6b7280;
  font-size: 11px;
}

.role-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.role-badge.admin {
  background: #fecaca;
  color: #991b1b;
}

.role-badge.staff {
  background: #dbeafe;
  color: #1e40af;
}

.role-badge.teacher {
  background: #dcfce7;
  color: #166534;
}

.role-badge.student {
  background: #fef3c7;
  color: #92400e;
}

.account-status {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
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

.birth-date,
.gender {
  color: #374151;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.btn-action {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-action.view {
  background: #dbeafe;
  color: #1d4ed8;
}

.btn-action.view:hover {
  background: #bfdbfe;
}

.btn-action.edit {
  background: #fef3c7;
  color: #d97706;
}

.btn-action.edit:hover {
  background: #fed7aa;
}

.btn-action.suspend {
  background: #fecaca;
  color: #dc2626;
}

.btn-action.suspend:hover {
  background: #fca5a5;
}

.btn-action.activate {
  background: #dcfce7;
  color: #059669;
}

.btn-action.activate:hover {
  background: #bbf7d0;
}

.btn-action.delete {
  background: #fecaca;
  color: #dc2626;
}

.btn-action.delete:hover {
  background: #fca5a5;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #6b7280;
}

.empty-state i {
  font-size: 48px;
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 18px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.btn-page {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-page:hover:not(:disabled) {
  background: #f3f4f6;
}

.btn-page:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 4px;
}

.btn-page-number {
  width: 36px;
  height: 36px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-page-number:hover {
  background: #f3f4f6;
}

.btn-page-number.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}
</style>
