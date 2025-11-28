<template>
  <div class="schedule-table">
    <div class="table-header">
      <h3>
        <i class="fas fa-list"></i>
        Danh sách lịch học & thi
      </h3>
      <div class="table-actions">
        <button @click="toggleView" class="btn-view">
          <i :class="isCompactView ? 'fas fa-expand-alt' : 'fas fa-compress-alt'"></i>
          {{ isCompactView ? 'Xem đầy đủ' : 'Xem thu gọn' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Đang tải danh sách...</p>
    </div>

    <!-- Table -->
    <div v-else class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th @click="sort('subjectName')" class="sortable">
              Môn học
              <i :class="getSortIcon('subjectName')"></i>
            </th>
            <th @click="sort('type')" class="sortable">
              Loại
              <i :class="getSortIcon('type')"></i>
            </th>
            <th @click="sort('date')" class="sortable">
              Ngày
              <i :class="getSortIcon('date')"></i>
            </th>
            <th @click="sort('startTime')" class="sortable">
              Giờ
              <i :class="getSortIcon('startTime')"></i>
            </th>
            <th v-if="!isCompactView" @click="sort('teacherName')" class="sortable">
              Giáo viên
              <i :class="getSortIcon('teacherName')"></i>
            </th>
            <th @click="sort('roomName')" class="sortable">
              Phòng
              <i :class="getSortIcon('roomName')"></i>
            </th>
            <th class="actions-col">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="schedule in sortedSchedules" 
            :key="`${schedule.type}-${schedule.id}`"
            class="table-row"
            :class="getRowClass(schedule)"
          >
            <!-- Subject -->
            <td class="subject-cell">
              <div class="subject-info">
                <div class="subject-name">{{ schedule.subjectName }}</div>
                <div class="subject-code">{{ schedule.subjectCode }}</div>
              </div>
            </td>

            <!-- Type -->
            <td class="type-cell">
              <span class="type-badge" :class="schedule.type">
                <i :class="getTypeIcon(schedule)"></i>
                {{ getTypeName(schedule) }}
              </span>
            </td>

            <!-- Date -->
            <td class="date-cell">
              <div class="date-info">
                <div class="date">{{ formatDate(schedule.date) }}</div>
                <div class="day-name">{{ getDayName(schedule.date) }}</div>
              </div>
            </td>

            <!-- Time -->
            <td class="time-cell">
              <div class="time-info">
                <div class="time-range">{{ schedule.startTime }} - {{ schedule.endTime }}</div>
                <div v-if="schedule.timeSlot" class="time-slot">{{ schedule.timeSlot }}</div>
              </div>
            </td>

            <!-- Teacher -->
            <td v-if="!isCompactView" class="teacher-cell">
              <div v-if="schedule.teacherName" class="teacher-info">
                <i class="fas fa-user"></i>
                {{ schedule.teacherName }}
              </div>
              <span v-else class="no-teacher">Chưa phân công</span>
            </td>

            <!-- Room -->
            <td class="room-cell">
              <div v-if="schedule.roomName" class="room-info">
                <i class="fas fa-door-open"></i>
                {{ schedule.roomName }}
              </div>
              <span v-else class="no-room">Chưa xếp phòng</span>
            </td>

            <!-- Actions -->
            <td class="actions-cell">
              <div class="action-buttons">
                <button 
                  @click="$emit('edit:schedule', schedule)" 
                  class="action-btn edit"
                  :title="schedule.type === 'exam' ? 'Sửa lịch thi' : 'Sửa lịch học'"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  @click="$emit('duplicate:schedule', schedule)" 
                  class="action-btn duplicate"
                  title="Sao chép"
                >
                  <i class="fas fa-copy"></i>
                </button>
                <button 
                  @click="$emit('delete:schedule', schedule)" 
                  class="action-btn delete"
                  :title="schedule.type === 'exam' ? 'Xóa lịch thi' : 'Xóa lịch học'"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="schedules.length === 0" class="empty-table">
        <div class="empty-icon">
          <i class="fas fa-calendar-times"></i>
        </div>
        <h3>Không có lịch nào</h3>
        <p>Chưa có lịch học hoặc lịch thi nào được tạo</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="page-btn"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <div class="page-numbers">
        <button 
          v-for="page in visiblePages" 
          :key="page"
          @click="goToPage(page)"
          class="page-btn"
          :class="{ active: page === currentPage }"
        >
          {{ page }}
        </button>
      </div>
      
      <button 
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
      
      <div class="page-info">
        <span>{{ ((currentPage - 1) * pageSize + 1) }}-{{ Math.min(currentPage * pageSize, props.totalCount || props.schedules.length) }} / {{ props.totalCount || props.schedules.length }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'

export default {
  name: 'ScheduleTable',
  props: {
    schedules: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    page: {
      type: Number,
      default: 1
    },
    limit: {
      type: Number,
      default: 20
    },
    totalCount: {
      type: Number,
      default: 0
    }
  },
  emits: ['edit:schedule', 'delete:schedule', 'duplicate:schedule', 'page:change'],
  setup(props, { emit }) {
    const isCompactView = ref(false)
    const sortBy = ref('date')
    const sortOrder = ref('asc')
    const currentPage = ref(props.page || 1)
    const pageSize = ref(props.limit || 20)
    
    // Keep currentPage and pageSize in sync with props if parent changes
    watch(() => props.page, (newVal) => {
      if (newVal !== undefined) currentPage.value = newVal
    })
    watch(() => props.limit, (newVal) => {
      if (newVal !== undefined) pageSize.value = newVal
    })

    const sortedSchedules = computed(() => {
      const sorted = [...props.schedules].sort((a, b) => {
        let valueA = a[sortBy.value]
        let valueB = b[sortBy.value]

        // Special handling for date comparison
        if (sortBy.value === 'date') {
          valueA = new Date(valueA)
          valueB = new Date(valueB)
        }

        // Handle string comparison
        if (typeof valueA === 'string' && typeof valueB === 'string') {
          valueA = valueA.toLowerCase()
          valueB = valueB.toLowerCase()
        }

        if (sortOrder.value === 'asc') {
          return valueA > valueB ? 1 : valueA < valueB ? -1 : 0
        } else {
          return valueA < valueB ? 1 : valueA > valueB ? -1 : 0
        }
      })

      // Apply pagination
      const start = (currentPage.value - 1) * pageSize.value
      const end = start + pageSize.value
      return sorted.slice(start, end)
    })

    const totalPages = computed(() => {
      if (props.totalCount && pageSize.value) return Math.ceil(props.totalCount / pageSize.value)
      return Math.ceil(props.schedules.length / pageSize.value)
    })

    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) {
            pages.push(i)
          }
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        }
      }

      return pages
    })

    const toggleView = () => {
      isCompactView.value = !isCompactView.value
    }

    const sort = (field) => {
      if (sortBy.value === field) {
        sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
      } else {
        sortBy.value = field
        sortOrder.value = 'asc'
      }
      currentPage.value = 1
    }

    const getSortIcon = (field) => {
      if (sortBy.value !== field) return 'fas fa-sort'
      return sortOrder.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
    }

    const getRowClass = (schedule) => {
      const classes = []
      
      if (schedule.type === 'exam') classes.push('exam-row')
      if (schedule.status === 'cancelled') classes.push('cancelled-row')
      
      return classes
    }

    const getTypeIcon = (schedule) => {
      if (schedule.type === 'exam') {
        return 'fas fa-file-alt'
      }
      return 'fas fa-chalkboard-teacher'
    }

    const getTypeName = (schedule) => {
      if (schedule.type === 'exam') {
        return schedule.examTypeName || 'Thi'
      }
      return 'Học'
    }

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('vi-VN')
    }

    const getDayName = (dateStr) => {
      const date = new Date(dateStr)
      return date.toLocaleDateString('vi-VN', { weekday: 'short' })
    }

    const getStatusLabel = (status) => {
      const labels = {
        'scheduled': 'Đã xếp lịch',
        'draft': 'Nháp',
        'cancelled': 'Đã hủy',
        'completed': 'Hoàn thành'
      }
      return labels[status] || status
    }

    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        // emit event for parent to fetch server-side data
        emit('page:change', { page: currentPage.value, limit: pageSize.value })
      }
    }

    return {
      isCompactView,
      sortBy,
      sortOrder,
      currentPage,
      pageSize,
      sortedSchedules,
      totalPages,
      visiblePages,
      toggleView,
      sort,
      getSortIcon,
      getRowClass,
      getTypeIcon,
      getTypeName,
      formatDate,
      getDayName,
      getStatusLabel,
      goToPage
    }
  }
}
</script>

