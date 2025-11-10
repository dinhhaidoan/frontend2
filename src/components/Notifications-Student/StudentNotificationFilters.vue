<template>
  <div class="student-notification-filters">
    <div class="filters-container">
      <!-- Search Bar -->
      <div class="filter-group search-group">
        <div class="search-input-wrapper">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            class="search-input"
            placeholder="Tìm kiếm thông báo..."
            :value="search"
            @input="$emit('update:search', $event.target.value)"
          />
          <button 
            v-if="search"
            class="clear-search"
            @click="$emit('update:search', '')"
            title="Xóa tìm kiếm"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Quick Filters -->
      <div class="filter-group quick-filters">
        <button
          class="quick-filter-btn"
          :class="{ active: readStatus === 'unread' }"
          @click="toggleReadStatus('unread')"
          title="Chỉ hiện thông báo chưa đọc"
        >
          <i class="fas fa-envelope"></i>
          <span>Chưa đọc</span>
        </button>
        
        <button
          class="quick-filter-btn"
          :class="{ active: priority === 'high' }"
          @click="togglePriority('high')"
          title="Chỉ hiện thông báo ưu tiên cao"
        >
          <i class="fas fa-exclamation-circle"></i>
          <span>Quan trọng</span>
        </button>
        
        <button
          class="quick-filter-btn"
          :class="{ active: isToday }"
          @click="toggleTodayFilter"
          title="Chỉ hiện thông báo hôm nay"
        >
          <i class="fas fa-calendar-day"></i>
          <span>Hôm nay</span>
        </button>
      </div>

      <!-- Advanced Filters Toggle -->
      <div class="filter-group advanced-toggle">
        <button
          class="advanced-toggle-btn"
          :class="{ active: showAdvanced }"
          @click="showAdvanced = !showAdvanced"
        >
          <i class="fas fa-sliders-h"></i>
          <span>Bộ lọc nâng cao</span>
          <i class="fas fa-chevron-down toggle-icon" :class="{ rotated: showAdvanced }"></i>
        </button>
      </div>
    </div>

    <!-- Advanced Filters -->
    <transition name="advanced-filters">
      <div v-if="showAdvanced" class="advanced-filters">
        <div class="advanced-filters-grid">
          <!-- Category Filter -->
          <div class="filter-item">
            <label class="filter-label">Danh mục</label>
            <select
              class="filter-select"
              :value="category"
              @change="$emit('update:category', $event.target.value)"
            >
              <option value="">Tất cả danh mục</option>
              <option
                v-for="cat in categories.slice(1)"
                :key="cat.id"
                :value="cat.id"
              >
                {{ cat.name }}
              </option>
            </select>
          </div>

          <!-- Priority Filter -->
          <div class="filter-item">
            <label class="filter-label">Độ ưu tiên</label>
            <select
              class="filter-select"
              :value="priority"
              @change="$emit('update:priority', $event.target.value)"
            >
              <option value="">Tất cả mức độ</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </div>

          <!-- Read Status Filter -->
          <div class="filter-item">
            <label class="filter-label">Trạng thái đọc</label>
            <select
              class="filter-select"
              :value="readStatus"
              @change="$emit('update:readStatus', $event.target.value)"
            >
              <option value="">Tất cả</option>
              <option value="unread">Chưa đọc</option>
              <option value="read">Đã đọc</option>
            </select>
          </div>

          <!-- Date Range Filter -->
          <div class="filter-item date-range-item">
            <label class="filter-label">Khoảng thời gian</label>
            <div class="date-range-inputs">
              <input
                type="date"
                class="date-input"
                :value="dateRange?.start ? formatDateForInput(dateRange.start) : ''"
                @change="updateDateRange('start', $event.target.value)"
                placeholder="Từ ngày"
              />
              <span class="date-separator">đến</span>
              <input
                type="date"
                class="date-input"
                :value="dateRange?.end ? formatDateForInput(dateRange.end) : ''"
                @change="updateDateRange('end', $event.target.value)"
                placeholder="Đến ngày"
              />
            </div>
          </div>
        </div>

        <!-- Quick Date Filters -->
        <div class="quick-date-filters">
          <span class="quick-date-label">Nhanh:</span>
          <button
            class="quick-date-btn"
            @click="setQuickDateRange('today')"
            :class="{ active: isQuickDateActive('today') }"
          >
            Hôm nay
          </button>
          <button
            class="quick-date-btn"
            @click="setQuickDateRange('week')"
            :class="{ active: isQuickDateActive('week') }"
          >
            Tuần này
          </button>
          <button
            class="quick-date-btn"
            @click="setQuickDateRange('month')"
            :class="{ active: isQuickDateActive('month') }"
          >
            Tháng này
          </button>
          <button
            class="quick-date-btn"
            @click="clearDateRange"
            v-if="dateRange"
          >
            Xóa
          </button>
        </div>

        <!-- Clear All Filters -->
        <div class="filter-actions" v-if="hasActiveFilters">
          <button class="clear-all-btn" @click="clearAllFilters">
            <i class="fas fa-times-circle"></i>
            Xóa tất cả bộ lọc
          </button>
        </div>
      </div>
    </transition>

    <!-- Active Filters Summary -->
    <div class="active-filters" v-if="activeFilterCount > 0">
      <span class="active-filters-label">Bộ lọc đang áp dụng:</span>
      <div class="filter-tags">
        <span v-if="search" class="filter-tag">
          <i class="fas fa-search"></i>
          "{{ search }}"
          <button @click="$emit('update:search', '')">
            <i class="fas fa-times"></i>
          </button>
        </span>
        
        <span v-if="category" class="filter-tag">
          <i class="fas fa-folder"></i>
          {{ getCategoryName(category) }}
          <button @click="$emit('update:category', '')">
            <i class="fas fa-times"></i>
          </button>
        </span>
        
        <span v-if="priority" class="filter-tag">
          <i class="fas fa-exclamation-circle"></i>
          {{ getPriorityName(priority) }}
          <button @click="$emit('update:priority', '')">
            <i class="fas fa-times"></i>
          </button>
        </span>
        
        <span v-if="readStatus" class="filter-tag">
          <i class="fas fa-eye"></i>
          {{ getReadStatusName(readStatus) }}
          <button @click="$emit('update:readStatus', '')">
            <i class="fas fa-times"></i>
          </button>
        </span>
        
        <span v-if="dateRange" class="filter-tag">
          <i class="fas fa-calendar"></i>
          {{ formatDateRange(dateRange) }}
          <button @click="clearDateRange">
            <i class="fas fa-times"></i>
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    default: ''
  },
  readStatus: {
    type: String,
    default: ''
  },
  dateRange: {
    type: Object,
    default: null
  },
  categories: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'update:search',
  'update:category',
  'update:priority',
  'update:readStatus',
  'update:dateRange',
  'filter-change'
])

