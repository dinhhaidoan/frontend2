<template>
  <div class="notification-filters">
    <!-- Main Filter Bar -->
    <div class="filter-bar">
      <!-- Search -->
      <div class="filter-group search-group">
        <div class="search-input">
          <i class="fas fa-search"></i>
          <input
            type="text"
            :value="search"
            @input="$emit('update:search', $event.target.value)"
            placeholder="Tìm kiếm thông báo..."
            class="search-field"
          />
        </div>
      </div>

      <!-- Category Filter -->
      <div class="filter-group">
        <select
          :value="category"
          @change="$emit('update:category', $event.target.value)"
          class="filter-select"
        >
          <option value="">Tất cả danh mục</option>
          <option
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.name }}
          </option>
        </select>
      </div>

      <!-- Status Filter (Admin/Staff/Teacher) -->
      <div class="filter-group" v-if="canFilterByStatus">
        <select
          :value="status"
          @change="$emit('update:status', $event.target.value)"
          class="filter-select"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="published">Đã xuất bản</option>
          <option value="draft">Bản nháp</option>
          <option value="scheduled">Đã lên lịch</option>
          <option value="archived" v-if="userRole === 'admin'">Lưu trữ</option>
        </select>
      </div>

      <!-- Priority Filter -->
      <div class="filter-group">
        <select
          :value="priority"
          @change="$emit('update:priority', $event.target.value)"
          class="filter-select"
        >
          <option value="">Tất cả mức độ</option>
          <option value="high">Cao</option>
          <option value="medium">Trung bình</option>
          <option value="low">Thấp</option>
        </select>
      </div>

      <!-- Advanced Filters Toggle -->
      <div class="filter-group" v-if="showAdvanced">
        <button
          class="advanced-toggle"
          :class="{ active: showAdvancedFilters }"
          @click="toggleAdvancedFilters"
        >
          <i class="fas fa-sliders-h"></i>
          Nâng cao
        </button>
      </div>

      <!-- Clear Filters -->
      <div class="filter-group">
        <button class="clear-filters" @click="clearAllFilters" :disabled="!hasActiveFilters">
          <i class="fas fa-times"></i>
          Xóa bộ lọc
        </button>
      </div>
    </div>

    <!-- Advanced Filters Panel -->
    <div class="advanced-filters" v-if="showAdvancedFilters && showAdvanced">
      <div class="advanced-content">
        <!-- Date Range -->
        <div class="advanced-group">
          <label>Khoảng thời gian</label>
          <div class="date-range">
            <input
              type="date"
              :value="dateRange?.start"
              @change="updateDateRange('start', $event.target.value)"
              class="date-input"
            />
            <span class="date-separator">đến</span>
            <input
              type="date"
              :value="dateRange?.end"
              @change="updateDateRange('end', $event.target.value)"
              class="date-input"
            />
          </div>
        </div>

        <!-- Read Status (for students) -->
        <div class="advanced-group" v-if="userRole === 'student'">
          <label>Trạng thái đọc</label>
          <div class="radio-group">
            <label class="radio-label">
              <input
                type="radio"
                :value="''"
                v-model="readStatus"
                @change="updateReadStatus"
              />
              <span>Tất cả</span>
            </label>
            <label class="radio-label">
              <input
                type="radio"
                value="read"
                v-model="readStatus"
                @change="updateReadStatus"
              />
              <span>Đã đọc</span>
            </label>
            <label class="radio-label">
              <input
                type="radio"
                value="unread"
                v-model="readStatus"
                @change="updateReadStatus"
              />
              <span>Chưa đọc</span>
            </label>
          </div>
        </div>

        <!-- Author Filter (Admin/Staff) -->
        <div class="advanced-group" v-if="canFilterByAuthor">
          <label>Người tạo</label>
          <select v-model="authorFilter" @change="updateAuthorFilter" class="filter-select">
            <option value="">Tất cả</option>
            <option value="admin">Admin</option>
            <option value="staff">Giáo vụ</option>
            <option value="teacher">Giảng viên</option>
          </select>
        </div>

        <!-- Recipients Count (Admin/Staff) -->
        <div class="advanced-group" v-if="canFilterByRecipients">
          <label>Số người nhận</label>
          <div class="range-input">
            <input
              type="number"
              v-model.number="recipientRange.min"
              @change="updateRecipientRange"
              placeholder="Tối thiểu"
              min="0"
              class="number-input"
            />
            <span class="range-separator">-</span>
            <input
              type="number"
              v-model.number="recipientRange.max"
              @change="updateRecipientRange"
              placeholder="Tối đa"
              min="0"
              class="number-input"
            />
          </div>
        </div>

        <!-- Tags Filter (Admin/Staff/Teacher) -->
        <div class="advanced-group" v-if="canFilterByTags">
          <label>Thẻ</label>
          <div class="tags-input">
            <div class="selected-tags">
              <span
                v-for="tag in selectedTags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
                <button @click="removeTag(tag)">
                  <i class="fas fa-times"></i>
                </button>
              </span>
            </div>
            <input
              type="text"
              v-model="newTag"
              @keydown.enter.prevent="addTag"
              @keydown.comma.prevent="addTag"
              placeholder="Nhập thẻ và nhấn Enter"
              class="tag-input"
            />
          </div>
        </div>

        <!-- Quick Date Filters -->
        <div class="advanced-group">
          <label>Bộ lọc nhanh</label>
          <div class="quick-filters">
            <button
              v-for="quick in quickDateFilters"
              :key="quick.key"
              class="quick-filter-btn"
              :class="{ active: activeQuickFilter === quick.key }"
              @click="applyQuickFilter(quick)"
            >
              {{ quick.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div class="active-filters" v-if="activeFilters.length > 0">
      <span class="active-filters-label">Bộ lọc đang áp dụng:</span>
      <div class="filter-tags">
        <span
          v-for="filter in activeFilters"
          :key="filter.key"
          class="filter-tag"
        >
          {{ filter.label }}
          <button @click="removeFilter(filter.key)">
            <i class="fas fa-times"></i>
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  search: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    default: ''
  },
  priority: {
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
  },
  showAdvanced: {
    type: Boolean,
    default: true
  },
  userRole: {
    type: String,
    required: true
  }
})