<style scoped>
.schedule-table {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f8fafc;
}

.table-header h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #0f172a;
}

.table-header h3 i {
  color: #3b82f6;
}

.btn-view {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  color: #475569;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-view:hover {
  background: #e2e8f0;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #6b7280;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
}

.table th.sortable:hover {
  background: #f1f5f9;
  color: #3b82f6;
}

.table th.sortable i {
  margin-left: 4px;
  font-size: 12px;
  color: #9ca3af;
}

.table th.sortable:hover i {
  color: #3b82f6;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.table-row {
  transition: all 0.2s;
}

.table-row:hover {
  background: #f8fafc;
}

.table-row.exam-row {
  border-left: 3px solid #f59e0b;
}

.table-row.cancelled-row {
  opacity: 0.6;
  background: #fef2f2;
}

.subject-info .subject-name {
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 2px;
}

.subject-info .subject-code {
  font-size: 12px;
  color: #6b7280;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.class {
  background: #dbeafe;
  color: #1e40af;
}

.type-badge.exam {
  background: #fef3c7;
  color: #92400e;
}

.date-info .date {
  font-weight: 500;
  color: #0f172a;
}

.date-info .day-name {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
}

.time-info .time-range {
  font-weight: 500;
  color: #0f172a;
}

.time-info .time-slot {
  font-size: 12px;
  color: #6b7280;
}

