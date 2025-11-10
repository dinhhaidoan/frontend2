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
          <option value="IT">Công nghệ thông tin</option>
          <option value="CS">Khoa học máy tính</option>
          <option value="IS">Hệ thống thông tin</option>
          <option value="DS">Khoa học dữ liệu</option>
          <option value="AI">Trí tuệ nhân tạo</option>
          <option value="SE">Kỹ thuật phần mềm</option>
        </select>
      </div>

      <!-- Khóa học -->
      <div class="filter-group">
        <label><i class="fas fa-calendar-alt"></i> Khóa</label>
        <select v-model="localFilters.course" @change="handleFilterChange">
          <option value="">Tất cả khóa</option>
          <option value="2020">K2020</option>
          <option value="2021">K2021</option>
          <option value="2022">K2022</option>
          <option value="2023">K2023</option>
          <option value="2024">K2024</option>
        </select>
      </div>

      <!-- Lớp hành chính -->
      <div class="filter-group">
        <label><i class="fas fa-users"></i> Lớp hành chính</label>
        <select v-model="localFilters.officialClass" @change="handleFilterChange">
          <option value="">Tất cả lớp</option>
          <option v-for="cls in classList" :key="cls" :value="cls">{{ cls }}</option>
        </select>
      </div>

      <!-- Trạng thái học tập -->
      <div class="filter-group">
        <label><i class="fas fa-info-circle"></i> Trạng thái</label>
        <select v-model="localFilters.status" @change="handleFilterChange">
          <option value="">Tất cả trạng thái</option>
          <option value="studying">Đang học</option>
          <option value="reserved">Bảo lưu</option>
          <option value="suspended">Nghỉ học</option>
          <option value="graduated">Tốt nghiệp</option>
          <option value="expelled">Thôi học</option>
        </select>
      </div>

      <!-- Cố vấn học tập -->
      <div class="filter-group">
        <label><i class="fas fa-user-tie"></i> Cố vấn học tập</label>
        <select v-model="localFilters.advisor" @change="handleFilterChange">
          <option value="">Tất cả cố vấn</option>
          <option v-for="advisor in advisorList" :key="advisor.id" :value="advisor.id">
            {{ advisor.name }}
          </option>
        </select>
      </div>

      <!-- GPA -->
      <div class="filter-group">
        <label><i class="fas fa-chart-line"></i> GPA tối thiểu</label>
        <input
          v-model.number="localFilters.minGPA"
          type="number"
          min="0"
          max="4"
          step="0.1"
          placeholder="0.0 - 4.0"
          @input="handleFilterChange"
        />
      </div>

      <!-- Tín chỉ tích lũy -->
      <div class="filter-group">
        <label><i class="fas fa-award"></i> Tín chỉ tối thiểu</label>
        <input
          v-model.number="localFilters.minCredits"
          type="number"
          min="0"
          placeholder="Số tín chỉ"
          @input="handleFilterChange"
        />
      </div>

      <!-- Bộ lọc nâng cao -->
      <div class="filter-group full-width">
        <button @click="toggleAdvancedFilters" class="btn-advanced">
          <i :class="showAdvanced ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
          Bộ lọc nâng cao
        </button>
      </div>

      <!-- Các bộ lọc nâng cao -->
      <template v-if="showAdvanced">
        <div class="filter-group">
          <label><i class="fas fa-exclamation-triangle"></i> Cảnh báo học tập</label>
          <select v-model="localFilters.warning" @change="handleFilterChange">
            <option value="">Tất cả</option>
            <option value="low_gpa">GPA thấp</option>
            <option value="insufficient_credits">Thiếu tín chỉ</option>
            <option value="overtime">Quá hạn đào tạo</option>
            <option value="retake">Có môn học lại</option>
          </select>
        </div>

        <div class="filter-group">
          <label><i class="fas fa-calendar-check"></i> Học kỳ</label>
          <select v-model="localFilters.semester" @change="handleFilterChange">
            <option value="">Tất cả học kỳ</option>
            <option value="1_2024">HK1 2024-2025</option>
            <option value="2_2024">HK2 2024-2025</option>
            <option value="1_2023">HK1 2023-2024</option>
            <option value="2_2023">HK2 2023-2024</option>
          </select>
        </div>

        <div class="filter-group">
          <label><i class="fas fa-venus-mars"></i> Giới tính</label>
          <select v-model="localFilters.gender" @change="handleFilterChange">
            <option value="">Tất cả</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="other">Khác</option>
          </select>
        </div>

        <div class="filter-group">
          <label><i class="fas fa-map-marker-alt"></i> Nơi sinh</label>
          <input
            v-model="localFilters.birthPlace"
            type="text"
            placeholder="Tỉnh/Thành phố"
            @input="handleFilterChange"
          />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'

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

const classList = ref([
  '22IT1', '22IT2', '22IT3', '22IT4',
  '23IT1', '23IT2', '23IT3',
  '24IT1', '24IT2'
])

const advisorList = ref([
  { id: 1, name: 'TS. Nguyễn Văn A' },
  { id: 2, name: 'ThS. Trần Thị B' },
  { id: 3, name: 'TS. Lê Văn C' },
  { id: 4, name: 'PGS.TS. Phạm Thị D' }
])

const handleFilterChange = () => {
  emit('update:filters', { ...localFilters })
}

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
