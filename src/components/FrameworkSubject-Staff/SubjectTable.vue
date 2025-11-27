<template>
  <div class="subject-table">
    <!-- Header với actions -->
    <div class="table-header">
      <div class="header-left">
        <h3>
          <i class="fas fa-list"></i>
          Danh sách môn học
          <span class="total-count">({{ filteredSubjects.length }})</span>
        </h3>
      </div>
      
      <div class="header-actions">
        <button @click="$emit('add-subject')" class="btn-add">
          <i class="fas fa-plus"></i>
          Thêm môn học
        </button>
        
        <div class="view-options">
          <button 
            :class="['view-btn', { active: viewMode === 'table' }]"
            @click="$emit('update:viewMode', 'table')"
          >
            <i class="fas fa-table"></i>
          </button>
          <button 
            :class="['view-btn', { active: viewMode === 'grid' }]"
            @click="$emit('update:viewMode', 'grid')"
          >
            <i class="fas fa-th"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="subjects-table">
        <thead>
          <tr>
            <th class="sortable" @click="sort('code')">
              Mã môn
              <i :class="getSortIcon('code')"></i>
            </th>
            <th class="sortable" @click="sort('name')">
              Tên môn học
              <i :class="getSortIcon('name')"></i>
            </th>
            <th class="sortable" @click="sort('credits')">
              Tín chỉ
              <i :class="getSortIcon('credits')"></i>
            </th>
            <th>Loại</th>
            <th>Chuyên ngành</th>
            <th class="sortable" @click="sort('semester')">
              Học kỳ
              <i :class="getSortIcon('semester')"></i>
            </th>
            <th>Điều kiện tiên quyết</th>
            <th>Trạng thái</th>
            <th class="actions-col">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="subject in paginatedSubjects"
            :key="subject.id"
            :class="['subject-row', { selected: selectedSubjects.includes(subject.id) }]">
            <td class="subject-code">
              <span class="code">{{ subject.code }}</span>
            </td>
            <td class="subject-name">
              <div class="name-cell">
                <h4>{{ subject.name }}</h4>
                <p v-if="subject.englishName">{{ subject.englishName }}</p>
              </div>
            </td>
            <td class="credits">
              <span class="credit-badge">{{ subject.credits }}</span>
            </td>
            <td class="type">
              <span :class="['type-badge', subject.type]">
                <i :class="getTypeIcon(subject.type)"></i>
                {{ getTypeLabel(subject.type) }}
              </span>
            </td>
            <td class="major">
              <div class="major-tags">
                <span
                  v-for="major in subject.majors"
                  :key="major"
                  class="major-tag"
                >
                  {{ getMajorName(major) }}
                </span>
              </div>
            </td>
            <td class="semester">
              <span class="semester-badge">HK {{ subject.semester }}</span>
            </td>
            <td class="prerequisites">
              <div v-if="subject.prerequisites && subject.prerequisites.length > 0" class="prereq-list">
                <span
                  v-for="prereq in subject.prerequisites"
                  :key="prereq"
                  class="prereq-tag"
                >
                  {{ getCourseName(subject, prereq) }}
                </span>
              </div>
              <span v-else class="no-prereq">Không có</span>
            </td>
            <td class="status">
              <span :class="['status-badge', subject.status]">
                <i :class="getStatusIcon(subject.status)"></i>
                {{ getStatusLabel(subject.status) }}
              </span>
            </td>
            <td class="actions">
              <div class="action-buttons">
                <button
                  @click="$emit('view-subject', subject)"
                  class="action-btn view"
                  title="Xem chi tiết"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  @click="$emit('edit-subject', subject)"
                  class="action-btn edit"
                  title="Chỉnh sửa"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="$emit('delete-subject', subject)"
                  class="action-btn delete"
                  title="Xóa"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="table-footer">
      <div class="footer-info">
        Hiển thị {{ (currentPage - 1) * itemsPerPage + 1 }} - 
        {{ Math.min(currentPage * itemsPerPage, filteredSubjects.length) }} 
        trong tổng số {{ filteredSubjects.length }} môn học
      </div>
      
      <div class="pagination">
        <button
          :disabled="currentPage === 1"
          @click="changePage(currentPage - 1)"
          class="page-btn"
        >
          <i class="fas fa-chevron-left"></i>
        </button>
        
        <button
          v-for="page in visiblePages"
          :key="page"
          :class="['page-btn', { active: page === currentPage }]"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        
        <button
          :disabled="currentPage === totalPages"
          @click="changePage(currentPage + 1)"
          class="page-btn"
        >
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div class="per-page">
        <select v-model="itemsPerPage" @change="changePage(1)">
          <option value="10">10/trang</option>
          <option value="25">25/trang</option>
          <option value="50">50/trang</option>
          <option value="100">100/trang</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCourses } from '@/hooks/useCourses'
