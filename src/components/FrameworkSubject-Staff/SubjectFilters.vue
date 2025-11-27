<template>
  <div class="subject-filters">
    <div class="filters-row">
      <!-- Tìm kiếm chính -->
      <div class="search-group">
        <div class="search-box">
          <i class="fas fa-search search-icon"></i>
          <input
            type="text"
            v-model="localFilters.search"
            placeholder="Tìm mã môn, tên môn học..."
            class="search-input"
            @input="handleSearch"
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

      <!-- Bộ lọc nhanh -->
      <div class="quick-filters">
        <button
          v-for="filter in quickFilters"
          :key="filter.id"
          :class="['quick-filter', { active: localFilters.type === filter.value }]"
          @click="setQuickFilter(filter.value)"
        >
          <i :class="filter.icon"></i>
          <span>{{ filter.label }}</span>
          <span class="count">{{ filter.count }}</span>
        </button>
      </div>
    </div>

    <div class="filters-row">
      <!-- Chuyên ngành -->
      <div class="filter-group">
        <label>Chuyên ngành</label>
        <select v-model="localFilters.major" @change="handleFilterChange">
          <option value="">Tất cả chuyên ngành</option>
          <option
            v-for="major in majors"
            :key="major.major_id || major.id || major.code"
            :value="major.major_id || major.id || major.code"
          >
            {{ major.major_name || major.name || major.major_code || major.code }}
          </option>
        </select>
      </div>

      <!-- Học kỳ -->
      <div class="filter-group">
        <label>Học kỳ</label>
        <select v-model="localFilters.semester" @change="handleFilterChange">
          <option value="">Tất cả học kỳ</option>
          <option
            v-for="sem in semesters"
            :key="sem.id || sem"
            :value="sem.id || sem"
          >
            {{ sem.name || `Học kỳ ${sem.id || sem}` }}
          </option>
        </select>
      </div>

      <!-- Số tín chỉ -->
      <div class="filter-group">
        <label>Số tín chỉ</label>
        <select v-model="localFilters.credits" @change="handleFilterChange">
          <option value="">Tất cả</option>
          <option value="1">1 tín chỉ</option>
          <option value="2">2 tín chỉ</option>
          <option value="3">3 tín chỉ</option>
          <option value="4">4 tín chỉ</option>
          <option value="5+">5+ tín chỉ</option>
        </select>
      </div>

      <!-- Trạng thái -->
      <div class="filter-group">
        <label>Trạng thái</label>
        <select v-model="localFilters.status" @change="handleFilterChange">
          <option value="">Tất cả</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Tạm dừng</option>
          <option value="draft">Bản nháp</option>
        </select>
      </div>

      <!-- Nút reset -->
      <div class="filter-actions">
        <button @click="resetFilters" class="btn-reset">
          <i class="fas fa-undo"></i>
          Reset
        </button>
      </div>
    </div>

    <!-- Hiển thị bộ lọc đang áp dụng -->
    <div v-if="hasActiveFilters" class="active-filters">
      <span class="active-filters-label">Bộ lọc đang áp dụng:</span>
      <div class="filter-tags">
        <span v-if="localFilters.search" class="filter-tag">
          Tìm kiếm: "{{ localFilters.search }}"
          <button @click="localFilters.search = ''; handleFilterChange()">×</button>
        </span>
        <span v-if="localFilters.type && localFilters.type !== 'all'" class="filter-tag">
          Loại: {{ getTypeLabel(localFilters.type) }}
          <button @click="localFilters.type = 'all'; handleFilterChange()">×</button>
        </span>
        <span v-if="localFilters.major" class="filter-tag">
          Chuyên ngành: {{ getMajorName(localFilters.major) }}
          <button @click="localFilters.major = ''; handleFilterChange()">×</button>
        </span>
        <span v-if="localFilters.semester" class="filter-tag">
          Học kỳ: {{ getSemesterName(localFilters.semester) }}
          <button @click="localFilters.semester = ''; handleFilterChange()">×</button>
        </span>
        <span v-if="localFilters.credits" class="filter-tag">
          Tín chỉ: {{ localFilters.credits }}
          <button @click="localFilters.credits = ''; handleFilterChange()">×</button>
        </span>
        <span v-if="localFilters.status" class="filter-tag">
          Trạng thái: {{ getStatusLabel(localFilters.status) }}
          <button @click="localFilters.status = ''; handleFilterChange()">×</button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useMajors } from '@/hooks/useMajors'
import { useSemesters } from '@/hooks/useSemesters'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  },
  subjects: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:filters'])

// Local filters state
const localFilters = reactive({
  search: props.filters.search || '',
  type: props.filters.type || 'all',
  major: props.filters.major || '',
  semester: props.filters.semester || '',
  credits: props.filters.credits || '',
  status: props.filters.status || ''
})