// Local state
const showAdvanced = ref(false)

// Computed properties
const activeFilterCount = computed(() => {
  let count = 0
  if (props.search) count++
  if (props.category) count++
  if (props.priority) count++
  if (props.readStatus) count++
  if (props.dateRange) count++
  return count
})

const hasActiveFilters = computed(() => {
  return activeFilterCount.value > 0
})

const isToday = computed(() => {
  if (!props.dateRange) return false
  const today = new Date()
  const start = new Date(props.dateRange.start)
  const end = new Date(props.dateRange.end)
  
  return start.toDateString() === today.toDateString() &&
         end.toDateString() === today.toDateString()
})

// Methods
const toggleReadStatus = (status) => {
  emit('update:readStatus', props.readStatus === status ? '' : status)
  emit('filter-change')
}

const togglePriority = (priorityLevel) => {
  emit('update:priority', props.priority === priorityLevel ? '' : priorityLevel)
  emit('filter-change')
}

const toggleTodayFilter = () => {
  if (isToday.value) {
    clearDateRange()
  } else {
    setQuickDateRange('today')
  }
}

const updateDateRange = (type, value) => {
  const newRange = { ...(props.dateRange || {}) }
  
  if (value) {
    newRange[type] = new Date(value)
  } else {
    delete newRange[type]
  }
  
  if (Object.keys(newRange).length === 0) {
    emit('update:dateRange', null)
  } else {
    emit('update:dateRange', newRange)
  }
  
  emit('filter-change')
}

const setQuickDateRange = (period) => {
  const today = new Date()
  const start = new Date()
  const end = new Date()
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'week':
      const dayOfWeek = today.getDay()
      start.setDate(today.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      end.setDate(today.getDate() + (6 - dayOfWeek))
      end.setHours(23, 59, 59, 999)
      break
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(today.getMonth() + 1, 0)
      end.setHours(23, 59, 59, 999)
      break
  }
  
  emit('update:dateRange', { start, end })
  emit('filter-change')
}