import { useMajors } from '@/hooks/useMajors'

const props = defineProps({
  subjects: {
    type: Array,
    default: () => []
  },
  filters: {
    type: Object,
    default: () => ({})
  },
  viewMode: {
    type: String,
    default: 'table'
  }
})

const emit = defineEmits([
  'add-subject',
  'view-subject', 
  'edit-subject',
  'duplicate-subject',
  'delete-subject',
  'update:viewMode'
])

// State
const selectedSubjects = ref([])
const currentPage = ref(1)
const itemsPerPage = ref(25)
const sortField = ref('code')
const sortDirection = ref('asc')

// Mock data cho demo (only used when VITE_USE_MOCK=true)
const mockSubjects = ref([
  {
    id: 1,
    code: 'IT101',
    name: 'Nhập môn Công nghệ thông tin',
    englishName: 'Introduction to Information Technology',
    credits: 3,
    type: 'required',
    majors: ['cntt', 'ktpm'],
    semester: 1,
    prerequisites: [],
    status: 'active'
  },
  {
    id: 2,
    code: 'IT102',
    name: 'Toán rời rạc',
    englishName: 'Discrete Mathematics',
    credits: 3,
    type: 'required',
    majors: ['cntt', 'ktpm', 'httt'],
    semester: 1,
    prerequisites: [],
    status: 'active'
  },
  {
    id: 3,
    code: 'IT201',
    name: 'Cấu trúc dữ liệu và Giải thuật',
    englishName: 'Data Structures and Algorithms',
    credits: 4,
    type: 'required',
    majors: ['cntt', 'ktpm'],
    semester: 2,
    prerequisites: ['IT101'],
    status: 'active'
  },
  {
    id: 4,
    code: 'IT301',
    name: 'Trí tuệ nhân tạo',
    englishName: 'Artificial Intelligence',
    credits: 3,
    type: 'elective',
    majors: ['ai'],
    semester: 5,
    prerequisites: ['IT201', 'IT202'],
    status: 'active'
  },
  {
    id: 5,
    code: 'IT401',
    name: 'Thực tập doanh nghiệp',
    englishName: 'Industry Internship',
    credits: 2,
    type: 'required',
    majors: ['cntt', 'ktpm', 'httt'],
    semester: 8,
    prerequisites: ['IT301', 'IT302'],
    status: 'draft'
  }
])

// Computed
const useMock = import.meta.env.VITE_USE_MOCK === 'true'
const allSubjects = computed(() => props.subjects && props.subjects.length ? props.subjects : (useMock ? mockSubjects.value : []))

const filteredSubjects = computed(() => {
  let filtered = [...allSubjects.value]
  
  // Apply filters
  if (props.filters.search) {
    const search = props.filters.search.toLowerCase()
    filtered = filtered.filter(subject =>
      subject.code.toLowerCase().includes(search) ||
      subject.name.toLowerCase().includes(search) ||
      (subject.englishName && subject.englishName.toLowerCase().includes(search))
    )
  }
  
  if (props.filters.type && props.filters.type !== 'all') {
    filtered = filtered.filter(subject => subject.type === props.filters.type)
  }
  
  if (props.filters.major) {
    filtered = filtered.filter(subject => subjectHasMajor(subject, props.filters.major))
  }
  
  if (props.filters.semester) {
    filtered = filtered.filter(subject => subject.semester === parseInt(props.filters.semester))
  }
  
  if (props.filters.credits) {
    if (props.filters.credits === '5+') {
      filtered = filtered.filter(subject => subject.credits >= 5)
    } else {
      filtered = filtered.filter(subject => subject.credits === parseInt(props.filters.credits))
    }
  }
  
  if (props.filters.status) {
    filtered = filtered.filter(subject => subject.status === props.filters.status)
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]
    
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase()
      bVal = bVal.toLowerCase()
    }
    
    if (sortDirection.value === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredSubjects.value.length / itemsPerPage.value))

const paginatedSubjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredSubjects.value.slice(start, end)
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
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...', total)
    } else if (current >= total - 3) {
      pages.push(1, '...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...', total)
    }
  }
  
  return pages
})

