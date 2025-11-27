<template>
  <div class="student-subject-filters">
    <div class="filters-container">
      <!-- Search Bar -->
      <div class="filter-group search-group">
        <div class="search-wrapper">
          <div class="search-icon">
            <i class="fas fa-search"></i>
          </div>
          <input
            v-model="localFilters.search"
            type="text"
            placeholder="Tìm kiếm môn học, mã môn..."
            class="search-input"
            @input="handleFilterChange"
          />
          <button
            v-if="localFilters.search"
            @click="clearSearch"
            class="clear-search"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>

      <!-- Filter Dropdowns -->
      <div class="filter-group">
        <label class="filter-label">Loại môn học</label>
        <select
          v-model="localFilters.type"
          class="filter-select"
          @change="handleFilterChange"
        >
          <option value="all">Tất cả loại</option>
          <option value="required">Bắt buộc</option>
          <option value="elective">Tự chọn</option>
          <option value="specialization">Chuyên ngành</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Trạng thái</label>
        <select
          v-model="localFilters.status"
          class="filter-select"
          @change="handleFilterChange"
        >
          <option value="all">Tất cả</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="current">Đang học</option>
          <option value="remaining">Chưa học</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Học kỳ</label>
        <select
          v-model="localFilters.semester"
          class="filter-select"
          @change="handleFilterChange"
        >
          <option value="">Tất cả học kỳ</option>
          <option value="1">Học kỳ 1</option>
          <option value="2">Học kỳ 2</option>
          <option value="3">Học kỳ 3</option>
          <option value="4">Học kỳ 4</option>
          <option value="5">Học kỳ 5</option>
          <option value="6">Học kỳ 6</option>
          <option value="7">Học kỳ 7</option>
          <option value="8">Học kỳ 8</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Năm học</label>
        <select
          v-model="localFilters.academicYear"
          class="filter-select"
          @change="handleFilterChange"
        >
          <option value="">Tất cả năm</option>
          <option value="1">Năm 1</option>
          <option value="2">Năm 2</option>
          <option value="3">Năm 3</option>
          <option value="4">Năm 4</option>
        </select>
      </div>

      <!-- Quick Filters -->
      <div class="quick-filters">
        <button
          :class="['quick-filter', { active: activeQuickFilter === 'current-semester' }]"
          @click="applyQuickFilter('current-semester')"
        >
          <i class="fas fa-calendar-day"></i>
          <span>Học kỳ hiện tại</span>
        </button>
        
        <button
          :class="['quick-filter', { active: activeQuickFilter === 'completed' }]"
          @click="applyQuickFilter('completed')"
        >
          <i class="fas fa-check-circle"></i>
          <span>Đã hoàn thành</span>
        </button>
        
        <button
          :class="['quick-filter', { active: activeQuickFilter === 'remaining' }]"
          @click="applyQuickFilter('remaining')"
        >
          <i class="fas fa-clock"></i>
          <span>Chưa học</span>
        </button>
        
        <button
          :class="['quick-filter', { active: activeQuickFilter === 'high-credits' }]"
          @click="applyQuickFilter('high-credits')"
        >
          <i class="fas fa-weight-hanging"></i>
          <span>Tín chỉ cao</span>
        </button>
      </div>

      <!-- Filter Actions -->
      <div class="filter-actions">
        <button @click="resetFilters" class="reset-btn">
          <i class="fas fa-undo"></i>
          <span>Đặt lại</span>
        </button>
        
        <div class="active-filters-count" v-if="activeFiltersCount > 0">
          <span class="count-badge">{{ activeFiltersCount }}</span>
          <span class="count-text">bộ lọc</span>
        </div>
      </div>
    </div>

    <!-- Active Filters Display -->
    <div v-if="activeFiltersList.length > 0" class="active-filters">
      <div class="active-filters-header">
        <span class="active-filters-title">Bộ lọc đang áp dụng:</span>
      </div>
      <div class="active-filters-list">
        <div
          v-for="filter in activeFiltersList"
          :key="filter.key"
          class="active-filter-tag"
        >
          <span class="filter-label">{{ filter.label }}</span>
          <span class="filter-value">{{ filter.value }}</span>
          <button @click="removeFilter(filter.key)" class="remove-filter">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useSemesters } from '@/hooks/useSemesters'

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:filters'])

// Local reactive copy of filters
const localFilters = reactive({ ...props.filters })
const activeQuickFilter = ref('')

// Watch for external filter changes
watch(() => props.filters, (newFilters) => {
  Object.assign(localFilters, newFilters)
}, { deep: true })

// Semesters from API
const { semesters: semestersList, fetchSemesters } = useSemesters()
const semesters = computed(() => semestersList.value || [])

onMounted(async () => { try { await fetchSemesters({ page: 1, limit: 100 }) } catch (e) { /* ignore */ } })

// Computed properties
const activeFiltersCount = computed(() => {
  let count = 0
  if (localFilters.search) count++
  if (localFilters.type && localFilters.type !== 'all') count++
  if (localFilters.status && localFilters.status !== 'all') count++
  if (localFilters.semester) count++
  if (localFilters.academicYear) count++
  return count
})