const isQuickDateActive = (period) => {
  if (!props.dateRange) return false
  
  const today = new Date()
  const start = new Date(props.dateRange.start)
  const end = new Date(props.dateRange.end)
  
  switch (period) {
    case 'today':
      return start.toDateString() === today.toDateString() &&
             end.toDateString() === today.toDateString()
    case 'week':
      const weekStart = new Date(today)
      const dayOfWeek = today.getDay()
      weekStart.setDate(today.getDate() - dayOfWeek)
      weekStart.setHours(0, 0, 0, 0)
      
      const weekEnd = new Date(today)
      weekEnd.setDate(today.getDate() + (6 - dayOfWeek))
      weekEnd.setHours(23, 59, 59, 999)
      
      return start.getTime() === weekStart.getTime() &&
             end.getTime() === weekEnd.getTime()
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
      monthEnd.setHours(23, 59, 59, 999)
      
      return start.getTime() === monthStart.getTime() &&
             end.getTime() === monthEnd.getTime()
    default:
      return false
  }
}

const clearDateRange = () => {
  emit('update:dateRange', null)
  emit('filter-change')
}

const clearAllFilters = () => {
  emit('update:search', '')
  emit('update:category', '')
  emit('update:priority', '')
  emit('update:readStatus', '')
  emit('update:dateRange', null)
  emit('filter-change')
}

const formatDateForInput = (date) => {
  return date.toISOString().split('T')[0]
}

const formatDateRange = (range) => {
  if (!range) return ''
  
  const start = new Date(range.start)
  const end = new Date(range.end)
  
  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  if (start.toDateString() === end.toDateString()) {
    return formatDate(start)
  }
  
  return `${formatDate(start)} - ${formatDate(end)}`
}

const getCategoryName = (categoryId) => {
  const category = props.categories.find(c => c.id === categoryId)
  return category?.name || categoryId
}

const getPriorityName = (priority) => {
  const names = {
    high: 'Cao',
    medium: 'Trung bình',
    low: 'Thấp'
  }
  return names[priority] || priority
}

const getReadStatusName = (status) => {
  const names = {
    read: 'Đã đọc',
    unread: 'Chưa đọc'
  }
  return names[status] || status
}
</script>

<style scoped>
.student-notification-filters {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.filters-container {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 16px;
  align-items: center;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-group {
  min-width: 0;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 14px;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 14px;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.clear-search {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: #e5e7eb;
  color: #6b7280;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
}

.clear-search:hover {
  background: #d1d5db;
  color: #374151;
}

.quick-filters {
  gap: 8px;
}

.quick-filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 20px;
  background: white;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.quick-filter-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.quick-filter-btn.active {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.advanced-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: white;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.advanced-toggle-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.advanced-toggle-btn.active {
  background: #f3f4f6;
  border-color: #d1d5db;
  color: #374151;
}

.toggle-icon {
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

.advanced-filters {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}

.advanced-filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.date-range-item {
  grid-column: 1 / -1;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-label {
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
}

.date-range-inputs {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: center;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.date-input:focus {
  outline: none;
  border-color: #667eea;
}

.date-separator {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 500;
}

.quick-date-filters {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.quick-date-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  margin-right: 4px;
}

.quick-date-btn {
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  background: white;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-date-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.quick-date-btn.active {
  background: #eff6ff;
  border-color: #3b82f6;
  color: #1d4ed8;
}

.filter-actions {
  display: flex;
  justify-content: center;
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-all-btn:hover {
  background: #fee2e2;
}

.active-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.active-filters-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 8px;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 16px;
  font-size: 12px;
  color: #1e40af;
}

.filter-tag button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: rgba(59, 130, 246, 0.2);
  color: #1e40af;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease;
  font-size: 8px;
}

.filter-tag button:hover {
  background: rgba(59, 130, 246, 0.3);
}

.advanced-filters-enter-active,
.advanced-filters-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.advanced-filters-enter-from,
.advanced-filters-leave-to {
  opacity: 0;
  max-height: 0;
  margin-top: 0;
  padding-top: 0;
}

.advanced-filters-enter-to,
.advanced-filters-leave-from {
  opacity: 1;
  max-height: 500px;
  margin-top: 24px;
  padding-top: 24px;
}

@media (max-width: 1024px) {
  .filters-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .filter-group {
    justify-content: center;
  }
  
  .quick-filters {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .student-notification-filters {
    padding: 16px;
  }
  
  .advanced-filters-grid {
    grid-template-columns: 1fr;
  }
  
  .date-range-inputs {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  
  .date-separator {
    text-align: center;
  }
  
  .quick-date-filters {
    justify-content: center;
  }
  
  .filter-tags {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .quick-filter-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .quick-filter-btn span {
    display: none;
  }
  
  .advanced-toggle-btn span {
    display: none;
  }
}
</style>