// Quick filters (counts computed dynamically if subjects are provided)
const quickFilters = computed(() => {
  const arr = props.subjects || []
  const total = arr.length
  const required = arr.filter(s => (s.type || s.courseType || s.course_type) === 'required').length
  const elective = arr.filter(s => (s.type || s.courseType || s.course_type) === 'elective').length
  // Count items updated in last 30 days as "new" (fallback to createdAt or updatedAt)
  const now = Date.now()
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
  const newCount = arr.filter(s => {
    const d = s.updatedAt || s.createdAt || s.raw?.updatedAt || s.raw?.createdAt || s.raw?.updated_at || s.raw?.created_at
    if (!d) return false
    const time = Date.parse(d)
    if (!time || Number.isNaN(time)) return false
    return (now - time) <= THIRTY_DAYS
  }).length
  return [
    { id: 'all', label: 'Tất cả', value: 'all', icon: 'fas fa-th-large', count: total },
    { id: 'required', label: 'Bắt buộc', value: 'required', icon: 'fas fa-star', count: required },
    { id: 'elective', label: 'Tự chọn', value: 'elective', icon: 'fas fa-list-ul', count: elective },
  ]
})

// Data options (live)
const { majors: majorsList, fetchMajors } = useMajors()
const { semesters: semestersList, fetchSemesters } = useSemesters()
const majors = majorsList
const semesters = computed(() => semestersList.value || [])

onMounted(async () => {
  try { await Promise.all([fetchMajors(), fetchSemesters({ page: 1, limit: 100 })]) } catch (e) { /* ignore */ }
})

// Computed
const hasActiveFilters = computed(() => {
  return localFilters.search || 
         (localFilters.type && localFilters.type !== 'all') ||
         localFilters.major ||
         localFilters.semester ||
         localFilters.credits ||
         localFilters.status
})

// Methods
const handleSearch = () => {
  handleFilterChange()
}

const clearSearch = () => {
  localFilters.search = ''
  handleFilterChange()
}

const setQuickFilter = (type) => {
  localFilters.type = type
  handleFilterChange()
}

const handleFilterChange = () => {
  emit('update:filters', { ...localFilters })
}

const resetFilters = () => {
  Object.assign(localFilters, {
    search: '',
    type: 'all',
    major: '',
    semester: '',
    credits: '',
    status: ''
  })
  handleFilterChange()
}

const getTypeLabel = (type) => {
  const filter = quickFilters.value.find(f => f.value === type)
  return filter ? filter.label : type
}

const getMajorName = (majorId) => {
  if (majorId === null || majorId === undefined) return ''
  const key = String(majorId)
  const arr = majors.value || []
  const found = arr.find(m => String(m.major_id || m.id || m.code) === key || String(m.major_code || m.code || (m.major_name || m.name)).toLowerCase() === key.toLowerCase())
  return found ? (found.major_name || found.name || found.major_code || found.code) : majorId
}

const getStatusLabel = (status) => {
  const statusLabels = {
    'active': 'Đang hoạt động',
    'inactive': 'Tạm dừng',
    'draft': 'Bản nháp'
  }
  return statusLabels[status] || status
}

const getSemesterName = (semId) => {
  if (semId === null || semId === undefined || semId === '') return ''
  const s = semesters.value.find(x => String(x.id) === String(semId) || (x.id === semId))
  if (s) return s.name || `Học kỳ ${s.id}`
  return `Học kỳ ${semId}`
}
</script>

<style scoped>
.subject-filters {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 24px;
}

.filters-row {
  display: flex;
  gap: 20px;
  align-items: flex-end;
  margin-bottom: 20px;
}

.filters-row:last-child {
  margin-bottom: 0;
}

.search-group {
  flex: 1;
  min-width: 300px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #9ca3af;
  font-size: 16px;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  background: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-search {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.clear-search:hover {
  color: #6b7280;
  background: rgba(0, 0, 0, 0.05);
}

.quick-filters {
  display: flex;
  gap: 12px;
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
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.quick-filter:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.quick-filter.active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
}

.quick-filter .count {
  background: rgba(0, 0, 0, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.quick-filter.active .count {
  background: rgba(255, 255, 255, 0.2);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.filter-group select {
  padding: 10px 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  background: white;
  font-size: 14px;
  color: #374151;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 140px;
}

.filter-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

.btn-reset {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: #f3f4f6;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: #e5e7eb;
  color: #374151;
}

.active-filters {
  border-top: 1px solid #e5e7eb;
  padding-top: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.active-filters-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
  margin-top: 2px;
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
  padding: 4px 12px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.filter-tag button {
  background: none;
  border: none;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  padding: 0;
  margin-left: 4px;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-tag button:hover {
  background: rgba(59, 130, 246, 0.2);
}

@media (max-width: 1024px) {
  .filters-row {
    flex-wrap: wrap;
    gap: 16px;
  }
  
  .search-group {
    min-width: 250px;
  }
  
  .quick-filters {
    flex: 1;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .subject-filters {
    padding: 20px;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .search-group {
    min-width: auto;
  }
  
  .quick-filters {
    justify-content: flex-start;
  }
  
  .filter-group {
    flex: 1;
  }
  
  .filter-group select {
    min-width: auto;
  }
  
  .active-filters {
    flex-direction: column;
    gap: 8px;
  }
  
  .active-filters-label {
    white-space: normal;
  }
}
</style>