const isAllSelected = computed(() => {
  return paginatedSubjects.value.length > 0 && 
         paginatedSubjects.value.every(subject => selectedSubjects.value.includes(subject.id))
})

// Methods
const sort = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const getSortIcon = (field) => {
  if (sortField.value !== field) return 'fas fa-sort'
  return sortDirection.value === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down'
}

const toggleSelect = (subjectId) => {
  const index = selectedSubjects.value.indexOf(subjectId)
  if (index > -1) {
    selectedSubjects.value.splice(index, 1)
  } else {
    selectedSubjects.value.push(subjectId)
  }
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedSubjects.value = selectedSubjects.value.filter(id => 
      !paginatedSubjects.value.some(subject => subject.id === id)
    )
  } else {
    const pageIds = paginatedSubjects.value.map(subject => subject.id)
    selectedSubjects.value = [...new Set([...selectedSubjects.value, ...pageIds])]
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const bulkAction = (action) => {
  console.log(`Bulk action: ${action} on subjects:`, selectedSubjects.value)
}

const getTypeIcon = (type) => {
  const icons = {
    'required': 'fas fa-star',
    'elective': 'fas fa-list-ul',
    'specialization': 'fas fa-graduation-cap'
  }
  return icons[type] || 'fas fa-book'
}

const getTypeLabel = (type) => {
  const labels = {
    'required': 'Bắt buộc',
    'elective': 'Tự chọn',
    'specialization': 'Chuyên ngành'
  }
  return labels[type] || type
}

const { majors: majorsList, fetchMajors } = useMajors()
const { courses, fetchCourses } = useCourses()

const getMajorName = (majorId) => {
  // Use majorsList.value loaded at component mount
  const majorsArr = majorsList && majorsList.value ? majorsList.value : []
  if (majorId === null || majorId === undefined) return ''
  const s = String(majorId)
  // numeric id -> try to find by major_id
  if (/^\d+$/.test(s)) {
    const found = majorsArr.find(m => String(m.major_id || m.id) === s)
    if (found) return found.major_name || found.name || found.major_code || found.code || s
  }
  const lower = s.toLowerCase()
  const foundByCode = majorsArr.find(m => ((m.major_code || m.code) && String(m.major_code || m.code).toLowerCase() === lower) || ((m.major_name || m.name) && String(m.major_name || m.name).toLowerCase() === lower))
  if (foundByCode) return foundByCode.major_name || foundByCode.name || foundByCode.major_code || foundByCode.code
  const localMap = {
    'cntt': 'CNTT',
    'ktpm': 'KTPM',
    'httt': 'HTTT',
    'mmt': 'MMT',
    'ai': 'AI',
    'ds': 'DS'
  }
  return localMap[lower] || majorId
}

const subjectHasMajor = (subject, majorFilter) => {
  if (!majorFilter && majorFilter !== 0) return false
  const key = String(majorFilter)
  // If subject has Majors object array
  if (subject && Array.isArray(subject.Majors) && subject.Majors.length) {
    return subject.Majors.some(m => {
      const keys = [m.major_id || m.id, m.major_code || m.code, m.major_name || m.name]
        .filter(Boolean).map(k => String(k).toLowerCase())
      return keys.includes(key.toLowerCase()) || String(m.major_id || m.id) === key
    })
  }
  // If subject has primitive majors array (codes or ids)
  if (subject && Array.isArray(subject.majors) && subject.majors.length) {
    return subject.majors.some(m => String(m).toLowerCase() === key.toLowerCase() || String(m) === key)
  }
  return false
}

onMounted(async () => {
  try {
    await fetchMajors()
    // Try to preload courses for prerequisites lookup
    try { await fetchCourses({ page: 1, limit: 100 }) } catch(e) { /* ignore */ }
  } catch (e) {
    // Ignore
  }
})

const getCourseName = (subject, courseRef) => {
  if (!courseRef && courseRef !== 0) return ''
  const s = String(courseRef)
  // Prefer object mapping on subject (Prerereqs array of objects)
  if (subject && subject.Prerequisites && Array.isArray(subject.Prerequisites) && subject.Prerequisites.length) {
    // Support both object entries and primitive id entries in subject.Prerequisites
    const f = subject.Prerequisites.find(p => String(p?.id || p?.course_id || p?.sku || p?.code || p) === s)
    if (f) return (f.sku || f.course_SKU || f.code || String(f.id)) + ' - ' + (f.course_name_vn || f.name_vn || f.name || f.nameVn || '')
  }
  // fall back to global courses
  const found = (courses && courses.value ? courses.value : []).map(c => c.raw || c).find(c => String(c.id || c.course_id || c.sku || c.course_SKU || c.code) === s)
  if (found) return (found.sku || found.course_SKU || found.code || String(found.id)) + ' - ' + (found.course_name_vn || found.name_vn || found.name || found.nameVn || '')
  return s
}

const getStatusIcon = (status) => {
  const icons = {
    'active': 'fas fa-check-circle',
    'inactive': 'fas fa-pause-circle',
    'draft': 'fas fa-edit'
  }
  return icons[status] || 'fas fa-question-circle'
}

const getStatusLabel = (status) => {
  const labels = {
    'active': 'Hoạt động',
    'inactive': 'Tạm dừng',
    'draft': 'Bản nháp'
  }
  return labels[status] || status
}

// Watch for filter changes to reset pagination
watch(() => props.filters, () => {
  currentPage.value = 1
  selectedSubjects.value = []
}, { deep: true })
</script>

<style scoped>
.subject-table {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.header-left h3 {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
}

.total-count {
  color: #6b7280;
  font-weight: 500;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-add:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.view-options {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.view-btn {
  padding: 8px 12px;
  background: white;
  border: none;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.view-btn.active {
  background: #3b82f6;
  color: white;
}

.bulk-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: rgba(59, 130, 246, 0.05);
  border-bottom: 1px solid #e5e7eb;
}

.bulk-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #3b82f6;
  font-weight: 600;
}

.bulk-buttons {
  display: flex;
  gap: 8px;
}

.bulk-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bulk-btn.activate {
  background: #dcfce7;
  color: #16a34a;
}

.bulk-btn.deactivate {
  background: #fef3c7;
  color: #d97706;
}

.bulk-btn.export {
  background: #e0e7ff;
  color: #4f46e5;
}

.bulk-btn.delete {
  background: #fee2e2;
  color: #dc2626;
}

.table-container {
  overflow-x: auto;
}

.subjects-table {
  width: 100%;
  border-collapse: collapse;
}

.subjects-table th {
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.subjects-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: all 0.3s ease;
}

.subjects-table th.sortable:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.subjects-table th.sortable i {
  margin-left: 6px;
  opacity: 0.5;
}

.subjects-table td {
  padding: 16px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: top;
}

.subject-row:hover {
  background: rgba(59, 130, 246, 0.02);
}

.subject-row.selected {
  background: rgba(59, 130, 246, 0.05);
}

.checkbox-col {
  width: 50px;
}

.checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.subject-code .code {
  font-family: 'Monaco', 'Consolas', monospace;
  font-weight: 600;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
}

.name-cell h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.4;
}

.name-cell p {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

.credit-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 50%;
  font-weight: 600;
  color: #374151;
}

.type-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.type-badge.required {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.type-badge.elective {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.type-badge.specialization {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}

.major-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.major-tag {
  padding: 2px 8px;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.semester-badge {
  padding: 4px 8px;
  background: #dbeafe;
  color: #1d4ed8;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.prereq-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.prereq-tag {
  padding: 2px 6px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  font-family: 'Monaco', 'Consolas', monospace;
}

.no-prereq {
  color: #9ca3af;
  font-style: italic;
  font-size: 12px;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.status-badge.inactive {
  background: rgba(245, 158, 11, 0.1);
  color: #d97706;
}

.status-badge.draft {
  background: rgba(107, 114, 128, 0.1);
  color: #4b5563;
}

.actions-col {
  width: 150px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.view {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.action-btn.edit {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.action-btn.duplicate {
  background: rgba(139, 92, 246, 0.1);
  color: #7c3aed;
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.action-btn:hover {
  transform: scale(1.1);
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.footer-info {
  font-size: 14px;
  color: #6b7280;
}

.pagination {
  display: flex;
  gap: 4px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
}

.page-btn:hover:not(:disabled) {
  border-color: #3b82f6;
  color: #3b82f6;
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

.per-page select {
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: space-between;
  }
  
  .bulk-actions {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .bulk-buttons {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .subject-table {
    margin: 0 -20px;
    border-radius: 0;
  }
  
  .table-header, .bulk-actions, .table-footer {
    padding: 16px 20px;
  }
  
  .subjects-table th,
  .subjects-table td {
    padding: 12px 8px;
  }
  
  .subjects-table th:nth-child(n+6),
  .subjects-table td:nth-child(n+6) {
    display: none;
  }
  
  .table-footer {
    flex-direction: column;
    gap: 16px;
  }
}
</style>