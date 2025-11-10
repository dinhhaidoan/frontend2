<template>
  <div class="teacher-filters">
    <div class="filters-header">
      <h3>
        <i class="fas fa-filter"></i>
        Bộ lọc & Tìm kiếm
      </h3>
      <button @click="resetFilters" class="btn-reset">
        <i class="fas fa-refresh"></i>
        Đặt lại
      </button>
    </div>
    
    <div class="filters-grid">
      <!-- Search -->
      <div class="filter-group">
        <label>Tìm kiếm</label>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input 
            type="text" 
            :value="filters.search"
            @input="updateFilter('search', $event.target.value)"
            placeholder="Tìm theo tên, mã GV, email..."
          />
        </div>
      </div>
      
      <!-- Department -->
      <div class="filter-group">
        <label>Khoa/Bộ môn</label>
        <select 
          :value="filters.department"
          @change="updateFilter('department', $event.target.value)"
        >
          <option value="">Tất cả khoa</option>
          <option value="cntt">Công nghệ thông tin</option>
          <option value="dtvt">Điện tử viễn thông</option>
          <option value="kt">Kinh tế</option>
          <option value="nn">Ngoại ngữ</option>
          <option value="co-khi">Cơ khí</option>
        </select>
      </div>
      
      <!-- Status -->
      <div class="filter-group">
        <label>Trạng thái</label>
        <select 
          :value="filters.status"
          @change="updateFilter('status', $event.target.value)"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Đang giảng dạy</option>
          <option value="on-break">Tạm nghỉ</option>
          <option value="resigned">Nghỉ việc</option>
        </select>
      </div>
      
      <!-- Academic Rank -->
      <div class="filter-group">
        <label>Học hàm học vị</label>
        <select 
          :value="filters.academicRank"
          @change="updateFilter('academicRank', $event.target.value)"
        >
          <option value="">Tất cả học vị</option>
          <option value="gs">Giáo sư</option>
          <option value="pgs">Phó giáo sư</option>
          <option value="ts">Tiến sĩ</option>
          <option value="ths">Thạc sĩ</option>
          <option value="ksh">Kỹ sư</option>
          <option value="cn">Cử nhân</option>
        </select>
      </div>
      
      <!-- Subject Count Range -->
      <div class="filter-group">
        <label>Số môn giảng dạy</label>
        <div class="range-inputs">
          <input 
            type="number" 
            :value="filters.subjectCountMin"
            @input="updateFilter('subjectCountMin', $event.target.value)"
            placeholder="Từ"
            min="0"
          />
          <span>-</span>
          <input 
            type="number" 
            :value="filters.subjectCountMax"
            @input="updateFilter('subjectCountMax', $event.target.value)"
            placeholder="Đến"
            min="0"
          />
        </div>
      </div>
      
      <!-- Sort By -->
      <div class="filter-group">
        <label>Sắp xếp theo</label>
        <div class="sort-controls">
          <select 
            :value="filters.sortBy"
            @change="updateFilter('sortBy', $event.target.value)"
          >
            <option value="name">Họ tên</option>
            <option value="code">Mã giảng viên</option>
            <option value="department">Khoa/Bộ môn</option>
            <option value="subjectCount">Số môn dạy</option>
            <option value="classCount">Số lớp phụ trách</option>
            <option value="createdAt">Ngày tham gia</option>
          </select>
          <button 
            @click="toggleSortOrder"
            class="btn-sort-order"
            :class="{ 'desc': filters.sortOrder === 'desc' }"
          >
            <i class="fas fa-sort-amount-down" v-if="filters.sortOrder === 'desc'"></i>
            <i class="fas fa-sort-amount-up" v-else></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TeacherFilters',
  props: {
    filters: {
      type: Object,
      required: true
    }
  },
  emits: ['update:filters', 'reset'],
  methods: {
    updateFilter(key, value) {
      this.$emit('update:filters', { ...this.filters, [key]: value })
    },
    
    toggleSortOrder() {
      const newOrder = this.filters.sortOrder === 'asc' ? 'desc' : 'asc'
      this.updateFilter('sortOrder', newOrder)
    },
    
    resetFilters() {
      this.$emit('reset')
    }
  }
}
</script>

<style scoped>
.teacher-filters {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 24px;
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.filters-header h3 {
  margin: 0;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
}

.filters-header h3 i {
  color: #3b82f6;
  font-size: 20px;
}

.btn-reset {
  background: #f3f4f6;
  color: #6b7280;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  padding: 10px 18px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.btn-reset:hover {
  background: #e5e7eb;
  color: #374151;
  border-color: #9ca3af;
}

.btn-reset i {
  font-size: 14px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

@media (max-width: 1200px) {
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 14px;
  margin-bottom: 2px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 15px;
  pointer-events: none;
  z-index: 1;
}

.search-box input {
  width: 100%;
  padding: 11px 12px 11px 38px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  background: #ffffff;
  transition: all 0.2s;
}

.search-box input::placeholder {
  color: #9ca3af;
}

.search-box input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

select {
  padding: 11px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.range-inputs {
  display: flex;
  align-items: center;
  gap: 12px;
}

.range-inputs input {
  flex: 1;
  padding: 11px 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
  color: #374151;
  transition: all 0.2s;
}

.range-inputs input::placeholder {
  color: #9ca3af;
}

.range-inputs input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.range-inputs span {
  color: #6b7280;
  font-weight: 600;
  font-size: 16px;
}

.sort-controls {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.sort-controls select {
  flex: 1;
  min-width: 0;
}

.btn-sort-order {
  padding: 0;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  min-width: 44px;
  flex-shrink: 0;
}

.btn-sort-order:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-sort-order.desc {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.btn-sort-order.desc:hover {
  background: #2563eb;
  border-color: #2563eb;
}

.btn-sort-order i {
  font-size: 16px;
}
</style>