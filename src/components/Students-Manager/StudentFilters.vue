<template>
  <div class="student-filters">
    <div class="filters-header">
      <h3><i class="fas fa-filter"></i> Bộ lọc sinh viên</h3>
      <button @click="resetFilters" class="btn-reset">
        <i class="fas fa-redo"></i> Đặt lại
      </button>
    </div>

    <div class="filters-grid">
      <!-- Tìm kiếm nhanh -->
      <div class="filter-group full-width">
        <label><i class="fas fa-search"></i> Tìm kiếm</label>
        <input
          v-model="localFilters.search"
          type="text"
          placeholder="Mã SV, Họ tên, Email..."
          @input="handleFilterChange"
        />
      </div>

      <!-- Ngành học -->
      <div class="filter-group">
        <label><i class="fas fa-graduation-cap"></i> Ngành học</label>
        <select v-model="localFilters.major" @change="handleFilterChange">
          <option value="">Tất cả ngành</option>
          <option v-for="m in majorsList" :key="m.id" :value="m.id">{{ m.name }}</option>
        </select>
      </div>

      <!-- Khóa học -->
      <div class="filter-group">
        <label><i class="fas fa-calendar-alt"></i> Khóa</label>
        <select v-model="localFilters.course" @change="handleFilterChange">
          <option value="">Tất cả khóa</option>
          <option v-for="y in yearsList" :key="y.id" :value="y.id">{{ y.code || y.name }}</option>
        </select>
      </div>

      <!-- Lớp hành chính -->
      <div class="filter-group">
        <label><i class="fas fa-users"></i> Lớp hành chính</label>
        <select v-model="localFilters.officialClass" @change="handleFilterChange">
          <option value="">Tất cả lớp</option>
          <option v-for="cls in classesList" :key="cls.id" :value="cls.id">{{ cls.code || cls.name }}</option>
        </select>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useMajors } from '@/hooks/useMajors'
import { useAcademicYears } from '@/hooks/useAcademicYears'
import { useOfficeClasses } from '@/hooks/useOfficeClasses'
import { useTeachers } from '@/hooks/useTeachers'

const emit = defineEmits(['update:filters'])

const showAdvanced = ref(false)

const localFilters = reactive({
  search: '',
  major: '',
  course: '',
  officialClass: '',
  status: '',
  advisor: '',
  minGPA: null,
  minCredits: null,
  warning: '',
  semester: '',
  gender: '',
  birthPlace: ''
})

// Use API hooks for dynamic lists
const { majors, fetchMajors } = useMajors()
const { academicYears, fetchAcademicYears } = useAcademicYears()
const { officeClasses, fetchOfficeClasses } = useOfficeClasses()
const { teachers, fetchTeachers } = useTeachers()

// Compute list shapes for templates
const majorsList = computed(() => (majors.value || []).map(m => ({ id: m.major_id || m.id, name: m.major_name || m.name })))
const yearsList = computed(() => (academicYears.value || []).map(y => ({ id: y.academic_year_id || y.id, name: y.academic_year_name || y.name, code: y.code || '' })))
const classesList = computed(() => (officeClasses.value || []).map(c => ({ id: c.id || c.office_class_id, code: c.code || c.name, name: c.name || c.code })))
const teachersList = computed(() => (teachers.value || []).map(t => ({ id: t.id || t.teacherId, name: t.name || t.teacher_name })))

const handleFilterChange = () => {
  emit('update:filters', { ...localFilters })
}

onMounted(async () => {
  try {
    // Attempt to fetch a large set so filters are comprehensive
    await Promise.all([
      fetchMajors({ page: 1, limit: 200 }),
      fetchAcademicYears({ page: 1, limit: 200 }),
      fetchOfficeClasses({ page: 1, limit: 500 }),
      fetchTeachers({ page: 1, limit: 500 })
    ])
  } catch (e) {
    console.warn('[StudentFilters] lookup fetch failed', e)
  }
})

const resetFilters = () => {
  Object.keys(localFilters).forEach(key => {
    if (typeof localFilters[key] === 'number') {
      localFilters[key] = null
    } else {
      localFilters[key] = ''
    }
  })
  handleFilterChange()
}

const toggleAdvancedFilters = () => {
  showAdvanced.value = !showAdvanced.value
}
</script>

<style scoped>
.student-filters {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.filters-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.2rem;
}

.filters-header h3 i {
  color: #3498db;
  margin-right: 8px;
}

.btn-reset {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
}

.btn-reset:hover {
  background: #c0392b;
  transform: translateY(-2px);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group.full-width {
  grid-column: 1 / -1;
}

.filter-group label {
  font-weight: 600;
  color: #34495e;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.filter-group label i {
  margin-right: 5px;
  color: #3498db;
}

.filter-group input,
.filter-group select {
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s;
}

.filter-group input:focus,
.filter-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.btn-advanced {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-advanced:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