const activeFiltersList = computed(() => {
  const filters = []
  
  if (localFilters.search) {
    filters.push({
      key: 'search',
      label: 'Tìm kiếm',
      value: localFilters.search
    })
  }
  
  if (localFilters.type && localFilters.type !== 'all') {
    const typeLabels = {
      'required': 'Bắt buộc',
      'elective': 'Tự chọn',
      'specialization': 'Chuyên ngành'
    }
    filters.push({
      key: 'type',
      label: 'Loại',
      value: typeLabels[localFilters.type] || localFilters.type
    })
  }
  
  if (localFilters.status && localFilters.status !== 'all') {
    const statusLabels = {
      'completed': 'Đã hoàn thành',
      'current': 'Đang học',
      'remaining': 'Chưa học'
    }
    filters.push({
      key: 'status',
      label: 'Trạng thái',
      value: statusLabels[localFilters.status] || localFilters.status
    })
  }
  
  if (localFilters.semester) {
    filters.push({
      key: 'semester',
      label: 'Học kỳ',
      value: (semesters.value.find(s => String(s.id) === String(localFilters.semester)) || {}).name || `Học kỳ ${localFilters.semester}`
    })
  }
  
  if (localFilters.academicYear) {
    filters.push({
      key: 'academicYear',
      label: 'Năm học',
      value: `Năm ${localFilters.academicYear}`
    })
  }
  
  return filters
})

// Methods
const handleFilterChange = () => {
  activeQuickFilter.value = ''
  emit('update:filters', { ...localFilters })
}

const clearSearch = () => {
  localFilters.search = ''
  handleFilterChange()
}

const applyQuickFilter = (filterType) => {
  // Reset all filters first
  resetFilters()
  activeQuickFilter.value = filterType
  
  switch (filterType) {
    case 'current-semester':
      // Assuming current semester is 2, year 1 (this should come from app state)
      localFilters.semester = '2'
      localFilters.academicYear = '1'
      break
    case 'completed':
      localFilters.status = 'completed'
      break
    case 'remaining':
      localFilters.status = 'remaining'
      break
    case 'high-credits':
      // This would need additional logic since we don't have a credits filter
      // For now, we'll search for subjects with 4+ credits
      localFilters.search = ''
      break
  }
  
  emit('update:filters', { ...localFilters })
}

const resetFilters = () => {
  localFilters.search = ''
  localFilters.type = 'all'
  localFilters.status = 'all'
  localFilters.semester = ''
  localFilters.academicYear = ''
  activeQuickFilter.value = ''
  emit('update:filters', { ...localFilters })
}

const removeFilter = (filterKey) => {
  switch (filterKey) {
    case 'search':
      localFilters.search = ''
      break
    case 'type':
      localFilters.type = 'all'
      break
    case 'status':
      localFilters.status = 'all'
      break
    case 'semester':
      localFilters.semester = ''
      break
    case 'academicYear':
      localFilters.academicYear = ''
      break
  }
  activeQuickFilter.value = ''
  emit('update:filters', { ...localFilters })
}
</script>

<style scoped>
.student-subject-filters {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.filters-container {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr auto;
  gap: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.search-group {
  grid-column: span 1;
}

.search-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #9ca3af;
  font-size: 14px;
  z-index: 2;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-input::placeholder {
  color: #9ca3af;
}

.clear-search {
  position: absolute;
  right: 8px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 50%;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  transition: all 0.3s ease;
  z-index: 2;
}

.clear-search:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.filter-select {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.quick-filters {
  grid-column: span 6;
  display: flex;
  gap: 12px;
  margin-top: 20px;
  flex-wrap: wrap;
}

.quick-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.quick-filter:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  transform: translateY(-1px);
}

.quick-filter.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.quick-filter i {
  font-size: 12px;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.reset-btn:hover {
  border-color: #d97706;
  color: #d97706;
  transform: translateY(-1px);
}

.active-filters-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
}

.count-text {
  font-weight: 500;
}

/* Active Filters */
.active-filters {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.active-filters-header {
  margin-bottom: 12px;
}

.active-filters-title {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.active-filters-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.active-filter-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 8px;
  font-size: 12px;
}

.filter-label {
  color: #3b82f6;
  font-weight: 600;
}

.filter-value {
  color: #1f2937;
  font-weight: 500;
}

.remove-filter {
  width: 16px;
  height: 16px;
  border: none;
  background: rgba(59, 130, 246, 0.2);
  border-radius: 50%;
  color: #3b82f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  transition: all 0.3s ease;
}

.remove-filter:hover {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .filters-container {
    grid-template-columns: 2fr 1fr 1fr 1fr auto;
    gap: 16px;
  }
  
  .quick-filters {
    grid-column: span 5;
  }
}

@media (max-width: 1024px) {
  .filters-container {
    grid-template-columns: 1fr 1fr 1fr auto;
    gap: 16px;
  }
  
  .search-group {
    grid-column: span 3;
  }
  
  .quick-filters {
    grid-column: span 4;
    margin-top: 16px;
  }
  
  .filter-actions {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .student-subject-filters {
    padding: 20px;
  }
  
  .filters-container {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .search-group,
  .quick-filters,
  .filter-actions {
    grid-column: span 1;
  }
  
  .quick-filters {
    margin-top: 16px;
    gap: 8px;
  }
  
  .quick-filter {
    flex: 1;
    justify-content: center;
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .quick-filter span {
    display: none;
  }
  
  .filter-actions {
    justify-content: center;
  }
  
  .active-filters-list {
    gap: 6px;
  }
  
  .active-filter-tag {
    font-size: 11px;
    padding: 4px 8px;
  }
}

@media (max-width: 640px) {
  .quick-filters {
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }
  
  .quick-filter {
    justify-content: center;
    padding: 10px 8px;
  }
  
  .search-input {
    padding: 10px 10px 10px 36px;
    font-size: 13px;
  }
  
  .filter-select {
    padding: 10px 12px;
    font-size: 13px;
  }
}
        <select
          v-model="localFilters.semester"
          class="filter-select"
          @change="handleFilterChange"
        >
          <option value="">Tất cả học kỳ</option>
          <option v-for="sem in semesters" :key="sem.id || sem" :value="sem.id || sem">{{ sem.name || `Học kỳ ${sem.id}` }}</option>
        </select>