const emit = defineEmits([
  'update:search',
  'update:category',
  'update:status',
  'update:priority',
  'update:dateRange',
  'filter-change'
])

// Local state
const showAdvancedFilters = ref(false)
const readStatus = ref('')
const authorFilter = ref('')
const recipientRange = ref({ min: null, max: null })
const selectedTags = ref([])
const newTag = ref('')
const activeQuickFilter = ref('')

// Computed properties for role-based permissions
const canFilterByStatus = computed(() => {
  return ['admin', 'staff', 'teacher'].includes(props.userRole)
})

const canFilterByAuthor = computed(() => {
  return ['admin', 'staff'].includes(props.userRole)
})

const canFilterByRecipients = computed(() => {
  return ['admin', 'staff'].includes(props.userRole)
})

const canFilterByTags = computed(() => {
  return ['admin', 'staff', 'teacher'].includes(props.userRole)
})

const hasActiveFilters = computed(() => {
  return props.search || props.category || props.status || props.priority || 
         props.dateRange || readStatus.value || authorFilter.value ||
         (recipientRange.value.min !== null) || (recipientRange.value.max !== null) ||
         selectedTags.value.length > 0
})

const activeFilters = computed(() => {
  const filters = []
  
  if (props.search) {
    filters.push({ key: 'search', label: `Tìm kiếm: "${props.search}"` })
  }
  
  if (props.category) {
    const categoryName = props.categories.find(c => c.id === props.category)?.name || props.category
    filters.push({ key: 'category', label: `Danh mục: ${categoryName}` })
  }
  
  if (props.status) {
    const statusLabels = {
      published: 'Đã xuất bản',
      draft: 'Bản nháp',
      scheduled: 'Đã lên lịch',
      archived: 'Lưu trữ'
    }
    filters.push({ key: 'status', label: `Trạng thái: ${statusLabels[props.status]}` })
  }
  
  if (props.priority) {
    const priorityLabels = { high: 'Cao', medium: 'Trung bình', low: 'Thấp' }
    filters.push({ key: 'priority', label: `Mức độ: ${priorityLabels[props.priority]}` })
  }
  
  if (readStatus.value) {
    const readLabels = { read: 'Đã đọc', unread: 'Chưa đọc' }
    filters.push({ key: 'readStatus', label: `${readLabels[readStatus.value]}` })
  }
  
  if (authorFilter.value) {
    const authorLabels = { admin: 'Admin', staff: 'Giáo vụ', teacher: 'Giảng viên' }
    filters.push({ key: 'author', label: `Người tạo: ${authorLabels[authorFilter.value]}` })
  }
  
  if (selectedTags.value.length > 0) {
    filters.push({ key: 'tags', label: `Thẻ: ${selectedTags.value.join(', ')}` })
  }
  
  return filters
})