.teacher-info,
.room-info {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #374151;
}

.teacher-info i,
.room-info i {
  color: #6b7280;
  font-size: 12px;
}

.no-teacher,
.no-room {
  color: #9ca3af;
  font-style: italic;
  font-size: 13px;
}

.status-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-badge.scheduled {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.draft {
  background: #f3f4f6;
  color: #374151;
}

.status-badge.cancelled {
  background: #fef2f2;
  color: #dc2626;
}

.status-badge.completed {
  background: #ede9fe;
  color: #7c3aed;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.action-btn.edit {
  background: #dbeafe;
  color: #3b82f6;
}

.action-btn.edit:hover {
  background: #3b82f6;
  color: white;
}

.action-btn.duplicate {
  background: #f0fdf4;
  color: #16a34a;
}

.action-btn.duplicate:hover {
  background: #16a34a;
  color: white;
}

.action-btn.delete {
  background: #fef2f2;
  color: #ef4444;
}

.action-btn.delete:hover {
  background: #ef4444;
  color: white;
}

.empty-table {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon i {
  font-size: 24px;
  color: #9ca3af;
}

.empty-table h3 {
  margin: 0 0 8px 0;
  color: #374151;
  font-size: 18px;
}

.empty-table p {
  margin: 0;
  color: #6b7280;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #0f172a;
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

.page-numbers {
  display: flex;
  gap: 4px;
}

.page-info {
  margin-left: 16px;
  font-size: 14px;
  color: #6b7280;
}

/* Responsive */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
  
  .table {
    font-size: 12px;
  }
  
  .table th,
  .table td {
    padding: 8px 12px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-btn {
    width: 28px;
    height: 28px;
    font-size: 10px;
  }
  
  .pagination {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .page-info {
    margin-left: 0;
    margin-top: 8px;
    text-align: center;
    width: 100%;
  }
}
</style>