const quickDateFilters = computed(() => {
  return [
    { key: 'today', label: 'Hôm nay', days: 0 },
    { key: 'yesterday', label: 'Hôm qua', days: 1 },
    { key: 'week', label: '7 ngày qua', days: 7 },
    { key: 'month', label: '30 ngày qua', days: 30 },
    { key: 'quarter', label: '3 tháng qua', days: 90 }
  ]
})

// Methods
const toggleAdvancedFilters = () => {
  showAdvancedFilters.value = !showAdvancedFilters.value
}

const updateDateRange = (type, value) => {
  const newRange = { ...(props.dateRange || {}) }
  newRange[type] = value
  emit('update:dateRange', newRange)
  activeQuickFilter.value = ''
}

const updateReadStatus = () => {
  emit('filter-change')
}

const updateAuthorFilter = () => {
  emit('filter-change')
}

const updateRecipientRange = () => {
  emit('filter-change')
}

const addTag = () => {
  const tag = newTag.value.trim()
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value.push(tag)
    newTag.value = ''
    emit('filter-change')
  }
}

const removeTag = (tag) => {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
    emit('filter-change')
  }
}

const applyQuickFilter = (filter) => {
  const now = new Date()
  const startDate = new Date(now)
  startDate.setDate(now.getDate() - filter.days)
  
  const dateRange = {
    start: startDate.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0]
  }
  
  emit('update:dateRange', dateRange)
  activeQuickFilter.value = filter.key
}

const removeFilter = (filterKey) => {
  switch (filterKey) {
    case 'search':
      emit('update:search', '')
      break
    case 'category':
      emit('update:category', '')
      break
    case 'status':
      emit('update:status', '')
      break
    case 'priority':
      emit('update:priority', '')
      break
    case 'readStatus':
      readStatus.value = ''
      break
    case 'author':
      authorFilter.value = ''
      break
    case 'tags':
      selectedTags.value = []
      break
  }
  emit('filter-change')
}

const clearAllFilters = () => {
  emit('update:search', '')
  emit('update:category', '')
  emit('update:status', '')
  emit('update:priority', '')
  emit('update:dateRange', null)
  readStatus.value = ''
  authorFilter.value = ''
  recipientRange.value = { min: null, max: null }
  selectedTags.value = []
  activeQuickFilter.value = ''
  emit('filter-change')
}

// Watch for changes
watch(() => [props.search, props.category, props.status, props.priority, props.dateRange], () => {
  emit('filter-change')
})
</script>

<style scoped>
.notification-filters {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
}

.filter-bar {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
}

.search-group {
  flex: 1;
  min-width: 280px;
}

.search-input {
  position: relative;
  width: 100%;
}

.search-input i {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  z-index: 1;
}

.search-field {
  width: 100%;
  padding: 12px 16px 12px 40px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 14px;
  background: #f9fafb;
  transition: all 0.3s ease;
}

.search-field:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  color: #374151;
  min-width: 140px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.advanced-toggle {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: white;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.advanced-toggle:hover,
.advanced-toggle.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.clear-filters {
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  background: white;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.clear-filters:hover:not(:disabled) {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.clear-filters:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.advanced-filters {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;
}

.advanced-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.advanced-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.advanced-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.date-range {
  display: flex;
  align-items: center;
  gap: 12px;
}

.date-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.date-separator {
  color: #6b7280;
  font-size: 14px;
}

.radio-group {
  display: flex;
  gap: 16px;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
}

.radio-label input[type="radio"] {
  margin: 0;
}

.range-input {
  display: flex;
  align-items: center;
  gap: 12px;
}

.number-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.range-separator {
  color: #6b7280;
  font-size: 14px;
}

.tags-input {
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 8px;
  background: white;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tag {
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.tag button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0;
  font-size: 10px;
}

.tag-input {
  border: none;
  outline: none;
  padding: 4px;
  font-size: 14px;
  width: 100%;
}

.quick-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-filter-btn {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-filter-btn:hover,
.quick-filter-btn.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.active-filters {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.active-filters-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-tag {
  background: #f3f4f6;
  color: #374151;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-tag button {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0;
  font-size: 10px;
}

.filter-tag button:hover {
  color: #ef4444;
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .search-group {
    min-width: auto;
  }
  
  .advanced-content {
    grid-template-columns: 1fr;
  }
  
  .date-range,
  .range-input {
    flex-direction: column;
    align-items: stretch;
  }
  
  .radio-group {
    flex-direction: column;
  }
  
  .active-filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>